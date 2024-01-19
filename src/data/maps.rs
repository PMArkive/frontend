use crate::Result;
use maud::Render;
use sqlx::{query, Executor, Postgres};
use std::fmt::{Debug, Formatter};
use tracing::instrument;

#[instrument(skip(connection))]
pub async fn map_list(connection: impl Executor<'_, Database = Postgres>) -> Result<MapList> {
    let maps = query!(
        r#"SELECT
            map as "map!"
        FROM map_list
        ORDER BY count DESC LIMIT 50"#
    )
    .fetch_all(connection)
    .await?
    .into_iter()
    .map(|res| res.map);
    Ok(MapList(maps.collect()))
}

pub struct MapList(Vec<String>);

impl Debug for MapList {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} maps", self.0.len())
    }
}

impl Render for MapList {
    fn render_to(&self, buffer: &mut String) {
        let mut first = true;
        for map in self.0.iter() {
            if !first {
                buffer.push(',');
            }
            buffer.push_str(map);
            first = false;
        }
    }
}
