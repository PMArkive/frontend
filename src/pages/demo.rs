use crate::data::demo::Demo;
use crate::data::player::{Player, Team};
use crate::pages::Page;
use demostf_build::Asset;
use itertools::{EitherOrBoth, Itertools};
use maud::{html, Markup};
use std::borrow::Cow;

#[derive(Asset)]
#[asset(source = "style/pages/class-icons.css", url = "/class-icons.css")]
pub struct ClassIconsStyle;

#[derive(Debug)]
pub struct DemoPage {
    pub demo: Demo,
}

impl Page for DemoPage {
    fn title(&self) -> Cow<'static, str> {
        format!("{} - demos.tf", self.demo.server).into()
    }

    fn render(&self) -> Markup {
        let style_url = ClassIconsStyle::url();
        html! {
            h2 { (self.demo.server) " - " (self.demo.red) " vs " (self.demo.blu) }
            h3 { (self.demo.name) }
            p {
                "Demo uploaded by "
                a href = (self.demo.uploader_steam_id().uploads_link()) { (self.demo.uploader_name()) }
                " "
                span title = (self.demo.date()) { (self.demo.relative_date()) }
            }
            .teams {
                .red {
                    span.name { (self.demo.red) }
                    span.score { (self.demo.score_red) }
                }
                .blue {
                    span.name { (self.demo.blu) }
                    span.score { (self.demo.score_blue) }
                }
                .clearfix {}
            }
            table.players {
                thead {
                    th.team.red {}
                    th.class {}
                    th.name.red { "Name" }
                    th.stat.red { "K" }
                    th.stat.red { "A" }
                    th.stat.red { "D" }
                    th.stat.blue { "D" }
                    th.stat.blue { "A" }
                    th.stat.blue { "K" }
                    th.name.blue { "Name" }
                    th.class {}
                    th.team.blue {}
                }
                tbody {
                    @for player_pair in player_pairs(&self.demo.players) {
                        tr {
                            td.team.red {}
                            @if let Some(player) = player_pair.as_ref().left() {
                                td.class.red.(player.class) {}
                                td.name.red {
                                    a href = (player.steam_id.profile_link()) { (player.name) }
                                }
                                td.stat.red { (player.kills.unwrap_or_default()) }
                                td.stat.red { (player.assists.unwrap_or_default()) }
                                td.stat.red { (player.deaths.unwrap_or_default()) }
                            } @else {
                                td.class {}
                                td.name.red {}
                                td.stat.red {}
                                td.stat.red {}
                                td.stat.red {}
                            }
                            @if let Some(player) = player_pair.as_ref().right() {
                                td.stat.blue { (player.deaths.unwrap_or_default()) }
                                td.stat.blue { (player.assists.unwrap_or_default()) }
                                td.stat.blue { (player.kills.unwrap_or_default()) }
                                td.name.blue {
                                    a href = (player.steam_id.profile_link()) { (player.name) }
                                }
                                td.class.blue.(player.class) {}
                            } @else {
                                td.stat.blue {}
                                td.stat.blue {}
                                td.stat.blue {}
                                td.name.blue {}
                                td.class {}
                            }
                            td.team.blue {}
                        }
                    }
                }
            }
            p.demo-info {
                span { (self.demo.map) }
                span.time { (self.demo.duration()) }
            }
            p.demo-download {
                a.button.button-primary href = (self.demo.url) download = (self.demo.name) { "Download" }
                a.button href = (self.demo.viewer_url()) { "View" }
                details.chat {
                    summary.button.button-tertiary { "Toggle Chat" }
                    div {
                        table.chat {
                            @for chat in &self.demo.chat {
                                tr {
                                    td.user { (chat.from) }
                                    td.message { (chat.text) }
                                    td.duration { (chat.time()) }
                                }
                            }
                        }
                    }
                }
            }
            link rel="stylesheet" type="text/css" href=(style_url);
        }
    }
}

fn player_pairs(players: &[Player]) -> impl IntoIterator<Item = EitherOrBoth<&Player, &Player>> {
    let red = players.iter().filter(|player| player.team == Team::Red);
    let blue = players.iter().filter(|player| player.team == Team::Blue);
    red.zip_longest(blue)
}
