import {Panner} from "../Panner/Panner";
import {createEffect, createSignal} from "solid-js";

export class MapContainerProps {
    contentSize: {
        width: number;
        height: number;
    };
    onScale?: (scale: number) => any;
    children: Element;
}

export const MapContainer = ({children, contentSize, onScale}: MapContainerProps) => {
    const [container, setContainer] = createSignal<Element>();
    const scale = () => Math.min(
        container().clientWidth / contentSize.width,
        container().clientHeight / contentSize.height
    );
    createEffect(() => {
        if (isFinite(scale())) {
            onScale && onScale(scale());
        }
    });

    return (
        <div class="map-container" ref={setContainer}>
            <Panner width={container().clientWidth} height={container().clientHeight}
                    scale={scale()} contentSize={contentSize}
                    onScale={onScale}>
                {children}
            </Panner>
        </div>
    )
}