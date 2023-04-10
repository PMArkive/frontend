import {render} from "solid-js/web/dist/web.js";
import {ready} from "./ready";
import {FilterBar} from "./filterbar"

ready(() => {
    render(() => <FilterBar name="World" />, document.querySelector('.filter-bar'))
});