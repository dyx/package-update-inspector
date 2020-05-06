'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import consts from '@/utils/consts'
const isDevelopment = process.env.NODE_ENV !== 'production'

let win

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  win = new BrowserWindow({
    show: false,
    width: 830,
    height: 600,
    minWidth: 830,
    minHeight: 600,
    frame: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('ready-to-show', () => {
    if (!isDevelopment) {
      customMenu()
    }
    win.show()
    win.focus()
  })

  win.on('closed', () => {
    win = null
  })
}

function customMenu() {
  if (process.platform === 'darwin') {
    const menuTemplate = [
      {
        label: '包更新检查器',
        submenu: [{ label: '退出', role: 'quit' }]
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
          }
        ]
      }
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  } else {
    Menu.setApplicationMenu(null)
  }
}

app.on('window-all-closed', () => {
  console.log('app window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', () => {
  createWindow()
})

ipcMain.on(consts.EXPORT_CHANNEL, (ipcMainEvent, path) => {
  win.webContents.session.once('will-download', (event, item) => {
    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        ipcMainEvent.sender.send(consts.EXPORT_PROGRESS_CHANNEL, Math.floor(item.getReceivedBytes() / item.getTotalBytes() * 100))
      }
    })
    item.once('done', (event, state) => {
      ipcMainEvent.sender.send(consts.EXPORT_STATE_CHANNEL, state)
    })
  })
  ipcMainEvent.sender.downloadURL('file://' + path)
  // ipcMainEvent.sender.downloadURL('https://mirror.bit.edu.cn/apache/tomcat/tomcat-9/v9.0.34/bin/apache-tomcat-9.0.34.zip')
})

ipcMain.on(consts.IMPORT_CHANNEL, (ipcMainEvent) => {
  dialog.showOpenDialog(win, {
    title: '选择CSV文件',
    filters: [
      { name: 'Custom File Type', extensions: ['csv'] }
    ],
    properties: ['openFile']
  }).then(res => {
    ipcMainEvent.sender.send(consts.IMPORT_SELECTED_CHANNEL, res)
  }).catch(() => {})
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
