use crate::asset::saved_asset_url;
use crate::data::demo::ListDemo;
use crate::pages::Page;
use maud::{html, Markup};
use std::borrow::Cow;

pub struct Index {
    pub demos: Vec<ListDemo>,
}

impl Page for Index {
    fn title(&self) -> Cow<'static, str> {
        "Demos - demos.tf".into()
    }

    fn render(&self) -> Markup {
        let script = saved_asset_url!("demo_list.js");
        html! {
            h1 { "Demos" }
            .filter-bar {}
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
