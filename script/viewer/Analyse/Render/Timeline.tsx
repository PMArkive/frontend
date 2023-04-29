import {ParsedDemo, PlayerState, Header, WorldBoundaries, Team} from "../Data/Parser";

export interface TimelineProps {
	parser: AsyncParser;
	tick: number;
	onSetTick: (tick: number) => any;
	disabled?: boolean;
}

export const Timeline = ({parser, tick, onSetTick, disabled}) => {
	return <div class="timeline">
		<input max={parser.demo.tickCount} value={tick} class="timeline-progress" type="range" min={0}
			   onChange={(event) => {onSetTick(parseInt(event.target.value, 10))}}
			   disabled={disabled}
		/>
		<TimeLineBackground parser={parser}/>
	</div>;
}

import {AsyncParser} from "../Data/AsyncParser";
import {createSignal} from "solid-js";

function TimeLineBackground({parser}:{parser: AsyncParser}) {
	const length = Math.floor(parser.demo.tickCount / 30);
	const blueHealth = new Uint16Array(length);
	const redHealth = new Uint16Array(length);
	let index = 0;
	let maxHealth = 0;
	for (let tick = 0; tick < parser.demo.tickCount; tick += 30) {
		index++;
		const players = parser.getPlayersAtTick(tick);
		for (const player of players) {
			if (player.team === 2) {
				redHealth[index] += player.health;
			} else if (player.team === 3) {
				blueHealth[index] += player.health;
			}
		}
		if (blueHealth[index] > 0 && redHealth[index] > 0) {
			maxHealth = Math.max(maxHealth, blueHealth[index], redHealth[index]);
		}
	}

	let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	let redStroke = darkMode ? '#ff756bff' : '#ff000088';
	let blueStroke = darkMode ? '#7378ffff' : '#0000ff88';

	const redHealthPath = redHealth.reduce(pathReducer, 'M 0 0');
	const blueHealthPath = blueHealth.reduce(pathReducer, 'M 0 0');

	return (
		<svg class="timeline-background"
		     viewBox={`0 0 ${length} ${maxHealth}`}
		     preserveAspectRatio="none">
			<path d={redHealthPath} stroke={redStroke} stroke-width={2}
			      fill="transparent"
			      vector-effect="non-scaling-stroke"/>
			<path d={blueHealthPath} stroke={blueStroke} stroke-width={2}
			      fill="transparent"
			      vector-effect="non-scaling-stroke"/>
		</svg>);
}

function pathReducer(path, y, x) {
	return `${path} L ${x} ${y}`
}
