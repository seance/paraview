const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const dialog = electron.dialog
const path = require('path')
const url = require('url')

const app = electron.app

let mainWindow

function createMainWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createMainWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow()
  }
})

ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      event.sender.send('selected-directory', files)
    }
  })
})
