mod script;
mod style;

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
    } else if path.ends_with("css") {
        return "text/css";
    } else if path.ends_with("js") {
        return "text/javascript";
    }
    return "text/plain";
}
