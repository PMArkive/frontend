import {Panner} from "../Panner/Panner";
import {createEffect, createSignal, ParentProps, Show} from "solid-js";
import { createElementSize } from "@solid-primitives/resize-observer";

export interface MapContainerProps {
    contentSize: {
        width: number;
        height: number;
    };
    onScale?: (scale: number) => any;
}

export const MapContainer = (props: ParentProps<MapContainerProps>) => {
    const [container, setContainer] = createSignal<Element>();
    const size = createElementSize(container);
    const scale = () => {
        if (size.width && size.height) {
            return Math.min(size.width / props.contentSize.width, size.height / props.contentSize.height);
        } else {
            return 1;
        }
    }
    createEffect(() => {
        const s = scale();
        if (isFinite(s)) {
            props.onScale && props.onScale(s);
        }
    });

    return (
        <div class="map-container" ref={setContainer}>
            <Show when={size.width}>
                <Panner width={size.width} height={size.height}
                        scale={scale()} contentSize={props.contentSize}
                        onScale={props.onScale}>
                    {props.children}
                </Panner>
            </Show>
        </div>
    )
}
