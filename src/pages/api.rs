use crate::data::steam_id::SteamId;
use crate::pages::Page;
use maud::{html, Markup};
use std::borrow::Cow;
use std::fmt::Display;

#[derive(Debug)]
pub struct ApiPage<'a> {
    pub api_base: &'a str,
    pub steam_id: SteamId,
}

impl ApiPage<'_> {
    fn api_link(&self, endpoint: &str) -> String {
        format!("{}{}", self.api_base, endpoint)
    }
    fn api_link_params(&self, endpoint: &str, params: impl Display) -> String {
        format!("{}{}{}", self.api_base, endpoint, params)
    }
}

impl Page for ApiPage<'_> {
    fn title(&self) -> Cow<'static, str> {
        "API - demos.tf".into()
    }

    fn render(&self) -> Markup {
        html! {
            div {
                section {
                    .title {
                        h3 { "API" }
                    }
                    p {
                        "Demos.tf provides a REST api that allows 3rd parties to the demo information stored on the site which is located at."
                    }
                    pre { (self.api_base) }
                }

                section {
                    .title {
                        h3 { "Listing Demos" }
                    }
                    p {
                        "There are three api endpoints that can be used to retrieve a list of demos."
                    }
                    ul {
                        li {
                            a href = (self.api_link("demos/")) { "/demos/" }
                            " lists all demos."
                        }
                        li {
                            a  href = (self.api_link_params("uploads/", &self.steam_id)) { " /uploads/" (self.steam_id) }
                            " lists demos uploaded by a user."
                        }
                        li {
                            a  href = (self.api_link_params("profiles/", &self.steam_id)) { " /profiles/" (self.steam_id) }
                            " lists demos in which a user played."
                        }
                    }
                    p {
                        "Users are identified by their steam id in the code "
                        code { "steamid64" }
                        " ("
                        code { "7656xxxxxxxxxxxxx" }
                        ") format."
                    }
                }

                section {
                    .title {
                        h3 { "Filters" }
                    }
                    p {
                        "Each of the three list end points accept the following filters to search for demos."
                    }
                    ul {
                        li {
                            a href = (self.api_link("demos/?map=cp_granary")) { "map=xxxx" }
                            " only show demos for a specific map."
                        }
                        li {
                            a href = (self.api_link("demos/?type=6v6")) { "type=xxx" }
                            " only show "
                            code { "4v4" }
                            ", "
                            code { "6v6" }
                            " or "
                            code { "hl" }
                            " demos."
                        }
                        li {
                            a href = (self.api_link_params("demos/?players[]=", &self.steam_id)) { "players[]=xxxx" }
                            " only show demos where a specific player has played."
                            ul {
                                li {
                                    "Multiple player filters can be specified to find demos where all of the given players have played."
                                }
                                li {
                                    "Note that when using the "
                                    code { "/profiles/$steamid" }
                                    " endpoint the user for the endpoint is added to the filter."
                                }
                            }
                        }
                        li {
                            a href = (self.api_link("demos/?before=1454455622")) { "before=xxx" }
                            " only show demos uploaded before a certain time."
                        }
                        li {
                            a href = (self.api_link("demos/?after=1454455622")) { "after=xxx" }
                            " only show demos uploaded after a certain time."
                        }
                        li {
                            a href = (self.api_link("demos/?before_id=12345")) { "before_id=xxx" }
                            " only show demos with an id lower than the provided one."
                        }
                        li {
                            a href = (self.api_link("demos/?after_id=12345")) { "after_id=xxx" }
                            " only show demos with an id higher than the provided one."
                        }
                    }
                    p {
                        "All filters should be provided as query parameter and can be combined in any combination."
                    }
                }
                section {
                    .title {
                        h3 { "Sorting" }
                    }
                    p {
                        "By default the demo listing will be sorted in descending order, meaning newer demos will be listed first, this can be changed by adding "
                        a href = (self.api_link("demos/?order=ASC")) { "order=ASC" }
                        "."
                    }
                }
                section {
                    .title {
                        h3 { "Paging" }
                    }
                    p {
                        "All the list endpoints limit the number of items returned and accept a "
                        code { "page" }
                        " query parameter for retrieving larger number of results."
                    }

                    p {
                        "As an alternative to using "
                        code { "page" }
                        " to offset the results you can also use the "
                        code { "after_id" }
                        " or "
                        code { "before_id" }
                        " to manually paginate your queries."
                    }
                }
                section {
                    .title {
                        h3 { "List response" }
                    }
                    p {
                        "The response from a list endpoint consists of a list containing demo items in the following format."
                    }

                    pre {
                        r#"
{
    id: 3314,
    url: "https://static.demos.tf/...",
    name: "stvdemos/22046_6v6-2015-08-02-15-21-blu_vs_red-cp_gullywash_final1.dem",
    server: "TF2Pickup.net | #4.NL | 6v6 | Powered by SimRai.com",
    duration: 1809,
    nick: "SourceTV Demo",
    map: "cp_gullywash_final1",
    time: 1438523578,
    red: "RED",
    blue: "BLU",
    redScore: 1,
    blueScore: 5,
    playerCount: 12,
    uploader: 2565
}"#
                    }
                    ul {
                        li {
                            code { "id" }
                            " the unique id of the demo"
                        }
                        li {
                            code { "url" }
                            " the download url for the demo file"
                        }
                        li {
                            code { "name" }
                            " the filename of the demo file"
                        }
                        li {
                            code { "server" }
                            " the server name during the match"
                        }
                        li {
                            code { "duration" }
                            " the length of the match in seconds"
                        }
                        li {
                            code { "nick" }
                            " the nickname of the user recording the demo"
                        }
                        li {
                            code { "map" }
                            " the map on which the match was played"
                        }
                        li {
                            code { "time" }
                            " the time when the demo was uploaded as unix timestamp"
                        }
                        li {
                            code { "red" }
                            " the name of the RED team during the match"
                        }
                        li {
                            code { "blue" }
                            " the name of the BLU team during the match"
                        }
                        li {
                            code { "redScore" }
                            " the number of points scored by the red team"
                        }
                        li {
                            code { "blueScore" }
                            " the number of points scored by the blue team"
                        }
                        li {
                            code { "playerCount" }
                            " the number of players in the match"
                        }
                        li {
                            code { "uploader" }
                            " the unique id of the user which uploaded the demo"
                        }
                    }
                }
                section {
                    .title {
                        h3 { "Demo info" }
                    }
                    p {
                        "The full information of a demo can be found at "
                        a href = (self.api_link("demos/314")) { "/demos/$id" }
                    }
                }
                section {
                    .title {
                        h3 { "Demo response" }
                    }
                    p {
                        "The response from a demo endpoint is in the following format."
                    }

                    pre {
                        r#"
{
    id: 314,
    url: "https://static.demos.tf/...",
    name: "match-20150323-1937-cp_process_final.dem",
    server: "UGC 6v6 Match",
    duration: 1809,
    nick: "SourceTV Demo",
    map: "cp_process_final",
    time: 1427159270,
    red: "TITS!",
    blue: "BLU",
    redScore: 3,
    blueScore: 1,
    playerCount: 12,
    uploader: {
        id: 1052,
        steamid: "76561198028052915",
        name: "Reƒraction"
    },
    players: [
        {
            id: 4364,
            user_id: 1614,
            name: "dankest memes",
            team: "red",
            'class': "scout",
            steamid: "76561198070261020",
            avatar: "http://cdn.akamai.steamstatic.com/steamcommunity/...",
            kills: 10,
            assists: 0,
            deaths: 19
        },
        ...
    ]
}"#
                    }
                    p {
                        "The first 12 items are the same as the items in the list response."
                    }
                    ul {
                        li {
                            code { "uploader" }
                            " information about the user who uploaded the demo"
                            ul {
                                li {
                                    code { "id" }
                                    " the unique id for the user"
                                }
                                li {
                                    code { "steamid" }
                                    " the steamid for the user"
                                }
                                li {
                                    code { "name" }
                                    " the name of the uploader"
                                }
                            }
                        }
                        li {
                            code { "players" }
                            " the information about the players of the match"
                            ul {
                                li {
                                    code { "id" }
                                    " the unique id for user in this id"
                                }
                                li {
                                    code { "user_id" }
                                    " the unique id for the user"
                                }
                                li {
                                    code { "name" }
                                    " the name of the player during the match"
                                }
                                li {
                                    code { "class" }
                                    " the class the player played during the match"
                                }
                                li {
                                    code { "steamid" }
                                    " the steamid of the user"
                                }
                                li {
                                    code { "avatar" }
                                    " the avatar for the user"
                                }
                                li {
                                    code { "kills" }
                                    " the number of kills made by the player during the match"
                                }
                                li {
                                    code { "assists" }
                                    " the number of assists made by the player during the match"
                                }
                                li {
                                    code { "deaths" }
                                    " the number of deaths during the game"
                                }
                            }
                        }
                    }
                }

                section {
                    .title {
                        h3 { "Uploading Demos" }
                    }
                    p {
                        "Demos can be uploaded by making a "
                        code { "POST" }
                        " request to "
                        code { (self.api_link("upload/")) }
                        " with the following fields set as form data."
                    }
                    ul {
                        li {
                            code { "key" }
                            " the api key of the user uploading the demo"
                        }
                        li {
                            code { "name" }
                            " the name of the demo file"
                        }
                        li {
                            code { "red" }
                            " the name of the RED team"
                        }
                        li {
                            code { "blu" }
                            " the name of the BLU team"
                        }
                        li {
                            code { "demo" }
                            " the demo file to be uploaded, as form file upload"
                        }
                    }
                }

                section {
                    .title {
                        h3 { "Database Dump" }
                    }
                    p {
                        "If you're planning on analysing data from demos.tf, a public "
                        a href = "https://freezer.demos.tf/database/demostf.sql.gz" { "database dump" }
                        " for PostgreSQL is available for download."
                    }
                }
            }
        }
    }
}
