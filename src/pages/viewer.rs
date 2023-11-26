use crate::data::demo::Demo;
use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup};
use std::borrow::Cow;

pub struct ViewerPage<'a> {
    pub demo: Option<Demo>,
    pub maps: &'a str,
}

#[derive(Asset)]
#[asset(source = "script/viewer.tsx", url = "/viewer.js")]
pub struct ViewerScript;

#[derive(Asset)]
#[asset(
    source = "script/viewer/Analyse/Data/ParseWorker.ts",
    url = "/parse-worker.js"
)]
pub struct ParseWorkerScript;

#[derive(Asset)]
#[asset(source = "style/pages/viewer.css", url = "/viewer.css")]
pub struct ViewerStyle;

#[derive(Asset)]
#[asset(
    source = "node_modules/@demostf/tf-demos-viewer/tf_demos_viewer_bg.wasm",
    url = "/tf-demo-viewer.wasm"
)]
pub struct ParserWasm;

impl Page for ViewerPage<'_> {
    fn title(&self) -> Cow<'static, str> {
        format!(
            "{} - demos.tf",
            self.demo
                .as_ref()
                .map(|demo| demo.server.as_str())
                .unwrap_or("Viewer")
        )
        .into()
    }

    fn render(&self) -> Markup {
        let script = ViewerScript::url();
        let style_url = ViewerStyle::url();
        let maps = self.maps;
        html! {
            .viewer-page data-maps = (maps) {
                @if let Some(demo) = self.demo.as_ref() {
                    input type = "hidden" name = "url" value = (demo.url) {}
                    progress.download min = "0" max = "100" value = "0" {}
                } @else {
                    .dropzone role = "button" {
                        noscript {
                            "Javascript is required to view a demo."
                        }
                        span.text.onlyscript { "Drop files or click to view" }
                        input.onlyscript type = "file" {}
                    }
                }
                progress.parse.onlyscript min = "0" max = "100" value = "0" {}
            }
            script module src = (script) type = "text/javascript" {}
            link rel="stylesheet" type="text/css" href=(style_url);
        }
    }
}
