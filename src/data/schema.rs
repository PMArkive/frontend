use sea_query::Iden;
use std::fmt::Write;

#[allow(dead_code)]
#[derive(Iden)]
pub enum Demos {
    Table,
    #[iden = "id"]
    Id,
    #[iden = "name"]
    Name,
    #[iden = "url"]
    Url,
    #[iden = "map"]
    Map,
    #[iden = "red"]
    Red,
    #[iden = "blu"]
    Blu,
    #[iden = "uploader"]
    Uploader,
    #[iden = "duration"]
    Duration,
    #[iden = "created_at"]
    CreatedAt,
    #[iden = "updated_at"]
    UpdatedAt,
    #[iden = "backend"]
    Backend,
    #[iden = "path"]
    Path,
    #[iden = "scoreBlue"]
    ScoreBlue,
    #[iden = "scoreRed"]
    ScoreRed,
    #[iden = "version"]
    Version,
    #[iden = "server"]
    Server,
    #[iden = "nick"]
    Nick,
    #[iden = "deleted_at"]
    DeletedAt,
    #[iden = "playerCount"]
    PlayerCount,
    #[iden = "hash"]
    Hash,
    #[iden = "blue_team_id"]
    BlueTeamId,
    #[iden = "red_team_id"]
    RedTeamId,
}

pub struct CleanMapName;

impl Iden for CleanMapName {
    fn unquoted(&self, s: &mut dyn Write) {
        write!(s, "clean_map_name").unwrap()
    }
}

#[derive(Iden)]
#[iden = "ARRAY"]
pub struct ArrayFunc;

#[derive(Iden)]
#[iden = "array_agg"]
pub struct ArrayAgg;

#[allow(dead_code)]
#[derive(Iden)]
pub enum Players {
    Table,
    #[iden = "id"]
    Id,
    #[iden = "demo_id"]
    DemoId,
    #[iden = "demo_user_id"]
    DemoUserId,
    #[iden = "user_id"]
    UserId,
    #[iden = "name"]
    Name,
    #[iden = "team"]
    Team,
    #[iden = "class"]
    Class,
    #[iden = "kills"]
    Kills,
    #[iden = "assists"]
    Assists,
    #[iden = "deaths"]
    Deaths,
    #[iden = "steam_id"]
    SteamId,
}

#[allow(dead_code)]
#[derive(Iden)]
pub enum Users {
    Table,
    #[iden = "id"]
    Id,
    #[iden = "steamid"]
    SteamId,
    #[iden = "name"]
    Name,
    #[iden = "avatar"]
    Avatar,
    #[iden = "token"]
    Token,
}
