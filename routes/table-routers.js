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


router.use('/', (request, response, next) => {

    if (request.query.hasOwnProperty('query')) {

        let queryData = JSON.parse(request.query.query);

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
            response.locals.queryFields['conditions'] = undefined;
        }

        if (queryData.hasOwnProperty('values')) {
            response.locals.queryFields['values'] = queryData.values;
        }

    }

    next();
});


/**
 * Special handler for shoppings tables
 */


router.get('/shoppings', (request, response) => {

    if (request.query.hasOwnProperty('query') || response.locals.hasOwnProperty('queryFields')) {

        if (response.locals.queryFields.type !== 'select') {
            response.end();
        } else {

            // run select query against mysql db

            db.selectFrom('shoppings', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('not found');
                } else {
                    response.write('found:\n');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });
        }

    } else {

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

            response.end(JSON.stringify({entries: items}));
        });

    }
});


router.post('/shoppings', (request, response) => {



    if (request.query.hasOwnProperty('query') || response.locals.hasOwnProperty('queryFields')) {

        switch (response.locals.queryFields.type) {

            case 'select':

                db.selectFrom('shoppings', response.locals.queryFields, (result) => {

                    if (result === undefined || result.length === 0) {
                        response.end('not found');
                    } else {
                        response.write('found:\n');
                        response.write(JSON.stringify({entries: result}));
                        response.end('\n');
                    }

                });

                break;
            case 'update':
                db.update('shoppings', response.locals.queryFields);
                response.end();
                break;
            case 'insert':
                db.insertInto('shoppings', response.locals.queryFields);
                response.end();
                break;
            case 'delete':
                break;

        }

    } else {

        let userQueryFields = {
            columns: ['item_id'],
            conditions: [
                {column:'user_id', compareOperator: "=", compareValue: request.query.user_id}
            ]
        };


        db.selectFrom('shoppings', userQueryFields, (result) => {

            let shoppings = _.map(result, (item) => {
                return item.item_id;
            });

            response.end(JSON.stringify({entries: shoppings}));
        });

    }

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

            if (result === undefined || result.length === 0) {
                response.end('could not find item by barcode\n');
            } else {

                if (result[0].recyclable) {

                    response.write('item(s) found. RECYCLABLE\n' + 'name: ' + result[0].name + '\n');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                    //response.end(JSON.stringify({items: response}));

                    // local server controlling board

                    //boardAPI.turnLEDOn(1);
                    //setTimeout(function () {boardAPI.turnLEDOff(1);}, 500);

                    // remote server

                    //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                    //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

                } else {

                    response.write('item(s) found.' + ' NOT RECYCLABLE\n');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                    //response.end(JSON.stringify({items: response}));

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

                if (result === undefined || result.length === 0) {
                    response.end('could not find item by barcode\n');
                } else {

                    if (result[0].hasOwnProperty('recyclable') && result[0].recyclable) {

                        response.write('item(s) found. RECYCLABLE\n' + 'name: ' + result[0].name + '\n');
                        response.write(JSON.stringify({entries: result}));
                        response.end('\n');
                        //response.end(JSON.stringify({items: response}));

                        // local server controlling board

                        //boardAPI.turnLEDOn(1);
                        //setTimeout(function () {boardAPI.turnLEDOff(1);}, 500);

                        // remote server

                        //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 0);

                        //setTimeout(() => binAPI.turnLedOff(binAPI.binIps[binAPI.binIps.length - 1], 1), 600);

                    } else {

                        response.write('item(s) found.' + ' NOT RECYCLABLE\n');
                        response.write(JSON.stringify({entries: result}));
                        response.end('\n');
                        //response.end(JSON.stringify({items: response}));
                        //boardAPI.turnLEDOn(0);
                        //setTimeout(function () {bboardAPI.turnLEDOff(0);}, 500);

                        //binAPI.turnLedOn(binAPI.binIps[binAPI.binIps.length - 1], 1);
                    }
                }
            });
            break;
        case 'update':
            db.update('items', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('items', response.locals.queryFields);
            response.end();
            break;
    }
});

