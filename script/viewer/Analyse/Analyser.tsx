import {MapRender} from './MapRender';
import {MapContainer} from "./MapContainer";
import {throttle, debounce} from 'throttle-debounce';
import {Timeline} from './Render/Timeline';
import {SpecHUD} from './Render/SpecHUD';
import {AnalyseMenu} from './AnalyseMenu'
import {useKeyDownEvent} from "@solid-primitives/keyboard";
import Modal from "@lutaok/solid-modal";

import {AsyncParser} from "./Data/AsyncParser";
import {getMapBoundaries} from "./MapBoundries";
import {createEffect, createSignal, untrack} from "solid-js";
import {Session, StateUpdate} from "./Session";
import {DemoHead} from "../../header";

export interface AnalyseProps {
    header: DemoHead;
    isStored: boolean;
    parser: AsyncParser;
}

export const Analyser = (props: AnalyseProps) => {

    const event = useKeyDownEvent();

    const parser = props.parser;
    const lastTick = parser.demo.tickCount - 1;
    const intervalPerTick = props.header.duration / props.header.ticks;

    const [tick, setTick] = createSignal<number>(0);
    const [scale, setScale] = createSignal<number>(1);
    const [playing, setPlaying] = createSignal<boolean>(false);
    const [sessionName, setSessionName] = createSignal<string>("");
    const [clients, setClients] = createSignal<number>(0);
    const [helpOpen, setHelpOpen] = createSignal<boolean>(false);

    createEffect(() => {
        const e = event();

        untrack(() => {
            if (e) {
                if (e.key === '.') {
                    seek(1);
                }
                if (e.key === ',') {
                    seek(-1);
                }
                if (e.key === 'ArrowRight') {
                    seek(15);
                }
                if (e.key === 'ArrowLeft') {
                    seek(-15);
                }
                if (e.key === ' ') {
                    togglePlay();
                }
                e.preventDefault();
            }
        });
    });

    let lastFrameTime = 0;
    let playStartTick = 0;
    let playStartTime = 0;

    const onUpdate = (update: StateUpdate) => {
        if (update.hasOwnProperty("tick")) {
            setTick(update["tick"]);
        }
        if (update.hasOwnProperty("playing")) {
            if (update["playing"]) {
                play();
            } else {
                pause();
            }
        }
        if (update.hasOwnProperty("clients")) {
            console.log(update["clients"]);
            setClients(update["clients"]);
        }
    }

    let session: Session | null = null;
    if (props.isStored && window.location.hash) {
        const parsed = parseInt(window.location.hash.substr(1), 10);
        if (('#' + parsed) === window.location.hash) {
            if (parsed > 0 && parsed < lastTick) {
                setTick(Math.floor(parsed));
            }
        } else {
            const name = window.location.hash.substring(1);
            session = Session.join(name, onUpdate);
            setSessionName(name);
        }
    }

    const map = parser.demo.header.map;
    const backgroundBoundaries = getMapBoundaries(map);
    if (!backgroundBoundaries) {
        throw new Error(`Map not supported "${map}".`);
    }
    const worldSize = {
        width: backgroundBoundaries.boundary_max.x - backgroundBoundaries.boundary_min.x,
        height: backgroundBoundaries.boundary_max.y - backgroundBoundaries.boundary_min.y,
    };

    const seek = (offset) => {
        console.log(lastTick, tick(), tick() + offset);
        const target = Math.max(0, Math.min(lastTick, tick() + offset));
        console.log(target);
        setTickNow(target);
    }

    const setTickNow = (tick) => {
        lastFrameTime = 0;
        playStartTick = tick;
        playStartTime = window.performance.now();
        setTick(tick);
        setHash(tick);
        if (session) {
            session.update({tick});
        }
    }

    const pause = () => {
        setPlaying(false);
        lastFrameTime = 0;
        if (session) {
            session.update({playing: false});
        }
    }

    const play = () => {
        playStartTick = tick();
        playStartTime = window.performance.now();
        setPlaying(true);
        requestAnimationFrame(animFrame);
        if (session) {
            session.update({playing: true});
        }
    }

    const togglePlay = () => {
        if (playing()) {
            pause();
        } else {
            play();
        }
    }

    const syncPlayTick = throttle(2500, () => {
        if (session) {
            session.update({
                playing: playing(),
                tick: tick(),
            });
        }
    });

    const setHash = debounce(250, (tick) => {
        if (!session && props.isStored) {
            history.replaceState('', '', '#' + tick);
        }
    });

    const animFrame = (timestamp: number) => {
        const timePassed = (timestamp - playStartTime) / 1000;
        const targetTick = playStartTick + (Math.round(timePassed / intervalPerTick));
        lastFrameTime = timestamp;
        if (targetTick >= (lastTick)) {
            pause();
        }
        setHash(targetTick);
        setTick(targetTick);
        syncPlayTick();

        if (playing()) {
            requestAnimationFrame(animFrame);
        }
    }

    const players = () => parser.getPlayersAtTick(tick());
    const buildings = () => parser.getBuildingsAtTick(tick());
    const kills = parser.getKills();
    const playButtonText = () => (playing()) ? '⏸' : '▶️';
    const inShared = session && !session.isOwner();
    const isShared = () => sessionName() !== '';

    console.log(intervalPerTick);

    const timeTitle = () => `${tickToTime(tick(), intervalPerTick)} (tick ${tick()})`;

    return (
        <div>
            <div class="map-holder">
                <MapContainer contentSize={worldSize}
                              onScale={setScale}>
                    <MapRender size={worldSize}
                               players={players()}
                               buildings={buildings()}
                               header={props.header}
                               world={backgroundBoundaries}
                               scale={scale()}/>
                </MapContainer>
                <AnalyseMenu sessionName={sessionName()}
                             onShare={() => {
                                 session = Session.create({
                                     tick: tick(),
                                     playing: playing(),
                                     clients: 0,
                                 }, onUpdate);
                                 setSessionName(session.sessionName);
                             }}
                             openHelp={() => setHelpOpen(true)}
                             canShare={props.isStored && !inShared}
                             isShared={isShared()}
                             clients={clients()}
                             inShared={inShared}
                />
                <SpecHUD parser={parser} tick={tick()}
                         players={players()} kills={kills}/>
            </div>
            <div class="time-control"
                 title={timeTitle()}>
                <input class="play-pause-button" type="button"
                       value={playButtonText()}
                       disabled={inShared}
                       onClick={togglePlay}
                />
                <Timeline parser={parser} tick={tick()}
                          onSetTick={throttle(50, (tick) => {
                              setTickNow(tick);
                          })}
                          disabled={inShared}/>
            </div>
            <Modal class="help" isOpen={helpOpen()} onCloseRequest={() => setHelpOpen(false)}
                   closeOnOutsideClick={true}>
                <h4>Keyboard Shortcuts</h4>
                <table class="shortcuts">
                    <tbody>
                    <tr>
                        <td><kbd>.</kbd></td>
                        <td>Next tick</td>
                    </tr>
                    <tr>
                        <td><kbd>,</kbd></td>
                        <td>Previous tick</td>
                    </tr>
                    <tr>
                        <td><kbd>⇒</kbd></td>
                        <td>0.5s forward</td>
                    </tr>
                    <tr>
                        <td><kbd>⇐</kbd></td>
                        <td>0.5s backwards</td>
                    </tr>
                    <tr>
                        <td><kbd>Spacebar</kbd></td>
                        <td>Play/Pause</td>
                    </tr>
                    </tbody>
                </table>
            </Modal>
        </div>
    );
}

function tickToTime(tick: number, intervalPerTick: number): string {
    let seconds = Math.floor(tick * intervalPerTick);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
