fn main() {
    println!("cargo:rerun-if-changed=style");
    println!("cargo:rerun-if-changed=script");
    println!("cargo:rerun-if-changed=images");
}
