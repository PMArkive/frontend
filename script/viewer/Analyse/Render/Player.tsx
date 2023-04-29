import {PlayerState, WorldBoundaries, Team} from "../Data/Parser";

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

const imageMap = {
    0: require("inline://images/class_icons/empty.svg"),
    1: require("inline://images/class_icons/scout.svg"),
    2: require("inline://images/class_icons/sniper.svg"),
    3: require("inline://images/class_icons/soldier.svg"),
    4: require("inline://images/class_icons/demoman.svg"),
    5: require("inline://images/class_icons/medic.svg"),
    6: require("inline://images/class_icons/heavy.svg"),
    7: require("inline://images/class_icons/pyro.svg"),
    8: require("inline://images/class_icons/spy.svg"),
    9: require("inline://images/class_icons/engineer.svg"),
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
    if (!imageMap[player.playerClass]) {
        return [];
    }
    return <image href={imageMap[player.playerClass]}
                  class={"player-icon " + player.team}
                  opacity={imageOpacity}
                  height={32}
                  width={32}
                  transform={`translate(-16 -16)`}/>
}
