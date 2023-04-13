import {Select, createOptions, createAsyncOptions} from "@thisbeyond/solid-select";
import {Api, SteamUser} from "./api";
import {createEffect, createSignal} from "solid-js";

export interface FilterBarProps {
    maps: string[],
    api: Api,
    onChange: (FilterSet) => void,
}

export const FilterBar = ({maps, api, onChange}: FilterBarProps) => {
    const modes = createOptions(["4v4", "6v6", "Highlander"]);
    const mapOptions = createOptions(maps, {
        createable: true
    });
    const playerOptions = createAsyncOptions(search => api.searchPlayer(search));
    const playerFormat = player => player.name;


    const [filterSet, setFilterSet] = createSignal({
        mode: "",
        map: "",
        players: []
    });
    createEffect(() => onChange(filterSet()));

    return <div class="filter-bar">
        <Select class="mode" onChange={mode => setFilterSet({
            ...filterSet(),
            mode
        })} placeholder="All Types" {...modes} />
        <Select class="maps" onChange={map => setFilterSet({
            ...filterSet(),
            map
        })}  placeholder="All Maps" {...mapOptions} />
        <Select class="players" onChange={players => setFilterSet({
            ...filterSet(),
            players
        })}  multiple placeholder="All Players" format={playerFormat} {...playerOptions} />
    </div>;
}

export interface FilterSet {
    mode: string,
    map: string,
    players: SteamUser[],
}