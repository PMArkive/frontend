use crate::data::demo::ListDemo;
use maud::{html, Markup, Render};

pub struct DemoList {
    pub demos: Vec<ListDemo>,
}

impl Render for DemoList {
    fn render(&self) -> Markup {
        html! {
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
}
