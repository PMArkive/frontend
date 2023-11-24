mod script;
mod style;

use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use fnv::FnvHasher;
pub use script::bundle_script;
use std::fs::read;
use std::hash::{Hash, Hasher};
pub use style::bundle_style;

pub fn bundle_raw(input: &str) -> Vec<u8> {
    read(input).expect("failed to read raw")
}

fn guess_embed(path: &str) -> (&'static str, bool) {
    match path.split('.').last().unwrap() {
        "svg" => ("image/svg+xml", true),
        "png" => ("image/png", true),
        "webp" => ("image/webp", true),
        ext => panic!("no mimetype known for {ext}"),
    }
}

pub fn hash(input: &[u8]) -> String {
    let mut hasher = FnvHasher::default();
    input.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

pub fn guess_mime(path: &str) -> &'static str {
    if path.ends_with("svg") {
        return "image/svg+xml";
    } else if path.ends_with("png") {
        return "image/png";
    } else if path.ends_with("webp") {
        return "image/webp";
    } else if path.ends_with("css") {
        return "text/css";
    } else if path.ends_with("wasm") {
        return "application/wasm";
    } else if path.ends_with("js")
        || path.ends_with("ts")
        || path.ends_with("jsx")
        || path.ends_with("tsx")
    {
        return "text/javascript";
    }
    return "text/plain";
}

fn inline_url(path: &str) -> String {
    let content = read(path).unwrap_or_else(|e| {
        eprintln!("Failed to write inline file {path}: {e}");
        panic!("Failed to inline");
    });
    let (mime, encode) = guess_embed(path);

    if encode {
        let encoded = STANDARD.encode(content);
        format!("data:{mime};base64,{encoded}")
    } else {
        let content = String::from_utf8(content).expect("invalid utf8");
        let encoded = urlencoding::encode(&content);
        format!("data:{mime},{encoded}")
    }
}
