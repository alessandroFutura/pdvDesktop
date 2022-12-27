const {ipcRenderer} = require('electron');

const os = require('os');
const axios = require('axios');
const Store = require('electron-store');

const store = new Store();
const {port1} = new MessageChannel();

Login = {
    data: {
        uri: null,
        user_pass: null,
        user_user: null,
        token: store.get('token'),
        appVersion: store.get('appVersion'),
        hostIP: null,
        hostName: os.hostname(),
        platform: os.platform(),
        osType: os.type(),
        userName: os.userInfo().username,
        nmUltimoLogin: store.get('nmUltimoLogin') || null
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
        }, 5000);
    },
    close: function(){
        ipcRenderer.postMessage('close');
    },
    events: function(){
        Login.data.hostIP = Login.getIP();
        if(!!Login.data.nmUltimoLogin){
            document.getElementById('user-user').value = Login.data.nmUltimoLogin;
            document.getElementById('user-pass').focus();
        }
        document.getElementById('button-about').addEventListener('click', () => {
            Login.about();
        });
        document.getElementById('button-close').addEventListener('click', () => {
            Login.close();
        }); 
        document.getElementById('button-submit').addEventListener('click', () => {
            Login.form2data();
            if(Login.validate()){
                Login.submit();
            }
        });
        document.getElementById('button-alert-close').addEventListener('click', () => {
            document.getElementById('alert').classList.toggle('visible');
        });         
    },
    form2data: function(){
        Login.data.uri = document.getElementById('select-api').value;
        Login.data.user_pass = document.getElementById('user-pass').value;
        Login.data.user_user = document.getElementById('user-user').value;
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
                opt.selected = data.default === 'Y';
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
        axios.post(
            `http://${Login.data.uri}/pdv/api/login.php`,
            Login.data,
            {headers: {'x-token': Login.data.token}}
        ).then(function(response){
            store.set('nmUltimoLogin', Login.data.user_user);
            ipcRenderer.postMessage("afterLogin", {
                uri: Login.data.uri,
                params: {
                    token: Login.data.token,
                    user_id: response.data.user_id,
                    user_session_value: response.data.user_session_value
                }
            }, [port1]);
        }).catch(function(response){
            if(response.response.status == 401){
                setTimeout(() => {
                    ipcRenderer.postMessage('Unauthorized', 'mainWindow');
                }, 5000)
            }
            Login.alert(response.response.data.message || response.response.statusText);
        });
    },
    validate: function(){
        if(!Login.data.user_user){
            Login.alert('Usuário não Informado!');
            return false;
        }
        if(!Login.data.user_pass){
            Login.alert('Senha não Informada!');
            return false;
        }
        if(!Login.data.uri){
            Login.alert('Conexão não selecionada!');
            return false;
        }
        return true;
    }
};

(()=> {
    Login.events();
    Login.getConnApi();
})();