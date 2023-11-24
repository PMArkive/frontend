import {createEffect, createSignal} from "solid-js";

export interface SliderProps {
	min: number,
	max: number,
	onChange: (min: number, max: number) => void,
	labelFn?: (value: number) => string,
}

const MultiRangeSlider = (props: SliderProps) => {
	if (!props.labelFn) {
		props.labelFn = (_val) => '';
	}
	const [minVal, setMinVal] = createSignal<number>(props.min);
	const [maxVal, setMaxVal] = createSignal<number>(props.max);
	let range;

	// Convert to percentage
	const getPercent = (value) => Math.round(((value - props.min) / (props.max - props.min)) * 100);

	// Set width of the range to decrease from the left side
	createEffect(() => {
		const minPercent = getPercent(minVal());
		const maxPercent = getPercent(maxVal());

		if (range) {
			range.style.left = `${minPercent}%`;
			range.style.width = `${maxPercent - minPercent}%`;
		}
	});

	// Set width of the range to decrease from the right side
	createEffect(() => {
		const minPercent = getPercent(minVal());
		const maxPercent = getPercent(maxVal());

		if (range) {
			range.style.width = `${maxPercent - minPercent}%`;
		}
	});

	// Get min and max values when their state changes
	createEffect(() => {
		props.onChange(minVal(), maxVal());
	});

	return (
		<span className="container">
			<input
				type="range"
				min={props.min}
				max={props.max}
				value={minVal()}
				onChange={(event) => {
					const value = Math.min(Number(event.target.value), maxVal() - 1);
					if (value != minVal()) {
						setMinVal(value);
					}
				}}
				className="thumb thumb--left"
				style={{ zIndex: (minVal() > props.max - 100) ? "5" : undefined }}
			/>
			<input
				type="range"
				min={props.min}
				max={props.max}
				value={maxVal()}
				onChange={(event) => {
					const value = Math.max(Number(event.target.value), minVal() + 1);
					if (value != maxVal()) {
						setMaxVal(value);
					}
				}}
				className="thumb thumb--right"
			/>

			<span className="slider">
				<span className="slider__left-input">
					<input type="number" value={minVal()} onInput={(event) => {
						const value = Math.max(Math.min(Number(event.currentTarget.value), maxVal - 1), props.min);
						console.log(event.currentTarget.value, value);
						if (value != minVal()) {
							setMinVal(value);
						}
					}}/>
				</span>
				<span className="slider__right-input">
					<input type="number" value={maxVal()} onInput={(event) => {
						console.log(event);
						const value = Math.min(Math.max(Number(event.currentTarget.value), minVal + 1), props.max);
						console.log(event.currentTarget.value, value);
						if (value != maxVal()) {
							setMaxVal(value);
						}
					}}/>
				</span>
				<span className="slider__track" />
				<span ref={range} className="slider__range" />
				<span className="slider__left-value">
					{() => props.labelFn(minVal())}
				</span>
				<span className="slider__right-value">
					{() => props.labelFn(maxVal())}
				</span>
			</span>
		</span>
	);
};

export default MultiRangeSlider;
