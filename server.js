const express = require("express");
const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 3000;
const app = express();

// Erweiterte Sound-Bibliothek - Mixkit Free Sounds (garantiert funktionierend)
const SOUND_POOL = [
  // Game & UI Sounds
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  
  // Notifications & Alerts
  "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2025/2025-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2026/2026-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2030/2030-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3",
  
  // Special Effects
  "https://assets.mixkit.co/active_storage/sfx/2050/2050-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
  
  // Bonus Sounds
  "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3",
  "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3",
];

let currentVolume = 0.5;

// HTML-Client
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
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .subtitle {
      font-size: 0.9em;
      opacity: 0.8;
      margin-bottom: 30px;
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
    button:hover:not(:disabled) {
      transform: scale(1.05);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    .info {
      margin-top: 20px;
      font-size: 0.85em;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔊 CHAOS STREAM</h1>
    <div class="subtitle">Endloser Audio-Wahnsinn</div>
    
    <div class="controls">
      <button id="playBtn" onclick="startAudio()">▶️ START STREAM</button>
      <button id="stopBtn" onclick="stopAudio()">⏹️ STOP STREAM</button>
    </div>

    <div class="volume-control">
      <label for="volumeSlider">🔈 Volume: <span id="volumeValue">50</span>%</label>
      <input type="range" id="volumeSlider" min="0" max="100" value="50" oninput="updateVolume(this.value)">
    </div>

    <div id="status">🎵 Bereit zum Starten...</div>
    <div class="info">💡 ${SOUND_POOL.length} zufällige Soundeffekte in Endlosschleife</div>
  </div>

  <audio id="audioPlayer" preload="none"></audio>

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
        console.error('Audio Error:', err);
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
      
      fetch('/volume?v=' + value, { method: 'POST' })
        .catch(err => console.error('Volume update failed:', err));
    }

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      status.textContent = '❌ Stream-Fehler - Neustart...';
      status.classList.remove('pulse');
      
      setTimeout(() => {
        if (playBtn.disabled) {
          audio.src = '/stream?t=' + Date.now();
          audio.play().catch(err => stopAudio());
        }
      }, 3000);
    });

    audio.addEventListener('ended', () => {
      if (isPlaying) {
        audio.src = '/stream?t=' + Date.now();
        audio.play().catch(err => stopAudio());
      }
    });

    stopBtn.disabled = true;
  </script>
</body>
</html>`);
});

// HTTP Audio Stream
app.get("/stream", async (req, res) => {
  console.log("📻 Client verbunden");

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  await streamAudioLoop(res);
  res.end();
});

// Volume Control
app.post("/volume", (req, res) => {
  const vol = parseFloat(req.query.v) || 50;
  currentVolume = vol / 100;
  console.log(`🔊 Volume: ${vol}%`);
  res.json({ volume: vol });
});

// Audio Loop
async function streamAudioLoop(res) {
  let errors = 0;

  while (!res.writableEnded && errors < 5) {
    try {
      const sound = SOUND_POOL[Math.floor(Math.random() * SOUND_POOL.length)];
      console.log(`🎵 ${sound.split('/').pop()}`);

      const success = await streamAudioFile(sound, res);
      
      if (success) {
        errors = 0;
        await sleep(200 + Math.random() * 800);
      } else {
        errors++;
        await sleep(1000);
      }

    } catch (err) {
      errors++;
      console.error(`❌ ${err.message}`);
      await sleep(2000);
    }
  }

  console.log("📻 Disconnected");
}

// Stream Audio File
function streamAudioFile(url, res) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'audio/*'
      }
    }, (response) => {
      
      if (response.statusCode !== 200) {
        console.error(`❌ HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      let hasData = false;

      response.on('data', (chunk) => {
        if (!res.writableEnded) {
          hasData = true;
          res.write(chunk);
        }
      });

      response.on('end', () => {
        console.log(`✅ Fertig`);
        resolve(hasData);
      });

      response.on('error', (err) => {
        console.error(`❌ ${err.message}`);
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.error(`❌ ${err.message}`);
      resolve(false);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Server Start
http.createServer(app).listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🔊 CHAOTIC AUDIO STREAM SERVER      ║
║   Port: ${PORT}                      ║
║   URL: http://localhost:${PORT}       ║
║   Sounds: ${SOUND_POOL.length} Effekte                 ║
╚═══════════════════════════════════════╝
  `);
});
