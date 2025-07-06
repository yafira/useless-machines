const container = document.getElementById('arena-content')
container.classList.add('index')

fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		const blocks = []

		data.channels.forEach((channel) => {
			if (!channel.blocks || channel.blocks.length === 0) return

			channel.blocks.forEach((block) => {
				blocks.push({ ...block, channelTitle: channel.title })
			})
		})

		// shuffle blocks
		for (let i = blocks.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
		}

		// render each block
		blocks.forEach((block) => {
			const blockWrapper = document.createElement('div')
			blockWrapper.classList.add('index-block')

			const row = document.createElement('div')
			row.classList.add('index-row')

			const left = document.createElement('div')
			left.classList.add('index-left')

			const title = document.createElement('div')
			title.classList.add('index-title')
			title.textContent = block.title || 'untitled'

			const arrow = document.createElement('span')
			arrow.classList.add('index-arrow')
			arrow.textContent = '›'

			left.append(title, arrow)

			const right = document.createElement('div')
			right.classList.add('index-right')
			right.textContent = block.channelTitle?.toUpperCase() || 'misc'

			row.append(left, right)

			const content = document.createElement('div')
			content.classList.add('block-content')
			content.style.display = 'none'

			if (block.class === 'Image' && block.image?.display?.url) {
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
			} else if (block.class === 'Link') {
				const a = document.createElement('a')
				a.href = block.source?.url || '#'
				a.target = '_blank'
				a.rel = 'noopener noreferrer'
				a.textContent = block.title || block.source?.url || 'view link'
				content.appendChild(a)
			} else if (block.class === 'Attachment' && block.attachment?.url) {
				const a = document.createElement('a')
				a.href = block.attachment.url
				a.target = '_blank'
				a.rel = 'noopener noreferrer'
				a.textContent = block.title || block.attachment.file_name || 'download'
				content.appendChild(a)
			}

			row.addEventListener('click', (e) => {
				if (e.target.tagName.toLowerCase() === 'a') return

				const isVisible = content.style.display === 'block'
				content.style.display = isVisible ? 'none' : 'block'
				arrow.textContent = isVisible ? '›' : '⌄'
			})

			blockWrapper.append(row, content)
			container.appendChild(blockWrapper)
		})
	})
	.catch((err) => {
		console.error('❌ error loading are.na data:', err)
		container.innerHTML = `<p>error: ${err.message}</p>`
	})
