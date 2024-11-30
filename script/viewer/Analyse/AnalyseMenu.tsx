export interface AnalyseMenuProps {
    sessionName: string;
    onShare: Function;
    canShare: boolean;
    isShared: boolean;
    clients: number,
    inShared: boolean,
    open: boolean,
    openHelp: Function;
}

export function AnalyseMenu(props: AnalyseMenuProps) {
    const loc = () => window.location.toString().replace(/\#.*/, '') + '#' + props.sessionName;

    return (<div class="analyse-menu">
        <Show when={props.inShared}>
            <div class="share shared">
                You're spectating a session controlled by someone else
            </div>
        </Show>
        <Show when={!props.inShared}>
            <details>
                <summary title="Menu">☰</summary>
                <ul class="menu">
                    <li>
                        <button class="share-session" title="Start a shared session" disabled={props.isShared}
                                onClick={() => {
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
                        <button class="help" title="Help" onClick={() => props.openHelp()}>
                            Help
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
