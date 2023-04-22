"use strict";
exports.__esModule = true;
exports.AsyncParser = void 0;
var parser_worker_1 = require("@demostf/parser-worker");
var AsyncParser = /** @class */ (function () {
    function AsyncParser(buffer, progressCallback) {
        this.buffer = buffer;
        this.progressCallback = progressCallback;
    }
    AsyncParser.prototype.cache = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var worker = new Worker(new URL('./ParseWorker.ts', import.meta.url));
            worker.postMessage({
                buffer: _this.buffer
            }, [_this.buffer]);
            worker.onmessage = function (event) {
                if (event.data.error) {
                    reject(event.data.error);
                    return;
                }
                else if (event.data.progress) {
                    _this.progressCallback(event.data.progress);
                    return;
                }
                else if (event.data.demo) {
                    var cachedData = event.data.demo;
                    console.log("packed data: ".concat((cachedData.data.length / (1024 * 1024)).toFixed(1), "MB"));
                    _this.world = cachedData.world;
                    _this.demo = new parser_worker_1.ParsedDemo(cachedData.playerCount, cachedData.buildingCount, cachedData.world, cachedData.header, cachedData.data, cachedData.kills, cachedData.playerInfo, cachedData.tickCount);
                    resolve(_this.demo);
                }
            };
        });
    };
    AsyncParser.prototype.getPlayersAtTick = function (tick) {
        var players = [];
        for (var i = 0; i < this.demo.playerCount; i++) {
            players.push(this.demo.getPlayer(tick, i));
        }
        return players;
    };
    AsyncParser.prototype.getBuildingsAtTick = function (tick) {
        var buildings = [];
        for (var i = 0; i < this.demo.buildingCount; i++) {
            var building = this.demo.getBuilding(tick, i);
            if (building.health > 0) {
                buildings.push(building);
            }
        }
        return buildings;
    };
    AsyncParser.prototype.getKills = function () {
        return this.demo.kills;
    };
    return AsyncParser;
}());
exports.AsyncParser = AsyncParser;
