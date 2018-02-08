
const jFive = require('johnny-five')

var board = new jFive.Board(),
    led,
    toggleState = false;

var ledToBeControlled = 0;

board.on("ready", function() {
    console.log('Board Ready')

    this.pinMode(12, this.MODES.OUTPUT);
    this.pinMode(13, this.MODES.OUTPUT);
    this.digitalWrite(12 + ledToBeControlled,0);

    this.loop(500, () => {
        this.digitalWrite(12 + ledToBeControlled, toggleState? 1 : 0);
    })
}) 


function turnLEDOn(whichLED) {
    ledToBeControlled = (whichLED == '0'? 0 : 1);
    toggleState = true; 
}

function turnLEDOff(whichLED) {
    ledToBeControlled = (whichLED == '0'? 0 : 1);
    toggleState = false;
}

exports.board = board
exports.turnLEDOn = turnLEDOn
exports.turnLEDOff = turnLEDOff