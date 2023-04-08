use crate::data::player::Player;
use crate::data::steam_id::SteamId;
use crate::Result;
use maud::Render;
use sqlx::{query_as, Executor, FromRow, Postgres};
use std::fmt::Write;
use time::format_description::well_known::Iso8601;
use time::{OffsetDateTime, PrimitiveDateTime, UtcOffset};
use tracing::instrument;

pub struct Demo {
    pub id: i32,
    pub name: String,
    pub url: String,
    pub map: String,
    pub red: String,
    pub blu: String,
    pub uploader: i32,
    pub uploader_name: Option<String>,
    pub uploader_name_preferred: Option<String>,
    pub uploader_steam_id: Option<SteamId>,
    pub duration: i32,
    pub created_at: PrimitiveDateTime,
    pub score_red: i32,
    pub score_blue: i32,
    pub server: String,
    pub nick: String,
    pub player_count: i32,
    pub players: Vec<Player>,
}

impl Demo {
    #[instrument(skip(connection))]
    pub async fn by_id(
        connection: impl Executor<'_, Database = Postgres> + Copy,
        id: u32,
    ) -> Result<Option<Self>> {
        struct RawDemo {
            pub id: i32,
            pub name: String,
            pub url: String,
            pub map: String,
            pub red: String,
            pub blu: String,
            pub uploader: i32,
            pub uploader_name: Option<String>,
            pub uploader_name_preferred: Option<String>,
            pub uploader_steam_id: Option<SteamId>,
            pub duration: i32,
            pub created_at: PrimitiveDateTime,
            pub score_red: i32,
            pub score_blue: i32,
            pub server: String,
            pub nick: String,
            pub player_count: i32,
        }

        let Some(raw) = query_as!(
            RawDemo,
            r#"SELECT
                demos.id, demos.name, url, map, red, blu, uploader, duration, demos.created_at,
                "scoreRed" as score_red, "scoreBlue" as score_blue, server, nick,
                "playerCount" as player_count,
                users_named.name as uploader_name_preferred,
                users.steamid as "uploader_steam_id?: SteamId",
                users.name as "uploader_name?"
            FROM demos
            LEFT JOIN users_named ON uploader = users_named.id
            LEFT JOIN users ON uploader = users.id
            WHERE deleted_at IS NULL AND demos.id = $1"#,
            id as i32
        )
        .fetch_optional(connection)
        .await? else {
            return Ok(None);
        };

        let players = Player::for_demo(connection, id).await?;

        Ok(Some(Demo {
            id: raw.id,
            name: raw.name,
            url: raw.url,
            map: raw.map,
            red: raw.red,
            blu: raw.blu,
            uploader: raw.uploader,
            uploader_name: raw.uploader_name,
            uploader_name_preferred: raw.uploader_name_preferred,
            uploader_steam_id: raw.uploader_steam_id,
            duration: raw.duration,
            created_at: raw.created_at,
            score_red: raw.score_red,
            score_blue: raw.score_blue,
            server: raw.server,
            nick: raw.nick,
            player_count: raw.player_count,
            players,
        }))
    }

    pub fn uploader_steam_id(&self) -> &SteamId {
        self.uploader_steam_id.as_ref().unwrap_or_default()
    }

    pub fn date(&self) -> Date {
        Date(self.created_at)
    }

    pub fn relative_date(&self) -> RelativeDate {
        RelativeDate(self.created_at)
    }

    pub fn uploader_name(&self) -> &str {
        self.uploader_name_preferred
            .as_deref()
            .or(self.uploader_name.as_deref())
            .unwrap_or("unknown")
    }
}

#[derive(Debug, FromRow)]
pub struct ListDemo {
    pub id: i32,
    pub name: String,
    pub map: String,
    pub red: String,
    pub blu: String,
    pub duration: i32,
    pub created_at: PrimitiveDateTime,
    pub server: String,
    pub player_count: i32,
}

