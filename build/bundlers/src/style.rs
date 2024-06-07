use crate::inline_url;
use lightningcss::bundler::{Bundler, FileProvider};
use lightningcss::stylesheet::{MinifyOptions, ParserOptions, PrinterOptions};
use lightningcss::targets::Browsers;
use lightningcss::values::url::Url;
use lightningcss::visit_types;
use lightningcss::visitor::{Visit, VisitTypes, Visitor};
use std::convert::Infallible;
use std::path::Path;

pub fn bundle_style(style: &str) -> Vec<u8> {
    // todo build time?
    let fs = FileProvider::new();
    let mut bundler = Bundler::new(
        &fs,
        None,
        ParserOptions::default(),
    );
    let mut stylesheet = bundler
        .bundle(Path::new(style))
        .expect("failed to bundle css");
    let browsers =
        Browsers::from_browserslist(["last 2 versions"]).expect("failed to parse browserlist");
    stylesheet
        .minify(MinifyOptions {
            targets: browsers.into(),
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
            targets: browsers.into(),
            minify,
            ..PrinterOptions::default()
        })
        .expect("failed to output css")
        .code
        .into_bytes()
}

struct InlineUrlVisitor;

impl<'i> Visitor<'i> for InlineUrlVisitor {
    type Error = Infallible;

    fn visit_types(&self) -> VisitTypes {
        visit_types!(URLS)
    }

    fn visit_url(&mut self, url: &mut Url<'i>) -> Result<(), Self::Error> {
        if let Some(path) = url.url.strip_prefix("inline://") {
            url.url = inline_url(path).into();
        }
        Ok(())
    }
}
