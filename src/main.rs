mod asset;
mod config;
mod data;
mod error;
mod pages;

pub use crate::config::Config;
use crate::config::Listen;
use crate::data::demo::{Demo, ListDemo};
use crate::pages::about::AboutPage;
use crate::pages::demo::DemoPage;
use crate::pages::index::Index;
use crate::pages::render;
use asset::{serve_compiled, serve_static};
use axum::extract::{MatchedPath, Path};
use axum::http::Request;
use axum::response::IntoResponse;
use axum::{extract::State, routing::get, Router, Server};
pub use error::Error;
use hyperlocal::UnixServerExt;
use maud::Markup;
use sqlx::PgPool;
use std::env::{args, var};
use std::fs::{remove_file, set_permissions, Permissions};
use std::net::SocketAddr;
use std::os::unix::fs::PermissionsExt;
use std::sync::Arc;
use tower_http::trace::TraceLayer;
use tracing::{info, info_span};
use tracing_subscriber::{
    fmt::layer, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer,
};

pub type Result<T, E = Error> = std::result::Result<T, E>;

struct App {
    connection: PgPool,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(layer().with_filter(EnvFilter::new(
            var("RUST_LOG").unwrap_or_else(|_| "warn,frontend=info".into()),
        )))
        .try_init()
        .expect("Failed to init tracing");

    let config = args().skip(1).next().expect("no config file provided");
    let config = Config::load(&config)?;
    let connection = config.database.connect().await?;

    let state = Arc::new(App { connection });

    let app = Router::new()
        .route("/", get(index))
        .route("/style.css", get(serve_compiled!("style.css")))
        .route("/images/logo.png", get(serve_static!("../images/logo.png")))
        .route("/images/logo.svg", get(serve_static!("../images/logo.svg")))
        .route("/about", get(about))
        .route("/:id", get(demo))
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                let matched_path = request
                    .extensions()
                    .get::<MatchedPath>()
                    .map(MatchedPath::as_str);

                info_span!(
                    "http_request",
                    method = ?request.method(),
                    matched_path,
                    some_other_field = tracing::field::Empty,
                )
            }),
        )
        .fallback(handler_404)
        .with_state(state);
    let service = app.into_make_service();

    match config.listen {
        Listen::Tcp { address, port } => {
            let addr = SocketAddr::from((address, port));
            info!("listening on {}", addr);
            Server::bind(&addr).serve(service).await?;
        }
        Listen::Socket { path } => {
            info!("listening on {}", path.display());
            if path.exists() {
                remove_file(&path)?;
            }
            let socket = Server::bind_unix(&path)?;
            set_permissions(&path, Permissions::from_mode(0o666))?;

            socket.serve(service).await?;
        }
    }

    Ok(())
}

async fn index(State(app): State<Arc<App>>) -> Result<Markup> {
    let demos = ListDemo::list(&app.connection, None).await?;
    Ok(render(Index { demos }))
}

async fn about(State(_app): State<Arc<App>>) -> Result<Markup> {
    Ok(render(AboutPage { key: None }))
}

async fn demo(State(app): State<Arc<App>>, Path(id): Path<u32>) -> Result<Markup> {
    let demo = Demo::by_id(&app.connection, id)
        .await?
        .ok_or(Error::NotFound)?;
    Ok(render(DemoPage { demo }))
}

async fn handler_404() -> impl IntoResponse {
    Error::NotFound
}
