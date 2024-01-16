{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/release-23.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    npmlock2nix.url = "github:nix-community/npmlock2nix";
    npmlock2nix.flake = false;
  };

  outputs = {
    self,
    nixpkgs,
    utils,
    rust-overlay,
    npmlock2nix,
  }:
    utils.lib.eachDefaultSystem (system: let
      overlays = [
        (import rust-overlay)
        (final: prev: {
          npmlock2nix = final.callPackage npmlock2nix {};
        })
        (import ./overlay.nix)
        (final: prev: {
          demostf-frontend-toolchain = final.rust-bin.nightly."2024-01-16".default;
        })
      ];
      pkgs = (import nixpkgs) {
        inherit system overlays;
      };
    in rec {
      packages = rec {
        node_modules = pkgs.demostf-frontend-node-modules;
        frontend = pkgs.demostf-frontend;
        docker = pkgs.demostf-frontend-docker;
        default = frontend;
      };
      devShells.default = pkgs.mkShell {
        OPENSSL_NO_VENDOR = 1;

        nativeBuildInputs = with pkgs; [
          demostf-frontend-toolchain
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
