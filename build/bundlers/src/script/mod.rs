mod inline;

use crate::script::inline::InlineVisitor;
use anyhow::Error;
use jsx_dom_expressions::TransformVisitor;
use std::collections::HashMap;
use std::io::Write;
use std::sync::Arc;
use swc_atoms::js_word;
use swc_bundler::{Bundler, Load, ModuleData, ModuleRecord};
use swc_common::comments::NoopComments;
use swc_common::sync::Lrc;
use swc_common::{
    errors::{ColorConfig, Handler},
    FileName, Mark, SourceMap, Span, GLOBALS,
};
use swc_ecma_ast::*;
use swc_ecma_codegen::text_writer::{omit_trailing_semi, JsWriter, WriteJs};
use swc_ecma_codegen::Emitter;
use swc_ecma_loader::resolvers::lru::CachingResolver;
use swc_ecma_loader::resolvers::node::NodeModulesResolver;
use swc_ecma_loader::TargetEnv;
use swc_ecma_parser::{parse_file_as_module, Syntax, TsConfig};
use swc_ecma_transforms_base::fixer::fixer;
use swc_ecma_transforms_base::hygiene::hygiene;
use swc_ecma_transforms_typescript::strip;
use swc_ecma_visit::{as_folder, FoldWith};

pub fn bundle_script(script: &str) -> Vec<u8> {
    #[cfg(debug_assertions)]
    let minify = false;
    #[cfg(not(debug_assertions))]
    let minify = true;

    GLOBALS.set(&Default::default(), || {
        let cm = Arc::<SourceMap>::default();

        let globals = &Box::default();
        let mut bundler = Bundler::new(
            globals,
            cm.clone(),
            Loader { cm: cm.clone() },
            CachingResolver::new(
                4096,
                NodeModulesResolver::new(TargetEnv::Browser, Default::default(), true),
            ),
            swc_bundler::Config {
                // disable_hygiene: !minify,
                // disable_dce: !minify,
                // disable_fixer: !minify,
                // disable_inliner: !minify,
                ..Default::default()
            },
            Box::new(Hook),
        );
        let mut entries = HashMap::new();
        entries.insert(
            script.trim_end_matches(".js").to_string(),
            FileName::Real(script.into()),
        );
        let modules = bundler.bundle(entries).expect("failed to bundle");

        let mut buf = vec![];
        for module in modules {
            write(minify, cm.clone(), &module.module, &mut buf);
        }
        buf
    })
}

fn write<W: Write>(minify: bool, cm: Arc<SourceMap>, module: &Module, out: W) {
    let wr = JsWriter::new(cm.clone(), "\n", out, None);
    let mut emitter = Emitter {
        cfg: swc_ecma_codegen::Config {
            minify,
            ..Default::default()
        },
        cm: cm.clone(),
        comments: None,
        wr: if minify {
            Box::new(omit_trailing_semi(wr)) as Box<dyn WriteJs>
        } else {
            Box::new(wr) as Box<dyn WriteJs>
        },
    };
    emitter.emit_module(module).unwrap();
}

struct Hook;

impl swc_bundler::Hook for Hook {
    fn get_import_meta_props(
        &self,
        span: Span,
        module_record: &ModuleRecord,
    ) -> Result<Vec<KeyValueProp>, Error> {
        let file_name = module_record.file_name.to_string();

        Ok(vec![
            KeyValueProp {
                key: PropName::Ident(Ident::new(js_word!("url"), span)),
                value: Box::new(Expr::Lit(Lit::Str(Str {
                    span,
                    raw: None,
                    value: file_name.into(),
                }))),
            },
            KeyValueProp {
                key: PropName::Ident(Ident::new(js_word!("main"), span)),
                value: Box::new(if module_record.is_entry {
                    Expr::Member(MemberExpr {
                        span,
                        obj: Box::new(Expr::MetaProp(MetaPropExpr {
                            span,
                            kind: MetaPropKind::ImportMeta,
                        })),
                        prop: MemberProp::Ident(Ident::new(js_word!("main"), span)),
                    })
                } else {
                    Expr::Lit(Lit::Bool(Bool { span, value: false }))
                }),
            },
        ])
    }
}

pub struct Loader {
    pub cm: Lrc<SourceMap>,
}

impl Load for Loader {
    fn load(&self, f: &FileName) -> Result<ModuleData, Error> {
        let fm = match f {
            FileName::Real(path) => self.cm.load_file(path)?,
            _ => unreachable!(),
        };

        let module = parse_file_as_module(
            &fm,
            Syntax::Typescript(TsConfig {
                tsx: true,
                ..TsConfig::default()
            }),
            EsVersion::Es5,
            None,
            &mut vec![],
        )
        .unwrap_or_else(|err| {
            let handler =
                Handler::with_tty_emitter(ColorConfig::Always, false, false, Some(self.cm.clone()));
            err.into_diagnostic(&handler).emit();
            panic!("failed to parse")
        });

        let top_level_mark = Mark::new();

        let module = module
            .fold_with(&mut strip(top_level_mark))
            .fold_with(&mut as_folder(InlineVisitor {}))
            .fold_with(&mut as_folder(TransformVisitor::new(
                jsx_dom_expressions::config::Config {
                    module_name: "solid-js/web".to_string(),
                    builtins: vec![
                        "For".into(),
                        "Show".into(),
                        "Switch".into(),
                        "Match".into(),
                        "Suspense".into(),
                        "SuspenseList".into(),
                        "Portal".into(),
                        "Index".into(),
                        "Dynamic".into(),
                        "ErrorBoundary".into(),
                    ],
                    ..Default::default()
                },
                NoopComments,
            )))
            .fold_with(&mut hygiene())
            .fold_with(&mut fixer(None));

        // if let FileName::Real(path) = &f {
        //     let mut out = vec![];
        //     write(false, self.cm.clone(), &module, &mut out);
        //     let mut path = path.clone();
        //     path.set_extension("c.js");
        //     std::fs::write(path, out).unwrap();
        // }

        Ok(ModuleData {
            fm,
            module,
            helpers: Default::default(),
        })
    }
}
