/* =====================================================================
   LOS NÚMEROS DE LUCAS · Extras: Taller de Lucas, Recreo (minijuegos) y Diplomas
   ===================================================================== */
'use strict';

/* ---------------- CATÁLOGO DEL TALLER ---------------- */
const TALLER = {
  mas: { t: 'Mascotas', i: '🐾', items: [
    { id: 'estrella', e: '⭐', n: 'Estrellita', p: 50 }, { id: 'perro', e: '🐶', n: 'Perrito', p: 60 }, { id: 'gato', e: '🐱', n: 'Gatito', p: 60 },
    { id: 'pollito', e: '🐥', n: 'Pollito', p: 70 }, { id: 'mariposa', e: '🦋', n: 'Mariposa', p: 90 }, { id: 'buho', e: '🦉', n: 'Búho', p: 100 },
    { id: 'pinguino', e: '🐧', n: 'Pingüino', p: 100 }, { id: 'panda', e: '🐼', n: 'Panda', p: 120 }, { id: 'zorro', e: '🦊', n: 'Zorrito', p: 120 },
    { id: 'pulpo', e: '🐙', n: 'Pulpo', p: 150 }, { id: 'alien', e: '👽', n: 'Marcianito', p: 150 }, { id: 'ovni', e: '🛸', n: 'Ovni', p: 180 },
    { id: 'unicornio', e: '🦄', n: 'Unicornio', p: 200 }, { id: 'dino', e: '🦖', n: 'Dinosaurio', p: 220 }, { id: 'dragon', e: '🐉', n: 'Dragón', p: 250 }] },
  aura: { t: 'Auras', i: '✨', items: [
    { id: 'azul', c: '#18e0ff', n: 'Azul eléctrico', p: 50 }, { id: 'rosa', c: '#ff4fd8', n: 'Rosa neón', p: 50 }, { id: 'oro', c: '#ffd23f', n: 'Oro', p: 90 },
    { id: 'fuego', c: '#ff6a00', n: 'Fuego', p: 90 }, { id: 'morado', c: '#a66bff', n: 'Morado cósmico', p: 90 }, { id: 'blanco', c: '#ffffff', n: 'Luz de estrella', p: 120 },
    { id: 'galaxia', c: '#6a5cff', n: 'Galaxia', p: 160, anim: 1 }, { id: 'arcoiris', c: '#ff4d5e', n: 'Arcoíris', p: 220, anim: 1 }] },
  est: { t: 'Estelas', i: '☄️', items: [
    { id: 'hielo', c: ['#ffffff', '#bdf3ff', '#18e0ff'], n: 'Hielo', p: 60 }, { id: 'fuego', c: ['#ff4d00', '#ffb000', '#ffd23f'], n: 'Fuego', p: 60 },
    { id: 'arcoiris', c: ['#ff4d5e', '#ff8a3d', '#ffd23f', '#17ff5f', '#18e0ff', '#8b5cff'], n: 'Arcoíris', p: 90 },
    { id: 'estrellas', e: ['⭐', '✨', '🌟'], n: 'Estrellas', p: 140 }, { id: 'corazones', e: ['💖', '💜', '💚'], n: 'Corazones', p: 140 },
    { id: 'burbujas', e: ['🫧'], n: 'Burbujas', p: 120 }, { id: 'notas', e: ['🎵', '🎶'], n: 'Música', p: 120 }, { id: 'letras', e: ['A', 'B', 'C', 'M', 'P', 'S'], n: 'Letras', p: 160, letras: 1 }] },
  fondo: { t: 'Fondos', i: '🌌', items: [
    { id: 'nebulosa', n: 'Nebulosa rosa', p: 100, bg: 'radial-gradient(ellipse at 30% 30%, rgba(255,79,216,.28), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,255,.3), transparent 55%)' },
    { id: 'azul', n: 'Galaxia azul', p: 100, bg: 'radial-gradient(ellipse at 70% 20%, rgba(24,224,255,.25), transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(23,60,255,.3), transparent 60%)' },
    { id: 'aurora', n: 'Aurora', p: 150, bg: 'linear-gradient(170deg, rgba(23,255,95,.18), transparent 40%, rgba(24,224,255,.16) 70%, transparent), radial-gradient(ellipse at 50% 0%, rgba(139,92,255,.3), transparent 60%)' },
    { id: 'marte', n: 'Atardecer marciano', p: 150, bg: 'radial-gradient(ellipse at 50% 110%, rgba(255,106,0,.38), transparent 60%), radial-gradient(ellipse at 10% 10%, rgba(255,77,94,.22), transparent 50%)' },
    { id: 'oro', n: 'Polvo de oro', p: 180, bg: 'radial-gradient(ellipse at 50% 40%, rgba(255,210,63,.22), transparent 60%), radial-gradient(ellipse at 90% 90%, rgba(255,138,61,.2), transparent 50%)' },
    { id: 'agujero', n: 'Agujero negro', p: 220, bg: 'radial-gradient(circle at 50% 45%, #000 0 12%, rgba(255,138,61,.45) 14%, rgba(139,92,255,.25) 24%, transparent 45%)' }] }
};
function talDatos() { const d = datos(); if (!d.tal) d.tal = { own: [], mas: '', aura: '', est: '', fondo: '' }; return d.tal; }
function talItem(cat, id) { return id ? TALLER[cat].items.find(x => x.id === id) : null; }

/* Pone mascota y aura a cualquier robot (.robot) */
function decora(r) {
  if (!r || !NINO) return;
  const t = talDatos();
  r.querySelectorAll('.mascota').forEach(x => x.remove());
  const au = talItem('aura', t.aura);
  if (au) { r.dataset.aura = au.id; r.style.setProperty('--aura', au.c); } else { delete r.dataset.aura; r.style.removeProperty('--aura'); }
  const m = talItem('mas', t.mas);
  if (m) {
    const w = r.getBoundingClientRect().width || 110;
    const s = el('span', 'mascota', `<i>${m.e}</i>`);
    s.style.setProperty('--r', Math.round(w * .62) + 'px'); s.style.fontSize = Math.max(18, Math.round(w * .26)) + 'px';
    r.appendChild(s);
  }
}
function decoraTodo() { ['.nave-mapa > .robot', '#lucasNarra', '#resLucas', '#tallerRobot > .robot'].forEach(s => { const r = $(s); if (r) decora(r); }); }
function aplicaFondo() {
  const pm = $('#pMapa'); if (!pm || !NINO) return;
  const f = talItem('fondo', talDatos().fondo);
  pm.style.backgroundImage = f ? f.bg : '';   // toda la pantalla, sin cortes
  pm.style.backgroundAttachment = 'fixed'; pm.style.backgroundSize = 'cover';
}
/* estela del vuelo entre planetas (lo usa ESTELA en app.js) */
window.estelaCfg = () => { if (!NINO) return null; const e = talItem('est', talDatos().est); return e || null; };

