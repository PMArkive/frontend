use hyper::header::{CACHE_CONTROL, CONTENT_TYPE, ETAG};
use hyper::http::{HeaderName, HeaderValue};

macro_rules! saved_asset {
    ($name:expr) => {
        include_str!(concat!(env!("OUT_DIR"), "/", $name))
    };
}
macro_rules! saved_asset_url {
    ($name:expr) => {
        concat!("/", $name, "?v=", crate::asset::saved_asset_hash!($name))
    };
}

macro_rules! saved_asset_hash {
    ($name:expr) => {
        concat!(
            r#"""#,
            include_str!(concat!(env!("OUT_DIR"), "/", $name, ".hash")),
            r#"""#
        )
    };
    ($name:expr, quoted) => {
        concat!(r#"""#, crate::asset::saved_asset_hash!($name), r#"""#)
    };
}

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

pub const fn guess_mime(path: &'static str) -> &'static str {
    use const_str::ends_with;
    if ends_with!(path, "svg") {
        return "image/svg+xml";
    } else if ends_with!(path, "png") {
        return "image/png";
    } else if ends_with!(path, "css") {
        return "text/css";
    }
    return "text/plain";
}

macro_rules! serve_static {
    ($name:expr) => {
        || async {
            const CONTENT: &[u8] = include_bytes!($name);
            const HASH: u32 = const_fnv1a_hash::fnv1a_hash_32(&CONTENT, None);
            const HASH_S: const_base::ArrayStr<8> = const_base::WrongOutputLength::unwrap(
                const_base::encode(&HASH.to_le_bytes(), const_base::Config::HEX),
            );
            (
                crate::asset::cache_headers(crate::asset::guess_mime($name), HASH_S.as_str()),
                CONTENT,
            )
        }
    };
}

macro_rules! serve_compiled {
    ($name:expr) => {
        || async {
            let style = crate::asset::saved_asset!($name);
            let etag = crate::asset::saved_asset_hash!($name, quoted);
            (
                crate::asset::cache_headers(crate::asset::guess_mime($name), etag),
                style,
            )
        }
    };
}

pub(crate) use saved_asset;
pub(crate) use saved_asset_hash;
pub(crate) use saved_asset_url;
pub(crate) use serve_compiled;
pub(crate) use serve_static;
