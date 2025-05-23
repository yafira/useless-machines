const fetch = require('node-fetch')

module.exports = async (req, res) => {
	const CHANNEL_SLUG = 'useless-machines-ht1bgqaxc74'
	const ACCESS_TOKEN = process.env.ARENA_ACCESS_TOKEN

	console.log('🔑 ACCESS_TOKEN present:', !!ACCESS_TOKEN)

	if (!ACCESS_TOKEN) {
		return res.status(500).json({ error: 'Missing access token' })
	}

	try {
		const url = `https://api.are.na/v2/channels/${CHANNEL_SLUG}`
		console.log('📡 Fetching:', url)

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${ACCESS_TOKEN}`,
			},
		})

		console.log('✅ Response status:', response.status)

		const data = await response.json()
		console.log('📦 Response JSON:', JSON.stringify(data, null, 2))

		res.status(response.status).json(data)
	} catch (err) {
		console.error('❌ Error fetching Are.na:', err)
		res.status(500).json({ error: 'Failed to fetch Are.na content' })
	}
}
