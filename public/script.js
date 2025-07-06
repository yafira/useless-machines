const container = document.getElementById('arena-content')
container.classList.add('index') // applies styling class

fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		const channels = data.channels

		if (!channels || channels.length === 0) {
			container.innerHTML = '<p>No content found.</p>'
			return
		}

		channels.forEach((channel) => {
			if (!channel.blocks || channel.blocks.length === 0) return

			channel.blocks.forEach((block) => {
				const blockWrapper = document.createElement('div')
				blockWrapper.classList.add('index-block')

				const row = document.createElement('div')
				row.classList.add('index-row')

				const left = document.createElement('div')
				left.classList.add('index-left')

				const title = document.createElement('div')
				title.classList.add('index-title')
				title.textContent = block.title || 'Untitled'

				const arrow = document.createElement('div')
				arrow.classList.add('index-arrow')
				arrow.textContent = '›'

				left.append(title, arrow)

				const right = document.createElement('div')
				right.classList.add('index-right')
				right.textContent = channel.title?.toUpperCase() || 'MISC'

				row.append(left, right)

				// content container (hidden initially)
				const content = document.createElement('div')
				content.classList.add('block-content')
				content.style.display = 'none'

				// preview content
				if (block.class === 'Image' && block.image?.display?.url) {
					const img = document.createElement('img')
					img.src = block.image.display.url
					img.alt = block.title || 'Image'
					img.loading = 'lazy'
					content.appendChild(img)
				} else if (block.class === 'Text') {
					const p = document.createElement('p')
					p.textContent = block.content
					content.appendChild(p)
				} else if (block.class === 'Link') {
					const a = document.createElement('a')
					a.href = block.source?.url || '#'
					a.target = '_blank'
					a.rel = 'noopener noreferrer'
					a.textContent = block.title || block.source?.url || 'View link'
					content.appendChild(a)
				} else if (block.class === 'Attachment' && block.attachment?.url) {
					const a = document.createElement('a')
					a.href = block.attachment.url
					a.target = '_blank'
					a.rel = 'noopener noreferrer'
					a.textContent =
						block.title || block.attachment.file_name || 'Download'
					content.appendChild(a)
				}

				// toggle content visibility on row click (ignore if clicking a link)
				row.addEventListener('click', (e) => {
					if (e.target.tagName.toLowerCase() === 'a') return
					const isVisible = content.style.display === 'block'
					content.style.display = isVisible ? 'none' : 'block'
				})

				blockWrapper.append(row, content)
				container.appendChild(blockWrapper)
			})
		})
	})
	.catch((err) => {
		console.error('❌ Error loading Are.na data:', err)
		container.innerHTML = `<p>Error: ${err.message}</p>`
	})
