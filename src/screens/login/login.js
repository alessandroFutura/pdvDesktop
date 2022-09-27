const {ipcRenderer} = require('electron')
const axios = require('axios');
const os = require('os');

const { port1, port2 } = new MessageChannel()

const data = {
    uri: null,
    user_pass: null,
    user_login: null
}

function form2data (){
    data.uri = document.querySelector('#conn_api').value;
    data.user_pass = document.querySelector('#user_pass').value;
    data.user_login =document.querySelector('#user_login').value;
}

function getConnApi() {
    fetch('https://www.grupodafel.com.br/YQXMxHBR5p.json')
    .then(response => {
        return response.json();
    })
    .then((res) => {
        let select = document.querySelector('#conn_api');
        res.forEach((data)=>{
            let opt = document.createElement('option');
            opt.value = data.ip;
            opt.textContent += data.name;
            opt.selected = data.default == 'Y'
            select.appendChild(opt);
        });
    });
}

function events(){
    document.querySelector('#button_send').addEventListener('click', ()=>{
        if(Validate()){
            if(!document.querySelector('.Alert').classList.contains('showAlert')){
                showAlert('Usuário ou senha não Informado!');
            }
        }else{
            Login();
        }
    });
    document.querySelector('#btnAlert').addEventListener('click', ()=>{
        document.querySelector('.Alert').classList.toggle('showAlert');
    });
    document.querySelector('.closeScreenLogin').addEventListener('click', ()=>{
        closeLogin();
    });
}

function showAlert(param){
    document.querySelector('.Alert').classList.toggle('showAlert');
    document.querySelector('#mensseger').innerHTML =`<i class="fas fa-exclamation-triangle"></i> ${param}` ;
    setTimeout(()=>{
        if(document.querySelector('.Alert').classList.contains('showAlert')){
            document.querySelector('.Alert').classList.toggle('showAlert');
        }
    },3000);
}

function getIP(){
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
}

function Login(){
    form2data();
    axios({
        method: "post",
        url: `http://${data.uri}/commercial3/api/login.php`,
        data: {
            user_user: data.user_login,
            user_pass: data.user_pass,
            AppVersion: '1.0.0',
            HostIP: getIP(),
            HostName:os.hostname(),
            Platform: os.platform()
        },
        responseType: "stream",
    }).then(function (response) {
        let res = response.data.data;
        let status = response.data.status.code;

        if(status === 200){
            ipcRenderer.postMessage('login', { URI: `http://${data.uri}/compass3/?user_id=${res.user_id}&user_session_value=${res.user_session_id}`}, [port1]);
        }else{
            showAlert(`Status: ${status}: Tente mais tarde!`);
        }
    }).catch((error)=>(
        showAlert(error.response.data.status.description)
    ));
}

function Validate (){
    let isValid = false;
    if(!document.querySelector('#user_login').value){
        return true
    }
    if(!document.querySelector('#user_pass').value){
        return true
    }
    return isValid;
}

function closeLogin(){
    ipcRenderer.postMessage('close');
}

(()=> {
    events();
    getConnApi();
})();
