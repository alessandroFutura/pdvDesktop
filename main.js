const {app, dialog, BrowserWindow, ipcMain} = require('electron');

const path = require('path');
const Store = require('electron-store');

const store = new Store();
store.set('appVersion', app.getVersion());

global.closingAlreadyConfirmed = false;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

function cleanStorage(){
	store.delete('token');
	store.delete('printer');
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
		icon: './src/assets/favicon.ico',
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
		icon: './src/assets/favicon.ico',
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

	if(!!store.get('token')){
		global.mainWindow.loadFile('./src/screens/login/login.html');
	} else {
		global.mainWindow.loadFile('./src/screens/cadastro/cadastro.html');
	}

	global.appWindow.on('close', e => {
        if(!global.closingAlreadyConfirmed){
			e.preventDefault();
			dialog.showMessageBox({
				type: 'question',
				buttons: ['Sim', 'Não'],
				title: 'Confirmação',
				message: 'Deseja realmente fechar a aplicação?'
			}).then(result => {
				if(result.response == 0){
					global.closingAlreadyConfirmed = true;
					global.appWindow.close(); 
				}
			});
		}
    });
}

function print(printAfter, data){
	let printer = store.get('printer');
	if(!!printer){
		global.appWindow.webContents.print({
			silent: data.silent,
			deviceName: printer,
			pageSize: data.pageSize
		}, (success, failureReason) => {
			if (!success) console.log(failureReason);
			global.appWindow.send('printing', {
				success: success,
				failureReason: failureReason
			});
		});
	} else {
		selectPrinter(printAfter, 'appWindow');
	}
}

function selectPrinter(printAfter, data){
	global.printerWindow = new BrowserWindow({
		show: true,
		width: 340,
		height: 426,
		frame: false,
        trasnparent: true,
		icon: './src/assets/favicon.ico',
		autoHideMenuBar: true,
		modal: true,
		parent: global[data],
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
	global.printerWindow.setMenu(null);
	global.printerWindow.loadFile('./src/screens/printer/printer.html');
	if(printAfter){
		global.printerWindow.on('close', (e) => {
			let printer = store.get('printer');
			if(!!printer){	
				print(false);
			}
		});
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
	global.appWindow.webContents.openDevTools();
});

ipcMain.on('print', (e, data) => {
	print(true, data);
});

ipcMain.on('afterLogout', () => {
	global.closingAlreadyConfirmed = true;
	global.appWindow.close();
	global.closingAlreadyConfirmed = false;
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

ipcMain.on('closePrinter', () => {
	global.printerWindow.close();
});

ipcMain.on('openDevTools', (e, data) => {
	global[data].webContents.openDevTools();
});

ipcMain.on('Unauthorized', (e, data) => {
	global.closingAlreadyConfirmed = true;
	global[data].close();
	cleanStorage();
	createWindow();
	global.closingAlreadyConfirmed = false;
});

ipcMain.on('about', (e, data) => {
	global.aboutWindow = new BrowserWindow({
		show: true,
		width: 340,
		height: 426,
		frame: false,
        trasnparent: true,
		icon: './src/assets/favicon.ico',
		autoHideMenuBar: true,
		modal: true,
		parent: global[data],
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

ipcMain.on('selectPrinter', (e, data) => {
	selectPrinter(false, data);
});

ipcMain.on('getPrinters', (e, data) => {
	global.printerWindow.webContents.getPrintersAsync().then((printers) => {
		global.printerWindow.send('printers', JSON.stringify(printers));
	});
});

ipcMain.on('openDevTools', (e, data) => {
	global[data].webContents.openDevTools();
});