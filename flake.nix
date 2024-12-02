{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.11";
    flakelight = {
      # url = "github:nix-community/flakelight";
      url = "path:/home/robin/Projects/flakelight";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mill-scale = {
      # url = "github:icewind1991/mill-scale";
      url = "path:/home/robin/Projects/mill-scale";
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
        nodejs-16_x = final.nodejs;
        demostf-frontend-toolchain = final.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
      })
      (import ./nix/overlay.nix)
    ];
    toolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
    tools = pkgs: with pkgs; [
      bacon
      cargo-edit
      nodejs
      nodePackages.svgo
      typescript
      sqlx-cli
    ];
  };
}
