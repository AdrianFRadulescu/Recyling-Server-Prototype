
const five = require('johnny-five');
const fs = require('fs');
const math = require('math');
//const opencv = require('opencv');


let board = new five.Board(),
    led,
    toggleState = false;

let ledToBeControlled = 0;

let fsr, metalTouch;

let currentForceDiff = 0;
let currentMetalDiff = 0;



board.on("ready", function() {

    console.log('Board Ready');

    this.pinMode(12, this.MODES.OUTPUT);
    this.pinMode(13, this.MODES.OUTPUT);
    this.digitalWrite(12 + ledToBeControlled,0);

    const self = this;

    this.loop(500, function () {
        self.digitalWrite(12 + ledToBeControlled, toggleState? 1 : 0);
    });


    // Create a new `fsr` hardware instance.
    fsr = new five.Sensor({
        pin: "A0",
        freq: 25
    });

    fsr.scale([0, 255]).on("data", function() {

        // set the led's brightness based on force
        // applied to force sensitive resistor

        if (this.scaled) {
            console.log(this.scaled);
            console.log(this.value);
            //console.log('\n');
        }

        currentForceDiff = this.scaled;

        //led.brightness(this.scaled);
    });


    // create new metal touch
    metalTouch = new five.Sensor({
        pin:'A1',
        freq: 25,
        threshold: 1
    });
    
    metalTouch.on('data', function () {
        console.log(Math.abs(metalTouch.fscaleTo(0,180) - 179));
        //fs.appendFile('metal-readings1.txt', Math.abs(metalTouch.scaleTo(0,180) - 179) + '\n' ,(err) => {
        //    if (err) throw err;
        //});

        currentMetalDiff = Math.abs(metalTouch.fscaleTo(0,180) - 179);
    });
});

function turnLEDOn(whichLED) {
    ledToBeControlled = (parseInt(whichLED) === 0? 0 : 1);
    toggleState = true; 
}

function turnLEDOff(whichLED) {
    ledToBeControlled = (parseInt(whichLED) === 0? 0 : 1);
    toggleState = false;
}

function getForceReading() {
    return currentForceDiff;
}

function getMetalReadings() {
    return currentMetalDiff;
}


turnLEDOff(0);
turnLEDOff(1);

//turnLEDOn(0);



exports.Board = board;
exports.turnLEDOn = turnLEDOn;
exports.turnLEDOff = turnLEDOff;