import {ready} from './ready';
import {parseHeaderFromBuffer, readFile} from './header';
import {download} from "./download";
import {AsyncParser} from "./viewer/Analyse/Data/AsyncParser";
import {render} from "solid-js/web";
import {Analyser} from "./viewer/Analyse/Analyser";
import {loadMapData} from "./viewer/Analyse/MapBoundries";

ready(async () => {
    let mapPromise = loadMapData();
    document.querySelectorAll('.onlyscript').forEach(e => e.classList.remove('onlyscript'));
    const fileInput: HTMLInputElement | null = document.querySelector(`.dropzone input[type="file"]`);
    const urlInput: HTMLInputElement | null = document.querySelector(`.viewer-page input[name="url"]`);
    const drop_text = document.querySelector(`.dropzone .text`);
    const downloadProgress: HTMLProgressElement = document.querySelector(`progress.download`);
    const parseProgress: HTMLProgressElement = document.querySelector(`progress.parse`);

    if (fileInput) {
        fileInput.addEventListener("change", async (event: InputEvent) => {
            let file = (event.target as HTMLInputElement).files[0];
            drop_text.textContent = file.name;
            const data = await readFile(file);
            const header = parseHeaderFromBuffer(data);

            if (header.type === "HL2DEMO" && header.game === "tf") {
                drop_text.textContent = "Parsing...";
                await mapPromise;
                parse(data, parseProgress, false);
            } else {
                drop_text.textContent = "Malformed demo or not a TF2 demo";
            }
        });
    } else {
        const url = urlInput.value;
        console.log(url);
        const data = await download(url, (progress) => downloadProgress.value = progress);
        await mapPromise;
        parse(data, parseProgress, true);
    }
})

const parse = async (data: ArrayBuffer, parseProgress: HTMLProgressElement, stored: boolean) => {
    const header = parseHeaderFromBuffer(data);
    console.log(header);
    const parser = new AsyncParser(data, (progress) => parseProgress.value = progress);
    await parser.cache();

    const page = document.querySelector('.viewer-page');

    render(() => <Analyser parser={parser} header={header} isStored={stored}/>, page);
}