/* ---------------- PANTALLA TALLER ---------------- */
let talCat = 'mas';
ON_PANTALLA.pTaller = () => {
  if (!NINO) { ir('perfiles'); return; }
  const R = $('#tallerRobot'); R.innerHTML = robotHTML(NINO.color, 'vuela'); R.firstChild.dataset.fuerza = '1.6';
  pintaTaller();
  requestAnimationFrame(() => decora(R.firstChild));
  VOZ.decir('¡Bienvenido a mi taller! Con tus chispas puedes comprarme mascotas, auras, estelas y fondos para el mapa.');
};
function pintaTaller() {
  const d = datos(), t = talDatos();
  $('#talChispas').textContent = d.chispas;
  $('#talTabs').innerHTML = Object.keys(TALLER).map(k => `<button class="tal-tab${k === talCat ? ' sel' : ''}" data-k="${k}">${TALLER[k].i} ${TALLER[k].t}</button>`).join('');
  $$('#talTabs .tal-tab').forEach(b => b.onclick = () => { SFX.clic(); talCat = b.dataset.k; pintaTaller(); });
  const G = $('#talItems'); G.innerHTML = '';
  TALLER[talCat].items.forEach(it => {
    const tiene = t.own.includes(talCat + ':' + it.id), puesto = t[talCat] === it.id;
    let ico;
    if (talCat === 'mas') ico = `<span class="ti-e">${it.e}</span>`;
    else if (talCat === 'aura') ico = `<span class="ti-aura${it.anim ? ' anim-' + it.id : ''}" style="--c:${it.c}"></span>`;
    else if (talCat === 'est') ico = it.e ? `<span class="ti-e peq">${it.e.slice(0, 3).join('')}</span>` : `<span class="ti-estela">${it.c.map(c => `<i style="background:${c}"></i>`).join('')}</span>`;
    else ico = `<span class="ti-fondo" style="background-image:${it.bg}"></span>`;
    const b = el('button', 'tal-item' + (tiene ? ' tiene' : '') + (puesto ? ' puesto' : '') + (!tiene && d.chispas < it.p ? ' caro' : ''),
      `${ico}<b>${it.n}</b><small>${puesto ? '✅ Puesto' : tiene ? 'Ponérmelo' : '⚡ ' + it.p}</small>`);
    b.onclick = () => tocaItem(it, b);
    G.appendChild(b);
  });
}
async function tocaItem(it, b) {
  const d = datos(), t = talDatos(), k = talCat + ':' + it.id;
  if (t.own.includes(k)) {
    SFX.pop(); t[talCat] = t[talCat] === it.id ? '' : it.id;
    VOZ.decir(t[talCat] ? '¡Me encanta! ' + it.n + '.' : 'Vale, me lo quito.');
  } else if (d.chispas < it.p) {
    SFX.mal(); b.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], 280);
    VOZ.decir(`Te faltan ${it.p - d.chispas} chispas. ¡Sigue haciendo misiones para conseguirlas!`); return;
  } else {
    SFX.clic();
    if (!await pregunta({ icono: talCat === 'mas' ? it.e : '🛠️', titulo: '¿Comprar ' + it.n + '?', texto: `Cuesta ⚡ ${it.p} chispas. Tienes ${d.chispas}.`, si: 'Comprar', no: 'Ahora no' })) return;
    d.chispas -= it.p; t.own.push(k); t[talCat] = it.id;
    SFX.fanfarria(); FX.chispas(b, 40, '#ffd23f'); FX.confeti(60);
    VOZ.decir(pick(['¡Toma ya! ', '¡Qué pasada! ', '¡Genial! ']) + it.n + ' es tuyo para siempre.');
  }
  d._t = Date.now(); guardarNino();
  pintaTaller(); decora($('#tallerRobot > .robot'));
  if (talCat === 'est' && t.est) demoEstela();
}
function demoEstela() {
  const R = $('#tallerRobot'); const r = R.querySelector('.robot'); if (!r) return;
  ESTELA.start(r, R); r.animate([{ transform: 'translateX(-30px)' }, { transform: 'translateX(30px)' }, { transform: 'none' }], { duration: 1400, easing: 'ease-in-out' });
  setTimeout(() => ESTELA.stop(), 1400);
}

/* ---------------- RECREO (minijuegos) ---------------- */
const TK_MAX = 5;
function tickets() { const d = datos(); if (d.tk == null) d.tk = 2; return d.tk; }
const gratisAdmin = () => typeof ADMIN !== 'undefined' && ADMIN.todo();
const JUEGOS = [
  { id: 'lluvia', n: 'Lluvia de números', e: '☔', d: 'Atrapa la burbuja con el resultado antes de que caiga.' },
  { id: 'memory', n: 'Parejas espaciales', e: '🃏', d: 'Une cada operación con su resultado.' },
  { id: 'carrera', n: 'Carrera de cohetes', e: '🏁', d: 'Calcula rápido y gana la carrera al robot rival.' }];
