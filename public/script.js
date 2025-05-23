const container = document.getElementById('arena-content')

// Fetch data from your serverless function
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

			// Image block
			if (block.class === 'Image' && block.image?.display?.url) {
				const img = document.createElement('img')
				img.src = block.image.display.url
				img.alt = block.title || 'Image'
				img.loading = 'lazy'
				img.style.maxWidth = '100%'
				blockDiv.appendChild(img)
			}

			// Text block
			else if (block.class === 'Text') {
				const p = document.createElement('p')
				p.textContent = block.content
				blockDiv.appendChild(p)
			}

			// Link block
			else if (block.class === 'Link') {
				const a = document.createElement('a')
				a.href = block.source?.url || '#'
				a.target = '_blank'
				a.rel = 'noopener noreferrer'
				a.textContent = block.title || block.source?.url || 'Untitled link'
				blockDiv.appendChild(a)
			}

			// Unknown block
			else {
				const em = document.createElement('em')
				em.textContent = `Unsupported block type: ${block.class}`
				blockDiv.appendChild(em)
			}

			container.appendChild(blockDiv)
		})
	})
	.catch((err) => {
		console.error('❌ Error loading Are.na data:', err)
		container.innerHTML = `<p>⚠️ Error loading content: ${err.message}</p>`
	})
