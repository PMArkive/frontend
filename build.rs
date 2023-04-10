use demostf_build::{bundle_script, bundle_style, save_asset};

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=style");
    println!("cargo:rerun-if-changed=images");
    println!("cargo:rerun-if-changed=script");

    save_asset!("style.css", bundle_style("style/style.css"));
    save_asset!("upload.js", bundle_script("script/upload.ts"));
    save_asset!("demo_list.js", bundle_script("script/demo_list.js"));
}
