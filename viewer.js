const electron = require('electron')
const ipc = electron.ipcRenderer

const viewerDiv = document.getElementById('viewer')

function backgroundImageUrl(imagePath) {
  return `url("${imagePath}")`
}

function makeSlide(imagePath) {
  const slide = document.createElement('div')
  slide.style.backgroundImage = backgroundImageUrl(imagePath)
  slide.classList.toggle('slide', true)
  return slide
}

function appendImage(imagePath) {
  viewerDiv.insertBefore(makeSlide(imagePath), viewerDiv.firstChild)
}

function removeImage(imagePath) {
  viewerDiv.removeChild(findViewerImage(imagePath))
}

function resetImage(imagePath) {
  viewerDiv.innerHTML = ''
  viewerDiv.appendChild(makeSlide(imagePath))
}

function rotateImages() {
  if (viewerDiv.children.length <= 1) return
  const tail = Array.from(viewerDiv.children).slice(1)

  const allHidden = tail.reverse().reduce((hide, child) => {
    const hidden = child.classList.contains('hidden')
    child.classList.toggle('hidden', hide)
    return hide && hidden
  }, true)

  if (allHidden) {
    tail.forEach((child) => {
      child.classList.toggle('hidden', false)
    })
  }
}

function findViewerImage(imagePath) {
  return Array.from(viewerDiv.children).find((child) => {
    return child.style.backgroundImage === backgroundImageUrl(imagePath)
  })
}

ipc.on('view', (event, message) => {
  if (message.append) {
    if (findViewerImage(message.imagePath)) {
      console.log('Remove')
      removeImage(message.imagePath)
    } else {
      console.log('Append')
      appendImage(message.imagePath)
    }
  } else {
    resetImage(message.imagePath)
  }
})

setInterval(rotateImages, 10000)
