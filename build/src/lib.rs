pub use demostf_build_bundlers::bundle_raw;
pub use demostf_build_bundlers::bundle_script;
pub use demostf_build_bundlers::bundle_style;
pub use demostf_build_derive::Asset;
use rand::{distributions::Alphanumeric, Rng};
use std::borrow::Cow;

pub trait Asset {
    fn mime() -> &'static str;
    fn cache_buster() -> Cow<'static, str>;
    fn etag() -> &'static str;
    fn content() -> Cow<'static, [u8]>;
    fn url() -> Cow<'static, str>;
    fn route() -> &'static str;
}

pub fn random_cache_buster() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(8)
        .map(char::from)
        .collect()
}
