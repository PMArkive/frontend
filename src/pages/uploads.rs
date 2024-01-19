use crate::data::demo::ListDemo;
use crate::data::maps::MapList;
use crate::data::user::User;
use crate::fragments::demo_list::DemoList;
use crate::pages::index::DemoListScript;
use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup, Render};
use std::borrow::Cow;

#[derive(Debug)]
pub struct Uploads<'a> {
    pub user: User,
    pub demos: &'a [ListDemo],
    pub maps: &'a MapList,
    pub api: &'a str,
}

impl<'a> Uploads<'a> {
    fn demo_list(&self) -> impl Render + 'a {
        DemoList { demos: self.demos }
    }
}

impl Page for Uploads<'_> {
    fn title(&self) -> Cow<'static, str> {
        format!("Uploads by {} - demos.tf", self.user.name).into()
    }

    fn render(&self) -> Markup {
        let script = DemoListScript::url();
        html! {
            h1 {
                "Uploads by "
                (self.user.name)
            }
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
                    (self.demo_list())
                }
            }
            button #load-more { "Load more.." }
            script defer src = (script) type = "text/javascript" {}
        }
    }
}
