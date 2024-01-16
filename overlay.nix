prev: final: {
  demostf-frontend-node-modules = final.callPackage ./node_modules.nix {};
  demostf-frontend = final.callPackage ./package.nix {};
  demostf-frontend-docker = final.callPackage ./docker.nix {};
}
