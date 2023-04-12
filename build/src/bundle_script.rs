use std::env::args;

fn main() {
    tracing_subscriber::fmt::init();

    let path = args().skip(1).next().unwrap();
    let output = demostf_build::bundle_script(&path);
    // println!("{output}")
}
