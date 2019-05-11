var restify = require('restify-clients');

function CartoesCliente() {
    this._cliente = restify.createJsonClient({
        url: "http://localhost:3001"
    });
}

CartoesCliente.prototype.autoriza = function (cartao, callback) {
    this._cliente.post('/cartoes/autoriza', cartao ,callback);
}


module.exports = () => {
    return CartoesCliente;
}