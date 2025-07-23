const fetch = require('node-fetch')
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
	const GROUP_SLUG = 'useless-machines'
	const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN

	if (!ACCESS_TOKEN) {
		console.error('❌ Missing ARENA_ACCESS_TOKEN')
		return res.status(500).json({ error: 'Missing access token' })
	}

	try {
		const groupRes = await fetch(
			`https://api.are.na/v2/groups/${GROUP_SLUG}/channels`,
			{
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
				},
			}
		)

		const groupData = await groupRes.json()
		const channels = groupData.channels

		const channelBlocks = await Promise.all(
			channels
				.filter((channel) => channel.title !== 'To be categorized') // remove unwanted channel here
				.map(async (channel) => {
					const chanRes = await fetch(
						`https://api.are.na/v2/channels/${channel.slug}?per=100`,
						{
							headers: {
								Authorization: `Bearer ${ACCESS_TOKEN}`,
							},
						}
					)
					const chanData = await chanRes.json()

					const isReadingChannel = channel.title.toLowerCase() === 'reading'

					return {
						title: channel.title,
						slug: channel.slug,
						description: channel.metadata?.description || null,
						blocks: chanData.contents.map((block) => {
							const isReadingBlock = isReadingChannel
							const isMachineBlock =
								!isReadingChannel &&
								block.class !== 'Text' &&
								block.class !== 'Attachment'

							return {
								id: block.id,
								class: block.class,
								title: block.title,
								image: block.image,
								url: block.source?.url || block.image?.display?.url || null,
								metadata: block.metadata || null,
								description: sanitizeHTML(block.description_html),
								isReading: isReadingBlock,
								isMachine: isMachineBlock,
								channelTitle: channel.title,
								channelDescription: channel.metadata?.description || null,
							}
						}),
					}
				})
		)

		res.status(200).json({ group: GROUP_SLUG, channels: channelBlocks, categoriesPerBlock })
	} catch (err) {
		console.error('❌ Fetch error:', err)
		res.status(500).json({ error: 'Fetch failed', details: err.message })
	}
}

/**
 * Sanitize HTML before serving
 * 
 * @param {string} rawHTMLStr - description from Are.na
 * @returns string
 */
function sanitizeHTML(rawHTMLStr) {
	if (!rawHTMLStr) {
		return null;
	}
	const window = new JSDOM('').window;
	const DOMPurify = createDOMPurify(window);

	return DOMPurify.sanitize(rawHTMLStr);
}
