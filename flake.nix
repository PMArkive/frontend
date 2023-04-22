{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/release-22.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    self,
    nixpkgs,
    utils,
    rust-overlay,
  }:
  utils.lib.eachDefaultSystem (system: let
      overlays = [ (import rust-overlay) ];
      pkgs = (import nixpkgs) {
        inherit system overlays;
      };
    in rec {
      # `nix develop`
      devShell = pkgs.mkShell {
        OPENSSL_NO_VENDOR = 1;

        nativeBuildInputs = with pkgs; [
          rust-bin.nightly."2023-03-31".default
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
        ];
      };
    });
}
