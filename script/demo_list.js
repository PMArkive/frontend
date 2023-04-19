import {render} from "solid-js/web";
import {ready} from "./ready";
import {FilterBar, queryForFilter} from "./filterbar"
import {Api, SteamId} from "./api";

let lastFilter = {
    mode: "",
    map: "",
    uploader: "",
    players: [],
};

ready(async () => {
    const filterBar = document.getElementById('filter-bar');
    const moreButton = document.getElementById('load-more');
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

    moreButton.addEventListener('click', () => {
       more(api, demoListBody, lastFilter);
    });

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
    const response = await fetch("/fragments/demo-list?" + queryForFilter(filter));
    document.querySelector('.demolist tbody').innerHTML = await response.text();
}

const more = async (api, demoListBody, filter) => {
    const rows = demoListBody.querySelectorAll('tr');
    const lastId = rows[rows.length-1].dataset.id;

    const query = queryForFilter(filter);
    query.set("before", lastId)
    const response = await fetch("/fragments/demo-list?" + query);
    const appendBody = document.createElement('tbody');
    appendBody.innerHTML = await response.text();
    const fragment = document.createDocumentFragment();
    while (appendBody.children.length > 0) {
        fragment.appendChild(appendBody.children[0]);
    }

    demoListBody.appendChild(fragment);
}