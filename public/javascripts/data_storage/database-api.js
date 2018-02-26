/**
 * This is a prototype module for manipulating a recycling database
 *
 */

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const sanitize = require('sanitize-string');
const _ = require('underscore');
const $ = require('jquery');
const fs = require('fs');

const SQL_NULL = require("mysql/lib/protocol/constants/types").NULL;

//const _ = require('underscore');

// the default log for the database admin

const defaultDescription = {
            host    : 'Radulescus-MacBook-Pro.local',
            user    : 'mockadmin',
            password: fs.readFileSync('./private/resources/db_pass'),                // worst way ever to keep the password, don't forget to change it
            database: 'prototype_database'
};

/**
 * Acts like an mediator between server and database
 */

const DBInterface = (function () {

    function RecyclingDatabase(_dbDescription) {

        if (_dbDescription === {}) {
            this.dbDescription = defaultDescription;
        } else
            this.dbDescription = _dbDescription;

        testConnection({dbDescription: this.dbDescription});

        console.log("database interface successfully created");
    }

    // private functions

    /**
     * Creates a connection to the specified database
     */

    function connectToDatabase(parameters) {

        const dbDescription = parameters.dbDescription;

        let dbConnection = mysql.createConnection(dbDescription);
        dbConnection.connect();

        console.log('connected to database');

        return dbConnection;
    }

    /**
     * Closes connection to a previously specified database
     * @param dbConnection
     */

    function closeConnection(dbConnection) {
        dbConnection.end();
        console.log('connection closed');
    }

    /**
     *  Tests if the connection to the database works
     */

    function testConnection (parameters) {

        let dbConnection = null;

        try {

            console.log("testing connection");
            dbConnection = connectToDatabase({dbDescription: parameters.dbDescription});

            console.log("connection works");

        } catch (err) {

            console.log(err.message);
            return false;
        }


        if (dbConnection != null) try {
            console.log('closing test connection');
            closeConnection(dbConnection);
            console.log('connection closed');
        } catch (err) {
            console.log(err.message);
            return false;
        }


        return true;
    }

    /**
     * Converts a given object into database supported operations
     * @param  jsonObj
     */

    function jsonToSQL(jsonObj) {

        let sql = '';

        /**
         * Uses mysql.escape to sanitize given values
         * @param value
         * @returns {*}
         */

        let sanitizeValue = function (value) {

            if (mysql.escape(value) === '' + value) {
                return value;
            } else {
                return mysql.escape(value).slice(1,-1);
            }

        };

        /**
         * Adds conditions to a given sql statement
         * @param conditions
         * @param sql
         * @returns {*}
         */

        let addConditions = function (conditions, sql) {

            // add conditions if any

            if (conditions !== undefined) {

                // conditions need to be added

                sql += ' WHERE ';

                conditions.forEach(function (condition) {

                    if (condition.hasOwnProperty('binaryOperator')) {
                        sql += sanitizeValue(condition.binaryOperator)  + ' ';
                    } else {
                        sql += sanitizeValue(condition.column)  + ' ' + sanitizeValue(condition.compareOperator)  + ' ' + (typeof(condition.compareValue) === 'string' ?"'" + sanitizeValue(condition.compareValue)  + "'": sanitizeValue(condition.compareValue)) + ' ';
                    }
                });
            }

            return sql;
        };

        switch (jsonObj.queryType) {

            case 'SELECT':
                sql += 'SELECT ';

                // add tables fields

                //console.log(jsonObj.selectQueryFields.tableFields);

                jsonObj.selectQueryFields.columns.forEach(function (value) {
                    sql += sanitizeValue(value)  + ', ';
                });

                // add table name

                sql = sql.slice(0, -2) + ' FROM ' + sanitizeValue(jsonObj.tableName)  + ' ';

                // add conditions if any

                sql = addConditions(jsonObj.selectQueryFields.conditions, sql);

                sql += ';';

                break;

            case 'INSERT':
                sql += 'INSERT INTO ' + sanitizeValue(jsonObj.tableName)  + ' VALUES(';

                // insert values into query

                jsonObj.insertQueryValues.forEach(function (value) {

                    if (value == null)
                        sql += 'NULL,';
                    else
                        sql += (typeof(value) === 'string'? '"' + sanitizeValue(value)  + '"': sanitizeValue(value))  + ',';
                });

                if (jsonObj.tableName === 'recycling_logs')
                    // add the NOW() function to calculate date and time for the recycling log
                    sql += 'NOW()';
                else
                    sql = sql.slice(0, -1);

                sql += ');';
                break;

            case 'DELETE':

                sql += 'DELETE FROM ' + sanitizeValue(jsonObj.tableName) + ' ';

                sql = addConditions(jsonObj.deleteQueryFields.conditions, sql);

                sql += ';';

                break;

            case 'UPDATE':
                sql += 'UPDATE ' + sanitizeValue(jsonObj.tableName) + ' SET ';

                // add column names and new values

                _.zip(jsonObj.updateQueryFields.columns, jsonObj.updateQueryFields.values).forEach(
                    function (pair) {
                        sql += sanitizeValue(pair[0]) + ' = ' + (typeof(sanitizeValue(pair[1])) === 'string'? "'" + sanitizeValue(pair[1]) + "'": sanitizeValue(pair[1])) + ', ';
                    }
                );

                sql = sql.slice(0, -2);

                // add conditions if any

                sql = addConditions(jsonObj.updateQueryFields.conditions, sql);

                sql += ';';

                console.log(sql);

                break;

        }


        return sql;
    }


    /**
     * Inserts the values from the values array as a new entry in the given table
     * @param {string} table  = the given table
     * @param {{array}} queryFields  = the array of values to be inserted
     */

    RecyclingDatabase.prototype.insertInto = function (table, queryFields) {

        let dbConnection = connectToDatabase({dbDescription: this.dbDescription});

        console.log(queryFields.values);

        const sql = jsonToSQL({queryType: 'INSERT', tableName: table, insertQueryValues: queryFields.values});

        // console.log(sql);

        dbConnection.query(sql, (err) => {

            if (err) throw err;
            else console.log(table.slice(0, -1) + ' inserted');

            closeConnection(dbConnection);
        });


    };


    /**
     * Creates an sql statement to meet given requirements and runs it against the specified table
     * and uses it in the specified callback operation
     * @param {string} table = the name of the table
     * @param queryFields    =
     * @param use            = the callback function that uses the result
     * @returns {undefined}
     */

    RecyclingDatabase.prototype.selectFrom = function (table, queryFields, use) {

        let dbConnection = connectToDatabase({dbDescription: this.dbDescription});

        const sql = jsonToSQL({queryType: 'SELECT', tableName: table, selectQueryFields: queryFields});

        console.log(sql);

        dbConnection.query(sql, (err, response) => {

            if (err) throw err;
            //console.log(response);

            let result = _.map(Object.keys(response), function (key)  {
                return response[key];
            });

            // pass the result to the callback that is supposed to use it
            use(result);

            closeConnection(dbConnection);
        });
    };

    /**
     * Updates the content of the specified table
     * @param table
     * @param queryFields
     */

    RecyclingDatabase.prototype.update = function(table, queryFields) {

        let dbConnection = connectToDatabase({dbDescription: this.dbDescription});

        const sql = jsonToSQL({queryType: 'UPDATE', tableName: table, updateQueryFields: queryFields});

        dbConnection.query(sql, (err)  => {

            if (err) throw err;

            console.log('values were update to ' + _.zip(queryFields.columns, queryFields.values));

            closeConnection(dbConnection);
        });


    };

    RecyclingDatabase.prototype.deleteFrom = function (table, queryFields) {

        let dbConnection = connectToDatabase({dbDescription: this.dbDescription});

        const sql = jsonToSQL({queryType: 'DELETE', tableName: table, deleteQueryFields: queryFields});

        dbConnection.query(sql, (err) => {

            if (err) throw err;

            console.log('records deleted');

            closeConnection(dbConnection);
        });
    };


    return RecyclingDatabase;
})();


