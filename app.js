/* =====================================================================
   LOS NÚMEROS DE LUCAS · App (FuturMovil)
   Frontend en GitHub Pages · Backend Apps Script + Google Sheet
   ===================================================================== */
'use strict';
/* Imágenes que fallan: se ocultan (nunca se ve el icono roto), se reintentan 2 veces y,
   si es un planeta y sigue fallando, se pone la foto de otro planeta que sí carga con un
   DESTELLO dorado para que el admin vea que está duplicado y lo corrija */
(function () {
  const css = document.createElement('style');
  css.textContent = '@keyframes destelloDup{0%,78%,100%{filter:brightness(1) drop-shadow(0 0 10px rgba(255,210,63,.5))}86%{filter:brightness(2) drop-shadow(0 0 28px #ffd23f) drop-shadow(0 0 50px #fff)}}' +
    'img.img-dup{animation:destelloDup 2.4s ease-in-out infinite !important}img.img-espera{visibility:hidden}';
  document.head.appendChild(css);
  document.addEventListener('load', ev => { const t = ev.target; if (t && t.tagName === 'IMG') t.classList.remove('img-espera'); }, true);
  document.addEventListener('error', ev => {
    const t = ev.target; if (!t || t.tagName !== 'IMG') return;
    t.classList.add('img-espera');
    const n = +(t.dataset.re || 0);
    if (n < 2) { t.dataset.re = n + 1; setTimeout(() => { t.src = t.src.split('?')[0] + '?r=' + Date.now(); }, 700 * (n + 1)); return; }
    if (t.classList.contains('pimg') && !t.dataset.dup) {
      t.dataset.dup = '1';
      const ok = [...document.querySelectorAll('img.pimg')].find(x => x !== t && x.complete && x.naturalWidth > 0 && !x.dataset.dup);
      const roto = t.src.split('?')[0].split('/').pop();
      console.warn('[Los números de Lucas] Imagen rota sustituida:', roto);
      t.classList.add('img-dup'); t.title = 'Imagen duplicada (falla ' + roto + ')';
      t.src = ok ? ok.src : 'img/planetas/planeta01.png';
    }
  }, true);
})();


const CFG = {
  API: 'https://script.google.com/macros/s/AKfycbx80aCqqz6bQPX0pCJ3FFqUxHFScvUJymKU816m4Nae0iYjtInEQufM9gzRtC0Qvge7/exec',   // URL /exec de Apps Script "los numeros de lucas"
  GOOGLE: '454055120059-nuhaop4r62urc3u036cc3grpqo71ulg7.apps.googleusercontent.com',
  APP_URL: 'https://puntofibra.github.io/los-numeros-de-lucas/',
  MISION: 8
};

/* ---------------- utilidades ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esperar = ms => new Promise(r => setTimeout(r, ms));
const hoy = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const ayer = () => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem('ndl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ndl_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('ndl_' + k); } catch (e) {} }
};
function toast(t, ms = 2600) { const e = $('#toast'); e.textContent = t; e.classList.add('ver'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('ver'), ms); }
let pantallaActual = 'pCarga';
function ir(id) {
  const p = id.startsWith('p') && $('#' + id) ? id : 'p' + id[0].toUpperCase() + id.slice(1);
  $$('.pantalla').forEach(s => s.classList.remove('activa'));
  $('#' + p).classList.add('activa');
  pantallaActual = p;
  if (p !== 'pJuego') { VOZ.callar(); }
  ON_PANTALLA[p] && ON_PANTALLA[p]();
  if (window.ACT && ACT.pendiente() && ACT.seguro()) setTimeout(ACT.recargar, 600);
}
const ON_PANTALLA = {};

/* ---------------- API ---------------- */
function api(accion, datos) {
  if (!CFG.API) return Promise.resolve(apiLocal(accion, datos || {}));
  return fetch(CFG.API, { method: 'POST', body: JSON.stringify(Object.assign({ accion }, datos || {})) })
    .then(r => r.json()).catch(() => ({ ok: false, error: 'Sin conexión. Inténtalo otra vez.', red: true }));
}
/* modo local (solo pruebas, sin servidor) */
function apiLocal(accion, d) {
  const db = LS.get('dblocal', { u: {}, n: {} });
  const guarda = () => LS.set('dblocal', db);
  const ses = email => ({ ok: true, token: 'local-' + email, email, nombre: db.u[email].nombre, ninos: Object.values(db.n).filter(n => n.email === email) });
  if (accion === 'registro') { if (db.u[d.email]) return { ok: false, error: 'Ese correo ya tiene cuenta' }; db.u[d.email] = { nombre: d.nombre, pass: d.pass }; guarda(); return ses(d.email); }
  if (accion === 'login') { const u = db.u[d.email]; if (!u || u.pass !== d.pass) return { ok: false, error: 'Correo o contraseña incorrectos' }; return ses(d.email); }
  if (accion === 'estado') { const em = (d.token || '').replace('local-', ''); return db.u[em] ? ses(em) : { ok: false, error: 'Sesión caducada' }; }
  if (accion === 'guardarNino') { const em = d.token.replace('local-', ''); const n = d.nino; n.email = em; if (!n.id) n.id = 'n' + Date.now(); db.n[n.id] = n; guarda(); return { ok: true, nino: n }; }
  if (accion === 'borrarNino') { delete db.n[d.id]; guarda(); return { ok: true }; }
  return { ok: false, error: 'Necesita servidor' };
}

/* ---------------- fondo de estrellas ---------------- */
const ESTRELLAS = (() => {
  const c = $('#estrellas'), x = c.getContext('2d');
  let W, H, st = [], fug = null, vel = 0.25;
  function tam() { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio;
    st = Array.from({ length: Math.min(260, Math.floor(W * H / 9000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 1 + .2, t: Math.random() * 6 })); }
  addEventListener('resize', tam); tam();
  function bucle(t) {
    x.clearRect(0, 0, W, H);
    for (const s of st) {
      s.y += s.z * vel * devicePixelRatio; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      const a = .45 + Math.sin(t / 600 + s.t) * .35;
      x.fillStyle = `rgba(${s.z > 1 ? '180,255,210' : '220,235,255'},${a})`;
      x.beginPath(); x.arc(s.x, s.y, s.z * 1.3 * devicePixelRatio, 0, 7); x.fill();
    }
    if (!fug && Math.random() < .004) fug = { x: Math.random() * W, y: Math.random() * H * .5, v: 12 * devicePixelRatio, l: 1 };
    if (fug) {
      const g = x.createLinearGradient(fug.x, fug.y, fug.x - 120 * devicePixelRatio, fug.y - 60 * devicePixelRatio);
      g.addColorStop(0, `rgba(160,255,200,${fug.l})`); g.addColorStop(1, 'rgba(160,255,200,0)');
      x.strokeStyle = g; x.lineWidth = 2.5 * devicePixelRatio; x.beginPath(); x.moveTo(fug.x, fug.y); x.lineTo(fug.x - 120 * devicePixelRatio, fug.y - 60 * devicePixelRatio); x.stroke();
      fug.x += fug.v; fug.y += fug.v / 2; fug.l -= .015; if (fug.l <= 0) fug = null;
    }
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);
  return { turbo(v) { vel = v; } };
})();

/* ---------------- efectos (confeti, chispas) ---------------- */
const FX = (() => {
  const c = $('#fx'), x = c.getContext('2d'); let W, H, P = [], vivo = false;
  function tam() { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', tam); tam();
  const COL = ['#17ff5f', '#18e0ff', '#ffd23f', '#ff4fa3', '#8b5cff', '#ff8a3d', '#ffffff'];
  function bucle() {
    x.clearRect(0, 0, W, H);
    P = P.filter(p => p.v > 0);
    for (const p of P) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .985; p.r += p.vr; p.v -= p.d;
      x.save(); x.globalAlpha = Math.max(0, Math.min(1, p.v)); x.translate(p.x, p.y); x.rotate(p.r);
      if (p.fase != null) { p.fase += p.vf; p.x += Math.sin(p.fase) * p.ondula * d; if (p.vy > 0) { p.vy *= .985; p.vx *= .97; } }
      const giro = p.fase != null ? Math.cos(p.fase * 1.7) : 1;   // efecto de voltereta 3D
      if (p.tipo === 'estrella') { x.scale(1, Math.abs(giro) * .7 + .3); x.fillStyle = p.c; x.shadowColor = p.c; x.shadowBlur = 8; estrella(x, p.s); }
      else if (p.tipo === 'punto') { x.fillStyle = p.c; x.shadowColor = p.c; x.shadowBlur = 10; x.beginPath(); x.arc(0, 0, p.s, 0, 7); x.fill(); }
      else if (p.tipo === 'circulo') { x.scale(giro, 1); x.fillStyle = p.c; x.beginPath(); x.arc(0, 0, p.s * .7, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.arc(-p.s * .2, -p.s * .2, p.s * .25, 0, 7); x.fill(); }
      else if (p.tipo === 'cinta') { x.strokeStyle = p.c; x.lineWidth = p.s * .45; x.lineCap = 'round'; x.beginPath(); for (let k = 0; k <= 6; k++) { const yy = (k - 3) * p.s * .55; const xx = Math.sin(k * 1.1 + p.fase * 2) * p.s * .6; k ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
      else if (p.tipo === 'brillo') { const t = (Math.sin(p.fase * 3) + 1) / 2; x.fillStyle = '#fff'; x.shadowColor = p.c; x.shadowBlur = 14; x.globalAlpha *= .4 + t * .6; x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? p.s * .18 : p.s * (.6 + t * .4); x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); }
      else { x.scale(1, giro); x.fillStyle = p.c; x.fillRect(-p.s, -p.s / 2, p.s * 2, p.s); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(-p.s, -p.s / 2, p.s * 2, p.s * .3); }
      x.restore();
    }
    if (P.length) requestAnimationFrame(bucle); else { vivo = false; x.clearRect(0, 0, W, H); }
  }
  function estrella(x, r) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); }
  function arranca() { if (!vivo) { vivo = true; requestAnimationFrame(bucle); } }
  const d = devicePixelRatio;
  return {
    confeti(n = 140) {
      /* dos cañones laterales + lluvia desde arriba, con cintas, estrellas, círculos y purpurina que giran en 3D */
      const tipos = ['papel', 'papel', 'cinta', 'estrella', 'circulo', 'brillo'];
      const lanza = (x, y, ang, fuerza, k) => {
        for (let i = 0; i < k; i++) {
          const a = ang + (Math.random() - .5) * .7, v = (fuerza * (.6 + Math.random() * .6)) * d;
          P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .32 * d, r: Math.random() * 6, vr: (Math.random() - .5) * .35, s: (5 + Math.random() * 7) * d, c: pick(COL), v: 2.6, d: .009 + Math.random() * .004, tipo: pick(tipos), fase: Math.random() * 6, vf: .08 + Math.random() * .15, ondula: Math.random() * 2 });
        }
      };
      const k = Math.round(n / 3);
      lanza(0, H * .75, -Math.PI / 3, 26, k); lanza(W, H * .75, -Math.PI * 2 / 3, 26, k);
      for (let i = 0; i < k; i++) P.push({ x: Math.random() * W, y: -20 * d, vx: (Math.random() - .5) * 3 * d, vy: (2 + Math.random() * 3) * d, g: .06 * d, r: Math.random() * 6, vr: (Math.random() - .5) * .2, s: (5 + Math.random() * 6) * d, c: pick(COL), v: 3, d: .008, tipo: pick(tipos), fase: Math.random() * 6, vf: .08 + Math.random() * .12, ondula: 1 + Math.random() * 2 });
      arranca();
    },
    chispas(elm, n = 26, col) {
      const r = elm.getBoundingClientRect(), cx = (r.left + r.width / 2) * d, cy = (r.top + r.height / 2) * d;
      for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = (3 + Math.random() * 9) * d;
        P.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .18 * d, r: 0, vr: .2, s: (2 + Math.random() * 5) * d, c: col || pick(COL), v: 1.2, d: .025, tipo: Math.random() < .4 ? 'estrella' : 'punto' }); }
      arranca();
    }
  };
})();

/* ---------------- estela del cohete en el mapa ---------------- */
const ESTELA = (() => {
  let iv = null;
  return {
    start(nave, M) {
      clearInterval(iv);
      iv = setInterval(() => {
        const r = nave.getBoundingClientRect(), m = M.getBoundingClientRect();
        for (let k = 0; k < 2; k++) {
          const cfg = window.estelaCfg ? window.estelaCfg() : null;
          const p = cfg && cfg.e ? el('span', 'humo humo-e', pick(cfg.e)) : el('span', 'humo'); p.style.left = (r.left - m.left + r.width * .25 + (Math.random() - .5) * 14) + 'px'; p.style.top = (r.top - m.top + r.height * .55 + (Math.random() - .5) * 14) + 'px';
          if (cfg && cfg.e) { if (k) continue; } else p.style.background = pick(cfg && cfg.c ? cfg.c : ['#17ff5f', '#ffd23f', '#ff8a3d', '#18e0ff', '#ffffff']);
          M.appendChild(p); setTimeout(() => p.remove(), 900);
        }
      }, 40);
    },
    stop() { clearInterval(iv); }
  };
})();

/* ---------------- FUEGO de los propulsores (dibujado por código) ----------------
   Cada .robot lleva un canvas detrás de la imagen. Los propulsores de cada pose
   están medidos sobre el PNG (fracciones de ancho/alto). */
const FUEGO = (() => {
  const ABAJO = { dir: Math.PI / 2, t: [[.344, .832, .062], [.424, .845, .07], [.511, .832, .062]] };
  const POSES = {
    'lucas-senala': { dir: Math.PI / 2, t: [[.274, .939, .078], [.375, .956, .088], [.485, .939, .078]] },
    'lucas-senala-capa': { dir: Math.PI / 2, t: [[.369, .943, .069], [.457, .959, .077], [.554, .943, .069]] },
    'lucas-gamer': { dir: Math.PI / 2, t: [[.244, .969, .091], [.362, .986, .103], [.49, .969, .091]] },
    'lucas-vuela': { dir: Math.PI * 1.04, t: [[.33, .775, .055], [.34, .86, .055]] },
    'chispa-senala': { dir: Math.PI / 2, t: [[.275, .925, .085], [.434, .97, .1], [.565, .905, .07]] },
    'chispa-vuela': { dir: Math.PI * 1.05, t: [[.15, .76, .06], [.18, .9, .06]] },
    'luna-vuela': { dir: Math.PI * .88, t: [[.375, .86, .045]] },
    'turbo-senala': { dir: Math.PI / 2, t: [[.281, .925, .07], [.375, .94, .075], [.469, .94, .07], [.572, .92, .07]] },
    'turbo-vuela': { dir: Math.PI * .85, t: [[.38, .83, .05], [.41, .93, .05]] },
    'max-senala': { dir: Math.PI / 2, t: [[.36, .95, .055], [.44, .965, .06], [.52, .955, .06], [.6, .93, .05]] },
    'max-vuela': { dir: Math.PI * .82, t: [[.31, .79, .045], [.35, .88, .045], [.40, .94, .04]] },
    'rayo-senala': { dir: Math.PI / 2, t: [[.29, .94, .075], [.41, .965, .085], [.55, .93, .07]] },
    'rayo-vuela': { dir: Math.PI * .92, t: [[.05, .81, .06], [.11, .94, .06]] },
    'aqua-senala': { dir: Math.PI / 2, t: [[.28, .955, .09], [.504, .955, .09]] },
    'aqua-vuela': { dir: Math.PI * 1.02, t: [[.17, .8, .12]] },   // una sola propulsión grande
    'luna-senala': { dir: Math.PI / 2, t: [[.335, .93, .07], [.45, .975, .08], [.59, .93, .07]] },
    'nova-senala': { dir: Math.PI / 2, t: [[.31, .885, .085], [.455, .97, .1], [.58, .885, .075]] },
    'nova-vuela': { dir: Math.PI * 1.12, t: [[.365, .76, .05], [.41, .9, .05]] }
  };
  const poseDe = k => POSES[k] || POSES['lucas-' + (k || '').split('-').slice(1).join('-')] || null;
  let ultimo = performance.now();
  function paso(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    if (!document.hidden) document.querySelectorAll('.robot').forEach(r => dibuja(r, dt, ahora));
    requestAnimationFrame(paso);
  }
  function dibuja(r, dt, t) {
    if (!r.offsetParent && getComputedStyle(r).position !== 'fixed') return;
    const cv = r.querySelector('canvas.fuego'); if (!cv) return;
    const P = poseDe(r.dataset.pose); const x = cv.getContext('2d');
    const w = r.offsetWidth, h = r.offsetHeight; if (!w || !h) return;
    const dpr = Math.min(2, devicePixelRatio || 1), CW = Math.round(w * 2 * dpr), CH = Math.round(h * 1.8 * dpr);
    if (cv.width !== CW || cv.height !== CH) { cv.width = CW; cv.height = CH; }
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w * 2, h * 1.8);
    if (!P) return;
    const fuerza = parseFloat(r.dataset.fuerza || '1');
    const ox = w * .5, oy = h * .2;
    const ps = r._ps || (r._ps = []);
    /* emitir partículas */
    P.t.forEach(([fx, fy, fw]) => {
      const nx = ox + fx * w, ny = oy + fy * h, nw = fw * w;
      const n = Math.ceil(2 * fuerza * (w / 120 + .6));
      for (let k = 0; k < n; k++) {
        const a = P.dir + (Math.random() - .5) * .35, v = (60 + Math.random() * 80) * (w / 140) * (0.7 + fuerza * .3);
        ps.push({ x: nx + (Math.random() - .5) * nw * .6, y: ny, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: nw * (.38 + Math.random() * .22), vida: 0, max: .22 + Math.random() * .2 * fuerza, chispa: Math.random() < .06 });
      }
    });
    /* núcleo de cada llama (forma de gota que parpadea) */
    x.globalCompositeOperation = 'lighter';
    P.t.forEach(([fx, fy, fw], i) => {
      const nx = ox + fx * w, ny = oy + fy * h, nw = fw * w;
      const largo = nw * (1.6 + .9 * fuerza) * (0.85 + .25 * Math.sin(t / 45 + i * 2) + .1 * Math.random());
      x.save(); x.translate(nx, ny); x.rotate(P.dir - Math.PI / 2);
      const g = x.createLinearGradient(0, 0, 0, largo);
      g.addColorStop(0, 'rgba(255,255,240,.95)'); g.addColorStop(.25, 'rgba(255,230,120,.85)'); g.addColorStop(.6, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,60,20,0)');
      x.fillStyle = g; x.beginPath();
      x.moveTo(-nw * .45, 0); x.quadraticCurveTo(-nw * .55, largo * .45, 0, largo); x.quadraticCurveTo(nw * .55, largo * .45, nw * .45, 0); x.closePath(); x.fill();
      x.restore();
    });
    /* partículas */
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.vida += dt; if (p.vida > p.max) { ps.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .97;
      const q = p.vida / p.max;
      if (p.chispa) {
        x.fillStyle = q < .5 ? 'rgba(200,255,210,' + (1 - q) + ')' : 'rgba(23,255,95,' + (1 - q) + ')';
        x.beginPath(); x.arc(p.x, p.y, Math.max(.6, p.r * .18), 0, 7); x.fill(); continue;
      }
      const rr = p.r * (1 - q * .55);
      const col = q < .25 ? [255, 245, 200] : q < .55 ? [255, 170, 50] : [255, 70, 30];
      const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
      g.addColorStop(0, `rgba(${col},${.55 * (1 - q)})`); g.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, rr, 0, 7); x.fill();
    }
    if (ps.length > 260) ps.splice(0, ps.length - 260);
    x.globalCompositeOperation = 'source-over';
  }
  requestAnimationFrame(paso);
  return { POSES };
})();

