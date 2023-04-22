"use strict";
exports.__esModule = true;
exports.formatDuration = void 0;
function formatDuration(input) {
    if (!input) {
        return '0:00';
    }
    var hours = Math.floor(input / 3600);
    var minutes = Math.floor((input - (hours * 3600)) / 60);
    var seconds = Math.floor(input - (hours * 3600) - (minutes * 60));
    var hourString = (hours < 10) ? "0" + hours : "" + hours;
    var minuteString = (minutes < 10) ? "0" + minutes : "" + minutes;
    var secondString = (seconds < 10) ? "0" + seconds : "" + seconds;
    if (hourString !== '00') {
        return hourString + ':' + minuteString + ':' + secondString;
    }
    else {
        return minuteString + ':' + secondString;
    }
}
exports.formatDuration = formatDuration;