// testing

const db = new DBInterface(defaultDescription);


//db.insertInto('items', {values: [5,'chio',null,0]});
/*
db.deleteFrom('users', {
    conditions: [
        {column: 'user_id', compareOperator: '=', compareValue: 5}
    ]
});

/*
db.selectFrom('users', {"columns": ['user_id', 'email', 'balance'], conditions: undefined});
db.selectFrom('users', {columns: ['user_id', 'email', 'balance'],
    conditions: [
        {column: 'user_id', compareOperator: '<=', compareValue: 3},
        {binaryOperator: 'and'},
        {column: 'email', compareOperator: 'LIKE', compareValue:'llvb%'}
    ]
});
*/
/*
db.selectFrom('items', {columns: ['item_id', 'name', ' IF(value > 0, TRUE, FALSE) as recyclable'],
    conditions: [
        {column: 'item_id', compareOperator: '>', compareValue: 1},
        {binaryOperator: 'and'},
        {column: 'item_id', compareOperator: '<', compareValue: 7}
    ]
}, function (param) {
    console.log(param);
});


/*
db.selectFrom('users', {columns: ['*'],
    conditions: [
        {column: 'user_id', compareOperator: '<=', compareValue: 3},
        {binaryOperator: 'AND'},
        {column: 'email', compareOperator: 'LIKE', compareValue:'l%'}
    ]
}, function (value) { console.log(value);});
*/


//setTimeout(function() {console.log('asas' + selectResult);}, 6000);



/*
db.update('users', {
    columns: ['user_id', 'balance'],
    values: ['150'],
    conditions: [
        {column: 'first_name', compareOperator: 'LIKE',compareValue: '%Guts%'},
    ]
});
*/

exports.DBInterface = DBInterface;
exports.SQL_NULL = SQL_NULL;
exports.DB_DEFAULT_DESCIRPTON = defaultDescription;