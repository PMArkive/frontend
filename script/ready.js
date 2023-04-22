"use strict";
exports.__esModule = true;
exports.ready = void 0;
function ready(cb) {
    if (document.readyState === "complete") {
        cb();
    }
    else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}
exports.ready = ready;
