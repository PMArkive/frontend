export interface DemoHead {
    type: string;
    server: string;
    nick: string;
    map: string;
    game: string;
    duration: number;
    ticks: number;
}

DataView.prototype["getString"] = function(offset: number, length: number): String{
    let end = typeof length == 'number' ? offset + length : this.byteLength;
    let text = '';
    let val = -1;

    while (offset < this.byteLength && offset < end){
        val = this.getUint8(offset++);
        if (val === 0) break;
        text += String.fromCharCode(val);
    }

    return text;
};

export interface GetStringDataView extends DataView {
    getString: (offset: number, length: number) => string;
}

export async function parseHeader(file): Promise<DemoHead> {
    const data = await readFile(file);
    const view = new DataView(data) as GetStringDataView;
    return {
        'type': view.getString(0, 8),
        'server': view.getString(16, 260),
        'nick': view.getString(276, 260),
        'map': view.getString(536, 260),
        'game': view.getString(796, 260),
        'duration': view.getFloat32(1056, true),
        'ticks': view.getUint32(1060, true),
    };
}

async function readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result)
        };
        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
    });
}