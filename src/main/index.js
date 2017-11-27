'use strict'

import { app, BrowserWindow, ipcMain, shell } from 'electron'

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
  // workerWindow.loadURL('file://' + __dirname + '/src/renderer/components/worker.html')
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
