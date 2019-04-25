const soap = require('soap');

function CorreiosSOAPClient() {
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}
module.exports = () => {
    return CorreiosSOAPClient;
}
CorreiosSOAPClient.prototype.calculaPrazo = function (args, callback) {
    soap.createClient(this._url, function(erro, cliente) {
            console.log('Cliente SOAP criado');
            cliente.CalcPrazo(args, callback);
        }
    );
}