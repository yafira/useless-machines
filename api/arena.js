const fetch = require('node-fetch')

module.exports = async (req, res) => {
	const GROUP_SLUG = 'useless-machines'
	const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN

	if (!ACCESS_TOKEN) {
		console.error('❌ Missing ARENA_ACCESS_TOKEN')
		return res.status(500).json({ error: 'Missing access token' })
	}

	try {
		// Step 1: Get all channels in the group
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

		// Step 2: Fetch blocks from each channel
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
				return {
					title: channel.title,
					slug: channel.slug,
					blocks: chanData.contents,
				}
			})
		)

		// Step 3: Return grouped data
		res.status(200).json({ group: GROUP_SLUG, channels: channelBlocks })
	} catch (err) {
		console.error('❌ Fetch error:', err)
		res.status(500).json({ error: 'Fetch failed', details: err.message })
	}
}
