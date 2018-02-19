
const five = require('johnny-five');

var board = new five.Board(),
    led,
    toggleState = false;

var ledToBeControlled = 0;

board.on("ready", function() {

    console.log('Board Ready');

    this.pinMode(12, this.MODES.OUTPUT);
    this.pinMode(13, this.MODES.OUTPUT);
    this.digitalWrite(12 + ledToBeControlled,0);

    const self = this;

    this.loop(500, function () {
        self.digitalWrite(12 + ledToBeControlled, toggleState? 1 : 0);
    })
});



function turnLEDOn(whichLED) {
    ledToBeControlled = (parseInt(whichLED) === 0? 0 : 1);
    toggleState = true; 
}

function turnLEDOff(whichLED) {
    ledToBeControlled = (parseInt(whichLED) === 0? 0 : 1);
    toggleState = false;
}


turnLEDOff(0);
turnLEDOff(1);

exports.Board = board;
exports.turnLEDOn = turnLEDOn;
exports.turnLEDOff = turnLEDOff;