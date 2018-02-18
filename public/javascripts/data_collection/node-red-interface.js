const RED = require('node-red');
const EventEmitter = require('events');
const util = require('util');
//const dbinterface = require('../data_storage/database-api.js');



console.log(RED.version());

var x = -1;

var f = function (y) {


    y += x;

    console.log(y);
};


var e = new EventEmitter();

e.on('m', function () {

    var ab = -9;

    f(ab);

});


e.emit('m');