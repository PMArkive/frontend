use crate::inline_url;
use swc_core::ecma::{
    ast::*,
    visit::{VisitMut, VisitMutWith},
};

pub struct InlineVisitor {}

impl InlineVisitor {
    fn visit_require(&mut self, expr: &mut Expr, path: &str) {
        if let Some(path) = path.strip_prefix("inline://") {
            let data = inline_url(path);
            *expr = Expr::Lit(Lit::Str(data.into()));
        }
    }
}

impl VisitMut for InlineVisitor {
    fn visit_mut_expr(&mut self, expr: &mut Expr) {
        if let Expr::Call(CallExpr {
            args,
            callee: Callee::Expr(callee),
            ..
        }) = expr
        {
            if let Expr::Ident(callee) = callee.as_ref() {
                if callee.sym.as_ref() == "require" {
                    if let Some(arg) = args.first() {
                        if let Expr::Lit(Lit::Str(arg)) = arg.expr.as_ref() {
                            let path = arg.value.to_string();
                            self.visit_require(expr, &path)
                        }
                    }
                }
            }
        }
        expr.visit_mut_children_with(self);
    }
}
