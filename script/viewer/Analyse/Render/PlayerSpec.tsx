import {PlayerState} from "../Data/Parser";
import {KillFeedItem} from "./KillFeed";

export interface PlayerSpecProps {
	player: PlayerState;
}

const healthMap = {
	0: 100, //fallback
	1: 125, //scout
	2: 150, //sniper
	3: 200, //soldier,
	4: 175, //demoman,
	5: 150, //medic,
	6: 300, //heavy,
	7: 175, //pyro
	8: 125, //spy
	9: 125, //engineer
};

const classMap = {
	1: "scout",
	2: "sniper",
	3: "soldier",
	4: "demoman",
	5: "medic",
	6: "heavy",
	7: "pyro",
	8: "spy",
	9: "engineer"
};

const classSort = {
	1: 1, //scout
	3: 2, //soldier
	7: 3, //pyro
	4: 4, //demoman
	6: 5, //heavy
	9: 6, //engineer
	5: 7, //medic
	2: 8, //sniper
	8: 9, //spy
};

const teamMap = {
	0: "other",
	1: "spectator",
	2: "red",
	3: "blue",
}

export interface PlayersSpecProps {
	players: PlayerState[];
}

function sortPlayer(a, b) {
	return classSort[a.playerClass] - classSort[b.playerClass];
}
function filterPlayers(players: PlayerState[], team: number): PlayerState[] {
	const filtered = players.filter((player) => player.team === team);
	filtered.sort(sortPlayer);
	return filtered;
}
function medics(players: PlayerState[]): PlayerState[] {
	return players.filter(player => player.playerClass === 5);
}

export function PlayersSpec(props: PlayersSpecProps) {
	const redPlayers = () => filterPlayers(props.players, 2);
	const bluePlayers = () => filterPlayers(props.players, 3);
	const redMedics = () => medics(redPlayers());
	const blueMedics = () => medics(bluePlayers());

	return (<div>
		<div class="redSpecHolder">
			<For each={redPlayers()}>{(player) =>
				<PlayerSpec player={player}/>
			}</For>
			<For each={redMedics()}>{(player) =>
				<UberSpec
					team={teamMap[player.team]}
					chargeLevel={player.charge}
					isDeath={player.health < 1}
				/>
			}</For>
		</div>
		<div class="blueSpecHolder">
			<For each={bluePlayers()}>{(player) =>
				<PlayerSpec player={player}/>
			}</For>
			<For each={blueMedics()}>{(player) =>
				<UberSpec
					team={teamMap[player.team]}
					chargeLevel={player.charge}
					isDeath={player.health < 1}
				/>
			}</For>
		</div>
	</div>);
}

export function PlayerSpec({player}: PlayerSpecProps) {
	const healthPercent = Math.min(100, player.health / healthMap[player.playerClass] * 100);
	const healthStatusClass = (player.health > healthMap[player.playerClass]) ? 'overhealed' : (player.health <= 0 ? 'dead' : '');

	return (
		<div
			class={"playerspec " + teamMap[player.team] + " webp " + healthStatusClass}>
			{getPlayerIcon(player)}
			<div class="health-container">
				<div class="healthbar"
					 style={{width: healthPercent + '%'}}/>
				<span class="player-name">{player.info.name}</span>
				<span class="health">{player.health}</span>
			</div>
		</div>
	);
}

function getPlayerIcon(player: PlayerState) {
	if (classMap[player.playerClass]) {
		return <div class={classMap[player.playerClass] + " class-icon"}/>
	} else {
		return <div class={"class-icon"}/>
	}
}

export interface UberSpecProps {
	chargeLevel: number;
	team: string;
	isDeath: boolean;
}

export function UberSpec({chargeLevel, team, isDeath}: UberSpecProps) {
	const healthStatusClass = (isDeath) ? 'dead' : '';
	return (
		<div class={`playerspec uber ${team} ${healthStatusClass}`}>
			<div class={"uber class-icon"}/>
			<div class="health-container">
				<div class="healthbar"
					 style={{width: chargeLevel + '%'}}/>
				<span class="player-name">Charge</span>
				<span class="health">{Math.round(chargeLevel)}</span>
			</div>
		</div>
	);
}
