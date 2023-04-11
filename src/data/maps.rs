use crate::Result;
use sqlx::{query, Executor, Postgres};
use tracing::instrument;

#[instrument(skip(connection))]
pub async fn map_list(
    connection: impl Executor<'_, Database = Postgres>,
) -> Result<impl Iterator<Item = String>> {
    Ok(query!(
        r#"SELECT
            map as "map!"
        FROM map_list
        ORDER BY count DESC LIMIT 50"#
    )
    .fetch_all(connection)
    .await?
    .into_iter()
    .map(|res| res.map))
}
