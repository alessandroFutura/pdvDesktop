const {ipcRenderer} = require('electron');

const Store = require('electron-store');
const store = new Store();

const actualPrinter = store.get('printer');
let selectedPrinter = '';

ipcRenderer.on('printers', (e, data) => {
	showPrinters(JSON.parse(data));
});

function events(){
    document.getElementById('button-close').addEventListener('click', () => {
        close();
    });
    document.getElementById('button-select').addEventListener('click', () => {
        select();
    });
}

function showPrinters(printers){
    let target = document.getElementById('printers');
    printers.forEach(printer => {
        target.insertAdjacentHTML('beforeend', `
            <div data-name="${printer.name}" class="printer ${actualPrinter == printer.name ? 'selected' : ''}">
                ${printer.name}
                <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" />
            <div/>
        `);
    });
    target.querySelectorAll('.printer').forEach(element => {
        element.addEventListener('click', () => {
            target.querySelectorAll('.printer').forEach(element2 => {
                element2.classList.remove('selected');
            })
            element.classList.add('selected');
            selectedPrinter = element.getAttribute('data-name');            
        });
    });
    console.log(target.getElementsByClassName('printer').length);
}

function select(){
    store.set('printer', selectedPrinter);
    close();
}

function close(){
    ipcRenderer.postMessage('closePrinter');
}

(()=> {
    events();
    ipcRenderer.postMessage('getPrinters');
})();