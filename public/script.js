const container = document.getElementById('arena-content')

fetch('/api/arena')
	.then((res) => {
		if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
		return res.json()
	})
	.then((data) => {
		const blocks = data.contents

		if (!blocks || blocks.length === 0) {
			container.innerHTML = '<p>🤷‍♀️ No blocks found in this channel.</p>'
			return
		}

		blocks.forEach((block) => {
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
				console.log('📦 Media block:', block) // 🔍 debug output

				// Embedded video or audio player (YouTube, Vimeo, etc.)
				if (block.embed?.html) {
					blockDiv.innerHTML += block.embed.html
				}

				// Raw video file (e.g., uploaded directly)
				else if (
					block.attachment?.url &&
					block.attachment?.content_type?.startsWith('video')
				) {
					const video = document.createElement('video')
					video.src = block.attachment.url
					video.controls = true
					video.style.maxWidth = '100%'
					blockDiv.appendChild(video)
				}

				// Raw audio file
				else if (
					block.attachment?.url &&
					block.attachment?.content_type?.startsWith('audio')
				) {
					const audio = document.createElement('audio')
					audio.src = block.attachment.url
					audio.controls = true
					blockDiv.appendChild(audio)
				}

				// Fallback
				else {
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
	.catch((err) => {
		console.error('❌ Error loading Are.na data:', err)
		container.innerHTML = `<p>⚠️ Error loading content: ${err.message}</p>`
	})
