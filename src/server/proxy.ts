import Chaussette from "chaussette";

const proxy = new Chaussette({
  listenPort: 7173,
  targetAddr: "localhost",
  targetPort: 7171,
  verbosity: 1, // optional, default is 0
  logging: {
    // optional, logging options
    format: "HH-mm-ss", // logs timestamp formatting, default is 'DD-MM-YY HH:mm:ss'
  },
});

// configures the server and starts listening on port 9898
proxy.start();
