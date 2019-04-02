var mysql  = require('mysql');

function createDBConnection(){
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password', //insert you password
        database: 'payfast'
    });
}

module.exports = function() {
    return createDBConnection;
}