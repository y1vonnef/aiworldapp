const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const { time } = require("node:console");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT||3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let prompt = "Futuristic city.";
let creature = "";
let lastCallTime = 0;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    allowEIO3: true,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    //socket.emit("Test", "Hello from server");
    console.log(socket.id);
    socket.on("Prompt Update", (data) => {
      console.log("Received Prompt Update with data:", data);

      io.emit("Share Prompt", data);//dont need this if we doing everything on backend
    });

    socket.on("Image Result", (data) => {
      io.emit("TD Base64 Image", data);
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
