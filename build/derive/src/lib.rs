//! Derive macros for tf-log-parser

extern crate proc_macro;

mod asset;

use crate::asset::Asset;
use proc_macro2::TokenStream;
use quote::ToTokens;
use std::fmt::Display;
use syn::{parse_macro_input, DeriveInput, Error, Result};

/// Derive the `Asset` trait for a struct
#[proc_macro_derive(Asset, attributes(asset))]
pub fn derive_asset(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let expanded = derive_trait::<Asset>(parse_macro_input!(input as DeriveInput));

    proc_macro::TokenStream::from(expanded)
}

/// Basic wrapper for error handling
fn derive_trait<Trait: Derivable>(input: DeriveInput) -> TokenStream {
    derive_trait_inner::<Trait>(input).unwrap_or_else(|err| err.into_compile_error())
}

fn derive_trait_inner<Trait: Derivable>(input: DeriveInput) -> Result<TokenStream> {
    let params = Trait::Params::parse(&input)?;
    Trait::derive(params)
}

trait Derivable {
    type Params: DeriveParams;

    fn derive(params: Self::Params) -> Result<TokenStream>;
}

trait DeriveParams: Sized {
    fn parse(input: &DeriveInput) -> Result<Self>;
}

fn err<R, T: ToTokens, U: Display>(msg: U, span: T) -> Result<R> {
    return Err(Error::new_spanned(&span, msg));
}
