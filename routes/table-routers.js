/**
 * Provides a router that handles request for the tables existing in the database
 * @type {createApplication|*}
 */

const express = require('express');
const _ = require('underscore');


const dbAPI     = require('../public/javascripts/data_storage/database-api');
//const boardAPI  = require('../public/javascripts/iot_controllers/board-api');
const binAPI    = require('../public/javascripts/iot_controllers/bin-api');

var router = express.Router();
const db = new dbAPI.DBInterface(dbAPI.DB_DEFAULT_DESCIRPTON);

// simple handling for checking if and item is recyclable or not based on its barcode

router.get('/items', function (request, response) {

    console.log('query:' + request.query.barcode);

    if (!isNaN(request.query.barcode)) {
        request.query.barcode = parseInt(request.query.barcode);
        console.log('query:' + request.query.barcode);
    }
    console.log('query:' + request.query.barcode);

    var queryFields = {columns: ['item_id', 'name', 'IF (value > 0, 1, 0) as recyclable']};

    queryFields['conditions'] = [
        {column: 'barcode', compareOperator: '=', compareValue: request.query.barcode}
    ];

    var selectCallback = function (result) {

        console.log(result);

        if (result.length === 0) {
            response.end('could not find item by barcode\n');
        } else {

            if (result[0].recyclable) {
                response.send('item found. RECYCLABLE\n' + 'name: ' + response.name);

                // local server controlling board

                //boardAPI.turnLEDOn(1);
                //setTimeout(function () {boardAPI.turnLEDOff(1);}, 500);

                // remote server

                binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

            } else {
                response.end('item found.' + ' NOT RECYCLABLE\n');

                //boardAPI.turnLEDOn(0);
                //setTimeout(function () {bboardAPI.turnLEDOff(0);}, 500);

                binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
            }
        }
    };

    db.selectFrom('items', queryFields, selectCallback);

});

router.post('/items', function (request, response) {

    if (request.query.type === 'select') {

        if (!isNaN(request.query.barcode)) {
            request.query.barcode = parseInt(request.query.barcode);
            console.log('query:' + request.query.barcode);
        }

        var queryFields = {columns: ['item_id', 'name', 'IF (value > 0, 1, 0) as recyclable']};

        queryFields['conditions'] = [
            {column: 'barcode', compareOperator: '=', compareValue: request.query.barcode}
        ];

        var selectCallback = function (result) {

            console.log(result);

            if (result.length === 0) {

                response.end('could not find item by barcode\n');


            } else {

                if (result[0].recyclable) {
                    response.send('item found. RECYCLABLE\n' + 'name: ' + response.name);

                    // local server controlling board

                    //boardAPI.turnLEDOn(1);
                    //setTimeout(function () {boardAPI.turnLEDOff(1);}, 500);

                    // remote server

                    binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                    //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

                } else {
                    response.end('item found.' + ' NOT RECYCLABLE\n');

                    //boardAPI.turnLEDOn(0);
                    //setTimeout(function () {bboardAPI.turnLEDOff(0);}, 500);

                    binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
                }
            }
        };

        db.selectFrom('items', queryFields, selectCallback);
    } else {

        db.insertInto('items', {values: []})

    }
});




/// more advanced with middleware is comming

/*
 *  Middleware for HTTP requests
 */
/*
router.use('/items', function (request, response, next) {
    response.locals.table = 'items';
    next()
});

router.use('/users', function (request, response, next) {
    response.locals.table = 'users';
    next()
});

router.use('/products', function (request, response, next) {
    response.locals.table = 'products';
    next()
});

router.use('/recycling_logs', function (request, response, next) {
    response.locals.table = 'recycling_logs';
    next()
});

router.use('/shops', function (request, response, next) {
    response.locals.table = 'shops';
    next()
});

router.use('/vouchers', function (request, response, next) {
    response.locals.table = 'vouchers';
    next()
});

router.use('/', function(request, response, next) {

    console.log(request.query);
    console.log(response.locals.table);
    // format the sql request fields

    response.locals.queryFields = {type: request.query.type};

    if (request.query.hasOwnProperty('columns')) {
        // add columns
        response.locals.queryFields['columns'] = request.quey.columns.split(',');
    } else {
        response.locals.queryFields['columns'] = "*";
    }

    if (request.query.hasOwnProperty('conditions')) {

        response.locals.queryFields['conditions'] = [];

        _.forEach(request.query.conditions,
            function (condition) {
                response.locals.queryFields['conditions'].push(condition);
            }
        );

    } else {
        response.locals.queryFields['conditions']= undefined;
    }

    if (request.hasOwnProperty())

    console.log(request.query);

    next();
});


router.get('/', function (request, response) {

    console.log(response.locals.queryFields);

    switch (response.locals.queryFields) {

    }
});

router.post('/', function (request, response) {

});
*/


module.exports = router;
