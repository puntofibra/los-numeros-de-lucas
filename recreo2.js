/* =====================================================================
   LOS NÚMEROS DE LUCAS · Recreo PRO — 4 minijuegos arcade de matemáticas
   5 · Garra espacial     — pesca el meteorito con el resultado
   7 · Marcianos del cráter — machaca solo a los marcianos buenos (+ jefe final)
   Usa lo de extras.js: JUEGOS, finJuego, REC, retoRecreo, malasRecreo
   ===================================================================== */
'use strict';

JUEGOS.push(
  { id: 'garra', n: 'Garra espacial', e: '🦾', d: 'Lanza la garra y pesca el meteorito con el resultado.' },
  { id: 'marcianos', n: 'Marcianos del cráter', e: '👾', d: '¡Pam! Golpea a los marcianos con el número bueno y vence al jefe.' });
const JUEGOS_EXTRA = { garra: () => juegoGarra(), marcianos: () => juegoMarcianos() };

/* ---------------- estilos ---------------- */
(function () {
  const s = document.createElement('style');
  s.textContent = `
.rc-escena { position: relative; flex: 1; min-height: 410px; border-radius: 22px; overflow: hidden; border: 2px solid var(--borde); background: #050a1a; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
.rc-cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.rc-pj { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 2; will-change: transform; }
.rc-pj .robot { width: 100%; }
.rc-pt { position: absolute; width: 2px; height: 2px; pointer-events: none; }
.rc-cab { gap: 6px; }
.rc-cab > span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.rc-obj { min-height: 42px; justify-content: center; }
.rc-emo { font-size: 38px; line-height: 1; filter: drop-shadow(0 0 10px rgba(255,255,255,.45)); animation: rcLat 1.6s ease-in-out infinite; }
@keyframes rcLat { 50% { transform: scale(1.12); } }
.rc-oir { width: 44px; height: 44px; border-radius: 14px; font-size: 22px; background: rgba(23,255,95,.15); border: 2px solid var(--verde); display: grid; place-items: center; color: #fff; box-shadow: 0 0 12px rgba(23,255,95,.45); }
.rc-slots { display: inline-flex; gap: 4px; font-family: 'Andika', sans-serif; font-size: 22px; font-weight: 700; }
.rc-slots b { color: var(--verde); text-shadow: var(--sombra-verde); }
.rc-slots i { font-style: normal; min-width: 26px; text-align: center; border-bottom: 3px solid rgba(255,255,255,.5); color: rgba(255,255,255,.35); }
.rc-slots u { text-decoration: none; color: #fff; opacity: .55; }
.rc-regla { font-family: 'Andika', sans-serif; font-size: 20px; font-weight: 700; color: var(--amarillo); text-shadow: 0 0 10px rgba(255,210,63,.6); max-width: 46vw; overflow: hidden; text-overflow: ellipsis; }
.rc-opx { font-family: 'Andika', sans-serif; font-size: 26px; font-weight: 700; color: #fff; text-shadow: 0 0 12px rgba(24,224,255,.8); white-space: nowrap; }
.rc-vidas { font-size: 17px; letter-spacing: -2px; }
.rc-sacude { animation: rcSac .35s; }
@keyframes rcSac { 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
`;
  document.head.appendChild(s);
})();

