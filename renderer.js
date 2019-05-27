const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const globalShortcut = electron.remote.globalShortcut
const ipc = electron.ipcRenderer
const path = require('path')
const url = require('url')
const os = require('os')
const fs = require('fs')

const rootInput = document.getElementById('root')
const thumbnailsDiv = document.getElementById('thumbnails')
const selectButton = document.getElementById('select-root')

let viewerWindow
let rootPath

function createViewerWindow () {
  viewerWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  viewerWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'viewer.html'),
    protocol: 'file:',
    slashes: true,
  }))

  viewerWindow.on('closed', function () {
    viewerWindow = null
  })
}

function registerShortcuts() {
  globalShortcut.register('Control+Command+F', function () {
    viewerWindow.setFullScreen(!viewerWindow.isFullScreen())
  })
}

function setRootPath(root) {
  rootPath = root
  rootInput.value = root
  resetThumbnails()
}

function resetThumbnails() {
  function getFileName(filePath) {
      return path.basename(filePath, path.extname(filePath)) || filePath
  }
  function byName(imageA, imageB) {
      return imageA.name.localeCompare(imageB.name)
  }

  const files = fs.readdirSync(rootPath)
  const isImage = (f) => /\.(?:jpg)|(?:jpeg)|(?:png)$/.test(f)
  const images = files.filter(isImage).map((filePath) => ({
      name: getFileName(filePath),
      filePath,
  }))

  while (thumbnailsDiv.firstChild) {
    thumbnailsDiv.removeChild(thumbnailsDiv.firstChild)
  }

  images.sort(byName).forEach(({ name, filePath }) => {
    const thumbnail = document.createElement('div')
    const label = document.createElement('div')
    const imagePath = path.join(rootPath, filePath)
    thumbnail.classList.add('thumbnail')
    thumbnail.style.backgroundImage = `url("${imagePath}")`
    thumbnailsDiv.appendChild(thumbnail)
    thumbnail.addEventListener('click', (event) => {
      selectThumbnail(thumbnail, event.metaKey)
      selectImage(imagePath, event.metaKey)
    })
    label.appendChild(document.createTextNode(name))
    label.classList.add('label')
    thumbnail.appendChild(label)
  })
}

function selectThumbnail(thumbnail, append) {
  if (!append) {
    Array.from(thumbnailsDiv.children).forEach((thumb) => {
      thumb.classList.toggle('selected', false)
    })
  }
  thumbnail.classList.toggle('selected')
}

function selectImage(imagePath, append) {
  viewerWindow.webContents.send('view', { imagePath, append })
}

selectButton.addEventListener('click', () => {
  ipc.send('open-file-dialog')
})

ipc.on('selected-directory', (event, path) => {
  if (path.length) {
    setRootPath(path[0])
  }
})

createViewerWindow()
registerShortcuts()
setRootPath(os.homedir())
