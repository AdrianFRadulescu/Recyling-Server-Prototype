const express = require('express')
const parser = require('body-parser')
const boardController = require('./boardControllerTest')
const app = express()
const port = 3000

app.get('/', (request, response) => {
    console.log('req received')
    console.log(request)
    console.log(request.query)
    
    if (request.query.yolo == 'true') {
        boardController.turnLEDOn();
        response.send('LED turned On');
    }
    else {
        boardController.turnLEDOff();
        response.send('LED turned Off');
    }
    response.end('get some Lene')
})

app.post(/.*/, (request, response) => {
    console.log('post received')
    
    console.log(request)
    console.log(request.query)
    
    if (request.query.yolo == 'true') {
        boardController
    .turnLEDOn();
        response.send('LEDturned On');
    }
    else {
        boardController
    .turnLEDOff();
        response.send('LED turned Off');
    }

    response.end('Lene2')
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
