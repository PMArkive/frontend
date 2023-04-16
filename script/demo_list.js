import {render} from "solid-js/web";
import {ready} from "./ready";
import {FilterBar} from "./filterbar"
import {Api, SteamId} from "./api";

let lastFilter = {
    mode: "",
    map: "",
    uploader: "",
    players: [],
};

ready(async () => {
    const filterBar = document.getElementById('filter-bar');
    const maps = filterBar.dataset.maps.split(",");
    const apiBase = filterBar.dataset.apiBase;
    const api = new Api(apiBase);
    const demoListBody = document.querySelector('.demolist tbody');
    const searchParams = new URLSearchParams(window.location.search);
    const steamIds = (searchParams.get("players") || "").split(",").filter(id => id);
    let players = [];

    if (window.location.href.includes("profiles/")) {
        const [, profile] = window.location.href.split("profiles/");
        steamIds.push(profile);
    }

    if (steamIds.length) {
        players = await Promise.all(steamIds.map(steamId => api.getPlayer(steamId)));
    }

    lastFilter = {
        mode: searchParams.get("mode") || "",
        map: searchParams.get("map") || "",
        uploader: "",
        players,
    };

    if (window.location.href.includes("uploads/")) {
        [, lastFilter.uploader] = window.location.href.split("uploads/");
    }

    render(() => <FilterBar maps={maps} api={api} initialFilter={lastFilter}
                            onChange={onFilter.bind(null, api, demoListBody)}/>, filterBar);
});

const filterEq = (a, b) => {
    return (a.mode || "") === (b.mode || "")
        && (a.map || "") === (b.map || "")
        && (a.uploader || "") === (b.uploader || "")
        && a.players.length === b.players.length && b.players.every(player => a.players.includes(player))
}

const onFilter = async (api, demoListBody, filter) => {
    if (filterEq(lastFilter, filter)) {
        return;
    }
    lastFilter = filter;

    let queryParams = new URLSearchParams({
        players: filter.players.map(player => player.steamid).join(','),
        mode: (filter.mode || "").toLowerCase(),
        map: filter.map || "",
    });
    if (filter.uploader) {
        queryParams.set("uploader", filter.uploader);
    }
    const response = await fetch("/fragments/demo-list?" + queryParams);
    document.querySelector('.demolist tbody').innerHTML = await response.text();
}