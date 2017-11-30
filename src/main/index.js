'use strict'

import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron'
import path from 'path'
import fs from 'fs'
import moment from 'moment'

let mainWindow = null
let workerWindow = null

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// mainページからの印刷要求
ipcMain.on('print-to-pdf', (event, content) => {
  if (workerWindow !== null) {
    // エラーにより前回のページが残っていたら閉じる
    workerWindow.close()
  }

  workerWindow = new BrowserWindow({ show: false })
  workerWindow.loadURL(path.join(`file://${__static}`, '/worker.html'))
  workerWindow.openDevTools()

  workerWindow.on('closed', () => {
    workerWindow = null
  })

  // workerページが準備完了した後に要求を投げるようにする
  workerWindow.on('ready-to-show', () => {
    workerWindow.send('print-to-pdf', content)
  })
})

// workerページからの準備完了通知
ipcMain.on('ready-print-to-pdf', (event) => {
  const currentDate = moment().format('YYYYMMDDHHmmss')
  const pdfPath = path.join(app.getPath('home'), `/desktop/markdown_${currentDate}.pdf`)
  const options = { printBackground: true }

  workerWindow.webContents.printToPDF(options, (error, data) => {
    if (error) {
      throw error
    }
    fs.writeFile(pdfPath, data, (error) => {
      if (error) {
        throw error
      }
      // プレビュー表示
      shell.openItem(pdfPath)
      // PDFファイルは書き込み済みなのでworkerページは閉じても大丈夫
      workerWindow.close()
    })
  })
})

// let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  // 【新規追加】メニューの中身、ショートカットを設定
  const template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (() => {
            if (process.platform === 'darwin') {
              return 'Ctrl+Command+F'
            } else {
              return 'F11'
            }
          })(),
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (() => {
            if (process.platform === 'darwin') {
              return 'Alt+Command+I'
            } else {
              return 'Ctrl+Shift+I'
            }
          })(),
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            require('electron').shell.openExternal('http://electron.atom.io')
          }
        }
      ]
    }
  ]

  // 【新規追加】メニュー機能を追加
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
