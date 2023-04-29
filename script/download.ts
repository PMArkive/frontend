export async function download(url: string, progress: (number) => void): Promise<ArrayBuffer> {
    const response = await fetch(url, {mode: 'cors'});

    if (!response.body || !response.headers) {
        throw new Error("invalid response");
    }
    const contentLength = +(response.headers.get('Content-Length') || 0);
    let receivedLength = 0;

    let data = new Uint8Array(contentLength);

    const reader = response.body.getReader();

    while(true) {
        const {done, value} = await reader.read();

        if (done) {
            break;
        }

        data.set(value, receivedLength);
        receivedLength += value.length;

        progress((receivedLength / contentLength) * 100);
    }

    return data.buffer;
}