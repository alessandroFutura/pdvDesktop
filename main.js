const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const call = require('./src/NEDB/data')

call.setPathDb();
call.createTable();

function createWindow () {

  global.mainWindow = new BrowserWindow({
    width: 380,
    height: 580,
    frame: true,
    trasnparent: true,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      nodeIntegration: true,
      nativeWindowOpen: true,
      contextIsolation: false,
      enableRemoteModule: true,
      allowRunningInsecureContent: true
    }
  })

  global.appWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    icon: 'app/icon.ico',
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        nodeIntegration: true,
        nativeWindowOpen: true,
        contextIsolation: false,
        enableRemoteModule: true,
    }
  });

  global.mainWindow.loadFile('./src/screens/login/index.html')
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

// funões de escuta dos enventos
ipcMain.on('login', (e, mgs) => {
    let URI = mgs.URI;

    global.mainWindow.close();
    global.appWindow.show();
    global.appWindow.maximize();
    global.appWindow.loadURL(URI);  
});
ipcMain.on('close', () => {
  global.mainWindow.close();
});
