{
  stdenv,
  makeRustPlatform,
  lib,
  demostf-frontend-toolchain,
  pkg-config,
  openssl,
  demostf-frontend-node-modules,
}: let
  inherit (lib.sources) sourceByRegex;
  rustPlatform = makeRustPlatform {
    rustc = demostf-frontend-toolchain;
    cargo = demostf-frontend-toolchain;
  };
in
  rustPlatform.buildRustPackage rec {
    pname = "demostf-frontend";
    version = "0.1.0";

    src = sourceByRegex ./. ["Cargo.*" "(src|build|images|script|style|.sqlx)(/.*)?"];

    buildInputs = [openssl];

    nativeBuildInputs = [pkg-config];

    preBuild = ''
      ln -s ${demostf-frontend-node-modules}/node_modules .
    '';

    cargoLock = {
      lockFile = ./Cargo.lock;
      outputHashes = {
        "jsx-dom-expressions-0.1.0" = "sha256-k5lLHS2umLRwZU0gaszrqCesDAxFVQXMfScT4Ry0SkI=";
      };
    };
  }
