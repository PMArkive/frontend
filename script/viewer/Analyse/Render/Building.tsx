import {BuildingState, WorldBoundaries, BuildingType, Team} from "../Data/Parser";
import {Show} from "solid-js";

export interface BuildingProp {
	building: BuildingState;
	mapBoundary: WorldBoundaries;
	targetSize: {
		width: number;
		height: number;
	};
	scale: number;
}

const healthMap = [0, 150, 180, 216];

function getBuildingType(type: BuildingType) {
	switch (type) {
		case BuildingType.TeleporterEntrance:
			return 'tele_entrance';
		case BuildingType.TeleporterExit:
			return 'tele_exit';
		case BuildingType.Dispenser:
			return 'dispenser';
		case BuildingType.Level1Sentry:
			return 'sentry_1';
		case BuildingType.Level2Sentry:
			return 'sentry_2';
		case BuildingType.Level3Sentry:
			return 'sentry_3';
		case BuildingType.MiniSentry:
			return 'sentry_1';
		default:
			return 'unknown';
	}
}

function getIcon(building: BuildingState) {
	const icon = getBuildingType(building.buildingType);
	const team = building.team === Team.Red ? 'red' : 'blue';
	return `/images/building_icons/${icon}_${team}.png`;
}

export function Building(props: BuildingProp) {
	const worldWidth = props.mapBoundary.boundary_max.x - props.mapBoundary.boundary_min.x;
	const worldHeight = props.mapBoundary.boundary_max.y - props.mapBoundary.boundary_min.y;
	const x = () => props.building.position.x - props.mapBoundary.boundary_min.x;
	const y = () => props.building.position.y - props.mapBoundary.boundary_min.y;
	const scaledX = () => x() / worldWidth * props.targetSize.width;
	const scaledY = () => (worldHeight - y()) / worldHeight * props.targetSize.height;
	const maxHealth = () => healthMap[props.building.level];
	if (!maxHealth) {
		return null;
	}

	const transform = () => `translate(${scaledX()} ${scaledY()}) scale(${1 / props.scale})`;
	const rotate = () => `rotate(${270 - props.building.angle})`;

	const alpha = () => props.building.health / maxHealth;
	try {
		const image = getIcon(props.building);
		return <g transform={transform()}
				  opacity={alpha()}>
			<image href={image} className={"player-icon"} height={32}
				   width={32}
				   transform={`translate(-16 -16)`}/>
			<Show when={props.building.angle}>
				<polygon points="-6,14 0, 16 6,14 0,24" fill="white"
						 transform={rotate()}/>
			</Show>
		</g>
	} catch (e) {
		console.log(e);

		return null;
	}
}
