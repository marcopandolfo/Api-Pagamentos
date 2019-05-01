const fs = require('fs');

fs.readFile("imagem.jpg", (erro, buffer) => {
    console.log("Arquivo lido");
    
    fs.writeFile('imagem2.jpg', buffer, (erro) => {
        console.log('Arquivo escrito'); 
    });
});