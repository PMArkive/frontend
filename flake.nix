{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/release-23.11";
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
          npmlock2nix = final.callPackage npmlock2nix {};
        })
      ];
      pkgs = (import nixpkgs) {
        inherit system overlays;
      };
      inherit (pkgs) lib callPackage dockerTools;
      inherit (lib.sources) sourceByRegex;

      src = sourceByRegex ./. ["Cargo.*" "(src|build|images|script|style|.sqlx)(/.*)?"];
      nodeSrc = sourceByRegex ./. ["package.*"];
      toolchain = pkgs.rust-bin.nightly."2024-01-16".default;

      naersk' = callPackage naersk {
        rustc = toolchain;
        cargo = toolchain;
      };
    in rec {
      packages = rec {
        node_modules = pkgs.npmlock2nix.v2.node_modules {
          src = nodeSrc;
          nodejs = pkgs.nodejs_20;
        };
        frontend = naersk'.buildPackage {
          pname = "demostf-frontend";
          root = src;

          preBuild = ''
            ln -s ${node_modules}/node_modules .
          '';
          nativeBuildInputs = with pkgs; [pkg-config openssl];
        };
        docker = dockerTools.buildLayeredImage {
          name = "demostf/frontend";
          tag = "latest";
          maxLayers = 5;
          contents = [
            frontend
            dockerTools.caCertificates
          ];
          config = {
            Cmd = ["frontend"];
            ExposedPorts = {
              "80/tcp" = {};
            };
            Env = [
              "LISTEN_ADDRESS=0.0.0.0"
              "LISTEN_PORT=80"
            ];
          };
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
