const axios = require('axios');
const fs = require('fs');
const listaProvas = require('./output.json');
const cheerio = require('cheerio')



function* downloadProva() {
    for (let i = 1500; i < listaProvas.length; i++) {
        yield axios.get(listaProvas[i].url).then(response => {
            let $ = cheerio.load(response.data);
            axios.get($('.pdf_download > li:nth-child(1) > a:nth-child(1)').attr('href'), {
                    responseType: 'arraybuffer'
                })
                .then(response => {
                    fs.writeFileSync('provas/prova' + i + '.pdf', response.data)
                    console.log("prova" + i + " catalogada.");
                    fs.appendFileSync('infoLog.log', "prova" + i + " catalogada.\n");
                })
                .catch(err => {
                    console.log("Ocorreu o erro " + err.message + " na prova" + i);
                    fs.appendFileSync('errorLog.log', "Ocorreu o erro " + err.message + " na prova" + i + "\n");
                })
        });
    }
}

function* downloadGabarito() {
    for (let u = 1500; u < listaProvas.length; u++) {
        if (listaProvas[u].gabarito === undefined) {
            yield fs.appendFileSync('infoLog.log',"Gabarito inexistente para essa prova");
        } else {
            yield axios.get(listaProvas[u].url).then(response => {
                let $ = cheerio.load(response.data);
                axios.get($('.pdf_download > li:nth-child(2) > a:nth-child(1)').attr('href'), {
                        responseType: 'arraybuffer'
                    })
                    .then(response => {
                        fs.writeFileSync('gabaritos/gabarito' + u + '.pdf', response.data)
                        console.log("gabarito" + u + " catalogado.");
                        fs.appendFileSync('infoLog.log', "gabarito" + u + " catalogado.\n");
                    })
                    .catch(err => {
                        console.log("Ocorreu o erro " + err.message + " no gabarito" + u);
                        fs.appendFileSync('errorLog.log', "Ocorreu o erro " + err.message + " no gabarito" + u + "\n");
                    })
            });
        }
    }
}

const generatorProva = downloadProva() 
const refreshProva = setInterval(function name() {
    if (generatorProva.next().done === true) {
        clearInterval(refreshProva);
    }
}, 15000)

const generatorGabarito = downloadGabarito()
const refreshGabarito = setInterval(function name() {
    if (generatorGabarito.next().done === true) {
        clearInterval(refreshGabarito);
    } 
}, 15000)