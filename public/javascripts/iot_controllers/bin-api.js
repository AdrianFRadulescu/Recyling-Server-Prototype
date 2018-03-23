/**
 * Module responsible for handling communications between server and bin server
 * @type {"http"}
 */

const http  = require('http');
const fs    = require('fs');

let binIPs  = fs.readFileSync('./private/resources/bin-ips').toString().split('\n');

let postData = JSON.stringify({led: 0, state: 'on'});

const options = {
    hostname: '',
    port: 4433,
    path: '/led?led=0&state=on',
    method: 'PUT',
    query: {

    }
};


function turnLedOn(binIP, led) {

    // set options for this functionality

    options.query['led'] = led;
    options.query['state'] = 'on';
    options.path = '/led';

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

/**
 * Sends request to specified bin in order to retrieve an image of the item
 * @param binIP
 */

function getImageOfItem(binIP) {

    options.method = 'GET';
    options.path = '/image';


    if (binIPs.indexOf(binIP) > -1) {

        options.hostname = binIP;

        let datetime = new Date();
        let file = fs.createWriteStream("temp_file_" + datetime + ".jpg");

        const req = http.request(options, function (response) {
            response.pipe(file);
            response.on('end', function () {
                console.log('Image received response.');
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

    options.query['led'] = led;
    options.query['state'] = 'off';

    if (binIPs.indexOf(binIP) > -1) {

    } else {
        console.log('invalid IP');
    }

}

/**
 * Sends request to bin in order to retrieve data on the item
 * that needs to be inserted
 * @returns {{}}
 */

function getItemData(binIP) {

    options.method = 'GET';
    options.path = '/data'; pr

    if (binIPs.indexOf(binIP) > -1) {

        options.hostname = binIP;

        let itemDataAsString = ''; // data received from request

        const req = http.request(options, function (response) {
            response.setEncoding('utf8');

            response.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                itemDataAsString += chunk;
            });

            response.on('end', function () {
                console.log('Item data received.');
                console.log(itemDataAsString);
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

    return {};
}

//turnLedOn(binIPs[2], 0);


exports.bin = this;
exports.binIps = binIPs;
exports.turnLedOn = turnLedOn;
exports.turnLedOff = turnLedOff;
exports.getItemData = getItemData;
exports.getImageOfItem = getImageOfItem;