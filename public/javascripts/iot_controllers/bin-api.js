/**
 * Module responsible for handling communications between server and bin server
 * @type {"http"}
 */

const http  = require('http');
const fs    = require('fs');

var binIPs  = fs.readFileSync('./private/resources/bin-ips').toString().split('\n');

var postData = JSON.stringify({led: 0, state: 'on'});

const options = {
    hostname: '',
    port: 4433,
    path: '/?led=0&state=on',
    method: 'PUT',
    query: {
        led: 0, state: 'on'
    }
};

function turnLedOn(binIP, led) {

    if (binIPs.indexOf(binIP) > -1) {

        options.hostname = binIP;

        const req = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
            response.on('end', function () {
                console.log('No more data in response.');
            });
        });

        req.on('error', function (err) {
            console.error('problem with request: ${err.message}');
        });

        // write data to request body
        //req.write(postData);
        req.end();

    } else {
        console.log('invalid IP');
    }

}

function turnLedOff(binIP, led) {

    if (binIPs.indexOf(binIP) > -1) {

    } else {
        console.log('invalid IP');
    }

}

//turnLedOn(binIPs[2], 0);


exports.bin = this;
exports.binIps = binIPs;
exports.turnLedOn = turnLedOn;
exports.turnLedOff = turnLedOff;