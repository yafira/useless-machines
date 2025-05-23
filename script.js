const CHANNEL_SLUG = 'useless-machines-ht1bgqaxc74' // Shelby Wilson's channel slug
const container = document.getElementById('arena-content')

fetch(`https://api.are.na/v2/channels/${CHANNEL_SLUG}`)
	.then((res) => res.json())
	.then((data) => {
		const blocks = data.contents

		blocks.forEach((block) => {
			const blockDiv = document.createElement('div')
			blockDiv.classList.add('block')

			if (block.class === 'Image') {
				const img = document.createElement('img')
				img.src = block.image.display.url
				img.alt = block.title || 'Image'
				img.style.maxWidth = '100%'
				blockDiv.appendChild(img)
			} else if (block.class === 'Text') {
				blockDiv.innerHTML = `<p>${block.content}</p>`
			} else if (block.class === 'Link') {
				const title = block.title || block.source.url
				blockDiv.innerHTML = `<a href="${block.source.url}" target="_blank">${title}</a>`
			} else {
				blockDiv.innerHTML = `<em>Unsupported block type: ${block.class}</em>`
			}

			container.appendChild(blockDiv)
		})
	})
	.catch((err) => {
		container.innerHTML = `<p>⚠️ Error fetching Are.na content.</p>`
		console.error(err)
	})
