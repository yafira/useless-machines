// const spinner = document.getElementById('loading-spinner')
// const container = document.getElementById('arena-content')
// const sortSelect = document.getElementById('sort-select')
// const channelSelect = document.getElementById('channel-select')
// const tabMachines = document.getElementById('tab-machines')
// const tabReadings = document.getElementById('tab-readings')
// container.classList.add('index')

// // storage for blocks
// let machineBlocks = []
// let readingBlocks = []
// let currentView = 'machines'

// // fetch arena data and split blocks by isMachine or isReading
// fetch('/api/arena')
// 	.then((res) => {
// 		if (!res.ok) throw new Error(`failed to fetch: ${res.status}`)
// 		return res.json()
// 	})
// 	.then((data) => {
// 		// separate readings and machines
// 		data.channels.forEach((channel) => {
// 			if (!channel.blocks || channel.blocks.length === 0) return

// 			channel.blocks.forEach((block) => {
// 				if (block.isReading) {
// 					readingBlocks.push(block)
// 				}
// 				if (block.isMachine && !block.isReading) {
// 					machineBlocks.push(block)
// 				}
// 			})
// 		})

// 		// remove duplicates
// 		machineBlocks = machineBlocks.filter(
// 			(block, index, self) => index === self.findIndex((b) => b.id === block.id)
// 		)
// 		readingBlocks = readingBlocks.filter(
// 			(block, index, self) => index === self.findIndex((b) => b.id === block.id)
// 		)

// 		// render UI
// 		populateChannelOptions()
// 		renderBlocks(machineBlocks, 'year')
// 		sortSelect.value = 'year'
// 		spinner.style.display = 'none'
// 		container.style.display = 'flex'
// 	})

// // populate channel filter for machines
// function populateChannelOptions() {
// 	if (!channelSelect) return
// 	const uniqueChannels = [...new Set(machineBlocks.map((b) => b.channelTitle))]
// 		.filter((c) => c !== 'Readings')
// 		.sort()
// 	channelSelect.innerHTML = '<option value="all">All Types</option>'
// 	uniqueChannels.forEach((channel) => {
// 		const opt = document.createElement('option')
// 		opt.value = channel
// 		opt.textContent = channel
// 		channelSelect.appendChild(opt)
// 	})
// }

// // sorting logic
// function sortBlocks(blocks, method) {
// 	if (method === 'year') {
// 		return [...blocks].sort((a, b) => {
// 			const getYear = (block) => {
// 				if (!block.title) return 0
// 				const parts = block.title.split('|').map((s) => s.trim())
// 				return parseInt(parts[2]) || 0
// 			}
// 			return getYear(a) - getYear(b)
// 		})
// 	} else if (method === 'channel') {
// 		return [...blocks].sort((a, b) =>
// 			a.channelTitle.localeCompare(b.channelTitle)
// 		)
// 	} else if (method === 'random') {
// 		const shuffled = [...blocks]
// 		for (let i = shuffled.length - 1; i > 0; i--) {
// 			const j = Math.floor(Math.random() * (i + 1))
// 			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
// 		}
// 		return shuffled
// 	}
// 	return blocks
// }

// // render blocks into container
// function renderBlocks(blocks, sortMethod, channelFilter = 'all') {
// 	container.innerHTML = ''
// 	let sortedBlocks = sortBlocks(blocks, sortMethod)

// 	// apply filter by channel if needed
// 	if (sortMethod === 'channel' && channelFilter !== 'all') {
// 		sortedBlocks = sortedBlocks.filter(
// 			(block) => block.channelTitle === channelFilter
// 		)
// 	}

// 	sortedBlocks.forEach((block, idx) => {
// 		const blockWrapper = document.createElement('div')
// 		blockWrapper.classList.add('index-block')

// 		const row = document.createElement('div')
// 		row.classList.add('index-row')

// 		// index number for machines only
// 		if (currentView === 'machines') {
// 			const indexNumber = document.createElement('div')
// 			indexNumber.classList.add('index-number')
// 			indexNumber.textContent = String(idx + 1).padStart(2, '0')
// 			row.prepend(indexNumber)
// 		}

// 		// prepare columns
// 		const yearColumn = document.createElement('div')
// 		yearColumn.classList.add('index-year')

// 		const left = document.createElement('div')
// 		left.classList.add('index-left')

// 		const right = document.createElement('div')
// 		right.classList.add('index-right')

// 		const titleGroup = document.createElement('div')
// 		titleGroup.classList.add('index-title-group')

// 		// extract metadata from title
// 		let rawTitle = block.title || 'untitled'
// 		let [piece = '', artist = '', year = ''] = rawTitle
// 			.split('|')
// 			.map((s) => s.trim())

// 		// add preview thumbnail (machines only)
// 		if (block.image?.thumb?.url && currentView === 'machines') {
// 			const thumb = document.createElement('img')
// 			thumb.src = block.image.thumb.url
// 			thumb.alt = block.title || 'thumbnail'
// 			thumb.classList.add('index-thumbnail')
// 			left.appendChild(thumb)
// 		}

// 		// piece title (as link for readings or links)
// 		const pieceTitle = document.createElement('div')
// 		pieceTitle.classList.add('index-title')

// 		if (block.class === 'Link' && block.url) {
// 			const a = document.createElement('a')
// 			a.href = block.url
// 			a.textContent = piece || block.url
// 			a.target = '_blank'
// 			a.rel = 'noopener noreferrer'
// 			pieceTitle.appendChild(a)
// 		} else {
// 			pieceTitle.textContent = piece
// 		}

