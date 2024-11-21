{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.05";
    flakelight = {
      url = "github:nix-community/flakelight";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mill-scale = {
      url = "github:icewind1991/mill-scale";
      inputs.flakelight.follows = "flakelight";
    };
    npmlock2nix = {
      url = "github:nix-community/npmlock2nix";
      flake = false;
    };
  };
  outputs = { mill-scale, npmlock2nix, ... }: mill-scale ./. {
    packageOpts = { demostf-frontend-node-modules, ... }: {
      preBuild = ''
        ln -s ${demostf-frontend-node-modules}/node_modules .
      '';
    };
    extraPaths = [
      ./.sqlx
      ./images
      ./script
      ./style
    ];
    withOverlays = [
      (final: prev: {
        npmlock2nix = final.callPackage npmlock2nix { };
      })
      (final: prev: {
        demostf-frontend-toolchain = final.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
      })
      (import ./overlay.nix)
    ];
    toolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
    tools = pkgs: with pkgs; [
      nodejs
      nodePackages.svgo
      typescript
      sqlx-cli
    ];
  };
}
