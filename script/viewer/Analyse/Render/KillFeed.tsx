import {Kill, PlayerState} from "../Data/Parser";
import {killAlias} from "./killAlias";
import {For, Show} from "solid-js";

export interface KillFeedProps {
    kills: Kill[],
    tick: number;
    players: PlayerState[];
}

export function KillFeed(props: KillFeedProps) {
    const {kills} = props;
    const relevantKills = () => kills.filter(kill => kill.tick <= props.tick && kill.tick >= (props.tick - 30 * 10));

    return <ul class="killfeed">
        <For each={relevantKills()}>{(kill) =>
            <KillFeedItem kill={kill} players={props.players}/>
        }</For>
    </ul>
}

export const teamMap = {
    0: 'unknown',
    2: 'red',
    3: 'blue'
};

interface KillFeedItemProps {
    kill: Kill;
    players: PlayerState[];
}

export function KillFeedItem(props: KillFeedItemProps) {
    const attacker = getPlayer(props.players, props.kill.attacker);
    const assister = getPlayer(props.players, props.kill.assister);
    let victim = getPlayer(props.players, props.kill.victim);

    return <li class="kill">
        <PlayerNames players={[attacker, assister]}/>
        <KillIcon kill={props.kill}/>
        <PlayerName player={victim}/>
    </li>
}

interface KillIconProps {
    kill: Kill;
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
        <span className={"player " + teamMap[props.player.team]}>
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
            <span className={teamMap[player.team]}>+</span>
        </Show>
        <PlayerName player={player}/>
    </>}</For>
}

export function getPlayer(players: PlayerState[], entityId: number): PlayerState | null {
    return players.find(player => player.info.userId == entityId);
}
