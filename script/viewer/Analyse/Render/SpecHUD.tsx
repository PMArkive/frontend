import {PlayersSpec} from './PlayerSpec';
import {KillFeed} from './KillFeed';
import {AsyncParser} from "../Data/AsyncParser";
import {PlayerState, Kill} from "../Data/Parser";

export interface SpecHUDProps {
	tick: number;
	parser: AsyncParser;
	players: PlayerState[];
	kills: Kill[]
}

export function SpecHUD(props: SpecHUDProps) {
	return (<div class="spechud">
		<KillFeed tick={props.tick} kills={props.kills} players={props.players}/>
		<PlayersSpec players={props.players}/>
	</div>)
}