/* ---------------- sonido (Web Audio, sin MP3) ---------------- */
const SFX = (() => {
  let ac = null, musGain = null, musOn = false, musTimer = null;
  const ctx = () => { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); } if (ac.state === 'suspended') ac.resume(); return ac; };
  function nota(f, t0, dur, tipo = 'sine', vol = .18, dest) {
    if (document.hidden) return;
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, a.currentTime + t0);
    g.gain.setValueAtTime(0, a.currentTime + t0); g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + .015);
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + dur);
    o.connect(g); g.connect(dest || a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + .05);
  }
  function barrido(f1, f2, dur, tipo = 'sine', vol = .15) {
    if (document.hidden) return;
    const a = ctx(), o = a.createOscillator(), g = a.createGain(); o.type = tipo;
    o.frequency.setValueAtTime(f1, a.currentTime); o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur + .05);
  }
  const S = {
    clic() { nota(880, 0, .07, 'triangle', .12); },
    ok() { [523, 659, 784, 1046].forEach((f, i) => nota(f, i * .07, .25, 'triangle', .16)); nota(1568, .3, .3, 'sine', .07); },
    mal() { nota(220, 0, .18, 'square', .06); nota(185, .12, .25, 'square', .05); },
    pop() { barrido(900, 1800, .09, 'sine', .2); nota(1400, .02, .05, 'triangle', .08); },
    pieza() { nota(660, 0, .08, 'triangle', .13); nota(990, .05, .1, 'triangle', .09); },
    woosh() { barrido(200, 1200, .45, 'sawtooth', .04); },
    estrella(i = 0) { const b = [784, 988, 1175][i] || 1175; nota(b, 0, .35, 'triangle', .16); nota(b * 1.5, .08, .4, 'sine', .08); },
    moneda() { nota(988, 0, .08, 'square', .07); nota(1319, .08, .25, 'square', .07); },
    fanfarria() { [[523, 0], [659, .12], [784, .24], [1046, .36], [784, .52], [1046, .64]].forEach(([f, t]) => nota(f, t, .3, 'triangle', .15)); [262, 330, 392].forEach(f => nota(f, .64, .9, 'sine', .07)); },
    planeta() { [392, 523, 659, 784, 1046, 1319].forEach((f, i) => nota(f, i * .09, .4, 'triangle', .13)); },
    musica(on) {
      musOn = on; clearInterval(musTimer);
      if (!on) return;
      const a = ctx(); if (!musGain) { musGain = a.createGain(); musGain.gain.value = .05; musGain.connect(a.destination); }
      const acordes = [[262, 330, 392, 494], [220, 262, 330, 392], [175, 220, 262, 330], [196, 247, 294, 349]];
      let i = 0;
      const toca = () => { if (!musOn) return; const ac2 = acordes[i++ % 4]; ac2.forEach((f, k) => { nota(f, k * .38, 1.6, 'sine', .5, musGain); nota(f * 2, k * .38 + .19, .5, 'triangle', .18, musGain); }); };
      toca(); musTimer = setInterval(toca, 1600);
    },
    nfc() { nota(1500, 0, .08, 'sine', .14); nota(2000, .1, .12, 'sine', .14); },
    desbloquear() { ctx(); },
    sonando() { return musOn; },
    suspender() { musOn = false; clearInterval(musTimer); try { if (ac && ac.state === 'running') ac.suspend(); } catch (e) {} },
    reanudar() { try { if (ac && ac.state === 'suspended') ac.resume(); } catch (e) {} }
  };
  return S;
})();

/* ---------------- narrador (voz de Lucas) ---------------- */
/* letras sueltas → su nombre (si no, la voz dice «metro» por «m») */
const NOMBRE_LETRA = { b: 'be', c: 'ce', d: 'de', f: 'efe', g: 'ge', h: 'hache', j: 'jota', k: 'ka', l: 'ele', m: 'eme', n: 'ene', 'ñ': 'eñe', p: 'pe', q: 'cu', r: 'erre', s: 'ese', t: 'te', v: 'uve', w: 'uve doble', x: 'equis', z: 'zeta', ch: 'che', ll: 'elle', rr: 'erre doble' };
function nombresLetras(t) {
  return t.replace(/(^|[^\p{L}])(ch|ll|rr|[bcdfghjklmnñpqrstvwxz])(?=$|[^\p{L}])/giu, (m, a, l) => a + NOMBRE_LETRA[l.toLowerCase()]);
}
/* sílaba suelta con tilde para que la voz la lea en español («to» → «tó», no «tu») */
const TILDE = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
function sv(s) {
  if (/^[aeiouáéíóú]$/i.test(s)) return s.normalize('NFD').replace(/[\u0301]/g, '');   // vocal sola: «i», no «i con tilde»
  if (/^[aeiouáéíóú]/i.test(s)) return s.normalize('NFD').replace(/[\u0301]/g, '').normalize('NFC');   // empieza por vocal («il», «es», «un»): sin tilde, si no la voz dice «i con acento agudo»
  if (/[áéíóú]/.test(s)) return s;
  const m = s.match(/[aeiou](?!.*[aeiou])/);
  return m ? s.slice(0, m.index) + TILDE[m[0]] + s.slice(m.index + 1) : s;
}
const VOZ = (() => {
  const ss = window.speechSynthesis;
  let voces = [], voz = null, rate = 0.95;
  function puntua(v) {
    let p = 0;
    if (/es[-_]ES/i.test(v.lang)) p += 50; else if (/es[-_](MX|US|419)/i.test(v.lang)) p += 20;
    if (/natural|neural|online|premium|enhanced|mejorad/i.test(v.name)) p += 40;
    if (/google/i.test(v.name)) p += 25;
    if (/(elvira|alvaro|ximena|dalia|m[oó]nica|paulina|marisol|lucia|lucía|helena|laura)/i.test(v.name)) p += 10;
    if (/compact|eloquence|espeak|robot/i.test(v.name)) p -= 60;
    if (!v.localService) p += 5;
    return p;
  }
  function cargar() {
    if (!ss) return;
    voces = ss.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => puntua(b) - puntua(a));
    const pref = LS.get('voz', '');
    voz = voces.find(v => v.name === pref) || voces[0] || null;
  }
  if (ss) { cargar(); ss.onvoiceschanged = cargar; }
  let anim = null;
  function habla(on) { const l = $('#lucasNarra'); if (l) l.classList.toggle('habla', on); }
  /* limpia el texto para que suene natural */
  function prepara(t) {
    return nombresLetras(String(t)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️‍]/gu, '')   // emojis fuera
      .replace(/\.{3}/g, '…').replace(/\s+/g, ' ').trim())
      /* nunca nombrar las tildes: vocal acentuada suelta o al inicio de una sílaba corta («í», «íl», «ás») → sin tilde */
      .replace(/(^|[^\p{L}])([áéíóú])([b-df-hj-np-tv-zñ]{0,2})(?=$|[^\p{L}])/giu, (m, a1, v, c) => a1 + v.normalize('NFD').replace(/[\u0301]/g, '') + c);
  }
  /* trocea en frases para que respete puntos y pausas (y no se corte en Android) */
  function trozos(t) {
    const out = []; const re = /[^.!?…;:]+[.!?…;:]*["»)]?\s*/g; let m;
    while ((m = re.exec(t))) { if (m[0].trim()) out.push({ t: m[0].trim(), off: m.index }); }
    return out.length ? out : [{ t, off: 0 }];
  }
  let turno = 0;
  function decir(texto, opt = {}) {
    if (!ss || !texto || document.hidden) return Promise.resolve();
    if (!opt.cola) { ss.cancel(); turno++; }
    const mio = turno;
    const limpio = prepara(texto);
    const partes = trozos(limpio);
    const hablaUno = ({ t, off }) => new Promise(res => {
      if (mio !== turno) { res(); return; }
      const u = new SpeechSynthesisUtterance(t);
      u.lang = (voz && voz.lang) || 'es-ES'; if (voz) u.voice = voz;
      u.rate = Math.min(1.3, (opt.rate || 1) * rate); u.pitch = opt.pitch || 1; u.volume = 1;
      let hecho = false; const fin = () => { if (hecho) return; hecho = true; res(); };
      u.onstart = () => habla(true); u.onend = fin; u.onerror = fin;
      if (opt.onBoundary) u.onboundary = e => opt.onBoundary({ charIndex: e.charIndex + off, name: e.name });
      setTimeout(fin, 2500 + t.length * 160);   // seguridad si el navegador no avisa
      ss.speak(u);
    });
    return (async () => {
      for (const p of partes) { if (mio !== turno) break; await hablaUno(p); }
      if (mio === turno) habla(false);
    })();
  }
  return {
    actual: () => voz, decir, callar() { turno++; if (ss) ss.cancel(); habla(false); },
    setRate(r) { rate = r; }, voces: () => voces, setVoz(n) { LS.set('voz', n); cargar(); }, disponible: !!ss
  };
})();

/* ---------------- estado ---------------- */
let SES = LS.get('ses', null);        // {token, email, nombre}
let NINOS = LS.get('ninos', []);
let NINO = null;                       // niño activo
const filtroColor = h => h ? `hue-rotate(${h}deg) saturate(1.15)` : '';
const COLORES = [{ h: 0, c: '#17ff5f', n: 'Verde', pj: 'lucas', nom: 'Lucas' }, { h: 72, c: '#18b4ff', n: 'Azul', pj: 'max', nom: 'Max' }, { h: 130, c: '#8b5cff', n: 'Morado', pj: 'nova', nom: 'Nova' }, { h: 185, c: '#ff4fd8', n: 'Rosa', pj: 'luna', nom: 'Luna' },
  { h: 222, c: '#ff4d4d', n: 'Rojo', pj: 'rayo', nom: 'Rayo' }, { h: 252, c: '#ff9a2e', n: 'Naranja', pj: 'turbo', nom: 'Turbo' }, { h: 280, c: '#ffe02e', n: 'Amarillo', pj: 'chispa', nom: 'Chispa' }, { h: 40, c: '#00e5c7', n: 'Turquesa', pj: 'aqua', nom: 'Aqua' }];
/* Personajes con dibujo propio ya subido (img/personajes/<pj>-senala.png y <pj>-vuela.png).
   Mientras no esté, se usa Lucas con su color cambiado. */
const PERSONAJES_LISTOS = ['lucas', 'chispa', 'nova', 'luna', 'turbo', 'max', 'rayo', 'aqua'];   // 'pj' = las dos poses; 'pj-pose' = solo esa
const colorDe = h => COLORES.find(c => c.h === h) || COLORES[0];
let PJ_ON = !!LS.get('pjOn', false);   // personajes nuevos activados desde el admin (para todos)
function imgPj(h, pose) {
  const c = colorDe(h);
  if (PJ_ON && (PERSONAJES_LISTOS.includes(c.pj) || PERSONAJES_LISTOS.includes(c.pj + '-' + pose))) return { src: c.pj === 'lucas' ? 'img/lucas/' + pose + '.png' : 'img/personajes/' + c.pj + '-' + pose + '.png', filter: '', key: c.pj + '-' + pose };
  return { src: 'img/lucas/' + pose + '.png', filter: filtroColor(h), key: 'lucas-' + pose };
}
/* Robot con fuego animado en los propulsores */
function robotHTML(h, pose, cls = '', extra = '') {
  const im = imgPj(h, pose);
  return `<span class="robot ${cls}" data-pose="${im.key}" ${extra}><canvas class="fuego"></canvas><img src="${im.src}" alt="" style="filter:${im.filter}"></span>`;
}
function ponRobot(el0, h, pose) {
  const im = imgPj(h, pose); el0.dataset.pose = im.key;
  const img = el0.querySelector('img'); img.src = im.src; img.style.filter = im.filter;
}
function datosVacios() {
  return { plan: {}, chispas: 0, est: 0, peg: [], racha: { n: 0, ult: '' }, diaria: '', st: { ej: 0, ok: 0, ko: 0, seg: 0, dias: {} }, mem: { seen: {}, fail: {} },
    aj: { mayus: false, lenta: false, musica: true, todo: false } };
}
function datos() { if (!NINO.datos) NINO.datos = datosVacios(); const d = NINO.datos; const v = datosVacios(); for (const k in v) if (d[k] == null) d[k] = v[k]; for (const k in v.aj) if (d.aj[k] == null) d.aj[k] = v.aj[k]; return d; }
let tGuardar = null;
function guardarNino(inmediato) {
  LS.set('ninos', NINOS);
  clearTimeout(tGuardar);
  const enviar = () => api('guardarNino', { token: SES.token, nino: NINO }).then(r => { if (r.ok && r.nino && r.nino.id && !NINO.id) NINO.id = r.nino.id; LS.set('ninos', NINOS); });
  if (inmediato) return enviar();
  tGuardar = setTimeout(enviar, 1200);
}
function inicioEdad(e) { return e >= 8 ? 20 : e >= 7 ? 8 : e >= 6 ? 4 : e >= 5 ? 2 : 0; }
function desbloqueado(i) {
  const d = datos();
  if (i === 0 || d.aj.todo || ADMIN.todo() || i <= inicioEdad(NINO.edad)) return true;
  /* en orden: un planeta solo se abre si el anterior también está abierto y conquistado
     (evita saltos si se jugaron planetas con el modo de prueba del admin) */
  for (let k = Math.max(1, inicioEdad(NINO.edad) + 1); k <= i; k++) {
    const p = d.plan[k - 1]; if (!(p && (p.m >= 2 || p.e >= 3))) return false;
  }
  return true;
}
function nivelActual() { let i = 0; while (i < PLANETAS.length - 1 && desbloqueado(i + 1)) i++; return i; }
function aplicaAjustes() {
  const d = datos();
  document.body.classList.toggle('mayus', !!d.aj.mayus);
  VOZ.setRate(d.aj.lenta || NINO.edad <= 5 ? 0.85 : 0.95);
}

/* ---------------- arranque ---------------- */
window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  const rapida = Date.now() - (LS.get('recargaRapida', 0) || 0) < 20000; LS.del('recargaRapida');
  await esperar(rapida ? 250 : 1500);
  const vj = LS.get('viaje', null); LS.del('viaje'); if (vj) VIAJE = vj;
  if (SES && SES.token) {
    const r = await api('estado', { token: SES.token });
    if (r.ok) { aceptaSesion(r); return; }
    if (r.red && NINOS.length) { ir('perfiles'); toast('Sin conexión: tus datos se guardarán cuando vuelva.'); return; }
    SES = null; LS.del('ses');
  }
  ir('login');
});
document.addEventListener('pointerdown', () => SFX.desbloquear(), { once: true });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ir]'); if (b) { SFX.clic(); ir(b.dataset.ir); }
});

/* ---------------- LOGIN ---------------- */
function msgLogin(t, tipo) { const m = $('#lMsg'); m.textContent = t || ''; m.className = 'msg ' + (tipo || ''); }
function vistaLogin(v) {
  $$('.vista-login').forEach(f => f.classList.add('oculto'));
  $({ entrar: '#fEntrar', crear: '#fCrear', recuperar: '#fRecuperar' }[v]).classList.remove('oculto');
  $$('.tab').forEach(t => t.classList.toggle('activa', t.dataset.vista === v));
  msgLogin('');
}
$$('.tab').forEach(t => t.onclick = () => { SFX.clic(); vistaLogin(t.dataset.vista); });
$('#bOlvide').onclick = () => { vistaLogin('recuperar'); $('#rEmail').value = $('#lEmail').value; };
$$('[data-volver]').forEach(b => b.onclick = () => vistaLogin('entrar'));
$('#fEntrar').onsubmit = async e => {
  e.preventDefault(); msgLogin('Entrando…');
  const r = await api('login', { email: $('#lEmail').value.trim().toLowerCase(), pass: $('#lPass').value });
  if (!r.ok) return msgLogin(r.error, 'err');
  guardaCredencial($('#lEmail').value, $('#lPass').value);
  aceptaSesion(r);
};
$('#fCrear').onsubmit = async e => {
  e.preventDefault(); msgLogin('Creando cuenta…');
  const r = await api('registro', { nombre: $('#cNombre').value.trim(), email: $('#cEmail').value.trim().toLowerCase(), pass: $('#cPass').value });
  if (!r.ok) return msgLogin(r.error, 'err');
  guardaCredencial($('#cEmail').value, $('#cPass').value);
  aceptaSesion(r);
};
$('#bEnviarCodigo').onclick = async () => {
  const email = $('#rEmail').value.trim().toLowerCase(); if (!email) return msgLogin('Escribe tu correo', 'err');
  msgLogin('Enviando…');
  const r = await api('recuperar', { email });
  if (!r.ok) return msgLogin(r.error, 'err');
  $('#rPaso2').classList.remove('oculto'); msgLogin('Revisa tu correo (y la carpeta de spam).', 'ok');
};
$('#fRecuperar').onsubmit = async e => {
  e.preventDefault();
  const r = await api('nuevaClave', { email: $('#rEmail').value.trim().toLowerCase(), codigo: $('#rCodigo').value.trim(), pass: $('#rPass').value });
  if (!r.ok) return msgLogin(r.error, 'err');
  guardaCredencial($('#rEmail').value, $('#rPass').value);
  aceptaSesion(r);
};
function guardaCredencial(id, pass) {
  try { if (window.PasswordCredential) navigator.credentials.store(new PasswordCredential({ id, password: pass })); } catch (e) {}
}
let gIni = false;
function initGoogle() {
  if (gIni || !CFG.GOOGLE) return;
  if (!(window.google && google.accounts && google.accounts.id)) { setTimeout(initGoogle, 300); return; }
  gIni = true;
  google.accounts.id.initialize({ client_id: CFG.GOOGLE, callback: async res => {
    msgLogin('Entrando con Google…');
    const r = await api('google', { credential: res.credential });
    if (!r.ok) return msgLogin(r.error, 'err');
    aceptaSesion(r);
  } });
  google.accounts.id.renderButton($('#gBoton'), { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: Math.min(340, innerWidth - 80) });
}
ON_PANTALLA.pLogin = () => { initGoogle(); };
function aceptaSesion(r) {
  SES = { token: r.token, email: r.email, nombre: r.nombre, lic: r.lic || null }; LS.set('ses', SES);
  if (r.pjNuevos != null) { PJ_ON = !!r.pjNuevos; LS.set('pjOn', PJ_ON); }
  setTimeout(() => LICENCIA.comprobar(), 900);
  const locales = LS.get('ninos', []);
  NINOS = (r.ninos || []).map(n => {
    const loc = locales.find(l => l.id === n.id);
    if (loc && loc.datos && loc.datos._t > ((n.datos && n.datos._t) || 0)) return loc;   // el local es más nuevo
    return n;
  });
  LS.set('ninos', NINOS);
  const vuelve = LS.get('volverNino', null); LS.del('volverNino');
  const nv = vuelve && NINOS.find(n => n.id === vuelve);
  if (nv) { NINO = nv; datos(); ENG.setMem(datos().mem); aplicaAjustes(); ir('mapa'); return; }
  if (NINOS.length) ir('perfiles'); else editarNino(null);
  if (!NINOS.length) VOZ.decir('¡Hola! Soy Lucas. Vamos a crear el perfil del jugador.');
}
$('#bSalir').onclick = async () => {
  if (!await pregunta({ icono: '👋', titulo: '¿Cerrar sesión?', texto: 'El progreso está guardado. Podrás volver a entrar cuando quieras.', si: 'Cerrar sesión' })) return;
  SES = null; LS.del('ses'); LS.del('ninos'); NINOS = []; NINO = null;
  try { google.accounts.id.disableAutoSelect(); } catch (e) {}
  ir('login');
};

/* instalar / compartir */
let promptInstalar = null;
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const enApp = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
function pintaInstalar() {
  const ya = enApp();
  ['#bInstalar', '#bPInstalar'].forEach(q => { const b = $(q); if (b) b.classList.toggle('oculto', ya); });
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInstalar = e; LS.del('instalada'); pintaInstalar(); });
addEventListener('appinstalled', () => { promptInstalar = null; LS.set('instalada', true); pintaInstalar(); toast('¡Los números de Lucas instalada! Ya la tienes en tu pantalla de inicio 🚀', 3500); });
setTimeout(pintaInstalar, 500);
$('#bInstalar').onclick = async () => {
  SFX.clic();
  if (enApp()) { aviso({ icono: '✅', titulo: 'Ya está instalada', texto: 'Estás usando la app instalada. ¡Todo listo!' }); return; }
  if (promptInstalar) {   // Android / Chrome / PC: instala directamente
    promptInstalar.prompt();
    const r = await promptInstalar.userChoice.catch(() => null); promptInstalar = null;
    if (r && r.outcome === 'accepted') LS.set('instalada', true);
    return;
  }
  if (esIOS) {
    aviso({ icono: '📲', titulo: 'Instalar en iPhone', texto: '<ol class="ios-pasos"><li>Toca el botón <b>Compartir</b> ⬆️ de Safari.</li><li>Elige <b>«Añadir a pantalla de inicio»</b>.</li><li>Pulsa <b>Añadir</b>. ¡Listo!</li></ol>' });
    return;
  }
  /* Android sin aviso de instalación: casi siempre es porque ya está instalada */
  aviso({ icono: '✅', titulo: 'Ya la tienes instalada', texto: 'Los números de Lucas ya está en tu pantalla de inicio. Ábrela desde su icono 🤖 para usarla como app.' });
};
$('#bCompartir').onclick = async () => {
  const txt = '¡Mira esta app para aprender matemáticas con Lucas! 🚀🔢';
  /* Solo texto + enlace (sin adjuntar la imagen): así WhatsApp crea la tarjeta con la
     ilustración (og:image) y el enlace se puede pulsar. Si se adjunta la imagen, WhatsApp
     la publica como foto y el enlace del pie no funciona. */
  if (navigator.share) { try { await navigator.share({ title: 'Los números de Lucas', text: txt + ' ' + CFG.APP_URL }); } catch (e) {} return; }
  modal(`<h2>💬 Compartir</h2>
    <a class="btn btn-verde" target="_blank" href="https://wa.me/?text=${encodeURIComponent(txt + ' ' + CFG.APP_URL)}">WhatsApp</a>
    <a class="btn btn-azul" href="mailto:?subject=Los%20n%C3%BAmeros%20de%20Lucas&body=${encodeURIComponent(txt + ' ' + CFG.APP_URL)}">Correo</a>
    <button class="btn" onclick="navigator.clipboard.writeText('${CFG.APP_URL}');toast('Enlace copiado')">Copiar enlace</button>
    <button class="btn btn-mini" onclick="cerrarModal()">Cerrar</button>`);
};

