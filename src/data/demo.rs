use crate::data::chat::Chat;
use crate::data::player::Player;
use crate::data::schema::{ArrayAgg, CleanMapName, Demos, Players, Users};
use crate::data::steam_id::SteamId;
use crate::Result;
use maud::Render;
use sea_query::extension::postgres::PgExpr;
use sea_query::{
    Alias, Expr, Func, Order, PostgresQueryBuilder, Query, SelectStatement, SimpleExpr,
};
use sea_query_binder::SqlxBinder;
use serde::{Deserialize, Deserializer};
use sqlx::{query_as, Executor, FromRow, Postgres};
use std::borrow::Cow;
use std::fmt::Write;
use std::ops::Range;
use std::str::FromStr;
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
    pub chat: Vec<Chat>,
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
        let chat = Chat::for_demo(connection, id).await?;

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
            chat,
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

    pub fn duration(&self) -> Duration {
        Duration(self.duration)
    }

    pub fn viewer_url(&self) -> ViewerUrl {
        ViewerUrl(self.id)
    }
}

pub struct ViewerUrl(i32);

impl Render for ViewerUrl {
    fn render_to(&self, buffer: &mut String) {
        write!(buffer, "/viewer/{}", self.0).unwrap()
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
        filter: Filter,
    ) -> Result<Vec<Self>> {
        if filter.is_empty() {
            Ok(query_as!(
                ListDemo,
                r#"SELECT
                    id, name, map, red, blu, duration, created_at, server, "playerCount" as player_count
                FROM demos WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 50"#
            )
                .fetch_all(connection)
                .await?)
        } else {
            let is_fake_user = filter
                .players
                .iter()
                .any(|player| matches!(player, SteamId::Raw(_)));
            if is_fake_user {
                return Ok(Vec::new());
            }

            let mut query = Query::select();
            query
                .columns([
                    (Demos::Table, Demos::Id),
                    (Demos::Table, Demos::Name),
                    (Demos::Table, Demos::Map),
                    (Demos::Table, Demos::Red),
                    (Demos::Table, Demos::Blu),
                    (Demos::Table, Demos::Duration),
                    (Demos::Table, Demos::Server),
                    (Demos::Table, Demos::CreatedAt),
                ])
                .expr_as(Expr::col(Demos::PlayerCount), Alias::new("player_count"))
                .from(Demos::Table)
                .and_where(Expr::col(Demos::DeletedAt).is_null())
                .order_by(Demos::Id, Order::Desc)
                .limit(50);
            filter.apply(&mut query);

            let (sql, values) = query.build_sqlx(PostgresQueryBuilder);

            Ok(sqlx::query_as_with::<_, ListDemo, _>(&sql, values)
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

pub struct Duration(pub i32);

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
                write!(buffer, "{} months ago", elapsed.whole_days() / 30).unwrap();
            } else {
                write!(buffer, "{} years go", elapsed.whole_days() / 365).unwrap();
            }
        } else {
            write!(buffer, "now").unwrap();
        }
    }
}

#[derive(Debug, Default, Deserialize, Eq, PartialEq)]
pub enum GameMode {
    #[serde(rename = "4v4")]
    Fours,
    #[serde(rename = "6v6")]
    Sixes,
    #[serde(rename = "prolander")]
    Prolander,
    #[serde(rename = "highlander")]
    HighLander,
    #[default]
    #[serde(other)]
    Any,
}

impl GameMode {
    fn player_count(&self) -> Option<Range<i32>> {
        match self {
            GameMode::Fours => Some(7..9),
            GameMode::Sixes => Some(11..13),
            GameMode::Prolander => Some(14..15),
            GameMode::HighLander => Some(17..19),
            GameMode::Any => None,
        }
    }
}

#[derive(Default, Debug, Deserialize)]
pub struct Filter {
    #[serde(default)]
    pub mode: GameMode,
    #[serde(default)]
    pub map: String,
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_array")]
    pub players: Vec<SteamId>,
    #[serde(default)]
    pub before: Option<i32>,
    #[serde(default)]
    pub uploader: Option<SteamId>,
}

fn deserialize_array<'de, D, T>(deserializer: D) -> Result<Vec<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de> + FromStr,
{
    let s = <Cow<str>>::deserialize(deserializer)?;
    if s.is_empty() {
        return Ok(Vec::new());
    }
    Ok(s.split(",").map(T::from_str).flatten().collect())
}

impl Filter {
    fn is_empty(&self) -> bool {
        self.mode == GameMode::default()
            && self.map.is_empty()
            && self.before.is_none()
            && self.players.is_empty()
            && self.uploader.is_none()
    }

    fn apply(&self, query: &mut SelectStatement) {
        if let Some(count) = self.mode.player_count() {
            query.and_where(Expr::col(Demos::PlayerCount).between(count.start, count.end));
        }
        if !self.map.is_empty() {
            let val = Expr::value(&self.map);
            query.and_where(
                Expr::col(Demos::Map).eq(val.clone()).or(SimpleExpr::from(
                    Func::cust(CleanMapName).arg(Expr::col(Demos::Map)),
                )
                .eq(val)),
            );
        }
        if let Some(before) = &self.before {
            query.and_where(Expr::col((Demos::Table, Demos::Id)).lt(*before));
        }
        if let Some(uploader) = &self.uploader {
            query
                .inner_join(
                    Users::Table,
                    Expr::col((Users::Table, Users::Id)).equals((Demos::Table, Demos::Uploader)),
                )
                .and_where(Expr::col(Users::SteamId).eq(uploader));
        }
        if !self.players.is_empty() && self.players.len() < 19 {
            let mut player = self.players.iter();
            let mut players_arr = format!("array[{}", player.next().unwrap());
            for player in player {
                write!(&mut players_arr, r#","{}""#, player).unwrap();
            }
            players_arr.push_str("]");

            query
                .inner_join(
                    Players::Table,
                    Expr::col((Demos::Table, Demos::Id)).equals((Players::Table, Players::DemoId)),
                )
                .inner_join(
                    Users::Table,
                    Expr::col((Users::Table, Users::Id)).equals((Players::Table, Players::UserId)),
                )
                .and_where(Expr::col(Users::SteamId).is_in(self.players.clone()));
            query.group_by_col((Demos::Table, Players::Id));
            query.and_having(
                Expr::cust(&players_arr)
                    .cast_as(Alias::new("varchar[]"))
                    .contained(Func::cust(ArrayAgg).arg(Expr::col((Users::Table, Users::SteamId)))),
            );
        }
    }
}
