const NEDB = require('nedb');
const DATABASE = new NEDB({
    filename:'PDV.db',
    autoload:true,
}); 

var doc = { 
    NmTerminal: 'world',
    IpTerminal: '192.168.0.1',
    MacTe
};

module.exports = {
    setPathDb(){
        db.insert(doc, function (err, newTable) {
            
        });
    }
}