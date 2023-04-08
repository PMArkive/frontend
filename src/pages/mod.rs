pub mod demo;
pub mod index;

use crate::asset::saved_asset_url;
use maud::{html, Markup, DOCTYPE};
use std::borrow::Cow;

pub trait Page {
    fn title(&self) -> Cow<'static, str>;
    fn render(&self) -> Markup;
}

pub fn render<T: Page>(page: T) -> Markup {
    let style_url = saved_asset_url!("style.css");
    html! {
        (DOCTYPE)
        html {
            head {
                title { (page.title()) }
                link rel="stylesheet" type="text/css" href=(style_url);
                link rel="shortcut icon" type="image/svg+xml" href="images/logo.svg";
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