impl ListDemo {
    #[instrument(skip(connection))]
    pub async fn list(
        connection: impl Executor<'_, Database = Postgres>,
        before: Option<u32>,
    ) -> Result<Vec<Self>> {
        if let Some(before) = before {
            Ok(query_as!(
                ListDemo,
                r#"SELECT
                    id, name, map, red, blu, duration, created_at, server, "playerCount" as player_count
                FROM demos WHERE deleted_at IS NULL and id < $1 ORDER BY id DESC LIMIT 50"#,
                before as i32
            )
                .fetch_all(connection)
                .await?)
        } else {
            Ok(query_as!(
                ListDemo,
                r#"SELECT
                    id, name, map, red, blu, duration, created_at, server, "playerCount" as player_count
                FROM demos WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 50"#
            )
                .fetch_all(connection)
                .await?)
        }
    }

    pub fn url(&self) -> DemoUrl {
        DemoUrl(self.id)
    }

    pub fn format(&self) -> DemoFormat {
        DemoFormat {
            player_count: self.player_count,
            mode: MapMode::from_map(&self.map),
        }
    }

    pub fn duration(&self) -> Duration {
        Duration(self.duration)
    }

    pub fn date(&self) -> Date {
        Date(self.created_at)
    }

    pub fn relative_date(&self) -> RelativeDate {
        RelativeDate(self.created_at)
    }
}

pub struct DemoUrl(i32);

impl Render for DemoUrl {
    fn render_to(&self, buffer: &mut String) {
        write!(buffer, "/{}", self.0).unwrap();
    }
}

pub struct DemoFormat {
    player_count: i32,
    mode: MapMode,
}

enum MapMode {
    Other,
    Bball,
    Ultiduo,
}

impl MapMode {
    fn from_map(map: &str) -> Self {
        if map.contains("bball") || map.contains("ballin") {
            Self::Bball
        } else if map.contains("ultiduo") {
            Self::Ultiduo
        } else {
            Self::Other
        }
    }
}

impl Render for DemoFormat {
    fn render_to(&self, buffer: &mut String) {
        let name = match self.mode {
            MapMode::Ultiduo => "Ultiduo",
            MapMode::Bball => "BBall",
            MapMode::Other => match self.player_count {
                17 | 18 | 19 => "HL",
                15 | 14 => "Prolander",
                13 | 12 | 11 => "6v6",
                7 | 8 | 9 => "4v4",
                _ => "Other",
            },
        };
        write!(buffer, "{name}").unwrap();
    }
}

pub struct Duration(i32);

impl Render for Duration {
    fn render_to(&self, buffer: &mut String) {
        if self.0 < 1 {
            write!(buffer, "0:00").unwrap();
            return;
        }

        let hours = self.0 / 3600;
        let minutes = (self.0 - (hours * 3600)) / 60;
        let seconds = self.0 - (hours * 3600) - (minutes * 60);

        if hours == 0 {
            write!(buffer, "{minutes:02}:{seconds:02}").unwrap();
        } else {
            write!(buffer, "{hours:02}:{minutes:02}:{seconds:02}").unwrap();
        }
    }
}

pub struct Date(PrimitiveDateTime);

impl Render for Date {
    fn render_to(&self, buffer: &mut String) {
        buffer.push_str(
            &self
                .0
                .assume_offset(UtcOffset::UTC)
                .format(&Iso8601::DEFAULT)
                .unwrap(),
        );
    }
}

pub struct RelativeDate(PrimitiveDateTime);

impl Render for RelativeDate {
    fn render_to(&self, buffer: &mut String) {
        let date = self.0.assume_offset(UtcOffset::UTC);
        let now = OffsetDateTime::now_utc();
        let elapsed = now - date;

        if elapsed.is_positive() {
            if elapsed.whole_minutes() < 1 {
                write!(buffer, "seconds ago").unwrap();
            } else if elapsed.whole_hours() < 1 {
                write!(buffer, "{} minutes ago", elapsed.whole_minutes()).unwrap();
            } else if elapsed.whole_days() < 1 {
                write!(buffer, "{} hours ago", elapsed.whole_hours()).unwrap();
            } else if elapsed.whole_days() < 32 {
                write!(buffer, "{} days ago", elapsed.whole_days()).unwrap();
            } else if elapsed.whole_days() < 365 {
                write!(buffer, "{} days ago", elapsed.whole_days() / 30).unwrap();
            } else {
                write!(buffer, "{} years go", elapsed.whole_days() / 365).unwrap();
            }
        } else {
            write!(buffer, "now").unwrap();
        }
    }
}
