use axum::response::IntoResponse;
use demostf_build::Asset;
use hyper::header::{CACHE_CONTROL, CONTENT_TYPE, ETAG};
use hyper::http::{HeaderName, HeaderValue};

pub const fn cache_headers(
    content_type: &'static str,
    etag: &'static str,
) -> [(HeaderName, HeaderValue); 3] {
    [
        (CONTENT_TYPE, HeaderValue::from_static(content_type)),
        (ETAG, HeaderValue::from_static(etag)),
        (
            CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=2592000, immutable"),
        ),
    ]
}

pub async fn serve_asset<A: Asset>() -> impl IntoResponse {
    let mime = A::mime();
    let style = A::content();
    let etag = A::etag();
    (cache_headers(mime, etag), style.into_owned())
}

pub fn guess_mime(path: &str) -> &'static str {
    if path.ends_with("svg") {
        "image/svg+xml"
    } else if path.ends_with("png") {
        "image/png"
    } else if path.ends_with("webp") {
        "image/webp"
    } else if path.ends_with("css") {
        "text/css"
    } else if path.ends_with("wasm") {
        "application/wasm"
    } else if path.ends_with("js")
        || path.ends_with("ts")
        || path.ends_with("jsx")
        || path.ends_with("tsx")
    {
        "text/javascript"
    } else {
        "text/plain"
    }
}
