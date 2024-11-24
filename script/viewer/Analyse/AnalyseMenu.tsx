export interface AnalyseMenuProps {
    sessionName: string;
    onShare: Function;
    canShare: boolean;
    isShared: boolean;
    clients: number,
    inShared: boolean,
}

export function AnalyseMenu(props: AnalyseMenuProps) {
    const loc = () => window.location.toString().replace(/\#.*/, '') + '#' + props.sessionName;
    const shareText = () => (props.isShared) ?
        <input class="share-text" value={loc()} readOnly={true}
               title="Use this link to join the current session"
               style={{width: `${(loc().length * 8)}px`}}
               onFocus={(event) => {
                   (event.target as HTMLInputElement).select()
               }}/> : <span class="share-text">Start a shared session</span>;

    const clientCount = () => (props.isShared) ?
        <div class="clients">{props.clients} {(props.clients === 1) ? "spectator" : "spectators"}</div> : [];

    const shareButton = () => {
        if (props.canShare) {

            return [
                <div class="share">
                    <button class="share-session" title="Start a shared session"
                            onClick={() => {
                                props.onShare()
                            }}/>
                    {shareText}
                </div>,
                clientCount,
            ]
        } else if (props.inShared) {
            return <div class="share shared">
                You're spectating a session controlled by someone else
            </div>
        } else {
            return [];
        }
    }

    return (<div class="analyse-menu">
        {shareButton}
    </div>)
}
