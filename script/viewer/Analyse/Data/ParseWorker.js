"use strict";
exports.__esModule = true;
var parser_worker_1 = require("@demostf/parser-worker");
/**
 * @global postMessage
 * @param event
 */
onmessage = function (event) {
    var buffer = event.data.buffer;
    var bytes = new Uint8Array(buffer);
    (0, parser_worker_1.parseDemo)(bytes, function (progress) {
        postMessage({
            progress: progress
        });
    }).then(function (parsed) {
        postMessage({
            demo: parsed
        }, [parsed.data.buffer]);
    })["catch"](function (e) {
        console.error(e);
        postMessage({
            error: e.message
        });
    });
};
