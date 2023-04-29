import {PlayerState, WorldBoundaries, Team} from "../Data/Parser";
import {createEffect} from "solid-js";

export interface PlayerProp {
    player: PlayerState;
    mapBoundary: WorldBoundaries;
    targetSize: {
        width: number;
        height: number;
    };
    scale: number;
}

const healthMap = {
    0: 100, //fallback
    1: 125,//scout
    2: 150,//sniper
    3: 200,//soldier,
    4: 175,//demoman,
    5: 150,//medic,
    6: 300,//heavy,
    7: 175,//pyro
    8: 125,//spy
    9: 125,//engineer
};

const classMap = {
    0: "empty",
    1: "scout",
    2: "sniper",
    3: "soldier",
    4: "demoman",
    5: "medic",
    6: "heavy",
    7: "pyro",
    8: "spy",
    9: "engineer"
};

export function Player(props: PlayerProp) {
    const worldWidth = props.mapBoundary.boundary_max.x - props.mapBoundary.boundary_min.x;
    const worldHeight = props.mapBoundary.boundary_max.y - props.mapBoundary.boundary_min.y;
    const x = () => props.player.position.x - props.mapBoundary.boundary_min.x;
    const y = () => props.player.position.y - props.mapBoundary.boundary_min.y;
    const scaledX = () => x() / worldWidth * props.targetSize.width;
    const scaledY = () => (worldHeight - y()) / worldHeight * props.targetSize.height;
    const maxHealth = () => healthMap[props.player.playerClass];
    const alpha = () => props.player.health / maxHealth();
    const teamColor = () => (props.player.team === Team.Red) ? '#a75d50' : '#5b818f';
    const imageOpacity = () => props.player.health === 0 ? 0 : (1 + alpha()) / 2;
    const transform = () => `translate(${scaledX()} ${scaledY()}) scale(${1 / props.scale})`;
    const rotate = () => `rotate(${270 - props.player.angle})`;

    return <g
        transform={transform()}>
        <polygon points="-6,14 0, 16 6,14 0,24" fill="white"
                 opacity={imageOpacity()}
                 transform={rotate()}/>
        <circle r={16} stroke-width={1} stroke="white" fill={teamColor()}
                opacity={alpha()}/>
        {getClassImage(props.player, imageOpacity())}
    </g>
}

function getClassImage(player: PlayerState, imageOpacity: number) {
    if (!classMap[player.playerClass]) {
        return [];
    }
    const image = `/images/class_icons/${classMap[player.playerClass]}.svg`;
    return <image href={image}
                  class={"player-icon " + player.team}
                  opacity={imageOpacity}
                  height={32}
                  width={32}
                  transform={`translate(-16 -16)`}/>
}