/* modal */
let MODAL_FIJO = false;
function modal(html, fijo) { MODAL_FIJO = !!fijo; $('#modalCaja').innerHTML = html; $('#modal').classList.remove('oculto'); }
function cerrarModal() { if (MODAL_FIJO) return; $('#modal').classList.add('oculto'); }
/* Sustituye a confirm()/alert() del navegador por ventanas con el estilo de la app */
function pregunta({ icono = '🤖', titulo = '¿Seguro?', texto = '', si = 'Sí', no = 'Cancelar', peligro = false }) {
  return new Promise(res => {
    SFX.clic();
    modal(`<div class="dlg-icono">${icono}</div><h2>${titulo}</h2>${texto ? `<p class="dlg-txt">${texto}</p>` : ''}
      <div class="dlg-btns"><button class="btn" id="dlgNo">${no}</button><button class="btn ${peligro ? 'btn-rojo' : 'btn-verde'}" id="dlgSi">${si}</button></div>`);
    const fin = v => { cerrarModal(); res(v); };
    $('#dlgSi').onclick = () => { SFX.clic(); fin(true); };
    $('#dlgNo').onclick = () => { SFX.clic(); fin(false); };
    const obs = new MutationObserver(() => { if ($('#modal').classList.contains('oculto')) { obs.disconnect(); res(false); } });
    obs.observe($('#modal'), { attributes: true, attributeFilter: ['class'] });
  });
}
function aviso({ icono = '🤖', titulo = '', texto = '', ok = 'Entendido' }) {
  return new Promise(res => {
    modal(`<div class="dlg-icono">${icono}</div><h2>${titulo}</h2>${texto ? `<p class="dlg-txt">${texto}</p>` : ''}<button class="btn btn-verde" id="dlgOk">${ok}</button>`);
    $('#dlgOk').onclick = () => { SFX.clic(); cerrarModal(); res(); };
  });
}
window.alert = t => { aviso({ texto: esc(t) }); };
$('#modal').onclick = e => { if (e.target.id === 'modal' && !MODAL_FIJO) cerrarModal(); };

/* ---------------- PERFILES ---------------- */
ON_PANTALLA.pPerfiles = () => {
  const L = $('#listaNinos'); L.innerHTML = '';
  NINOS.forEach((n, i) => {
    NINO = n; const d = datos();
    const c = el('div', 'nino-card', `<button class="editar" title="Editar perfil">✏️</button>
      ${robotHTML(n.color, 'senala', 'card-robot')}
      <h3>${esc(n.nombre)}</h3><p>${n.edad} años · ⭐ ${d.est} · 🔥 ${d.racha.n}</p>`);
    c.onclick = e => {
      if (e.target.closest('.editar')) { e.stopPropagation(); SFX.clic(); editarNino(n); return; }
      SFX.clic(); entrarNino(n);
    };
    c.setAttribute('role', 'button'); c.tabIndex = 0;
    L.appendChild(c);
  });
  NINO = null;
  const nu = el('button', 'nino-card nuevo', '<div><b>+</b><br>Añadir jugador</div>');
  nu.onclick = () => { SFX.clic(); editarNino(null); };
  L.appendChild(nu);
};
let editando = null, edadSel = 6, colorSel = 0;
function editarNino(n) {
  editando = n; edadSel = n ? n.edad : 6; colorSel = n ? n.color || 0 : COLORES[Math.floor(Math.random() * COLORES.length)].h;
  $('#nNombre').value = n ? n.nombre : '';
  $('#bBorrarNino').classList.toggle('oculto', !n);
  $('#pNuevo h2').textContent = n ? 'Editar jugador' : 'Nuevo jugador';
  pintaNuevo(); ir('nuevo');
}
function pintaNuevo() {
  $$('#nEdades button').forEach(b => b.classList.toggle('sel', +b.dataset.e === edadSel));
  const C = $('#nColores'); C.innerHTML = '';
  COLORES.forEach(c => { const b = el('button'); b.style.background = c.c; b.style.color = c.c; b.title = c.n; b.classList.toggle('sel', c.h === colorSel);
    b.onclick = () => { SFX.pieza(); colorSel = c.h; pintaNuevo(); }; C.appendChild(b); });
  ponRobot($('#nPreview'), colorSel, 'senala'); $('#nPjNombre').textContent = PJ_ON ? colorDe(colorSel).nom : 'Lucas';
}
$$('#nEdades button').forEach(b => b.onclick = () => { SFX.clic(); edadSel = +b.dataset.e; pintaNuevo(); });
$('#bGuardarNino').onclick = async () => {
  const nombre = $('#nNombre').value.trim();
  if (!nombre) { toast('Escribe el nombre del jugador'); $('#nNombre').focus(); return; }
  const n = editando || { id: '', datos: datosVacios() };
  n.nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1); n.edad = edadSel; n.color = colorSel;
  if (!editando) NINOS.push(n);
  NINO = n; $('#bGuardarNino').disabled = true;
  const r = await guardarNino(true);
  $('#bGuardarNino').disabled = false;
  if (r && r.ok === false && !r.red) { toast(r.error); }
  if (editando) { NINO = null; ir('perfiles'); } else entrarNino(n);
};
$('#bBorrarNino').onclick = async () => {
  if (!editando || !await pregunta({ icono: '🗑️', titulo: `¿Borrar a ${esc(editando.nombre)}?`, texto: 'Se perderán <b>todos sus logros</b>: planetas conquistados, estrellas, pegatinas, chispas, racha de días y cuentos escuchados. Esto no se puede deshacer.', si: 'Eliminar perfil', no: 'No, mantener', peligro: true })) return;
  await api('borrarNino', { token: SES.token, id: editando.id });
  NINOS = NINOS.filter(x => x !== editando); LS.set('ninos', NINOS); ir('perfiles');
};
function entrarNino(n) {
  NINO = n; datos(); ENG.setMem(datos().mem); aplicaAjustes();
  ir('mapa');
  setTimeout(() => VOZ.decir(pick(NARRADOR.saludo).replace('{n}', n.nombre)), 400);
}

/* ---------------- MAPA ---------------- */
ON_PANTALLA.pMapa = () => {
  if (!NINO) { ir('perfiles'); return; }
  const d = datos();
  SFX.musica(!!d.aj.musica);
  $('#mNombre').textContent = NINO.nombre;
  { const im = imgPj(NINO.color, 'senala'); $('#mAvatar').src = im.src; $('#mAvatar').style.filter = im.filter; }
  $('#mRacha').textContent = d.racha.ult === hoy() || d.racha.ult === ayer() ? d.racha.n : 0;
  $('#mChispas').textContent = d.chispas;
  $('#mEstrellas').textContent = d.est;
  const hecha = d.diaria === hoy();
  $('#bDiaria').classList.toggle('hecha', hecha);
  $('#bDiariaTxt').textContent = 'MISIÓN DEL DÍA ' + (hecha ? '✅' : '🎁');
  { const hc = (d.cuentos || {})[hoy()]; $('#bCuentoSub').textContent = hc != null ? 'de hoy ✅' : 'de hoy'; $('#bCuento').classList.toggle('hecha', hc != null); }
  pintaMapa();
};
function pintaMapa() {
  const M = $('#mapa'), W = Math.min($('#mapaScroll').clientWidth, 560), PASO = 165, N = PLANETAS.length;
  const H = N * PASO + 160; M.style.height = H + 'px'; M.innerHTML = '';
  const pos = PLANETAS.map((p, i) => ({ x: W / 2 + Math.sin(i * 1.15) * (W * .3), y: H - 110 - i * PASO }));
  let path = `M${pos[0].x},${pos[0].y}`;
  for (let i = 1; i < N; i++) { const a = pos[i - 1], b = pos[i]; path += ` C${a.x},${a.y - PASO / 2} ${b.x},${b.y + PASO / 2} ${b.x},${b.y}`; }
  const act = nivelActual();
  const hastaY = pos[act].y;
  M.insertAdjacentHTML('beforeend', `<svg class="ruta" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="gr" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#17ff5f"/><stop offset="1" stop-color="#18e0ff"/></linearGradient>
    <clipPath id="cp"><rect x="0" y="${hastaY}" width="${W}" height="${H}"/></clipPath></defs>
    <path d="${path}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round"/>
    <path d="${path}" fill="none" stroke="url(#gr)" stroke-width="7" stroke-dasharray="2 14" stroke-linecap="round" clip-path="url(#cp)" style="filter:drop-shadow(0 0 6px #17ff5f)"/></svg>`);
  const d = datos();
  PLANETAS.forEach((p, i) => {
    const bloq = !desbloqueado(i), pl = d.plan[i] || { m: 0, e: 0 };
    const b = el('button', 'planeta' + (bloq ? ' bloq' : '') + (i === act ? ' actual' : ''));
    b.style.left = pos[i].x + 'px'; b.style.top = pos[i].y + 'px'; b.style.setProperty('--c', p.color);
    const larga = p.letra.length > 3;
    b.innerHTML = `<img class="pimg" src="img/planetas/planeta${String(i + 1).padStart(2, '0')}.png" alt="" loading="lazy" decoding="async">
      <span class="letra${larga ? ' larga' : ''}">${bloq ? '🔒' : p.letra}</span>
      ${pl.e ? `<span class="est">${[0, 1, 2].map(k => `<img src="img/estrella-${k < pl.e ? 'on' : 'off'}.png" alt="">`).join('')}</span>` : ''}
      <span class="nombre">${p.nombre}</span>`;
    b.onclick = async () => { SFX.clic(); if (bloq) { SFX.mal(); VOZ.decir('Ese planeta aún está bloqueado. ¡Completa el anterior para llegar!'); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 300); return; }
      if (MAPA.volando) return;
      if (MAPA.donde !== i) await volarA(i);
      abrePlaneta(i); };
    M.appendChild(b);
  });
  const nave = el('span', 'nave-mapa'); nave.innerHTML = robotHTML(NINO.color, 'vuela'); nave.firstChild.dataset.fuerza = '1.4';
  const SC = $('#mapaScroll');
  const centra = (y, suave) => { SC.style.scrollBehavior = suave ? 'smooth' : 'auto'; SC.scrollTop = Math.max(0, y - SC.clientHeight / 2); };
  if (MAPA.nino !== NINO || MAPA.donde == null || MAPA.donde > act || !desbloqueado(MAPA.donde)) MAPA.donde = act;
  MAPA.nino = NINO; MAPA.nave = nave; MAPA.pos = pos; MAPA.centra = centra; MAPA.volando = false; MAPA.M = M;
  if (VIAJE && VIAJE.h === act && VIAJE.d < act) {
    const d = VIAJE.d; VIAJE = null;
    const destino = M.querySelectorAll('.planeta')[act];
    destino.classList.add('bloq', 'por-abrir'); destino.querySelector('.letra').textContent = '🔒';
    nave.style.transition = 'none'; nave.style.left = pos[d].x + 'px'; nave.style.top = pos[d].y + 'px'; M.appendChild(nave);
    requestAnimationFrame(() => centra(pos[d].y, false));
    setTimeout(() => {
      const dx = pos[act].x - pos[d].x, dy = pos[act].y - pos[d].y;
      nave.classList.add('viajando'); nave.firstChild.dataset.fuerza = '2.6'; ponTf(nave, orienta(dx, dy) + ' scale(1.15)');
      nave.style.transition = 'left 2.2s cubic-bezier(.55,0,.35,1), top 2.2s cubic-bezier(.55,0,.35,1)';
      nave.style.left = pos[act].x + 'px'; nave.style.top = pos[act].y + 'px';
      SFX.woosh(); ESTELA.start(nave, M); centra(pos[act].y, true);
      VOZ.decir(pick(NARRADOR.viaje));
      setTimeout(() => {
        ESTELA.stop(); nave.classList.remove('viajando'); nave.firstChild.dataset.fuerza = '1.4'; nave.style.transform = dx < 0 ? 'scaleX(-1)' : ''; MAPA.donde = act;
        if (dx < 0) setTimeout(() => ponTf(nave, ''), 150);
        destino.classList.remove('bloq', 'por-abrir'); destino.classList.add('recien');
        destino.querySelector('.letra').textContent = PLANETAS[act].letra;
        SFX.planeta(); FX.chispas(destino, 50); FX.confeti(90);
        setTimeout(() => VOZ.decir('¡Bienvenido al ' + PLANETAS[act].nombre + '!'), 700);
      }, 2300);
    }, 900);
  } else {
    const dd = MAPA.donde; MAPA.mira = 1;
    nave.style.left = pos[dd].x + 'px'; nave.style.top = pos[dd].y + 'px'; M.appendChild(nave);
    requestAnimationFrame(() => centra(pos[dd].y, false));
  }
}
/* ---- vuelo del robot entre planetas: mira y se inclina hacia el destino ---- */
/* Cambio de lado "pro": en vez de voltearse en espejo de golpe, se desvanece con
   desenfoque y brillo, cambia de lado mientras es invisible y reaparece con rebote */
function ponTf(nave, tf) {
  const espejo = s => /scaleX\(-1\)/.test(s || '');
  if (espejo(nave.style.transform) === espejo(tf)) { nave.style.transform = tf; return; }
  const r = nave.firstChild;
  const cambia = () => { nave.style.transition = (nave.style.transition || '').replace(/(^|,\s*)transform\b.*$/, ''); nave.style.transform = tf; };
  if (!r || !r.animate) { cambia(); return; }
  if (nave._giro) { try { nave._giro.cancel(); } catch (e) {} }
  const oculto = { opacity: 0, filter: 'blur(9px) brightness(2.2)', transform: 'scale(.6) rotate(-12deg)' };
  const a1 = r.animate([{ opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'scale(1) rotate(0deg)' }, oculto], { duration: 170, easing: 'ease-in', fill: 'forwards' });
  nave._giro = a1;
  a1.onfinish = () => {
    cambia();
    const a2 = r.animate([oculto, { opacity: 1, filter: 'blur(0px) brightness(1.4)', transform: 'scale(1.12) rotate(4deg)', offset: .6 }, { opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'scale(1) rotate(0deg)' }], { duration: 340, easing: 'cubic-bezier(.2,.9,.3,1)' });
    a1.cancel(); nave._giro = a2;
    try { FX.chispas(nave, 10); } catch (e) {}
  };
}
var MAPA = { donde: null, mira: 1 };
function orienta(dx, dy) {
  const th = Math.atan2(dy, dx), lim = 40 * Math.PI / 180, cl = v => Math.max(-lim, Math.min(lim, v));
  if (dx >= 0) return `rotate(${cl(th)}rad)`;
  let ph = th - Math.PI; if (ph < -Math.PI) ph += 2 * Math.PI; if (ph > Math.PI) ph -= 2 * Math.PI;
  return `rotate(${cl(ph)}rad) scaleX(-1)`;
}
function volarA(i) {
  return new Promise(res => {
    const { nave, pos, centra, M } = MAPA; const d0 = MAPA.donde;
    if (!nave || d0 == null) { MAPA.donde = i; res(); return; }
    const a = pos[d0], b = pos[i], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
    const dur = Math.min(2600, Math.max(900, dist * 2.4));   // cerca: normal; lejos: más rápido (máx. ~2,6 s)
    MAPA.volando = true; MAPA.mira = dx < 0 ? -1 : 1;
    nave.style.transition = 'transform .35s ease-out'; ponTf(nave, orienta(dx, dy) + ' scale(1.1)');
    nave.classList.add('viajando'); nave.firstChild.dataset.fuerza = String(1.8 + Math.min(1.4, dist / 600));
    SFX.woosh(); ESTELA.start(nave, M);
    setTimeout(() => {
      nave.style.transition = `left ${dur}ms cubic-bezier(.5,0,.3,1), top ${dur}ms cubic-bezier(.5,0,.3,1), transform .35s ease-out`;
      nave.style.left = b.x + 'px'; nave.style.top = b.y + 'px'; centra(b.y, true);
    }, 180);
    setTimeout(() => {
      ESTELA.stop(); nave.classList.remove('viajando'); nave.firstChild.dataset.fuerza = '1.4';
      nave.style.transform = MAPA.mira < 0 ? 'scaleX(-1)' : '';
      /* al aterrizar se gira para mirar siempre hacia su planeta (queda a su izquierda) */
      if (MAPA.mira < 0) { setTimeout(() => { ponTf(nave, ''); MAPA.mira = 1; }, 150); }
      MAPA.donde = i; MAPA.volando = false; FX.chispas(M.querySelectorAll('.planeta')[i], 18); SFX.pop();
      setTimeout(res, 300);
    }, dur + 220);
  });
}
function abrePlaneta(i) {
  const p = PLANETAS[i], pl = datos().plan[i] || { m: 0, e: 0 };
  const esCuentos = i === 24, muestra = p.silabas.slice(0, 8);
  modal(`<div class="modal-planeta"><div class="planeta" style="--c:${p.color}"><img class="pimg" src="img/planetas/planeta${String(i + 1).padStart(2, '0')}.png" alt=""><span class="letra${p.letra.length > 3 ? ' larga' : ''}">${p.letra}</span></div></div>
    <h2>${p.nombre}</h2>
    <p style="margin:0;color:var(--txt2)">${esCuentos ? 'Desafíos de todos los planetas' : 'Aprendemos: ' + p.tema}</p>
    ${muestra.length ? `<div class="silabas-muestra">${muestra.map(s => `<button data-s="${s}">${s}</button>`).join('')}</div>` : ''}
    <div class="misiones-dots">${[0, 1, 2].map(k => `<span class="${pl.m > k ? 'on' : ''}"></span>`).join('')}</div>
    <small style="color:var(--txt2)">${pl.m >= 2 || pl.e >= 3 ? '¡Planeta conquistado! Puedes volver cuando quieras para practicar.' : 'Consigue 3 estrellas en una misión (o completa 2 misiones) para abrir el siguiente planeta'}</small>
    <button class="btn btn-verde btn-grande" id="bDespegar">🚀 ¡DESPEGAR!</button>
    <button class="btn btn-mini" onclick="cerrarModal()">Volver</button>`);
  $$('.silabas-muestra button').forEach(b => b.onclick = () => { SFX.pieza(); VOZ.decir(b.dataset.s.replace(/ \+ /g, ' más ').replace(/ − /g, ' menos ').replace(/ × /g, ' por ').replace('€', 'euros'), { rate: .85 }); });
  $('#bDespegar').onclick = () => { cerrarModal(); empezarMision({ lv: i }); };
  VOZ.decir(`${p.nombre}. ${esCuentos ? '¡Aquí están los desafíos de genio!' : 'Aquí aprendemos: ' + p.tema + '.'}`);
}
$('#bDiaria').onclick = () => {
  SFX.clic();
  if (datos().diaria === hoy()) { VOZ.decir('Ya has hecho la misión de hoy. ¡Mañana habrá otra! Puedes jugar en los planetas.'); toast('Misión del día completada ✅'); return; }
  empezarMision({ lv: nivelActual(), repaso: true, diaria: true });
};

