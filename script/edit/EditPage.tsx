import {Duration, formatDuration} from '../components/Duration';

import Element = JSX.Element;
import {Section} from "../components/Section";
import MultiRangeSlider from "../components/MultiSlider";
import {DemoHead} from "../header";
import {createSignal} from "solid-js";
import {downloadBuffer, edit} from "./tools";

export interface EditPageProps {
    header: DemoHead;
    demoData: ArrayBuffer;
    setDropText: (string) => void,
    name: string,
}

export const Editor = (props: EditPageProps) => {
    let demoInfo: any[] | Element = [];
    demoInfo = (
        <div className="demo-info">
            {props.header.map}
            <Duration className="time"
                      duration={Math.floor(props.header.duration)}/>
        </div>
    );

    const [loading, setLoading] = createSignal(false);
    const [cutFrom, setCutFrom] = createSignal(0);
    const [cutTo, setCutTo] = createSignal(props.header.ticks);
    const intervalPerTick = props.header.duration / props.header.ticks;
    const [unlockPov, setUnlockPov] = createSignal(false);

    const editCb = async () => {
        try {
            setLoading(true);
            (props.setDropText)("Editing...");
            await doEdit(props.name, props.demoData, props.header, unlockPov(), cutFrom(), cutTo());
            (props.setDropText)(props.name);
            setLoading(false);
        } catch (e) {
            (props.setDropText)("Error: " + e.toString());
            setLoading(false);
        }
    }

    return (
        <div>
            {demoInfo}
            <Section title="Unlock camera">
                <ul key={1}>
                    <li key={1}>Unlocks the camera in pov demos, allowing free movement as if it were an stv demo.</li>
                    <li key={2}>When the player respawns the camera will be moved.</li>
                    <li key={3}>As pov demos only contain data near the player, far away players might freeze, teleport or otherwise behave weirdly.</li>
                </ul>
                <p key={2}>
                    <input type="checkbox" id="pov-unlock"
                           checked={unlockPov() ? "checked" : null}
                           onChange={() => {
                               setUnlockPov(!unlockPov())
                           }}/>
                    <label htmlFor="pov-unlock">Unlock camara for pov demo</label>
                </p>
            </Section>
            <Section title="Cut demo">
                <ul key={1}>
                    <li key={1}>Cuts the demo file to the selected tick range.</li>
                    <li key={2}>Cutting demos is experimental, resulting demo files might crash, have broken animations or have other issues.</li>
                    <li key={3}>Changing the specific cut range can sometimes work around issues with broken demos.</li>
                </ul>
                <p key={2}>
                    <MultiRangeSlider
                        min={0}
                        max={props.header.ticks}
                        onChange={(min, max) => {
                            if (min !== cutFrom() || max !== cutTo()) {
                                setCutFrom(min);
                                setCutTo(max);
                            }
                        }}
                        labelFn={(ticks) => formatDuration(ticks * intervalPerTick)}
                    />
                </p>
            </Section>
            <Section title="Process">
                <p key={1}>
                    <button onClick={editCb}
                            className="pure-button pure-button-primary"
                            disabled={loading() ? "disabled" : null}>
                        {() => loading() ? 'Processing...' : 'Edit'}
                    </button>
                </p>
            </Section>
        </div>
    );
}


async function doEdit(name: string, data: ArrayBuffer, header: DemoHead, unlockPov: boolean, from: number, to: number) {
    let options = {
        unlock_pov: unlockPov,
        cut: (from > 0 || to < header.ticks) ? {from, to} : undefined,
    }
    console.log(options);
    const edited = await edit(data, options);
    downloadBuffer(edited, name.replace('.dem', '_edited.dem'));
}