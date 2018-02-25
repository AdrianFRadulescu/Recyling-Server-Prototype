/**
 * Provides a router that handles request for the tables existing in the database
 * @type {createApplication|*}
 */

const express = require('express');
const _ = require('underscore');
const $ = require('jquery');


const dbAPI     = require('../public/javascripts/data_storage/database-api');
//const boardAPI  = require('../public/javascripts/iot_controllers/board-api');
const binAPI    = require('../public/javascripts/iot_controllers/bin-api');

const router = express.Router();
const db = new dbAPI.DBInterface(dbAPI.DB_DEFAULT_DESCIRPTON);

// simple handling for checking if and item is recyclable or not based on its barcode
/*
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

    let selectCallback = function (result) {

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
                //setTimeout(function () {boardAPI.turnLEDOff(0);}, 500);

                binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
            }
        }
    };

    db.selectFrom('items', queryFields, selectCallback);

});

router.post('/items', function (request, response) {

    console.log(request);

    if (request.query.type === 'select') {

        if (!isNaN(request.query.barcode)) {
            request.query.barcode = parseInt(request.query.barcode);
            console.log('query:' + request.query.barcode);
        }

        let queryFields = {columns: ['item_id', 'name', 'IF (value > 0, 1, 0) as recyclable']};

        queryFields['conditions'] = [
            {column: 'barcode', compareOperator: '=', compareValue: request.query.barcode}
        ];

        let selectCallback = function (result) {

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
*/

/**
 * Query json format:
 *
 * query = {
 *
 *  "type": "select"/"update"/"insert"
 *  "columns": ["item_id", "barcode", "IF(value > 0, TRUE, FALSE) as recyclable'"]
 *  "conditions": [
 *      { "column": "item_id", "compareOperator": '>', "compareValue": 1 },
 *      { "binaryOperator": "and" },
 *      { "column": 'item_id', "compareOperator": '<', "compareValue": 7 }
 *  ]
 * }
 *
 */



/*
 *  Middleware for HTTP requests
 */

router.use('/items', (request, response, next) => {
    response.locals.table = 'items';
    next();
});

router.use('/users', (request, response, next) => {
    response.locals.table = 'users';
    next();
});

router.use('/products', (request, response, next) => {
    response.locals.table = 'products';
    next();
});

router.use('/recycling_logs', (request, response, next) => {
    response.locals.table = 'recycling_logs';
    next();
});

router.use('/shops', (request, response, next) => {
    response.locals.table = 'shops';
    next();
});

router.use('/vouchers', (request, response, next) => {
    response.locals.table = 'vouchers';
    next();
});

router.use('/shoppings', (request, response, next) => {
    response.locals.table = 'shoppings';
    next();
});

/**
 * Special handler for shoppings tables
 */

router.get('/bla', (request, response, next) => {

    console.log(request.query.a);

});

router.get('/shoppings', (request, response, next) => {

    let userQueryFields = {
        columns: ['item_id'],
        conditions: [
            {column:'user_id', compareOperator: "=", compareValue: request.query.user_id}
        ]
    };

    db.selectFrom('shoppings', userQueryFields, (result) => {

        let items = _.map(result, (item) => {
            return item.item_id;
        });

        console.log(items);

        response.end(JSON.stringify({items: items}));
    });


});


router.post('/shoppings', (request, response, next) => {

    let userQueryFields = {
        columns: ['item_id'],
        conditions: [
            {column:'user_id', compareOperator: "=", compareValue: request.query.user_id}
        ]
    };

    db.selectFrom('shoppings', userQueryFields, (result) => {

        let items = _.map(result, (item) => {
            return item.item_id;
        });

        console.log(items);

        response.end(JSON.stringify({items: items}));
    });

});

router.use('/', (request, response, next) => {


    console.log(response.locals.table + '\n');
    console.log(request.query.query + '\n');
    let queryData = JSON.parse(request.query.query);
    console.log(queryData);
    //console.log(response.locals.table);
    // format the sql request fields

    response.locals.queryFields = {type: queryData.type};

    if (queryData.hasOwnProperty('columns')) {
        // add columns
        response.locals.queryFields['columns'] = queryData.columns;
    } else {
        response.locals.queryFields['columns'] = "*";
    }

    if (queryData.hasOwnProperty('conditions')) {

        response.locals.queryFields['conditions'] = [];

        _.forEach(queryData.conditions,
            function (condition) {
                response.locals.queryFields['conditions'].push(condition);
            }
        );

    } else {
        response.locals.queryFields['conditions']= undefined;
    }

    //if (request.hasOwnProperty())

    next();
});

/**
 * Handles get request for items table
 */

router.get('/items', (request, response) => {

    console.log(response.locals.queryFields);

    if (response.locals.queryFields.type !== 'select') {
        response.end('');
    } else {

        db.selectFrom('items', response.locals.queryFields, (result) => {
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

                    //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                    //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

                } else {
                    response.end('item found.' + ' NOT RECYCLABLE\n');

                    //boardAPI.turnLEDOn(0);
                    //setTimeout(function () {bboardAPI.turnLEDOff(0);}, 500);

                    //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
                }
            }
        });

    }

});

router.post('/items', (request, response) => {


    console.log('--------------------');
    console.log(response.locals.queryFields);
    console.log('--------------------');

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('items', response.locals.queryFields, (result) => {
                console.log(result);

                if (result.length === 0) {
                    response.end('could not find item by barcode\n');
                } else {

                    if (result[0].recyclable) {

                        response.send('item found. RECYCLABLE\n' + 'name: ' + result[0].name);

                        // local server controlling board

                        //boardAPI.turnLEDOn(1);
                        //setTimeout(function () {boardAPI.turnLEDOff(1);}, 500);

                        // remote server

                        //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                        //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

                    } else {
                        response.end('item found.' + ' NOT RECYCLABLE\n');

                        //boardAPI.turnLEDOn(0);
                        //setTimeout(function () {bboardAPI.turnLEDOff(0);}, 500);

                        //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
                    }
                }
            });
            break;
        case 'update':
            db.update('items', response.locals.queryFields);
            break;
    }
});

router.patch('/items', (request, response) => {

    if (response.locals.queryFields !== 'update') {
        response.end('');
    } else {
        db.update('items', response.locals.queryFields);
    }
});

/**
 * Handlers for user tables
 */

router.get('/users', (request, response) => {
    if (response.locals.queryFields.type !== 'select') {
        response.end('');
    } else {

    }
});


router.post('/users', (resquest, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('users', response.locals.queryFields, (result) => {

                if (result) {

                }

            });

            break;
        case 'update':
            break;
        case 'insert':
            break;
    }

});

module.exports = router;

///.../tables/tablename?type=select&columns={}&conditions={};