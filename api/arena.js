const fetch = require('node-fetch')

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
			channels.map(async (channel) => {
				const chanRes = await fetch(
					`https://api.are.na/v2/channels/${channel.slug}?per=100`,
					{
						headers: {
							Authorization: `Bearer ${ACCESS_TOKEN}`,
						},
					}
				)
				const chanData = await chanRes.json()

				// correctly detect the 'reading' channel
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
							description: block.metadata?.description || null,
							isReading: isReadingBlock,
							isMachine: isMachineBlock,
							channelTitle: channel.title,
							channelDescription: channel.metadata?.description || null,
						}
					}),
				}
			})
		)

		res.status(200).json({ group: GROUP_SLUG, channels: channelBlocks })
	} catch (err) {
		console.error('❌ Fetch error:', err)
		res.status(500).json({ error: 'Fetch failed', details: err.message })
	}
}
