const {ipcRenderer} = require('electron');

const Store = require('electron-store');
const store = new Store();

var moment = require('moment'); 

const data = {
    appVersion: store.get('appVersion'),
    dtCadastro: store.get('dtCadastro') || null,
    nmUsuarioCadastro: store.get('nmUsuarioCadastro') || null
};

function events(){
    document.getElementById('button-close').addEventListener('click', () => {
        close();
    });
    document.getElementById('version').innerText = data.appVersion;
    document.getElementById('release').innerHTML = (`
        Informações do Terminal:<br/>
        Instalado em: ${data.dtCadastro ? moment(data.dtCadastro).format('DD/MM/YYYY HH:mm:ss') : '--'}<br/>
        Liberado por: ${data.nmUsuarioCadastro || '--'}<br/>
    `);
}

function close(){
    ipcRenderer.postMessage('closeAbout');
}

(()=> {
    events();
})();