import init from "@demostf/edit";
import {count_ticks, edit_js} from "@demostf/edit";

declare function postMessage(message: any, transfer?: any[]): void;

function getCacheBuster(): string {
	const url = self.location.href;
	return url.substring(url.indexOf('?'));
}

/**
 * @global postMessage
 * @param event
 */
onmessage = async (event: MessageEvent) => {
	await init(`/tf-demo-editor.wasm${getCacheBuster()}`);
	if (event.data.count) {
		const buffer: ArrayBuffer = event.data.buffer;
		const bytes = new Uint8Array(buffer);
		try {
			const ticks = count_ticks(bytes);
			postMessage({
				ticks: ticks
			});
		} catch(e) {
			postMessage({
				error: e
			});
		}
	} else {
		const buffer: ArrayBuffer = event.data.buffer;
		const options = event.data.options;
		const bytes = new Uint8Array(buffer);
		try {
			const edited = edit_js(bytes, options);
			postMessage({
				buffer: edited.buffer
			}, [edited.buffer]);
		} catch (e) {
			postMessage({
				error: e
			});
		}
	}
};
