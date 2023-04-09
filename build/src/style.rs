use crate::guess_mime;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use lightningcss::bundler::{Bundler, FileProvider};
use lightningcss::stylesheet::{MinifyOptions, ParserOptions, PrinterOptions};
use lightningcss::targets::Browsers;
use lightningcss::values::url::Url;
use lightningcss::visit_types;
use lightningcss::visitor::{Visit, VisitTypes, Visitor};
use std::convert::Infallible;
use std::fs::read;
use std::path::Path;

pub fn bundle_style(style: &str) -> String {
    // todo build time?
    let fs = FileProvider::new();
    let mut bundler = Bundler::new(
        &fs,
        None,
        ParserOptions {
            nesting: true,
            ..ParserOptions::default()
        },
    );
    let mut stylesheet = bundler
        .bundle(Path::new(style))
        .expect("failed to bundle css");
    let browsers =
        Browsers::from_browserslist(["last 2 versions"]).expect("failed to parse browserlist");
    stylesheet
        .minify(MinifyOptions {
            targets: browsers.clone(),
            ..MinifyOptions::default()
        })
        .expect("failed to minify css");

    #[cfg(debug_assertions)]
    let minify = false;
    #[cfg(not(debug_assertions))]
    let minify = true;

    stylesheet.visit(&mut InlineUrlVisitor).unwrap();

    stylesheet
        .to_css(PrinterOptions {
            targets: browsers,
            minify,
            ..PrinterOptions::default()
        })
        .expect("failed to output css")
        .code
}

struct InlineUrlVisitor;

impl<'i> Visitor<'i> for InlineUrlVisitor {
    type Error = Infallible;

    const TYPES: VisitTypes = visit_types!(URLS);

    fn visit_url(&mut self, url: &mut Url<'i>) -> Result<(), Self::Error> {
        if let Some(path) = url.url.strip_prefix("inline://") {
            let content = read(path).unwrap_or_else(|e| {
                eprintln!("Failed to write inline file {path}: {e}");
                panic!("Failed to inline");
            });
            let (mime, encode) = guess_mime(path);

            if encode {
                let encoded = STANDARD.encode(content);
                url.url = format!("data:{mime};base64,{encoded}").into();
            } else {
                let content = String::from_utf8(content).expect("invalid utf8");
                let encoded = urlencoding::encode(&content);
                url.url = format!("data:{mime},{encoded}").into();
            }
        }
        Ok(())
    }
}
