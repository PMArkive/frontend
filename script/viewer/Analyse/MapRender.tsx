import {Player as PlayerDot} from './Render/Player';
import {Building as BuildingDot} from './Render/Building';
import {Projectile as ProjectileDot} from './Render/Projectile';
import {findMapAlias} from './MapBoundries';
import {PlayerState, Header, WorldBoundaries, BuildingState, ProjectileState} from "./Data/Parser";
import {Show} from "solid-js";

export interface MapRenderProps {
    header: Header;
    players: PlayerState[];
    buildings: BuildingState[];
    projectiles: ProjectileState[];
    size: {
        width: number;
        height: number;
    },
    world: WorldBoundaries;
    scale: number;
    onHover: (userId: number) => void;
    highlighted: number;
}

const map_root = document.querySelector('[data-maps]').getAttribute('data-maps');

export function MapRender(props: MapRenderProps) {
    const mapAlias = findMapAlias(props.header.map);
    const image = `${map_root}images/${mapAlias}.webp`;
    const background = `url(${image})`;

    return (
        <svg class="map-background" width={props.size.width} height={props.size.height}
             style={{"background-image": background}}>
            <For each={props.players}>{(player) =>
                <Show when={player.health}>
                    <PlayerDot player={player} mapBoundary={props.world} targetSize={props.size} scale={props.scale}
                               onHover={props.onHover}
                               highlighted={props.highlighted === player.info.userId}
                    />
                </Show>
            }</For>
            <For each={props.buildings}>{(building) =>
                <Show when={building.position.x}>
                    <BuildingDot building={building} mapBoundary={props.world} targetSize={props.size}
                                 scale={props.scale}/>
                </Show>
            }</For>
            <For each={props.projectiles}>{(projectile) =>
                <Show when={projectile.position.x}>
                    <ProjectileDot projectile={projectile} mapBoundary={props.world} targetSize={props.size}
                                   scale={props.scale}/>
                </Show>
            }</For>
        </svg>
    );
}