ON_PANTALLA.pRecreo = () => {
  if (!NINO) { ir('perfiles'); return; }
  pintaRecreo();
  VOZ.decir(tickets() ? '¡Hora del recreo! Elige un juego.' : 'No te quedan fichas. Completa una misión y ganarás una ficha para jugar.');
};
function pintaRecreo() {
  const d = datos(), tk = tickets(); d.rec = d.rec || {};
  $('#recFichas').innerHTML = Array.from({ length: TK_MAX }, (_, i) => `<span class="ficha${i < tk ? ' on' : ''}">🎟️</span>`).join('');
  $('#recZona').innerHTML = `<p class="rec-ayuda">${gratisAdmin() ? 'Modo admin: juegos gratis' : 'Cada juego gasta 1 ficha. Ganas 1 ficha por cada misión completada.'}</p>` +
    JUEGOS.map(j => `<button class="rec-juego" data-j="${j.id}"><span class="rj-e">${j.e}</span><span class="rj-t"><b>${j.n}</b><small>${j.d}</small>${d.rec[j.id] ? `<em>Récord: ${d.rec[j.id]}</em>` : ''}</span><span class="rj-go">▶</span></button>`).join('');
  $$('#recZona .rec-juego').forEach(b => b.onclick = () => jugar(b.dataset.j));
  $('#recVolver').onclick = () => { SFX.clic(); if (REC.fin) REC.fin(true); ir('mapa'); };
}
const REC = { fin: null };
function jugar(id) {
  const d = datos();
  if (!gratisAdmin()) {
    if (!tickets()) { SFX.mal(); VOZ.decir('No te quedan fichas. ¡Completa una misión para ganar otra!'); return; }
    d.tk--; d._t = Date.now(); guardarNino();
  }
  SFX.woosh(); pintaRecreoFichas();
  ({ lluvia: juegoLluvia, memory: juegoMemory, carrera: juegoCarrera, ...(typeof JUEGOS_EXTRA !== 'undefined' ? JUEGOS_EXTRA : {}) })[id]();
}
/* TRUCO OCULTO: 5 toques rápidos en las fichas del recreo = +1 ficha (hasta el máximo de 5) */
(function () {
  const z = document.getElementById('recFichas'); if (!z) return;
  z.style.touchAction = 'manipulation'; z.style.userSelect = 'none'; z.style.webkitUserSelect = 'none';
  let n = 0, ult = 0;
  z.addEventListener('pointerdown', () => {
    if (!NINO) return;
    const ahora = Date.now();
    n = (ahora - ult < 450) ? n + 1 : 1; ult = ahora;
    if (n < 5) return;
    n = 0;
    if (tickets() >= TK_MAX) return;
    const d = datos(); d.tk = Math.min(TK_MAX, tickets() + 1); guardarNino();
    pintaRecreoFichas();
    const b = $('#bRecreoSub'); if (b) b.textContent = tickets() + ' 🎟️';
    SFX.moneda();
    const f = z.querySelectorAll('.ficha.on'); const nueva = f[f.length - 1];
    if (nueva) { try { FX.chispas(nueva, 16); } catch (e) {} if (nueva.animate) nueva.animate([{ transform: 'scale(.3) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1.5) rotate(10deg)', opacity: 1, offset: .6 }, { transform: 'scale(1) rotate(0)' }], { duration: 450, easing: 'cubic-bezier(.2,.9,.3,1)' }); }
  });
})();
function pintaRecreoFichas() { const tk = tickets(); $('#recFichas').innerHTML = Array.from({ length: TK_MAX }, (_, i) => `<span class="ficha${i < tk ? ' on' : ''}">🎟️</span>`).join(''); }
function finJuego(id, puntos, txt, chispas) {
  const d = datos(); d.rec = d.rec || {};
  const record = puntos > (d.rec[id] || 0); if (record) d.rec[id] = puntos;
  d.chispas += chispas; d._t = Date.now(); guardarNino();
  SFX.fanfarria(); FX.confeti(record ? 120 : 60);
  $('#recZona').innerHTML = `<div class="rec-fin">${robotHTML(NINO.color, 'vuela', 'rec-lucas')}<h2>${txt}</h2>
    <p class="rec-pts">${puntos} puntos${record ? ' · <b>¡NUEVO RÉCORD!</b>' : ''}</p><p class="rec-ch">+${chispas} ⚡ chispas</p>
    <div class="rec-bts"><button class="btn btn-verde" id="recOtra">🎟️ Jugar otra vez</button><button class="btn btn-azul" id="recMenu">Elegir juego</button></div></div>`;
  requestAnimationFrame(() => decora($('#recZona .robot')));
  VOZ.decir(txt + ' Has conseguido ' + puntos + ' puntos' + (record ? '. ¡Es tu nuevo récord!' : '.') + ' Te llevas ' + chispas + ' chispas.');
  $('#recOtra').onclick = () => jugar(id);
  $('#recMenu').onclick = () => { SFX.clic(); pintaRecreo(); };
}
/* reto matemático para los minijuegos: número (peques) u operación del planeta */
function retoRecreo(lv) {
  ENG.setEdad(NINO.edad);
  const c = ENG.cfgDe(lv);
  if (lv < 4) { const n = ENG.ent(1, Math.min(10, Math.max(5, c.hi))); return Math.random() < .5 ? { r: n, t: String(n), voz: String(n), oral: true } : { r: n, t: '⭐'.repeat(n), voz: '¿Cuántas estrellas hay?', puntos: true }; }
  let cc = c;
  if (!c.op) cc = Object.assign({}, c, { op: lv >= 13 ? 'mix' : '+', hi: lv >= 12 ? 20 : Math.min(20, c.hi || 20), dos: false });
  const p = ENG.operacion(cc);
  return { r: p.r, t: ENG.txtOp(p.a, p.o, p.b), voz: ENG.vozOp(p.a, p.o, p.b), op: p };
}
function malasRecreo(r, n) { return ENG.cerca(r, n + 1, 0, 999, r > 20 ? 10 : 0).filter(v => v !== r).slice(0, n); }
function silabasHasta(lv) { return []; }

/* 1 · Lluvia de números: atrapa la burbuja con el resultado */
function juegoLluvia() {
  const lv = nivelActual();
  const Z = $('#recZona'); Z.innerHTML = `<div class="ll-cab"><span>🎯 <b id="llObj">-</b></span><button class="btn-ico" id="llOir">🔊</button><span>⏱️ <b id="llT">60</b></span><span>⭐ <b id="llP">0</b></span></div><div class="ll-cielo" id="llCielo"></div>`;
  const C = $('#llCielo'); let rt = null, pts = 0, t = 60, vivo = true, vel = .6 + (NINO.edad >= 7 ? .25 : 0), raf, gen;
  const nuevoObj = () => { rt = retoRecreo(lv); $('#llObj').textContent = rt.oral ? '🔊' : rt.t; VOZ.decir(rt.voz, { rate: .9 }); };
  $('#llOir').onclick = () => VOZ.decir(rt.voz, { rate: .85 });
  const BURB = ['verde', 'azul', 'rosa', 'morado', 'naranja', 'amarillo'];
  const lanza = (forzar) => {
    if (!vivo) return;
    const s = forzar != null ? forzar : (Math.random() < .35 ? rt.r : pick(malasRecreo(rt.r, 4)));
    const b = el('button', 'll-burbuja', `<span>${s}</span>`); b.style.backgroundImage = `url(img/burbujas/${pick(BURB)}.png)`;
    b.style.left = (6 + Math.random() * 74) + '%'; b._y = -80; b._v = vel * (0.8 + Math.random() * .5); b._s = s;
    b.onclick = () => {
      if (!vivo || b._ok) return;
      if (b._s === rt.r) { b._ok = 1; pts++; $('#llP').textContent = pts; SFX.ok(); FX.chispas(b, 18); b.classList.add('pop'); setTimeout(() => b.remove(), 300); vel += .04; nuevoObj(); }
      else { SFX.mal(); b.classList.add('mal'); setTimeout(() => b.classList.remove('mal'), 300); VOZ.decir('Ese es el ' + b._s + '.', { rate: .9 }); }
    };
    C.appendChild(b);
  };
  const loop = () => {
    if (!vivo) return;
    const H = C.clientHeight;
    C.querySelectorAll('.ll-burbuja').forEach(b => { if (b._ok) return; b._y += b._v * 1.6; b.style.transform = `translateY(${b._y}px)`; if (b._y > H) b.remove(); });
    if (![...C.querySelectorAll('.ll-burbuja')].some(b => b._s === rt.r && !b._ok && b._y < H * .6)) lanza(rt.r);
    raf = requestAnimationFrame(loop);
  };
  const reloj = setInterval(() => { t--; $('#llT').textContent = t; if (t <= 0) acabar(); }, 1000);
  gen = setInterval(() => lanza(), 900);
  function acabar(salir) {
    if (!vivo) return; vivo = false; clearInterval(reloj); clearInterval(gen); cancelAnimationFrame(raf); REC.fin = null;
    if (!salir) finJuego('lluvia', pts, pts >= 15 ? '¡Eres un rayo calculando!' : pts >= 8 ? '¡Muy bien atrapado!' : '¡Buen intento!', Math.min(25, 5 + pts));
  }
  REC.fin = acabar;
  nuevoObj(); lanza(rt.r); raf = requestAnimationFrame(loop);
}

