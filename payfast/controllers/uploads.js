const fs = require('fs');

module.exports = (app) => {
    app.post('/uploads/imagem', (req, res) => {
        console.log("Recebendo imagem");

        const filename = req.headers.filename;
        req.pipe(fs.createWriteStream('files/' + filename))
        .on('finish', () => {
            console.log("Arquivo escrito");
            res.status(201).send('ok');
        });
    });
}