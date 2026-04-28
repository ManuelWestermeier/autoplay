const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const AUDIO_URL = "https://www.myinstants.com/media/sounds/hava-nagila-1-hours-0.mp3";

const app = express();

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>WS Audio</title>
</head>
<body>
  <button onclick="sendPlay()">Play</button>
  <audio id="player"></audio>

  <script>
    const ws = new WebSocket(location.origin.replace(/^http/, "ws"));
    const audio = document.getElementById("player");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "play") {
        audio.src = data.url;
        audio.play().catch(() => {});
      }
    };

    function sendPlay() {
      ws.send("play");
    }
  </script>
</body>
</html>`);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    if (msg.toString() === "play") {
      const payload = JSON.stringify({
        type: "play",
        url: AUDIO_URL
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server läuft auf Port " + PORT);
});
