use demostf_build::{bundle_style, save_asset};

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=style");
    println!("cargo:rerun-if-changed=images");

    save_asset!("style.css", bundle_style("style/style.css"));
}
