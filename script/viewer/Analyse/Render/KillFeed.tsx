import {Kill, PlayerState} from "@demostf/parser-worker";
import {killAlias} from "./killAlias";

export interface KillFeedProps {
	kills: Kill[],
	tick: number;
	players: PlayerState[];
}

export function KillFeed({kills, tick, players}: KillFeedProps) {
	let relevantKills: Kill[] = kills.filter(kill => kill.tick <= tick && kill.tick >= (tick - 30 * 10));

	return <div class="killfeed">
		{relevantKills.map((kill, i) => <KillFeedItem kill={kill} players={players}/>)}
	</div>
}

const teamMap = {
	0: 'unknown',
	2: 'red',
	3: 'blue'
};

export function KillFeedItem({kill, players}: { kill: Kill, players: PlayerState[] }) {
	const alias = killAlias[kill.weapon] ? killAlias[kill.weapon] : kill.weapon;
	const attacker = getPlayer(players, kill.attacker);
	const assister = getPlayer(players, kill.assister);
	let victim = getPlayer(players, kill.victim);
	let killIcon;
	try {
		killIcon = `/images/kill_icons/${alias}.png`;
	} catch (e) {
		console.log(alias);
		killIcon = `/images/kill_icons/skull.png`;
	}
	if (!victim) {
		victim = {
			team: 0,
			info: {
				name: 'Missing player'
			}
		};
	}

	return <div class="kill">
		{(attacker && kill.attacker !== kill.victim) ?
			<span class={"player " + teamMap[attacker.team]}>
				{attacker.info.name}
				</span> : ''}
		{(assister && kill.assister !== kill.victim) ?
			<span class={teamMap[assister.team]}>﹢</span> : ''}
		{(assister && kill.assister !== kill.victim) ?
			(<span class={"player " + teamMap[assister.team]}>
				{assister.info.name}
				</span>) : ''}
		<img src={killIcon} class={`kill-icon ${kill.weapon}`}/>
		<span class={"player " + teamMap[victim.team]}>
			{victim.info.name}
			</span>
	</div>
}

function getPlayer(players: PlayerState[], entityId: number): PlayerState {
	return players.find(player => player.info.userId == entityId);
}
