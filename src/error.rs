use axum::http::StatusCode;
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
    #[error("Failed to validate steam auth")]
    SteamAuth,
    #[error(transparent)]
    Request(#[from] reqwest::Error),
    #[error(transparent)]
    Xml(#[from] quick_xml::de::DeError),
    #[error(transparent)]
    Session(#[from] async_session::Error),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        match self {
            Error::NotFound => (StatusCode::NOT_FOUND, "not found").into_response(),
            _ => todo!(),
        }
    }
}
