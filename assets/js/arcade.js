/**
 * CYBER DEFENDER 2077 - ARCADE ENGINE WITH GLOBAL LEADERBOARD & HYPER-ANIMATIONS
 * Features:
 * - 60 FPS Canvas Space Shooter with Hyperspace Starfield & Thruster Embers
 * - Real-Time Global Leaderboard Sync via REST Cloud API
 * - Web Audio 8-Bit Synthesizer Engine
 * - Boss Warning Strobe, Screen Glitch on Damage, Expanding EMP Shockwave
 * - Confetti Celebration Fireworks on High Score Submission
 * Author: Bharat Kumar
 */

(function () {
  'use strict';

  // ---------------- 1. Web Audio 8-Bit Synthesizer ----------------
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSfx(type) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    try {
      if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'powerup') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.05, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.08);
        });
      } else if (type === 'emp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'boss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.setValueAtTime(140, now + 0.15);
        osc.frequency.setValueAtTime(110, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'gameover') {
        [300, 260, 220, 180, 130].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.08, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.12);
        });
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // ---------------- 2. Global Leaderboard Cloud Sync ----------------
  const LEADERBOARD_API = 'https://api.restful-api.dev/objects/ff808181a09d98f701a189247bb5570f';
  let globalScores = [
    { player: "BHARAT_KUMAR", score: 2850, wave: 6, badge: "DEV 👑", date: "OCT 2026" },
    { player: "CYBER_VIPER", score: 2420, wave: 5, badge: "PRO 🔥", date: "OCT 2026" },
    { player: "NEO_MATRIX", score: 1980, wave: 4, badge: "ELITE ⚡", date: "OCT 2026" },
    { player: "SHADOW_SYS", score: 1650, wave: 4, badge: "ACE 🎯", date: "OCT 2026" },
    { player: "GLITCH_HUNTER", score: 1410, wave: 3, badge: "RUNNER 🚀", date: "OCT 2026" }
  ];

  async function fetchGlobalLeaderboard() {
    try {
      const res = await fetch(LEADERBOARD_API);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.scores)) {
          globalScores = json.data.scores;
          localStorage.setItem('bk_cached_leaderboard', JSON.stringify(globalScores));
        }
      }
    } catch (e) {
      // Fallback to local storage if offline
      const cached = localStorage.getItem('bk_cached_leaderboard');
      if (cached) globalScores = JSON.parse(cached);
    }
    renderLeaderboardTable();
  }

  async function submitGlobalScore(playerCallsign, finalScore, finalWave) {
    const cleanName = (playerCallsign.trim() || 'ANONYMOUS').toUpperCase().slice(0, 15);
    const newEntry = {
      player: cleanName,
      score: finalScore,
      wave: finalWave,
      badge: finalScore >= 2000 ? "CHAMPION ⚡" : (finalScore >= 1000 ? "WARRIOR 🚀" : "SCOUT 🎮"),
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    // Add and sort descending
    globalScores.push(newEntry);
    globalScores.sort((a, b) => b.score - a.score);
    globalScores = globalScores.slice(0, 15); // Top 15
    localStorage.setItem('bk_cached_leaderboard', JSON.stringify(globalScores));
    renderLeaderboardTable();

    // Trigger celebration fireworks
    spawnConfettiStorm();

    try {
      await fetch(LEADERBOARD_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "BK_GLOBAL_LEADERBOARD",
          data: { scores: globalScores }
        })
      });
    } catch (e) {
      console.warn("Could not sync to cloud, cached locally.", e);
    }
  }

  function renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    tbody.innerHTML = globalScores.map((s, idx) => {
      let rankHtml = `<span class="rank-badge">${idx + 1}</span>`;
      if (idx === 0) rankHtml = `<span class="rank-badge rank-1">🥇</span>`;
      else if (idx === 1) rankHtml = `<span class="rank-badge rank-2">🥈</span>`;
      else if (idx === 2) rankHtml = `<span class="rank-badge rank-3">🥉</span>`;

      return `
        <tr>
          <td>${rankHtml}</td>
          <td>
            <div class="player-callsign">
              <span>${escapeHtml(s.player)}</span>
              ${s.badge ? `<span class="player-dev-tag">${s.badge}</span>` : ''}
            </div>
          </td>
          <td class="score-highlight">${s.score.toLocaleString()}</td>
          <td>Wave ${s.wave || 1}</td>
          <td style="color:#64748b; font-size:0.75rem;">${s.date || 'Recent'}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------------- 3. Core Game State & Constants ----------------
  const V_WIDTH = 800;
  const V_HEIGHT = 500;

  let canvas = null;
  let ctx = null;

  let animationFrameId = null;
  let isRunning = false;
  let isPaused = false;
  let hardMode = false;

  let score = 0;
  let highScore = parseInt(localStorage.getItem('bk_cyber_defender_highscore') || '0', 10);
  let lives = 3;
  let wave = 1;
  let combo = 0;
  let comboTimer = 0;
  let screenShake = 0;

  // Visual Effect States
  let shockwaves = [];
  let confetti = [];
  let warpSpeed = false;

  // Player Object
  const player = {
    x: V_WIDTH / 2,
    y: V_HEIGHT - 55,
    width: 36,
    height: 38,
    speed: 7.5,
    vx: 0,
    hasShield: false,
    shieldTimer: 0,
    tripleShot: false,
    tripleTimer: 0,
    lastShot: 0,
    fireCooldown: 130 // ms
  };

  // Game Entity Arrays
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let powerups = [];
  let particles = [];
  let floatingTexts = [];
  let stars = [];
  let boss = null;

  // Inputs
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    KeyA: false,
    KeyD: false,
    Space: false
  };

  // Initialize Starfield
  function initStars() {
    stars = [];
    for (let i = 0; i < 110; i++) {
      stars.push({
        x: Math.random() * V_WIDTH,
        y: Math.random() * V_HEIGHT,
        speed: 0.6 + Math.random() * 2.8,
        length: 2,
        size: Math.random() < 0.25 ? 2.5 : 1.2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
  }

  // ---------------- 4. Spawners & FX Helpers ----------------
  function spawnEnemy() {
    if (boss) return;

    const types = ['bug', 'bug', 'glitch'];
    if (score > 200) types.push('kamikaze');
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let width = 30;
    let height = 26;
    let hp = 1;
    let color = '#10b981'; // Green
    let speed = 1.6 + Math.random() * 1.2 + (wave * 0.18);

    if (chosenType === 'glitch') {
      width = 34;
      height = 30;
      hp = 2;
      color = '#ec4899'; // Pink/Purple
      speed = 1.2 + Math.random() * 0.9;
    } else if (chosenType === 'kamikaze') {
      width = 24;
      height = 24;
      hp = 1;
      color = '#06b6d4'; // Cyan
      speed = 3.4 + Math.random() * 1.6;
    }

    enemies.push({
      x: 35 + Math.random() * (V_WIDTH - 70),
      y: -40,
      width,
      height,
      type: chosenType,
      hp,
      maxHp: hp,
      color,
      speed,
      angle: 0,
      shootCooldown: 1400 + Math.random() * 1800,
      lastShot: performance.now()
    });
  }

  function spawnBoss() {
    playSfx('boss');
    const strobe = document.getElementById('boss-warning-strobe');
    if (strobe) {
      strobe.style.display = 'block';
      setTimeout(() => { strobe.style.display = 'none'; }, 2500);
    }

    addFloatingText(V_WIDTH / 2, 130, '⚠️ CRITICAL: NULL_POINTER_EXCEPTION ⚠️', '#ef4444', 24);
    boss = {
      x: V_WIDTH / 2,
      y: -95,
      targetY: 85,
      width: 115,
      height: 72,
      hp: 35 + (wave * 12),
      maxHp: 35 + (wave * 12),
      speed: 2.4,
      dir: 1,
      lastAttack: performance.now(),
      attackInterval: 750
    };
  }

  function spawnPowerup(x, y) {
    const roll = Math.random();
    let type = 'data';
    let color = '#38bdf8';
    let label = '💎';

    if (roll < 0.28) {
      type = 'triple';
      color = '#f59e0b';
      label = '⚡';
    } else if (roll < 0.52) {
      type = 'shield';
      color = '#10b981';
      label = '🛡️';
    } else if (roll < 0.70) {
      type = 'emp';
      color = '#ec4899';
      label = '💥';
    }

    powerups.push({
      x,
      y,
      type,
      color,
      label,
      width: 24,
      height: 24,
      vy: 1.8
    });
  }

  function createExplosion(x, y, color = '#ec4899', count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 6.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.2 + Math.random() * 3.5,
        alpha: 1,
        decay: 0.024 + Math.random() * 0.035
      });
    }
  }

  function addShockwave(x, y, color = '#00f7ff') {
    shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 360,
      color,
      alpha: 1,
      lineWidth: 8
    });
  }

  function addFloatingText(x, y, text, color = '#ffffff', size = 16) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      alpha: 1,
      vy: -1.3
    });
  }

  function spawnConfettiStorm() {
    const colors = ['#00f7ff', '#ec4899', '#f59e0b', '#10b981', '#a855f7'];
    for (let i = 0; i < 90; i++) {
      confetti.push({
        x: Math.random() * V_WIDTH,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        alpha: 1
      });
    }
  }

  // ---------------- 5. Update Game Loop Logic ----------------
  function update(delta) {
    const now = performance.now();

    // Screen Shake decay
    if (screenShake > 0) screenShake *= 0.88;
    if (screenShake < 0.2) screenShake = 0;

    // Starfield warp effect
    warpSpeed = player.tripleShot || (boss !== null);
    const starMult = warpSpeed ? 3.5 : 1;
    stars.forEach(star => {
      star.y += star.speed * starMult;
      star.length = warpSpeed ? star.speed * 8 : 2;
      if (star.y > V_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * V_WIDTH;
      }
    });

    // Combo timer
    if (combo > 1) {
      comboTimer -= delta;
      if (comboTimer <= 0) {
        combo = 0;
      }
    }

    // Powerup Timers
    if (player.hasShield) {
      player.shieldTimer -= delta;
      if (player.shieldTimer <= 0) player.hasShield = false;
    }
    if (player.tripleShot) {
      player.tripleTimer -= delta;
      if (player.tripleTimer <= 0) player.tripleShot = false;
    }

    // Player Movement
    const moveLeft = keys.ArrowLeft || keys.KeyA;
    const moveRight = keys.ArrowRight || keys.KeyD;
    if (moveLeft && !moveRight) {
      player.vx = -player.speed;
    } else if (moveRight && !moveLeft) {
      player.vx = player.speed;
    } else {
      player.vx *= 0.72;
    }

    player.x += player.vx;
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > V_WIDTH - player.width / 2) player.x = V_WIDTH - player.width / 2;

    // Thruster Ember Emission
    if (Math.random() < 0.6) {
      particles.push({
        x: player.x + (Math.random() - 0.5) * 8,
        y: player.y + player.height / 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2 + Math.random() * 3,
        color: player.tripleShot ? '#f59e0b' : '#00f7ff',
        size: 2,
        alpha: 0.8,
        decay: 0.05
      });
    }

    // Player Fire
    if (keys.Space && now - player.lastShot > player.fireCooldown) {
      firePlayerWeapon(now);
    }

    // Update Player Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.y < -20 || b.x < -20 || b.x > V_WIDTH + 20) {
        bullets.splice(i, 1);
      }
    }

    // Update Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;

      const dist = Math.hypot(eb.x - player.x, eb.y - player.y);
      if (dist < player.width / 2 + 6) {
        enemyBullets.splice(i, 1);
        handlePlayerHit();
        continue;
      }

      if (eb.y > V_HEIGHT + 20) {
        enemyBullets.splice(i, 1);
      }
    }

    // Update Boss
    if (boss) {
      if (boss.y < boss.targetY) {
        boss.y += 1.6;
      } else {
        boss.x += boss.speed * boss.dir;
        if (boss.x < 100 || boss.x > V_WIDTH - 100) boss.dir *= -1;

        if (now - boss.lastAttack > boss.attackInterval) {
          boss.lastAttack = now;
          playSfx('laser');
          [-1.8, 0, 1.8].forEach(vx => {
            enemyBullets.push({
              x: boss.x,
              y: boss.y + boss.height / 2,
              vx,
              vy: 4.4,
              color: '#ef4444'
            });
          });
        }
      }

      // Boss collisions
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        if (
          b.x > boss.x - boss.width / 2 &&
          b.x < boss.x + boss.width / 2 &&
          b.y > boss.y - boss.height / 2 &&
          b.y < boss.y + boss.height / 2
        ) {
          bullets.splice(j, 1);
          boss.hp -= b.dmg;
          createExplosion(b.x, b.y, '#f59e0b', 5);
          playSfx('hit');

          if (boss.hp <= 0) {
            createExplosion(boss.x, boss.y, '#ef4444', 65);
            addShockwave(boss.x, boss.y, '#ef4444');
            playSfx('emp');
            score += 600;
            addFloatingText(boss.x, boss.y, '+600 NULL_POINTER PURGED! 🏆', '#f59e0b', 22);
            spawnPowerup(boss.x, boss.y);
            boss = null;
            wave++;
            break;
          }
        }
      }
    }

    // Trigger Boss spawn
    if (!boss && score >= wave * 550) {
      spawnBoss();
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      if (e.type === 'kamikaze') {
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;
      } else {
        e.y += e.speed;
        e.angle += 0.04;
        e.x += Math.sin(e.angle) * 1.6;

        if (e.type === 'glitch' && now - e.lastShot > e.shootCooldown) {
          e.lastShot = now;
          enemyBullets.push({
            x: e.x,
            y: e.y + 12,
            vx: 0,
            vy: 3.6,
            color: '#ec4899'
          });
        }
      }

      // Check collision with player
      const distToPlayer = Math.hypot(e.x - player.x, e.y - player.y);
      if (distToPlayer < (player.width + e.width) / 2.8) {
        createExplosion(e.x, e.y, e.color, 16);
        enemies.splice(i, 1);
        handlePlayerHit();
        continue;
      }

      // Check bullet collisions
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        if (
          b.x > e.x - e.width / 2 &&
          b.x < e.x + e.width / 2 &&
          b.y > e.y - e.height / 2 &&
          b.y < e.y + e.height / 2
        ) {
          bullets.splice(j, 1);
          e.hp -= b.dmg;
          createExplosion(b.x, b.y, b.color, 5);

          if (e.hp <= 0) {
            createExplosion(e.x, e.y, e.color, 18);
            playSfx('hit');

            combo++;
            comboTimer = 2200;
            const pts = (e.type === 'glitch' ? 30 : 15) * Math.min(combo, 5);
            score += pts;

            addFloatingText(e.x, e.y, `+${pts}${combo > 1 ? ` (${combo}x)` : ''}`, e.color, 15);

            if (Math.random() < 0.24) {
              spawnPowerup(e.x, e.y);
            }

            enemies.splice(i, 1);
            break;
          }
        }
      }

      if (e && e.y > V_HEIGHT + 40) {
        enemies.splice(i, 1);
      }
    }

    // Spawn wave cadence
    if (!boss && enemies.length < (hardMode ? 8 : 5) && Math.random() < 0.038) {
      spawnEnemy();
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy;

      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < player.width / 2 + 16) {
        playSfx('powerup');
        applyPowerup(p.type);
        addFloatingText(p.x, p.y, `${p.label} ACTIVATED!`, p.color, 17);
        powerups.splice(i, 1);
        continue;
      }

      if (p.y > V_HEIGHT + 30) powerups.splice(i, 1);
    }

    // Update Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 12;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius) shockwaves.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;
      if (pt.alpha <= 0) particles.splice(i, 1);
    }

    // Update Confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const cf = confetti[i];
      cf.x += cf.vx;
      cf.y += cf.vy;
      cf.rotation += cf.rotSpeed;
      if (cf.y > V_HEIGHT + 20) confetti.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.022;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    // Local High Score tracking
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('bk_cyber_defender_highscore', highScore);
    }

    updateHudUi();
  }

  function firePlayerWeapon(now) {
    player.lastShot = now;
    playSfx('laser');

    if (player.tripleShot) {
      bullets.push({ x: player.x, y: player.y - 15, vx: 0, vy: -10.5, dmg: 1, color: '#f59e0b' });
      bullets.push({ x: player.x - 12, y: player.y - 10, vx: -2.8, vy: -10, dmg: 1, color: '#f59e0b' });
      bullets.push({ x: player.x + 12, y: player.y - 10, vx: 2.8, vy: -10, dmg: 1, color: '#f59e0b' });
    } else {
      bullets.push({ x: player.x - 8, y: player.y - 15, vx: 0, vy: -10, dmg: 1, color: '#00f7ff' });
      bullets.push({ x: player.x + 8, y: player.y - 15, vx: 0, vy: -10, dmg: 1, color: '#00f7ff' });
    }
  }

  function applyPowerup(type) {
    if (type === 'triple') {
      player.tripleShot = true;
      player.tripleTimer = 8500;
    } else if (type === 'shield') {
      player.hasShield = true;
      player.shieldTimer = 10000;
    } else if (type === 'emp') {
      playSfx('emp');
      screenShake = 16;
      addShockwave(V_WIDTH / 2, V_HEIGHT / 2, '#ec4899');
      createExplosion(V_WIDTH / 2, V_HEIGHT / 2, '#ec4899', 50);
      enemies.forEach(e => {
        score += 25;
        createExplosion(e.x, e.y, e.color, 14);
      });
      enemies = [];
      enemyBullets = [];
      addFloatingText(V_WIDTH / 2, V_HEIGHT / 2, '⚡ EMP PULSE: MAINFRAME PURGED ⚡', '#00f7ff', 20);
    } else if (type === 'data') {
      score += 150;
    }
  }

  function handlePlayerHit() {
    // Screen Glitch Effect
    const screenWrap = document.querySelector('.arcade-screen-wrap');
    if (screenWrap) {
      screenWrap.classList.add('screen-glitch-active');
      setTimeout(() => screenWrap.classList.remove('screen-glitch-active'), 250);
    }

    if (player.hasShield) {
      player.hasShield = false;
      playSfx('emp');
      screenShake = 9;
      addShockwave(player.x, player.y, '#38bdf8');
      addFloatingText(player.x, player.y - 20, '🛡️ SHIELD BROKEN!', '#38bdf8', 16);
      createExplosion(player.x, player.y, '#38bdf8', 22);
      return;
    }

    lives--;
    screenShake = 18;
    createExplosion(player.x, player.y, '#ef4444', 28);
    playSfx('hit');

    if (lives <= 0) {
      gameOver();
    }
  }

  function gameOver() {
    isRunning = false;
    playSfx('gameover');

    const overlay = document.getElementById('game-overlay');
    const title = document.getElementById('overlay-title');
    const sub = document.getElementById('overlay-subtitle');
    const btn = document.getElementById('overlay-play-btn');
    const submissionBox = document.getElementById('score-submission-box');

    if (overlay && title && sub && btn) {
      title.textContent = 'SYSTEM BREACHED';
      title.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
      title.style.webkitBackgroundClip = 'text';
      sub.innerHTML = `Final Score: <strong style="color:#00f7ff;">${score}</strong> | Wave: <strong style="color:#f59e0b;">${wave}</strong><br/>Submit your callsign to challenge the global rankings!`;
      btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Play Again';
      if (submissionBox) submissionBox.style.display = 'block';
      overlay.classList.remove('hidden');
    }
  }

  // ---------------- 6. Canvas Render ----------------
  function render() {
    ctx.save();

    // Clear Screen
    ctx.fillStyle = '#030206';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Apply Screen Shake
    if (screenShake > 0) {
      const dx = (Math.random() - 0.5) * screenShake;
      const dy = (Math.random() - 0.5) * screenShake;
      ctx.translate(dx, dy);
    }

    // Grid Matrix Horizon
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < V_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, V_HEIGHT);
      ctx.stroke();
    }

    // Starfield with Warp-Speed Streaks
    stars.forEach(star => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.lineWidth = star.size;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x, star.y + star.length);
      ctx.stroke();
    });

    // Expanding Shockwaves
    shockwaves.forEach(sw => {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Draw Player Ship
    drawPlayer();

    // Draw Player Bullets
    bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
      ctx.shadowBlur = 0;
    });

    // Draw Enemy Bullets
    enemyBullets.forEach(eb => {
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Enemies
    enemies.forEach(e => drawEnemy(e));

    // Draw Boss
    if (boss) drawBoss();

    // Draw Powerups
    powerups.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, p.x, p.y);
    });

    // Draw Particles
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    });
    ctx.globalAlpha = 1.0;

    // Draw Confetti
    confetti.forEach(cf => {
      ctx.save();
      ctx.translate(cf.x, cf.y);
      ctx.rotate((cf.rotation * Math.PI) / 180);
      ctx.fillStyle = cf.color;
      ctx.fillRect(-cf.size / 2, -cf.size / 2, cf.size, cf.size);
      ctx.restore();
    });

    // Draw Floating Combat Texts
    floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.size}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Thruster Flame
    const flameH = 9 + Math.random() * 8;
    ctx.fillStyle = player.tripleShot ? '#f59e0b' : '#00f7ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(-6, player.height / 2);
    ctx.lineTo(0, player.height / 2 + flameH);
    ctx.lineTo(6, player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hull
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = player.tripleShot ? '#f59e0b' : '#00f7ff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(player.width / 2, player.height / 2);
    ctx.lineTo(0, player.height / 3);
    ctx.lineTo(-player.width / 2, player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -2, 3.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield Bubble
    if (player.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.width * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawEnemy(e) {
    ctx.save();
    ctx.translate(e.x, e.y);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;

    if (e.type === 'bug') {
      ctx.beginPath();
      ctx.moveTo(0, -e.height / 2);
      ctx.lineTo(e.width / 2, 0);
      ctx.lineTo(0, e.height / 2);
      ctx.lineTo(-e.width / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'glitch') {
      const jitter = (Math.random() - 0.5) * 3;
      ctx.strokeRect(-e.width / 2 + jitter, -e.height / 2, e.width, e.height);
      ctx.fillRect(-e.width / 2, -e.height / 2, e.width, e.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ERR', 0, 0);
    } else if (e.type === 'kamikaze') {
      ctx.beginPath();
      ctx.moveTo(0, e.height / 2);
      ctx.lineTo(e.width / 2, -e.height / 2);
      ctx.lineTo(0, -e.height / 4);
      ctx.lineTo(-e.width / 2, -e.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBoss() {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    ctx.fillStyle = '#110c1c';
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 22;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, boss.height / 2);
    ctx.lineTo(boss.width / 2, -boss.height / 4);
    ctx.lineTo(boss.width / 3, -boss.height / 2);
    ctx.lineTo(-boss.width / 3, -boss.height / 2);
    ctx.lineTo(-boss.width / 2, -boss.height / 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Boss HP bar
    const hpPct = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-boss.width / 2, -boss.height / 2 - 16, boss.width, 7);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-boss.width / 2, -boss.height / 2 - 16, boss.width * hpPct, 7);

    ctx.restore();
  }

  // ---------------- 7. HUD Sync & Loop ----------------
  function updateHudUi() {
    const scoreVal = document.getElementById('hud-score-val');
    const highVal = document.getElementById('hud-high-val');
    const deckHigh = document.getElementById('deck-high-score-val');
    const livesBox = document.getElementById('hud-lives-box');

    if (scoreVal) scoreVal.textContent = score.toString().padStart(4, '0');
    if (highVal) highVal.textContent = highScore.toString().padStart(4, '0');
    if (deckHigh) deckHigh.textContent = highScore.toString();

    if (livesBox) {
      let heartsHtml = '';
      for (let i = 0; i < 3; i++) {
        if (i < lives) {
          heartsHtml += '<i class="fa-solid fa-heart hud-life-heart"></i>';
        } else {
          heartsHtml += '<i class="fa-regular fa-heart hud-life-heart" style="opacity:0.3;"></i>';
        }
      }
      livesBox.innerHTML = heartsHtml;
    }
  }

  let lastTimestamp = performance.now();

  function gameLoop(currentTimestamp) {
    if (!isRunning) return;

    const delta = Math.min(currentTimestamp - lastTimestamp, 50);
    lastTimestamp = currentTimestamp;

    if (!isPaused) {
      update(delta);
      render();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function startNewGame() {
    getAudioContext();
    score = 0;
    lives = 3;
    wave = 1;
    combo = 0;
    boss = null;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerups = [];
    particles = [];
    floatingTexts = [];
    shockwaves = [];

    player.x = V_WIDTH / 2;
    player.y = V_HEIGHT - 55;
    player.vx = 0;
    player.hasShield = false;
    player.tripleShot = false;

    isRunning = true;
    isPaused = false;
    lastTimestamp = performance.now();

    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.classList.add('hidden');

    const leaderboardPanel = document.getElementById('arcade-leaderboard-panel');
    if (leaderboardPanel) leaderboardPanel.classList.add('hidden');

    playSfx('powerup');
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // ---------------- 8. Controls & Listeners ----------------
  function setupControls() {
    window.addEventListener('keydown', e => {
      if (e.code in keys) {
        keys[e.code] = true;
        if (e.code === 'Space' && isRunning) e.preventDefault();
      }
      if (e.code === 'KeyP' && isRunning) {
        isPaused = !isPaused;
        addFloatingText(V_WIDTH / 2, V_HEIGHT / 2, isPaused ? '⏸️ PAUSED' : '▶ RESUMED', '#ffffff', 24);
      }
    });

    window.addEventListener('keyup', e => {
      if (e.code in keys) keys[e.code] = false;
    });

    // Play Buttons
    const playBtn = document.getElementById('overlay-play-btn');
    if (playBtn) playBtn.addEventListener('click', startNewGame);

    // Leaderboard Tabs & View Controls
    const tabGame = document.getElementById('arcade-tab-game');
    const tabLeaderboard = document.getElementById('arcade-tab-leaderboard');
    const leaderboardPanel = document.getElementById('arcade-leaderboard-panel');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');

    function showGameView() {
      if (leaderboardPanel) leaderboardPanel.classList.add('hidden');
      if (tabGame) tabGame.classList.add('active');
      if (tabLeaderboard) tabLeaderboard.classList.remove('active');
    }

    function showLeaderboardView() {
      if (leaderboardPanel) leaderboardPanel.classList.remove('hidden');
      if (tabLeaderboard) tabLeaderboard.classList.add('active');
      if (tabGame) tabGame.classList.remove('active');
      fetchGlobalLeaderboard();
    }

    if (tabGame) tabGame.addEventListener('click', showGameView);
    if (tabLeaderboard) tabLeaderboard.addEventListener('click', showLeaderboardView);
    if (btnCloseLeaderboard) btnCloseLeaderboard.addEventListener('click', showGameView);
    if (btnRefreshLeaderboard) {
      btnRefreshLeaderboard.addEventListener('click', () => {
        btnRefreshLeaderboard.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
        fetchGlobalLeaderboard().then(() => {
          btnRefreshLeaderboard.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh';
        });
      });
    }

    // High Score Submission Form
    const submitBtn = document.getElementById('btn-submit-callsign');
    const callsignInput = document.getElementById('score-callsign-input');
    const submissionBox = document.getElementById('score-submission-box');

    if (submitBtn && callsignInput) {
      submitBtn.addEventListener('click', async () => {
        const name = callsignInput.value.trim() || 'ANONYMOUS';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        await submitGlobalScore(name, score, wave);

        if (submissionBox) submissionBox.style.display = 'none';
        showLeaderboardView();
      });

      callsignInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitBtn.click();
      });
    }

    // CRT Toggle
    const crtToggle = document.getElementById('arcade-crt-toggle');
    const crtOverlay = document.getElementById('crt-overlay');
    if (crtToggle && crtOverlay) {
      crtToggle.addEventListener('click', () => {
        crtOverlay.classList.toggle('disabled');
        crtToggle.classList.toggle('active');
        crtToggle.innerHTML = crtOverlay.classList.contains('disabled')
          ? '<i class="fa-solid fa-tv"></i> CRT: OFF'
          : '<i class="fa-solid fa-tv"></i> CRT: ON';
      });
    }

    // Audio Toggle
    const sfxToggle = document.getElementById('arcade-sfx-toggle');
    if (sfxToggle) {
      sfxToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        sfxToggle.classList.toggle('active');
        sfxToggle.innerHTML = soundEnabled
          ? '<i class="fa-solid fa-volume-high"></i> SFX: ON'
          : '<i class="fa-solid fa-volume-xmark"></i> SFX: OFF';
      });
    }

    // Difficulty Toggle
    const diffToggle = document.getElementById('arcade-diff-toggle');
    if (diffToggle) {
      diffToggle.addEventListener('click', () => {
        hardMode = !hardMode;
        diffToggle.classList.toggle('active');
        diffToggle.innerHTML = hardMode
          ? '<i class="fa-solid fa-skull"></i> OVERCLOCK'
          : '<i class="fa-solid fa-gauge"></i> NORMAL';
      });
    }

    // Mobile D-Pad Touch
    const touchLeft = document.getElementById('touch-btn-left');
    const touchRight = document.getElementById('touch-btn-right');
    const touchFire = document.getElementById('touch-btn-fire');

    if (touchLeft) {
      touchLeft.addEventListener('touchstart', e => { e.preventDefault(); keys.ArrowLeft = true; });
      touchLeft.addEventListener('touchend', e => { e.preventDefault(); keys.ArrowLeft = false; });
    }
    if (touchRight) {
      touchRight.addEventListener('touchstart', e => { e.preventDefault(); keys.ArrowRight = true; });
      touchRight.addEventListener('touchend', e => { e.preventDefault(); keys.ArrowRight = false; });
    }
    if (touchFire) {
      touchFire.addEventListener('touchstart', e => {
        e.preventDefault();
        keys.Space = true;
        if (!isRunning) startNewGame();
      });
      touchFire.addEventListener('touchend', e => { e.preventDefault(); keys.Space = false; });
    }

    // Canvas Drag Aim
    if (canvas) {
      let isDragging = false;
      function handleTouchMove(e) {
        if (!isRunning) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const scaleX = V_WIDTH / rect.width;
        player.x = (clientX - rect.left) * scaleX;
      }

      canvas.addEventListener('touchstart', e => {
        isDragging = true;
        keys.Space = true;
        handleTouchMove(e);
        if (!isRunning) startNewGame();
      });
      canvas.addEventListener('touchmove', e => { if (isDragging) handleTouchMove(e); });
      canvas.addEventListener('touchend', () => { isDragging = false; keys.Space = false; });
    }
  }

  // ---------------- 9. Bootstrap ----------------
  document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('cyber-game-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = V_WIDTH;
    canvas.height = V_HEIGHT;

    initStars();
    setupControls();
    updateHudUi();
    fetchGlobalLeaderboard();
    render();

    window.launchCyberDefender = function () {
      const section = document.getElementById('arcade');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => startNewGame(), 600);
      }
    };
  });
})();
