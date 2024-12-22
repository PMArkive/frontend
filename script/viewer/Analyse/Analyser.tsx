import {MapRender} from './MapRender';
import {MapContainer} from "./MapContainer";
import {throttle, debounce} from 'throttle-debounce';
import {Timeline} from './Render/Timeline';
import {SpecHUD} from './Render/SpecHUD';
import {AnalyseMenu} from './AnalyseMenu'
import {useKeyDownEvent} from "@solid-primitives/keyboard";
import {autofocus} from "@solid-primitives/autofocus";
// prevents from being tree-shaken by TS
autofocus
import Modal from "@lutaok/solid-modal";

import {AsyncParser} from "./Data/AsyncParser";
import {getMapBoundaries} from "./MapBoundries";
import {createEffect, createSignal, untrack} from "solid-js";
import {Session, StateUpdate} from "./Session";
import {DemoHead} from "../../header";
import {EventSearch} from "./EventSearch";
import {Event} from "./Data/Parser";
import {Help} from "./Help";

export enum ModalState {
    Closed,
    Help,
    Goto,
    Search,
}

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
    const [modalState, setModalState] = createSignal<ModalState>(ModalState.Closed);
    const [search, setSearch] = createSignal<string>('');
    const [gotoInput, setGotoInput] = createSignal<number>(0);
    const closeDialogs = () => {
        setModalState(ModalState.Closed);
    };
    const [highlighted, setHighlighted] = createSignal<number>(0);

    createEffect(() => {
        const e = event();

        untrack(() => {
            if (e) {
                if (modalState() === ModalState.Closed) {
                    if (e.key === '.') {
                        seek(1);
                        e.preventDefault();
                    }
                    if (e.key === ',') {
                        seek(-1);
                        e.preventDefault();
                    }
                    if (e.key === 'ArrowRight') {
                        seek(15);
                        e.preventDefault();
                    }
                    if (e.key === 'ArrowLeft') {
                        seek(-15);
                        e.preventDefault();
                    }
                    if (e.key === ' ') {
                        togglePlay();
                        e.preventDefault();
                    }
                    if (e.key === '?') {
                        setModalState(ModalState.Help);
                        e.preventDefault();
                    }
                }
                if (!inShared && e.getModifierState("Control") && e.key === 'g') {
                    setModalState(ModalState.Goto);
                    e.preventDefault();
                }
                if (!inShared && e.getModifierState("Control") && e.key === 'f') {
                    setModalState(ModalState.Search);
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    closeDialogs();
                    e.preventDefault();
                }
            }
        });
    });

    const gotoTickSubmitted = () => {
        setTickNow(clampTick(gotoInput()));
        closeDialogs();
    }

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

    const clampTick = (tick) => Math.max(0, Math.min(lastTick, tick))
    const seek = (offset) => {
        const target = clampTick(tick() + offset);
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
    const projectiles = () => parser.getProjectilesAtTick(tick());
    const events = parser.getEvents();
    const playButtonText = () => (playing()) ? '⏸' : '▶️';
    const inShared = session && !session.isOwner();
    const isShared = () => sessionName() !== '';

    const timeTitle = () => `${tickToTime(tick(), intervalPerTick)} (tick ${tick()})`;

    return (
        <div>
            <div class="map-holder">
                <MapContainer contentSize={worldSize}
                              onScale={setScale}>
                    <MapRender size={worldSize}
                               players={players()}
                               buildings={buildings()}
                               projectiles={projectiles()}
                               header={props.header}
                               world={backgroundBoundaries}
                               scale={scale()}
                               onHover={setHighlighted}
                               highlighted={highlighted()}
                    />
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
                             openModal={setModalState}
                             canShare={props.isStored && !inShared}
                             isShared={isShared()}
                             clients={clients()}
                             inShared={inShared}
                />
                <SpecHUD parser={parser} tick={tick()}
                         players={players()} events={events}
                         highlighted={highlighted()}
                         onHover={setHighlighted}/>
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
            <Modal isOpen={modalState() === ModalState.Help} onCloseRequest={() => setModalState(ModalState.Closed)}
                   closeOnOutsideClick={true} overlayClass="modal-overlay" contentClass="modal-content">
                <Help inShared={inShared}/>
            </Modal>
            <Modal isOpen={modalState() === ModalState.Goto} onCloseRequest={() => setModalState(ModalState.Closed)}
                   closeOnOutsideClick={true} overlayClass="modal-overlay" contentClass="modal-content">
                <h4>Goto Tick</h4>
                <form use:formSubmit={gotoTickSubmitted} class="goto">
                    <input
                        onInput={(e) => setGotoInput(parseInt(e.target.value, 10))}
                        ref={autofocus} autofocus type="text" inputmode="numeric" min={0} max={lastTick - 1}/>
                </form>
            </Modal>
            <Modal isOpen={modalState() === ModalState.Search} onCloseRequest={() => setModalState(ModalState.Closed)}
                   closeOnOutsideClick={true} overlayClass="modal-overlay" contentClass="modal-content">
                <EventSearch
                    players={players()}
                    search={search()}
                    onSearch={setSearch}
                    events={events}
                    onSelect={(event: Event) => setTickNow(event.tick)}
                ></EventSearch>
            </Modal>
        </div>
    );
}

function tickToTime(tick: number, intervalPerTick: number): string {
    let seconds = Math.floor(tick * intervalPerTick);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

const formSubmit = (ref, accessor) => {
    const callback = accessor() || (() => {
    });
    ref.onsubmit = async (e) => {
        e.preventDefault();
        callback(ref);
    };
};