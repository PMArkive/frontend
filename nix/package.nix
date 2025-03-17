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

    src = sourceByRegex ../. ["Cargo.*" "(src|build|images|script|style|.sqlx)(/.*)?"];

    buildInputs = [openssl];

    nativeBuildInputs = [pkg-config];

    preBuild = ''
      ln -s ${demostf-frontend-node-modules}/node_modules .
    '';

    doCheck = false;

    cargoLock = {
      lockFile = ../Cargo.lock;
      outputHashes = {
        "jsx-dom-expressions-0.1.0" = "sha256-5TN9FBfPYznTkpL9ZtnKv3RghX7r8c2WvSL1sc+F0cw=";
      };
    };
  }
