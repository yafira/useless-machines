const fetch = require("node-fetch");
const createDOMPurify = require("isomorphic-dompurify");
const { JSDOM } = require("jsdom");

// html sanitizer
function sanitizeHTML(rawHTMLStr) {
  if (!rawHTMLStr) return null;
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(rawHTMLStr);
}

// fetch all group channels with pagination
async function fetchAllGroupChannels(groupSlug, token) {
  let page = 1;
  let allChannels = [];
  let keepFetching = true;

  while (keepFetching) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(
      `https://api.are.na/v3/groups/${groupSlug}/contents?type=Channel&page=${page}&per=100`,
      { headers },
    );
    const data = await res.json();
    const items = data.data || [];

    if (items.length === 0 || !data.meta?.has_more_pages) {
      allChannels = allChannels.concat(items);
      keepFetching = false;
    } else {
      allChannels = allChannels.concat(items);
      page++;
    }
  }

  return allChannels;
}

// fetch all blocks from a channel with pagination
async function fetchAllChannelContents(channelSlug, token) {
  let page = 1;
  let allContents = [];
  let keepFetching = true;

  while (keepFetching) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(
      `https://api.are.na/v3/channels/${channelSlug}/contents?page=${page}&per=100`,
      { headers },
    );
    const data = await res.json();
    const items = data.data || [];

    allContents = allContents.concat(items);

    if (!data.meta?.has_more_pages) {
      keepFetching = false;
    } else {
      page++;
    }
  }

  return allContents;
}

module.exports = async (req, res) => {
  const GROUP_SLUG = "useless-machines";
  const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN || null;

  try {
    const channels = await fetchAllGroupChannels(GROUP_SLUG, ACCESS_TOKEN);
    console.log(`✅ Total channels fetched: ${channels.length}`);

    const categoriesPerBlock = {};

    const channelBlocks = await Promise.all(
      channels
        .filter((channel) => channel.title !== "To be categorized")
        .map(async (channel) => {
          const contents = await fetchAllChannelContents(
            channel.slug,
            ACCESS_TOKEN,
          );
          const isReadingChannel = channel.title.toLowerCase() === "reading";

          const blocks = contents
            .filter((item) => item.type !== "Channel")
            .map((block) => {
              const isReadingBlock = isReadingChannel;
              const isMachineBlock =
                !isReadingChannel &&
                block.type !== "Text" &&
                block.type !== "Attachment";

              if (block.id) {
                if (!categoriesPerBlock[block.id]) {
                  categoriesPerBlock[block.id] = [];
                }
                categoriesPerBlock[block.id].push(channel.title);
              }

              // v3 image: block.image.small.src / block.image.large.src
              const imageObj = block.image
                ? {
                    thumb: { url: block.image.small?.src || null },
                    display: { url: block.image.large?.src || null },
                  }
                : null;

              // v3 description is an object { html, markdown, plain }
              const descriptionHTML = block.description?.html || null;

              // v3 source url
              const url = block.source?.url || block.image?.src || null;

              // v3 text content is an object { plain, html, markdown }
              const textContent = block.content?.plain || null;

              // v3 attachment
              const attachment = block.attachment
                ? {
                    url: block.attachment.url,
                    file_name: block.attachment.filename,
                  }
                : null;

              // v3 channel description is also an object
              const channelDescription =
                typeof channel.description === "object"
                  ? channel.description?.plain || null
                  : channel.description || null;

              return {
                id: block.id,
                class: block.type, // v3 uses "type" not "class"
                title: block.title,
                image: imageObj,
                url,
                content: textContent,
                attachment,
                metadata: null,
                description: sanitizeHTML(descriptionHTML),
                isReading: isReadingBlock,
                isMachine: isMachineBlock,
                channelTitle: channel.title,
                channelDescription,
              };
            });

          const channelDescription =
            typeof channel.description === "object"
              ? channel.description?.plain || null
              : channel.description || null;

          return {
            title: channel.title,
            slug: channel.slug,
            description: channelDescription,
            blocks,
          };
        }),
    );

    res
      .status(200)
      .json({ group: GROUP_SLUG, channels: channelBlocks, categoriesPerBlock });
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
};
