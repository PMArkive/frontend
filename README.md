# demos.tf

[![CI](https://github.com/demostf/demos.tf/actions/workflows/build.yml/badge.svg)](https://github.com/demostf/demos.tf/actions/workflows/build.yml)

Frontend code for [demos.tf](http://demos.tf), see also [the api code](https://github.com/demostf/api) for the api backend.

## Docker image

A prebuild docker image exist in the [docker hub](https://hub.docker.com/r/demostf/frontend/).

## Building

Rust and npm are required to build the project.

### Using nix

For systems with `nix`, a flake is provided to ease building, simply running

```
nix build .#frontend
```

will build the entire project.

### Without nix

If you don't have make available you can build the project without it.

```
npm ci
cargo b --release
```

## Running

Once build, the binary can be run with

```shell
frontend <path to config.toml>
```

### Configuration

```toml
[listen]
# ip and port to listen on
address = "127.0.0.1"
port = 7001
# or alternativelly, a socket to listen on
# path = "/run/frontend.sock"

[site]
# where this site can be found
url = "http://example.com/"
# url of the api server (https://github.com/demostf/api), defaults to "https://api.demos.tf/"
api = "https://api.example.com/"
# url of the map data server (https://github.com/demostf/maps), defaults to "https://maps.demos.tf/"
maps = "https://maps.example.com/"

[database]
hostname = "db.example.com"
username = "demostf"
password = "XXXXXXXXXX"
```

Alternatively, the configuration can be proved as environment variables in the form of `${SECTION}_${ITEM}` (e.g. `LISTEN_ADDRESS=127.0.0.1`)