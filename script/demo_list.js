import {render} from "solid-js/web";
import {ready} from "./ready";
import {FilterBar} from "./filterbar"
import {Api} from "./api";

ready(() => {
    const filterBar = document.getElementById('filter-bar');
    const maps = filterBar.dataset.maps.split(",");
    const apiBase = filterBar.dataset.apiBase;
    const api = new Api(apiBase);

    render(() => <FilterBar maps={maps} api={api} />, filterBar)
});