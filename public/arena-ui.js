// handles rendering blocks, UI interaction, and dark mode

// dom refs
const spinner = document.getElementById('loading-spinner')
const container = document.getElementById('arena-content')
const sortSelect = document.getElementById('sort-select')
const channelSelect = document.getElementById('channel-select')
const tabMachines = document.getElementById('tab-machines')
const tabReadings = document.getElementById('tab-readings')
const tabAbout = document.getElementById('tab-about')
const aboutSection = document.getElementById('about-section')
const rockerToggle = document.getElementById('mode-toggle')

container.classList.add('index')

// render blocks for machines or readings
function renderBlocks(blocks, sortMethod, channelFilter = 'all') {
	container.innerHTML = ''
	let sortedBlocks = sortBlocks(blocks, sortMethod)

	if (sortMethod === 'channel' && channelFilter !== 'all') {
		sortedBlocks = sortedBlocks.filter((block) =>
			categoryMap[block.id]?.has(channelFilter)
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
			const categoryLabel = document.createElement('div')
			categoryLabel.classList.add('index-channel')

			const categories = categoryMap[block.id]
			if (categories) {
				categoryLabel.innerHTML = [...categories]
					.map((cat) => `<span class="small-tag">${cat.toUpperCase()}</span>`)
					.join(' ')
			} else {
				categoryLabel.textContent = block.channelTitle?.toUpperCase() || 'MISC'
			}

			const channelDesc = document.createElement('div')
			channelDesc.classList.add('channel-description')
			channelDesc.textContent = block.channelDescription || ''

			right.append(categoryLabel, channelDesc)
		}

		row.append(yearColumn, left, right)

		const content = document.createElement('div')
		content.classList.add('block-content')
		content.style.display = currentView === 'readings' ? 'block' : 'none'

		if (block.description) {
			const desc = document.createElement('div')
			desc.classList.add('block-description')
			desc.innerHTML = block.description
			const links = desc.querySelectorAll('a')
			links.forEach((link) => {
				link.setAttribute('target', '_blank')
				link.setAttribute('rel', 'noopener noreferrer')
			})
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
sortSelect.addEventListener('change', () => {
	const value = sortSelect.value

	// show channel select only when "Type of Machine" is selected
	if (value === 'channel') {
		channelSelect.style.display = 'inline-block'
	} else {
		channelSelect.style.display = 'none'
	}

	renderBlocks(machineBlocks, value)
})

// machines tab
tabMachines.addEventListener('click', () => {
	currentView = 'machines'
	tabMachines.classList.add('active')
	tabReadings.classList.remove('active')
	tabAbout.classList.remove('active')

	sortSelect.disabled = false
	channelSelect.style.display = 'none'

	container.classList.remove('readings-view')
	container.classList.add('index')
	container.style.display = 'flex'
	aboutSection.style.display = 'none'

	renderBlocks(machineBlocks, 'year')
})

// readings tab
tabReadings.addEventListener('click', () => {
	currentView = 'readings'
	tabReadings.classList.add('active')
	tabMachines.classList.remove('active')
	tabAbout.classList.remove('active')

	sortSelect.disabled = true
	channelSelect.style.display = 'none'

	container.classList.remove('index')
	container.classList.add('readings-view')
	container.style.display = 'block'
	aboutSection.style.display = 'none'

	renderBlocks(readingBlocks, 'random')
})

// about tab
tabAbout.addEventListener('click', () => {
	currentView = 'about'
	tabAbout.classList.add('active')
	tabMachines.classList.remove('active')
	tabReadings.classList.remove('active')

	sortSelect.disabled = true
	channelSelect.style.display = 'none'

	container.classList.remove('readings-view')
	container.classList.remove('index')
	container.style.display = 'none'
	aboutSection.style.display = 'block'
})

// dark mode using toggle input
const toggleSwitch = document.getElementById('mode-toggle')

if (toggleSwitch) {
	// check if user has a saved preference
	if (localStorage.getItem('darkMode') === 'true') {
		document.body.classList.add('dark-mode')
		toggleSwitch.checked = true
	}

	// add event listener to toggle
	toggleSwitch.addEventListener('change', () => {
		if (toggleSwitch.checked) {
			document.body.classList.add('dark-mode')
			localStorage.setItem('darkMode', 'true')
		} else {
			document.body.classList.remove('dark-mode')
			localStorage.setItem('darkMode', 'false')
		}
	})
}

// enhanced search with highlighting
const searchInput = document.getElementById('search-input')
if (searchInput) {
	searchInput.addEventListener('input', () => {
		const query = searchInput.value.trim().toLowerCase()
		const blocks = document.querySelectorAll('.index-block, .block')

		blocks.forEach((block) => {
			if (currentView === 'about') return

			let matchFound = false

			// clear previous highlights
			block.querySelectorAll('mark').forEach((mark) => {
				const parent = mark.parentNode
				parent.replaceChild(document.createTextNode(mark.textContent), mark)
				parent.normalize()
			})

			const selectors = [
				'.index-title',
				'.block-description',
				'.index-meta',
				'.index-channel',
			]

			selectors.forEach((selector) => {
				const el = block.querySelector(selector)
				if (el) {
					const originalText = el.textContent
					const lowerText = originalText.toLowerCase()

					if (query.length >= 3 && lowerText.includes(query)) {
						matchFound = true

						// custom highlighting that preserves spaces
						const regex = new RegExp(`(${query})`, 'gi')
						const highlighted = originalText.replace(regex, (match) => {
							// avoid wrapping spaces
							return match.trim() === '' ? match : `<mark>${match}</mark>`
						})
						el.innerHTML = highlighted
					} else if (query === '') {
						matchFound = true
						el.innerHTML = originalText // reset
					}
				}
			})

			// show/hide block based on match
			block.style.display = matchFound || query === '' ? '' : 'none'
		})
	})
}
