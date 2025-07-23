// handles data fetching, sorting, and rendering blocks

// references to DOM elements
const spinner = document.getElementById('loading-spinner')
const container = document.getElementById('arena-content')
const sortSelect = document.getElementById('sort-select')
const channelSelect = document.getElementById('channel-select')
const tabMachines = document.getElementById('tab-machines')
const tabReadings = document.getElementById('tab-readings')
container.classList.add('index') // default layout

let machineBlocks = []
let readingBlocks = []
let currentView = 'machines'

// fetch arena data and split into machine and reading blocks
fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
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
			(block, index, self) => index === self.findIndex((b) => b.id === block.id)
		)
		readingBlocks = readingBlocks.filter(
			(block, index, self) => index === self.findIndex((b) => b.id === block.id)
		)

		populateChannelOptions()
		renderBlocks(machineBlocks, 'year')
		sortSelect.value = 'year'
		spinner.style.display = 'none'
		container.style.display = 'flex'
	})

// populate dropdown of unique machine channels
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

// sort methods: by year, channel, or random
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
