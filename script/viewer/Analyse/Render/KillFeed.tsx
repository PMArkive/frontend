import {BuildingDestroyedEvent, Event, Kill, PlayerState} from "../Data/Parser";
import {killAlias} from "./killAlias";
import {For, Show} from "solid-js";

export interface KillFeedProps {
    events: Event[],
    tick: number;
    players: PlayerState[];
}

export function KillFeed(props: KillFeedProps) {
    const {events} = props;
    const relevantEvents = () => events.filter(event => event.tick <= props.tick && event.tick >= (props.tick - 30 * 10));

    return <ul class="killfeed">
        <For each={relevantEvents()}>{(event) =>
            <KillFeedItem event={event} players={props.players}/>
        }</For>
    </ul>
}

export const teamMap = {
    0: 'unknown',
    2: 'red',
    3: 'blue'
};

interface KillFeedItemProps {
    event: Event;
    players: PlayerState[];
}

export function KillFeedItem(props: KillFeedItemProps) {
    return <>
        <Show when={props.event.type === "kill"}>
            <KillFeedKillItem players={props.players} kill={props.event.kill}/>
        </Show>
        <Show when={props.event.type === "building_destroyed"}>
            <KillFeedDestroyedItem players={props.players} event={props.event}/>
        </Show>
    </>
}

interface KillFeedKillItemProps {
    kill: Kill;
    players: PlayerState[];
}

export function KillFeedKillItem(props: KillFeedKillItemProps) {
    const attacker = getPlayer(props.players, props.kill.attacker);
    const assister = getPlayer(props.players, props.kill.assister);
    let victim = getPlayer(props.players, props.kill.victim);

    return <li class="kill">
        <PlayerNames players={[attacker, assister]}/>
        <KillIcon kill={props.kill}/>
        <PlayerName player={victim}/>
    </li>
}

interface KillFeedDestroyedItemProps {
    event: BuildingDestroyedEvent;
    players: PlayerState[];
}

export function KillFeedDestroyedItem(props: KillFeedDestroyedItemProps) {
    const attacker = getPlayer(props.players, props.event.attacker_id);
    const assister = getPlayer(props.players, props.event.assister_id);
    let victim = getPlayer(props.players, props.event.victim_id);

    return <li class="kill">
        <PlayerNames players={[attacker, assister]}/>
        <KillIcon kill={props.event}/>
        <PlayerName player={victim}/><span class={teamMap[victim.team]}>({props.event.building_type})</span>
    </li>
}

interface KillIconProps {
    kill: Kill | BuildingDestroyedEvent;
}

export function KillIcon(props: KillIconProps) {
    const alias = killAlias[props.kill.weapon] ? killAlias[props.kill.weapon] : props.kill.weapon;
    let killIcon;
    try {
        killIcon = `/images/kill_icons/${alias}.png`;
    } catch (e) {
        console.log(alias);
        killIcon = `/images/kill_icons/skull.png`;
    }

    return <img src={killIcon} class={`kill-icon ${props.kill.weapon}`}/>
}

interface PlayerNameProps {
    player: PlayerState | null
}

export function PlayerName(props: PlayerNameProps) {
    return <Show when={props.player}>
        <span class={"player " + teamMap[props.player.team]}>
            {props.player.info.name}
        </span>
    </Show>
}

interface PlayerNamesProps {
    players: (PlayerState | null)[]
}

export function PlayerNames(props: PlayerNamesProps) {
    return <For each={props.players}>{(player, i) => <>
        <Show when={i() > 0 && player}>
            <span class={teamMap[player.team]}>+</span>
        </Show>
        <PlayerName player={player}/>
    </>}</For>
}

export function getPlayer(players: PlayerState[], entityId: number): PlayerState | null {
    return players.find(player => player.info.userId == entityId);
}
