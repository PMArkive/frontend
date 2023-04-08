pub mod demo;
pub mod index;

use maud::{html, Markup, DOCTYPE};
use std::borrow::Cow;

pub trait Page {
    fn title(&self) -> Cow<'static, str>;
    fn render(&self) -> Markup;
}

pub fn render<T: Page>(page: T) -> Markup {
    let style_url = concat!(
        "/style.",
        include_str!(concat!(env!("OUT_DIR"), "/style.md5")),
        ".css",
    );
    html! {
        (DOCTYPE)
        html {
            head {
                title { (page.title()) }
                link rel="stylesheet" type="text/css" href=(style_url);
            }
            body {
                header {
                    span .main {
                        a href = "/" { "demos.tf" }
                    }
                    span { a href = "/about" { "about" } }
                    span { a href = "/viewer" { "viewer" } }
                    span.beta { a href = "/editor" { "editor" } }
                    span.right { a.steam-login href = "/login" { "Sign in through Steam" } }
                }
                .page { (page.render()) }
            }
            footer {
                "©"
                a href = "https://steamcommunity.com/id/icewind1991" { "Icewind" }
                " 2017."
            }
        }
    }
}
