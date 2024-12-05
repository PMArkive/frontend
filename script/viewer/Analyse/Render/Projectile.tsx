import {ProjectileState, ProjectileType, Team, WorldBoundaries} from "../Data/Parser";
import {Show} from "solid-js";

export interface ProjectileProp {
    projectile: ProjectileState;
    mapBoundary: WorldBoundaries;
    targetSize: {
        width: number;
        height: number;
    };
    scale: number;
}

export function Projectile(props: ProjectileProp) {
    const worldWidth = props.mapBoundary.boundary_max.x - props.mapBoundary.boundary_min.x;
    const worldHeight = props.mapBoundary.boundary_max.y - props.mapBoundary.boundary_min.y;
    const x = () => props.projectile.position.x - props.mapBoundary.boundary_min.x;
    const y = () => props.projectile.position.y - props.mapBoundary.boundary_min.y;
    const scaledX = () => x() / worldWidth * props.targetSize.width;
    const scaledY = () => (worldHeight - y()) / worldHeight * props.targetSize.height;
    const teamColor = () => (props.projectile.team === Team.Red) ? '#a75d50' : '#5b818f';

    const transform = () => `translate(${scaledX()} ${scaledY()}) scale(${1 / props.scale})`;
    const rotate = () => `rotate(${270 - props.projectile.angle})`;
    try {
        return <g transform={transform()}>
            <Show when={projectileIsAngled(props.projectile.projectileType)}>
                <polygon points="-3,-4 0,0 3,-4 0,8" stroke="white" fill={teamColor()}
                         transform={rotate()}/>
            </Show>
            <Show when={!projectileIsAngled(props.projectile.projectileType)}>
                <circle r={3} stroke-width={1} stroke="white" fill={teamColor()}/>
            </Show>
        </g>
    } catch (e) {
        console.log(e);

        return null;
    }
}

function projectileIsAngled(type: ProjectileType): boolean {
    switch (type) {
        case ProjectileType.Flare:
        case ProjectileType.HealingArrow:
        case ProjectileType.Rocket:
            return true;
        default:
            return false;
    }
}
