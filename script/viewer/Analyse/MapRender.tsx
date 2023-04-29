import {Player as PlayerDot} from './Render/Player';
import {Building as BuildingDot} from './Render/Building';
import {findMapAlias} from './MapBoundries';
import {PlayerState, Header, WorldBoundaries, BuildingState} from "./Data/Parser";
import {createEffect, Show} from "solid-js";

export interface MapRenderProps {
	header: Header;
	players: PlayerState[];
	buildings: BuildingState[];
	size: {
		width: number;
		height: number;
	},
	world: WorldBoundaries;
	scale: number;
}

export function MapRender(props: MapRenderProps) {
	const mapAlias = findMapAlias(props.header.map);
	const image = `/images/leveloverview/dist/${mapAlias}.webp`;
	const background = `url(${image})`;

	return (
		<svg class="map-background" width={props.size.width} height={props.size.height}
		     style={{"background-image": background}}>
			<For each={props.players}>{(player) =>
				<Show when={player.health}>
					<PlayerDot player={player} mapBoundary={props.world} targetSize={props.size} scale={props.scale} />
				</Show>
			}</For>
			<For each={props.buildings}>{(building) =>
				<Show when={building.position.x}>
					<BuildingDot building={building} mapBoundary={props.world} targetSize={props.size} scale={props.scale}/>
				</Show>
			}</For>
		</svg>
	);
}
