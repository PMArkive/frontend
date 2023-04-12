use crate::{err, Derivable, DeriveParams};
use demostf_build_bundlers::guess_mime;
use merge::Merge;
use proc_macro2::{Ident, TokenStream};
use quote::{quote, quote_spanned};
use structmeta::StructMeta;
use syn::parse::Parse;
use syn::{Attribute, DeriveInput, LitStr, Result};

pub struct Asset;

impl Derivable for Asset {
    type Params = AssetParams;

    fn derive(params: AssetParams) -> Result<TokenStream> {
        let struct_ident = params.name;
        let span = struct_ident.span();
        let input_path = params.source;

        let asset = if params.debug {
            AssetContent::Runtime {
                url: input_path.clone(),
                ty: params.ty,
            }
        } else {
            let content = params.ty.bundle(&input_path);
            AssetContent::Compiled {
                route: params.url.clone(),
                content,
            }
        };
        let content = asset.content();
        let buster = asset.buster();
        let etag = asset.etag();
        let url = asset.url();
        let mime = guess_mime(&input_path);
        let mime = quote_spanned!(span => #mime);
        let route = params.url;
        let route = quote_spanned!(span => #route);

        Ok(
            quote_spanned!(span => impl demostf_build::Asset for #struct_ident {
                fn mime() -> &'static str {
                    #mime
                }
                fn etag() -> &'static str {
                    #etag
                }
                fn cache_buster() -> std::borrow::Cow<'static, str> {
                    #buster
                }
                fn content() -> std::borrow::Cow<'static, [u8]> {
                    #content
                }
                fn route() -> &'static str {
                    #route
                }
                fn url() -> std::borrow::Cow<'static, str> {
                    #url
                }
            }),
        )
    }
}

pub struct AssetParams {
    name: Ident,
    debug: bool,
    source: String,
    url: String,
    ty: AssetType,
}

enum AssetType {
    Js,
    Css,
    Raw,
}

impl AssetType {
    fn from_url(url: &str) -> Self {
        if url.ends_with("css") {
            return AssetType::Css;
        } else if url.ends_with("js") {
            return AssetType::Js;
        }
        return AssetType::Raw;
    }

    fn bundle_fn(&self) -> TokenStream {
        match self {
            AssetType::Css => quote!(bundle_style),
            AssetType::Js => quote!(bundle_script),
            AssetType::Raw => quote!(bundle_raw),
        }
    }

    fn bundle(self, url: &str) -> Vec<u8> {
        match self {
            AssetType::Css => demostf_build_bundlers::bundle_style(url),
            AssetType::Js => demostf_build_bundlers::bundle_script(url),
            AssetType::Raw => demostf_build_bundlers::bundle_raw(url),
        }
    }
}

enum AssetContent {
    Runtime { url: String, ty: AssetType },
    Compiled { route: String, content: Vec<u8> },
}

impl AssetContent {
    pub fn content(&self) -> TokenStream {
        match self {
            AssetContent::Runtime { url, ty } => {
                let bundle_fn = ty.bundle_fn();
                quote!(demostf_build::#bundle_fn(#url).into())
            }
            AssetContent::Compiled { content, .. } => {
                quote!(std::borrow::Cow::Borrowed(&[
                    #(#content,)*
                ]))
            }
        }
    }
    pub fn buster(&self) -> TokenStream {
        match self {
            AssetContent::Runtime { .. } => {
                quote!(demostf_build::random_cache_buster().into())
            }
            AssetContent::Compiled { content, .. } => {
                let hash = demostf_build_bundlers::hash(&content);
                quote!(std::borrow::Cow::Borrowed(#hash))
            }
        }
    }
    pub fn etag(&self) -> TokenStream {
        match self {
            AssetContent::Runtime { .. } => {
                quote!("")
            }
            AssetContent::Compiled { content, .. } => {
                let hash = demostf_build_bundlers::hash(&content);
                quote!(#hash)
            }
        }
    }
    pub fn url(&self) -> TokenStream {
        match self {
            AssetContent::Runtime { .. } => {
                quote!(format!("{}?v={}", Self::route(), Self::cache_buster()).into())
            }
            AssetContent::Compiled { content, route } => {
                let hash = demostf_build_bundlers::hash(&content);
                let url = format!("{}?v={}", route, hash);
                quote!(std::borrow::Cow::Borrowed(#url))
            }
        }
    }
}

impl DeriveParams for AssetParams {
    fn parse(input: &DeriveInput) -> Result<AssetParams> {
        let attrs: AssetAttrs = parse_attrs(&input.attrs);
        #[cfg(debug_assertions)]
        let debug = true;
        #[cfg(not(debug_assertions))]
        let debug = false;
        let Some(source) = attrs.source else {
            return err("missing require attribute #[asset(source)]", input);
        };
        let source = source.value();
        let Some(url) = attrs.url else {
            return err("missing require attribute #[asset(url)]", input);
        };
        let url = url.value();
        let ty = AssetType::from_url(&url);

        Ok(AssetParams {
            name: input.ident.clone(),
            debug,
            source,
            url,
            ty,
        })
    }
}

fn parse_attrs<T: Parse + Default + Merge>(attrs: &[Attribute]) -> T {
    let mut result = T::default();
    for attr in attrs {
        if let Ok(parsed) = attr.parse_args() {
            result.merge(parsed);
        }
    }
    result
}

#[derive(Default, StructMeta, Merge)]
struct AssetAttrs {
    source: Option<LitStr>,
    url: Option<LitStr>,
}
