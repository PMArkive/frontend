use crate::data::steam_id::SteamId;
use crate::Result;
use maud::Render;
use sqlx::{query_as, Executor, FromRow, Postgres};
use tracing::instrument;

#[derive(sqlx::Type, Debug, Eq, PartialEq, Copy, Clone)]
#[sqlx(rename_all = "lowercase")]
pub enum Team {
    Red,
    Blue,
    Other,
    Spectator,
}

#[derive(sqlx::Type, Debug, Ord, PartialOrd, Eq, PartialEq, Copy, Clone)]
#[sqlx(rename_all = "lowercase")]
pub enum Class {
    Scout,
    Soldier,
    Pyro,
    Demoman,
    HeavyWeapons,
    Engineer,
    Medic,
    Sniper,
    Spy,
    Unknown,
}

impl Class {
    pub fn as_str(&self) -> &'static str {
        match self {
            Class::Scout => "scout",
            Class::Soldier => "soldier",
            Class::Pyro => "pyro",
            Class::Demoman => "demoman",
            Class::HeavyWeapons => "heavyweapons",
            Class::Engineer => "engineer",
            Class::Medic => "medic",
            Class::Sniper => "sniper",
            Class::Spy => "spy",
            Class::Unknown => "unknown",
        }
    }
}

impl Render for Class {
    fn render_to(&self, buffer: &mut String) {
        buffer.push_str(self.as_str())
    }
}

#[derive(Debug, FromRow)]
pub struct Player {
    pub id: i32,
    pub steam_id: SteamId,
    pub name: String,
    pub team: Team,
    pub class: Class,
    pub kills: Option<i32>,
    pub deaths: Option<i32>,
    pub assists: Option<i32>,
}

impl Player {
    #[instrument(skip(connection))]
    pub async fn for_demo(
        connection: impl Executor<'_, Database = Postgres>,
        id: u32,
    ) -> Result<Vec<Player>> {
        let mut players = query_as!(
            Player,
            r#"SELECT
                    max(players.id) as "id!", max(players.name) as "name!", max(team) as "team!: Team", max(class) as "class!: Class",
                    max(kills) as "kills", max(deaths) as "deaths", max(assists) as "assists", max(steamid) as "steam_id!: SteamId"
                FROM players
                INNER JOIN users ON user_id = users.id 
                WHERE demo_id = $1
                GROUP BY user_id"#,
            id as i32
        )
            .fetch_all(connection)
            .await?;

        players.sort_by_key(|player| player.class);
        Ok(players)
    }
}