/* 2 · Parejas: operación ↔ resultado (peques: puntitos ↔ número) */
function juegoMemory() {
  const lv = nivelActual(), np = NINO.edad <= 5 ? 4 : 6, pares = [], usados = new Set();
  for (let k = 0; k < 80 && pares.length < np; k++) {
    const rt = retoRecreo(lv); if (usados.has(rt.r)) continue; usados.add(rt.r);
    pares.push(lv < 4 ? { k: rt.r, a: `<span class="mm-w mm-pt">${'●'.repeat(rt.r)}</span>`, b: `<span class="mm-w" style="font-size:34px">${rt.r}</span>`, voz: String(rt.r) }
      : { k: rt.r, a: `<span class="mm-w">${rt.t}</span>`, b: `<span class="mm-w" style="font-size:30px">${rt.r}</span>`, voz: rt.voz + ', ' + rt.r });
  }
  const cartas = ENG.shuffle(pares.flatMap(p => [{ ...p, h: p.a }, { ...p, h: p.b }]));
  const Z = $('#recZona'); Z.innerHTML = `<div class="ll-cab"><span>🃏 Parejas: <b id="mmP">0</b>/${pares.length}</span><span>👆 <b id="mmM">0</b></span></div><div class="mm-tablero n${cartas.length}" id="mmT"></div>`;
  let abiertas = [], hechas = 0, mov = 0, bloq = false, vivo = true;
  const T = $('#mmT');
  cartas.forEach(c => {
    const b = el('button', 'mm-carta', `<span class="mm-dorso">🚀</span><span class="mm-cara">${c.h}</span>`);
    b.onclick = () => {
      if (bloq || b.classList.contains('vuelta') || !vivo) return;
      SFX.pop(); b.classList.add('vuelta'); abiertas.push([b, c]);
      if (abiertas.length < 2) return;
      mov++; $('#mmM').textContent = mov;
      const [[b1, c1], [b2, c2]] = abiertas; abiertas = [];
      if (c1.k === c2.k && c1.h !== c2.h) {
        hechas++; $('#mmP').textContent = hechas; setTimeout(() => { b1.classList.add('ok'); b2.classList.add('ok'); SFX.ok(); FX.chispas(b2, 16); VOZ.decir(c1.voz); }, 250);
        if (hechas === pares.length) { vivo = false; REC.fin = null; const pts = Math.max(10, 100 - (mov - pares.length) * 8); setTimeout(() => finJuego('memory', pts, mov <= pares.length + 3 ? '¡Memoria de robot!' : '¡Todas las parejas!', Math.min(25, Math.round(pts / 4))), 1300); }
      } else { bloq = true; setTimeout(() => { b1.classList.remove('vuelta'); b2.classList.remove('vuelta'); bloq = false; }, 950); }
    };
    T.appendChild(b);
  });
  REC.fin = () => { vivo = false; REC.fin = null; };
  VOZ.decir(lv < 4 ? 'Une cada grupo de puntos con su número.' : 'Busca cada operación y su resultado.');
}

/* 3 · Carrera de cohetes contra el robot rival */
function juegoCarrera() {
  const lv = nivelActual(), META = 8;
  const Z = $('#recZona');
  Z.innerHTML = `<div class="cr-pista"><div class="cr-carril"><span class="cr-yo" id="crYo">${robotHTML(NINO.color, 'vuela')}</span><span class="cr-meta">🏁</span></div>
    <div class="cr-carril rival"><span class="cr-rival" id="crRiv">🤖</span><span class="cr-meta">🏁</span></div></div>
    <div class="cr-preg" id="crPreg"></div><div class="cr-ops" id="crOps"></div>`;
  let yo = 0, riv = 0, vivo = true, aciertos = 0, ultima = null;
  requestAnimationFrame(() => decora($('#crYo .robot')));
  const mueve = () => { $('#crYo').style.left = `calc(${yo / META * 84}% )`; $('#crRiv').style.left = `calc(${riv / META * 84}% )`; };
  const ritmo = (NINO.edad <= 5 ? 5600 : NINO.edad === 6 ? 4800 : 4000);
  const tR = setInterval(() => { if (!vivo) return; riv++; mueve(); SFX.pop(); if (riv >= META) acabar(false); }, ritmo);
  function preg() {
    if (!vivo) return;
    const P = $('#crPreg'), O = $('#crOps'); O.innerHTML = '';
    let rt; do { rt = retoRecreo(lv); } while (ultima != null && rt.r === ultima && Math.random() < .8); ultima = rt.r;
    const opts = ENG.shuffle([rt.r, ...malasRecreo(rt.r, 2)]);
    if (rt.oral) { P.innerHTML = `<button class="btn btn-azul" id="crOir">🔊 Escuchar</button>`; $('#crOir').onclick = () => VOZ.decir(rt.voz, { rate: .85 }); }
    else P.innerHTML = `<span class="cr-w">${rt.t}</span>`;
    VOZ.decir(rt.voz, { rate: .95 });
    opts.forEach(o => {
      const b = el('button', 'cr-op', `<span class="mm-w" style="font-size:34px">${o}</span>`);
      b.onclick = () => {
        if (!vivo) return;
        if (o === rt.r) { SFX.ok(); FX.chispas(b, 14); yo++; aciertos++; mueve(); if (yo >= META) acabar(true); else preg(); }
        else { SFX.mal(); b.classList.add('mal'); b.disabled = true; }
      };
      O.appendChild(b);
    });
  }
  function acabar(gano, salir) {
    if (!vivo) return; vivo = false; clearInterval(tR); REC.fin = null;
    if (salir) return;
    setTimeout(() => finJuego('carrera', aciertos * 10 + (gano ? 50 : 0), gano ? '¡Has ganado la carrera!' : '¡Uy, el rival llegó primero! La próxima es tuya.', gano ? 20 : 8), 600);
  }
  REC.fin = (salir) => acabar(false, salir);
  mueve(); VOZ.decir('¡Preparados, listos, ya! Resuelve y toca la respuesta.'); setTimeout(preg, 300);
}

/* ---------------- DIPLOMAS ---------------- */
const DIPLOMAS = [
  { r: 'Cadete Espacial', ic: '🥉', c: '#cd7f32' }, { r: 'Piloto Estelar', ic: '🥈', c: '#c9d6e3' }, { r: 'Capitán Galáctico', ic: '🥇', c: '#ffd23f' },
  { r: 'Comandante Cósmico', ic: '🏅', c: '#18e0ff' }, { r: 'Gran Genio de los Números', ic: '🏆', c: '#17ff5f' }];
