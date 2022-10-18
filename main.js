const {app, BrowserWindow, ipcMain} = require('electron');

const path = require('path');
const Store = require('electron-store');

const store = new Store();
store.set('appVersion', '1.0.0');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

function cleanStorage(){
	store.delete('token');
	store.delete('idTerminal');
	store.delete('dtCadastro');
	store.delete('idUsuarioCadastro');
	store.delete('nmUsuarioCadastro');
}

function createWindow(){

	global.mainWindow = new BrowserWindow({
		width: 380,
		height: 580,
		frame: false,
        trasnparent: true,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			webSecurity: false,
			nodeIntegration: true,
			nativeWindowOpen: true,
			contextIsolation: false,
			enableRemoteModule: true,
			allowRunningInsecureContent: true
		}
	});

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
			allowRunningInsecureContent: true
		}
	});

	global.appWindow.setMenu(null);
    global.mainWindow.setMenu(null);
    //global.mainWindow.webContents.openDevTools();

	if(!!store.get('token')){
		global.mainWindow.loadFile('./src/screens/login/login.html');
	} else {
		global.mainWindow.loadFile('./src/screens/cadastro/cadastro.html');
	}
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', function () {
		if(BrowserWindow.getAllWindows().length === 0) createWindow()
	})
});

app.on('window-all-closed', function () {
	if(process.platform !== 'darwin') app.quit();
});

ipcMain.on('afterLogin', (e, data) => {
	global.mainWindow.close();
	global.appWindow.show();
	global.appWindow.maximize();
	global.appWindow.loadURL(`http://${data.uri}/pdv/?` + new URLSearchParams(data.params).toString());
});

ipcMain.on('afterLogout', () => {
	global.appWindow.close();
	createWindow();
});

ipcMain.on('afterCadastro', (e, data) => {
	store.set('token', data.terminal_token);
	store.set('idTerminal', data.terminal_id);
	store.set('dtCadastro', data.terminal_date);
	store.set('idUsuarioCadastro', data.user_id);
	store.set('nmUsuarioCadastro', data.user_name);
	global.mainWindow.loadFile('./src/screens/login/login.html');
});

ipcMain.on('close', () => {
	global.mainWindow.close();
});

ipcMain.on('closeAbout', () => {
	global.aboutWindow.close();
});

ipcMain.on('openDevTools', (e, data) => {
	console.log(data);
	global[data].webContents.openDevTools();
});

ipcMain.on('about', (e, data) => {
	global.aboutWindow = new BrowserWindow({
		show: true,
		width: 340,
		height: 426,
		frame: false,
        trasnparent: true,
		icon: 'app/icon.ico',
		autoHideMenuBar: true,
		modal: true,
		parent: data === 'mainWindow' ? global.mainWindow : global.appWindow,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			webSecurity: false,
			nodeIntegration: true,
			nativeWindowOpen: true,
			contextIsolation: false,
			enableRemoteModule: true,
			allowRunningInsecureContent: true
		}
	});
	global.aboutWindow.setMenu(null);
	global.aboutWindow.loadFile('./src/screens/sobre/sobre.html');
});