router.patch('/items', (request, response) => {

    if (response.locals.queryFields !== 'update') {
        response.end();
    } else {
        db.update('items', response.locals.queryFields);
        response.end();
    }
});

/**
 * Handlers for user tables
 */

router.get('/users', (request, response) => {

    if (response.locals.queryFields.type !== 'select') {
        response.end();
    } else {

        db.selectFrom('users', response.locals.queryFields, (result) => {

            if (result === undefined || result.length === 0) {
                response.end('user not found');
            } else {
                response.write('user(s) found');
                response.write(JSON.stringify({entries: result}));
                response.end('\n');
            }

        });

    }
});


router.post('/users', (request, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('users', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('user not found');
                } else {
                    response.write('user(s) found');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });

            break;
        case 'update':
            db.update('users', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('users', response.locals.queryFields);
            response.end();
            break;
    }

});


/**
 * Handlers for vouchers tables
 */


router.get('/vouchers', (request, response) => {

    if (response.locals.queryFields.type !== 'select') {
        response.end();
    } else {

        db.selectFrom('vouchers', response.locals.queryFields, (result) => {

            if (result === undefined || result.length === 0) {
                response.end('voucher not found');
            } else {
                response.write('voucher(s) found');
                response.write(JSON.stringify({entries: result}));
                response.end('\n');
            }

        });

    }
});


router.post('/vouchers', (request, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('vouchers', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('voucher not found');
                } else {
                    response.write('voucher(s) found');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });

            break;
        case 'update':
            db.update('vouchers', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('vouchers', response.locals.queryFields);
            response.end();
            break;
    }

});


/**
 * Handlers for products table
 */


router.get('/products', (request, response) => {

    if (response.locals.queryFields.type !== 'select') {
        response.end();
    } else {

        db.selectFrom('products', response.locals.queryFields, (result) => {

            if (result === undefined || result.length === 0) {
                response.end('products not found');
            } else {
                response.write('product(s) found');
                response.write(JSON.stringify({entries: result}));
                response.end('\n');
            }

        });

    }
});


router.post('/products', (request, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('products', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('product(s) not found');
                } else {
                    response.write('product(s) found');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });

            break;
        case 'update':
            db.update('products', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('products', response.locals.queryFields);
            response.end();
            break;
    }

});


/**
 * Handlers for shops table
 */


router.get('/shops', (request, response) => {

    if (response.locals.queryFields.type !== 'select') {
        response.end();
    } else {

        db.selectFrom('shops', response.locals.queryFields, (result) => {

            if (result === undefined || result.length === 0) {
                response.end('shop(s) not found');
            } else {
                response.write('shop(s) found');
                response.write(JSON.stringify({entries: result}));
                response.end('\n');
            }

        });

    }
});


router.post('/shops', (request, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('shops', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('shop(s) not found');
                } else {
                    response.write('shop(s) found');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });

            break;
        case 'update':
            db.update('shops', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('shops', response.locals.queryFields);
            response.end();
            break;
    }

});


/**
 * Handlers for recycling_logs table
 */


router.get('/recycling_logs', (request, response) => {

    if (response.locals.queryFields.type !== 'select') {
        response.end();
    } else {

        db.selectFrom('recycling_logs', response.locals.queryFields, (result) => {

            if (result === undefined || result.length === 0) {
                response.end('log(s) not found');
            } else {
                response.write('log(s) found');
                response.write(JSON.stringify({entries: result}));
                response.end('\n');
            }

        });
    }
});


router.post('/recycling_logs', (request, response) => {

    switch (response.locals.queryFields.type) {

        case 'select':

            db.selectFrom('recycling_logs', response.locals.queryFields, (result) => {

                if (result === undefined || result.length === 0) {
                    response.end('log(s) not found');
                } else {
                    response.write('log(s) found');
                    response.write(JSON.stringify({entries: result}));
                    response.end('\n');
                }

            });

            break;
        case 'update':
            db.update('recycling_logs', response.locals.queryFields);
            response.end();
            break;
        case 'insert':
            db.insertInto('recycling_logs', response.locals.queryFields);
            response.end();
            break;
    }

});



module.exports = router;

///.../tables/tablename?type=select&columns={}&conditions={};