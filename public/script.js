const container = document.getElementById('arena-content')

fetch('/api/arena')
	.then((res) => res.json())
	.then((data) => {
		const blocks = data.contents

		blocks.forEach((block) => {
			const blockDiv = document.createElement('div')
			blockDiv.classList.add('block')

			if (block.class === 'Image' && block.image?.display?.url) {
				const img = document.createElement('img')
				img.src = block.image.display.url
				img.alt = block.title || 'Image'
				img.style.maxWidth = '100%'
				blockDiv.appendChild(img)
			} else if (block.class === 'Text') {
				const p = document.createElement('p')
				p.textContent = block.content
				blockDiv.appendChild(p)
			} else if (block.class === 'Link') {
				const a = document.createElement('a')
				a.href = block.source.url
				a.target = '_blank'
				a.textContent = block.title || block.source.url
				blockDiv.appendChild(a)
			} else {
				blockDiv.innerHTML = `<em>Unsupported block: ${block.class}</em>`
			}

			container.appendChild(blockDiv)
		})
	})
	.catch((err) => {
		console.error('⚠️ Error:', err)
		container.innerHTML = '<p>⚠️ Error loading Are.na content.</p>'
	})
