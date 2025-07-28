const fetch = require('node-fetch')
const createDOMPurify = require('isomorphic-dompurify')
const { JSDOM } = require('jsdom')

// html sanitizer
function sanitizeHTML(rawHTMLStr) {
	if (!rawHTMLStr) return null
	const window = new JSDOM('').window
	const DOMPurify = createDOMPurify(window)
	return DOMPurify.sanitize(rawHTMLStr)
}

// fetch all group channels with pagination
async function fetchAllGroupChannels(groupSlug, token) {
	let page = 1
	let allChannels = []
	let keepFetching = true

	while (keepFetching) {
		const res = await fetch(
			`https://api.are.na/v2/groups/${groupSlug}/channels?page=${page}&per=100`,
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		const data = await res.json()
		if (!data.channels || data.channels.length === 0) {
			keepFetching = false
		} else {
			allChannels = allChannels.concat(data.channels)
			page++
		}
	}

	return allChannels
}

module.exports = async (req, res) => {
	const GROUP_SLUG = 'useless-machines'
	const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN

	if (!ACCESS_TOKEN) {
		console.error('❌ Missing ARENA_ACCESS_TOKEN')
		return res.status(500).json({ error: 'Missing access token' })
	}

	try {
		const channels = await fetchAllGroupChannels(GROUP_SLUG, ACCESS_TOKEN)

		// define categoriesPerBlock
		const categoriesPerBlock = {}

		const channelBlocks = await Promise.all(
			channels
				.filter((channel) => channel.title !== 'To be categorized')
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

					const blocks = chanData.contents.map((block) => {
						const isReadingBlock = isReadingChannel
						const isMachineBlock =
							!isReadingChannel &&
							block.class !== 'Text' &&
							block.class !== 'Attachment'

						// populate categoriesPerBlock map
						if (block.id) {
							if (!categoriesPerBlock[block.id]) {
								categoriesPerBlock[block.id] = []
							}
							categoriesPerBlock[block.id].push(channel.title)
						}

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
					})

					return {
						title: channel.title,
						slug: channel.slug,
						description: channel.metadata?.description || null,
						blocks,
					}
				})
		)

		res
			.status(200)
			.json({ group: GROUP_SLUG, channels: channelBlocks, categoriesPerBlock })
	} catch (err) {
		console.error('❌ Fetch error:', err)
		res.status(500).json({ error: 'Fetch failed', details: err.message })
	}
}