/* ---------------- MISIÓN ---------------- */
let MIS = null;
let VIAJE = null;   // animación del cohete al desbloquear un planeta
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function empezarMision({ lv, repaso = false, diaria = false }) {
  if (LICENCIA.comprobar()) return;
  const n = diaria ? 10 : CFG.MISION;
  const lista = ENG.mision({ lv, edad: NINO.edad, n, repaso, maxLv: nivelActual() });
  MIS = { lv, repaso, diaria, lista, i: 0, aciertos: 0, fallosTot: 0, chispas: 0, t0: Date.now(), racha: 0 };
  SFX.musica(false); SFX.woosh(); ESTRELLAS.turbo(3); setTimeout(() => ESTRELLAS.turbo(.25), 900);
  $('#jChispas').textContent = 0;
  ir('juego');
  siguienteEjercicio();
}
$('#bCerrarJuego').onclick = async () => {
  VOZ.callar();
  if (!await pregunta({ icono: '🚀', titulo: '¿Salir de la misión?', texto: 'Si sales ahora, esta misión no contará. ¡Te queda poco!', si: 'Salir', no: 'Seguir jugando' })) return;
  limpiaEjercicio(); ir('mapa');
};
let limpiezas = [];
function limpiaEjercicio() { limpiezas.forEach(f => { try { f(); } catch (e) {} }); limpiezas = []; VOZ.callar(); }
function progreso() {
  const t = MIS.lista.length;
  $('#jProg').style.width = (MIS.i / t * 100) + '%';
  $('#jProgTxt').textContent = Math.min(MIS.i + 1, t) + '/' + t;
}
let EJ = null;
function siguienteEjercicio() {
  limpiaEjercicio();
  progreso();
  if (MIS.i >= MIS.lista.length) { finMision(); return; }
  EJ = MIS.lista[MIS.i]; EJ.errores = 0; EJ.resuelto = false;
  const E = $('#escenario'); E.innerHTML = ''; E.scrollTop = 0;
  RENDER[EJ.tipo](EJ, E);
  ajustaTextos(E); setTimeout(() => ajustaTextos(E), 350);
}
function burbuja(txt) { $('#burbujaTxt').textContent = txt; }
let ultimaFrase = '';
function narra(txt, opt) { ultimaFrase = txt; burbuja(txt); return VOZ.decir(txt, opt); }
$('#bRepetir').onclick = () => { SFX.clic(); (EJ && EJ.repetir) ? EJ.repetir() : VOZ.decir(ultimaFrase); };
function instr(tipo, x) { return pick(NARRADOR.ins[tipo]).replace('{x}', x || ''); }
function lucasAnim(cls) { const l = $('#lucasNarra'); l.classList.remove('salta', 'triste'); void l.offsetWidth; l.classList.add(cls); setTimeout(() => l.classList.remove(cls), 700); }

/* acierto final del ejercicio */
async function acierto(elm, frase) {
  if (EJ.resuelto) return; EJ.resuelto = true;
  ENG.marca(EJ.id, EJ.errores === 0);
  const d = datos(); d.st.ej++; if (EJ.errores === 0) { d.st.ok++; MIS.aciertos++; MIS.racha++; } else MIS.racha = 0;
  const gana = EJ.errores === 0 ? 10 : 5; MIS.chispas += gana; $('#jChispas').textContent = MIS.chispas;
  SFX.ok(); if (elm) FX.chispas(elm, 34); lucasAnim('salta');
  if (MIS.racha > 0 && MIS.racha % 3 === 0) { lucasCruza(); FX.confeti(70); }
  const txt = (frase ? frase + ' ' : '') + pick(NARRADOR.bien);
  burbuja(txt);
  await Promise.race([VOZ.decir(txt), esperar(2600)]);
  await esperar(250);
  if (pantallaActual !== 'pJuego' || MIS.lista[MIS.i] !== EJ) return;
  MIS.i++; siguienteEjercicio();
}
/* fallo (el ejercicio sigue) */
function fallo(elm) {
  EJ.errores++; MIS.fallosTot++; datos().st.ko++;
  SFX.mal(); lucasAnim('triste');
  if (elm) { elm.classList.remove('mal'); void elm.offsetWidth; elm.classList.add('mal'); }
  if (navigator.vibrate) navigator.vibrate(80);
  if (EJ.errores === 2 && Math.random() < .5) lucasCaido();
  const t = pick(NARRADOR.mal); burbuja(t);
  return VOZ.decir(t);
}
function lucasCruza() { const i = el('div', 'lucas-cruza', robotHTML(NINO.color, 'vuela')); i.firstChild.dataset.fuerza = '2'; document.body.appendChild(i); SFX.woosh(); setTimeout(() => i.remove(), 1400); }
function lucasCaido() { const i = el('img', 'lucas-caido'); i.src = 'img/lucas/caido.png'; document.body.appendChild(i); setTimeout(() => i.remove(), 1500); }
const silabeo = p => p.s.map(sv).join('... ') + '... ' + p.w;
function pic(p) {
  const slug = ENG.quitaTildes(p.w.toLowerCase()).replace('ñ', 'n');
  if (IMAGENES.includes(slug)) return `<img src="img/palabras/${slug}.png" alt="">`;
  return p.e;
}

/* Reduce la letra de lo que no cabe (p. ej. «todoterreno» en un móvil estrecho) */
function ajustaTextos(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll('.leer, .opt-txt, .pieza, .hueco').forEach(e => {
    e.style.fontSize = '';
    const caja = e.classList.contains('leer') ? (e.closest('.tarjeta') || e.parentElement) : e;
    let fs = parseFloat(getComputedStyle(e).fontSize), n = 0;
    const max = () => e.classList.contains('leer') ? Math.min(caja.clientWidth, raiz.clientWidth - 24) : e.clientWidth;
    while (n++ < 30 && fs > 12 && e.scrollWidth > max() + 1) { fs *= 0.92; e.style.fontSize = fs + 'px'; }
  });
}
addEventListener('resize', () => { if (pantallaActual === 'pJuego') ajustaTextos($('#escenario')); });
/* ---------------- RENDERIZADORES (matemáticas) ---------------- */
const RENDER = {};
function opciones(lista, cls, contenido, esCorrecta, alAcertar) {
  const O = el('div', 'opciones ' + (cls || ''));
  lista.forEach(o => {
    const b = el('button', 'opt', contenido(o));
    b.onclick = () => {
      if (EJ.resuelto || b.classList.contains('apagada')) return;
      if (esCorrecta(o)) { b.classList.add('ok'); $$('.opt').forEach(x => { if (x !== b) x.classList.add('apagada'); }); alAcertar ? alAcertar(b, o) : acierto(b); }
      else { fallo(b); b.classList.add('apagada'); if (EJ.errores >= 2 && EJ.ayuda) EJ.ayuda(); }
    };
    O.appendChild(b);
  });
  return O;
}
const nOpt = o => `<span class="opt-txt opt-num">${o}</span>`;
const clsN = l => l.length === 3 ? 'tres' : '';
/* objetos para contar, colocados en filas de 5 (como en el cole) */
function objsHTML(n, e, tachados = 0, cls = '') {
  let h = `<div class="objs ${cls}">`;
  for (let i = 0; i < n; i++) h += `<span class="obj${i >= n - tachados ? ' tachado' : ''}" style="--r:${(Math.random() * 16 - 8).toFixed(1)}deg;animation-delay:${i * 40}ms">${e}</span>`;
  return h + '</div>';
}
/* cuenta en voz alta iluminando cada objeto */
async function cuentaEnVoz(cont, hasta) {
  const os = [...cont.querySelectorAll('.obj:not(.tachado)')].slice(0, hasta || 999);
  for (let i = 0; i < os.length; i++) { if (EJ.resuelto) return; os[i].classList.add('contado'); SFX.pieza(); VOZ.decir(String(i + 1), { rate: 1.1 }); await esperar(620); }
}
/* formas geométricas en SVG */
function formaSVG(k, c = '#18e0ff', s = 90) {
  const P = {
    circulo: '<circle cx="50" cy="50" r="40"/>', ovalo: '<ellipse cx="50" cy="50" rx="44" ry="28"/>',
    cuadrado: '<rect x="12" y="12" width="76" height="76" rx="4"/>', rectangulo: '<rect x="5" y="25" width="90" height="50" rx="4"/>',
    triangulo: '<polygon points="50,8 93,88 7,88"/>', rombo: '<polygon points="50,5 90,50 50,95 10,50"/>',
    estrella: '<polygon points="50,5 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38"/>',
    pentagono: '<polygon points="50,6 94,38 77,90 23,90 6,38"/>', hexagono: '<polygon points="27,8 73,8 96,50 73,92 27,92 4,50"/>'
  };
  return `<svg class="forma" viewBox="0 0 100 100" width="${s}" height="${s}" style="--c:${c}"><g fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="5" stroke-linejoin="round">${P[k]}</g></svg>`;
}
/* reloj de agujas */
function relojSVG(h, m) {
  const ah = ((h % 12) + m / 60) * 30, am = m * 6;
  let marcas = '';
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; marcas += `<text x="${50 + Math.sin(a) * 37}" y="${50 - Math.cos(a) * 37 + 4.5}" text-anchor="middle" font-size="12" font-weight="700" fill="#0b1633">${i}</text>`; }
  for (let i = 0; i < 60; i++) { if (i % 5 === 0) continue; const a = i * 6 * Math.PI / 180; marcas += `<line x1="${50 + Math.sin(a) * 45}" y1="${50 - Math.cos(a) * 45}" x2="${50 + Math.sin(a) * 43}" y2="${50 - Math.cos(a) * 43}" stroke="#7a8aa5" stroke-width=".8"/>`; }
  return `<svg class="reloj" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f2fbff" stroke="#18e0ff" stroke-width="3"/>${marcas}
    <line x1="50" y1="50" x2="50" y2="26" stroke="#0b1633" stroke-width="5" stroke-linecap="round" transform="rotate(${ah} 50 50)"/>
    <line x1="50" y1="50" x2="50" y2="13" stroke="#ff4d5e" stroke-width="3" stroke-linecap="round" transform="rotate(${am} 50 50)"/>
    <circle cx="50" cy="50" r="3.5" fill="#0b1633"/></svg>`;
}
/* monedas y billetes */
function dineroHTML(piezas) {
  return `<div class="cartera">${piezas.map((v, i) => v <= 2 ? `<span class="moneda m${v}" style="animation-delay:${i * 80}ms"><b>${v}</b><small>€</small></span>` : `<span class="billete b${v}" style="animation-delay:${i * 80}ms"><b>${v}</b><small>EURO</small></span>`).join('')}</div>`;
}
/* bloques de decenas (barras de 10) y unidades */
function bloquesHTML(d, u) {
  let h = '<div class="bloques">';
  for (let i = 0; i < d; i++) h += `<span class="barra10">${'<i></i>'.repeat(10)}</span>`;
  h += '<span class="unidades">'; for (let i = 0; i < u; i++) h += '<i></i>'; h += '</span>';
  return h + '</div>';
}
const opTxt = (a, o, b) => ENG.txtOp(a, o, b);
const opVoz = (a, o, b) => ENG.vozOp(a, o, b);
function pistaOp(ej) {
  if (ej.o === '+') return `Empieza en el ${ej.a} y cuenta ${ej.b} más con los dedos.`;
  if (ej.o === '-') return `Empieza en el ${ej.a} y cuenta ${ej.b} hacia atrás.`;
  if (ej.o === '/') return `¿Qué número por ${ej.b} da ${ej.a}? Piensa en la tabla del ${ej.b}.`;
  return `${ej.a} por ${ej.b} es sumar ${ej.b} veces el ${ej.a}.`;
}

