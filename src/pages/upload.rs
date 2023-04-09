use crate::pages::plugin_section::PluginSection;
use crate::pages::Page;
use maud::{html, Markup};
use std::borrow::Cow;

pub struct UploadPage {
    pub key: String,
}

impl UploadPage {
    pub fn plugin_section(&self) -> PluginSection {
        PluginSection {
            key: Some(self.key.as_str()),
        }
    }
}

impl Page for UploadPage {
    fn title(&self) -> Cow<'static, str> {
        "Upload - demos.tf".into()
    }

    fn render(&self) -> Markup {
        html! {
            .upload-page {
                section.upload {
                    .teams {
                        .red {
                            input type = "text" name = "red" placeholder = "RED";
                        }
                        .blue {
                            input type = "text" name = "blue" placeholder = "BLU";
                        }
                        .clearfix {}
                    }
                    .dropzone role = "button" {
                        noscript {
                            "Javascript is required for demo upload."
                        }
                        "Drop files or click to upload"
                    }
                    button.button.button-primary disabled { "Upload" }
                }
                section {
                    .title {
                        h3 { "API Key" }
                    }
                    pre { (self.key) }
                    p { "This key is used by the plugin to authenticate you as the uploader and link the uploaded demo to your account." }
                }
                (self.plugin_section())
            }
        }
    }
}
