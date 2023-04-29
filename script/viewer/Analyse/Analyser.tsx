import {MapRender} from './MapRender';
import {MapContainer} from "./MapContainer";
import {throttle, debounce} from 'throttle-debounce';
import {Timeline} from './Render/Timeline';
import {SpecHUD} from './Render/SpecHUD';
import {AnalyseMenu} from './AnalyseMenu'
import {Header, WorldBoundaries} from "./Data/Parser";

import {AsyncParser} from "./Data/AsyncParser";
import {getMapBoundaries} from "./MapBoundries";
import {createSignal} from "solid-js";
import {Session, StateUpdate} from "./Session";

export interface AnalyseProps {
	header: Header;
	isStored: boolean;
	parser: AsyncParser;
}

export const Analyser = (props: AnalyseProps) => {
	const parser = props.parser;
	const intervalPerTick = props.header.interval_per_tick;

	const [tick, setTick] = createSignal<number>(0);
	const [scale, setScale] = createSignal<number>(1);
	const [playing, setPlaying] = createSignal<boolean>(false);
	const [sessionName, setSessionName] = createSignal<string>("");

	let lastFrameTime = 0;
	let playStartTick = 0;
	let playStartTime = 0;

	const onUpdate = (update: StateUpdate) => {
		if (update["tick"]) {
			setTick(update["tick"]);
		}
		if (update["playing"]) {
			setPlaying(update["playing"]);
		}
	}

	let session: Session | null = null;
	if (props.isStored && window.location.hash) {
		const parsed = parseInt(window.location.hash.substr(1), 10);
		if (('#' + parsed) === window.location.hash) {
			setTick(Math.floor(parsed));
		} else {
			const name = window.location.hash.substring(1);
			Session.join(name, onUpdate);
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
			session.update({playing: false});
		}
	}

	const togglePlay = () => {
		if (playing()) {
			pause();
		} else {
			play();
		}
	}

	const syncPlayTick = debounce(500, () => {
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

	const animFrame = (timestamp:number) => {
		const timePassed = (timestamp - playStartTime) / 1000;
		const targetTick = playStartTick + (Math.round(timePassed / intervalPerTick));
		lastFrameTime = timestamp;
		if (targetTick >= (parser.demo.tick - 1)) {
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
	const disabled = session && !session.isOwner();
	const isShared = () => sessionName() !== '';

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
									 playing: playing()
								 });
								 setSessionName(session.sessionName);
							 }}
							 canShare={props.isStored && !disabled}
							 isShared={isShared()}
				/>
				<SpecHUD parser={parser} tick={tick()}
						 players={players()} kills={kills}/>
			</div>
			<div class="time-control"
				 title={`${tickToTime(tick(), intervalPerTick)} (tick ${tick()})`}>
				<input class="play-pause-button" type="button"
					   value={playButtonText()}
					   disabled={disabled}
					   onClick={togglePlay}
				/>
				<Timeline parser={parser} tick={tick()}
						  onSetTick={throttle(50, (tick) => {
							  setTickNow(tick);
						  })}
						  disabled={disabled}/>
			</div>
		</div>
	);
}

function tickToTime(tick: number, intervalPerTick: number): string {
	let seconds = Math.floor(tick * intervalPerTick);
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
