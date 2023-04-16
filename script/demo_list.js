import {render} from "solid-js/web";
import {ready} from "./ready";
import {FilterBar} from "./filterbar"
import {Api} from "./api";

ready(() => {
    const filterBar = document.getElementById('filter-bar');
    const maps = filterBar.dataset.maps.split(",");
    const apiBase = filterBar.dataset.apiBase;
    const api = new Api(apiBase);
    const demoListBody = document.querySelector('.demolist tbody');

    render(() => <FilterBar maps={maps} api={api} onChange={onFilter.bind(null, api, demoListBody)}/>, filterBar);
});

let lastFilter = {
    mode: "",
    map: "",
    players: []
};

const filterEq = (a, b) => {
    return (a.mode || "") === (b.mode || "")
        && (a.map || "") === (b.map || "")
        && a.players.length === b.players.length && b.players.every(player => a.players.includes(player))
}

const onFilter = async (api, demoListBody, filter) => {
    if (filterEq(lastFilter, filter)) {
        return;
    }
    lastFilter = filter;

    let queryParams = new URLSearchParams({
        players: filter.players.map(player => player.id).join(','),
        mode: (filter.mode || "").toLowerCase(),
        map: filter.map || "",
    });
    const response = await fetch("/fragments/demo-list?" + queryParams);
    document.querySelector('.demolist tbody').innerHTML = await response.text();
}