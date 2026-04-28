const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const AUDIO_URL =
  "https://www.myinstants.com/media/sounds/hava-nagila-1-hours-0.mp3";

const app = express();

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Remote Audio</title>
  <style>
    body { font-family: Arial; text-align: center; margin-top: 60px; }
    button { padding: 10px 20px; margin: 5px; }
    #status { margin-top: 20px; font-size: 20px; }
  </style>
</head>
<body>

<button onclick="init()">START</button>
<button onclick="toggleRemote()">REMOTE TOGGLE</button>

<div id="status">Idle</div>

<audio id="bg" loop></audio>

<script>
  const ws = new WebSocket(location.origin.replace("http", "ws"));
  const bg = document.getElementById("bg");
  const status = document.getElementById("status");

  let ready = false;

  async function init() {
    if (ready) return;
    ready = true;

    bg.src = "${AUDIO_URL}";
    bg.volume = 0;
    bg.muted = false;

    try {
      await bg.play();
      status.textContent = "Running (muted)";
    } catch (e) {
      status.textContent = "Play blockiert";
    }
  }

  function toggleRemote() {
    ws.send("toggle");
  }

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.type === "toggle") {
      if (bg.volume === 0) {
        bg.volume = 1;
        status.textContent = "Volume 1";
      } else {
        bg.volume = 0;
        status.textContent = "Volume 0";
      }
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
    if (msg.toString() === "toggle") {
      const payload = JSON.stringify({ type: "toggle" });

      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(payload);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server läuft auf " + PORT);
});
