import {Show} from "solid-js";

export interface HelpProps {
    inShared: boolean;
}

export function Help(props: HelpProps) {
    return <>
        <h4>Keyboard Shortcuts</h4>
        <table className="shortcuts">
            <tbody>
            <Show when={!props.inShared} fallback={<tr>
                <td colSpan={2}>Shortcuts not usable as spectator have been hidden</td>
            </tr>}>
                <tr>
                    <td><kbd>.</kbd></td>
                    <td>Next Tick</td>
                </tr>
                <tr>
                    <td><kbd>,</kbd></td>
                    <td>Previous Tick</td>
                </tr>
                <tr>
                    <td><kbd>⇒</kbd></td>
                    <td>0.5s Forward</td>
                </tr>
                <tr>
                    <td><kbd>⇐</kbd></td>
                    <td>0.5s Backwards</td>
                </tr>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>G</kbd></td>
                    <td>Goto Tick</td>
                </tr>
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
                    <td>Find Event</td>
                </tr>
                <tr>
                    <td><kbd>Spacebar</kbd></td>
                    <td>Play/Pause</td>
                </tr>
            </Show>
            <tr>
                <td><kbd>?</kbd></td>
                <td>This help menu</td>
            </tr>
            <tr>
                <td><kbd>Esc</kbd></td>
                <td>Close dialogs</td>
            </tr>
            </tbody>
        </table>
        <h4>Keyboard Shortcuts</h4>
    </>
}