RENDER.cuenta = (ej, E) => {
  const C = el('div', 'tarjeta tarjeta-objs', objsHTML(ej.n, ej.ob[0])); E.appendChild(C);
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.n, b => acierto(b, `¡Hay ${ej.n}!`)));
  ej.ayuda = () => { narra('Vamos a contar juntos.'); cuentaEnVoz(C); };
  narra(instr('cuenta'));
};
RENDER.escucha = (ej, E) => {
  const big = el('button', 'btn btn-azul', '🔊 Escuchar otra vez'); big.style.fontSize = '20px';
  const decirX = () => VOZ.decir(String(ej.x), { rate: .85 });
  big.onclick = () => { SFX.clic(); decirX(); };
  E.appendChild(el('div', 'leer m', '👂')); E.appendChild(big);
  E.appendChild(opciones(ej.opts, ej.opts.length === 3 ? 'tres' : '', nOpt, o => o === ej.x));
  ej.repetir = decirX;
  narra(instr('escucha')).then(() => decirX());
};
RENDER.globos = (ej, E) => {
  let cuenta = 0; const META = 4;
  const marc = el('div', 'marcador-globos', `Atrapa el <b class="leer" style="font-size:32px">${ej.x}</b> · <span id="gCont">0</span>/${META}`);
  const Z = el('div', 'zona-globos'); E.appendChild(marc); E.appendChild(Z);
  const BURBUJAS = [{ n: 'verde', c: '#17ff5f' }, { n: 'azul', c: '#18e0ff' }, { n: 'rosa', c: '#ff4fa3' }, { n: 'amarillo', c: '#ffd23f' }, { n: 'morado', c: '#8b5cff' }, { n: 'naranja', c: '#ff8a3d' }];
  let n = 0;
  const lanza = () => {
    if (EJ !== ej || ej.resuelto) return;
    const esX = Math.random() < .42 || n % 4 === 3; n++;
    const s = esX ? ej.x : pick(ej.otras);
    const b = el('button', 'burbuja-sil', String(s));
    const w = Z.clientWidth; b.style.left = (Math.random() * (w - 100)) + 'px'; { const bc = pick(BURBUJAS); b.style.setProperty('--c', bc.c); b.style.backgroundImage = `url(img/burbujas/${bc.n}.png)`; b.classList.add('img'); }
    const dur = 5200 + Math.random() * 2500;
    Z.appendChild(b);
    const an = b.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${Z.clientHeight + 240}px) translateX(${(Math.random() - .5) * 60}px)` }], { duration: dur, easing: 'linear' });
    an.onfinish = () => b.remove();
    b.onpointerdown = () => {
      if (ej.resuelto) return;
      an.pause(); b.classList.add('pop'); setTimeout(() => b.remove(), 300);
      if (s === ej.x) { SFX.pop(); FX.chispas(b, 16); cuenta++; $('#gCont').textContent = cuenta; VOZ.decir(String(s), { rate: .95 });
        if (cuenta >= META) { clearInterval(iv); acierto(marc, '¡Los has atrapado todos!'); } }
      else { fallo(null); }
    };
  };
  const iv = setInterval(lanza, 850); lanza();
  limpiezas.push(() => clearInterval(iv));
  ej.repetir = () => VOZ.decir(String(ej.x));
  { const plt = pick(NARRADOR.ins.globos); burbuja(plt.replace('{x}', ej.x)); VOZ.decir(plt.replace('{x}', ej.x)); }
};
RENDER.traza = (ej, E) => {
  const W = el('div', 'traza-wrap'); const guia = el('canvas'), dib = el('canvas'); W.appendChild(guia); W.appendChild(dib);
  E.appendChild(W);
  const fila = el('div', 'fila-btns');
  const bBorra = el('button', 'btn', '🧽 Borrar'), bListo = el('button', 'btn btn-verde', '✅ ¡Listo!');
  fila.appendChild(bBorra); fila.appendChild(bListo); E.appendChild(fila);
  let mask = null, S = 0, lw = 0;
  const letra = ej.x;
  const prepara = async () => {
    try { await Promise.all([document.fonts.load('700 200px Andika', '0123456789'), document.fonts.load('700 200px NumCole', '4')]); } catch (e) {}
    const r = W.getBoundingClientRect(); S = Math.round(r.width * devicePixelRatio);
    [guia, dib].forEach(c => { c.width = c.height = S; });
    const g = guia.getContext('2d');
    const fs = S * (letra.length > 1 ? .6 : .8);
    g.font = `700 ${fs}px NumCole, Andika, Fredoka, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,.13)'; g.fillText(letra, S / 2, S * .54);
    g.setLineDash([S * .02, S * .025]); g.lineWidth = S * .012; g.strokeStyle = 'rgba(23,255,95,.85)'; g.strokeText(letra, S / 2, S * .54);
    const off = document.createElement('canvas'); off.width = off.height = S; const o = off.getContext('2d');
    o.font = g.font; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText(letra, S / 2, S * .54);
    mask = o.getImageData(0, 0, S, S).data;
    lw = S * .075;
  };
  prepara();
  const c = dib.getContext('2d'); let pint = false, last = null;
  const p = e => { const r = dib.getBoundingClientRect(); return [(e.clientX - r.left) * devicePixelRatio, (e.clientY - r.top) * devicePixelRatio]; };
  dib.onpointerdown = e => { pint = true; last = p(e); dib.setPointerCapture(e.pointerId); trazo(last, last); };
  dib.onpointermove = e => { if (!pint) return; const q = p(e); trazo(last, q); last = q; };
  dib.onpointerup = dib.onpointercancel = () => { pint = false; };
  function trazo(a, b) {
    c.strokeStyle = '#ffd23f'; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = '#ffd23f'; c.shadowBlur = 12;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  }
  bBorra.onclick = () => { SFX.clic(); c.clearRect(0, 0, S, S); };
  bListo.onclick = () => {
    if (ej.resuelto || !mask) return;
    const d = c.getImageData(0, 0, S, S).data; let enL = 0, cub = 0, fuera = 0, tot = 0; const paso = 4 * 3;
    for (let i = 3; i < d.length; i += paso) { const m = mask[i] > 100, u = d[i] > 60; if (m) { enL++; if (u) cub++; } else if (u) fuera++; if (u) tot++; }
    const cobertura = cub / Math.max(1, enL), derrame = fuera / Math.max(1, tot);
    if (cobertura > .5 && derrame < .62) acierto(W, '¡Qué bien escribes el ' + ej.x + '!');
    else { fallo(W); narra(cobertura <= .5 ? 'Repasa todo el número, por encima de la línea verde.' : 'Intenta no salirte mucho del número.'); c.clearRect(0, 0, S, S); }
  };
  ej.repetir = () => VOZ.decir('el número ' + ej.x);
  narra(instr('traza', ej.x));
};
RENDER.ordena = (ej, E) => {
  const orden = ej.nums.slice().sort((a, b) => ej.asc ? a - b : b - a);
  E.appendChild(el('div', 'leer m', ej.asc ? '🔢 ⬆️' : '🔢 ⬇️'));
  const F = el('div', 'huecos fila-orden'); orden.forEach(() => F.appendChild(el('div', 'hueco'))); E.appendChild(F);
  const P = el('div', 'piezas'); E.appendChild(P);
  let pos = 0;
  ej.nums.forEach(n => {
    const b = el('button', 'pieza pieza-num', String(n)); P.appendChild(b);
    b.onclick = () => {
      if (ej.resuelto || b.classList.contains('usada')) return;
      if (n === orden[pos]) { SFX.pieza(); b.classList.add('usada'); const h = F.children[pos]; h.textContent = n; h.classList.add('lleno'); VOZ.decir(String(n), { rate: 1 }); pos++; if (pos === orden.length) acierto(F, '¡Bien ordenados!'); }
      else { fallo(b); if (EJ.errores >= 2) ej.ayuda(); }
    };
  });
  ej.ayuda = () => narra(pick(NARRADOR.pista) + (ej.asc ? ' busca el más pequeño: el ' + orden[pos] : ' busca el más grande: el ' + orden[pos]) + '.');
  narra(instr(ej.asc ? 'ordena' : 'ordenaD'));
};
RENDER.vecinos = (ej, E) => {
  const H = el('div', 'huecos fila-vecinos'); ej.fila.forEach((v, i) => H.appendChild(el('div', 'hueco ' + (i === ej.i ? 'falta' : 'lleno'), i === ej.i ? '?' : String(v)))); E.appendChild(H);
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.fila[ej.i], b => { const h = H.children[ej.i]; h.textContent = ej.fila[ej.i]; h.className = 'hueco lleno'; acierto(b, ej.fila.join(', ') + '.'); }));
  ej.ayuda = () => narra(pick(NARRADOR.pista) + ' ' + (ej.i === 2 ? `después del ${ej.fila[1]} va…` : ej.i === 0 ? `antes del ${ej.fila[1]} va…` : `entre el ${ej.fila[0]} y el ${ej.fila[2]} va…`));
  narra(instr('vecinos'));
};
RENDER.compara = (ej, E) => {
  if (ej.modo === 'g') {
    const O = el('div', 'opciones dos-grupos');
    [ej.a, ej.b].forEach(n => {
      const b = el('button', 'opt opt-grupo', objsHTML(n, ej.ob[0], 0, 'mini'));
      b.onclick = () => {
        if (ej.resuelto || b.classList.contains('apagada')) return;
        const ok = ej.mas ? n === Math.max(ej.a, ej.b) : n === Math.min(ej.a, ej.b);
        if (ok) { b.classList.add('ok'); acierto(b, `${ej.mas ? 'Aquí hay más' : 'Aquí hay menos'}: ${n}.`); } else { fallo(b); b.classList.add('apagada'); }
      };
      O.appendChild(b);
    });
    E.appendChild(O);
    narra(instr(ej.mas ? 'comparaG' : 'comparaM'));
    return;
  }
  const s = ej.a > ej.b ? '>' : ej.a < ej.b ? '<' : '=';
  const nom = { '>': 'mayor que', '<': 'menor que', '=': 'igual a' };
  const T = el('div', 'tarjeta', `<div class="leer xl op-grande">${ej.a} <span class="signo-hueco">?</span> ${ej.b}</div>`); E.appendChild(T);
  E.appendChild(opciones(['<', '=', '>'], 'tres', o => `<span class="opt-txt opt-num">${o}</span>`, o => o === s,
    b => { T.querySelector('.signo-hueco').textContent = s; T.querySelector('.signo-hueco').classList.add('ok'); acierto(b, `${ej.a} es ${nom[s]} ${ej.b}.`); }));
  ej.ayuda = () => narra('Recuerda: la boca del cocodrilo se abre hacia el número más grande. 🐊');
  narra(instr('comparaS'));
};
RENDER.formas = (ej, E) => {
  if (ej.modo === 'lados') {
    E.appendChild(el('div', 'dibujo dibujo-forma', formaSVG(ej.f.k, '#ffd23f', 170)));
    E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.f.l, b => acierto(b, `El ${ej.f.n} tiene ${ej.f.l} lados.`)));
    ej.ayuda = () => narra('Cuenta cada línea recta del borde con el dedo.');
    narra(instr('lados'));
    return;
  }
  E.appendChild(el('div', 'leer l', ej.f.n));
  E.appendChild(opciones(ej.opts, ej.opts.length === 3 ? 'tres' : '', o => formaSVG(o.k, ej.colores[ej.opts.indexOf(o) % 6], 84), o => o === ej.f, b => acierto(b, `¡Es el ${ej.f.n}!`)));
  ej.repetir = () => VOZ.decir(instr('formas', ej.f.n));
  narra(instr('formas', ej.f.n));
};
RENDER.serie = (ej, E) => {
  const S = el('div', 'serie' + (ej.emoji ? ' emoji' : ''), ej.items.map(x => `<span>${x}</span>`).join('') + '<span class="falta">?</span>'); E.appendChild(S);
  E.appendChild(opciones(ej.opts, clsN(ej.opts), o => ej.emoji ? `<span class="opt-emoji">${o}</span>` : nOpt(o), o => o === ej.ok,
    b => { const f = S.querySelector('.falta'); f.textContent = ej.ok; f.classList.add('ok'); acierto(b); }));
  ej.ayuda = () => { if (ej.emoji) narra('Fíjate en qué se repite.'); else { const d = ej.items[1] - ej.items[0]; narra(`${pick(NARRADOR.pista)} cada vez ${d > 0 ? 'suma' : 'resta'} ${Math.abs(d)}.`); } };
  narra(instr('serie'));
};
RENDER.vis = (ej, E) => {
  const e = ej.ob[0];
  const T = el('div', 'tarjeta tarjeta-objs');
  T.innerHTML = ej.o === '+' ? `<div class="vis-suma">${objsHTML(ej.a, e, 0, 'mini')}<b class="vis-op">+</b>${objsHTML(ej.b, e, 0, 'mini')}</div>`
    : objsHTML(ej.a, e, ej.b);
  E.appendChild(T);
  E.appendChild(el('div', 'leer m op-media', `${opTxt(ej.a, ej.o, ej.b)} = ?`));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => acierto(b, `${opVoz(ej.a, ej.o, ej.b)} son ${ej.r}.`)));
  ej.ayuda = () => { narra(ej.o === '+' ? 'Cuenta todos juntos.' : 'Cuenta solo los que no están tachados.'); cuentaEnVoz(T); };
  narra(instr(ej.o === '+' ? 'sumaVis' : 'restaVis'));
};
RENDER.op = (ej, E) => {
  E.appendChild(el('div', 'tarjeta', `<div class="leer xl op-grande">${ej.a} <span class="${ej.mixta ? 'signo-brilla' : ''}">${ENG.simb(ej.o)}</span> ${ej.b} = <span class="signo-hueco">?</span></div>`));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => { $('.signo-hueco').textContent = ej.r; $('.signo-hueco').classList.add('ok'); acierto(b, `${opVoz(ej.a, ej.o, ej.b)}, ${ej.r}.`); }));
  ej.ayuda = () => narra(pick(NARRADOR.pista) + ' ' + pistaOp(ej));
  ej.repetir = () => VOZ.decir(opVoz(ej.a, ej.o, ej.b) + '. ¿Cuánto es?');
  narra(instr(ej.mixta ? 'mixta' : 'op')).then(() => VOZ.decir(opVoz(ej.a, ej.o, ej.b), { cola: true }));
};
RENDER.mixta = RENDER.op;
RENDER.hueco = (ej, E) => {
  const x = ej.cual ? ej.b : ej.a;
  E.appendChild(el('div', 'tarjeta', `<div class="leer xl op-grande">${ej.cual ? ej.a : '<span class="signo-hueco">?</span>'} ${ENG.simb(ej.o)} ${ej.cual ? '<span class="signo-hueco">?</span>' : ej.b} = ${ej.r}</div>`));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === x, b => { $('.signo-hueco').textContent = x; $('.signo-hueco').classList.add('ok'); acierto(b, `${opVoz(ej.a, ej.o, ej.b)}, ${ej.r}.`); }));
  ej.ayuda = () => narra(pick(NARRADOR.pista) + (ej.o === '+' ? ` ¿cuánto le falta al ${ej.cual ? ej.a : ej.b} para llegar a ${ej.r}?` : ej.o === '-' ? (ej.cual ? ` del ${ej.a} al ${ej.r}, ¿cuántos quitamos?` : ` ${ej.r} más ${ej.b}.`) : ej.o === '/' ? (ej.cual ? ` ¿entre qué número divides ${ej.a} para que dé ${ej.r}?` : ` ${ej.r} por ${ej.b}.`) : ` ¿qué número por ${ej.cual ? ej.a : ej.b} da ${ej.r}?`));
  narra(instr('hueco'));
};
function botonesVF(E, v, alAcertar, ayuda) {
  const O = el('div', 'opciones');
  [[true, '✅', 'Verdad'], [false, '❌', 'Mentira']].forEach(([val, e, t]) => {
    const b = el('button', 'opt opt-verdad', `<b>${e}</b>${t}`);
    b.onclick = () => { if (EJ.resuelto) return; if (val === v) { b.classList.add('ok'); alAcertar(b); } else { fallo(b); if (ayuda) ayuda(); } };
    O.appendChild(b);
  });
  E.appendChild(O);
}
RENDER.verdad = (ej, E) => {
  E.appendChild(el('div', 'tarjeta', `<div class="leer xl op-grande">${opTxt(ej.a, ej.o, ej.b)} = ${ej.m}</div>`));
  botonesVF(E, ej.v, b => acierto(b, ej.v ? `¡Es verdad! ${opVoz(ej.a, ej.o, ej.b)} son ${ej.r}.` : `¡Es mentira! ${opVoz(ej.a, ej.o, ej.b)} son ${ej.r}.`), () => narra(pick(NARRADOR.pista) + ' ' + pistaOp(ej)));
  ej.repetir = () => VOZ.decir(`${opVoz(ej.a, ej.o, ej.b)} igual a ${ej.m}. ¿Verdad o mentira?`);
  narra(instr('verdad'));
};
RENDER.problema = (ej, E) => {
  E.appendChild(el('div', 'tarjeta tarjeta-prob', `<div class="prob-emo">${ej.ob[0]}</div><div class="leer s">${esc(ej.texto)}</div>`));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => acierto(b, `${opVoz(ej.a, ej.o, ej.b)}, ${ej.r}.`)));
  ej.ayuda = () => narra(`${pick(NARRADOR.pista)} es una ${ej.o === '+' ? 'suma' : ej.o === '-' ? 'resta' : ej.o === '/' ? 'división' : 'multiplicación'}: ${opVoz(ej.a, ej.o, ej.b)}.`);
  ej.repetir = () => VOZ.decir(ej.texto, { rate: .92 });
  narra(instr('problema')).then(() => VOZ.decir(ej.texto, { rate: .92, cola: true }));
};
RENDER.une = (ej, E) => {
  const U = el('div', 'unir'); const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); U.appendChild(svg);
  let sel = null, hechos = 0;
  const izq = ej.ps.map(p => { const b = el('button', 'opt', `<span class="opt-txt">${p.t}</span>`); b._p = p; b._lado = 'i'; return b; });
  const der = ej.der.map(p => { const b = el('button', 'opt', `<span class="opt-txt opt-num">${p.r}</span>`); b._p = p; b._lado = 'd'; return b; });
  for (let i = 0; i < 3; i++) { U.appendChild(izq[i]); U.appendChild(der[i]); }
  E.appendChild(U);
  const linea = (a, b) => {
    const r0 = U.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', ra.right - r0.left - 6); l.setAttribute('y1', ra.top + ra.height / 2 - r0.top);
    l.setAttribute('x2', rb.left - r0.left + 6); l.setAttribute('y2', rb.top + rb.height / 2 - r0.top);
    l.setAttribute('stroke', '#17ff5f'); l.setAttribute('stroke-width', '6'); l.setAttribute('stroke-linecap', 'round'); l.style.filter = 'drop-shadow(0 0 6px #17ff5f)';
    svg.appendChild(l);
  };
  [...izq, ...der].forEach(b => b.onclick = () => {
    if (ej.resuelto || b.classList.contains('hecho')) return;
    if (!sel || sel._lado === b._lado) { $$('.unir .opt').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); SFX.clic(); return; }
    const a = sel._lado === 'i' ? sel : b, d = sel._lado === 'i' ? b : sel;
    sel.classList.remove('sel'); sel = null;
    if (a._p === d._p) { a.classList.add('hecho'); d.classList.add('hecho'); linea(a, d); SFX.pieza(); FX.chispas(d, 14); VOZ.decir(a._p.v + ', ' + a._p.r); hechos++; if (hechos === 3) acierto(U, '¡Todas unidas!'); }
    else fallo(d);
  });
  narra(instr('une'));
};
RENDER.dictado = (ej, E) => {
  const oir = el('button', 'btn btn-azul btn-oir-grande', '🔊 Escuchar el número');
  const decir = () => VOZ.decir(String(ej.n), { rate: .85 });
  oir.onclick = () => { SFX.clic(); decir(); };
  E.appendChild(el('div', 'leer l', '✍️')); E.appendChild(oir);
  const H = el('div', 'huecos'); ej.dig.forEach(() => H.appendChild(el('div', 'hueco'))); E.appendChild(H);
  const P = el('div', 'piezas'); E.appendChild(P);
  let pos = 0;
  ej.piezas.forEach(s => {
    const b = el('button', 'pieza pieza-num', s); P.appendChild(b);
    b.onclick = () => {
      if (ej.resuelto || b.classList.contains('usada')) return;
      if (s === ej.dig[pos]) {
        SFX.pieza(); b.classList.add('usada'); const h = H.children[pos]; h.textContent = s; h.classList.add('lleno'); pos++;
        if (pos === ej.dig.length) { oir.remove(); acierto(H, ej.n + '.'); }
      } else { fallo(b); if (EJ.errores >= 2) ej.ayuda(); }
    };
  });
  ej.ayuda = () => narra(ej.n >= 10 ? `${pick(NARRADOR.pista)} ${ej.n} tiene ${Math.floor(ej.n / 10)} decenas y ${ej.n % 10} unidades.` : 'Escucha otra vez: ' + ej.n);
  ej.repetir = decir;
  narra(instr('dictado')).then(() => decir());
};
RENDER.dictadoOp = (ej, E) => {
  const oir = el('button', 'btn btn-azul btn-oir-grande', '🔊 Escuchar la operación');
  const decir = () => VOZ.decir(opVoz(ej.a, ej.o, ej.b), { rate: .85 });
  oir.onclick = () => { SFX.clic(); decir(); };
  E.appendChild(el('div', 'leer l', '👂')); E.appendChild(oir);
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => { oir.outerHTML = `<div class="tarjeta"><div class="leer l op-grande">${opTxt(ej.a, ej.o, ej.b)} = ${ej.r}</div></div>`; acierto(b, `${opVoz(ej.a, ej.o, ej.b)}, ${ej.r}.`); }));
  ej.ayuda = () => narra(pick(NARRADOR.pista) + ' ' + pistaOp(ej));
  ej.repetir = decir;
  narra(instr('dictadoOp')).then(() => decir());
};
RENDER.decenas = (ej, E) => {
  if (ej.modo === 'num') {
    E.appendChild(el('div', 'tarjeta tarjeta-bloques', bloquesHTML(ej.d, ej.u)));
    E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.n, b => acierto(b, `${ej.d} decenas y ${ej.u} unidades: ${ej.n}.`)));
    ej.ayuda = () => narra(`${pick(NARRADOR.pista)} cuenta las barras de diez en diez: ${Array.from({ length: ej.d }, (_, k) => (k + 1) * 10).join(', ')}. Y luego suma los cuadraditos sueltos.`);
    narra(instr('decenas'));
  } else {
    E.appendChild(el('div', 'tarjeta', `<div class="leer xl op-grande"><span class="${ej.modo === 'd' ? 'resalta' : ''}">${ej.d}</span><span class="${ej.modo === 'u' ? 'resalta' : ''}">${ej.u}</span></div>`));
    E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.ok, b => acierto(b, `${ej.n} tiene ${ej.d} decenas y ${ej.u} unidades.`)));
    ej.ayuda = () => narra('Las decenas son la cifra de la izquierda y las unidades la de la derecha.');
    narra(ej.modo === 'd' ? '¿Cuántas decenas tiene este número?' : '¿Cuántas unidades tiene este número?');
  }
};
RENDER.pares = (ej, E) => {
  E.appendChild(el('div', 'tarjeta', `<div class="leer xl op-grande">${ej.n}</div>`));
  const O = el('div', 'opciones');
  [[true, '👫', 'Par'], [false, '🧍', 'Impar']].forEach(([v, e, t]) => {
    const b = el('button', 'opt opt-verdad', `<b>${e}</b>${t}`);
    b.onclick = () => { if (ej.resuelto) return; if (v === ej.par) { b.classList.add('ok'); acierto(b, `El ${ej.n} es ${ej.par ? 'par' : 'impar'}.`); } else { fallo(b); if (EJ.errores >= 1) ej.ayuda(); } };
    O.appendChild(b);
  });
  E.appendChild(O);
  ej.ayuda = () => narra('Los números pares terminan en 0, 2, 4, 6 u 8.');
  narra(instr('pares'));
};
RENDER.dinero = (ej, E) => {
  E.appendChild(el('div', 'tarjeta', dineroHTML(ej.piezas)));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), o => `<span class="opt-txt opt-num">${o} €</span>`, o => o === ej.r, b => acierto(b, `Hay ${ej.r} euros.`)));
  ej.ayuda = () => narra(`${pick(NARRADOR.pista)} ${ej.piezas.join(' más ')}.`);
  narra(instr('dinero'));
};
RENDER.compra = (ej, E) => {
  E.appendChild(el('div', 'tarjeta tarjeta-compra', `<div class="compra-it">${ej.it[0]}<span class="precio">${ej.precio} €</span></div>${dineroHTML(ej.piezas)}`));
  const O = el('div', 'opciones');
  [[true, '👍', 'Sí me llega'], [false, '👎', 'No me llega']].forEach(([v, e, t]) => {
    const b = el('button', 'opt opt-verdad', `<b>${e}</b>${t}`);
    b.onclick = () => { if (ej.resuelto) return; if (v === ej.v) { b.classList.add('ok'); acierto(b, `Tienes ${ej.r} euros y cuesta ${ej.precio}.`); } else { fallo(b); ej.ayuda(); } };
    O.appendChild(b);
  });
  E.appendChild(O);
  ej.ayuda = () => narra(`Cuenta tu dinero: ${ej.piezas.join(' más ')}. ¿Llega a ${ej.precio}?`);
  narra(`Quieres comprar ${ej.it[1]} que cuesta ${ej.precio} euros. ¿Te llega el dinero?`);
};
RENDER.hora = (ej, E) => {
  E.appendChild(el('div', 'dibujo dibujo-reloj', relojSVG(ej.h, ej.m)));
  E.appendChild(opciones(ej.opts, 'lista', o => `<span class="opt-txt">${o}</span>`, o => o === ej.ok, b => acierto(b, `Son ${ej.ok}.`)));
  ej.ayuda = () => narra('La aguja corta marca la hora. Si la larga mira al 12 es en punto, y si mira al 6, y media.');
  narra(instr('hora'));
};
RENDER.horaVF = (ej, E) => {
  E.appendChild(el('div', 'dibujo dibujo-reloj', relojSVG(ej.h, ej.m)));
  E.appendChild(el('div', 'leer m', 'Son ' + ej.txt));
  botonesVF(E, ej.v, b => acierto(b, ej.v ? '¡Verdad!' : `¡Mentira! Son ${ENG.txtHora(ej.h, ej.m)}.`), () => narra('Fíjate en la aguja corta: marca la hora.'));
  narra(instr('horaVF'));
};
RENDER.reparto = (ej, E) => {
  const T = el('div', 'tarjeta tarjeta-objs', objsHTML(ej.a, ej.ob[0], 0, 'mini'));
  const P = el('div', 'platos'); for (let i = 0; i < ej.b; i++) P.appendChild(el('div', 'plato', '<b>?</b>'));
  E.appendChild(T); E.appendChild(P);
  E.appendChild(el('div', 'leer m op-media', `${ej.a} ÷ ${ej.b} = ?`));
  const llena = () => [...P.children].forEach((p, i) => { p.innerHTML = `<span>${ej.ob[0].repeat(ej.r)}</span><small>${ej.r}</small>`; p.classList.add('lleno'); p.style.animationDelay = i * 120 + 'ms'; });
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => { llena(); acierto(b, `${ej.a} entre ${ej.b} son ${ej.r}. A cada uno le tocan ${ej.r}.`); }));
  ej.ayuda = () => narra(`${pick(NARRADOR.pista)} pon uno en cada plato, y vuelta a empezar, hasta que no quede ninguno. Es como buscar qué número por ${ej.b} da ${ej.a}.`);
  ej.repetir = () => VOZ.decir(`Reparte ${ej.a} ${ej.ob[1]} entre ${ej.b} platos.`);
  narra(instr('reparto')).then(() => VOZ.decir(`Tenemos ${ej.a} ${ej.ob[1]} y ${ej.b} platos.`, { cola: true }));
};
RENDER.grupos = (ej, E) => {
  const G = el('div', 'grupos-caja'); for (let i = 0; i < ej.g; i++) G.innerHTML += `<div class="grupo">${objsHTML(ej.n, ej.ob[0], 0, 'mini')}</div>`;
  E.appendChild(G);
  E.appendChild(el('div', 'leer m op-media', `${ej.g} × ${ej.n} = ?`));
  E.appendChild(opciones(ej.opts, clsN(ej.opts), nOpt, o => o === ej.r, b => acierto(b, `${ej.g} grupos de ${ej.n} son ${ej.r}.`)));
  ej.ayuda = () => narra(`${pick(NARRADOR.pista)} cuenta de ${ej.n} en ${ej.n}: ${Array.from({ length: ej.g }, (_, k) => (k + 1) * ej.n).join(', ')}.`);
  narra(instr('grupos'));
};

