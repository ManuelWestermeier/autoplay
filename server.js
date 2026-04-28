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
  <button onclick="startBackground()">Start Background</button>
  <button onclick="emitLoud()">Emit Loud</button>

  <audio id="bg" loop crossorigin="anonymous"></audio>
  <audio id="loud" crossorigin="anonymous"></audio>

  <script>
    const ws = new WebSocket(location.origin.replace(/^http/, "ws"));

    const bg = document.getElementById("bg");
    const loud = document.getElementById("loud");

    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Background (leise, normal)
    const bgSource = ctx.createMediaElementSource(bg);
    const bgGain = ctx.createGain();
    bgGain.gain.value = 0.2;
    bgSource.connect(bgGain).connect(ctx.destination);

    // Loud (stark distorted + laut)
    const loudSource = ctx.createMediaElementSource(loud);
    const loudGain = ctx.createGain();
    loudGain.gain.value = 4.0;

    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(800);
    distortion.oversample = "4x";

    function makeDistortionCurve(amount) {
      const k = amount;
      const n = 44100;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      }
      return curve;
    }

    loudSource.connect(loudGain).connect(distortion).connect(ctx.destination);

    function startBackground() {
      bg.src = "${AUDIO_URL}";
      if (ctx.state === "suspended") ctx.resume();
      bg.play().catch(() => {});
    }

    function emitLoud() {
      ws.send("emit");
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "loud") {
        loud.src = data.url;

        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        loud.currentTime = 0;
        loud.play().catch(() => {});
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