/* ---------------- utilidades comunes ---------------- */
const RC_F = '"NumCole", "Andika", "Fredoka", system-ui, sans-serif';
try { document.fonts.load('700 20px NumCole', '0123456789'); } catch (e) {}
const rcTx = s => document.body.classList.contains('mayus') ? String(s).toUpperCase() : String(s);
const rcVidas = n => `<span class="rc-vidas">${'❤️'.repeat(Math.max(0, n))}${'🖤'.repeat(Math.max(0, 3 - n))}</span>`;
const rcClamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rcRR(x, X, Y, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

function rcEscena(cab) {
  const Z = $('#recZona');
  Z.innerHTML = `<div class="ll-cab rc-cab">${cab}</div><div class="rc-escena"><canvas class="rc-cv"></canvas></div>`;
  const S = Z.querySelector('.rc-escena'), cv = S.querySelector('canvas'), x = cv.getContext('2d');
  const E = { S, cv, x, W: 300, H: 400 };
  E.tam = () => {
    const r = S.getBoundingClientRect(); if (!r.width) return;
    const d = Math.min(2, devicePixelRatio || 1);
    E.W = r.width; E.H = r.height; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
    x.setTransform(d, 0, 0, d, 0, 0);
    if (E.alTam) E.alTam();
  };
  E.tam();
  const onR = () => E.tam(); addEventListener('resize', onR);
  E.quita = () => removeEventListener('resize', onR);
  return E;
}
/* bucle con dt; se pausa si la app no se ve y se para solo si la escena desaparece */
function rcBucle(E, fn) {
  let vivo = true, t0 = performance.now(), raf;
  const paso = t => {
    if (!vivo) return;
    if (!E.cv.isConnected) { vivo = false; if (E.alPerder) E.alPerder(); return; }
    const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    if (!document.hidden && E.S.offsetParent !== null) fn(dt, t / 1000);
    raf = requestAnimationFrame(paso);
  };
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); };
}
function rcEstrellas(n) { return Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), z: .15 + Math.random() * .85, f: Math.random() * 7 })); }
function rcFondo(E, est, dx, t, c1 = '#071230', c2 = '#1a0b3d') {
  const { x, W, H } = E;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const n = x.createRadialGradient(W * .8, H * .25, 0, W * .8, H * .25, W * .8); n.addColorStop(0, 'rgba(139,92,255,.22)'); n.addColorStop(1, 'transparent'); x.fillStyle = n; x.fillRect(0, 0, W, H);
  const n2 = x.createRadialGradient(W * .1, H * .85, 0, W * .1, H * .85, W * .7); n2.addColorStop(0, 'rgba(24,224,255,.12)'); n2.addColorStop(1, 'transparent'); x.fillStyle = n2; x.fillRect(0, 0, W, H);
  x.fillStyle = '#fff';
  for (const s of est) {
    s.x -= dx * s.z / W; if (s.x < -.02) { s.x += 1.04; s.y = Math.random(); }
    const a = .35 + .65 * (Math.sin(t * 2 + s.f) * .5 + .5) * s.z;
    x.globalAlpha = a;
    const L = dx > 3 ? dx * s.z * 2.2 : 0;
    if (L > 1.5) { x.fillRect(s.x * W, s.y * H, L, Math.max(1, s.z * 2)); }
    else { x.beginPath(); x.arc(s.x * W, s.y * H, s.z * 1.7, 0, 7); x.fill(); }
  }
  x.globalAlpha = 1;
}
function rcChispas(E, px, py, n = 18, col) { const s = el('span', 'rc-pt'); s.style.left = px + 'px'; s.style.top = py + 'px'; E.S.appendChild(s); try { FX.chispas(s, n, col); } catch (e) {} setTimeout(() => s.remove(), 60); }
function rcFlota(L, t, px, py, c = '#ffd23f', fs = 26) { L.push({ t, x: px, y: py, c, fs, v: 1 }); }
function rcPintaFlota(x, L, dt) {
  for (const f of L) {
    f.v -= dt * .9; f.y -= 46 * dt;
    x.save(); x.globalAlpha = rcClamp(f.v * 1.6, 0, 1); x.font = `700 ${f.fs}px ${RC_F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 5; x.strokeStyle = 'rgba(0,0,0,.55)'; x.strokeText(f.t, f.x, f.y);
    x.fillStyle = f.c; x.shadowColor = f.c; x.shadowBlur = 12; x.fillText(f.t, f.x, f.y); x.restore();
  }
  for (let i = L.length - 1; i >= 0; i--) if (L[i].v <= 0) L.splice(i, 1);
}
/* cartel con texto (palabra / sílaba) */
function rcCartel(x, txt, cx, cy, fs, o = {}) {
  txt = rcTx(txt);
  x.save(); x.font = `700 ${fs}px ${RC_F}`;
  const w = Math.max(fs * 1.5, x.measureText(txt).width + fs * .9), h = fs * 1.5;
  x.shadowColor = o.glow || 'rgba(0,0,0,.5)'; x.shadowBlur = o.glow ? 18 : 8;
  x.fillStyle = o.bg || '#f2fbff'; rcRR(x, cx - w / 2, cy - h / 2, w, h, h * .36); x.fill(); x.shadowBlur = 0;
  if (o.borde) { x.lineWidth = 3; x.strokeStyle = o.borde; x.stroke(); }
  x.fillStyle = o.c || '#0b1633'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, cx, cy + fs * .05);
  x.restore(); return w;
}
function rcRobot(E, pose, ancho) {
  const w = el('div', 'rc-pj', robotHTML(NINO.color, pose)); w.style.width = ancho + 'px'; E.S.appendChild(w);
  requestAnimationFrame(() => { try { decora(w.querySelector('.robot')); } catch (e) {} });
  w._h = 0; w.pon = (cx, cy, rot = 0) => { if (!w._h) w._h = w.offsetHeight; w.style.transform = `translate(${cx - ancho / 2}px, ${cy - (w._h || ancho) / 2}px) rotate(${rot}rad)`; };
  const img = w.querySelector('img'); if (img) img.addEventListener('load', () => { w._h = w.offsetHeight; });
  return w;
}
function rcSacude(E) { E.S.classList.remove('rc-sacude'); void E.S.offsetWidth; E.S.classList.add('rc-sacude'); }
function rcOtros(arr, ok, n, igual = (a, b) => a === b) { return ENG.shuffle(arr.filter(o => !igual(o, ok))).slice(0, n); }
function rcEstrella(x, r, ri = .45) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * ri : r; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); }
function rcRoca(n = 11) { return Array.from({ length: n }, (_, i) => ({ a: i / n * Math.PI * 2, r: .82 + Math.random() * .22 })); }
function rcPintaRoca(x, forma, r, c1 = '#8b7a6b', c2 = '#3b2f2a') {
  const g = x.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r * 1.1); g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g; x.beginPath(); forma.forEach((p, i) => { const X = Math.cos(p.a) * r * p.r, Y = Math.sin(p.a) * r * p.r; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); x.fill();
  x.fillStyle = 'rgba(0,0,0,.22)';
  [[-.3, -.2, .2], [.35, .25, .16], [.1, -.45, .11], [-.25, .4, .12]].forEach(([a, b, c]) => { x.beginPath(); x.arc(a * r, b * r, c * r, 0, 7); x.fill(); });
}
/* reto matemático del recreo en la cabecera (operación o número oído) */
function rcCab(sel, rt) {
  const z = $(sel); if (!z) return;
  if (rt.oral) { z.innerHTML = `<button class="rc-oir">🔊</button>`; z.firstChild.onclick = () => VOZ.decir(rt.voz, { rate: .85 }); }
  else z.innerHTML = `<span class="rc-opx">${rt.t}</span>`;
  VOZ.decir(rt.voz, { rate: .9, cola: true });
}
const rcFin = (txt, pts) => Math.min(25, 5 + Math.round(pts / 10));

/* =====================================================================
   5 · GARRA ESPACIAL — la garra oscila, toca para lanzarla
   ===================================================================== */
function juegoGarra() {
  const lv = nivelActual(); let rt = null;
  const E = rcEscena(`<span>⏱️ <b id="gaT">75</b></span><span class="rc-obj" id="gaObj"></span><span>⭐ <b id="gaP">0</b></span>`);
  const { x } = E, est = rcEstrellas(60), L = [];
  let t = 75, pts = 0, combo = 0, vivo = true, aciertos = 0, fase = 0, ang = 0, len = 34, estado = 'osc', carga = null, obj = null, ult = null, rocas = [], diana = null;
  const LMIN = 34, anchoPj = Math.min(80, E.W * .2);
  const pj = rcRobot(E, 'vuela', anchoPj);
  const O = () => ({ x: E.W / 2, y: 92 });
  const vOsc = 1.5 + (NINO.edad >= 7 ? .45 : NINO.edad <= 5 ? -.25 : 0);
  const lbl = o => String(o);
  const radio = s => rcClamp(30 + rcTx(s).length * 5, 36, 50) * (E.W < 360 ? .9 : 1);

  function hueco(r) {
    const o = O();
    for (let k = 0; k < 80; k++) {
      const px = r + 8 + Math.random() * (E.W - 2 * r - 16), py = o.y + 70 + r + Math.random() * (E.H - o.y - 80 - 2 * r);
      if (rocas.every(m => Math.hypot(m.x - px, m.y - py) > m.r + r + 12)) return { x: px, y: py };
    }
    return null;
  }
  function nuevaRoca(bonus) {
    const r = bonus ? 26 : 40, p = hueco(r); if (!p) return;
    rocas.push({ ...p, r, l: '', bonus: !!bonus, forma: rcRoca(), rot: Math.random() * 6, vr: (Math.random() - .5) * .6, f: Math.random() * 7, ap: 0, flash: 0 });
  }
  function reetiqueta() {
    rt = retoRecreo(lv); const ok = rt.r;
    ult = ok; obj = ok;
    const normales = rocas.filter(m => !m.bonus), otros = malasRecreo(ok, normales.length);
    const iOk = Math.floor(Math.random() * normales.length);
    normales.forEach((m, i) => { const v = i === iOk ? ok : otros[i > iOk ? i - 1 : i] || ok + 11 + i; m.v = v; m.l = lbl(v); m.flash = 1; m.r = radio(m.l); });
    /* si alguna roca crece y pisa a otra, se recoloca */
    normales.forEach(m => { if (rocas.some(n => n !== m && Math.hypot(n.x - m.x, n.y - m.y) < n.r + m.r + 6)) { const ow = rocas.indexOf(m); rocas.splice(ow, 1); const p = hueco(m.r); if (p) { m.x = p.x; m.y = p.y; } rocas.push(m); } });
    rcCab('#gaObj', rt);
  }
  /* El niño toca el meteorito que quiere: la garra apunta sola hacia él y solo coge ese (atraviesa los demás).
     Si toca en un hueco, la garra baja hacia donde ha tocado. */
  E.S.onpointerdown = e => {
    if (!vivo || estado !== 'osc') return;
    const o = O();
    if (e && e.clientX != null) {
      const r = E.S.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const m = rocas.filter(m => m.ap > .5).sort((a, b) => Math.hypot(a.x - px, a.y - py) - Math.hypot(b.x - px, b.y - py))[0];
      if (m && Math.hypot(m.x - px, m.y - py) < m.r + 22) { diana = m; ang = Math.atan2(m.x - o.x, m.y - o.y); }
      else if (py > o.y + 10) { diana = null; ang = Math.atan2(px - o.x, py - o.y); }
      else diana = null;
    }
    estado = 'baja'; SFX.woosh();
  };
  const tecla = e => { if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); E.S.onpointerdown(); } };
  document.addEventListener('keydown', tecla);

  function resuelve(m) {
    const o = O();
    rocas.splice(rocas.indexOf(m), 1);
    if (m.bonus) { t += 5; pts += 5; SFX.moneda(); rcFlota(L, '+5 s', o.x, o.y + 30, '#18e0ff'); rcChispas(E, o.x, o.y + 20, 20, '#18e0ff'); return; }
    if (m.l === lbl(obj)) {
      aciertos++; combo++; const p = 10 + Math.min(combo, 5) * 2; pts += p; SFX.ok(); rcChispas(E, o.x, o.y + 30, 26); rcFlota(L, '+' + p, o.x, o.y + 40);
      VOZ.decir(rt.oral ? String(obj) : rt.voz + ', ' + obj, { rate: .95 });
    } else {
      combo = 0; t = Math.max(0, t - 3); SFX.mal(); rcSacude(E); rcFlota(L, '-3 s', o.x, o.y + 40, '#ff4d5e');
      VOZ.decir('Ese era el ' + m.l + '. Busca el ' + obj + '.', { rate: .9 });
    }
    $('#gaP').textContent = pts;
    nuevaRoca(); if (!rocas.some(r => r.bonus) && Math.random() < .25) nuevaRoca(true);
    reetiqueta();
  }
  function bucle(dt, tt) {
    const W = E.W, H = E.H, o = O();
    if (vivo) { t -= dt; $('#gaT').textContent = Math.max(0, Math.ceil(t)); if (t <= 0) acabar(); }
    rcFondo(E, est, 0, tt, '#0a0f2e', '#24103f');
    /* suelo lunar */
    const sg = x.createLinearGradient(0, H - 40, 0, H); sg.addColorStop(0, 'rgba(139,92,255,0)'); sg.addColorStop(1, 'rgba(139,92,255,.25)'); x.fillStyle = sg; x.fillRect(0, H - 40, W, 40);
    /* rocas */
    for (const m of rocas) {
      if (m === carga) continue;
      m.ap = Math.min(1, m.ap + dt * 3); m.rot += m.vr * dt; m.flash = Math.max(0, m.flash - dt * 2);
      const fy = Math.sin(tt * 1.5 + m.f) * 3, s = m.ap < 1 ? m.ap * (1.2 - .2 * m.ap) : 1;
      x.save(); x.translate(m.x, m.y + fy); x.scale(s, s);
      if (m.bonus) { x.rotate(tt); x.fillStyle = '#18e0ff'; x.shadowColor = '#18e0ff'; x.shadowBlur = 20; rcEstrella(x, m.r, .5); x.fill(); x.rotate(-tt); x.shadowBlur = 0; x.fillStyle = '#05203a'; x.font = `700 15px ${RC_F}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('+5s', 0, 1); }
      else {
        x.save(); x.rotate(m.rot); if (m.flash > 0) { x.shadowColor = '#fff'; x.shadowBlur = 30 * m.flash; } rcPintaRoca(x, m.forma, m.r, '#9a8bb0', '#3a2d55'); x.restore();
        rcCartel(x, m.l, 0, 0, rcClamp(m.r * .48, 15, 22), { bg: 'rgba(242,251,255,.95)' });
      }
      x.restore();
    }
    /* garra */
    if (vivo) {
      if (estado === 'osc') { fase += dt * vOsc; ang = Math.sin(fase) * 1.15; }
      else if (estado === 'baja') {
        len += (430 + (NINO.edad >= 7 ? 60 : 0)) * dt;
        const tx = o.x + Math.sin(ang) * len, ty = o.y + Math.cos(ang) * len;
        const m = diana ? (Math.hypot(diana.x - tx, diana.y - ty) < diana.r + 6 ? diana : null) : rocas.find(m => Math.hypot(m.x - tx, m.y - ty) < m.r + 6);
        if (m) { carga = m; estado = 'sube'; SFX.pop(); }
        else if (tx < -10 || tx > W + 10 || ty > H + 10) estado = 'sube';
      } else if (estado === 'sube') {
        len -= (carga ? (carga.bonus ? 520 : rcClamp(560 - carga.r * 7, 200, 420)) : 640) * dt;
        if (len <= LMIN) { len = LMIN; estado = 'osc'; diana = null; fase = Math.asin(rcClamp(ang / 1.15, -1, 1)); if (carga) { const c = carga; carga = null; resuelve(c); } }
      }
    }
    const tx = o.x + Math.sin(ang) * len, ty = o.y + Math.cos(ang) * len;
    if (estado === 'osc' && vivo) { x.save(); x.strokeStyle = 'rgba(23,255,95,.25)'; x.setLineDash([6, 10]); x.lineWidth = 2; x.beginPath(); x.moveTo(tx, ty); x.lineTo(o.x + Math.sin(ang) * 2000, o.y + Math.cos(ang) * 2000); x.stroke(); x.restore(); }
    x.strokeStyle = '#a9c3d9'; x.lineWidth = 3; x.shadowColor = '#18e0ff'; x.shadowBlur = 6; x.beginPath(); x.moveTo(o.x, o.y); x.lineTo(tx, ty); x.stroke(); x.shadowBlur = 0;
    x.fillStyle = '#5b6b85'; x.beginPath(); x.arc(o.x, o.y, 8, 0, 7); x.fill(); x.fillStyle = '#18e0ff'; x.beginPath(); x.arc(o.x, o.y, 3, 0, 7); x.fill();
    if (carga) { const cx = o.x + Math.sin(ang) * (len + carga.r * .8), cy = o.y + Math.cos(ang) * (len + carga.r * .8); carga.x = cx; carga.y = cy; x.save(); x.translate(cx, cy); if (carga.bonus) { x.fillStyle = '#18e0ff'; x.shadowColor = '#18e0ff'; x.shadowBlur = 20; rcEstrella(x, carga.r, .5); x.fill(); } else { x.save(); x.rotate(carga.rot); rcPintaRoca(x, carga.forma, carga.r, '#9a8bb0', '#3a2d55'); x.restore(); rcCartel(x, carga.l, 0, 0, rcClamp(carga.r * .48, 15, 22)); } x.restore(); }
    const ab = estado === 'baja' ? .75 : carga ? .25 : .5 + Math.sin(tt * 4) * .08;
    x.save(); x.translate(tx, ty); x.rotate(-ang);
    x.strokeStyle = '#d7e6f5'; x.lineWidth = 5; x.lineCap = 'round'; x.shadowColor = '#18e0ff'; x.shadowBlur = 10;
    [-1, 1].forEach(sg2 => { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(sg2 * 20 * ab + sg2 * 6, 10, sg2 * 10 * ab, 24); x.stroke(); });
    x.fillStyle = '#7d8fa8'; x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fill(); x.restore();
    rcPintaFlota(x, L, dt);
    pj.pon(o.x, o.y - 46 + Math.sin(tt * 3) * 3, Math.sin(ang) * .12);
  }
  for (let i = 0; i < 6; i++) nuevaRoca();
  reetiqueta();
  const para = rcBucle(E, bucle);
  function acabar(salir) {
    if (!vivo) return; vivo = false; REC.fin = null; document.removeEventListener('keydown', tecla); E.quita();
    if (salir) { para(); return; }
    setTimeout(() => { para(); finJuego('garra', pts, aciertos >= 12 ? '¡Eres el rey de la garra!' : aciertos >= 6 ? '¡Gran pesca espacial!' : '¡Buen intento!', rcFin('', pts)); }, 500);
  }
  E.alPerder = () => acabar(true);
  REC.fin = () => acabar(true);
  VOZ.decir('Toca el meteorito que tiene el resultado correcto y la garra irá a por él.');
}

