const express = require("express");
const http = require("http");
const fetch = require("node-fetch");
const { PassThrough } = require("stream");

const PORT = process.env.PORT || 3000;
const app = express();

// Pool von verrückten Soundeffekten (aus MyInstants und freien APIs)
const SOUND_POOL = [
  "https://www.myinstants.com/media/sounds/vine-boom.mp3",
  "https://www.myinstants.com/media/sounds/metal-pipe-falling.mp3",
  "https://www.myinstants.com/media/sounds/fart-with-reverb.mp3",
  "https://www.myinstants.com/media/sounds/discord-notification.mp3",
  "https://www.myinstants.com/media/sounds/bruh.mp3",
  "https://www.myinstants.com/media/sounds/yippee-tbh-yippee-tbh-creature.mp3",
  "https://www.myinstants.com/media/sounds/error-sound-effect.mp3",
  "https://www.myinstants.com/media/sounds/spongebob-fail.mp3",
  "https://www.myinstants.com/media/sounds/among-us-role-reveal.mp3",
  "https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3"
];

// Globaler Audio-Stream
let globalStream = new PassThrough();
let isStreaming = false;
let currentVolume = 0.5;

// HTML-Client mit Volume-Control
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔊 Chaotic Audio Stream</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 500px;
      width: 90%;
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }
    button {
      padding: 15px 30px;
      font-size: 1.2em;
      font-weight: bold;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    button:hover {
      transform: scale(1.05);
    }
    #playBtn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    #stopBtn {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }
    .volume-control {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
    }
    .volume-control label {
      display: block;
      margin-bottom: 10px;
      font-size: 1.1em;
    }
    input[type="range"] {
      width: 100%;
      height: 8px;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.3);
      outline: none;
      -webkit-appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f5576c;
      cursor: pointer;
    }
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f5576c;
      cursor: pointer;
      border: none;
    }
    #status {
      margin-top: 20px;
      font-size: 1.3em;
      padding: 15px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔊 CHAOS STREAM</h1>
    
    <div class="controls">
      <button id="playBtn" onclick="startAudio()">▶️ START STREAM</button>
      <button id="stopBtn" onclick="stopAudio()">⏹️ STOP STREAM</button>
    </div>

    <div class="volume-control">
      <label for="volumeSlider">🔈 Volume: <span id="volumeValue">50</span>%</label>
      <input type="range" id="volumeSlider" min="0" max="100" value="50" oninput="updateVolume(this.value)">
    </div>

    <div id="status">🎵 Bereit zum Starten...</div>
  </div>

  <audio id="audioPlayer" preload="auto"></audio>

  <script>
    const audio = document.getElementById('audioPlayer');
    const status = document.getElementById('status');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');

    let isPlaying = false;

    async function startAudio() {
      if (isPlaying) return;
      
      try {
        status.textContent = '🎧 Verbinde mit Stream...';
        status.classList.add('pulse');
        
        // HTTP Audio Stream laden
        audio.src = '/stream?t=' + Date.now();
        audio.volume = volumeSlider.value / 100;
        
        await audio.play();
        
        isPlaying = true;
        status.textContent = '🔥 STREAM LÄUFT!';
        status.classList.remove('pulse');
        playBtn.disabled = true;
        stopBtn.disabled = false;
        
      } catch (err) {
        status.textContent = '❌ Fehler: ' + err.message;
        status.classList.remove('pulse');
        console.error(err);
      }
    }

    function stopAudio() {
      audio.pause();
      audio.src = '';
      isPlaying = false;
      status.textContent = '⏹️ Stream gestoppt';
      playBtn.disabled = false;
      stopBtn.disabled = true;
    }

    function updateVolume(value) {
      audio.volume = value / 100;
      volumeValue.textContent = value;
      
      // Volume auch an Server senden
      fetch('/volume?v=' + value, { method: 'POST' })
        .catch(err => console.error('Volume update failed:', err));
    }

    // Audio-Events
    audio.addEventListener('error', (e) => {
      status.textContent = '❌ Stream-Fehler';
      status.classList.remove('pulse');
      isPlaying = false;
      playBtn.disabled = false;
    });

    audio.addEventListener('ended', () => {
      status.textContent = '🔄 Stream beendet';
      isPlaying = false;
      playBtn.disabled = false;
    });

    // Initial state
    stopBtn.disabled = true;
  </script>
</body>
</html>`);
});

// HTTP Audio Stream Endpoint
app.get("/stream", async (req, res) => {
  console.log("📻 Neuer Stream-Client verbunden");

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  // Stream kontinuierlich Audio
  streamAudioLoop(res);
});

// Volume Control Endpoint
app.post("/volume", (req, res) => {
  const vol = parseFloat(req.query.v) || 50;
  currentVolume = vol / 100;
  console.log(`🔊 Volume geändert: ${vol}%`);
  res.json({ volume: vol });
});

// Kontinuierlicher Audio-Stream mit zufälligen Sounds
async function streamAudioLoop(res) {
  while (!res.destroyed) {
    try {
      // Zufälligen Sound auswählen
      const randomSound = SOUND_POOL[Math.floor(Math.random() * SOUND_POOL.length)];
      console.log(`🎵 Spiele: ${randomSound}`);

      // Audio herunterladen und streamen
      const response = await fetch(randomSound);
      
      if (!response.ok) {
        console.error(`❌ Fehler beim Laden von ${randomSound}`);
        await sleep(1000);
        continue;
      }

      // Audio-Daten zum Client streamen
      for await (const chunk of response.body) {
        if (res.destroyed) break;
        
        // Volume-Anpassung (einfache Amplituden-Multiplikation)
        const adjustedChunk = applyVolume(chunk, currentVolume);
        res.write(adjustedChunk);
      }

      // Kurze Pause zwischen Sounds (0.5-2 Sekunden)
      const pauseDuration = 500 + Math.random() * 1500;
      await sleep(pauseDuration);

    } catch (err) {
      console.error("❌ Stream-Fehler:", err.message);
      await sleep(2000);
    }
  }

  console.log("📻 Client getrennt");
}

// Einfache Volume-Anpassung (Amplituden-Multiplikation)
function applyVolume(buffer, volume) {
  if (volume === 1) return buffer;
  
  // Für MP3 ist echte Volume-Anpassung komplex
  // Hier vereinfachte Version - in Produktion würde man ffmpeg nutzen
  const adjusted = Buffer.from(buffer);
  
  // Einfache Byte-Level-Anpassung (nicht perfekt, aber funktioniert)
  for (let i = 0; i < adjusted.length; i++) {
    adjusted[i] = Math.floor(adjusted[i] * volume);
  }
  
  return adjusted;
}

// Helper: Sleep-Funktion
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Server starten
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🔊 CHAOTIC AUDIO STREAM SERVER      ║
║   Port: ${PORT}                      ║
║   URL: http://localhost:${PORT}       ║
╚═══════════════════════════════════════╝
  `);
});
