import {ModalState} from "./Analyser";
import {Show} from "solid-js";

export interface AnalyseMenuProps {
    sessionName: string;
    onShare: Function;
    canShare: boolean;
    isShared: boolean;
    clients: number;
    inShared: boolean;
    open: boolean;
    openModal: (ModalState) => void;
}

export function AnalyseMenu(props: AnalyseMenuProps) {
    let details;
    const loc = () => window.location.toString().replace(/\#.*/, '') + '#' + props.sessionName;

    const openModal = (modal: ModalState) => {
        details.open = false;
        props.openModal(modal);
    }

    return (<div class="analyse-menu">
        <Show when={props.inShared}>
            <div class="share shared">
                You're spectating a session controlled by someone else
            </div>
        </Show>
        <Show when={!props.inShared}>
            <details ref={details}>
                <summary title="Menu">☰</summary>
                <ul class="menu">
                    <li>
                        <button className="share-session" title="Start a shared session" disabled={props.isShared}
                                onClick={() => {
                                    details.open = false;
                                    props.onShare()
                                }}>
                            <Show when={!props.isShared}>
                                Start a shared session
                            </Show>
                            <Show when={props.isShared}>
                                <input class="share-text" value={loc()} readOnly={true}
                                       title="Use this link to join the current session"
                                       style={{width: `${(loc().length * 8)}px`}}
                                       onFocus={(event) => {
                                           (event.target as HTMLInputElement).select()
                                       }}/>
                            </Show>
                        </button>
                    </li>
                    <li>
                        <button className="help" title="Help" onClick={() => openModal(ModalState.Help)}>
                            Help
                        </button>
                    </li>
                    <li>
                        <button className="goto" title="Goto Tick" onClick={() => openModal(ModalState.Goto)}>
                            Goto Tick
                        </button>
                    </li>
                    <li>
                        <button className="search" title="Search Events"
                                onClick={() => openModal(ModalState.Search)}>
                            Search Events
                        </button>
                    </li>
                </ul>
            </details>
        </Show>
        <Show when={props.isShared && !props.inShared}>
            <div class="clients">{props.clients} {(props.clients === 1) ? "spectator" : "spectators"}</div>
        </Show>
    </div>)
}
