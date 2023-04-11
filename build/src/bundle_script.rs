use std::env::args;

mod script;

fn main() {
    tracing_subscriber::fmt::init();

    let path = args().skip(1).next().unwrap();
    let output = script::bundle_script(&path);
    // println!("{output}")
}
