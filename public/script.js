// grab content container
const container = document.getElementById('arena-content')
container.classList.add('index')

// fetch arena data from backend
fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		const channels = data.channels
		if (!channels || channels.length === 0) {
			container.innerHTML = '<p>no content found.</p>'
			return
		}

		// loop through each channel
		channels.forEach((channel) => {
			if (!channel.blocks || channel.blocks.length === 0) return

			// loop through each block
			channel.blocks.forEach((block) => {
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
				right.textContent = channel.title?.toUpperCase() || 'misc'

				row.append(left, right)

				// content preview container
				const content = document.createElement('div')
				content.classList.add('block-content')
				content.style.display = 'none'

				// image block
				if (block.class === 'Image' && block.image?.display?.url) {
					const imageWrapper = document.createElement('div')
					imageWrapper.classList.add('image-container')

					const img = document.createElement('img')
					img.src = block.image.display.url
					img.alt = block.title || 'image'
					img.loading = 'lazy'

					imageWrapper.appendChild(img)
					content.appendChild(imageWrapper)
				}

				// text block
				else if (block.class === 'Text') {
					const p = document.createElement('p')
					p.textContent = block.content
					content.appendChild(p)
				}

				// link block
				else if (block.class === 'Link') {
					const a = document.createElement('a')
					a.href = block.source?.url || '#'
					a.target = '_blank'
					a.rel = 'noopener noreferrer'
					a.textContent = block.title || block.source?.url || 'view link'
					content.appendChild(a)
				}

				// attachment block
				else if (block.class === 'Attachment' && block.attachment?.url) {
					const a = document.createElement('a')
					a.href = block.attachment.url
					a.target = '_blank'
					a.rel = 'noopener noreferrer'
					a.textContent =
						block.title || block.attachment.file_name || 'download'
					content.appendChild(a)
				}

				// toggle on row click
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
	})
	.catch((err) => {
		console.error('error loading are.na data:', err)
		container.innerHTML = `<p>error: ${err.message}</p>`
	})
