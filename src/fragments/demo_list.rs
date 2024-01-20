use crate::data::demo::ListDemo;
use maud::{html, Markup, Render};
use std::fmt::{Debug, Formatter};

pub struct DemoList<'a> {
    pub demos: &'a [ListDemo],
}

impl<'a> DemoList<'a> {
    pub fn new(demos: &'a [ListDemo]) -> Self {
        DemoList { demos }
    }
}

impl Debug for DemoList<'_> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.debug_list()
            .entries(self.demos.iter().map(|d| d.id))
            .finish()
    }
}

impl Render for DemoList<'_> {
    fn render(&self) -> Markup {
        html! {
            @for demo in self.demos {
                tr data-id = (demo.id) {
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