/* ---------------- FIN DE MISIÓN ---------------- */
async function finMision() {
  limpiaEjercicio();
  if (MIS && MIS.prueba) { toast('Prueba terminada (no cuenta para el progreso)'); ir('mapa'); return; }
  const d = datos(), t = MIS.lista.length;
  const fallos = MIS.fallosTot;
  const est = fallos <= 1 ? 3 : fallos <= 4 ? 2 : 1;
  const seg = Math.round((Date.now() - MIS.t0) / 1000);
  const lv = MIS.lv;
  const antes = nivelActual();
  let bonus = est * 5;
  if (!MIS.repaso) {
    const pl = d.plan[lv] || { m: 0, e: 0 };
    pl.m++; const ganadas = Math.max(0, est - pl.e); pl.e = Math.max(pl.e, est); d.est += ganadas; d.plan[lv] = pl;
  } else { d.est += 1; }
  if (MIS.diaria) { d.diaria = hoy(); bonus += 30; }
  d.chispas += MIS.chispas + bonus;
  d.st.seg += seg; d.st.dias[hoy()] = (d.st.dias[hoy()] || 0) + seg;
  const dk = Object.keys(d.st.dias).sort(); if (dk.length > 120) dk.slice(0, dk.length - 120).forEach(k => delete d.st.dias[k]);
  if (d.racha.ult !== hoy()) { d.racha.n = d.racha.ult === ayer() ? d.racha.n + 1 : 1; d.racha.ult = hoy(); }
  /* pegatina */
  let peg = null;
  const libres = PEGATINAS.map((p, i) => i).filter(i => !d.peg.includes(i));
  const nuevoPlaneta = nivelActual() > antes;
  if (libres.length && (MIS.diaria || nuevoPlaneta || (est >= 2 && Math.random() < .4))) { peg = pick(libres); d.peg.push(peg); d.pegNueva = peg; }
  d.mem = ENG.getMem(); d._t = Date.now();
  guardarNino();

  ir('resultado');
  ponRobot($('#resLucas'), NINO.color, 'vuela');
  $('#resTitulo').textContent = MIS.diaria ? '¡Misión del día!' : est === 3 ? '¡Misión perfecta!' : '¡Misión completada!';
  $('#resAciertos').textContent = MIS.aciertos + '/' + t;
  $('#resChispas').textContent = '+' + (MIS.chispas + bonus);
  $('#resTiempo').textContent = Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
  const ests = $$('#resEstrellas span'); ests.forEach(s => s.className = '');
  const P = $('#resPegatina'); P.classList.add('oculto');
  SFX.fanfarria(); FX.confeti(est * 60);
  ests.forEach((s, i) => { s.querySelector('img').src = 'img/estrella-' + (i < est ? 'on' : 'off') + '.png'; });
  for (let i = 0; i < 3; i++) { await esperar(380); ests[i].className = i < est ? 'on' : 'off'; if (i < est) { SFX.estrella(i); FX.chispas(ests[i], 20, '#ffd23f'); } }
  let frase = pick(NARRADOR['fin' + est]);
  if (peg != null) {
    frase += ' ' + pick(NARRADOR.pegatina);
    P.innerHTML = `<button class="cofre" id="cofreBtn" title="Abrir"><img src="img/cofre.png" alt="Cofre"></button><div class="cofre-txt">¡Has ganado un cofre!<br><small>Tócalo para abrirlo</small></div>`;
    P.classList.remove('oculto');
    let abierto = false;
    const abrir = () => {
      if (abierto) return; abierto = true;
      const b = $('#cofreBtn'); b.classList.add('abriendo'); SFX.woosh();
      setTimeout(() => {
        b.querySelector('img').src = 'img/cofre-abierto.png'; b.classList.remove('abriendo'); b.classList.add('abierto');
        SFX.fanfarria(); FX.chispas(b, 60, '#ffd23f'); FX.confeti(80);
        const pg = el('span', 'pega-sale', PEGATINAS[peg].e); b.appendChild(pg);
        P.querySelector('.cofre-txt').innerHTML = `¡Pegatina nueva!<br><small>${PEGATINAS[peg].n}</small>`;
        VOZ.decir('¡Una pegatina de ' + PEGATINAS[peg].n + '! Ya está en tu álbum.');
      }, 900);
    };
    $('#cofreBtn').onclick = abrir;
    setTimeout(abrir, 4500);   // si no lo toca, se abre solo
  }
  if (nuevoPlaneta) { frase += ' ' + pick(NARRADOR.planeta); SFX.planeta(); VIAJE = { d: antes, h: nivelActual() }; }
  VOZ.decir(frase);
  $('#bResOtra').onclick = () => { SFX.clic(); empezarMision({ lv: MIS.lv, repaso: MIS.repaso && !MIS.diaria }); };
}
$('#bResSeguir').onclick = () => { SFX.clic(); ir('mapa'); };

/* ---------------- ÁLBUM ---------------- */
ON_PANTALLA.pAlbum = () => {
  const d = datos(), A = $('#album'); A.innerHTML = '';
  $('#albumCuenta').textContent = d.peg.length + '/' + PEGATINAS.length;
  PEGATINAS.forEach((p, i) => {
    const tiene = d.peg.includes(i);
    const b = el('button', 'pega' + (tiene ? '' : ' no') + (d.pegNueva === i ? ' nueva' : ''), `<span>${p.e}</span><small>${p.n}</small>`);
    b.onclick = () => { if (tiene) { SFX.pop(); FX.chispas(b, 18); VOZ.decir(p.n); } else { SFX.clic(); VOZ.decir('Esta pegatina aún no la tienes. ¡Sigue jugando para conseguirla!'); } };
    A.appendChild(b);
  });
  d.pegNueva = null;
  VOZ.decir(`Tienes ${d.peg.length} pegatinas de ${PEGATINAS.length}. ¡A por todas!`);
};

/* ---------------- ZONA DE PAPÁS ---------------- */
let gateRes = 0, padresNino = null, volverDe = 'perfiles';
ON_PANTALLA.pPadres = () => {
  volverDe = NINO ? 'mapa' : 'perfiles';
  const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7); gateRes = a * b;
  $('#gateOp').textContent = `${a} × ${b}`; $('#gateRes').value = '';
  $('#padresGate').classList.remove('oculto'); $('#padresCont').classList.add('oculto');
};
$('#bPadresVolver').onclick = () => { SFX.clic(); ir(volverDe); };
$('#bGate').onclick = () => {
  if (+$('#gateRes').value !== gateRes) { SFX.mal(); toast('Respuesta incorrecta'); return; }
  SFX.ok(); $('#padresGate').classList.add('oculto'); $('#padresCont').classList.remove('oculto');
  padresNino = NINO || NINOS[0]; pintaPadres();
};
function pintaPadres() {
  const C = $('#padresCont');
  if (!padresNino) { C.innerHTML = `<div class="panel cristal"><p>Aún no hay jugadores. Crea uno desde la pantalla de perfiles.</p></div>${panelCuenta()}`; enlazaCuenta(); return; }
  const guard = NINO; NINO = padresNino; const d = datos();
  const pct = d.st.ej ? Math.round(d.st.ok / d.st.ej * 100) : 0;
  const dias = Object.keys(d.st.dias).length;
  const ult7 = [...Array(7)].map((_, i) => { const x = new Date(Date.now() - i * 864e5); const k = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); return Math.round((d.st.dias[k] || 0) / 60); });
  const dificiles = Object.entries((d.mem && d.mem.fail) || {}).filter(([k]) => /^(o|p|h|vf):/.test(k)).sort((a, b) => b[1] - a[1]).map(([k]) => k.replace(/^\w+:/, '').replace(/[01]$/, '')).filter((v, i, a) => a.indexOf(v) === i).slice(0, 14);
  const act = nivelActual();
  C.innerHTML = `
    <div class="sel-nino">${NINOS.map((n, i) => `<button data-i="${i}" class="${n === padresNino ? 'sel' : ''}">${esc(n.nombre)}</button>`).join('')}</div>
    <div class="panel cristal"><h3>📊 Progreso de ${esc(padresNino.nombre)} (${padresNino.edad} años)</h3>
      <div class="stats">
        <div class="stat"><b>${PLANETAS[act].letra}</b><small>Nivel actual · ${PLANETAS[act].nombre}</small></div>
        <div class="stat"><b>${pct}%</b><small>Aciertos a la primera</small></div>
        <div class="stat"><b>${d.st.ej}</b><small>Ejercicios hechos</small></div>
        <div class="stat"><b>${Math.round(d.st.seg / 60)}</b><small>Minutos jugando</small></div>
        <div class="stat"><b>${dias}</b><small>Días practicados</small></div>
        <div class="stat"><b>${d.racha.n}</b><small>Racha de días 🔥</small></div>
      </div>
      <p style="color:var(--txt2);margin:12px 0 4px">Minutos de los últimos 7 días (hoy primero): <b style="color:#fff">${ult7.join(' · ')}</b></p>
    </div>
    <div class="panel cristal"><h3>🪐 Planetas</h3>
      ${PLANETAS.map((p, i) => { const pl = d.plan[i] || { m: 0, e: 0 }; if (i > act + 1) return ''; return `<div class="barra-plan"><span>${p.letra} · ${'★'.repeat(pl.e)}${'☆'.repeat(3 - pl.e)}</span><span class="b"><i style="width:${Math.min(100, pl.m / 3 * 100)}%"></i></span><span>${pl.m} mis.</span></div>`; }).join('')}
    </div>
    <div class="panel cristal"><h3>🧠 Operaciones que le cuestan</h3>
      ${dificiles.length ? `<div class="chips">${dificiles.map(w => `<span class="chip">${esc(w)}</span>`).join('')}</div><p style="color:var(--txt2);font-size:14px">Lucas las repetirá más a menudo hasta que las domine.</p>` : '<p style="color:var(--txt2)">¡Ninguna por ahora! 🎉</p>'}
    </div>
    <div class="panel cristal"><h3>⚙️ Ajustes de ${esc(padresNino.nombre)}</h3>
            <div class="ajuste"><span>Voz más lenta<small>Lucas habla más despacio</small></span><button class="switch ${d.aj.lenta ? 'on' : ''}" data-aj="lenta"></button></div>
      <div class="ajuste"><span>Resumen semanal por correo<small>Cada domingo a ${esc(SES ? SES.email : '')}</small></span><button class="switch ${d.aj.resumen !== false ? 'on' : ''}" data-aj="resumen"></button></div>
      <div class="ajuste"><span>Música en el mapa</span><button class="switch ${d.aj.musica ? 'on' : ''}" data-aj="musica"></button></div>
      <div class="ajuste"><span>Desbloquear todos los planetas<small>Para niños que ya saben más</small></span><button class="switch ${d.aj.todo ? 'on' : ''}" data-aj="todo"></button></div>
      <div class="ajuste voz-aj"><span>Voz del narrador<small>Elige la que más le guste. Las voces dependen de cada móvil, tablet u ordenador.</small></span></div>
      <div class="voces" id="listaVoces">${listaVoces()}</div>
      <div class="ajuste"><span>Editar nombre, edad o color</span><button class="btn btn-mini" id="bEditN">✏️ Editar</button></div>
      <div class="ajuste"><span>Reiniciar progreso<small>Empieza de cero</small></span><button class="btn btn-mini btn-rojo" id="bReset">Reiniciar</button></div>
    </div>
    ${panelCuenta()}`;
  NINO = guard;
  $$('.sel-nino button').forEach(b => b.onclick = () => { padresNino = NINOS[+b.dataset.i]; pintaPadres(); });
  $$('.switch[data-aj]').forEach(b => b.onclick = () => {
    const g = NINO; NINO = padresNino; const dd = datos(); dd.aj[b.dataset.aj] = !dd.aj[b.dataset.aj]; dd._t = Date.now(); b.classList.toggle('on', dd.aj[b.dataset.aj]);
    guardarNino(); if (g === padresNino) aplicaAjustes(); NINO = g; SFX.clic();
  });
  enlazaVoces();
  $('#bEditN').onclick = () => editarNino(padresNino);
  $('#bReset').onclick = async () => {
    if (!await pregunta({ icono: '⚠️', titulo: 'Reiniciar progreso', texto: `Se borrará todo el progreso de ${esc(padresNino.nombre)} y empezará de cero.`, si: 'Reiniciar', peligro: true })) return;
    const aj = padresNino.datos.aj; padresNino.datos = datosVacios(); padresNino.datos.aj = aj; padresNino.datos._t = Date.now();
    const g = NINO; NINO = padresNino; guardarNino(true); if (g === padresNino) ENG.setMem(datos().mem); NINO = g; pintaPadres(); toast('Progreso reiniciado');
  };
  enlazaCuenta();
}
/* ---- elegir voz del narrador ---- */
const VOZ_M = /(m[oó]nica|helena|laura|elvira|dalia|paulina|marisol|luc[ií]a|ximena|sabina|conchita|paloma|elena|isabel|carmen|esperanza|ana\b|female|mujer|eea|eef|eec)/i;
const VOZ_H = /(jorge|pablo|[aá]lvaro|diego|enrique|juan|carlos|ra[uú]l|andr[eé]s|pedro|miguel|male\b|hombre|eed|eee)/i;
function generoVoz(v) { return VOZ_M.test(v.name) ? 'mujer' : VOZ_H.test(v.name) ? 'hombre' : ''; }
function nombreVoz(v, i) {
  const g = generoVoz(v), pais = /es[-_]ES/i.test(v.lang) ? 'España' : /MX/i.test(v.lang) ? 'México' : /US/i.test(v.lang) ? 'EE. UU.' : 'Latina';
  const nat = /natural|neural|online|google|premium|enhanced/i.test(v.name) ? ' · natural' : '';
  return `${g === 'mujer' ? '👩' : g === 'hombre' ? '👨' : '🗣️'} Voz ${i + 1}${g ? ' (' + g + ')' : ''} · ${pais}${nat}`;
}
function listaVoces() {
  const vs = VOZ.voces(), act = VOZ.actual();
  if (!vs.length) return '<p style="color:var(--txt2);font-size:14px">Este dispositivo solo tiene la voz por defecto.</p>';
  return vs.map((v, i) => `<button class="voz-op ${act && act.name === v.name ? 'sel' : ''}" data-v="${esc(v.name)}"><span>${nombreVoz(v, i)}</span><small>${esc(v.name)}</small><b>▶</b></button>`).join('');
}
function enlazaVoces() {
  $$('#listaVoces .voz-op').forEach(b => b.onclick = () => {
    VOZ.setVoz(b.dataset.v); $$('#listaVoces .voz-op').forEach(x => x.classList.toggle('sel', x === b));
    VOZ.decir('¡Hola! Soy Lucas. ¿Te gusta cómo sueno? Vamos a contar juntos.');
  });
}
function panelCuenta() {
  return `<div class="panel cristal"><h3>👤 Cuenta</h3><p style="margin:0 0 10px;color:var(--txt2)">${esc(SES ? SES.nombre + ' · ' + SES.email : '')}</p>
    <div class="fila-btns" style="justify-content:flex-start"><button class="btn btn-mini" id="bPInstalar">📲 Instalar app</button><button class="btn btn-mini" id="bPCompartir">💬 Compartir app</button><button class="btn btn-mini btn-rojo" id="bPSalir">Cerrar sesión</button></div>
    <p style="color:var(--txt2);font-size:13px;margin:12px 0 0">Los números de Lucas · FuturMovil · Ayuda: <a style="color:var(--verde)" href="https://wa.me/34633200100?text=${encodeURIComponent('Hola, necesito ayuda con Los números de Lucas')}" target="_blank">WhatsApp</a></p></div>`;
}
function enlazaCuenta() {
  const a = $('#bPInstalar'), b = $('#bPCompartir'), c = $('#bPSalir');
  pintaInstalar();
  if (a) a.onclick = () => $('#bInstalar').click(); if (b) b.onclick = () => $('#bCompartir').click(); if (c) c.onclick = () => $('#bSalir').click();
}

/* guardar si se cierra la app */
/* app oculta (pantalla apagada, segundo plano, otra pestaña): silencio total */
function silenciar() { SFX.suspender(); VOZ.callar(); }
function alVolver() {
  SFX.reanudar();
  if (pantallaActual === 'pMapa' && NINO && datos().aj.musica) SFX.musica(true);
  ACT.comprobar();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    silenciar();
    if (NINO && SES) { clearTimeout(tGuardar); NINO.datos._t = Date.now(); api('guardarNino', { token: SES.token, nino: NINO }); }
  } else alVolver();
});
addEventListener('pagehide', silenciar);
addEventListener('blur', () => { setTimeout(() => { if (document.hidden) silenciar(); }, 300); });

/* ---------------- actualización automática ----------------
   Mira cada minuto (y al volver a la app) si hay archivos nuevos en GitHub.
   Si los hay, recarga sola cuando el niño no está en mitad de una misión
   y vuelve a entrar directamente con el mismo lector. */
var ACT = (() => {
  /* Solo recarga si cambia el número de version.json (antes comparaba cabeceras
     de GitHub, que a veces cambian solas y provocaban recargas sin motivo). */
  let ver = null, pendiente = false, mirando = false;
  async function leeVersion() {
    try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return null; const j = await r.json(); return j && j.v ? String(j.v) : null; } catch (e) { return null; }
  }
  function seguro() { return ['pMapa', 'pPerfiles', 'pLogin', 'pAlbum'].includes(pantallaActual) && !document.querySelector('#modal:not(.oculto)') && !document.querySelector('.nave-mapa.viajando'); }
  function recargar() {
    if (NINO && NINO.id) LS.set('volverNino', NINO.id);
    if (VIAJE) LS.set('viaje', VIAJE);
    LS.set('recargaRapida', Date.now());
    location.reload();
  }
  async function comprobar() {
    if (mirando) return; mirando = true;
    try {
      if (pendiente) { if (seguro()) recargar(); return; }
      const v = await leeVersion(); if (!v) return;
      if (ver === null) { ver = v; return; }
      if (v !== ver) {
        pendiente = true;
        try { const reg = await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) {}
        if (seguro()) setTimeout(() => { if (seguro()) recargar(); }, 800);
      }
    } finally { mirando = false; }
  }
  setInterval(() => { if (!document.hidden) comprobar(); }, 90000);
  setTimeout(comprobar, 4000);
  return { comprobar, pendiente: () => pendiente, recargar, seguro, version: () => ver };
})();

/* =====================================================================
   MODO ADMIN · solo con la llave NFC de Manu
   - Entrada oculta: mantener pulsado 5 s el logo FuturMovil (pantalla de
     entrada o de lectores) o tocarlo 10 veces seguidas.
   - La primera vez (con la cuenta de admin abierta) se guarda la llave.
   ===================================================================== */