function dipLetras(g) { return PLANETAS.slice(g * 5, g * 5 + 5).map(p => p.letra.replace('🏆', 'genio').replace('🕐', 'hora')).join(' · '); }
function dipGanado(g) { if (gratisAdmin()) return true; const d = datos(); for (let i = g * 5; i < g * 5 + 5; i++) if (!(d.plan[i] && d.plan[i].e > 0)) return false; return true; }
function dipProgreso(g) { const d = datos(); let n = 0; for (let i = g * 5; i < g * 5 + 5; i++) if (d.plan[i] && d.plan[i].e > 0) n++; return n; }
ON_PANTALLA.pDiplomas = () => {
  if (!NINO) { ir('perfiles'); return; }
  const D = $('#dipLista'); D.innerHTML = '';
  let n = 0;
  DIPLOMAS.forEach((dp, g) => {
    const ok = dipGanado(g); if (ok) n++;
    const b = el('button', 'dip-item' + (ok ? '' : ' no'), `<span class="dip-ic" style="--c:${dp.c}">${ok ? dp.ic : '🔒'}</span><span class="dip-t"><b>${dp.r}</b><small>Planetas ${g * 5 + 1} al ${g * 5 + 5}: ${dipLetras(g)}</small>
      ${ok ? '<em>¡Conseguido! Toca para verlo</em>' : `<span class="dip-barra"><i style="width:${dipProgreso(g) * 20}%"></i></span>`}</span>`);
    b.onclick = () => { SFX.clic(); if (ok) verDiploma(g); else VOZ.decir(`Para conseguir el diploma de ${dp.r}, completa los planetas del ${g * 5 + 1} al ${g * 5 + 5}. Llevas ${dipProgreso(g)}.`); };
    D.appendChild(b);
  });
  VOZ.decir(n ? `Tienes ${n} diploma${n > 1 ? 's' : ''}. ¡Enhorabuena!` : 'Aquí guardarás tus diplomas. Completa cinco planetas para conseguir el primero.');
};
function cargaImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
async function dibujaDiploma(g) {
  const dp = DIPLOMAS[g], W = 1600, H = 1130, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  try { await Promise.all(['700 60px Andika', '400 60px "Lilita One"'].map(f => document.fonts.load(f))); } catch (e) {}
  const bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0b1633'); bg.addColorStop(1, '#1a0b3d'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  let sd = g * 97 + 13; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 260; i++) { x.globalAlpha = .3 + rnd() * .7; x.fillStyle = '#fff'; x.beginPath(); x.arc(rnd() * W, rnd() * H, rnd() * 2.2, 0, 7); x.fill(); }
  x.globalAlpha = 1;
  const neb = x.createRadialGradient(W * .8, H * .2, 0, W * .8, H * .2, 520); neb.addColorStop(0, 'rgba(139,92,255,.35)'); neb.addColorStop(1, 'transparent'); x.fillStyle = neb; x.fillRect(0, 0, W, H);
  x.shadowColor = '#17ff5f'; x.shadowBlur = 30; x.strokeStyle = '#17ff5f'; x.lineWidth = 10; x.strokeRect(40, 40, W - 80, H - 80);
  x.shadowBlur = 0; x.strokeStyle = dp.c; x.lineWidth = 3; x.strokeRect(66, 66, W - 132, H - 132);
  x.textAlign = 'center'; x.fillStyle = '#fff';
  x.font = '400 58px "Lilita One", sans-serif'; x.fillText('LOS NÚMEROS', W / 2 - 150, 175); x.fillStyle = '#17ff5f'; x.shadowColor = '#17ff5f'; x.shadowBlur = 20; x.fillText('LUCAS', W / 2 + 205, 175); x.shadowBlur = 0;
  x.fillStyle = '#a9c3d9'; x.font = '700 30px Andika, sans-serif'; x.fillText('de', W / 2 + 62, 168);
  x.fillStyle = dp.c; x.font = '400 120px "Lilita One", sans-serif'; x.shadowColor = dp.c; x.shadowBlur = 25; x.fillText('DIPLOMA', W / 2, 320); x.shadowBlur = 0;
  x.fillStyle = '#fff'; x.font = '700 64px Andika, sans-serif'; x.fillText(dp.r, W / 2, 410);
  x.fillStyle = '#a9c3d9'; x.font = '700 34px Andika, sans-serif'; x.fillText('otorgado a', W / 2, 490);
  const nom = NINO.nombre; let fs = 120; x.font = `400 ${fs}px "Lilita One", sans-serif`; while (x.measureText(nom).width > 900 && fs > 60) { fs -= 6; x.font = `400 ${fs}px "Lilita One", sans-serif`; }
  x.fillStyle = '#ffd23f'; x.shadowColor = '#ffb000'; x.shadowBlur = 24; x.fillText(nom, W / 2, 610); x.shadowBlur = 0;
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(W / 2 - 420, 640); x.lineTo(W / 2 + 420, 640); x.stroke();
  x.fillStyle = '#f2fbff'; x.font = '700 36px Andika, sans-serif';
  x.fillText('por aprender matemáticas en los planetas ' + (g * 5 + 1) + ' al ' + (g * 5 + 5), W / 2, 712);
  x.fillStyle = '#17ff5f'; x.font = '700 40px Andika, sans-serif'; x.fillText(dipLetras(g), W / 2, 772);
  const f = new Date(); x.fillStyle = '#a9c3d9'; x.font = '700 28px Andika, sans-serif';
  x.fillText(f.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 850);
  /* medalla */
  const mx = 255, my = 860; x.fillStyle = '#ff4d5e'; x.beginPath(); x.moveTo(mx - 50, my - 170); x.lineTo(mx - 10, my - 60); x.lineTo(mx - 85, my - 60); x.fill(); x.fillStyle = '#18b4ff'; x.beginPath(); x.moveTo(mx + 50, my - 170); x.lineTo(mx + 85, my - 60); x.lineTo(mx + 10, my - 60); x.fill();
  const mg = x.createRadialGradient(mx - 20, my - 20, 10, mx, my, 95); mg.addColorStop(0, '#fff'); mg.addColorStop(.3, dp.c); mg.addColorStop(1, '#5a3c00'); x.fillStyle = mg; x.shadowColor = dp.c; x.shadowBlur = 30; x.beginPath(); x.arc(mx, my, 90, 0, 7); x.fill(); x.shadowBlur = 0;
  x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 26 : 60; x.lineTo(mx + Math.cos(a) * r, my + Math.sin(a) * r); } x.fill();
  x.fillStyle = '#3a2500'; x.font = '400 34px "Lilita One", sans-serif'; x.fillText(String(g + 1), mx, my + 12);
  /* robot */
  const im = imgPj(NINO.color, 'vuela'), ri = await cargaImg(im.src);
  if (ri) { let h = 250, w = ri.width / ri.height * h; if (w > 380) { w = 380; h = w * ri.height / ri.width; } try { x.filter = im.filter || 'none'; } catch (e) {} x.drawImage(ri, W - 95 - w, 95, w, h); x.filter = 'none'; }
  const lg = await cargaImg('img/logo-futurmovil.png');
  if (lg) { const w = 300, h = w * 200 / 1024; x.drawImage(lg, W / 2 - w / 2, H - 135, w, h); }
  return cv.toDataURL('image/png');
}
async function verDiploma(g, nuevo) {
  const dp = DIPLOMAS[g];
  modal(`<div class="dip-modal"><h2>${nuevo ? '¡Diploma nuevo!' : dp.r}</h2><div class="dip-img"><span class="cargando">Preparando diploma…</span></div>
    <div class="dip-bts"><button class="btn btn-verde" id="dipBaja" disabled>⬇️ Descargar</button><button class="btn btn-azul" id="dipComp">📤 Compartir</button></div>
    <button class="btn btn-mini" id="dipCerrar">Cerrar</button></div>`);
  $('#dipCerrar').onclick = () => { SFX.clic(); cerrarModal(); };
  const url = await dibujaDiploma(g);
  const box = $('.dip-img'); if (!box) return;
  box.innerHTML = `<img src="${url}" alt="Diploma">`;
  const nom = `diploma-${NINO.nombre.toLowerCase().replace(/[^a-z0-9ñáéíóú]+/g, '-')}-${g + 1}.png`;
  $('#dipBaja').disabled = false;
  $('#dipBaja').onclick = () => { SFX.clic(); const a = document.createElement('a'); a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); toast('Diploma descargado 📄'); };
  $('#dipComp').onclick = async () => {
    SFX.clic();
    const txt = `🏅 ¡${NINO.nombre} ha conseguido el diploma de ${dp.r} en LOS NÚMEROS DE LUCAS! 🚀🔢\nAprende matemáticas viajando por el espacio:`;
    const link = 'https://puntofibra.github.io/los-numeros-de-lucas/';
    if (navigator.share) { try { await navigator.share({ title: 'LOS NÚMEROS DE LUCAS', text: txt, url: link }); } catch (e) {} }
    else window.open('https://wa.me/?text=' + encodeURIComponent(txt + ' ' + link), '_blank');
  };
  VOZ.decir(nuevo ? `¡Enhorabuena, ${NINO.nombre}! Has conseguido el diploma de ${dp.r}. Puedes descargarlo para imprimirlo.` : `Diploma de ${dp.r}.`);
}
function compruebaDiplomaNuevo() {
  if (!NINO || gratisAdmin()) return;
  const d = datos(); d.dip = d.dip || [];
  for (let g = 0; g < DIPLOMAS.length; g++) if (dipGanado(g) && !d.dip.includes(g)) {
    d.dip.push(g); d._t = Date.now(); guardarNino();
    setTimeout(() => { if (pantallaActual === 'pMapa') { SFX.fanfarria(); FX.confeti(150); verDiploma(g, true); } else d.dip = d.dip.filter(x => x !== g); }, 4200);
    return;
  }
}