// 		titleGroup.appendChild(pieceTitle)

// 		// artist line only for machines
// 		if (currentView !== 'readings') {
// 			const artistLine = document.createElement('div')
// 			artistLine.classList.add('index-meta')
// 			artistLine.textContent = artist
// 			titleGroup.appendChild(artistLine)
// 		}

// 		// add disclosure arrow for machines
// 		if (currentView === 'machines') {
// 			const arrow = document.createElement('span')
// 			arrow.classList.add('index-arrow')
// 			arrow.textContent = '›'
// 			left.append(titleGroup, arrow)
// 		} else {
// 			left.append(titleGroup)
// 		}

// 		// year display (machines only)
// 		if (year && currentView === 'machines') {
// 			yearColumn.textContent = year
// 		}

// 		// add channel metadata (machines only)
// 		if (currentView === 'machines') {
// 			const channelLabel = document.createElement('div')
// 			channelLabel.classList.add('index-channel')
// 			channelLabel.textContent = block.channelTitle?.toUpperCase() || 'MISC'

// 			const channelDesc = document.createElement('div')
// 			channelDesc.classList.add('channel-description')
// 			channelDesc.textContent = block.channelDescription || ''

// 			right.append(channelLabel, channelDesc)
// 		}

// 		row.append(yearColumn, left, right)

// 		// content section
// 		const content = document.createElement('div')
// 		content.classList.add('block-content')
// 		content.style.display = currentView === 'readings' ? 'block' : 'none'

// 		// description
// 		if (block.description) {
// 			const desc = document.createElement('p')
// 			desc.classList.add('block-description')
// 			desc.textContent = block.description
// 			content.appendChild(desc)
// 		}

// 		// additional content
// 		if (
// 			block.class === 'Image' &&
// 			block.image?.display?.url &&
// 			currentView === 'machines'
// 		) {
// 			const imageWrapper = document.createElement('div')
// 			imageWrapper.classList.add('image-container')

// 			const img = document.createElement('img')
// 			img.src = block.image.display.url
// 			img.alt = block.title || 'image'
// 			img.loading = 'lazy'

// 			imageWrapper.appendChild(img)
// 			content.appendChild(imageWrapper)
// 		} else if (block.class === 'Text') {
// 			const p = document.createElement('p')
// 			p.textContent = block.content
// 			content.appendChild(p)
// 		} else if (block.class === 'Link' && currentView !== 'readings') {
// 			const a = document.createElement('a')
// 			a.href = block.url || '#'
// 			a.target = '_blank'
// 			a.rel = 'noopener noreferrer'
// 			a.textContent = block.title || block.url || 'view link'
// 			content.appendChild(a)
// 		} else if (block.class === 'Attachment' && block.attachment?.url) {
// 			const a = document.createElement('a')
// 			a.href = block.attachment.url
// 			a.target = '_blank'
// 			a.rel = 'noopener noreferrer'
// 			a.textContent = block.title || block.attachment.file_name || 'download'
// 			content.appendChild(a)
// 		}

// 		// expandable content toggle (machines only)
// 		if (currentView === 'machines') {
// 			row.addEventListener('click', (e) => {
// 				if (e.target.tagName.toLowerCase() === 'a') return
// 				const isVisible = content.style.display === 'block'
// 				content.style.display = isVisible ? 'none' : 'block'
// 				const arrow = row.querySelector('.index-arrow')
// 				if (arrow) arrow.textContent = isVisible ? '›' : '⌄'
// 			})
// 		}

// 		blockWrapper.append(row, content)
// 		container.appendChild(blockWrapper)
// 	})
// }

// // sort dropdown change
// sortSelect.addEventListener('change', (e) => {
// 	const value = e.target.value
// 	if (value === 'channel') {
// 		channelSelect.style.display = 'inline-block'
// 		renderBlocks(machineBlocks, 'channel')
// 	} else {
// 		channelSelect.style.display = 'none'
// 		renderBlocks(machineBlocks, value)
// 	}
// })

// // channel filter dropdown change
// channelSelect.addEventListener('change', (e) => {
// 	renderBlocks(machineBlocks, 'channel', e.target.value)
// })

// // switch to machines tab
// tabMachines.addEventListener('click', () => {
// 	currentView = 'machines'
// 	tabMachines.classList.add('active')
// 	tabReadings.classList.remove('active')
// 	sortSelect.disabled = false
// 	channelSelect.style.display = 'none'
// 	container.classList.remove('readings-view')
// 	container.classList.add('index')
// 	renderBlocks(machineBlocks, 'year')
// })

// // switch to readings tab
// tabReadings.addEventListener('click', () => {
// 	currentView = 'readings'
// 	tabReadings.classList.add('active')
// 	tabMachines.classList.remove('active')
// 	sortSelect.disabled = true
// 	channelSelect.style.display = 'none'
// 	container.classList.remove('index')
// 	container.classList.add('readings-view')
// 	renderBlocks(readingBlocks, 'random')
// })

// // dark mode toggle with localStorage
// const darkToggle = document.getElementById('dark-toggle')
// if (localStorage.getItem('darkMode') === 'enabled') {
// 	document.body.classList.add('dark-mode')
// 	darkToggle.checked = true
// }
// darkToggle.addEventListener('change', () => {
// 	if (darkToggle.checked) {
// 		document.body.classList.add('dark-mode')
// 		localStorage.setItem('darkMode', 'enabled')
// 	} else {
// 		document.body.classList.remove('dark-mode')
// 		localStorage.setItem('darkMode', 'disabled')
// 	}
// })
