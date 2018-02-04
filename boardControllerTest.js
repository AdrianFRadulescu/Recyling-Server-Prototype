
const jFive = require('johnny-five')

var board = new jFive.Board(),
    led,
    toggleState = false;

board.on("ready", function() {
    console.log('Board Ready')

    this.pinMode(13, this.MODES.OUTPUT);
    this.digitalWrite(13,0);

    this.loop(500, () => {
        this.digitalWrite(13, toggleState? 1 : 0);
    })
}) 


function turnLEDOn() {
    toggleState = true;
}

function turnLEDOff() {
    toggleState = false;
}

exports.board = board
exports.turnLEDOn = turnLEDOn
exports.turnLEDOff = turnLEDOff

turnLEDOn(board);
turnLEDOff(board);