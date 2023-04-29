import {CenteredPanZoom} from './CenteredPanZoom';
import {createSignal, ParentProps} from "solid-js";

export interface PannerProps {
	width: number;
	height: number;
	scale: number;
	contentSize: {
		width: number;
		height: number;
	};
	onScale?: (scale: number) => any;
}

export const Panner = (props: ParentProps<PannerProps>) => {
	const [scale, setScale] = createSignal(0);
	const [translateX, setTranslateX] = createSignal(0);
	const [translateY, setTranslateY] = createSignal(0);

	const panner = new CenteredPanZoom({
		screenHeight: props.height,
		screenWidth: props.width,
		scale: props.scale,
		contentSize: props.contentSize
	});

	let startX = 0;
	let startY = 0;

	const mouseMove = (event) => {
		const {pageX, pageY} = event;
		panner.panFrom(
			{
				x: startX,
				y: startY
			},
			{
				x: pageX,
				y: pageY
			}
		);
		startX = event.pageX;
		startY = event.pageY;

		setTranslateX(Math.floor(panner.viewport.x));
		setTranslateY(Math.floor(panner.viewport.y));
		setScale(panner.scale);
	}

	const mouseDown = (event) => {
		startX = event.pageX;
		startY = event.pageY;

		const mouseUp = () => {
			document.removeEventListener('mouseup', mouseUp, true);
			document.removeEventListener('mousemove', mouseMove, true);
		};
		document.addEventListener('mouseup', mouseUp, true);
		document.addEventListener('mousemove', mouseMove, true);
	}

	const applyZoom = (factor: number, center) => {
		panner.zoom(factor, center);

		setTranslateX(panner.viewport.x);
		setTranslateY(panner.viewport.y);
		setScale(panner.scale);

		props.onScale(panner.scale);
	}

	const mouseWheel = (event) => {
		event.preventDefault();
		const center = {x: event.pageX, y: event.pageY};
		let zoomFactor = (event.deltaY < 0) ? 1.05 : 0.95;

		const factor = scale() * zoomFactor;
		applyZoom(factor, center);
	}

	const center = () => ({
		x: Math.floor(panner.screen.width / 2),
		y: Math.floor(panner.screen.height / 2)
	});

	const pannerStyle = () => {
		console.log(props.width, props.height, props.scale);
		return {width: `${props.width}px`, height: `${props.height}px`}
	};

	return (
		<div class="pan-zoom-element"
			 style={pannerStyle()}
			 onMouseDown={mouseDown}
			 onWheel={mouseWheel}>
			<div class="content-container noselect"
				 style={{
					 transform: `translate(${translateX()}px, ${translateY()}px) scale(${scale()})`,
					 "transform-origin": 'top left'
				 }}>
				{props.children}
			</div>
			<div class="zoommenu">
				<div class="plus"
					 onClick={() => {
						 applyZoom(1.10, center())
					 }}>+
				</div>
				<div class="minus"
					 onClick={() => {
						 applyZoom(0.90, center())
					 }}>
					-
				</div>
			</div>
		</div>
	);
}