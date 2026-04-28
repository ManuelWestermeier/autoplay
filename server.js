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
  <button onclick="start()">START (Audio aktivieren)</button>
  <button onclick="emitLoud()">EMIT LOUD</button>

  <div id="status">Idle</div>

  <audio id="bg" loop crossorigin="anonymous"></audio>
  <audio id="loud" crossorigin="anonymous"></audio>

  <script>
    const ws = new WebSocket(location.origin.replace(/^http/, "ws"));

    const bg = document.getElementById("bg");
    const loud = document.getElementById("loud");
    const status = document.getElementById("status");

    let ctx, started = false;

    function initAudio() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Background
      const bgSource = ctx.createMediaElementSource(bg);
      const bgGain = ctx.createGain();
      bgGain.gain.value = 0.15;

      bgSource.connect(bgGain).connect(ctx.destination);

      // Loud chain (extrem laut + distortion)
      const loudSource = ctx.createMediaElementSource(loud);

      const gain = ctx.createGain();
      gain.gain.value = 6.0; // extrem laut

      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(1200);
      distortion.oversample = "4x";

      loudSource.connect(gain).connect(distortion).connect(ctx.destination);
    }

    function makeDistortionCurve(amount) {
      const n = 44100;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = Math.tanh(amount * x); // aggressive distortion
      }
      return curve;
    }

    async function start() {
      if (!started) {
        initAudio();
        started = true;
      }

      await ctx.resume();

      bg.src = "${AUDIO_URL}";
      bg.volume = 1.0;
      bg.play().catch(()=>{});

      status.innerText = "Background läuft";
    }

    function emitLoud() {
      ws.send("emit");
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "loud") {
        if (!ctx || ctx.state === "suspended") {
          return; // nicht gestartet → kein Ton möglich
        }

        loud.src = data.url;
        loud.currentTime = 0;

        status.innerText = "LOUD MODE 🔥";

        loud.play().catch(()=>{});

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
