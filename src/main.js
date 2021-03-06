const fs = require('fs').promises;
const { ElectronBlocker, fullLists } = require('@cliqz/adblocker-electron');

const { app, BrowserWindow, session, globalShortcut, Menu, BrowserView } = require('electron')
const fetch = require('node-fetch')
const path = require('path')
const mediaControl = require('./mediaControl.js')


let mainWindow, view, playPauseTooltip, playPauseIcon

playPauseTooltip = 'Pause'
playPauseIcon = path.join(__dirname, '../', './assets/pause.png')

function updatePlayPauseThumbar() {
    if (playPauseTooltip === 'Pause') {
        playPauseTooltip = 'Play'
        playPauseIcon = path.join(__dirname, '../', './assets/play.png')
    } else {
        playPauseTooltip = 'Pause'
        playPauseIcon = path.join(__dirname, '../', './assets/pause.png')
    }
    createThumbar(mainWindow, view)
}


function createThumbar(mainWindow, view) {
    mainWindow.setThumbarButtons([])
    mainWindow.setThumbarButtons([
        {
            tooltip: 'Previous',
            icon: path.join(__dirname, '../', './assets/previous.png'),
            click () {
                mediaControl.previousTrack(view)
            }
        },
        {
            tooltip: playPauseTooltip,
            icon: playPauseIcon,
            click () {
                mediaControl.playPauseTrack(view)
                updatePlayPauseThumbar()
            }
        },
        {
            tooltip: 'Next',
            icon: path.join(__dirname, '../', './assets/next.png'),
            click () {
                mediaControl.nextTrack(view)
            }
        }
    ])
}


async function createWindow () {

    mainWindow = new BrowserWindow({
        width: 1500,
        height: 800,
        minWidth: 600,
        minHeight: 750,
        titleBarStyle: 'hidden',
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, '..', './src/preload.js'),
            sandbox: true,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        backgroundColor: '#FFF',
        darkTheme: true,
        icon: path.join(__dirname, '../', './assets/icon.ico')
    })

    view = new BrowserView({webPreferences: { nodeIntegration: true}})
    view.setBackgroundColor('black')
    mainWindow.setBrowserView(view)
    view.setBounds({ x: 0, y: 30, width: 1500, height: 770});
    view.setAutoResize({width: true, height: true, horizontal: true, vertical: true})
    Menu.setApplicationMenu(null)

    const blocker = await ElectronBlocker.fromLists(
        fetch,
        fullLists,
        {
            enableCompression: true,
        },
        {
            path: 'engine.bin',
            read: fs.readFile,
            write: fs.writeFile,
        },
    );

    blocker.enableBlockingInSession(session.defaultSession);

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
        {
            urls: ['https://accounts.google.com/*'],
        },
        (details, callback) => {
            const newRequestHeaders = Object.assign(
                {},
                details.requestHeaders || {},
                {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0',
                }
            )
            callback({ requestHeaders: newRequestHeaders })
        }
    )

    mainWindow.loadFile('./src/index.html')
    view.webContents.loadURL('https://music.youtube.com')
    view.webContents.on('page-title-updated', () => {
        mainWindow.setTitle(view.webContents.getTitle())
    })
    
    createThumbar(mainWindow, view)
}

app.whenReady().then(() => {
    globalShortcut.register('MediaPreviousTrack', () => {
        mediaControl.previousTrack(mainWindow)
    })
    globalShortcut.register('MediaNextTrack', () => {
        mediaControl.nextTrack(mainWindow)
    })
    globalShortcut.register('MediaPlayPause', () => {
        mediaControl.playPauseTrack(mainWindow)
    })    
    createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