var ADMIN = (() => {
  let est = LS.get('adm', null);   // { t: token, exp }
  const activo = () => !!(est && est.exp > Date.now());
  const todo = () => activo() && !!LS.get('adm_todo', false);
  function badge() {
    let b = $('#admBadge');
    if (activo()) { if (!b) { b = el('button', 'adm-badge', '🛠️'); b.id = 'admBadge'; b.title = 'Modo admin'; b.onclick = () => { SFX.clic(); panel(); }; document.body.appendChild(b); } }
    else if (b) b.remove();
  }
  /* entrada oculta en los logos */
  function engancha(img) {
    if (!img || img._adm) return; img._adm = true; img.classList.add('mantener');
    let tm = null, toques = 0, tt = null;
    const quita = () => { clearTimeout(tm); img.classList.remove('cargando'); };
    img.addEventListener('pointerdown', () => { img.classList.add('cargando'); tm = setTimeout(() => { quita(); entrar(); }, 5000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => img.addEventListener(ev, quita));
    img.addEventListener('click', () => { toques++; clearTimeout(tt); tt = setTimeout(() => toques = 0, 2500); if (toques >= 10) { toques = 0; entrar(); } });
    img.addEventListener('contextmenu', e => e.preventDefault());
  }
  async function entrar() {
    if (activo()) { panel(); return; }
    SFX.nfc ? SFX.nfc() : SFX.clic();
    if (!('NDEFReader' in window)) { modal(`<h2>🔑 Llave NFC</h2><p>Para entrar al modo admin abre la app en <b>Chrome de Android</b> con el NFC activado.</p><button class="btn btn-verde" onclick="cerrarModal()">Vale</button>`); return; }
    modal(`<h2>🔑 Modo admin</h2><div class="nfc-anillo">📶</div><p id="nfcTxt">Preparando el lector…</p><button class="btn btn-mini" id="nfcCancel">Cancelar</button>`);
    const txt = t => { const e = $('#nfcTxt'); if (e) e.innerHTML = t; };
    /* El lector se activa YA (antes de hablar con el servidor) y sigue activo unos segundos
       después de leer: mientras la app está leyendo, Android no ejecuta lo que tenga
       programado la tarjeta (abrir otra web, etc.). */
    const ctrl = new AbortController(); let ocupado = false, hecho = false;
    const cerrarLector = (ms) => setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, ms || 0);
    $('#nfcCancel').onclick = () => { cerrarLector(0); cerrarModal(); };
    let r;
    try { r = new NDEFReader(); await r.scan({ signal: ctrl.signal }); }
    catch (err) { txt('No se puede usar el NFC: ' + (err && err.message || err)); return; }
    const e0 = await api('nfcEstado', {});
    if (!e0.ok) { txt(e0.error || 'Sin conexión'); cerrarLector(1500); return; }
    if (!e0.registrada && !(SES && SES.token)) { txt('La llave aún no está guardada. Entra primero con la cuenta de administrador.'); cerrarLector(1500); return; }
    txt(e0.registrada ? 'Acerca tu llave a la parte de atrás del móvil' : 'Primera vez: acerca tu llave para <b>guardarla</b>');
    r.onreadingerror = () => { if (!hecho) txt('No he podido leerla. Prueba otra vez.'); };
    r.onreading = async ev => {
      if (ocupado || hecho) return;     // lecturas repetidas mientras la llave sigue cerca: se ignoran
      const serial = ev.serialNumber || '';
      if (!serial) { txt('Esa llave no tiene número de serie.'); return; }
      ocupado = true; txt('Verificando…');
      const res = e0.registrada ? await api('nfcLogin', { serial }) : await api('nfcRegistrar', { token: SES.token, serial });
      ocupado = false;
      if (!res.ok) { SFX.mal(); txt((res.error || 'Llave no válida') + '<br><small>Puedes acercar otra llave.</small>'); return; }
      hecho = true;
      est = { t: res.adminToken, exp: Date.now() + 12 * 3600e3 }; LS.set('adm', est);
      SFX.ok(); FX.confeti(60); cerrarModal(); badge(); toast(e0.registrada ? 'Modo admin activado 🛠️ · ya puedes retirar la llave' : 'Llave guardada. Modo admin activado 🛠️'); panel();
      cerrarLector(5000);   // sigue "tapando" la tarjeta 5 s para que el móvil no la abra al retirarla
    };
    setTimeout(() => { if (!hecho) cerrarLector(0); }, 90000);
  }
  function salir() { est = null; LS.del('adm'); LS.del('adm_todo'); badge(); cerrarModal(); toast('Has salido del modo admin'); if (pantallaActual === 'pMapa') pintaMapa(); }
  async function op(o, extra) {
    if (!activo()) return { ok: false, error: 'Sesión admin caducada' };
    const r = await api('admin', Object.assign({ adminToken: est.t, op: o }, extra || {}));
    if (!r.ok && /caducad|no válid/i.test(r.error || '')) { salir(); }
    return r;
  }
  const TIPOS = { cuenta: 'Contar', escucha: 'Escucha el número', globos: 'Burbujas', traza: 'Traza el número', ordena: 'Ordenar', vecinos: 'Número que falta', compara: 'Comparar', formas: 'Formas', serie: 'Series', sumaVis: 'Suma con dibujos', restaVis: 'Resta con dibujos', op: 'Operación', mixta: 'Suma o resta', hueco: 'Hueco en la operación', verdad: 'Verdad o mentira', problema: 'Problema', une: 'Unir', dictado: 'Dictado de números', dictadoOp: 'Cálculo de oído', decenas: 'Decenas', pares: 'Par o impar', dinero: 'Dinero', compra: '¿Me llega?', hora: 'La hora', horaVF: 'Hora verdad/mentira', grupos: 'Grupos (×)', reparto: 'Repartir (÷)' };
  function probarTipo(tipo, lv) {
    if (!NINO) { toast('Elige antes un jugador'); return; }
    const lista = []; for (let k = 0; k < 30 && lista.length < 5; k++) { const ej = ENG.G[tipo](lv, 4, NINO.edad); if (ej) { ej.lv = lv; lista.push(ej); } }
    if (!lista.length) { toast('Ese ejercicio no existe en este planeta'); return; }
    cerrarModal();
    MIS = { lv, repaso: true, diaria: false, lista, i: 0, aciertos: 0, fallosTot: 0, chispas: 0, t0: Date.now(), racha: 0, prueba: true };
    ir('juego'); siguienteEjercicio();
  }
  function panel() {
    if (!activo()) { entrar(); return; }
    const n = NINO, d = n ? datos() : null;
    const C = ENG;
    modal(`<h2>🛠️ Modo admin</h2>
      <div class="adm-sec"><h3>Pruebas</h3>
        <div class="ajuste"><span>Jugar planetas bloqueados<small>Solo mientras esté marcado</small></span><button class="switch ${todo() ? 'on' : ''}" id="admTodo"></button></div>
        <div class="ajuste"><span>Personajes nuevos<small>Activado: 8 robots distintos para todos los usuarios. Desactivado: Lucas con colores</small></span><button class="switch ${PJ_ON ? 'on' : ''}" id="admPj"></button></div>
        ${n ? `<p style="margin:6px 0;font-size:14px">Probar un ejercicio en el planeta <select id="admLv">${PLANETAS.map((p, i) => `<option value="${i}" ${i === nivelActual() ? 'selected' : ''}>${i + 1}. ${p.letra}</option>`).join('')}</select></p>
        <div class="adm-grid">${Object.keys(TIPOS).map(t => `<button class="btn" data-tipo="${t}">${TIPOS[t]}</button>`).join('')}</div>` : '<p style="font-size:14px;color:var(--txt2)">Elige un lector para probar ejercicios.</p>'}
      </div>
      ${n ? `<div class="adm-sec"><h3>Jugador: ${esc(n.nombre)}</h3><div class="adm-grid">
        <button class="btn" id="admPlaneta">✅ Completar planeta actual</button>
        <button class="btn" id="admChispas">⚡ +100 chispas</button>
        <button class="btn" id="admEstrellas">⭐ +10 estrellas</button>
        <button class="btn" id="admPeg">📒 Pegatina al azar</button>
        <button class="btn" id="admPegAll">📒 Todas las pegatinas</button>
        <button class="btn" id="admDiaria">🌟 Repetir misión del día</button>
        <button class="btn" id="admViaje">🚀 Ver animación del cohete</button>
        <button class="btn" id="admCofre">🎁 Ver cofre del premio</button>
      </div></div>` : ''}
      <div class="adm-sec"><h3>App</h3><div class="adm-grid">
        <button class="btn" id="admPagos">💶 Pagos y licencias</button>
        <button class="btn" id="admCartel">👀 Ver cartel de pago</button>
        <button class="btn" id="admStats">📊 Estadísticas</button>
        <button class="btn" id="admResumen">📧 Enviarme el resumen semanal ahora</button>
        <button class="btn" id="admVoz">🔊 Probar voz</button>
        <button class="btn" id="admAct">🔄 Forzar actualización</button>
        <button class="btn btn-rojo" id="admLlave">🔑 Olvidar llave</button>
      </div>
      <div class="adm-stats" id="admOut">Contenido: <b>${Object.keys(ENG.G).length}</b> tipos de ejercicio · <b>25</b> planetas · retos del día infinitos · versión <b>${ACT.version() || '?'}</b></div></div>
      <button class="btn btn-verde" onclick="cerrarModal()">Cerrar</button>
      <button class="btn btn-mini" id="admSalir">Salir del modo admin</button>`);
    const out = t => { $('#admOut').innerHTML = t; };
    $('#admTodo').onclick = () => { const v = !todo(); LS.set('adm_todo', v); $('#admTodo').classList.toggle('on', v); SFX.clic(); if (pantallaActual === 'pMapa') pintaMapa(); toast(v ? 'Planetas desbloqueados (modo prueba)' : 'Candados activados otra vez'); };
    $('#admPj').onclick = async () => {
      const v = !PJ_ON; const r = await op('pjNuevos', { valor: v });
      if (!r.ok) return toast(r.error || 'No se pudo cambiar');
      PJ_ON = v; LS.set('pjOn', v); $('#admPj').classList.toggle('on', v); SFX.clic();
      toast(v ? 'Personajes nuevos activados para todos 🤖' : 'Vuelve Lucas con colores');
      ON_PANTALLA[pantallaActual] && ON_PANTALLA[pantallaActual]();
    };
    $$('[data-tipo]').forEach(b => b.onclick = () => probarTipo(b.dataset.tipo, +$('#admLv').value));
    const guarda = () => { d._t = Date.now(); guardarNino(); if (pantallaActual === 'pMapa') ON_PANTALLA.pMapa(); };
    if (n) {
      $('#admPlaneta').onclick = () => { const a = nivelActual(); d.plan[a] = { m: Math.max(2, (d.plan[a] || {}).m || 0), e: 3 }; guarda(); toast('Planeta ' + PLANETAS[a].letra + ' completado'); VIAJE = { d: a, h: nivelActual() }; cerrarModal(); ir('mapa'); };
      $('#admChispas').onclick = () => { d.chispas += 100; guarda(); toast('+100 chispas'); };
      $('#admEstrellas').onclick = () => { d.est += 10; guarda(); toast('+10 estrellas'); };
      $('#admPeg').onclick = () => { const l = PEGATINAS.map((p, i) => i).filter(i => !d.peg.includes(i)); if (!l.length) return toast('Ya las tiene todas'); const k = pick(l); d.peg.push(k); d.pegNueva = k; guarda(); toast('Pegatina: ' + PEGATINAS[k].n); };
      $('#admPegAll').onclick = () => { d.peg = PEGATINAS.map((p, i) => i); guarda(); toast('Álbum completo'); };
      $('#admDiaria').onclick = () => { d.diaria = ''; guarda(); toast('Misión del día disponible otra vez'); };
      $('#admViaje').onclick = () => { const a = nivelActual(); if (a < 1) return toast('Necesita al menos 2 planetas abiertos'); VIAJE = { d: a - 1, h: a }; cerrarModal(); ir('mapa'); };
      $('#admCofre').onclick = () => { cerrarModal(); if (!MIS) MIS = { lv: nivelActual(), lista: [1, 1, 1, 1, 1, 1, 1, 1], i: 8, aciertos: 8, fallosTot: 0, chispas: 0, t0: Date.now(), repaso: true, diaria: true }; else { MIS.diaria = true; MIS.repaso = true; } MIS.fallosTot = 0; MIS.aciertos = MIS.lista.length; finMision(); };
    }
    $('#admCartel').onclick = () => LICENCIA.cartel('demo');
    const pagos = async () => {
      out('Cargando…'); const r = await op('pagos'); if (!r.ok) return out(r.error);
      out(`<b>Pendientes de confirmar (${r.pendientes.length})</b><br>` +
        (r.pendientes.map(x => `• ${esc(x.email)} · ${x.dias} días · avisó ${x.aviso} <button class="btn btn-mini btn-verde" data-act="${esc(x.email)}">Activar</button>`).join('<br>') || '—') +
        `<br><br><b>Activar a mano</b><br><input type="email" id="admMail" placeholder="correo de la cuenta" style="padding:8px;font-size:14px"> <button class="btn btn-mini btn-verde" id="admMailBtn">Activar</button>` +
        `<br><br><b>Con licencia (${r.licencias.length})</b><br>` + (r.licencias.map(x => `• ${esc(x.email)} · ${x.fecha} <button class="btn btn-mini" data-quitar="${esc(x.email)}">Quitar</button>`).join('<br>') || '—') +
        `<br><br><b>En prueba (días usados de 15)</b><br>` + (r.prueba.map(x => `• ${esc(x.email)} · <b>${x.dias}</b>`).join('<br>') || '—'));
      const act = async (em, o) => { const k = await op(o, { email: em }); toast(k.ok ? (o === 'activar' ? 'Licencia activada ✅ (le llega un correo)' : 'Licencia quitada') : k.error); pagos(); };
      $$('[data-act]').forEach(b => b.onclick = () => act(b.dataset.act, 'activar'));
      $$('[data-quitar]').forEach(b => b.onclick = async () => { if (await pregunta({ icono: '💶', titulo: '¿Quitar licencia?', texto: esc(b.dataset.quitar), si: 'Quitar', peligro: true })) act(b.dataset.quitar, 'quitar'); else panel(); });
      $('#admMailBtn').onclick = () => { const em = $('#admMail').value.trim(); if (em) act(em, 'activar'); };
    };
    $('#admPagos').onclick = pagos;
    $('#admStats').onclick = async () => {
      out('Cargando…'); const r = await op('stats'); if (!r.ok) return out(r.error);
      out(`<b>${r.usuarios}</b> cuentas · <b>${r.ninos}</b> jugadores · <b>${r.activos7}</b> activos esta semana · <b>${r.hoy}</b> hoy · <b>${r.ejercicios}</b> ejercicios hechos<br>` +
        r.lista.map(x => `• <b>${esc(x.nombre)}</b> (${x.edad}) — ${esc(x.email)} · planeta ${x.nivel + 1} · ⭐${x.est} · ${x.min} min · ${x.ult}`).join('<br>'));
    };
    $('#admResumen').onclick = async () => { out('Enviando…'); const r = await op('resumen'); out(r.ok ? '📧 Enviado a ' + esc(r.a) + ' (si tienes jugadores con actividad).' : r.error); };
    $('#admVoz').onclick = () => { VOZ.decir('¡Hola, Manu! Soy Lucas. Siete más cinco son doce. ¡Genial, campeón!'); out('Voces en español de este dispositivo: ' + (VOZ.voces().map(v => esc(v.name)).join(', ') || 'ninguna')); };
    $('#admAct').onclick = async () => { out('Actualizando…'); try { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); const reg = await navigator.serviceWorker.getRegistration(); if (reg) await reg.unregister(); } catch (e) {} ACT.recargar(); };
    $('#admLlave').onclick = async () => { if (!await pregunta({ icono: '🔑', titulo: '¿Olvidar la llave?', texto: 'La próxima vez tendrás que guardarla de nuevo con la cuenta de administrador.', si: 'Olvidar', peligro: true })) return; const r = await op('nfcBorrar'); if (r.ok) { toast('Llave olvidada'); salir(); } else out(r.error); };
    $('#admSalir').onclick = salir;
  }
  setInterval(badge, 60000);
  setTimeout(() => { badge(); $$('.logo-fm, .logo-mini').forEach(engancha); }, 300);
  return { activo, todo, panel, entrar, badge };
})();

/* =====================================================================
   LICENCIA · prueba gratis sin avisos durante 15 días de uso distintos.
   El día 15 aparece el cartel de pago único (2,99 € con myPOS).
   El admin confirma el pago desde el modo admin.
   ===================================================================== */
var LICENCIA = (() => {
  const PAGO = 'https://mypos.com/@futurmovil/2.99';   // myPOS necesita punto decimal (con coma sale 0,00)
  const WA = '34633200100';
  function cartel(vista) {
    const l = (SES && SES.lic) || { dias: 15, prueba: 15, precio: '2,99' };
    const waTxt = encodeURIComponent(`Hola, he pagado la licencia de Los números de Lucas (${l.precio} €). Mi cuenta es ${SES ? SES.email : ''}`);
    modal(`<div class="pay">
      <span class="robot pay-robot" data-pose="lucas-vuela" data-fuerza="2"><canvas class="fuego"></canvas><img src="img/lucas/vuela.png" alt=""></span>
      <h2>¡Misión de prueba completada!</h2>
      <p class="dlg-txt">Habéis disfrutado de <b>${l.prueba} días</b> jugando con Lucas. 🚀<br>Para seguir explorando los planetas, desbloquea la app <b>para siempre</b>.</p>
      <div class="pay-precio"><b>${l.precio} €</b><span>pago único</span></div>
      <ul class="pay-lista">
        <li>✅ Licencia <b>vitalicia</b>: pagas una vez y es tuya para siempre</li>
        <li>✅ Sin suscripciones ni pagos mensuales</li>
        <li>✅ Todos los planetas, retos y jugadores de la familia</li>
        <li>✅ Las actualizaciones y novedades, incluidas</li>
      </ul>
      ${vista === 'gracias' || vista === 'gracias-demo' ? `<div class="pay-ok">💚 <b>¡Gracias!</b> Activaremos tu licencia en cuanto confirmemos el pago, normalmente en pocas horas. Mientras tanto puedes seguir usando la app.</div>
        <a class="btn btn-azul" target="_blank" href="https://wa.me/${WA}?text=${waTxt}">💬 Avisar por WhatsApp</a>
        <button class="btn btn-verde btn-grande" id="paySeguir">🚀 SEGUIR JUGANDO</button>`
      : `<a class="btn btn-verde btn-grande" id="payIr" target="_blank" href="${PAGO}">💳 DESBLOQUEAR POR ${l.precio} €</a>
        <button class="btn" id="payHecho">✅ Ya he pagado</button>
        ${l.avisado ? `<p class="dlg-txt" style="font-size:13px">Tu pago está pendiente de confirmar. Si ya pagaste, <a style="color:var(--verde)" target="_blank" href="https://wa.me/${WA}?text=${waTxt}">avísanos por WhatsApp</a>.</p>` : ''}
        <p class="pay-seg">🔒 Pago seguro con myPOS</p>`}
      ${vista === 'demo' ? '<button class="btn btn-mini" id="payCerrar">Cerrar vista previa</button>' : ''}
    </div>`, vista !== 'demo');
    VOZ.callar();
    /* Lucas lo explica hablado */
    const nom = NINO ? NINO.nombre : '';
    const habla = vista === 'gracias' || vista === 'gracias-demo'
      ? `¡Muchísimas gracias! En cuanto confirmemos el pago, tu licencia quedará activada para siempre. Mientras tanto, puedes seguir jugando conmigo.`
      : `¡Misión de prueba completada! ${nom ? nom + ' y tu familia habéis' : 'Habéis'} disfrutado de ${l.prueba} días jugando conmigo. Para seguir explorando todos los planetas, podéis desbloquear la aplicación para siempre. Es un pago único de ${l.precio.replace(',', ' con ')} euros. Pagas una sola vez y la aplicación es tuya para siempre, con licencia vitalicia: sin suscripciones y sin pagos mensuales. Incluye todos los planetas, los cuentos de cada noche, todos los lectores de la familia y todas las novedades que vayan llegando. Pulsa el botón verde para desbloquearla. ¡Te espero para seguir leyendo juntos!`;
    setTimeout(() => VOZ.decir(habla, { rate: .95 }), 600);
    const ir_ = $('#payIr'); if (ir_) ir_.onclick = () => { SFX.clic(); setTimeout(() => { const h = $('#payHecho'); if (h) h.classList.add('btn-azul'); }, 1500); };
    const h = $('#payHecho');
    if (h) h.onclick = async () => {
      if (vista === 'demo') { cartel('gracias-demo'); return; }
      h.disabled = true; h.textContent = 'Un momento…';
      const r = await api('pagoAviso', { token: SES.token });
      if (r.ok) { SES.lic = Object.assign({}, SES.lic, { avisado: true, espera: true }); LS.set('ses', SES); cartel('gracias'); SFX.ok(); FX.confeti(80); }
      else { h.disabled = false; h.textContent = '✅ Ya he pagado'; toast(r.error || 'Sin conexión, inténtalo otra vez'); }
    };
    const sg = $('#paySeguir'); if (sg) sg.onclick = () => { MODAL_FIJO = false; cerrarModal(); };
    const cc = $('#payCerrar'); if (cc) cc.onclick = () => { MODAL_FIJO = false; cerrarModal(); };
    if (vista === 'gracias-demo') { MODAL_FIJO = false; }
  }
  function comprobar() {
    const l = SES && SES.lic; if (!l || l.ok || !l.bloqueo || l.espera) return false;
    cartel('pagar'); return true;
  }
  return { comprobar, cartel };
})();

/* =====================================================================
   RETO DEL DÍA · una mini historia de Lucas ligada a la fecha (Navidad,
   Halloween, Fallas, verano, vuelta al cole…) y 5 preguntas de cálculo
   adaptadas a la edad y al planeta del niño. Se genera sola para cada día
   (siempre la misma para ese día y ese niño). Cada acierto enciende una estrella.
   ===================================================================== */
