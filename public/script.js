const container = document.getElementById('arena-content')

fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		const channels = data.channels

		if (!channels || channels.length === 0) {
			container.innerHTML = '<p>🤷‍♀️ No channels found in this group.</p>'
			return
		}

		channels.forEach((channel) => {
			// Add channel title
			const header = document.createElement('h2')
			header.textContent = `🔩 ${channel.title}`
			header.style.marginTop = '2rem'
			container.appendChild(header)

			channel.blocks.forEach((block) => {
				const blockDiv = document.createElement('div')
				blockDiv.classList.add('block')

				// IMAGE
				if (block.class === 'Image' && block.image?.display?.url) {
					const img = document.createElement('img')
					img.src = block.image.display.url
					img.alt = block.title || 'Image'
					img.loading = 'lazy'
					blockDiv.appendChild(img)
				}
				// TEXT
				else if (block.class === 'Text') {
					const p = document.createElement('p')
					p.textContent = block.content
					blockDiv.appendChild(p)
				}
				// LINK
				else if (block.class === 'Link') {
					const a = document.createElement('a')
					a.href = block.source?.url || '#'
					a.target = '_blank'
					a.rel = 'noopener noreferrer'
					a.textContent = block.title || block.source?.url || 'Untitled link'
					blockDiv.appendChild(a)
				}
				// MEDIA
				else if (block.class === 'Media') {
					if (block.embed?.html) {
						blockDiv.innerHTML += block.embed.html
					} else if (
						block.attachment?.url &&
						block.attachment?.content_type?.startsWith('video')
					) {
						const video = document.createElement('video')
						video.src = block.attachment.url
						video.controls = true
						video.style.maxWidth = '100%'
						blockDiv.appendChild(video)
					} else if (
						block.attachment?.url &&
						block.attachment?.content_type?.startsWith('audio')
					) {
						const audio = document.createElement('audio')
						audio.src = block.attachment.url
						audio.controls = true
						blockDiv.appendChild(audio)
					} else {
						const em = document.createElement('em')
						em.textContent = '⚠️ Unsupported media block'
						blockDiv.appendChild(em)
					}
				}
				// UNSUPPORTED
				else {
					const em = document.createElement('em')
					em.textContent = `⚠️ Unsupported block type: ${block.class}`
					blockDiv.appendChild(em)
				}

				container.appendChild(blockDiv)
			})
		})
	})
	.catch((err) => {
		console.error('❌ Error loading Are.na data:', err)
		container.innerHTML = `<p>⚠️ Error loading content: ${err.message}</p>`
	})