/* ---------------- ENGANCHES con app.js ---------------- */
{
  const pm = ON_PANTALLA.pMapa;
  ON_PANTALLA.pMapa = () => {
    pm();
    if (!NINO) return;
    aplicaFondo(); requestAnimationFrame(decoraTodo);
    $('#bRecreoSub').textContent = tickets() + ' 🎟️';
    compruebaDiplomaNuevo();
  };
  const fm = finMision;
  finMision = async function () {
    const valida = MIS && !MIS.prueba;
    if (valida) { const d = datos(); d.tk = Math.min(TK_MAX, tickets() + 1); }
    const r = await fm.apply(this, arguments);
    if (valida) requestAnimationFrame(() => decora($('#resLucas')));
    return r;
  };
  const se = siguienteEjercicio;
  siguienteEjercicio = function () { const r = se.apply(this, arguments); requestAnimationFrame(() => decora($('#lucasNarra'))); return r; };
  $('#bTaller').onclick = () => { SFX.clic(); ir('taller'); };
  $('#bRecreo').onclick = () => { SFX.clic(); ir('recreo'); };
  $('#bDiplomas').onclick = () => { SFX.clic(); ir('diplomas'); };
}

/* ---------------- ORIENTACIÓN: móvil en vertical · tablet/TV/PC en horizontal ---------------- */
(() => {
  const tactil = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const tipo = () => {
    const corto = Math.min(screen.width, screen.height);
    if (!tactil) return 'pc';                 // PC / TV: libre
    return corto < 600 ? 'movil' : 'tablet';
  };
  const quiere = () => tipo() === 'movil' ? 'portrait' : tipo() === 'tablet' ? 'landscape' : null;
  function bloquea() { const q = quiere(); if (q && screen.orientation && screen.orientation.lock) screen.orientation.lock(q).catch(() => {}); }
  function revisa() {
    const q = quiere(), apaisado = innerWidth > innerHeight;
    const mal = (q === 'portrait' && apaisado) || (q === 'landscape' && !apaisado);
    const g = $('#giraPantalla'); if (!g) return;
    $('#giraTxt').textContent = q === 'portrait' ? 'Pon el móvil en vertical' : 'Pon la tablet en horizontal';
    g.classList.toggle('ver', mal); g.classList.toggle('a-horiz', q === 'landscape');
    if (mal) { try { VOZ.callar(); } catch (e) {} }
  }
  bloquea(); revisa();
  addEventListener('resize', revisa);
  if (screen.orientation) screen.orientation.addEventListener('change', revisa);
  document.addEventListener('click', bloquea, { once: true });   // algunos navegadores solo bloquean tras tocar
})();

/* =====================================================================
   FOTO DE BUENAS NOCHES · después del cuento: selfie del niño con su
   personaje, marco nocturno con estrellas y texto, y compartir (WhatsApp…)
   ===================================================================== */
