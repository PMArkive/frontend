use axum::response::{IntoResponse, Response};
use config::ConfigError;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Config(#[from] ConfigError),
    #[error(transparent)]
    Hyper(#[from] hyper::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("page not found")]
    NotFound,
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        dbg!(self);
        todo!()
    }
}
