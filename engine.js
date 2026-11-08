/* =====================================================================
   LOS NÚMEROS DE LUCAS · Motor de matemáticas
   - genera ejercicios variados para cada planeta (y para cada edad)
   - memoria por niño: lo visto hace poco sale menos, lo fallado se repite más
   - cuantas más veces repite un planeta, un poco más de reto (sin pasarse)
   ===================================================================== */
'use strict';

const ENG = (() => {
  const SIN_TILDE = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
  const quitaTildes = s => String(s).replace(/[áéíóú]/g, c => SIN_TILDE[c]);
  const rnd = n => Math.floor(Math.random() * n);
  const ent = (a, b) => a + rnd(b - a + 1);           // entero entre a y b (incluidos)
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---- memoria anti-repetición ---- */
  let MEM = { seen: {}, fail: {}, vis: {} };
  let RETO = 0, EDAD = 6, NIVEL_ACT = 0;
  const usados = new Set();
  function setMem(m) { MEM = m || {}; MEM.seen = MEM.seen || {}; MEM.fail = MEM.fail || {}; MEM.vis = MEM.vis || {}; }
  function marca(id, ok) {
    MEM.seen[id] = Date.now();
    if (!ok) MEM.fail[id] = (MEM.fail[id] || 0) + 1;
    else if (MEM.fail[id]) { MEM.fail[id]--; if (!MEM.fail[id]) delete MEM.fail[id]; }
    const ks = Object.keys(MEM.seen);
    if (ks.length > 1400) ks.sort((a, b) => MEM.seen[a] - MEM.seen[b]).slice(0, 300).forEach(k => delete MEM.seen[k]);
  }
  /* elige entre varios candidatos el menos visto / más fallado */
  function mejor(gen, n = 6) {
    let best = null, bw = -1;
    for (let k = 0; k < n; k++) {
      const c = gen(); if (!c) continue;
      const t = MEM.seen[c.id]; let w = !t ? 10 : Math.min(8, .2 + (Date.now() - t) / 864e5 * 1.6);
      if (MEM.fail[c.id]) w += Math.min(6, MEM.fail[c.id] * 2.2);
      if (usados.has(c.id)) w *= .02;
      w *= .7 + Math.random() * .6;
      if (w > bw) { bw = w; best = c; }
    }
    if (best) usados.add(best.id);
    return best;
  }

  /* ---- utilidades ---- */
  const cfgDe = lv => PLANETAS[Math.min(lv, PLANETAS.length - 1)].cfg;
  const simb = o => o === '+' ? '+' : o === '-' ? '−' : '×';
  const palOp = o => o === '+' ? 'más' : o === '-' ? 'menos' : 'por';
  const txtOp = (a, o, b) => `${a} ${simb(o)} ${b}`;
  const vozOp = (a, o, b) => `${a} ${palOp(o)} ${b}`;
  const calc = (a, o, b) => o === '+' ? a + b : o === '-' ? a - b : a * b;
  /* opciones cercanas a la buena (sin repetir, dentro de [lo, hi]) */
  function cerca(r, n, lo = 0, hi = 999, salto) {
    const set = new Set([r]);
    const cand = [1, -1, 2, -2, 3, -3];
    if (salto) cand.push(salto, -salto); if (r >= 15) cand.push(10, -10);
    let k = 0;
    for (const d of shuffle(cand)) { if (set.size >= n) break; const v = r + d; if (v >= lo && v <= hi) set.add(v); }
    while (set.size < n && k++ < 60) { const v = ent(Math.max(lo, r - 6), Math.min(hi, r + 6)); set.add(v); }
    return shuffle([...set]);
  }
  const nOpc = () => EDAD <= 5 ? 3 : EDAD === 6 ? 3 + (RETO >= 1 ? 1 : 0) : 4;
  const obj = () => pick(OBJETOS);
  /* número del rango del planeta; con más reto se tiende a los grandes */
  function numRango(lo, hi) {
    const span = hi - lo, base = lo + Math.round(span * Math.min(.5, RETO * .15));
    return Math.random() < .75 ? ent(base, hi) : ent(lo, hi);
  }

  /* ---- operaciones según el planeta ---- */
  function operacion(c, oForz) {
    let o = oForz || c.op;
    if (o === 'mix') o = pick(['+', '+', '-', '-', 'x']);
    let a, b;
    if (o === 'x') {
      const tablas = c.tablas || [2, 3, 4, 5, 6, 7, 8, 9, 10];
      const t = pick(tablas), k = RETO === 0 && Math.random() < .5 ? ent(1, 5) : ent(1, 10);
      if (RETO >= 2 && Math.random() < .35) { a = k; b = t; } else { a = t; b = k; }
    } else if (c.dos || (c.op === 'mix' && Math.random() < .6)) {
      const llevar = c.op === 'mix' ? Math.random() < .5 : !!c.llevar;
      for (let k = 0; k < 60; k++) {
        if (o === '+') {
          a = ent(10, 89); b = (!llevar && RETO === 0 && Math.random() < .45) ? ent(1, 9) : ent(10, 89);
          const lleva = (a % 10) + (b % 10) >= 10;
          if (a + b <= 99 && lleva === llevar && (b % 10) !== 0) break;
        } else {
          a = ent(20, 99); b = (!llevar && RETO === 0 && Math.random() < .45) ? ent(1, 9) : ent(10, a - 1);
          const lleva = (a % 10) < (b % 10);
          if (b < a && lleva === llevar && (b % 10) !== 0) break;
        }
      }
    } else {
      const hi = c.op === 'mix' ? 20 : c.hi;
      const minR = Math.max(1, Math.round(hi * Math.min(.6, .2 + RETO * .13)));
      if (o === '+') { const r = ent(minR, hi); a = Math.random() < .08 ? 0 : ent(1, Math.max(1, r - 1)); b = r - a; }
      else { a = ent(Math.max(2, minR), hi); b = Math.random() < .08 ? 0 : ent(1, a - 1 || 1); if (b > a) b = a; }
    }
    return { a, b, o, r: calc(a, o, b) };
  }

  /* ---- GENERADORES ---- */
  const G = {};
  G.cuenta = lv => mejor(() => {
    const c = cfgDe(lv), hi = Math.min(c.hi, lv >= 8 ? 15 : 10), n = numRango(Math.max(1, c.lo), hi), ob = obj();
    return { tipo: 'cuenta', n, ob, opts: cerca(n, nOpc(), 1, hi + 2), id: 'c:' + n };
  });
  G.escucha = lv => mejor(() => {
    const c = cfgDe(lv), x = numRango(c.lo, c.hi);
    const opts = cerca(x, nOpc() + (EDAD >= 6 ? 1 : 0), Math.max(0, c.lo - 1), c.hi + 1, c.hi > 20 ? 10 : 0);
    if (c.hi > 20 && x > 12 && x % 10 !== x / 10 % 10) { const inv = (x % 10) * 10 + Math.floor(x / 10); if (inv !== x && inv <= 100 && !opts.includes(inv)) opts[opts.indexOf(opts.find(v => v !== x))] = inv; }   // 34 ↔ 43
    return { tipo: 'escucha', x, opts: shuffle(opts), id: 'n:' + x };
  });
  G.globos = lv => { const c = cfgDe(lv), x = numRango(c.lo, Math.min(c.hi, 20)); const otras = []; for (let v = Math.max(0, c.lo); v <= Math.min(c.hi, 20); v++) if (v !== x) otras.push(v); return otras.length >= 3 ? { tipo: 'globos', x, otras, id: 'n:' + x } : null; };
  G.traza = lv => { const c = cfgDe(lv); const x = String(lv >= 8 ? ent(10, 20) : ent(Math.max(0, c.lo), Math.min(9, c.hi)) || ent(1, 9)); return { tipo: 'traza', x, id: 't:' + x }; };
  G.ordena = lv => {
    const c = cfgDe(lv), k = EDAD <= 5 ? 3 : EDAD === 6 ? 4 : 5, set = new Set();
    while (set.size < k) set.add(numRango(c.lo, c.hi));
    const asc = RETO < 2 || Math.random() < .6;
    return { tipo: 'ordena', nums: shuffle([...set]), asc, id: 'or:' + [...set].sort((a, b) => a - b).join(',') };
  };
  G.vecinos = lv => mejor(() => {
    const c = cfgDe(lv), n = ent(Math.max(c.lo, 1), c.hi - 1), modo = pick(EDAD <= 5 ? ['d', 'd', 'a'] : ['d', 'a', 'm']);
    const fila = [n - 1, n, n + 1], i = modo === 'd' ? 2 : modo === 'a' ? 0 : 1;
    return { tipo: 'vecinos', fila, i, opts: cerca(fila[i], nOpc(), 0, c.hi + 2), id: 'v:' + fila.join(',') + ':' + i };
  });
  G.compara = lv => {
    const c = cfgDe(lv);
    if (lv <= 2 && (lv < 2 || Math.random() < .55)) {
      let a = ent(1, Math.min(10, c.hi)), b = ent(1, Math.min(10, c.hi)); while (b === a) b = ent(1, Math.min(10, c.hi));
      return { tipo: 'compara', modo: 'g', a, b, mas: Math.random() < .65, ob: obj(), id: 'cg:' + a + ',' + b };
    }
    let a = numRango(c.lo, c.hi), b = Math.random() < .2 ? a : numRango(c.lo, c.hi);
    if (c.hi > 20 && Math.random() < .3 && a > 10) b = (a % 10) * 10 + Math.floor(a / 10);
    return { tipo: 'compara', modo: 's', a, b, id: 'cs:' + a + ',' + b };
  };
  const FORMAS = [{ k: 'circulo', n: 'círculo', l: 0 }, { k: 'cuadrado', n: 'cuadrado', l: 4 }, { k: 'triangulo', n: 'triángulo', l: 3 }, { k: 'rectangulo', n: 'rectángulo', l: 4 },
    { k: 'estrella', n: 'estrella', l: 10 }, { k: 'rombo', n: 'rombo', l: 4 }, { k: 'pentagono', n: 'pentágono', l: 5 }, { k: 'hexagono', n: 'hexágono', l: 6 }, { k: 'ovalo', n: 'óvalo', l: 0 }];
  G.formas = lv => {
    const basicas = FORMAS.slice(0, EDAD <= 5 && RETO === 0 ? 4 : RETO >= 1 || EDAD >= 6 ? 9 : 6);
    if (EDAD >= 6 && Math.random() < .35) { const f = pick(FORMAS.filter(f => f.l >= 3 && f.l <= 6)); return { tipo: 'formas', modo: 'lados', f, opts: shuffle([...new Set([f.l, ...shuffle([3, 4, 5, 6]).filter(x => x !== f.l)])].slice(0, 3)), id: 'fl:' + f.k }; }
    const f = pick(basicas), otras = shuffle(basicas.filter(x => x.k !== f.k)).slice(0, nOpc() - 1);
    return { tipo: 'formas', modo: 'toca', f, opts: shuffle([f, ...otras]), colores: shuffle(['#17ff5f', '#18e0ff', '#ff4fa3', '#ffd23f', '#ff8a3d', '#8b5cff']), id: 'f:' + f.k };
  };
  G.serie = lv => {
    if (lv <= 3) {   // series de dibujos: AB, AAB, ABC…
      const pats = RETO === 0 && EDAD <= 5 ? ['AB', 'AAB'] : ['AB', 'AAB', 'ABB', 'ABC', 'AABB'];
      const p = pick(pats), set = shuffle(['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🚀', '🪐', '🔺', '🟦']).slice(0, 3);
      const sec = []; while (sec.length < 7) for (const ch of p) sec.push(set[ch.charCodeAt(0) - 65]);
      const items = sec.slice(0, 6), ok = sec[6];
      const usados2 = [...new Set(items)];
      const opts = shuffle([...new Set([ok, ...shuffle(usados2.filter(x => x !== ok)), ...set.filter(x => x !== ok)])].slice(0, 3));
      return { tipo: 'serie', items, ok, opts, emoji: true, id: 'se:' + p + set.join('') };
    }
    const c = cfgDe(lv);
    const saltos = lv >= 20 ? (c.tablas || [2, 5, 10]) : lv >= 13 ? [2, 5, 10, 2, 3] : [1, 1, 2];
    const s = pick(saltos), baja = lv >= 13 && RETO >= 1 && Math.random() < .3;
    let ini = lv >= 20 ? 0 : ent(0, Math.max(0, Math.min(c.hi, 100) - s * 6));
    if (lv >= 13 && s >= 5 && Math.random() < .6) ini = Math.floor(ini / s) * s;
    let items = Array.from({ length: 5 }, (_, k) => ini + k * s); if (baja) items = items.reverse();
    const ok = baja ? items[4] - s : items[4] + s;
    if (ok < 0) return null;
    return { tipo: 'serie', items, ok, opts: cerca(ok, nOpc(), 0, 200, s), id: 'se:' + items.join(',') };
  };
  G.vis = (lv, o) => mejor(() => {
    const c = cfgDe(lv), p = operacion(Object.assign({}, c, { op: o, hi: Math.min(c.hi, 10), dos: false }), o);
    return { tipo: 'vis', o, a: p.a, b: p.b, r: p.r, ob: obj(), opts: cerca(p.r, nOpc(), 0, 20), id: 'o:' + txtOp(p.a, o, p.b) };
  });
  G.sumaVis = lv => G.vis(lv, '+');
  G.restaVis = lv => G.vis(lv, '-');
  G.op = (lv, oF) => mejor(() => {
    const c = cfgDe(lv), p = operacion(c, oF);
    return { tipo: 'op', o: p.o, a: p.a, b: p.b, r: p.r, opts: cerca(p.r, nOpc(), 0, 200, p.o === 'x' ? Math.min(p.a, p.b) : 10), id: 'o:' + txtOp(p.a, p.o, p.b) };
  });
  G.mixta = lv => { const c = cfgDe(lv); const e = G.op(lv, c.op === 'x' ? 'x' : pick(['+', '-'])); if (e) e.mixta = true; return e; };
  G.hueco = lv => mejor(() => {
    const c = cfgDe(lv), p = operacion(c), cual = p.o === '-' && RETO < 1 ? 1 : rnd(2);
    const x = cual ? p.b : p.a;
    return { tipo: 'hueco', o: p.o, a: p.a, b: p.b, r: p.r, cual, opts: cerca(x, nOpc(), 0, 200), id: 'h:' + txtOp(p.a, p.o, p.b) + cual };
  });
  G.verdad = lv => {
    const c = cfgDe(lv), p = operacion(c), v = Math.random() < .5;
    let mostrado = p.r; if (!v) { mostrado = pick(cerca(p.r, 4, 0, 200).filter(x => x !== p.r)); }
    return { tipo: 'verdad', o: p.o, a: p.a, b: p.b, r: p.r, m: mostrado, v: mostrado === p.r, id: 'vf:' + txtOp(p.a, p.o, p.b) };
  };
  G.dictadoOp = lv => { const e = G.op(lv); if (e) e.tipo = 'dictadoOp'; return e; };
  /* problemas con historia */
  const PROB = {
    '+': [
      (n, a, b, o) => `${n} tiene ${a} ${o[1]}. Le regalan ${b} más. ¿Cuántos tiene ahora?`,
      (n, a, b, o) => `En la nave hay ${a} ${o[1]}. Lucas trae ${b} más. ¿Cuántos hay ahora?`,
      (n, a, b, o) => `${n} ve ${a} ${o[1]} por la mañana y ${b} por la tarde. ¿Cuántos ve en total?`,
      (n, a, b, o) => `En una caja hay ${a} ${o[1]} y en otra ${b}. ¿Cuántos hay entre las dos?`
    ],
    '-': [
      (n, a, b, o) => `${n} tenía ${a} ${o[1]} y regala ${b}. ¿Cuántos le quedan?`,
      (n, a, b, o) => `En la nave había ${a} ${o[1]}. Se escapan ${b}. ¿Cuántos quedan?`,
      (n, a, b, o) => `Hay ${a} ${o[1]} en el planeta. Un marciano se lleva ${b}. ¿Cuántos quedan?`,
      (n, a, b, o) => `${n} tiene ${a} ${o[1]} y pierde ${b}. ¿Cuántos tiene ahora?`
    ],
    'x': [
      (n, a, b, o) => `Hay ${a} cajas con ${b} ${o[1]} en cada una. ¿Cuántos hay en total?`,
      (n, a, b, o) => `${n} hace ${a} montones de ${b} ${o[1]}. ¿Cuántos hay en total?`,
      (n, a, b, o) => `En cada cohete van ${b} ${o[1]}. Despegan ${a} cohetes. ¿Cuántos viajan?`
    ]
  };
  /* «Cuántos» o «Cuántas» según el objeto */
  const genero = (t, o) => o[2] === 'f' ? t.replace(/Cuántos/g, 'Cuántas').replace(/ le quedan\?/, ' le quedan?') : t;
  G.problema = lv => mejor(() => {
    const c = cfgDe(lv);
    let p = operacion(c.op ? c : Object.assign({}, c, { op: '+' }));
    if (p.o === 'x' && (p.a > 9 || p.b > 9)) p = operacion(Object.assign({}, c, { tablas: [2, 3, 4, 5] }), 'x');
    if (p.a < 2 || p.b < 1) return null;
    const o = obj(), n = pick(NOMBRES);
    const texto = genero(pick(PROB[p.o])(n, p.a, p.b, o), o);
    return { tipo: 'problema', texto, ob: o, o: p.o, a: p.a, b: p.b, r: p.r, opts: cerca(p.r, nOpc(), 0, 200), id: 'p:' + txtOp(p.a, p.o, p.b) };
  });
  G.une = lv => {
    const c = cfgDe(lv), ps = [], rs = new Set();
    for (let k = 0; k < 40 && ps.length < 3; k++) { const p = operacion(c.op ? c : Object.assign({}, c, { op: '+', hi: Math.min(c.hi, 10) })); if (!rs.has(p.r)) { rs.add(p.r); ps.push({ t: txtOp(p.a, p.o, p.b), v: vozOp(p.a, p.o, p.b), r: p.r }); } }
    if (ps.length < 3) return null;
    return { tipo: 'une', ps, der: shuffle(ps), id: 'u:' + ps.map(p => p.t).join() };
  };
  G.dictado = lv => mejor(() => {
    const c = cfgDe(lv), n = numRango(Math.max(10, c.lo), c.hi);
    const dig = String(n).split(''), extra = shuffle('0123456789'.split('').filter(d => !dig.includes(d))).slice(0, EDAD <= 6 ? 1 : 2);
    return { tipo: 'dictado', n, dig, piezas: shuffle([...dig, ...extra]), id: 'd:' + n };
  });
  G.decenas = lv => mejor(() => {
    const c = cfgDe(lv), n = numRango(Math.max(11, c.lo), Math.min(99, c.hi)), d = Math.floor(n / 10), u = n % 10;
    const modo = EDAD >= 6 && RETO >= 1 && Math.random() < .4 ? pick(['d', 'u']) : 'num';
    const ok = modo === 'num' ? n : modo === 'd' ? d : u;
    let opts = modo === 'num' ? [...new Set([n, u * 10 + d, n + 10 <= 99 ? n + 10 : n - 10, n + 1])].filter(v => v > 0 && v <= 100) : cerca(ok, 3, 0, 9);
    if (!opts.includes(ok)) opts.push(ok);
    return { tipo: 'decenas', n, d, u, modo, ok, opts: shuffle([...new Set(opts)].slice(0, nOpc() + 1)), id: 'dc:' + n + modo };
  });
  G.pares = lv => mejor(() => { const n = RETO === 0 ? ent(1, 20) : ent(1, 99); return { tipo: 'pares', n, par: n % 2 === 0, id: 'pi:' + n }; });
  /* dinero en euros: monedas de 1 y 2 €, billetes de 5, 10 y 20 € */
  function bolsa(max) {
    const vals = max <= 10 ? [1, 2, 5] : [1, 2, 5, 10, 20], piezas = [];
    const k = EDAD <= 6 ? ent(2, 3) : ent(2, 4);
    for (let i = 0; i < k; i++) { const v = pick(vals); if (piezas.reduce((a, b) => a + b, 0) + v <= max) piezas.push(v); }
    if (!piezas.length) piezas.push(1);
    return piezas.sort((a, b) => b - a);
  }
  G.dinero = lv => mejor(() => { const piezas = bolsa(EDAD <= 6 && RETO === 0 ? 10 : 40), r = piezas.reduce((a, b) => a + b, 0); return { tipo: 'dinero', piezas, r, opts: cerca(r, nOpc(), 1, 60), id: '€:' + piezas.join('+') }; });
  const TIENDA = [['🍦', 'un helado'], ['🧸', 'un osito'], ['⚽', 'un balón'], ['🎨', 'unas pinturas'], ['🍕', 'una pizza'], ['🎮', 'un videojuego'], ['📚', 'un libro'], ['🪁', 'una cometa'], ['🚲', 'un patinete'], ['🎈', 'un globo']];
  G.compra = lv => { const piezas = bolsa(EDAD <= 6 ? 10 : 30), r = piezas.reduce((a, b) => a + b, 0), it = pick(TIENDA); const precio = Math.max(1, r + pick([-3, -2, -1, 0, 1, 2, 3])); return { tipo: 'compra', piezas, r, precio, it, v: r >= precio, id: '€c:' + r + '-' + precio }; };
  /* la hora */
  const HORAS = ['la una', 'las dos', 'las tres', 'las cuatro', 'las cinco', 'las seis', 'las siete', 'las ocho', 'las nueve', 'las diez', 'las once', 'las doce'];
  function txtHora(h, m) { const sig = h % 12 + 1; return m === 0 ? `${HORAS[h - 1]} en punto` : m === 30 ? `${HORAS[h - 1]} y media` : m === 15 ? `${HORAS[h - 1]} y cuarto` : `${HORAS[sig - 1]} menos cuarto`; }
  function minutos() { const ms = EDAD <= 5 || RETO === 0 ? [0, 0, 30] : EDAD === 6 ? [0, 30, 30, 15] : [0, 30, 15, 45]; return pick(ms); }
  G.hora = lv => mejor(() => {
    const h = ent(1, 12), m = minutos(), ok = txtHora(h, m);
    const set = new Set([ok]); let k = 0;
    while (set.size < 3 && k++ < 40) { const alt = pick([[h % 12 + 1, m], [h, m === 0 ? 30 : 0], [(h + 10) % 12 + 1, m], [ent(1, 12), m]]); set.add(txtHora(alt[0], alt[1])); }
    return { tipo: 'hora', h, m, ok, opts: shuffle([...set]), id: 'hr:' + h + ':' + m };
  });
  G.horaVF = lv => { const h = ent(1, 12), m = minutos(), v = Math.random() < .5; const hh = v ? h : h % 12 + 1; return { tipo: 'horaVF', h, m, txt: txtHora(hh, m), v, id: 'hv:' + h + ':' + m }; };
  G.grupos = lv => mejor(() => { const c = cfgDe(lv), t = pick(c.tablas || [2, 5]), g = ent(2, t >= 5 ? 4 : 5), ob = obj(); return { tipo: 'grupos', g, n: t, r: g * t, ob, opts: cerca(g * t, nOpc(), 0, 60, t), id: 'g:' + g + 'x' + t }; });

  /* ---- qué ejercicios salen en cada planeta ---- */
  function tipos(lv, edad) {
    const c = cfgDe(lv);
    if (c.genio) return { op: 4, problema: 4, hueco: 2, verdad: 2, une: 1.5, hora: 1, dinero: 1, decenas: 1, serie: 1.5, mixta: 2, compra: 1 };
    const t = Object.assign({}, c.t);
    if (edad >= 7) { if (t.cuenta) t.cuenta *= .6; if (t.globos) t.globos *= .6; if (t.problema) t.problema += .8; }
    if (edad <= 5) { if (t.problema) t.problema *= .5; if (t.verdad) t.verdad *= .7; }
    if (RETO >= 2) { if (t.hueco) t.hueco += .8; if (t.problema) t.problema += .5; }
    return t;
  }
  /* la Galaxia Genio usa operaciones de todos los planetas */
  const GENIO = { op: 23, problema: 23, hueco: 18, verdad: 14, une: 14, hora: 17, dinero: 16, decenas: 12, serie: 20, mixta: 19, compra: 16 };
  function eligeTipo(t, evitar) {
    const ks = Object.keys(t).filter(k => t[k] > 0 && k !== evitar && G[k]);
    const tot = ks.reduce((a, k) => a + t[k], 0); let r = Math.random() * tot;
    for (const k of ks) { r -= t[k]; if (r <= 0) return k; }
    return ks[0];
  }
  function mision({ lv, edad = 6, n = 8, repaso = false, maxLv }) {
    usados.clear(); NIVEL_ACT = lv; EDAD = edad;
    const vez = repaso ? 2 : (MEM.vis[lv] = (MEM.vis[lv] || 0) + 1) - 1;
    RETO = Math.min(3, Math.floor(vez / 2));
    const out = []; let prev = null, tries = 0;
    while (out.length < n && tries++ < 200) {
      let L = repaso ? Math.max(0, (maxLv || lv) - rnd(4)) : lv;
      const tp = eligeTipo(tipos(L, edad), prev);
      if (cfgDe(L).genio) L = GENIO[tp] != null ? GENIO[tp] : 23;
      const ej = G[tp](L, null, edad);
      if (!ej) continue;
      if (tries < 150 && out.some(o => o.id === ej.id)) continue;
      ej.lv = L; out.push(ej); prev = tp;
    }
    return out;
  }
  function setEdad(e) { EDAD = e; }

  return { reto: () => RETO, mision, marca, setMem, getMem: () => MEM, shuffle, pick, rnd, ent, quitaTildes, G, txtOp, vozOp, simb, calc, operacion, cerca, txtHora, FORMAS, tipos, setEdad, cfgDe, numRango };
})();
if (typeof module !== 'undefined') module.exports = ENG;
