const logger = require('../servicos/logger.js');

module.exports = (app) => {
    app.get('/pagamentos', (req, res) => {
        res.send('OK.');
    });
    
    
    app.get('/pagamentos/pagamento/:id', (req, res) => {
        const id = req.params.id;
        console.log('consultando pagamento: ' + id);
        logger.info('consultando pagamento: ' + id);
        
        const memcachedClient = app.servicos.memcachedClient();
        
        memcachedClient.get('pagamento-'+id, (erro, retorno) => {
            if (erro || !retorno) {
                console.log('MISS - chave nao encontrada');
                let connection = app.persistencia.connectionFactory();
                let pagamentoDao = new app.persistencia.PagamentoDao(connection);
                
                pagamentoDao.buscaPorId(id, (erro, resultado) => {
                    if (erro) {
                        console.log("Erro ao consultar no banco" + erro);
                        res.status(500).send(erro);
                        return;
                    }
                    
                    console.log('pagamento encontrado: ' + JSON.stringify(resultado));
                    res.json(resultado);
                    return;
                });
                // HIT no chace
            } else {
                console.log('HIT - valor: ' + JSON.stringify(retorno));
                res.json(retorno);
                return;
            }
        });
        
        
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
        
        req.assert("pagamento.forma_de_pagamento", 
        "Forma de pagamento é obrigatorio").notEmpty();
        
        req.assert("pagamento.valor", 
        "Valor é obrigatorio e deve ser um decimal").notEmpty().isFloat();
        
        const erros = req.validationErrors();
        
        if(erros) {
            console.log('Erros de validacao encontrados: ');
            res.status(400).send(erros);
            return;
            
        }
        
        const pagamento = req.body["pagamento"];
        
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
            pagamento.id = resultado.insertId
            console.log('pagamento criado');
            
            //Colocando em cache
            const memcachedClient = app.servicos.memcachedClient();
            memcachedClient.set('pagamento-'+pagamento.id, pagamento, 60000, (erro) => {
                console.log('nova chave adicionada ao cache: pagamento-'+pagamento.id);
            });
            
            if(pagamento.forma_de_pagamento == "cartao") {
                let cartao = req.body['cartao'];
                console.log(cartao);
                
                let clienteCartoes = new app.servicos.clienteCartoes();
                
                clienteCartoes.autoriza(cartao,
                    function(exception, request, response, retorno) {
                        
                        if(exception) {
                            console.log(exception);
                            
                            res.status(400).send(exception.toString());
                            return;
                        }
                        
                        console.log(retorno);
                        res.location('/pagamentos/pagamento/' + pagamento.id);
                        
                        var response = {
                            dados_do_pagamento: pagamento,
                            cartao: retorno,
                            links: [
                                {
                                    href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                    rel: "confirmar",
                                    method: "PUT" 
                                },
                                {
                                    href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                    rel: "cancelar",
                                    method: "DELETE"
                                }
                            ]
                        }
                        
                        res.status(201).json(response);
                        return;
                        
                    });
                    
                } else {
                    
                    res.location('/pagamentos/pagamento/' + pagamento.id);
                    
                    let response = {
                        dados_do_pagamento: pagamento,
                        links: [
                            {
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "confirmar",
                                method: "PUT" 
                            },
                            {
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "cancelar",
                                method: "DELETE"
                            }
                        ]
                    }
                    
                    res.status(201).json(response);
                }            
            });
        });
    }