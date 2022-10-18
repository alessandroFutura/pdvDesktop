const {ipcRenderer} = require('electron');

const os = require('os');
const axios = require('axios');
const Store = require('electron-store');

const store = new Store();
const {port1} = new MessageChannel();

Cadastro = {
    data: {
        uri: null,
        user_user: null,
        user_pass: null,
        terminal_name: os.hostname(),
        terminal_token: Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2),
        terminal_nickname: null,
        appVersion: store.get('appVersion'),
        hostIP: null,
        hostName: os.hostname(),
        platform: os.platform(),
        osType: os.type(),
        userName: os.userInfo().username
    },
    about: function(){
        ipcRenderer.postMessage('about', 'mainWindow');
    },
    alert: function(message){
        document.getElementById('alert').classList.toggle('visible');
        document.getElementById('alert-message').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        setTimeout(() => {
            if(document.getElementById('alert').classList.contains('visible')){
                document.getElementById('alert').classList.toggle('visible');
            }
        }, 3000);
    },
    close: function(){
        ipcRenderer.postMessage('close');
    },
    events: function(){
        Cadastro.data.hostIP = Cadastro.getIP();
        document.getElementById('terminal-name').value = Cadastro.data.terminal_name;
        document.getElementById('button-about').addEventListener('click', () => {
            Cadastro.about();
        });
        document.getElementById('button-close').addEventListener('click', () => {
            Cadastro.close();
        }); 
        document.getElementById('button-submit').addEventListener('click', () => {
            Cadastro.form2data();
            if(Cadastro.validate()){
                Cadastro.submit();
            }
        });
        document.getElementById('button-alert-close').addEventListener('click', () => {
            document.getElementById('alert').classList.toggle('visible');
        });        
    },
    form2data: function(){
        Cadastro.data.uri = document.getElementById('select-api').value;
        Cadastro.data.user_pass = document.getElementById('user-pass').value;
        Cadastro.data.user_user = document.getElementById('user-user').value;
        Cadastro.data.terminal_nickname = document.getElementById('terminal-nickname').value;
    },
    getConnApi: function(){
        fetch('https://www.grupodafel.com.br/YQXMxHBR5p.json').then(response => {
            return response.json();
        }).then((res) => {
            let select = document.getElementById('select-api');
            res.forEach((data) => {
                let opt = document.createElement('option');
                opt.value = data.ip;
                opt.textContent += data.name;
                opt.selected = data.default == 'Y';
                select.appendChild(opt);
            });
        });
    },
    getIP: function(){
        var ethernet = os.networkInterfaces().Ethernet;
        if( !!ethernet ){
            for(var k in ethernet) {
                var address = ethernet[k];
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address;
                }
            }
        }
        var wifi = os.networkInterfaces()['Wi-Fi'];
        if( !!wifi ){
            for (var k in wifi) {
                var address = wifi[k];
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address;
                }
            }
        }
        var local = os.networkInterfaces()['Conexão local'];
        if( !!local ){
            for (var k in local) {
                var address = local[k];
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address;
                }
            }
        }
        return null;
    },
    submit: function(){
        axios({
            method: "post",
            url: `http://${Cadastro.data.uri}/pdv/api/terminal.php?action=add`,
            data: Cadastro.data,
            responseType: "stream",
        }).then(function(response){
            ipcRenderer.postMessage("afterCadastro", {
                user_id: response.data.user_id,
                user_name: response.data.user_name,
                terminal_id: response.data.terminal_id,
                terminal_date: response.data.terminal_date,
                terminal_token: response.data.terminal_token
            }, [port1]);
        }).catch(function(response){
            Cadastro.alert(response.response.data.message || response.response.statusText);
        });
    },
    validate: function(){
        if(!Cadastro.data.terminal_nickname){
            Cadastro.alert('Apelido não Informado!');
            return false;
        }
        if(!Cadastro.data.user_user){
            Cadastro.alert('Usuário não Informado!');
            return false;
        }
        if(!Cadastro.data.user_pass){
            Cadastro.alert('senha não Informada!');
            return false;
        }
        if(!Cadastro.data.uri){
            Cadastro.alert('Conexão não selecionada!');
            return false;
        }
        return true;
    }
};

(()=> {
    Cadastro.events();
    Cadastro.getConnApi();
})();