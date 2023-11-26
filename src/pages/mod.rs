pub mod about;
pub mod api;
pub mod demo;
pub mod edit;
pub mod index;
mod plugin_section;
pub mod profile;
pub mod upload;
pub mod uploads;
pub mod viewer;

use crate::session::SessionData;
use demostf_build::Asset;
use maud::{html, Markup, DOCTYPE};
use std::borrow::Cow;

pub trait Page {
    fn title(&self) -> Cow<'static, str>;
    fn render(&self) -> Markup;
}

#[derive(Asset)]
#[asset(source = "style/style.css", url = "/style.css")]
pub struct GlobalStyle;

pub fn render<T: Page>(page: T, session: SessionData) -> Markup {
    let style_url = GlobalStyle::url();
    html! {
        (DOCTYPE)
        html lang = "en" {
            head {
                meta name = "viewport" content = "initial-scale=1,width=device-width";
                title { (page.title()) }
                link rel="stylesheet" type="text/css" href=(style_url);
                link rel="shortcut icon" type="image/svg+xml" href="/images/logo.svg";
            }
            body {
                header {
                    span .main {
                        a href = "/" { "demos.tf" }
                    }
                    span { a href = "/about" { "about" } }
                    span { a href = "/viewer" { "viewer" } }
                    span.beta { a href = "/edit" { "editor" } }
                    @if let SessionData::Authenticated(user) = session {
                        span.right { a href = "/logout" { "Logout" } }
                        span.right { a href = "/upload" { "Upload" } }
                        span.right { a href = (user.steam_id.profile_link()) { (user.name) } }
                    } @else {
                        span.right { a.steam-login href = "/login" { "Sign in through Steam" } }
                    }
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
