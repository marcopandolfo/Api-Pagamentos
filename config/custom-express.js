const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

module.exports = () => {
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    //Obrigatoriamente logo apos o bodyParser
    app.use(expressValidator());

    consign()
    .include('controllers')
    .include('persistencia')
    .into(app);

    return app;
}