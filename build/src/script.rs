use anyhow::Error;
use std::collections::HashMap;
use std::sync::Arc;
use swc_atoms::js_word;
use swc_bundler::{Bundler, Load, ModuleData, ModuleRecord};
use swc_common::sync::Lrc;
use swc_common::{
    errors::{ColorConfig, Handler},
    FileName, SourceMap, Span, GLOBALS,
};
use swc_ecma_ast::*;
use swc_ecma_codegen::text_writer::{omit_trailing_semi, JsWriter, WriteJs};
use swc_ecma_codegen::Emitter;
use swc_ecma_loader::resolvers::lru::CachingResolver;
use swc_ecma_loader::resolvers::node::NodeModulesResolver;
use swc_ecma_loader::TargetEnv;
use swc_ecma_parser::{parse_file_as_module, Syntax};

pub fn bundle_script(script: &str) -> String {
    let minify = true;
    let output = GLOBALS.set(&Default::default(), || {
        let cm = Arc::<SourceMap>::default();

        let globals = Box::leak(Box::default());
        let mut bundler = Bundler::new(
            globals,
            cm.clone(),
            Loader { cm: cm.clone() },
            CachingResolver::new(
                4096,
                NodeModulesResolver::new(TargetEnv::Node, Default::default(), true),
            ),
            swc_bundler::Config {
                require: false,
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

        {
            let wr = JsWriter::new(cm.clone(), "\n", &mut buf, None);
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
            for module in modules {
                emitter.emit_module(&module.module).unwrap();
            }
        }
        buf
    });
    String::from_utf8(output).expect("invalid utf8 bundle")
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
            Syntax::Es(Default::default()),
            EsVersion::Es2020,
            None,
            &mut vec![],
        )
        .unwrap_or_else(|err| {
            let handler =
                Handler::with_tty_emitter(ColorConfig::Always, false, false, Some(self.cm.clone()));
            err.into_diagnostic(&handler).emit();
            panic!("failed to parse")
        });

        Ok(ModuleData {
            fm,
            module,
            helpers: Default::default(),
        })
    }
}
