use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use config::ConfigError;
use opentelemetry::trace::TraceError;
use tracing_subscriber::util::TryInitError;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
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
    #[error(transparent)]
    Setup(#[from] SetupError),
}

#[derive(Debug, thiserror::Error)]
pub enum SetupError {
    #[error("no config file or env provided")]
    NoConfigProvided,
    #[error(transparent)]
    Tracing(#[from] TraceError),
    #[error(transparent)]
    TracingSubscriber(#[from] TryInitError),
    #[error(transparent)]
    Config(#[from] ConfigError),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        match self {
            Error::NotFound => (StatusCode::NOT_FOUND, "not found").into_response(),
            e => format!("{:#}", e).into_response(),
        }
    }
}
