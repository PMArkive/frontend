import {ready} from './ready';
import {parseHeader} from './header';
import {formatDuration} from './time';

ready(() => {
    const red_name: HTMLInputElement = document.querySelector(".red input");
    const blue_name: HTMLInputElement = document.querySelector(".blue input");
    const file: HTMLInputElement = document.querySelector(`.dropzone input[type="file"]`);
    const drop_text = document.querySelector(`.dropzone .text`);
    const button = document.querySelector(`.upload > button`);
    const map = document.querySelector(`.demo-info .map`);
    const time = document.querySelector(`.demo-info .time`);
    const apiBase = (document.querySelector(`input[name="api"]`) as HTMLInputElement).value;
    const key = document.querySelector(`.key`).textContent;
    let selectedFile = null;
    console.log(key);

    file.addEventListener("change", async (event: InputEvent) => {
        let file = event.target.files[0];
        drop_text.textContent = file.name;
        const header = await parseHeader(file)

        if (header.type === "HL2DEMO" && header.game === "tf") {
            map.textContent = header.map;
            time.textContent = formatDuration(header.duration);
            button.removeAttribute("disabled")
            selectedFile = file;
        } else {
            drop_text.textContent = "Malformed demo or not a TF2 demo";
            map.textContent = "";
            time.textContent = "";
            button.setAttribute("disabled", "disabled");
            selectedFile = null;
        }
    });
    button.addEventListener("click", async () => {
        button.setAttribute("disabled", "disabled");
        if (!selectedFile) {
            return;
        }
        drop_text.textContent = "Uploading...";

        try {
            window.location.href = await uploadDemo(apiBase, key, red_name.value || 'RED', blue_name.value || 'BLU', selectedFile.name, selectedFile);
        } catch (e) {
            drop_text.textContent = `Error ${e.message}`;
        }
    });
})

async function uploadDemo(apiBase, key, red, blue, name, demo) {
    const data = new FormData();
    data.append('key', key);
    data.append('red', red);
    data.append('blu', blue);
    data.append('name', name);
    data.append('demo', demo, demo.name);
    const response = await fetch(apiBase + "upload", {
        method: 'POST',
        body: data
    });
    if (response.status >= 400) {
        throw new Error(await response.text());
    }
    const body = await response.text();
    const matches = body.match(/STV available at: https?:\/\/[^/]+\/(\d+)/);
    if (matches) {
        return matches[1];
    } else {
        throw new Error(body);
    }
}