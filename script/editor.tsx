import {ready} from './ready';
import {DemoHead, parseHeaderFromBuffer, readFile} from './header';
import {render} from "solid-js/web";
import {count_ticks} from "./edit/tools";
import {Editor} from "./edit/EditPage";

ready(async () => {
    document.querySelectorAll('.onlyscript').forEach(e => e.classList.remove('onlyscript'));
    const fileInput: HTMLInputElement | null = document.querySelector(`.dropzone input[type="file"]`);
    const drop_text = document.querySelector(`.dropzone .text`);

    fileInput.addEventListener("change", async (event: InputEvent) => {
        let file = (event.target as HTMLInputElement).files[0];
        drop_text.textContent = `processing ${file.name}...`;
        const data = await readFile(file);
        const header = parseHeaderFromBuffer(data);

        if (header.type === "HL2DEMO" && header.game === "tf") {
            if (header.ticks < 100) {
                header.ticks =  await count_ticks(data);
            }
            drop_text.textContent = file.name;
            editor(file.name, data, header, text => {
                drop_text.textContent = text;
            });
        } else {
            drop_text.textContent = "Malformed demo or not a TF2 demo";
        }
    });
})

const editor = async (name: string, data: ArrayBuffer, header: DemoHead, setDropText: (string) => void) => {
    console.log(header);

    const page = document.querySelector('.edit-page .placeholder');

    render(() => <Editor name={name} demoData={data} header={header} setDropText={setDropText} />, page);
}