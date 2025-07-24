// handles rendering blocks, UI interaction, and dark mode

// dom refs
const spinner = document.getElementById('loading-spinner')
const container = document.getElementById('arena-content')
const sortSelect = document.getElementById('sort-select')
const channelSelect = document.getElementById('channel-select')
const tabMachines = document.getElementById('tab-machines')
const tabReadings = document.getElementById('tab-readings')
const darkToggle = document.getElementById('dark-toggle')

container.classList.add('index')

// render blocks for machines or readings
function renderBlocks(blocks, sortMethod, channelFilter = 'all') {
	container.innerHTML = ''
	let sortedBlocks = sortBlocks(blocks, sortMethod)

	if (sortMethod === 'channel' && channelFilter !== 'all') {
		sortedBlocks = sortedBlocks.filter(
			(block) => block.channelTitle === channelFilter
		)
	}

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

		if (currentView === 'machines') {
			const channelLabel = document.createElement('div')
			channelLabel.classList.add('index-channel')
			channelLabel.textContent = block.channelTitle?.toUpperCase() || 'MISC'

			const channelDesc = document.createElement('div')
			channelDesc.classList.add('channel-description')
			channelDesc.textContent = block.channelDescription || ''

			right.append(channelLabel, channelDesc)
		}

		row.append(yearColumn, left, right)

		const content = document.createElement('div')
		content.classList.add('block-content')
		content.style.display = currentView === 'readings' ? 'block' : 'none'

		if (block.description) {
			const desc = document.createElement('div')
			desc.classList.add('block-description')
			desc.innerHTML = block.description

			// open links in new window
			const links = desc.querySelectorAll('a');
			links.forEach(link => {
				link.setAttribute('target', '_blank');
				link.setAttribute('rel', 'noopener noreferrer');
			});
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
		} else if (block.class === 'Link' && currentView !== 'readings') {
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

		if (currentView === 'machines') {
			row.addEventListener('click', (e) => {
				if (e.target.tagName.toLowerCase() === 'a') return
				const isVisible = content.style.display === 'block'
				content.style.display = isVisible ? 'none' : 'block'
				const arrow = row.querySelector('.index-arrow')
				if (arrow) arrow.textContent = isVisible ? '›' : '⌄'
			})
		}

		blockWrapper.append(row, content)
		container.appendChild(blockWrapper)
	})
}

// dropdown change: sort
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

// dropdown change: channel filter
channelSelect.addEventListener('change', (e) => {
	renderBlocks(machineBlocks, 'channel', e.target.value)
})

// machines tab
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

// readings tab
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

// dark mode toggle
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
