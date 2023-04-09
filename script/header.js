DataView.prototype.getString = function(offset, length){
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

export async function parseHeader(file, cb) {
    const data = await readFile(file);
    const view = new DataView(data);
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

async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result)
        };
        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
    });
}