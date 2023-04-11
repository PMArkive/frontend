import {Select, createOptions, createAsyncOptions} from "@thisbeyond/solid-select";
import {Api} from "./api";

export interface FilterBarProps {
    maps: string[],
    api: Api,
}

export const FilterBar = ({maps, api}: FilterBarProps) => {
    const modes = createOptions(["4v4", "6v6", "Highlander"]);
    const mapOptions = createOptions(maps);
    const playerOptions = createAsyncOptions(search => api.searchPlayer(search));
    const playerFormat = player => player.name;
    return <div class="filter-bar">
        <Select class="mode" placeholder="All Types" {...modes} />
        <Select class="maps" placeholder="All Maps" {...mapOptions} />
        <Select class="players" multiple placeholder="All Players" format={playerFormat} {...playerOptions} />
    </div>;
}
