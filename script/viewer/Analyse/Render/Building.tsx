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
			return require("inline://images/building_icons/tele_entrance.png");
		case BuildingType.TeleporterExit:
			return require("inline://images/building_icons/tele_exit.png");
		case BuildingType.Dispenser:
			return require("inline://images/building_icons/dispenser.png");
		case BuildingType.Level1Sentry:
			return require("inline://images/building_icons/sentry_1.svg");
		case BuildingType.Level2Sentry:
			return require("inline://images/building_icons/sentry_2.png");
		case BuildingType.Level3Sentry:
			return require("inline://images/building_icons/sentry_3.png");
		case BuildingType.MiniSentry:
			return require("inline://images/building_icons/sentry_1.png");
		default:
			return '';
	}
}

export function Building(props: BuildingProp) {
	const worldWidth = props.mapBoundary.boundary_max.x - props.mapBoundary.boundary_min.x;
	const worldHeight = props.mapBoundary.boundary_max.y - props.mapBoundary.boundary_min.y;
	const x = () => props.building.position.x - props.mapBoundary.boundary_min.x;
	const y = () => props.building.position.y - props.mapBoundary.boundary_min.y;
	const scaledX = () => x() / worldWidth * props.targetSize.width;
	const scaledY = () => (worldHeight - y()) / worldHeight * props.targetSize.height;
	const maxHealth = () => healthMap[props.building.level];
	const teamColor = () => (props.building.team === Team.Red) ? '#a75d50' : '#5b818f';
	if (!maxHealth) {
		return null;
	}

	const transform = () => `translate(${scaledX()} ${scaledY()}) scale(${1 / props.scale})`;
	const rotate = () => `rotate(${270 - props.building.angle})`;

	const alpha = () => props.building.health / maxHealth;
	try {
		const image = () => getBuildingType(props.building.buildingType);
		return <g transform={transform()}
				  opacity={alpha()}>
			<circle r={16} stroke-width={1} stroke="white" fill={teamColor()}
					opacity={alpha()}/>
			<image href={image()} className={"player-icon"} height={32} width={32} transform={`translate(-16 -16)`}/>
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
