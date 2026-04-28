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
  <style>
    body { font-family: Arial; text-align: center; margin-top: 50px; }
    #status { font-size: 24px; margin-top: 20px; }
  </style>
</head>
<body>
  <button onclick="start()">START</button>
  <button onclick="emitLoud()">EMIT LOUD</button>

  <div id="status">Idle</div>

  <audio id="bg" loop></audio>
  <audio id="loud"></audio>

  <script>
    const ws = new WebSocket(location.origin.replace(/^http/, "ws"));

    const bg = document.getElementById("bg");
    const loud = document.getElementById("loud");
    const status = document.getElementById("status");

    let started = false;

    async function start() {
      if (!started) started = true;

      bg.src = "${AUDIO_URL}";
      bg.volume = 0.2;

      try {
        await bg.play();
        status.innerText = "Background läuft";
      } catch (e) {
        status.innerText = "Autoplay blockiert";
      }
    }

    function emitLoud() {
      ws.send("emit");
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "loud") {
        loud.src = data.url;
        loud.volume = 1.0;
        loud.currentTime = 0;

        try {
          await loud.play();
          status.innerText = "LOUD MODE";
        } catch (e) {
          console.log("PLAY ERROR:", e);
          status.innerText = "Blocked";
        }

        setTimeout(() => {
          status.innerText = "Background läuft";
        }, 3000);
      }
    };
  </script>
</body>
</html>`);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    if (msg.toString() === "emit") {
      const payload = JSON.stringify({
        type: "loud",
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
