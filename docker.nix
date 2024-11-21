{ dockerTools
, demostf-frontend
,
}:
dockerTools.buildLayeredImage {
  name = "demostf/frontend";
  tag = "latest";
  maxLayers = 5;
  contents = [
    demostf-frontend
    dockerTools.caCertificates
  ];
  config = {
    Cmd = [ "demostf-frontend" ];
    ExposedPorts = {
      "80/tcp" = { };
    };
    Env = [
      "LISTEN_ADDRESS=0.0.0.0"
      "LISTEN_PORT=80"
    ];
  };
}
