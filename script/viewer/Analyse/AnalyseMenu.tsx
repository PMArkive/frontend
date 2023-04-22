export interface AnalyseMenuProps {
	sessionName: string;
	onShare: Function;
	canShare: boolean;
	isShared: boolean;
}

export function AnalyseMenu({sessionName, onShare, canShare, isShared}:AnalyseMenuProps) {

	const loc = window.location.toString().replace(/\#.+/, '') + '#' + sessionName;
	const shareText = (isShared) ?
		<input class="share-text" value={loc} readOnly={true}
		       title="Use this link to join the current session"
		       style={{width: `${(loc.length*8)}px`}}
		       onFocus={(event)=>{(event.target as HTMLInputElement).select()}}/> : '';

	const shareButton = (canShare) ? <div class="analyse-menu">
			<button class="share-session" title="Start a shared session"
			        onClick={()=>{onShare()}}/>
			{shareText}
		</div>: '';

	return (<div>
		{shareButton}
	</div>)
}
