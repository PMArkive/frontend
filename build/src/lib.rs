mod script;
mod style;

use const_fnv1a_hash::fnv1a_hash_str_32;
pub use script::bundle_script;
pub use style::bundle_style;

#[macro_export]
macro_rules! save_asset {
    ($name:expr, $val:expr) => {
        let val = $val;
        let out_dir = std::env::var("OUT_DIR").unwrap();
        std::fs::write(format!("{out_dir}/{}", $name), &val).expect("failed to write asset");
        let hash = demostf_build::hash(&val);
        std::fs::write(format!("{out_dir}/{}.hash", $name), hash)
            .expect("failed to write asset hash");
    };
}

pub fn hash(data: &str) -> String {
    format!("{:x}", fnv1a_hash_str_32(data))
}

fn guess_mime(path: &str) -> (&'static str, bool) {
    match path.split('.').last().unwrap() {
        "svg" => ("image/svg+xml", false),
        "png" => ("image/png", true),
        ext => panic!("no mimetype known for {ext}"),
    }
}
