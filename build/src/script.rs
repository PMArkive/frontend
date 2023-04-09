use std::{path::Path, sync::Arc};
use swc::config::Config;
use swc::{self, config::Options, BoolConfig};
use swc_common::{
    errors::{ColorConfig, Handler},
    SourceMap, GLOBALS,
};

pub fn bundle_script(script: &str) -> String {
    let output = GLOBALS.set(&Default::default(), || {
        let cm = Arc::<SourceMap>::default();
        let handler = Arc::new(Handler::with_tty_emitter(
            ColorConfig::Auto,
            true,
            false,
            Some(cm.clone()),
        ));
        let compiler = swc::Compiler::new(cm.clone());

        let fm = cm
            // filepath that actually exists relative to the binary
            .load_file(Path::new(script))
            .expect("failed to load file");

        compiler
            .process_js_file(
                fm,
                &handler,
                &Options {
                    config: Config {
                        minify: BoolConfig::new(Some(true)),
                        ..Config::default()
                    },
                    ..Default::default()
                },
            )
            .expect("failed to process file")
    });
    output.code
}
