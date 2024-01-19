use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup};
use std::borrow::Cow;

#[derive(Debug)]
pub struct EditorPage;

#[derive(Asset)]
#[asset(source = "script/editor.tsx", url = "/editor.js")]
pub struct EditorScript;

#[derive(Asset)]
#[asset(source = "script/edit/EditWorker.ts", url = "/edit-worker.js")]
pub struct EditWorkerScript;

#[derive(Asset)]
#[asset(source = "style/pages/editor.css", url = "/editor.css")]
pub struct EditorStyle;

#[derive(Asset)]
#[asset(
    source = "node_modules/@demostf/edit/edit_bg.wasm",
    url = "/tf-demo-editor.wasm"
)]
pub struct EditWasm;

impl Page for EditorPage {
    fn title(&self) -> Cow<'static, str> {
        "Edit - demos.tf".into()
    }

    fn render(&self) -> Markup {
        let script = EditorScript::url();
        let style_url = EditorStyle::url();
        html! {
            .edit-page {
                p.page-note {
                    "To edit a demo, select a file on your computer, select the desired options and press the \"edit\" button."
                }
                .dropzone role = "button" {
                    noscript {
                        "Javascript is required to edit a demo."
                    }
                    span.text.onlyscript { "Drop files or click to view" }
                    input.onlyscript type = "file" {}
                }
                .placeholder {}
            }
            script module src = (script) type = "text/javascript" {}
            link rel="stylesheet" type="text/css" href=(style_url);
        }
    }
}
