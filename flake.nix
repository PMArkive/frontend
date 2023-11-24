{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/release-22.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    naersk.url = "github:nix-community/naersk";
    naersk.inputs.nixpkgs.follows = "nixpkgs";
    npmlock2nix.url = "github:nix-community/npmlock2nix";
    npmlock2nix.flake = false;
  };

  outputs = {
    self,
    nixpkgs,
    utils,
    rust-overlay,
    naersk,
    npmlock2nix,
  }:
    utils.lib.eachDefaultSystem (system: let
      overlays = [
        (import rust-overlay)
        (final: prev: {
          npmlock2nix = import npmlock2nix {pkgs = final;};
        })
      ];
      pkgs = (import nixpkgs) {
        inherit system overlays;
      };
      inherit (pkgs) lib callPackage;

      src = lib.sources.sourceByRegex ./. ["Cargo.*" "(src|build|images|script|style)(/.*)?" "sqlx-data.json"];
      nodeSrc = lib.sources.sourceByRegex ./. ["package.*"];
      toolchain = pkgs.rust-bin.nightly."2023-03-31".default;

      naersk' = callPackage naersk {
        rustc = toolchain;
        cargo = toolchain;
      };
    in rec {
      packages = rec {
        node_modules = pkgs.npmlock2nix.v2.node_modules {
          src = nodeSrc;
        };
        frontend = naersk'.buildPackage {
          pname = "demostf-frontend";
          root = src;

          preBuild = ''
            ln -s ${node_modules}/node_modules .
          '';
          nativeBuildInputs = with pkgs; [pkg-config openssl];
        };
      };
      devShells.default = pkgs.mkShell {
        OPENSSL_NO_VENDOR = 1;

        nativeBuildInputs = with pkgs; [
          toolchain
          bacon
          cargo-edit
          cargo-outdated
          clippy
          cargo-audit
          cargo-watch
          pkg-config
          openssl
          nodejs
          nodePackages.svgo
          typescript
          sqlx-cli
        ];
      };
    });
}
