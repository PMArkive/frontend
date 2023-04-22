"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ready_1 = require("./ready");
var header_1 = require("./header");
var time_1 = require("./time");
(0, ready_1.ready)(function () {
    var red_name = document.querySelector(".red input");
    var blue_name = document.querySelector(".blue input");
    var file = document.querySelector(".dropzone input[type=\"file\"]");
    var drop_text = document.querySelector(".dropzone .text");
    var button = document.querySelector(".upload > button");
    var map = document.querySelector(".demo-info .map");
    var time = document.querySelector(".demo-info .time");
    var apiBase = document.querySelector("input[name=\"api\"]").value;
    var key = document.querySelector(".key").textContent;
    var selectedFile = null;
    console.log(key);
    file.addEventListener("change", function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var file, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = event.target.files[0];
                    drop_text.textContent = file.name;
                    return [4 /*yield*/, (0, header_1.parseHeader)(file)];
                case 1:
                    header = _a.sent();
                    if (header.type === "HL2DEMO" && header.game === "tf") {
                        map.textContent = header.map;
                        time.textContent = (0, time_1.formatDuration)(header.duration);
                        button.removeAttribute("disabled");
                        selectedFile = file;
                    }
                    else {
                        drop_text.textContent = "Malformed demo or not a TF2 demo";
                        map.textContent = "";
                        time.textContent = "";
                        button.setAttribute("disabled", "disabled");
                        selectedFile = null;
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    button.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    button.setAttribute("disabled", "disabled");
                    if (!selectedFile) {
                        return [2 /*return*/];
                    }
                    drop_text.textContent = "Uploading...";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = window.location;
                    return [4 /*yield*/, uploadDemo(apiBase, key, red_name.value || 'RED', blue_name.value || 'BLU', selectedFile.name, selectedFile)];
                case 2:
                    _a.href = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    drop_text.textContent = "Error ".concat(e_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
function uploadDemo(apiBase, key, red, blue, name, demo) {
    return __awaiter(this, void 0, void 0, function () {
        var data, response, _a, body, matches;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = new FormData();
                    data.append('key', key);
                    data.append('red', red);
                    data.append('blu', blue);
                    data.append('name', name);
                    data.append('demo', demo, demo.name);
                    return [4 /*yield*/, fetch(apiBase + "upload", {
                            method: 'POST',
                            body: data
                        })];
                case 1:
                    response = _b.sent();
                    if (!(response.status >= 400)) return [3 /*break*/, 3];
                    _a = Error.bind;
                    return [4 /*yield*/, response.text()];
                case 2: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                case 3: return [4 /*yield*/, response.text()];
                case 4:
                    body = _b.sent();
                    matches = body.match(/STV available at: https?:\/\/[^/]+\/(\d+)/);
                    if (matches) {
                        return [2 /*return*/, matches[1]];
                    }
                    else {
                        throw new Error(body);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