/* =====================================================================
   7 · MARCIANOS DEL CRÁTER — 3 rondas + jefe final
   ===================================================================== */
function juegoMarcianos() {
  const lv = nivelActual(), peque = lv < 4, cfgM = ENG.cfgDe(lv), hiN = Math.min(peque ? 10 : 20, Math.max(5, cfgM.hi || 10));
  const RONDAS = peque ? [{ tipo: 'num', d: 20 }, { tipo: 'oido', d: 20 }, { tipo: 'num', d: 20 }, { tipo: 'jefe', d: 35 }]
    : [{ tipo: 'op', d: 20 }, { tipo: lv >= 8 ? 'pares' : 'mayor', d: 20 }, { tipo: 'op', d: 20 }, { tipo: 'jefe', d: 35 }];
  const E = rcEscena(`<span>⏱️ <b id="maT">20</b></span><span class="rc-obj" id="maObj"></span><span>⭐ <b id="maP">0</b></span>`);
  const { x } = E, est = rcEstrellas(40), L = [], anillos = [];
  let ronda = -1, tR = 0, pts = 0, combo = 0, vivo = true, banner = null, spawnT = 0, objetivo = null, ultObj = null, buenosObj = 0, desdeBueno = 0;
  const huecos = Array(9).fill(null);
  const COLS = [['#7dff6b', '#1f8a2a'], ['#c08bff', '#5a2a9a'], ['#5ff0ff', '#126b8a'], ['#ff8fd0', '#9a2a6b'], ['#ffd25f', '#9a6b12']];
  const quedarse = () => (NINO.edad <= 5 ? 2.5 : NINO.edad === 6 ? 2.1 : 1.75) - ronda * .12;
  let jefe = null;

  const geo = i => { const c = i % 3, r = Math.floor(i / 3), W = E.W, H = E.H, top = H * .2, alto = H * .78; const w = Math.min(W / 3 * .82, alto / 3 * 1.05); return { x: W * (c + .5) / 3, y: top + alto * (r + .78) / 3, w }; };
  const lbl = v => String(v);
  /* objetivo: { r, t, voz, oral } (número u operación) · en «pares» y «mayor» es una regla */
  function nuevoObjetivo() {
    const R = RONDAS[ronda];
    if (R.tipo === 'num' || R.tipo === 'oido') { let n; do { n = ENG.ent(1, hiN); } while (ultObj && n === ultObj.r); objetivo = { r: n, t: String(n), voz: String(n), oral: R.tipo === 'oido' }; }
    else if (R.tipo === 'op' || R.tipo === 'jefe') { let rt; do { rt = retoRecreo(lv); } while (ultObj && rt.r === ultObj.r && Math.random() < .8); objetivo = rt; }
    else if (R.tipo === 'mayor') objetivo = { n: ENG.ent(2, hiN - 3) };
    else objetivo = {};
    ultObj = objetivo; buenosObj = 0;
    pintaObj();
  }
  function pintaObj() {
    const R = RONDAS[ronda];
    if (R.tipo === 'pares') { $('#maObj').innerHTML = `<span class="rc-regla">🎯 PARES 2 4 6…</span>`; return; }
    if (R.tipo === 'mayor') { $('#maObj').innerHTML = `<span class="rc-regla">🎯 más de ${objetivo.n}</span>`; VOZ.decir('Golpea los marcianos con números más grandes que el ' + objetivo.n + '.', { cola: true }); return; }
    rcCab('#maObj', objetivo);
  }
  function empiezaRonda(n) {
    ronda = n; tR = RONDAS[n].d; $('#maT').textContent = tR; huecos.fill(null); combo = 0; desdeBueno = 0;
    const R = RONDAS[n];
    banner = { t: R.tipo === 'jefe' ? '¡JEFE FINAL!' : 'RONDA ' + (n + 1), v: 2 };
    SFX.planeta();
    let txt;
    if (R.tipo === 'num') { VOZ.decir('¡Ronda ' + (n + 1) + '! Golpea a los marcianos que llevan el número:'); nuevoObjetivo(); }
    else if (R.tipo === 'oido') { VOZ.decir('¡Ronda ' + (n + 1) + '! Escucha a Lucas y golpea a los marcianos con el número que dice:'); nuevoObjetivo(); }
    else if (R.tipo === 'op') { VOZ.decir('¡Ronda ' + (n + 1) + '! Golpea a los marcianos que llevan el resultado.'); nuevoObjetivo(); }
    else if (R.tipo === 'pares') { VOZ.decir('¡Ronda ' + (n + 1) + '! Golpea solo a los marcianos con números pares: dos, cuatro, seis, ocho…'); nuevoObjetivo(); }
    else if (R.tipo === 'mayor') { VOZ.decir('¡Ronda ' + (n + 1) + '!'); nuevoObjetivo(); }
    else { jefe = { hp: 5, sac: 0, risa: 0, ops: [], ay: 0 }; VOZ.decir('¡Cuidado, llega el rey marciano! Toca la burbuja con el resultado para lanzarle un rayo.'); opsJefe(); }
    spawnT = 1.6;
  }
  function opsJefe() {
    nuevoObjetivo();
    jefe.ops = ENG.shuffle([objetivo.r, ...malasRecreo(objetivo.r, 2)]).map(v => ({ v, mal: 0 }));
  }
  function crea(i) {
    const R = RONDAS[ronda];
    const oro = Math.random() < .06;
    let bueno = Math.random() < .45 || desdeBueno >= 2, v;
    const top = lv >= 12 ? 99 : 20;
    if (R.tipo === 'pares') { v = ENG.ent(1, top); if ((v % 2 === 0) !== bueno) v += 1; }
    else if (R.tipo === 'mayor') v = bueno ? ENG.ent(objetivo.n + 1, Math.min(hiN, objetivo.n + 6)) : ENG.ent(Math.max(0, objetivo.n - 5), objetivo.n);
    else v = bueno ? objetivo.r : pick(malasRecreo(objetivo.r, 4));
    desdeBueno = bueno ? 0 : desdeBueno + 1;
    const [c1, c2] = pick(COLS);
    huecos[i] = { e: 'sube', p: 0, vida: quedarse(), v, bueno, oro, c1, c2, ojos: 1 + Math.floor(Math.random() * 3), parp: Math.random() * 3, gest: 0 };
  }
  E.S.onpointerdown = e => {
    if (!vivo || banner) return;
    const r = E.S.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    anillos.push({ x: px, y: py, v: 1 });
    if (RONDAS[ronda].tipo === 'jefe') return tocaJefe(px, py);
    for (let i = 0; i < 9; i++) {
      const a = huecos[i]; if (!a || !(a.e === 'sube' || a.e === 'arriba')) continue;
      const g = geo(i), alto = g.w * 1.05;
      if (px > g.x - g.w * .5 && px < g.x + g.w * .5 && py > g.y - alto * a.p - 10 && py < g.y + g.w * .2) { golpea(i, a, g); return; }
    }
  };
  function golpea(i, a, g) {
    if (a.oro) { a.e = 'golpe'; a.gest = 0; pts += 25; SFX.moneda(); SFX.ok(); rcChispas(E, g.x, g.y - g.w * .5, 30, '#ffd23f'); rcFlota(L, '⭐ +25', g.x, g.y - g.w, '#ffd23f', 28); }
    else if (a.bueno) {
      combo++; const p = 10 * Math.min(5, Math.max(1, Math.ceil(combo / 2))); pts += p; a.e = 'golpe'; a.gest = 0;
      SFX.pop(); SFX.ok(); rcChispas(E, g.x, g.y - g.w * .5, 20); rcFlota(L, '¡PAM! +' + p, g.x, g.y - g.w, '#17ff5f', 24);
      if (['num', 'oido', 'op'].includes(RONDAS[ronda].tipo)) { buenosObj++; if (buenosObj >= 3) { huecos.forEach((h, k) => { if (h && h.e !== 'golpe') h.e = 'baja'; }); setTimeout(() => { if (vivo && !banner) nuevoObjetivo(); }, 400); } }
    } else {
      combo = 0; pts = Math.max(0, pts - 5); a.e = 'risa'; a.gest = 0; SFX.mal(); rcFlota(L, '¡JA, JA!', g.x, g.y - g.w, '#ff4d5e', 22);
      VOZ.decir('Ese es el ' + a.v + '.', { rate: .9 });
    }
    $('#maP').textContent = pts;
  }
  function geoJefe() { const W = E.W, H = E.H, s = Math.min(W * .62, H * .42); return { x: W / 2, y: H * .36, s, by: H * .82 }; }
  function posOp(k) { const g = geoJefe(), W = E.W; return { x: W * (k + .5) / 3, y: g.by }; }
  function tocaJefe(px, py) {
    if (!jefe || jefe.hp <= 0) return;
    for (let k = 0; k < jefe.ops.length; k++) {
      const p = posOp(k), o = jefe.ops[k];
      if (Math.abs(px - p.x) < E.W / 6 && Math.abs(py - p.y) < 44) {
        if (o.v === objetivo.r) {
          jefe.hp--; jefe.sac = .5; jefe.rayo = { x: p.x, y: p.y, v: .35 }; combo++; pts += 20; $('#maP').textContent = pts;
          SFX.woosh(); SFX.ok(); const g = geoJefe(); rcChispas(E, g.x, g.y, 30, '#18e0ff'); rcFlota(L, '¡ZAS! +20', g.x, g.y - g.s * .6, '#18e0ff', 28);
          if (jefe.hp <= 0) { pts += 50; $('#maP').textContent = pts; FX.confeti(140); SFX.fanfarria(); VOZ.decir('¡Has vencido al rey marciano!'); setTimeout(() => acabar(true), 1600); }
          else setTimeout(() => { if (vivo && jefe && jefe.hp > 0) opsJefe(); }, 450);
        } else { o.mal = .5; jefe.risa = 1; combo = 0; SFX.mal(); rcFlota(L, '¡JA, JA, JA!', geoJefe().x, geoJefe().y - geoJefe().s * .6, '#ff4d5e', 24); VOZ.decir('Ese es el ' + o.v + '.', { rate: .9 }); }
        return;
      }
    }
  }
  /* dibujo de un marciano */
  function pintaMarciano(cx, by, w, a, tt) {
    const h = w * 1.0, top = by - h * a.p;
    x.save();
    const g = x.createRadialGradient(cx - w * .15, top + h * .3, 2, cx, top + h * .5, w * .6); g.addColorStop(0, a.oro ? '#fff2b0' : a.c1); g.addColorStop(1, a.oro ? '#c98a00' : a.c2);
    /* antenas */
    x.strokeStyle = a.oro ? '#ffd23f' : a.c2; x.lineWidth = 3;
    [-1, 1].forEach(s => { x.beginPath(); x.moveTo(cx + s * w * .15, top + h * .12); x.quadraticCurveTo(cx + s * w * .3, top - h * .05, cx + s * w * .28 + Math.sin(tt * 4 + s) * 3, top - h * .1); x.stroke(); x.fillStyle = a.oro ? '#fff' : '#ffd23f'; x.shadowColor = '#ffd23f'; x.shadowBlur = 10; x.beginPath(); x.arc(cx + s * w * .28 + Math.sin(tt * 4 + s) * 3, top - h * .1, w * .05, 0, 7); x.fill(); x.shadowBlur = 0; });
    const sq = a.e === 'golpe' ? 1 - Math.min(.25, a.gest * 1.2) : 1;
    x.translate(cx, top + h * .5); x.scale(1 / sq * (a.e === 'golpe' ? 1 : 1), sq); x.translate(-cx, -(top + h * .5));
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, top + h * .5, w * .38, h * .5, 0, 0, 7); x.fill();
    /* ojos */
    const oy2 = top + h * .22, n = a.ojos, parp = ((tt + a.parp) % 3.2) < .12;
    for (let k = 0; k < n; k++) {
      const ox = cx + (n === 1 ? 0 : (k - (n - 1) / 2) * w * .2), r = n === 1 ? w * .13 : w * .085;
      if (a.e === 'golpe') { x.strokeStyle = '#1a0b3d'; x.lineWidth = 3; x.beginPath(); x.moveTo(ox - r * .7, oy2 - r * .7); x.lineTo(ox + r * .7, oy2 + r * .7); x.moveTo(ox + r * .7, oy2 - r * .7); x.lineTo(ox - r * .7, oy2 + r * .7); x.stroke(); continue; }
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ox, oy2, r, parp ? r * .15 : r, 0, 0, 7); x.fill();
      if (!parp) { x.fillStyle = '#1a0b3d'; x.beginPath(); x.arc(ox + Math.sin(tt * 1.3 + k) * r * .3, oy2 + r * .15, r * .5, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ox - r * .15, oy2 - r * .1, r * .16, 0, 7); x.fill(); }
    }
    /* boca */
    x.strokeStyle = '#1a0b3d'; x.lineWidth = 2.5; x.fillStyle = '#5a0f2e';
    if (a.e === 'risa') { x.beginPath(); x.ellipse(cx, top + h * .37, w * .1, w * .07, 0, 0, 7); x.fill(); }
    else { x.beginPath(); x.arc(cx, top + h * .32, w * .08, .2, Math.PI - .2); x.stroke(); }
    /* cartel en la barriga */
    if (a.oro) { x.save(); x.translate(cx, top + h * .56); x.fillStyle = '#fff'; x.shadowColor = '#ffd23f'; x.shadowBlur = 16; rcEstrella(x, w * .14); x.fill(); x.restore(); }
    else rcCartel(x, String(a.v), cx, top + h * .56, rcClamp(w * (lbl(a.v).length > 5 ? .15 : .19), 13, 24), { bg: '#f2fbff' });
    if (a.e === 'golpe') { for (let k = 0; k < 3; k++) { const an = tt * 5 + k * 2.1; x.save(); x.translate(cx + Math.cos(an) * w * .3, top + Math.sin(an) * h * .08 + h * .02); x.fillStyle = '#ffd23f'; rcEstrella(x, w * .06); x.fill(); x.restore(); } }
    x.restore();
  }
  function pintaJefe(tt) {
    const g = geoJefe(), s = g.s, sh = jefe.sac > 0 ? Math.sin(tt * 60) * 8 * jefe.sac : 0, cx = g.x + sh, cy = g.y + Math.sin(tt * 1.6) * 6;
    /* platillo */
    x.save();
    const gp = x.createLinearGradient(0, cy, 0, cy + s * .3); gp.addColorStop(0, '#c9d6e3'); gp.addColorStop(1, '#4a5a72');
    x.fillStyle = gp; x.beginPath(); x.ellipse(cx, cy + s * .22, s * .55, s * .14, 0, 0, 7); x.fill();
    for (let k = 0; k < 7; k++) { x.fillStyle = `hsl(${(tt * 120 + k * 50) % 360},100%,65%)`; x.shadowColor = x.fillStyle; x.shadowBlur = 10; x.beginPath(); x.arc(cx + (k - 3) * s * .14, cy + s * .25, s * .025, 0, 7); x.fill(); }
    x.shadowBlur = 0;
    const a = { p: 1, e: jefe.risa > 0 ? 'risa' : 'arriba', c1: '#b0ff6b', c2: '#2f7a1a', ojos: 3, parp: 0, v: '', oro: false, gest: 0 };
    x.save(); x.beginPath(); x.rect(cx - s, cy - s, s * 2, s * 1.2); x.clip();
    /* cuerpo sin cartel */
    const h = s * .62, top = cy + s * .2 - h, w = s * .62;
    const gg = x.createRadialGradient(cx - w * .15, top + h * .3, 2, cx, top + h * .5, w * .6); gg.addColorStop(0, a.c1); gg.addColorStop(1, a.c2);
    x.fillStyle = gg; x.beginPath(); x.ellipse(cx, top + h * .5, w * .42, h * .5, 0, 0, 7); x.fill();
    /* corona */
    x.fillStyle = '#ffd23f'; x.shadowColor = '#ffb000'; x.shadowBlur = 14; x.beginPath(); x.moveTo(cx - w * .22, top + h * .06); [-.22, -.11, 0, .11, .22].forEach((k, i) => { x.lineTo(cx + k * w, top - h * (i % 2 ? .02 : .2)); }); x.lineTo(cx + w * .22, top + h * .06); x.closePath(); x.fill(); x.shadowBlur = 0;
    for (let k = 0; k < 3; k++) { const ox = cx + (k - 1) * w * .2, oy2 = top + h * .32, r = w * .08; x.fillStyle = '#fff'; x.beginPath(); x.arc(ox, oy2, r, 0, 7); x.fill(); x.fillStyle = jefe.sac > 0 ? '#ff4d5e' : '#1a0b3d'; x.beginPath(); x.arc(ox, oy2 + r * .1, r * .5, 0, 7); x.fill(); }
    x.fillStyle = '#5a0f2e'; x.beginPath(); if (jefe.risa > 0) x.ellipse(cx, top + h * .62, w * .14, w * .1, 0, 0, 7); else x.ellipse(cx, top + h * .6, w * .12, w * .03, 0, 0, 7); x.fill();
    x.restore();
    /* cúpula */
    x.fillStyle = 'rgba(180,240,255,.18)'; x.strokeStyle = 'rgba(180,240,255,.6)'; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy + s * .2, s * .34, s * .5, 0, Math.PI, 0); x.fill(); x.stroke();
    x.restore();
    /* vida */
    const bw = Math.min(220, E.W * .6); x.fillStyle = 'rgba(255,255,255,.15)'; rcRR(x, E.W / 2 - bw / 2, E.H * .06, bw, 14, 7); x.fill();
    x.fillStyle = '#ff4d5e'; x.shadowColor = '#ff4d5e'; x.shadowBlur = 10; rcRR(x, E.W / 2 - bw / 2, E.H * .06, bw * jefe.hp / 5, 14, 7); x.fill(); x.shadowBlur = 0;
    x.font = `700 13px ${RC_F}`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillText('REY MARCIANO', E.W / 2, E.H * .06 - 3);
    /* rayo */
    if (jefe.rayo && jefe.rayo.v > 0) { const r = jefe.rayo; x.save(); x.globalAlpha = r.v / .35; x.strokeStyle = '#18e0ff'; x.shadowColor = '#18e0ff'; x.shadowBlur = 24; x.lineWidth = 8; x.beginPath(); x.moveTo(r.x, r.y - 30); x.lineTo(g.x, g.y); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 3; x.stroke(); x.restore(); }
    /* burbujas de respuesta */
    jefe.ops.forEach((o, k) => {
      const p = posOp(k), sx = o.mal > 0 ? Math.sin(tt * 50) * 6 : 0;
      rcCartel(x, String(o.v), p.x + sx, p.y + Math.sin(tt * 2 + k) * 3, 30, { bg: o.mal > 0 ? '#ffd0d5' : '#f2fbff', borde: o.mal > 0 ? '#ff4d5e' : '#18e0ff', glow: '#18e0ff' });
    });
  }
  function bucle(dt, tt) {
    const W = E.W, H = E.H;
    /* tiempo y rondas */
    if (vivo && !banner && ronda >= 0) {
      tR -= dt; $('#maT').textContent = Math.max(0, Math.ceil(tR));
      if (tR <= 0) { if (ronda < RONDAS.length - 1) empiezaRonda(ronda + 1); else acabar(false); }
    }
    if (banner) { banner.v -= dt; if (banner.v <= 0) banner = null; }
    /* fondo: cielo + suelo lunar */
    rcFondo(E, est, 0, tt, '#0b0f30', '#2a1450');
    const sg = x.createLinearGradient(0, H * .16, 0, H); sg.addColorStop(0, '#3b2d63'); sg.addColorStop(1, '#1b1338');
    x.fillStyle = sg; x.beginPath(); x.moveTo(0, H * .2); for (let i = 0; i <= 10; i++) x.lineTo(W * i / 10, H * .17 + Math.sin(i * 1.7) * 8); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill();
    if (RONDAS[ronda] && RONDAS[ronda].tipo === 'jefe' && jefe) {
      if (jefe.sac > 0) jefe.sac -= dt; if (jefe.risa > 0) jefe.risa -= dt; if (jefe.rayo) jefe.rayo.v -= dt; jefe.ops.forEach(o => { if (o.mal > 0) o.mal -= dt; });
      pintaJefe(tt);
    } else {
      /* aparición de marcianos */
      if (vivo && !banner && ronda >= 0) {
        spawnT -= dt;
        const maxAct = Math.min(4, 2 + ronda + (NINO.edad >= 7 ? 1 : 0)), act = huecos.filter(Boolean).length;
        if (spawnT <= 0 && act < maxAct) { const libres = huecos.map((h, i) => h ? -1 : i).filter(i => i >= 0); if (libres.length) crea(pick(libres)); spawnT = Math.max(.45, .95 - ronda * .15) * (.7 + Math.random() * .6); }
      }
      for (let i = 0; i < 9; i++) {
        const g = geo(i), a = huecos[i];
        /* cráter (parte de atrás) */
        x.fillStyle = '#120a28'; x.beginPath(); x.ellipse(g.x, g.y, g.w * .46, g.w * .15, 0, 0, 7); x.fill();
        x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(g.x, g.y + 2, g.w * .4, g.w * .1, 0, 0, 7); x.fill();
        if (a) {
          if (a.e === 'sube') { a.p = Math.min(1, a.p + dt * 5); if (a.p >= 1) a.e = 'arriba'; }
          else if (a.e === 'arriba') { a.vida -= dt; if (a.vida <= 0) { a.e = 'baja'; if (a.bueno && !a.oro) combo = 0; } }
          else if (a.e === 'baja') { a.p -= dt * 4; if (a.p <= 0) huecos[i] = null; }
          else { a.gest += dt; if (a.gest > .55) { a.p -= dt * 4; if (a.p <= 0) huecos[i] = null; } }
          if (huecos[i]) { x.save(); x.beginPath(); x.rect(g.x - g.w, 0, g.w * 2, g.y); x.clip(); pintaMarciano(g.x, g.y + g.w * .06, g.w * .92, a, tt); x.restore(); }
        }
        /* borde delantero del cráter */
        x.strokeStyle = '#6e5aa8'; x.lineWidth = 4; x.beginPath(); x.ellipse(g.x, g.y, g.w * .46, g.w * .15, 0, 0, Math.PI); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 2; x.beginPath(); x.ellipse(g.x, g.y - 1, g.w * .46, g.w * .15, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      }
    }
    /* anillos de toque */
    for (const r of anillos) { r.v -= dt * 3; x.strokeStyle = `rgba(255,255,255,${Math.max(0, r.v)})`; x.lineWidth = 3; x.beginPath(); x.arc(r.x, r.y, (1 - r.v) * 34 + 6, 0, 7); x.stroke(); }
    for (let i = anillos.length - 1; i >= 0; i--) if (anillos[i].v <= 0) anillos.splice(i, 1);
    if (combo >= 3) { x.font = `700 18px ${RC_F}`; x.fillStyle = '#ffd23f'; x.textAlign = 'left'; x.textBaseline = 'top'; x.shadowColor = '#ffb000'; x.shadowBlur = 10; x.fillText('🔥 COMBO x' + Math.min(5, Math.ceil(combo / 2)), 12, 10); x.shadowBlur = 0; }
    rcPintaFlota(x, L, dt);
    if (banner) {
      const k = Math.min(1, (2 - banner.v) * 4), al = Math.min(1, banner.v * 2);
      x.save(); x.globalAlpha = al; x.fillStyle = 'rgba(5,10,26,.55)'; x.fillRect(0, 0, W, H);
      x.translate(W / 2, H / 2); x.scale(.6 + .4 * k, .6 + .4 * k); x.font = `400 ${Math.min(54, W * .13)}px "Lilita One", ${RC_F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 8; x.strokeStyle = '#1a0b3d'; x.strokeText(banner.t, 0, 0); x.fillStyle = banner.t.includes('JEFE') ? '#ff4d5e' : '#17ff5f'; x.shadowColor = x.fillStyle; x.shadowBlur = 24; x.fillText(banner.t, 0, 0); x.restore();
    }
  }
  const para = rcBucle(E, bucle);
  function acabar(gano, salir) {
    if (!vivo) return; vivo = false; REC.fin = null; E.quita();
    if (salir) { para(); return; }
    setTimeout(() => { para(); finJuego('marcianos', pts, gano ? '¡Has vencido al rey marciano!' : pts >= 150 ? '¡Menuda puntería, cazamarcianos!' : '¡Buen intento!', rcFin('', pts) + (gano ? 5 : 0)); }, gano ? 200 : 700);
  }
  E.alPerder = () => acabar(false, true);
  REC.fin = () => acabar(false, true);
  empiezaRonda(0);
}
