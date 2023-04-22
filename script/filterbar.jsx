"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.queryForFilter = exports.Reset = exports.FilterBar = void 0;
var solid_select_1 = require("@thisbeyond/solid-select");
var solid_js_1 = require("solid-js");
var FilterBar = function (_a) {
    var maps = _a.maps, api = _a.api, onChange = _a.onChange, initialFilter = _a.initialFilter;
    var modes = (0, solid_select_1.createOptions)(["4v4", "6v6", "Highlander"]);
    var mapOptions = (0, solid_select_1.createOptions)(maps, {
        createable: true
    });
    var playerOptions = (0, solid_select_1.createAsyncOptions)(function (search) { return api.searchPlayer(search); });
    var playerFormat = function (player) { return player.name; };
    var _b = (0, solid_js_1.createSignal)(initialFilter.mode, { equals: false }), initialMode = _b[0], setInitialMode = _b[1];
    var _c = (0, solid_js_1.createSignal)(initialFilter.map, { equals: false }), initialMap = _c[0], setInitialMap = _c[1];
    var _d = (0, solid_js_1.createSignal)(initialFilter), filterSet = _d[0], setFilterSet = _d[1];
    (0, solid_js_1.createEffect)(function () { return onChange(filterSet()); });
    return <div class="filter-bar">
        <solid_select_1.Select class="mode" onChange={function (mode) { return setFilterSet(__assign(__assign({}, filterSet()), { mode: mode })); }} initialValue={initialMode()} placeholder="All Types" {...modes}/>
        <exports.Reset reset={function () {
            setInitialMode("");
            onChange(__assign(__assign({}, filterSet()), { mode: "" }));
        }}/>
        <solid_select_1.Select class="maps" onChange={function (map) { return setFilterSet(__assign(__assign({}, filterSet()), { map: map })); }} initialValue={initialMap()} placeholder="All Maps" {...mapOptions}/>
        <exports.Reset reset={function () {
            setInitialMap("");
            console.log(__assign(__assign({}, filterSet()), { map: "" }));
            onChange(__assign(__assign({}, filterSet()), { map: "" }));
        }}/>
        <solid_select_1.Select class="players" initialValue={initialFilter.players} onChange={function (players) { return setFilterSet(__assign(__assign({}, filterSet()), { players: players })); }} multiple placeholder="All Players" format={playerFormat} {...playerOptions}/>
    </div>;
};
exports.FilterBar = FilterBar;
var Reset = function (_a) {
    var reset = _a.reset;
    return <button onMouseDown={reset} class="reset">X</button>;
};
exports.Reset = Reset;
function queryForFilter(filter) {
    var queryParams = new URLSearchParams({
        players: filter.players.map(function (player) { return player.steamid; }).join(','),
        mode: (filter.mode || "").toLowerCase(),
        map: filter.map || ""
    });
    if (filter.uploader) {
        queryParams.set("uploader", filter.uploader);
    }
    return queryParams;
}
exports.queryForFilter = queryForFilter;
