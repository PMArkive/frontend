import {Select, createOptions, createAsyncOptions} from "@thisbeyond/solid-select";
import {Api, SteamUser} from "./api";
import {createEffect, createSignal} from "solid-js";

export interface FilterBarProps {
    maps: string[],
    api: Api,
    initialFilter: FilterSet,
    onChange: (FilterSet) => void,
}

export const FilterBar = ({maps, api, onChange, initialFilter}: FilterBarProps) => {
    const modes = createOptions(["4v4", "6v6", "Highlander"]);
    const mapOptions = createOptions(maps, {
        createable: true
    });
    const playerOptions = createAsyncOptions(search => api.searchPlayer(search));
    const playerFormat = player => player.name;

    const [initialMode, setInitialMode] = createSignal(initialFilter.mode, {equals: false});
    const [initialMap, setInitialMap] = createSignal(initialFilter.map, {equals: false});

    const [filterSet, setFilterSet] = createSignal(initialFilter);
    createEffect(() => onChange(filterSet()));

    return <div class="filter-bar">
        <Select class="mode" onChange={mode => setFilterSet({
            ...filterSet(),
            mode
        })} initialValue={initialMode()} placeholder="All Types" {...modes} />
        <Reset reset={() => {
            setInitialMode("");
            onChange({
                ...filterSet(),
                mode: "",
            });
        }}/>
        <Select class="maps" onChange={map => setFilterSet({
            ...filterSet(),
            map
        })} initialValue={initialMap()} placeholder="All Maps" {...mapOptions} />
        <Reset reset={() => {
            setInitialMap("");
            console.log({
                ...filterSet(),
                map: "",
            });
            onChange({
                ...filterSet(),
                map: "",
            });
        }}/>
        <Select class="players" initialValue={initialFilter.players} onChange={players => setFilterSet({
            ...filterSet(),
            players
        })} multiple placeholder="All Players" format={playerFormat} {...playerOptions} />
    </div>;
}

export const Reset = ({reset}) => {
    return <button onClick={reset} class="reset">X</button>;
}

export interface FilterSet {
    mode: string,
    map: string,
    players: SteamUser[],
    uploader: string,
}

export function queryForFilter(filter: FilterSet): URLSearchParams {
    let queryParams = new URLSearchParams({
        players: filter.players.map(player => player.steamid).join(','),
        mode: (filter.mode || "").toLowerCase(),
        map: filter.map || "",
    });
    if (filter.uploader) {
        queryParams.set("uploader", filter.uploader);
    }
    return queryParams;
}