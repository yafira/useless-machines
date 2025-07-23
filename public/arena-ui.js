// handles rendering blocks, UI interaction, and dark mode

// render blocks for machines or readings
function renderBlocks(blocks, sortMethod, channelFilter = 'all') {
	container.innerHTML = ''
	let sortedBlocks = sortBlocks(blocks, sortMethod)

	// filter by channel if needed
	if (sortMethod === 'channel' && channelFilter !== 'all') {
		sortedBlocks = sortedBlocks.filter(
			(block) => block.channelTitle === channelFilter
		)
	}

	// render each block
	sortedBlocks.forEach((block, idx) => {
		const blockWrapper = document.createElement('div')
		blockWrapper.classList.add('index-block')

		const row = document.createElement('div')
		row.classList.add('index-row')

		if (currentView === 'machines') {
			const indexNumber = document.createElement('div')
			indexNumber.classList.add('index-number')
			indexNumber.textContent = String(idx + 1).padStart(2, '0')
			row.prepend(indexNumber)
		}

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

		if (block.image?.thumb?.url && currentView === 'machines') {
			const thumb = document.createElement('img')
			thumb.src = block.image.thumb.url
			thumb.alt = block.title || 'thumbnail'
			thumb.classList.add('index-thumbnail')
			left.appendChild(thumb)
		}

		const pieceTitle = document.createElement('div')
		pieceTitle.classList.add('index-title')

		if (block.class === 'Link' && block.url) {
			const a = document.createElement('a')
			a.href = block.url
			a.textContent = piece || block.url
			a.target = '_blank'
			a.rel = 'noopener noreferrer'
			pieceTitle.appendChild(a)
		} else {
			pieceTitle.textContent = piece
		}

		titleGroup.appendChild(pieceTitle)

		if (currentView !== 'readings') {
			const artistLine = document.createElement('div')
			artistLine.classList.add('index-meta')
			artistLine.textContent = artist
			titleGroup.appendChild(artistLine)
		}

		if (currentView === 'machines') {
			const arrow = document.createElement('span')
			arrow.classList.add('index-arrow')
			arrow.textContent = '›'
			left.append(titleGroup, arrow)
		} else {
			left.append(titleGroup)
		}

		if (year && currentView === 'machines') {
			yearColumn.textContent = year
		}

		const content = document.createElement('div')
		content.classList.add('block-content')
		content.style.display = currentView === 'readings' ? 'block' : 'none'

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
		} else if (block.class === 'Attachment' && block.attachment?.url) {
			const a = document.createElement('a')
			a.href = block.attachment.url
			a.target = '_blank'
			a.rel = 'noopener noreferrer'
			a.textContent = block.title || block.attachment.file_name || 'download'
			content.appendChild(a)
		}

		if (currentView === 'machines') {
			row.addEventListener('click', (e) => {
				if (e.target.tagName.toLowerCase() === 'a') return
				const isVisible = content.style.display === 'block'
				content.style.display = isVisible ? 'none' : 'block'
				const arrow = row.querySelector('.index-arrow')
				if (arrow) arrow.textContent = isVisible ? '›' : '⌄'
			})
		}

		row.append(yearColumn, left, right)
		blockWrapper.append(row, content)
		container.appendChild(blockWrapper)
	})
}

// ui interaction: sort dropdown
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

// ui interaction: channel filter
channelSelect.addEventListener('change', (e) => {
	renderBlocks(machineBlocks, 'channel', e.target.value)
})

// switch to machines tab
tabMachines.addEventListener('click', () => {
	currentView = 'machines'
	tabMachines.classList.add('active')
	tabReadings.classList.remove('active')
	sortSelect.disabled = false
	channelSelect.style.display = 'none'
	container.classList.remove('readings-view')
	container.classList.add('index')
	renderBlocks(machineBlocks, 'year')
})

// switch to readings tab
tabReadings.addEventListener('click', () => {
	currentView = 'readings'
	tabReadings.classList.add('active')
	tabMachines.classList.remove('active')
	sortSelect.disabled = true
	channelSelect.style.display = 'none'
	container.classList.remove('index')
	container.classList.add('readings-view')
	renderBlocks(readingBlocks, 'random')
})

// toggle dark mode
const darkToggle = document.getElementById('dark-toggle')
if (localStorage.getItem('darkMode') === 'enabled') {
	document.body.classList.add('dark-mode')
	darkToggle.checked = true
}
darkToggle.addEventListener('change', () => {
	if (darkToggle.checked) {
		document.body.classList.add('dark-mode')
		localStorage.setItem('darkMode', 'enabled')
	} else {
		document.body.classList.remove('dark-mode')
		localStorage.setItem('darkMode', 'disabled')
	}
})
