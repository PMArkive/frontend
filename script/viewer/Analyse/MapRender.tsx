import {Player as PlayerDot} from './Render/Player';
import {Building as BuildingDot} from './Render/Building';
import {findMapAlias} from './MapBoundries';
import {PlayerState, Header, WorldBoundaries, BuildingState} from "./Data/Parser";
import {splitProps} from "solid-js";

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
	const image = `images/leveloverview/dist/${mapAlias}.webp`;
	const background = `url(${image})`;

	const playerDots = () => props.players
		.filter((player: PlayerState) => player.health)
		.map((player: PlayerState) => {
			return <PlayerDot player={player} mapBoundary={props.world}
			                  targetSize={props.size} scale={props.scale} />
		});

	const buildingDots = () => props.buildings
		.filter((building: PlayerState) => building.position.x)
		.map((building: PlayerState) => {
			return <BuildingDot building={building}
			                    mapBoundary={props.world}
			                    targetSize={props.size} scale={props.scale}/>
		});

	return (
		<svg class="map-background" width={props.size.width} height={props.size.height}
		     style={{"background-image": background}}>
			{playerDots()}
			{buildingDots()}
		</svg>
	);
}
