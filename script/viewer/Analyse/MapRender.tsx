import {Player as PlayerDot} from './Render/Player';
import {Building as BuildingDot} from './Render/Building';
import {findMapAlias} from './MapBoundries';
import {PlayerState, Header, WorldBoundaries, BuildingState} from "@demostf/parser-worker";

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

declare const require: {
	<T>(path: string): T;
	(paths: string[], callback: (...modules: any[]) => void): void;
	ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

export function MapRender({header, players, size, world, scale, buildings}: MapRenderProps) {
	const mapAlias = findMapAlias(header.map);
	const image = `images/leveloverview/dist/${mapAlias}.webp`;
	const background = `url(${image})`;

	const playerDots = players
		.filter((player: PlayerState) => player.health)
		.map((player: PlayerState) => {
			return <PlayerDot player={player} mapBoundary={world}
			                  targetSize={size} scale={scale} />
		});

	const buildingDots = buildings
		.filter((building: PlayerState) => building.position.x)
		.map((building: PlayerState) => {
			return <BuildingDot building={building}
			                    mapBoundary={world}
			                    targetSize={size} scale={scale}/>
		});

	return (
		<svg class="map-background" width={size.width} height={size.height}
		     style={{"background-image": background}}>
			{playerDots}
			{buildingDots}
		</svg>
	);
}
