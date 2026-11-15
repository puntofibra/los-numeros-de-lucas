/* =====================================================================
   ÁLBUM DE PEGATINAS · las pegatinas ganadas esperan amontonadas abajo;
   el niño las arrastra con el dedo hasta su sitio (tiene que LEER el nombre
   del hueco: no hay siluetas). Al acertar se pegan con efecto y sonido.
   Compartido por Leo con Lucas y Los números de Lucas.
   ===================================================================== */
(() => {
  const sinT = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const slug = p => p.n === 'Ábaco' ? 'pal-abaco' : 'peg-' + sinT(p.n).replace(/\s+/g, '-');
  const src = p => (window.DIB ? DIB.url(slug(p)) : '') + '?v=2';
  const giro = i => ((i * 37) % 13) - 6;           // inclinación fija y simpática de cada pegatina
  let arr = null;                                   // arrastre en curso

  const css = document.createElement('style');
  css.textContent = `
  #pAlbum .album { display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 10px; align-content: start;
    padding: 14px 12px 210px; border-radius: 26px; margin-top: 6px;
    background: radial-gradient(120% 80% at 50% 0%, rgba(80,120,255,.22), transparent 60%), linear-gradient(160deg, rgba(20,34,78,.92), rgba(30,14,60,.92));
    border: 2px solid rgba(140,200,255,.25); box-shadow: inset 0 0 40px rgba(0,0,0,.45), 0 10px 30px rgba(0,0,0,.4); }
  .alb-h { position: relative; aspect-ratio: 1; border-radius: 20px; display: flex; align-items: center; justify-content: center; text-align: center;
    background: rgba(255,255,255,.05); border: 3px dashed rgba(160,220,255,.35); transition: transform .2s, border-color .2s, background .2s; }
  .alb-h .hn { font-family: var(--f-lectura); font-weight: 700; font-size: 16px; line-height: 1.05; color: #dff2ff; padding: 4px; text-shadow: 0 2px 4px rgba(0,0,0,.6); overflow-wrap: normal; hyphens: none; }
  .alb-h.encima { border-color: var(--amarillo); background: rgba(255,210,63,.16); transform: scale(1.07); }
  .alb-h.malo { animation: huecoMal .45s; border-color: #ff4d6d; }
  .alb-h.lleno { border: 2px solid rgba(255,255,255,.12); background: radial-gradient(circle at 50% 40%, rgba(255,255,255,.14), rgba(255,255,255,.03) 70%); overflow: hidden; }
  .alb-h.lleno .hn { position: absolute; bottom: 3px; left: 0; right: 0; font-size: 11px; opacity: .85; }
  .alb-h.lleno img { width: 88%; height: 88%; object-fit: contain; margin-top: -8px; filter: drop-shadow(0 4px 6px rgba(0,0,0,.5)); }
  .alb-h.lleno::after { content: ''; position: absolute; inset: -40%; background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%);
    transform: translateX(-100%); animation: brilloPeg 5s ease-in-out infinite; animation-delay: var(--d, 0s); pointer-events: none; }
  .alb-h.recien img { animation: pegada .6s cubic-bezier(.3,1.7,.5,1); }
  .alb-h.recien::before { content: ''; position: absolute; inset: 10%; border-radius: 50%; border: 4px solid var(--amarillo); animation: onda .7s ease-out forwards; pointer-events: none; }
  @keyframes brilloPeg { 0%, 70% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  @keyframes pegada { 0% { transform: scale(1.6) rotate(-15deg); } 100% { transform: scale(1) rotate(var(--g, 0deg)); } }
  @keyframes onda { 0% { transform: scale(.4); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
  @keyframes huecoMal { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
  .monton { position: fixed; left: 12px; right: 12px; bottom: calc(12px + var(--safe-b)); height: 170px; z-index: 4; border-radius: 26px;
    background: linear-gradient(180deg, rgba(58,40,12,.94), rgba(36,18,52,.96)); border: 2px solid rgba(255,210,63,.45);
    box-shadow: 0 0 24px rgba(255,210,63,.25), inset 0 0 30px rgba(0,0,0,.35); touch-action: none; }
  .monton.vacio { display: none; }
  #pAlbum.con-monton .album-lucas { display: none; }
  .monton .mt { position: absolute; top: 6px; left: 0; right: 0; text-align: center; font-family: var(--f-titulo); font-size: 15px; color: var(--amarillo); text-shadow: 0 2px 4px rgba(0,0,0,.6); pointer-events: none; }
  .monton .mt b { display: inline-block; min-width: 26px; padding: 0 6px; margin-left: 4px; border-radius: 12px; background: var(--amarillo); color: #3a2400; }
  .peg-suelta { position: absolute; width: 104px; height: 104px; left: 50%; top: 58%; margin: -52px 0 0 -52px; touch-action: none; cursor: grab;
    filter: drop-shadow(0 6px 8px rgba(0,0,0,.55)); transition: transform .25s cubic-bezier(.3,1.4,.5,1); }
  .peg-suelta img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; -webkit-user-drag: none; }
  .peg-suelta.cima { animation: cimaBota 2.2s ease-in-out infinite; }
  @keyframes cimaBota { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
  .peg-vuela { position: fixed !important; margin: 0 !important; z-index: 9999; cursor: grabbing; pointer-events: none; animation: none !important;
    filter: drop-shadow(0 18px 18px rgba(0,0,0,.6)) drop-shadow(0 0 14px rgba(255,210,63,.6)); }
  .peg-vuela.vuelve { transition: left .35s cubic-bezier(.3,1.3,.5,1), top .35s cubic-bezier(.3,1.3,.5,1), transform .35s; }
  .peg-vuela.encaja { transition: left .28s ease-in, top .28s ease-in, width .28s, height .28s, transform .28s; }
  `;
  document.head.appendChild(css);

  function pinta() {
    const d = datos(); if (!Array.isArray(d.pegPuesta)) d.pegPuesta = [];
    d.pegPuesta = d.pegPuesta.filter(i => d.peg.includes(i));
    const A = $('#album'); A.innerHTML = '';
    $('#albumCuenta').textContent = d.pegPuesta.length + '/' + PEGATINAS.length;
    PEGATINAS.forEach((p, i) => {
      const h = el('div', 'alb-h'); h.dataset.i = i;
      if (d.pegPuesta.includes(i)) lleno(h, p, i, false);
      else h.innerHTML = `<span class="hn" data-sin-dib>${p.n}</span>`;
      h.onclick = () => { if (h.classList.contains('lleno')) { SFX.pop(); FX.chispas(h, 16); VOZ.decir(p.n); } };
      A.appendChild(h);
    });
    pintaMonton();
  }
  function lleno(h, p, i, recien) {
    h.className = 'alb-h lleno' + (recien ? ' recien' : '');
    h.style.setProperty('--g', giro(i) + 'deg'); h.style.setProperty('--d', (i % 7) * .6 + 's');
    h.innerHTML = `<img src="${src(p)}" alt="" draggable="false" style="transform:rotate(${giro(i)}deg)"><span class="hn" data-sin-dib>${p.n}</span>`;
  }
  function pendientes() { const d = datos(); return d.peg.filter(i => !(d.pegPuesta || []).includes(i)); }
  function pintaMonton() {
    let M = $('#pegMonton');
    if (!M) { M = el('div', 'monton'); M.id = 'pegMonton'; $('#pAlbum').appendChild(M); }
    const l = pendientes(); M.innerHTML = `<div class="mt">Pegatinas para pegar <b>${l.length}</b></div>`;
    M.classList.toggle('vacio', !l.length); $('#pAlbum').classList.toggle('con-monton', !!l.length);
    l.forEach((i, k) => {
      const s = el('div', 'peg-suelta' + (k === l.length - 1 ? ' cima' : ''));
      s.dataset.i = i; s.innerHTML = `<img src="${src(PEGATINAS[i])}" alt="" draggable="false">`;
      const off = (k - (l.length - 1) / 2);
      s.style.transform = `translate(${Math.max(-130, Math.min(130, off * 22))}px, ${(k % 3) * 4 - 4}px) rotate(${giro(i * 3 + k) * 2}deg)`;
      s.style.zIndex = 10 + k;
      s.addEventListener('pointerdown', coge);
      M.appendChild(s);
    });
  }

  function huecoEn(x, y) { const e = document.elementFromPoint(x, y); return e && e.closest ? e.closest('.alb-h') : null; }
  function coge(ev) {
    if (arr) return; ev.preventDefault();
    const s = ev.currentTarget, r = s.getBoundingClientRect();
    arr = { s, i: +s.dataset.i, dx: ev.clientX - r.left, dy: ev.clientY - r.top, ini: r, hueco: null, scroll: 0 };
    s.classList.remove('cima'); s.classList.add('peg-vuela'); s.style.transform = 'scale(1.18) rotate(-4deg)';
    s.style.left = r.left + 'px'; s.style.top = r.top + 'px'; document.body.appendChild(s);
    SFX.pieza();
    try { s.setPointerCapture(ev.pointerId); } catch (e) {}
    s.addEventListener('pointermove', mueve); s.addEventListener('pointerup', suelta); s.addEventListener('pointercancel', suelta);
    bucleScroll();
  }
  function mueve(ev) {
    if (!arr) return;
    arr.x = ev.clientX; arr.y = ev.clientY;
    arr.s.style.left = (ev.clientX - arr.dx) + 'px'; arr.s.style.top = (ev.clientY - arr.dy) + 'px';
    const h = huecoEn(ev.clientX, ev.clientY);
    const vale = h && !h.classList.contains('lleno') ? h : null;
    if (vale !== arr.hueco) { if (arr.hueco) arr.hueco.classList.remove('encima'); arr.hueco = vale; if (vale) { vale.classList.add('encima'); SFX.clic(); } }
    const A = $('#album').getBoundingClientRect(), M = $('#pegMonton').getBoundingClientRect();
    arr.scroll = ev.clientY < A.top + 60 ? -1 : (ev.clientY > Math.min(A.bottom, M.top) - 50 && ev.clientY < M.top + 10 ? 1 : 0);
  }
  function bucleScroll() {
    if (!arr) return;
    if (arr.scroll) { $('#album').scrollTop += arr.scroll * 9; if (arr.x != null) mueve({ clientX: arr.x, clientY: arr.y }); }
    requestAnimationFrame(bucleScroll);
  }
  function suelta(ev) {
    if (!arr) return;
    const a = arr; arr = null; const s = a.s;
    s.removeEventListener('pointermove', mueve); s.removeEventListener('pointerup', suelta); s.removeEventListener('pointercancel', suelta);
    const h = huecoEn(ev.clientX, ev.clientY); if (a.hueco) a.hueco.classList.remove('encima');
    if (h && !h.classList.contains('lleno') && +h.dataset.i === a.i) return encaja(s, h, a.i);
    if (h && !h.classList.contains('lleno')) {
      h.classList.remove('malo'); void h.offsetWidth; h.classList.add('malo'); SFX.mal();
      VOZ.decir(pick(['¡Ups! Ahí no va. Lee bien los nombres.', 'Ese no es su sitio. ¡Lee otra vez!', 'Casi… Busca dónde pone su nombre.']));
    }
    vuelve(s, a.ini);
  }
  function vuelve(s, r) {
    s.classList.add('vuelve'); s.style.left = r.left + 'px'; s.style.top = r.top + 'px'; s.style.transform = 'scale(1)';
    setTimeout(() => { s.remove(); pintaMonton(); }, 380);
  }
  function encaja(s, h, i) {
    const r = h.getBoundingClientRect(), w = r.width * .8;
    s.classList.add('encaja'); s.style.width = w + 'px'; s.style.height = w + 'px';
    s.style.left = (r.left + (r.width - w) / 2) + 'px'; s.style.top = (r.top + (r.height - w) / 2 - 8) + 'px'; s.style.transform = `rotate(${giro(i)}deg)`;
    setTimeout(() => {
      s.remove();
      const d = datos(); if (!d.pegPuesta.includes(i)) d.pegPuesta.push(i); d._t = Date.now(); guardarNino();
      lleno(h, PEGATINAS[i], i, true);
      SFX.pop(); setTimeout(() => SFX.ok(), 90);
      FX.chispas(h, 46, '#ffd23f');
      if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) {}
      $('#albumCuenta').textContent = d.pegPuesta.length + '/' + PEGATINAS.length;
      const quedan = pendientes().length;
      if (d.pegPuesta.length === PEGATINAS.length) { setTimeout(() => { SFX.fanfarria(); FX.confeti(160); VOZ.decir('¡Increíble! ¡Has completado el álbum entero!'); }, 500); }
      else VOZ.decir(pick(['¡Genial! ', '¡Muy bien! ', '¡Perfecto! ']) + PEGATINAS[i].n + (quedan ? '' : '. ¡Ya las has pegado todas!'));
      pintaMonton();
    }, 290);
  }

  ON_PANTALLA.pAlbum = () => {
    pinta(); const d = datos(), n = pendientes().length;
    d.pegNueva = null;
    if (n) VOZ.decir(n === 1 ? 'Tienes una pegatina nueva. Arrástrala a su sitio. ¡Lee bien dónde va!' : `Tienes ${n} pegatinas para pegar. Arrástralas a su sitio. ¡Lee bien dónde va cada una!`);
    else VOZ.decir(`Tienes ${d.pegPuesta.length} pegatinas de ${PEGATINAS.length}. ¡A por todas!`);
  };
})();
