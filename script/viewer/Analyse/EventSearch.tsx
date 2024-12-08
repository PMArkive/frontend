import {BuildingDestroyedEvent, Class, Event, Kill, PlayerState, UberEvent} from "./Data/Parser";
import {createEffect, createSignal, For, Show, untrack} from "solid-js";
import {getPlayer, KillIcon, PlayerName, PlayerNames, teamMap} from "./Render/KillFeed";
import {autofocus} from "@solid-primitives/autofocus";
import {useKeyDownEvent} from "@solid-primitives/keyboard";

export interface EventSearchProps {
    events: Event[];
    players: PlayerState[];
    onSearch: (string) => void;
    search: string;
    selectedEvent: number;
    onSelect: (event: Event) => void;
}

export function EventSearch(props: EventSearchProps) {
    const keyEvent = useKeyDownEvent();
    const [selected, setSelected] = createSignal<number>(0);

    const events = () => filterEvents(props.events, props.players, props.search);

    createEffect(() => {
        const e = keyEvent();

        untrack(() => {
            if (e) {
                const seekSelected = (offset) => {
                    const target = Math.max(0, Math.min(selected() + offset, events().length - 1));
                    setSelected(target);
                }
                if (e.key === 'ArrowUp') {
                    seekSelected(-1);
                    e.preventDefault();
                }
                if (e.key === 'ArrowDown') {
                    seekSelected(1);
                    e.preventDefault();
                }
                if (e.key === 'Enter') {
                    props.onSelect(events()[selected()]);
                    e.preventDefault();
                }
            }
        });
    });

    return (<div class="event-search">
        <input type="text" ref={autofocus} autofocus value={props.search}
               onInput={(e) => props.onSearch(e.target.value)}/>
        <table class="event-list">
            <For each={events()}>{(event, i) =>
                <EventView event={event} highlighted={i() == selected()} players={props.players}
                           onClick={() => props.onSelect(event)}/>
            }</For>
        </table>
    </div>)
}

interface EventViewProps {
    event: Event;
    highlighted: boolean,
    players: PlayerState[];
    onClick: () => void;
}

function EventView(props: EventViewProps) {
    let row;
    const highlightClass = () => ` ${props.highlighted ? 'highlighted' : ''}`;
    createEffect(() => {
        if (props.highlighted) {
            row.scrollIntoView(false);
        }
    })
    return (
        <tr ref={row} class={props.event.type + highlightClass()} onClick={() => props.onClick()}>
            <Show when={props.event.type == "kill"}>
                <KillView kill={props.event.kill} players={props.players}/>
            </Show>
            <Show when={props.event.type == "building_destroyed"}>
                <BuildingDestroyedView event={props.event} players={props.players}/>
            </Show>
            <Show when={props.event.type == "uber"}>
                <UberView event={props.event} players={props.players}/>
            </Show>
        </tr>
    );
}

interface KillViewProps {
    kill: Kill;
    players: PlayerState[];
}

function KillView(props: KillViewProps) {
    const attacker = getPlayer(props.players, props.kill.attacker);
    const assister = getPlayer(props.players, props.kill.assister);
    let victim = getPlayer(props.players, props.kill.victim);

    return <>
        <td class="kill-source">
            <PlayerNames players={[attacker, assister]}/>
        </td>
        <td class="kill-icon">
            <KillIcon kill={props.kill}/>
        </td>
        <td className="kill-target">
            <PlayerName player={victim}/>
        </td>
        <td className="tick">
            #{props.kill.tick}
        </td>
    </>
}

interface BuildingDestroyedViewProps {
    event: BuildingDestroyedEvent;
    f
    players: PlayerState[];
}

function BuildingDestroyedView(props: BuildingDestroyedViewProps) {
    const attacker = getPlayer(props.players, props.event.attacker_id);
    const assister = getPlayer(props.players, props.event.assister_id);
    let victim = getPlayer(props.players, props.event.victim_id);

    return <>
        <td class="kill-source">
            <PlayerNames players={[attacker, assister]}/>
        </td>
        <td class="kill-icon">
            <KillIcon kill={props.event}/>
        </td>
        <td className="kill-target">
            <PlayerName player={victim}/><span class={teamMap[victim.team]}>({props.event.building_type})</span>
        </td>
        <td className="tick">
            #{props.event.tick}
        </td>
    </>
}

interface UberViewProps {
    event: UberEvent;
    players: PlayerState[];
}

function UberView(props: UberViewProps) {
    const medic = getPlayer(props.players, props.event.user_id);
    const target = getPlayer(props.players, props.event.target_id);

    return <>
        <td class="kill-source">
            <PlayerName player={medic}/>
        </td>
        <td class="kill-icon">
            ubered
        </td>
        <td className="kill-target">
            <PlayerName player={target}/>
        </td>
        <td className="tick">
            #{props.event.tick}
        </td>
    </>
}

function filterEvents(events: Event[], players: PlayerState[], query: string): Event[] {
    if (query === '') {
        return events;
    }
    query = query.toLowerCase();
    let filteredEvents = [].concat(events);
    let queryParts = query.split(' ').filter(part => part.length > 0);

    let remainingPlayers = players;
    for (const queryPart of queryParts) {
        // we only search by class for players we haven't already matched
        // this allows "<name of scout1> scout" to find all cases of <scout1> and another scout
        // instead of matching all other <scout1> events because they are also a scout
        const playersForPart = findPlayersByName(players, queryPart) + findPlayersByClass(remainingPlayers, queryPart);
        remainingPlayers = remainingPlayers.filter(player => !playersForPart.includes(player.info.userId));
        filteredEvents = filteredEvents.filter(event => eventMatches(event, playersForPart, queryPart));
    }
    return filteredEvents;
}

function findPlayersByName(players: PlayerState[], queryPart: string): number[] {
    return players.flatMap(player => {
        if (player.info.name.toLowerCase().includes(queryPart)) {
            return [player.info.userId]
        } else {
            return [];
        }
    })
}

function findPlayersByClass(players: PlayerState[], queryPart: string): number[] {
    return players.flatMap(player => {
        if (reverseClassMap.hasOwnProperty(queryPart) && reverseClassMap[queryPart] == player.playerClass) {
            return [player.info.userId];
        } else {
            return [];
        }
    })
}

function eventMatches(event: Event, matchedPlayers: number[], queryPart: string): boolean {
    if (event.type === "kill") {
        const kill = event.kill;
        return matchedPlayers.includes(kill.attacker) ||
            matchedPlayers.includes(kill.assister) ||
            matchedPlayers.includes(kill.victim);
    } else if (event.type === "building_destroyed") {
        return queryPart === "destroyed" ||
            matchedPlayers.includes(event.attacker_id) ||
            matchedPlayers.includes(event.assister_id) ||
            matchedPlayers.includes(event.victim_id) ||
            event.weapon.includes(queryPart) ||
            event.building_type.includes(queryPart);
    } else if (event.type === "uber") {
        return queryPart === "uber" ||
            matchedPlayers.includes(event.user_id) ||
            matchedPlayers.includes(event.target_id);
    } else {
        return false;
    }
}

const reverseClassMap = {
    'scout': Class.Scout,
    'sniper': Class.Sniper,
    'soldier': Class.Solder,
    'demo': Class.Demoman,
    'demoman': Class.Demoman,
    'medic': Class.Medic,
    'heavy': Class.Heavy,
    'heavyweapons': Class.Heavy,
    'pyro': Class.Pyro,
    'spy': Class.Spy,
    'engineer': Class.Engineer,
    'engi': Class.Engineer,
};
