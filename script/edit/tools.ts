export interface EditOptions {
    unlock_pov: boolean,
    cut?: TickRange,
}

export interface TickRange {
    from: number,
    to: number,
}

function getCacheBuster(): string {
    const url = document.querySelector('script[src*="editor"]').attributes.src.value;
    return url.substring("/editor.js".length);
}

export function edit(data: ArrayBuffer, options: EditOptions): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`/edit-worker.js${getCacheBuster()}`);
        worker.postMessage({
            buffer: data,
            options
        });
        worker.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
                return;
            } else if (event.data.buffer) {
                resolve(event.data.buffer);
            }
        }
    });
}

export function count_ticks(data: ArrayBuffer): Promise<number> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`/edit-worker.js${getCacheBuster()}`);
        worker.postMessage({
            buffer: data,
            count: true
        });
        worker.onmessage = (event) => {
            if (event.data.error) {
                reject(event.data.error);
                return;
            } else if (event.data.ticks) {
                resolve(event.data.ticks);
            }
        }
    });
}

export function downloadBuffer(arrayBuffer: ArrayBuffer, fileName: string) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(
        [arrayBuffer],
    ))
    a.download = fileName
    a.click()
}