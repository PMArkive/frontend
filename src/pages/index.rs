use crate::data::demo::ListDemo;
use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup, Render};
use std::borrow::Cow;

pub struct Index<'a> {
    pub demos: Vec<ListDemo>,
    pub maps: Vec<String>,
    pub api: &'a str,
}

#[derive(Asset)]
#[asset(source = "script/demo_list.js", url = "/demo_list.js")]
pub struct DemoListScript;

impl Page for Index<'_> {
    fn title(&self) -> Cow<'static, str> {
        "Demos - demos.tf".into()
    }

    fn render(&self) -> Markup {
        let script = DemoListScript::url();
        html! {
            h1 { "Demos" }
            #filter-bar data-maps = (MapList(&self.maps)) data-api-base = (self.api) {}
            table.demolist {
                thead {
                    tr {
                        th .title { "Title" }
                        th .format { "Format" }
                        th .map { "Map" }
                        th .duration { "Duration" }
                        th .date { "Date" }
                    }
                }
                tbody {
                    @for demo in &self.demos {
                        tr {
                            td .title {
                                a href = (demo.url()) { (demo.server) " - " (demo.red) " vs " (demo.blu) }
                            }
                            td .format { (demo.format()) }
                            td .map { (demo.map) }
                            td .duration { (demo.duration()) }
                            td .date title = (demo.date()) { (demo.relative_date()) }
                        }
                    }
                }
            }
            script defer src = (script) type = "text/javascript" {}
        }
    }
}

struct MapList<'a>(&'a [String]);

impl Render for MapList<'_> {
    fn render_to(&self, buffer: &mut String) {
        let mut first = true;
        for map in self.0 {
            if !first {
                buffer.push_str(",");
            }
            buffer.push_str(&map);
            first = false;
        }
    }
}
