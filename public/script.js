const spinner = document.getElementById('loading-spinner')
const container = document.getElementById('arena-content')
const sortSelect = document.getElementById('sort-select')
const channelSelect = document.getElementById('channel-select')
const tabMachines = document.getElementById('tab-machines')
const tabReadings = document.getElementById('tab-readings')
container.classList.add('index')

let machineBlocks = []
let readingBlocks = []
let currentView = 'machines'

// fetch arena data and split blocks by isMachine or isReading
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

		// deduplicate by id
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

// populate machine-only dropdown for type of machine
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

// sorting methods for year, channel, random
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

// render blocks to page
function renderBlocks(blocks, sortMethod, channelFilter = 'all') {
	container.innerHTML = ''
	let sortedBlocks = sortBlocks(blocks, sortMethod)

	if (sortMethod === 'channel' && channelFilter !== 'all') {
		sortedBlocks = sortedBlocks.filter(
			(block) => block.channelTitle === channelFilter
		)
	}

	// build dom for each block
	sortedBlocks.forEach((block) => {
		const blockWrapper = document.createElement('div')
		blockWrapper.classList.add('index-block')

		const row = document.createElement('div')
		row.classList.add('index-row')

		const yearColumn = document.createElement('div')
		yearColumn.classList.add('index-year')

		const left = document.createElement('div')
		left.classList.add('index-left')

		const right = document.createElement('div')
		right.classList.add('index-right')

		const titleGroup = document.createElement('div')
		titleGroup.classList.add('index-title-group')

		let rawTitle = block.title || 'untitled'
		let [piece = '', artist = '', year = ''] = rawTitle
			.split('|')
			.map((s) => s.trim())

		// add thumbnail preview if available
		if (block.image?.thumb?.url && currentView === 'machines') {
			const thumb = document.createElement('img')
			thumb.src = block.image.thumb.url
			thumb.alt = block.title || 'thumbnail'
			thumb.classList.add('index-thumbnail')
			left.appendChild(thumb)
		}

		const pieceTitle = document.createElement('div')
		pieceTitle.classList.add('index-title')
		pieceTitle.textContent = piece

		const artistLine = document.createElement('div')
		artistLine.classList.add('index-meta')
		artistLine.textContent = artist

		titleGroup.append(pieceTitle, artistLine)

		const arrow = document.createElement('span')
		arrow.classList.add('index-arrow')
		arrow.textContent = '›'

		left.append(titleGroup, arrow)

		if (year) {
			yearColumn.textContent = year
		}

		const channelLabel = document.createElement('div')
		channelLabel.classList.add('index-channel')
		channelLabel.textContent = block.channelTitle?.toUpperCase() || 'MISC'

		const channelDesc = document.createElement('div')
		channelDesc.classList.add('channel-description')
		channelDesc.textContent = block.channelDescription || ''

		right.append(channelLabel, channelDesc)

		row.append(yearColumn, left, right)

		const content = document.createElement('div')
		content.classList.add('block-content')
		content.style.display = 'none'

		if (block.description) {
			const desc = document.createElement('p')
			desc.classList.add('block-description')
			desc.textContent = block.description
			content.appendChild(desc)
		}

		if (
			block.class === 'Image' &&
			block.image?.display?.url &&
			currentView === 'machines'
		) {
			const imageWrapper = document.createElement('div')
			imageWrapper.classList.add('image-container')

			const img = document.createElement('img')
			img.src = block.image.display.url
			img.alt = block.title || 'image'
			img.loading = 'lazy'

			imageWrapper.appendChild(img)
			content.appendChild(imageWrapper)
		} else if (block.class === 'Text') {
			const p = document.createElement('p')
			p.textContent = block.content
			content.appendChild(p)
		} else if (block.class === 'Link' && currentView === 'machines') {
			const a = document.createElement('a')
			a.href = block.url || '#'
			a.target = '_blank'
			a.rel = 'noopener noreferrer'
			a.textContent = block.title || block.url || 'view link'
			content.appendChild(a)
		} else if (block.class === 'Attachment' && block.attachment?.url) {
			const a = document.createElement('a')
			a.href = block.attachment.url
			a.target = '_blank'
			a.rel = 'noopener noreferrer'
			a.textContent = block.title || block.attachment.file_name || 'download'
			content.appendChild(a)
		}

		// toggle expand/collapse
		row.addEventListener('click', (e) => {
			if (e.target.tagName.toLowerCase() === 'a') return
			const isVisible = content.style.display === 'block'
			content.style.display = isVisible ? 'none' : 'block'
			arrow.textContent = isVisible ? '›' : '⌄'
		})

		blockWrapper.append(row, content)
		container.appendChild(blockWrapper)
	})
}

// sort dropdown change
sortSelect.addEventListener('change', (e) => {
	const value = e.target.value
	if (value === 'channel') {
		channelSelect.style.display = 'inline-block'
		renderBlocks(machineBlocks, 'channel')
	} else {
		channelSelect.style.display = 'none'
		renderBlocks(machineBlocks, value)
	}
})

// channel dropdown change
channelSelect.addEventListener('change', (e) => {
	renderBlocks(machineBlocks, 'channel', e.target.value)
})

// machines tab click
tabMachines.addEventListener('click', () => {
	currentView = 'machines'
	tabMachines.classList.add('active')
	tabReadings.classList.remove('active')
	sortSelect.disabled = false
	channelSelect.style.display = 'none'
	renderBlocks(machineBlocks, 'year')
})

// readings tab click
tabReadings.addEventListener('click', () => {
	currentView = 'readings'
	tabReadings.classList.add('active')
	tabMachines.classList.remove('active')
	sortSelect.disabled = true
	channelSelect.style.display = 'none'
	renderBlocks(readingBlocks, 'random')
})
