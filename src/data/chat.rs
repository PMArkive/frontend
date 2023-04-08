use crate::data::demo::Duration;
use crate::Result;
use sqlx::{query_as, Executor, Postgres};
use tracing::instrument;

#[derive(Debug)]
pub struct Chat {
    pub from: String,
    pub text: String,
    pub time: i32,
}

impl Chat {
    #[instrument(skip(connection))]
    pub async fn for_demo(
        connection: impl Executor<'_, Database = Postgres>,
        id: u32,
    ) -> Result<Vec<Chat>> {
        Ok(query_as!(
            Chat,
            r#"SELECT
                    "from", text, time
                FROM chat
                WHERE demo_id = $1
                ORDER BY time ASC"#,
            id as i32
        )
        .fetch_all(connection)
        .await?)
    }

    pub fn time(&self) -> Duration {
        Duration(self.time)
    }
}
