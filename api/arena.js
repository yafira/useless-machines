const fetch = require('node-fetch')

module.exports = async (req, res) => {
	const CHANNEL_SLUG = 'useless-machines-ht1bgqaxc74'
	// const CHANNEL_SLUG = 3747367
	const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN

	if (!ACCESS_TOKEN) {
		console.error('❌ Missing ARENA_ACCESS_TOKEN')
		return res.status(500).json({ error: 'Missing access token' })
	}

	try {
		const response = await fetch(
			`https://api.are.na/v2/channels/${CHANNEL_SLUG}`,
			{
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
				},
			}
		)

		console.log('📡 Response status:', response.status)
		const data = await response.json()
		res.status(response.status).json(data)
	} catch (err) {
		console.error('❌ Fetch error:', err)
		res.status(500).json({ error: 'Fetch failed', details: err.message })
	}
}
