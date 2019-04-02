module.exports = (app) => {
    app.get('/pagamentos', (req, res) => {
        res.send('OK.');
    });

    app.post('/pagamentos/pagamento', (req, res) => {

        req.assert("forma_de_pagamento", 
        "Forma de pagamento é obrigatorio").notEmpty();

        req.assert("valor", 
        "Valor é obrigatorio e deve ser um decimal").notEmpty().isFloat();

        const erros = req.validationErrors();

        if(erros) {
            console.log('Erros de validacao encontrados: ');
            res.status(400).send(erros);
            return;
            
        }

        const pagamento = req.body;

        pagamento.status = "CRIADO";
        pagamento.data = new Date;

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.salva(pagamento, (erro, resultado) => {
            if(erro){
                console.log('Erro ao inserir no banco: ' + erro);
                
                res.status(400).send(erro);
                return;
            }
            console.log('pagamento criado');
            res.json(pagamento);
            
        });


    });
}