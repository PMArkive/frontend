use crate::data::maps::MapList;
use crate::fragments::demo_list::DemoList;
use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup};
use std::borrow::Cow;

#[derive(Debug)]
pub struct Index<'a> {
    pub demos: DemoList<'a>,
    pub maps: &'a MapList,
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
            #filter-bar data-maps = (self.maps) data-api-base = (self.api) {}
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
                    (self.demos)
                }
            }
            button #load-more { "Load more.." }
            script defer src = (script) type = "text/javascript" {}
        }
    }
}
