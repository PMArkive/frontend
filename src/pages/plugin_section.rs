use maud::{html, Markup, Render};

pub struct PluginSection<'a> {
    pub key: Option<&'a str>,
}

impl Render for PluginSection<'_> {
    fn render(&self) -> Markup {
        html! {
            section {
                .title {
                    h3 { "Plugin" }
                }
                p {
                    "The demos.tf server plugin automatically uploads any stv demo recorded on the server and makes it"
                    "available for download."
                }
                p {
                    "Note that the plugin does "
                    u { "not" }
                    " automatically record demos on it's own but relies on other plugins like "
                    a href = "http://teamfortress.tv/thread/13598/?page=1#post-1" { "F2's RecordSTV" }
                    " to manage the recording of stv demos"
                }
                h5 { "How to install" }
                ol {
                    li {
                        "Make sure "
                        a href = "http://wiki.alliedmods.net/Installing_SourceMod" { "SourceMod" }
                        " is installed on your server."
                    }
                    li {
                        "Make sure the "
                        a href = "https://github.com/sapphonie/SM-neocurl-ext" { "cURL extension" }
                        " is installed on your server."
                    }
                    li {
                        "Download the "
                        a href = "https://github.com/demostf/plugin" { "plugin"}
                        "."
                    }
                    li {
                        "Upload the .smx file to "
                        code { "/tf/addons/sourcemod/plugins/" }
                        " on your server."
                    }
                    @if self.key.is_none() {
                        li {
                            "Login to retrieve your api-key."
                        }
                    }
                    li {
                        "Add the following code to"
                        code { "/tf/cfg/server.cfg" }
                        " on the server:"
                        pre {
                            "sm_demostf_apikey "
                            @if let Some(key) = self.key {
                                (key)
                            } @else {
                                "<<API KEY>>"
                            }
                        }
                    }
                    li {
                        "Restart the server."
                    }
                }
                a.button.button-primary href = "https://github.com/demostf/plugin/raw/master/demostf.smx" { "Download" }
                a.button href = "https://github.com/demostf/plugin/raw/master/demostf.sp" { "Source" }
            }
        }
    }
}
