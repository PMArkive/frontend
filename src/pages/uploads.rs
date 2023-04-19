use crate::data::demo::ListDemo;
use crate::data::user::User;
use crate::fragments::demo_list::DemoList;
use crate::pages::index::{DemoListScript, MapList};
use crate::pages::Page;
use demostf_build::Asset;
use maud::{html, Markup, Render};
use std::borrow::Cow;

pub struct Uploads<'a> {
    pub user: User,
    pub demos: &'a [ListDemo],
    pub maps: &'a [String],
    pub api: &'a str,
}

impl<'a> Uploads<'a> {
    fn map_list(&self) -> impl Render + 'a {
        MapList(&self.maps)
    }
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
            #filter-bar data-maps = (self.map_list()) data-api-base = (self.api) {}
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
