use crate::data::user::Token;
use crate::pages::plugin_section::PluginSection;
use crate::pages::Page;
use maud::{html, Markup};
use std::borrow::Cow;

#[derive(Debug)]
pub struct AboutPage {
    pub key: Option<Token>,
}

impl AboutPage {
    pub fn plugin_section(&self) -> PluginSection {
        PluginSection {
            key: self.key.as_ref(),
        }
    }
}

impl Page for AboutPage {
    fn title(&self) -> Cow<'static, str> {
        "About - demos.tf".into()
    }

    fn render(&self) -> Markup {
        html! {
            div {
                section {
                    .title {
                        h3 { "About" }
                    }
                    p {
                        "demos.tf is a hosting platform for Team Fortress 2 demo files and automatic stv demo uploader."
                    }
                }
                section {
                    .title {
                        h3 { "Contact" }
                    }
                    p {
                        "Contact us using any of the following methods for feedback or questions."
                    }

                    p {
                        a href = "https://steamcommunity.com/id/icewind1991" { "Steam" }
                        " "
                        a href = "mailto:icewind@demos.tf" { "Email" }
                        " "
                        a href = "https://github.com/demostf" { "Github" }
                    }
                }
                (self.plugin_section())
                section {
                    .title {
                        h3 { "Reporting issues" }
                    }
                    p {
                        "Any issue, bug or suggestion can be reported over on "
                        a href = "https://github.com/demostf/frontend/issues" { "Github" }
                        "."
                    }
                }
                section {
                    .title {
                        h3 { "API" }
                    }
                    p {
                        "The demos.tf data is available to 3rd parties using a REST api."
                    }

                    p {
                        "See the "
                        a href = "/api" { "API Documentation" }
                        " for details."
                    }
                }
                section {
                    .title {
                        h3 { "Donate" }
                    }
                    p {
                        "Storing demos isn't free, you can help paying the server costs by donating using PayPal."
                    }
                    form.paypal action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" {
                        input type = "hidden" name = "cmd" value = "_s-xclick";
                        input type = "hidden" name = "encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----";
                        input.button.button-primary type = "submit" name = "submit" value = "Donate" title = "PayPal - The safer, easier way to pay online!";
                    }
                }
            }
        }
    }
}