var FOTO_NOCHE = (() => {
  const W = 1080, H = 1920;
  let ov = null, stream = null, video = null, raf = 0, info = null, marco = null, dormido = null, final = null, cuenta = false;
  const css = document.createElement('style');
  css.textContent = `
  .fn-ov{position:fixed;inset:0;z-index:9000;background:radial-gradient(circle at 50% 0%,#1d1a5e,#050a1a 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:calc(12px + var(--safe-t)) 16px calc(14px + var(--safe-b));animation:fnIn .35s ease-out}
  @keyframes fnIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}
  .fn-marco{position:relative;width:min(92vw,calc((100vh - 200px) * .5625));aspect-ratio:9/16;border-radius:18px;overflow:hidden;box-shadow:0 0 0 3px rgba(255,210,63,.55),0 0 40px rgba(139,92,255,.6),0 20px 60px rgba(0,0,0,.6);background:#050a1a}
  .fn-marco canvas,.fn-marco img{position:absolute;inset:0;width:100%;height:100%;display:block}
  .fn-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--f-titulo);font-size:min(40vw,200px);color:#fff;text-shadow:0 0 30px #8b5cff,0 0 60px #ffd23f;pointer-events:none}
  .fn-num b{animation:fnNum .9s ease-out forwards}
  @keyframes fnNum{0%{transform:scale(2.2);opacity:0}25%{transform:scale(1);opacity:1}100%{transform:scale(.6);opacity:0}}
  .fn-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
  .fn-flash.on{animation:fnFlash .6s ease-out}
  @keyframes fnFlash{0%{opacity:.95}100%{opacity:0}}
  .fn-txt{color:var(--txt2);font-size:15px;text-align:center;margin:0;max-width:440px}
  .fn-bots{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:min(92vw,460px)}
  .fn-bots .btn{flex:1;min-width:130px}
  .fn-disparo{width:84px;height:84px;border-radius:50%;background:#fff;box-shadow:0 0 0 6px rgba(255,255,255,.25),0 0 30px #ffd23f;font-size:34px;display:flex;align-items:center;justify-content:center;flex:none!important;min-width:0!important;padding:0}
  .fn-disparo:active{transform:scale(.92)}
  .fn-cerrar{position:absolute;top:calc(10px + var(--safe-t));right:12px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.12);font-size:22px;color:#fff}
  .btn-foto{background:linear-gradient(180deg,#ffd23f,#ff9a2e);color:#3a1d00;box-shadow:0 5px 0 #b35a00,0 0 26px rgba(255,210,63,.6);font-size:19px;animation:fnLate 1.8s ease-in-out infinite}
  @keyframes fnLate{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  .btn-wa{background:linear-gradient(180deg,#2bd96b,#128c4a);color:#fff;box-shadow:0 5px 0 #0b5e31}`;
  document.head.appendChild(css);

  /* estrellas fijas del fondo (siempre las mismas en la foto) */
  let sem = 7; const rnd = () => (sem = (sem * 9301 + 49297) % 233280) / 233280;
  const ESTRELLAS = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() < .7 ? rnd() * 380 : 1000 + rnd() * 340, r: .8 + rnd() * 2.6, a: .35 + rnd() * .65 }));

  /* luna creciente (se dibuja una vez en un lienzo aparte) */
  const LUNA = document.createElement('canvas'); LUNA.width = LUNA.height = 110;
  { const c = LUNA.getContext('2d'); c.fillStyle = '#fff1b8'; c.beginPath(); c.arc(55, 55, 48, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(78, 38, 44, 0, 7); c.fill(); }
  const nomPj = () => { const c = colorDe(NINO.color); return PJ_ON ? c.nom : 'Lucas'; };
  const cargaImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  const fechaTxt = () => { const f = new Date(); return f.getDate() + ' de ' + ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][f.getMonth()] + ' de ' + f.getFullYear(); };

  function texto(ctx, t, x, y, font, max, col = '#fff', glow = 'rgba(139,92,255,.9)', blur = 24) {
    let s = parseInt(font.match(/(\d+)px/)[1], 10);
    do { ctx.font = font.replace(/\d+px/, s + 'px'); s -= 2; } while (ctx.measureText(t).width > max && s > 14);
    ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = blur; ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.shadowBlur = 0; ctx.fillText(t, x, y); ctx.restore();
  }
  function estrella(ctx, cx, cy, r, on) {
    ctx.save(); ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    ctx.closePath();
    if (on) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 22; const g = ctx.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#fff3a8'); g.addColorStop(1, '#ffb000'); ctx.fillStyle = g; }
    else ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fill(); ctx.restore();
  }
  function pill(ctx, t, cx, cy) {
    ctx.save(); ctx.font = '700 36px Fredoka, sans-serif';
    const w = ctx.measureText(t).width + 64, h = 64, x = cx - w / 2, y = cy - h / 2;
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#ffd23f'); g.addColorStop(1, '#ff9a2e');
    ctx.shadowColor = 'rgba(255,170,0,.8)'; ctx.shadowBlur = 24; ctx.fillStyle = g;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 32); else ctx.rect(x, y, w, h); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#3a1d00'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, cx, cy + 2); ctx.restore();
  }

  /* MARCO de la foto según la fecha (de momento el genérico todo el año; aquí irán Navidad y Halloween) */
  function marcoHoy() { return 'img/marco-generico.png'; }
  /* hueco transparente del marco genérico (en px del PNG de 941×1672) → se escala a 1080×1920 */
  const KM = W / 941, HUECO = { x: 80 * KM, y: 288 * KM, w: 781 * KM, h: 1074 * KM };

  /* dibuja la foto completa (se usa para la vista previa en vivo y para la final) */
  function pinta(ctx, k) {
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = '#050a1a'; ctx.fillRect(0, 0, W, H);
    const Hx = HUECO, hayVideo = video && video.videoWidth;
    /* 1) foto del niño dentro del hueco (efecto espejo, como un selfie) */
    ctx.save(); ctx.beginPath(); ctx.rect(Hx.x - 6, Hx.y - 6, Hx.w + 12, Hx.h + 12); ctx.clip();
    if (hayVideo) {
      const vw = video.videoWidth, vh = video.videoHeight, s = Math.max(Hx.w / vw, Hx.h / vh), dw = vw * s, dh = vh * s;
      ctx.translate(Hx.x * 2 + Hx.w, 0); ctx.scale(-1, 1);
      ctx.drawImage(video, Hx.x + (Hx.w - dw) / 2, Hx.y + (Hx.h - dh) / 2, dw, dh);
    } else {
      const g = ctx.createRadialGradient(W / 2, Hx.y + Hx.h * .55, 40, W / 2, Hx.y + Hx.h * .55, Hx.h * .8); g.addColorStop(0, '#2b2380'); g.addColorStop(1, '#070b24');
      ctx.fillStyle = g; ctx.fillRect(Hx.x, Hx.y, Hx.w, Hx.h);
      ESTRELLAS.forEach(s => { ctx.globalAlpha = s.a; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Hx.x + s.x / W * Hx.w, Hx.y + s.y / H * Hx.h * 3 % Hx.h, s.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      if (dormido) { const dw = Hx.w * .8, dh = dw * dormido.height / dormido.width; ctx.drawImage(dormido, W / 2 - dw / 2, Hx.y + Hx.h * .62 - dh / 2, dw, dh); }
    }
    ctx.restore();
    /* 2) velo oscuro arriba de la foto para que se lea el texto */
    let g = ctx.createLinearGradient(0, Hx.y, 0, Hx.y + 420); g.addColorStop(0, 'rgba(10,8,45,.88)'); g.addColorStop(.55, 'rgba(10,8,45,.45)'); g.addColorStop(1, 'rgba(10,8,45,0)');
    ctx.fillStyle = g; ctx.fillRect(Hx.x, Hx.y, Hx.w, 420);
    /* 3) el marco encima */
    if (marco) ctx.drawImage(marco, 0, 0, W, H);
    /* 4) textos de arriba (dentro de la foto) */
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const cx = Hx.x + Hx.w / 2, tw = Hx.w - 70;
    texto(ctx, '¡Buenas noches!', cx, Hx.y + 120, '400 104px "Lilita One", sans-serif', tw, '#fff', 'rgba(139,92,255,1)', 32);
    texto(ctx, info.frase, cx, Hx.y + 190, '600 40px Fredoka, sans-serif', tw, '#e9e4ff', 'rgba(0,0,0,.7)', 12);
    pill(ctx, '⭐ ESTRELLA DE LA LECTURA', cx, Hx.y + 262);
    ctx.globalAlpha = .8; texto(ctx, fechaTxt(), cx, Hx.y + 330, '500 26px Fredoka, sans-serif', tw, '#d6d0ff', 'rgba(0,0,0,.8)', 10); ctx.globalAlpha = 1;
    /* 5) estrellas del cuento y textos en la banda de abajo (a la derecha del planeta) */
    const bx = 745, bw = 600;
    for (let j = 0; j < 10; j++) estrella(ctx, bx + (j - 4.5) * 58, 1678, 24, j < info.n);
    ctx.textAlign = 'center';
    texto(ctx, `${info.nombre} · ${info.n} de 10 estrellas`, bx, 1744, '700 44px Fredoka, sans-serif', bw, '#ffd23f', 'rgba(255,170,0,.6)', 16);
    texto(ctx, `He leído «${info.titulo}»`, bx, 1786, '500 30px Fredoka, sans-serif', bw, '#fff', 'rgba(0,0,0,.7)', 8);
    texto(ctx, 'Juega en puntofibra.github.io/los-numeros-de-lucas', bx, 1828, '700 26px Fredoka, sans-serif', bw, '#17ff5f', 'rgba(23,255,95,.7)', 12);
    ctx.restore();
  }

  function paraCamara() { cancelAnimationFrame(raf); raf = 0; if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }
  function cerrar() { paraCamara(); cuenta = false; if (ov) { ov.remove(); ov = null; } document.removeEventListener('visibilitychange', alOcultar); }
  function alOcultar() { if (document.hidden) cerrar(); }

  async function abrir(datosCuento) {
    if (ov) return;
    const n = datosCuento.n;
    info = { n, titulo: datosCuento.titulo || 'el cuento de hoy', nombre: NINO.nombre,
      frase: n >= 9 ? 'Ya he leído mi cuento… ¡y me voy a dormir!' : n >= 6 ? 'He estudiado mucho… ¡ahora a dormir!' : 'Hoy he leído mi cuento… ¡dulces sueños!' };
    final = null;
    [marco, dormido] = await Promise.all([cargaImg(marcoHoy()), cargaImg('img/lucas/dormido.png')]);
    try { await Promise.all([document.fonts.load('118px "Lilita One"'), document.fonts.load('700 50px Fredoka')]); } catch (e) {}
    ov = el('div', 'fn-ov');
    ov.innerHTML = `<button class="fn-cerrar" id="fnX">✕</button>
      <div class="fn-marco" id="fnMarco"><canvas id="fnCv" width="540" height="960"></canvas><div class="fn-num" id="fnNum"></div><div class="fn-flash" id="fnFlash"></div></div>
      <p class="fn-txt" id="fnTxt">Colócate dentro del marco y sonríe 😊</p>
      <div class="fn-bots" id="fnBots"><button class="fn-disparo" id="fnDisparo">📸</button></div>`;
    document.body.appendChild(ov);
    document.addEventListener('visibilitychange', alOcultar);
    $('#fnX').onclick = () => { SFX.clic(); VOZ.callar(); cerrar(); };
    video = document.createElement('video'); video.setAttribute('playsinline', ''); video.muted = true; video.autoplay = true;
    const cv = $('#fnCv'), ctx = cv.getContext('2d');
    const bucle = () => { if (!ov) return; pinta(ctx, cv.width / W); raf = requestAnimationFrame(bucle); };
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false });
      if (!ov) { paraCamara(); return; }
      video.srcObject = stream; await video.play();
      VOZ.decir('¡Colócate dentro del marco y sonríe! Cuando estés listo, pulsa el botón de la cámara.');
    } catch (e) {
      video = null;
      $('#fnTxt').textContent = 'No se ha podido abrir la cámara. Puedes hacer la tarjeta con Lucas.';
      $('#fnDisparo').textContent = '✨';
    }
    bucle();
    $('#fnDisparo').onclick = disparar;
  }

  async function disparar() {
    if (cuenta || !ov) return; cuenta = true;
    if (video) {
      for (const k of [3, 2, 1]) { if (!ov) return; $('#fnNum').innerHTML = `<b>${k}</b>`; SFX.clic(); await esperar(900); }
      if (!ov) return; $('#fnNum').innerHTML = ''; VOZ.decir('¡Patata!');
    }
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; pinta(cv.getContext('2d'), 1);
    paraCamara();
    const fl = $('#fnFlash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); SFX.pop();
    final = await new Promise(r => cv.toBlob(r, 'image/jpeg', .92));
    const url = URL.createObjectURL(final);
    $('#fnMarco').insertAdjacentHTML('afterbegin', `<img src="${url}" alt="">`); $('#fnCv').remove();
    FX.confeti(70);
    $('#fnTxt').textContent = '¡Qué foto tan bonita! Envíasela a mamá, papá o los abuelos 💌';
    $('#fnBots').innerHTML = `<button class="btn btn-wa" id="fnShare">📤 Compartir</button><button class="btn" id="fnGuardar">💾 Guardar</button><button class="btn btn-mini" id="fnOtra">🔁 Repetir</button>`;
    $('#fnShare').onclick = () => compartir(url);
    $('#fnGuardar').onclick = () => descargar(url);
    $('#fnOtra').onclick = () => { SFX.clic(); const d = { n: info.n, titulo: info.titulo }; cerrar(); abrir(d); };
    cuenta = false;
    setTimeout(() => VOZ.decir('¡Qué foto tan bonita! Puedes enviársela a mamá, a papá o a los abuelos. ¡Buenas noches!'), 500);
  }
  const textoCompartir = () => `🌙 ¡Buenas noches! Hoy ${info.nombre} ha leído «${info.titulo}» y ha conseguido ${info.n} de 10 estrellas ⭐ con Leo con Lucas.\n\n📚 Aprende a leer jugando con Lucas: https://puntofibra.github.io/los-numeros-de-lucas/`;
  function descargar(url) { SFX.clic(); const a = document.createElement('a'); a.href = url; a.download = 'buenas-noches-' + info.nombre.toLowerCase().replace(/\s+/g, '-') + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); toast('Foto guardada 📸'); }
  async function compartir(url) {
    SFX.clic();
    const f = new File([final], 'buenas-noches.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      try { await navigator.share({ files: [f], text: textoCompartir(), title: 'Buenas noches' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    /* sin compartir nativo: guarda la foto y abre WhatsApp con el mensaje para adjuntarla */
    descargar(url);
    setTimeout(() => window.open('https://wa.me/?text=' + encodeURIComponent(textoCompartir()), '_blank'), 600);
  }
  return { abrir };
})();
