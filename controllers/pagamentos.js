module.exports = (app) => {
    app.get('/pagamentos', (req, res) => {
        res.send('OK.');
    });


    app.delete('/pagamentos/pagamento/:id', (req, res) => {
        let pagamento = {};
        let id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, (erro) => {
            if(erro) {
                res.status(500).send(erro);
                return;
            }

            console.log("Pagamento cancelado");
            
            res.status(204).send(pagamento);
        });
    });

    app.put('/pagamentos/pagamento/:id', (req, res) => {

        let pagamento = {};
        let id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CONFIRMADO';

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, (erro) => {
            if(erro) {
                res.status(500).send(erro);
                return;
            }

            console.log("Pagamento criado");
            res.send(pagamento);
        });

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
                
                res.status(500).send(erro);
                return;
            }
            console.log('pagamento criado');
            res.location('/pagamentos/pagamento/' + resultado.insertId);

            res.status(201).json(pagamento);
            
        });


    });
}