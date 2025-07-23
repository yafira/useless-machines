// handles data fetching, sorting, and rendering blocks

// data containers
let machineBlocks = []
let readingBlocks = []
let currentView = 'machines'

// fetch arena data and populate UI
fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		// separate into machine and reading blocks
		data.channels.forEach((channel) => {
			if (!channel.blocks || channel.blocks.length === 0) return

			channel.blocks.forEach((block) => {
				if (block.isReading) {
					readingBlocks.push(block)
				}
				if (block.isMachine && !block.isReading) {
					machineBlocks.push(block)
				}
			})
		})

		// deduplicate
		machineBlocks = machineBlocks.filter(
			(b, i, self) => i === self.findIndex((x) => x.id === b.id)
		)
		readingBlocks = readingBlocks.filter(
			(b, i, self) => i === self.findIndex((x) => x.id === b.id)
		)

		populateChannelOptions()
		renderBlocks(machineBlocks, 'year')
		sortSelect.value = 'year'
		spinner.style.display = 'none'
		container.style.display = 'flex'
	})

// helper to sort blocks
function sortBlocks(blocks, method) {
	if (method === 'year') {
		return [...blocks].sort((a, b) => {
			const getYear = (block) => {
				if (!block.title) return 0
				const parts = block.title.split('|').map((s) => s.trim())
				return parseInt(parts[2]) || 0
			}
			return getYear(a) - getYear(b)
		})
	} else if (method === 'channel') {
		return [...blocks].sort((a, b) =>
			a.channelTitle.localeCompare(b.channelTitle)
		)
	} else if (method === 'random') {
		const shuffled = [...blocks]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}
	return blocks
}

// populate dropdown for channel filter
function populateChannelOptions() {
	if (!channelSelect) return
	const uniqueChannels = [...new Set(machineBlocks.map((b) => b.channelTitle))]
		.filter((c) => c !== 'Readings')
		.sort()
	channelSelect.innerHTML = '<option value="all">All Types</option>'
	uniqueChannels.forEach((channel) => {
		const opt = document.createElement('option')
		opt.value = channel
		opt.textContent = channel
		channelSelect.appendChild(opt)
	})
}
