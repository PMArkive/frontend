import {Event, Kill, PlayerState} from "./Data/Parser";
import {createEffect, createSignal, For, Show, untrack} from "solid-js";
import {getPlayer, KillIcon, PlayerName, PlayerNames} from "./Render/KillFeed";
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
                <EventView event={event} highlighted={i() == selected()} players={props.players}/>
            }</For>
        </table>
    </div>)
}

interface EventViewProps {
    event: Event;
    highlighted: boolean,
    players: PlayerState[];
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
        <tr ref={row} class={props.event.type + highlightClass()}>
            <Show when={props.event.type == "kill"}>
                <KillView kill={props.event.kill} players={props.players}/>
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
    </>
}

function filterEvents(events: Event[], players: PlayerState[], query: string): Event[] {
    if (query === '') {
        return events;
    }
    query = query.toLowerCase();
    let filteredEvents = [].concat(events);
    let queryParts = query.split(' ').filter(part => part.length > 0);
    for (const queryPart of queryParts) {
        const playersForPart = findPlayers(players, queryPart);
        filteredEvents = filteredEvents.filter(event => eventMatches(event, playersForPart, queryPart));
    }
    return filteredEvents;
}

function findPlayers(players: PlayerState[], queryPart: string): number[] {
    return players.flatMap(player => {
        if (player.info.name.toLowerCase().includes(queryPart)) {
            return [player.info.userId]
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
    } else {
        return false;
    }
}