var RETO = (() => {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  /* temas por fecha: [mes, díaDesde, mes, díaHasta] */
  const TEMAS = [
    { r: [12, 20, 12, 31], e: '🎄', t: ['La Navidad de Lucas', 'Lucas y los regalos de Navidad', 'Un árbol de Navidad espacial'], lugar: 'la nave, llena de luces de Navidad',
      o: [['🎁', 'regalos', 'm'], ['🎄', 'bolas de Navidad', 'f'], ['⭐', 'estrellas', 'f'], ['🍪', 'galletas', 'f'], ['🦌', 'renos', 'm']], intro: 'Hoy es un día muy especial: ¡ya llega la Navidad!' },
    { r: [1, 1, 1, 6], e: '👑', t: ['Los Reyes Magos llegan al espacio', 'La carta de los Reyes', 'El roscón de Lucas'], lugar: 'el Planeta Roscón',
      o: [['🎁', 'regalos', 'm'], ['👑', 'coronas', 'f'], ['🐪', 'camellos', 'm'], ['🍬', 'caramelos', 'm'], ['⭐', 'estrellas', 'f']], intro: 'Los Reyes Magos están a punto de llegar.' },
    { r: [1, 7, 2, 10], e: '⛄', t: ['Nieve en el planeta helado', 'Lucas y el muñeco de nieve', 'La guerra de bolas de nieve'], lugar: 'un planeta helado',
      o: [['⛄', 'muñecos de nieve', 'm'], ['❄️', 'copos de nieve', 'm'], ['🧤', 'guantes', 'm'], ['☕', 'chocolates', 'm'], ['🐧', 'pingüinos', 'm']], intro: 'Hace muchísimo frío y todo está nevado.' },
    { r: [2, 11, 2, 29], e: '🎭', t: ['El carnaval de los robots', 'Disfraces en el espacio', 'La gran fiesta de carnaval'], lugar: 'la plaza del Planeta Carnaval',
      o: [['🎭', 'máscaras', 'f'], ['🎉', 'serpentinas', 'f'], ['🎈', 'globos', 'm'], ['🤡', 'payasos', 'm'], ['🥁', 'tambores', 'm']], intro: '¡Es carnaval y todo el mundo va disfrazado!' },
    { r: [3, 1, 3, 19], e: '🔥', t: ['Las Fallas de Lucas', 'Petardos y buñuelos', 'Lucas y los ninots'], lugar: 'una plaza de Valencia llena de fallas',
      o: [['🎆', 'petardos', 'm'], ['🍩', 'buñuelos', 'm'], ['🎎', 'ninots', 'm'], ['🌸', 'flores', 'f'], ['🎺', 'músicos', 'm']], intro: '¡Ya llegan las Fallas! Huele a buñuelos y a pólvora.' },
    { r: [3, 20, 4, 20], e: '🐣', t: ['La mona de Pascua', 'Huevos de colores en el espacio', 'La búsqueda de los huevos'], lugar: 'un jardín de primavera',
      o: [['🥚', 'huevos de colores', 'm'], ['🐣', 'pollitos', 'm'], ['🐰', 'conejitos', 'm'], ['🌷', 'tulipanes', 'm'], ['🍫', 'chocolatinas', 'f']], intro: '¡Llega la Pascua y la primavera!' },
    { r: [4, 21, 6, 20], e: '🌼', t: ['La primavera de Lucas', 'El jardín de las mariposas', 'Flores para mamá'], lugar: 'un prado lleno de flores',
      o: [['🌼', 'flores', 'f'], ['🦋', 'mariposas', 'f'], ['🐝', 'abejas', 'f'], ['🐞', 'mariquitas', 'f'], ['🍓', 'fresas', 'f']], intro: 'Hace sol y el campo está lleno de flores.' },
    { r: [6, 21, 6, 30], e: '🔥', t: ['La noche de San Juan', 'Hogueras en la playa', 'Lucas salta las olas'], lugar: 'la playa en la noche de San Juan',
      o: [['🔥', 'hogueras', 'f'], ['🌊', 'olas', 'f'], ['✨', 'bengalas', 'f'], ['🍉', 'sandías', 'f'], ['⭐', 'estrellas fugaces', 'f']], intro: 'Es la noche más corta del año, ¡la noche de San Juan!' },
    { r: [7, 1, 8, 31], e: '🏖️', t: ['Vacaciones en la playa', 'Lucas hace castillos de arena', 'Helados en el espacio'], lugar: 'una playa con arena dorada',
      o: [['🐚', 'conchas', 'f'], ['🍦', 'helados', 'm'], ['🏰', 'castillos de arena', 'm'], ['🦀', 'cangrejos', 'm'], ['🐠', 'peces', 'm']], intro: '¡Por fin vacaciones! Hace calor y apetece un chapuzón.' },
    { r: [9, 1, 9, 30], e: '🎒', t: ['La vuelta al cole', 'Lucas va a la escuela espacial', 'La mochila de Lucas'], lugar: 'la escuela espacial',
      o: [['✏️', 'lápices', 'm'], ['📚', 'libros', 'm'], ['🖍️', 'ceras', 'f'], ['🎒', 'mochilas', 'f'], ['📏', 'reglas', 'f']], intro: '¡Empieza el cole! Hay que preparar la mochila.' },
    { r: [10, 1, 10, 19], e: '🍂', t: ['El otoño de Lucas', 'Hojas de colores', 'El bosque mágico'], lugar: 'un bosque con hojas naranjas',
      o: [['🍂', 'hojas', 'f'], ['🍄', 'setas', 'f'], ['🐿️', 'ardillas', 'f'], ['🌰', 'castañas', 'f'], ['🦔', 'erizos', 'm']], intro: 'Ha llegado el otoño y las hojas caen de los árboles.' },
    { r: [10, 20, 11, 2], e: '🎃', t: ['La noche de Halloween', 'Lucas y las calabazas', 'Truco o trato en el espacio'], lugar: 'el Planeta Calabaza',
      o: [['🎃', 'calabazas', 'f'], ['🍬', 'caramelos', 'm'], ['🦇', 'murciélagos', 'm'], ['👻', 'fantasmas', 'm'], ['🕷️', 'arañas', 'f']], intro: '¡Es Halloween! Todos van disfrazados de monstruos simpáticos.' },
    { r: [11, 3, 12, 19], e: '🌰', t: ['Castañas calentitas', 'El otoño en el espacio', 'Lucas y la lluvia'], lugar: 'un planeta con castaños',
      o: [['🌰', 'castañas', 'f'], ['☂️', 'paraguas', 'm'], ['🍂', 'hojas', 'f'], ['🍠', 'boniatos', 'm'], ['🧣', 'bufandas', 'f']], intro: 'Hace fresquito y huele a castañas asadas.' }
  ];
  const ESPACIO = { e: '🚀', t: ['Una aventura espacial', 'Lucas explora una galaxia'], lugar: 'una galaxia lejana', o: OBJETOS.slice(0, 8), intro: 'Lucas despega en una nueva misión.' };
  function temaDe(f) {
    const m = f.getMonth() + 1, d = f.getDate(), k = m * 100 + d;
    return TEMAS.find(t => k >= t.r[0] * 100 + t.r[1] && k <= t.r[2] * 100 + t.r[3]) || ESPACIO;
  }
  /* azar con semilla: el mismo reto todo el día */
  function semilla(str) { let h = 1779033703; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  const claveF = f => f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');

  function genera(f) {
    const tm = temaDe(f), r0 = Math.random;
    Math.random = semilla(claveF(f) + '|' + NINO.nombre + '|' + NINO.edad);
    try {
      const lv = nivelActual(), cfg = ENG.cfgDe(Math.max(lv, 4)), amigo = pick(NOMBRES.filter(n => n !== 'Lucas'));
      ENG.setEdad(NINO.edad);
      const pqs = [];
      for (let k = 0; k < 5; k++) pqs.push(pregunta(lv, cfg, tm, amigo, k));
      const titulo = pick(tm.t);
      const p = [
        { x: `${tm.intro} Lucas y ${amigo} viajan a ${tm.lugar}.`, i: tm.e + '🚀' },
        { x: `Allí encuentran ${pick(tm.o)[1]}, ${pick(tm.o)[1]} y muchas sorpresas. ¡Pero para disfrutar de la aventura tienen que resolver unos retos de números!`, i: tm.o.slice(0, 3).map(o => o[0]).join('') },
        { x: `${amigo} dice: «¡Lucas, ayúdame a contar!». Y Lucas responde: «¡Claro! Con un buen amigo los números son facilísimos». ¿Les ayudas tú también?`, i: '🤖🤝' }
      ];
      return { t: titulo, e: tm.e, p, q: pqs };
    } finally { Math.random = r0; }
  }
  /* una pregunta con opciones «emoji texto» (el emoji se quita al decirlo en voz alta) */
  function pregunta(lv, cfg, tm, amigo, k) {
    const ob = tm.o[k % tm.o.length], e = ob[0], cuantos = ob[2] === 'f' ? 'Cuántas' : 'Cuántos';
    const opc = (r, lista) => { const o = lista || ENG.cerca(r, 3, 0, 999); return { o: o.map(v => e + ' ' + v), k: o.indexOf(r) }; };
    /* los peques (planetas 0-3): contar y comparar con números pequeños */
    if (lv < 4) {
      if (k % 2 === 0) { const a = ENG.ent(1, 3), b = ENG.ent(1, 2); return Object.assign({ p: `${amigo} tiene ${a} ${ob[1]} y Lucas le da ${b} más. ¿${cuantos} tiene ahora?` }, opc(a + b, ENG.cerca(a + b, 3, 1, 6))); }
      const a = ENG.ent(1, 5); let b = ENG.ent(1, 5); while (b === a) b = ENG.ent(1, 5);
      const o = [`🤖 Lucas`, `🧒 ${amigo}`];
      return { p: `Lucas tiene ${a} ${ob[1]} y ${amigo} tiene ${b}. ¿Quién tiene más?`, o, k: a > b ? 0 : 1 };
    }
    let p = ENG.operacion(cfg.op ? cfg : Object.assign({}, cfg, { op: '+', hi: 20 }));
    if (p.o === 'x' && (p.a > 10 || p.b > 10)) p = ENG.operacion(Object.assign({}, cfg, { tablas: [2, 5] }), 'x');
    if (p.a < 2 || p.b < 1) { p = { a: p.a + 2, b: Math.max(1, p.b), o: p.o }; p.r = ENG.calc(p.a, p.o, p.b); }
    const T = {
      '+': [`Lucas tiene ${p.a} ${ob[1]} y ${amigo} le regala ${p.b} más. ¿${cuantos} ${ob[1]} tiene ahora?`, `En ${tm.lugar.split(',')[0]} hay ${p.a} ${ob[1]} y ${p.b === 1 ? 'llega 1' : 'llegan ' + p.b} más. ¿${cuantos} hay en total?`],
      '-': [`Había ${p.a} ${ob[1]} y ${amigo} se lleva ${p.b}. ¿${cuantos} quedan?`, `Lucas tenía ${p.a} ${ob[1]} y regala ${p.b} a sus amigos. ¿${cuantos} le quedan?`],
      '/': [`Lucas reparte ${p.a} ${ob[1]} entre ${p.b} amigos a partes iguales. ¿${cuantos} le tocan a cada uno?`, `${amigo} guarda ${p.a} ${ob[1]} en ${p.b} cajas, el mismo número en cada una. ¿${cuantos} van en cada caja?`],
      'x': [`Hay ${p.a} cajas y en cada una hay ${p.b} ${ob[1]}. ¿${cuantos} hay en total?`, `${amigo} hace ${p.a} montones de ${p.b} ${ob[1]}. ¿${cuantos} son en total?`]
    };
    return Object.assign({ p: pick(T[p.o]) }, opc(p.r));
  }

  let C = null, fecha = null, parar = false, rec = null;
  const lucasCara = () => `<span class="robot cu-lucas reto-lucas" data-pose="lucas-senala" data-fuerza=".8"><canvas class="fuego"></canvas><img src="${imgPj(NINO.color, 'senala').src}" style="filter:${imgPj(NINO.color, 'senala').filter}" alt=""></span>`;
  function cuerpo(html) { $('#cuCuerpo').innerHTML = html; }
  const esHoy = f => claveF(f) === claveF(new Date());
  async function abrir(f) {
    fecha = f || new Date(); parar = false;
    SFX.musica(false); ir('cuento');
    C = genera(fecha);
    const d = datos(); const hecho = (d.cuentos || {})[claveF(fecha)], N = C.q.length;
    $('#cuTitulo').textContent = esHoy(fecha) ? 'El reto de hoy' : fecha.getDate() + ' de ' + MESES[fecha.getMonth()];
    cuerpo(`<div class="cu-portada">
      ${lucasCara()}
      <div class="cu-fecha">${fecha.getDate()} de ${MESES[fecha.getMonth()]}</div>
      <div class="cu-emoji">${C.e}</div>
      <h2 class="cu-t">${esc(C.t)}</h2>
      ${hecho != null ? `<p class="dlg-txt">Ya lo hiciste: <b>${hecho}/${N}</b> estrellas ⭐</p>` : `<p class="dlg-txt">Escucha la historia y resuelve ${N} retos de números.</p>`}
      <button class="btn btn-cuento btn-grande" id="cuPlay">▶ EMPEZAR EL RETO</button>
    </div>`);
    $('#cuPlay').onclick = () => { SFX.clic(); narrar(); };
    VOZ.decir(`${NINO.nombre}, el reto de hoy se llama: ${C.t}.`);
  }
  async function narrar() {
    parar = false;
    for (let k = 0; k < C.p.length; k++) {
      if (parar || pantallaActual !== 'pCuento') return;
      const P = C.p[k];
      cuerpo(`<div class="cu-escena">
        <div class="cu-prog">${C.p.map((_, j) => `<i class="${j < k ? 'on' : j === k ? 'ya' : ''}"></i>`).join('')}</div>
        <div class="cu-ilus" id="cuIlus">${splitEmoji(P.i).map((e, j) => `<span style="animation-delay:${j * .25}s">${e}</span>`).join('')}</div>
        <div class="cu-texto" id="cuTexto">${P.x.split(' ').map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
        <div class="fila-btns"><button class="btn" id="cuSalta">⏭ Siguiente</button></div>
      </div>`);
      let saltar = false;
      $('#cuSalta').onclick = () => { SFX.clic(); saltar = true; VOZ.callar(); };
      await leeParrafo(P.x);
      if (parar) return;
      if (!saltar) await esperar(350);
    }
    if (!parar) preguntas();
  }
  function splitEmoji(s) { try { return [...new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(s)].map(x => x.segment).filter(x => x.trim()); } catch (e) { return [...s]; } }
  function leeParrafo(x) {
    const spans = [...document.querySelectorAll('#cuTexto span')], palabras = x.split(' ');
    const starts = []; let pos = 0; palabras.forEach(w => { starts.push(pos); pos += w.length + 1; });
    return VOZ.decir(x, { rate: .92, onBoundary: e => {
      const idx = starts.findIndex((st, i) => e.charIndex >= st && (i === starts.length - 1 || e.charIndex < starts[i + 1]));
      spans.forEach(s => s.classList.remove('lee')); if (spans[idx]) spans[idx].classList.add('lee');
    } });
  }
  async function preguntas() {
    let estrellas = 0; const N = C.q.length;
    cuerpo(`<div class="cu-preg">
      <div class="constelacion" id="cuConst">${Array.from({ length: N }, (_, k) => `<i style="--a:${k * 360 / N}deg"></i>`).join('')}<div class="cu-luna">🔢</div></div>
      <p class="dlg-txt" id="cuPregTxt">¡A por los retos! Cada respuesta buena enciende una estrella.</p>
      <div id="cuPregZona"></div>
    </div>`);
    await VOZ.decir(`¡Ahora vienen los ${N} retos! Cada vez que aciertes, se encenderá una estrella. ¡Vamos allá!`);
    for (let k = 0; k < N; k++) {
      if (pantallaActual !== 'pCuento') return;
      const ok = await unaPregunta(C.q[k], k, N);
      if (ok) { estrellas++; const st = $('#cuConst').children[k]; st.classList.add('on'); FX.chispas(st, 16, '#ffd23f'); SFX.estrella(Math.min(2, k % 3)); }
      await esperar(450);
    }
    fin(estrellas);
  }
  function unaPregunta(q, k, N) {
    return new Promise(async res => {
      $('#cuPregTxt').innerHTML = `<b>Reto ${k + 1} de ${N}</b><br>${esc(q.p)}`;
      $('#cuPregZona').innerHTML = `<div class="opciones lista cu-opts">${q.o.map((t, i) => `<button class="opt" data-i="${i}"><span class="opt-txt" style="font-size:26px">${esc(t)}</span></button>`).join('')}</div>
        ${SR ? '<button class="btn btn-micro-mini" id="cuMic">🎤 Decirlo en voz alta</button>' : ''}`;
      let fallos = 0, hecho = false;
      const termina = bien => {
        if (hecho) return; hecho = true; try { rec && rec.abort(); } catch (e) {}
        $$('.cu-opts .opt').forEach(b => b.classList.add('apagada'));
        const buena = $$('.cu-opts .opt')[q.k]; buena.classList.remove('apagada'); buena.classList.add('ok');
        if (bien) { SFX.ok(); VOZ.decir(pick(NARRADOR.bien)).then(() => res(true)); }
        else { VOZ.decir('Era: ' + q.o[q.k].replace(/^\S+\s/, '') + '. ¡La próxima seguro que sí!').then(() => res(false)); }
      };
      const elige = i => {
        if (hecho) return;
        const b = $$('.cu-opts .opt')[i];
        if (i === q.k) termina(fallos === 0);
        else { fallos++; SFX.mal(); b.classList.add('mal', 'apagada'); if (fallos >= 2) termina(false); else VOZ.decir('Mmm, esa no. ¡Prueba otra!'); }
      };
      $$('.cu-opts .opt').forEach(b => b.onclick = () => elige(+b.dataset.i));
      const mic = $('#cuMic');
      if (mic) mic.onclick = () => {
        VOZ.callar(); const norm = t => ENG.quitaTildes(String(t).toLowerCase()).replace(/[^a-z0-9ñü ]/g, ' ').replace(/\s+/g, ' ').trim();
        try {
          rec = new SR(); rec.lang = 'es-ES'; rec.maxAlternatives = 5; mic.classList.add('escucha'); mic.textContent = '👂 Te escucho…';
          rec.onresult = e => {
            const alts = [...e.results[0]].map(a => norm(a.transcript));
            const idx = q.o.findIndex(o => { const w = norm(o.replace(/^\S+\s/, '')); return w && alts.some(a => a.split(' ').includes(w) || a === w); });
            if (idx >= 0) elige(idx); else VOZ.decir('No te he entendido bien. ¡Toca la respuesta!');
          };
          rec.onend = () => { mic.classList.remove('escucha'); mic.textContent = '🎤 Decirlo en voz alta'; };
          rec.start();
        } catch (e) {}
      };
      await VOZ.decir(q.p, { rate: .92 });
    });
  }
  function fin(n) {
    const N = C.q.length, d = datos(); d.cuentos = d.cuentos || {}; const k = claveF(fecha);
    const nuevo = d.cuentos[k] == null; d.cuentos[k] = Math.max(n, d.cuentos[k] || 0);
    if (nuevo) d.chispas += n * 5; d._t = Date.now(); guardarNino();
    const frase = n >= N ? '¡Reto perfecto! Eres un genio de los números.' : n >= N - 2 ? '¡Muy bien! Has encendido muchas estrellas.' : '¡Bien hecho! Mañana habrá un reto nuevo.';
    cuerpo(`<div class="cu-portada">
      ${lucasCara()}
      <h2 class="cu-t">${n} de ${N} estrellas ⭐</h2>
      <div class="constelacion mini">${Array.from({ length: N }, (_, j) => `<i class="${j < n ? 'on' : ''}" style="--a:${j * 360 / N}deg"></i>`).join('')}<div class="cu-luna">🔢</div></div>
      <p class="dlg-txt">${frase}${nuevo ? `<br>+${n * 5} chispas ⚡` : ''}</p>
      <button class="btn btn-cuento" id="cuOtra">🔁 Repetir el reto</button>
      <button class="btn btn-mini" id="cuMapa">Volver al mapa</button>
    </div>`);
    if (n >= N - 1) FX.confeti(90);
    $('#cuOtra').onclick = () => abrir(fecha); $('#cuMapa').onclick = () => ir('mapa');
    VOZ.decir(frase + ' ¡Mañana te espero con otro reto, ' + NINO.nombre + '!');
  }
  function dias() {
    const hoy = new Date(); const d = datos();
    const items = Array.from({ length: 14 }, (_, k) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - k));
    modal(`<h2>📅 Retos de otros días</h2><div class="cu-dias">${items.map((f, k) => {
      const h = (d.cuentos || {})[claveF(f)];
      return `<button class="btn" data-k="${k}">${k === 0 ? 'Hoy' : k === 1 ? 'Ayer' : f.getDate() + ' de ' + MESES[f.getMonth()]}${h != null ? ` · ⭐${h}` : ''}</button>`;
    }).join('')}</div><button class="btn btn-mini" onclick="cerrarModal()">Cerrar</button>`);
    $$('.cu-dias [data-k]').forEach(b => b.onclick = () => { cerrarModal(); abrir(items[+b.dataset.k]); });
  }
  $('#bCuento').onclick = () => { SFX.clic(); if (LICENCIA.comprobar()) return; abrir(new Date()); };
  $('#bCuentoSalir').onclick = () => { parar = true; VOZ.callar(); try { rec && rec.abort(); } catch (e) {} ir('mapa'); };
  $('#bCuentoDias').onclick = () => { SFX.clic(); dias(); };
  return { abrir, genera };
})();
var CUENTO = RETO;
