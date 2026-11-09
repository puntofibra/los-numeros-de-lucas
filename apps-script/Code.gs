/* =====================================================================
   LOS NÚMEROS DE LUCAS · Backend (Apps Script + Google Sheet)
   Frontend: https://puntofibra.github.io/los-numeros-de-lucas/
   1) Ejecuta preparar() una vez (crea la hoja y pide permisos)
   2) Implementar → Aplicación web → Ejecutar como: yo · Acceso: cualquier usuario
   ===================================================================== */
const GOOGLE_CLIENT_ID = '454055120059-nuhaop4r62urc3u036cc3grpqo71ulg7.apps.googleusercontent.com';
const NOMBRE_HOJA = 'los numeros de lucas';
const ADMIN = 'futurmovil.com@gmail.com';

function doGet(e) {
  return responder_({ ok: true, app: 'Los números de Lucas', hora: new Date() }, e && e.parameter && e.parameter.callback);
}
function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents || '{}'); } catch (err) { return responder_({ ok: false, error: 'Petición no válida' }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return responder_(accion_(d));
  } catch (err) {
    return responder_({ ok: false, error: String(err && err.message || err) });
  } finally { try { lock.releaseLock(); } catch (e2) {} }
}
function accion_(d) {
  switch (d.accion) {
    case 'registro': return registro_(d);
    case 'login': return login_(d);
    case 'google': return google_(d);
    case 'estado': return estado_(d);
    case 'recuperar': return recuperar_(d);
    case 'nuevaClave': return nuevaClave_(d);
    case 'guardarNino': return guardarNino_(d);
    case 'borrarNino': return borrarNino_(d);
    case 'pagoAviso': return pagoAviso_(d);
    case 'nfcEstado': return nfcEstado_();
    case 'config': return { ok: true, pjNuevos: PropertiesService.getScriptProperties().getProperty('PJ_NUEVOS') === '1' };
    case 'nfcRegistrar': return nfcRegistrar_(d);
    case 'nfcLogin': return nfcLogin_(d);
    case 'admin': return admin_(d);
    default: return { ok: false, error: 'Acción desconocida' };
  }
}
function responder_(out, cb) {
  const json = JSON.stringify(out);
  if (cb && /^[\w$.]+$/.test(cb)) return ContentService.createTextOutput(cb + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- preparar ---------------- */
function preparar() {
  ss_(); hUsuarios_(); hNinos_(); hActividad_();
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=x', { muteHttpExceptions: true });
  return 'Listo: ' + ss_().getUrl();
}

/* ---------------- hojas ---------------- */
function ss_() {
  const P = PropertiesService.getScriptProperties();
  let id = P.getProperty('SHEET_ID') || '1GToM0WcoNeyEMoKvjCjdWsybnGRJ8RPtCWFon52EjPo';
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const files = DriveApp.getFilesByName(NOMBRE_HOJA);
  while (files.hasNext()) { const f = files.next(); if (f.getMimeType() === MimeType.GOOGLE_SHEETS) { P.setProperty('SHEET_ID', f.getId()); return SpreadsheetApp.openById(f.getId()); } }
  const s = SpreadsheetApp.create(NOMBRE_HOJA);
  P.setProperty('SHEET_ID', s.getId());
  return s;
}
function hoja_(nombre, cab) {
  const s = ss_(); let h = s.getSheetByName(nombre);
  if (!h) {
    h = s.insertSheet(nombre); h.appendRow(cab); h.setFrozenRows(1);
    h.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#0b1633').setFontColor('#17ff5f');
    const def = s.getSheetByName('Hoja 1') || s.getSheetByName('Sheet1');
    if (def && s.getSheets().length > 1 && def.getLastRow() === 0) s.deleteSheet(def);
  }
  return h;
}
const CAB_USU = ['email', 'nombre', 'hash', 'sal', 'google', 'alta', 'ultimo', 'tokens', 'codigo', 'codigoCad', 'diasUso', 'ultDia', 'licencia', 'pagoAviso'];
function hUsuarios_() {
  const h = hoja_('Usuarios', CAB_USU);
  if (h.getLastColumn() < CAB_USU.length) h.getRange(1, 1, 1, CAB_USU.length).setValues([CAB_USU]).setFontWeight('bold').setBackground('#0b1633').setFontColor('#17ff5f');
  return h;
}
const hNinos_ = () => hoja_('Ninos', ['id', 'email', 'nombre', 'edad', 'color', 'nivel', 'estrellas', 'chispas', 'racha', 'minutos', 'ejercicios', 'aciertos%', 'actualizado', 'datos']);
const hActividad_ = () => hoja_('Actividad', ['fecha', 'email', 'nino', 'nivel', 'estrellas', 'ejercicios']);
const U = { email: 0, nombre: 1, hash: 2, sal: 3, google: 4, alta: 5, ultimo: 6, tokens: 7, codigo: 8, codigoCad: 9, diasUso: 10, ultDia: 11, licencia: 12, pagoAviso: 13 };
const DIAS_PRUEBA = 15, PRECIO = '2,99';

function buscaUsuario_(email) {
  const h = hUsuarios_(), v = h.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]).toLowerCase() === email) return { fila: i + 1, v: v[i], h };
  return null;
}
function porToken_(token) {
  if (!token) return null;
  const c = CacheService.getScriptCache().get('t_' + token);
  if (c) { const u = buscaUsuario_(c); if (u) return u; }
  const h = hUsuarios_(), v = h.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][U.tokens]).split(',').indexOf(token) >= 0) { CacheService.getScriptCache().put('t_' + token, String(v[i][0]).toLowerCase(), 21600); return { fila: i + 1, v: v[i], h }; }
  }
  return null;
}
function hash_(pass, sal) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + '|' + pass, Utilities.Charset.UTF_8);
  return b.map(x => ('0' + (x & 255).toString(16)).slice(-2)).join('');
}
function nuevoToken_(u) {
  const t = Utilities.getUuid();
  const lista = String(u.v[U.tokens] || '').split(',').filter(String);
  lista.push(t);
  u.h.getRange(u.fila, U.tokens + 1).setValue(lista.slice(-6).join(','));
  u.h.getRange(u.fila, U.ultimo + 1).setValue(new Date());
  return t;
}
function sesion_(u, token) {
  const email = String(u.v[0]).toLowerCase();
  /* cuenta los días distintos en que se usa la app (no días naturales) */
  const hoy = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
  let dias = Number(u.v[U.diasUso]) || 0;
  if (String(u.v[U.ultDia]) !== hoy) { dias++; u.h.getRange(u.fila, U.diasUso + 1, 1, 2).setValues([[dias, hoy]]); }
  const aviso = u.v[U.pagoAviso] ? new Date(u.v[U.pagoAviso]) : null;
  const licencia = email === ADMIN || !!u.v[U.licencia];
  return { ok: true, token, email, nombre: u.v[U.nombre], ninos: ninosDe_(email), admin: email === ADMIN,
    pjNuevos: PropertiesService.getScriptProperties().getProperty('PJ_NUEVOS') === '1',
    lic: { ok: licencia, dias, prueba: DIAS_PRUEBA, bloqueo: !licencia && dias >= DIAS_PRUEBA,
      avisado: !!aviso, espera: !!aviso && (Date.now() - aviso.getTime()) < 48 * 3600e3, precio: PRECIO } };
}
const emailOk_ = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

/* ---------------- cuentas ---------------- */
function registro_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  if (!emailOk_(email)) return { ok: false, error: 'El correo no es válido' };
  if (!d.pass || String(d.pass).length < 6) return { ok: false, error: 'La contraseña necesita al menos 6 caracteres' };
  if (buscaUsuario_(email)) return { ok: false, error: 'Ese correo ya tiene cuenta. Pulsa «Entrar».' };
  const sal = Utilities.getUuid();
  hUsuarios_().appendRow([email, String(d.nombre || '').slice(0, 40), hash_(d.pass, sal), sal, '', new Date(), new Date(), '', '', '']);
  const u = buscaUsuario_(email);
  return sesion_(u, nuevoToken_(u));
}
function login_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const u = buscaUsuario_(email);
  if (!u) return { ok: false, error: 'No hay ninguna cuenta con ese correo' };
  if (!u.v[U.hash]) return { ok: false, error: 'Esta cuenta se creó con Google. Pulsa «Continuar con Google» o recupera la contraseña.' };
  if (hash_(d.pass, u.v[U.sal]) !== u.v[U.hash]) return { ok: false, error: 'Contraseña incorrecta' };
  return sesion_(u, nuevoToken_(u));
}
function google_(d) {
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(d.credential || ''), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, error: 'No se pudo verificar la cuenta de Google' };
  const info = JSON.parse(r.getContentText());
  if (info.aud !== GOOGLE_CLIENT_ID) return { ok: false, error: 'Cliente de Google no válido' };
  if (String(info.email_verified) !== 'true') return { ok: false, error: 'Correo de Google sin verificar' };
  const email = String(info.email).toLowerCase();
  let u = buscaUsuario_(email);
  if (!u) {
    hUsuarios_().appendRow([email, info.name || info.given_name || '', '', '', info.sub, new Date(), new Date(), '', '', '']);
    u = buscaUsuario_(email);
  } else if (!u.v[U.google]) u.h.getRange(u.fila, U.google + 1).setValue(info.sub);
  return sesion_(u, nuevoToken_(u));
}
function estado_(d) {
  const u = porToken_(d.token);
  if (!u) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };
  return sesion_(u, d.token);
}
function recuperar_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const u = buscaUsuario_(email);
  if (!u) return { ok: false, error: 'No hay ninguna cuenta con ese correo' };
  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  u.h.getRange(u.fila, U.codigo + 1, 1, 2).setValues([[codigo, new Date(Date.now() + 30 * 60000)]]);
  MailApp.sendEmail({
    to: email, name: 'Los números de Lucas', subject: 'Tu código para Los números de Lucas: ' + codigo,
    htmlBody: '<div style="font-family:Arial;background:#050a1a;color:#fff;padding:24px;border-radius:16px">' +
      '<h2 style="color:#17ff5f">🚀 Los números de Lucas</h2><p>Tu código para crear una contraseña nueva es:</p>' +
      '<p style="font-size:34px;font-weight:bold;letter-spacing:6px;color:#17ff5f">' + codigo + '</p>' +
      '<p>Caduca en 30 minutos. Si no lo has pedido tú, ignora este correo.</p><p style="color:#9ab">FuturMovil</p></div>'
  });
  return { ok: true };
}
function nuevaClave_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const u = buscaUsuario_(email);
  if (!u) return { ok: false, error: 'No hay ninguna cuenta con ese correo' };
  if (!u.v[U.codigo] || String(u.v[U.codigo]) !== String(d.codigo).trim()) return { ok: false, error: 'El código no es correcto' };
  if (new Date(u.v[U.codigoCad]) < new Date()) return { ok: false, error: 'El código ha caducado. Pide otro.' };
  if (!d.pass || String(d.pass).length < 6) return { ok: false, error: 'La contraseña necesita al menos 6 caracteres' };
  const sal = Utilities.getUuid();
  u.h.getRange(u.fila, U.hash + 1, 1, 2).setValues([[hash_(d.pass, sal), sal]]);
  u.h.getRange(u.fila, U.codigo + 1, 1, 2).setValues([['', '']]);
  const u2 = buscaUsuario_(email);
  return sesion_(u2, nuevoToken_(u2));
}

/* ---------------- niños ---------------- */
function ninosDe_(email) {
  const v = hNinos_().getDataRange().getValues(), out = [];
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][1]).toLowerCase() !== email) continue;
    let datos = null; try { datos = JSON.parse(v[i][13] || 'null'); } catch (e) {}
    out.push({ id: v[i][0], nombre: v[i][2], edad: Number(v[i][3]) || 6, color: Number(v[i][4]) || 0, datos });
  }
  return out;
}
function guardarNino_(d) {
  const u = porToken_(d.token);
  if (!u) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };
  const email = String(u.v[0]).toLowerCase();
  const n = d.nino || {};
  if (!n.nombre) return { ok: false, error: 'Falta el nombre' };
  const h = hNinos_(), v = h.getDataRange().getValues();
  let fila = -1;
  if (n.id) for (let i = 1; i < v.length; i++) if (v[i][0] === n.id) { if (String(v[i][1]).toLowerCase() !== email) return { ok: false, error: 'No permitido' }; fila = i + 1; break; }
  if (!n.id) n.id = 'n' + Utilities.getUuid().slice(0, 8);
  const D = n.datos || {};
  let json = JSON.stringify(D);
  if (json.length > 48000 && D.mem && D.mem.seen) {   // límite de celda: recorta memoria antigua
    const ks = Object.keys(D.mem.seen).sort((a, b) => D.mem.seen[a] - D.mem.seen[b]);
    ks.slice(0, Math.ceil(ks.length / 2)).forEach(k => delete D.mem.seen[k]);
    json = JSON.stringify(D);
  }
  const st = D.st || {};
  let nivel = 0; const plan = D.plan || {};
  while (plan[nivel] && (plan[nivel].m >= 2 || plan[nivel].e >= 3)) nivel++;
  const fila_ = [n.id, email, String(n.nombre).slice(0, 20), Number(n.edad) || 6, Number(n.color) || 0, nivel, D.est || 0, D.chispas || 0,
    (D.racha && D.racha.n) || 0, Math.round((st.seg || 0) / 60), st.ej || 0, st.ej ? Math.round(st.ok / st.ej * 100) : 0, new Date(), json];
  if (fila > 0) {
    const prevEj = Number(v[fila - 1][10]) || 0;
    h.getRange(fila, 1, 1, fila_.length).setValues([fila_]);
    if ((st.ej || 0) > prevEj) hActividad_().appendRow([new Date(), email, n.nombre, nivel, D.est || 0, (st.ej || 0) - prevEj]);
  } else h.appendRow(fila_);
  return { ok: true, nino: { id: n.id } };
}
function borrarNino_(d) {
  const u = porToken_(d.token);
  if (!u) return { ok: false, error: 'Sesión caducada' };
  const email = String(u.v[0]).toLowerCase();
  const h = hNinos_(), v = h.getDataRange().getValues();
  for (let i = v.length - 1; i >= 1; i--) if (v[i][0] === d.id && String(v[i][1]).toLowerCase() === email) h.deleteRow(i + 1);
  return { ok: true };
}

/* ---------------- resumen semanal por correo ----------------
   Ejecuta instalarResumen() UNA vez a mano: crea un aviso automático
   cada domingo a las 19:00 (hora de Madrid) que llama a resumenSemanal(). */
function instalarResumen() {
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'resumenSemanal') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('resumenSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(19).inTimezone('Europe/Madrid').create();
  return 'Resumen semanal activado (domingos 19:00)';
}
function resumenSemanal(soloEmail) {
  if (soloEmail && typeof soloEmail !== 'string') soloEmail = null;   // al lanzarlo el aviso automático llega un objeto
  const usuarios = hUsuarios_().getDataRange().getValues().slice(1).filter(u => !soloEmail || String(u[0]).toLowerCase() === soloEmail);
  const ninos = hNinos_().getDataRange().getValues().slice(1);
  const PL = ['números 1-5', 'números hasta 10', 'más, menos e igual', 'formas y series', 'sumas hasta 5', 'restas hasta 5', 'sumas hasta 10', 'restas hasta 10', 'números hasta 20', 'decenas y unidades', 'sumas hasta 20', 'restas hasta 20', 'números hasta 100', 'pares e impares', 'sumas de dos cifras', 'restas de dos cifras', 'el dinero', 'la hora', 'sumas llevando', 'restas llevando', 'tablas del 2, 5 y 10', 'tablas del 3 y 4', 'tablas del 6 al 9', 'la división', 'desafíos de genio'];
  const dias = [];
  for (let i = 0; i < 7; i++) dias.push(Utilities.formatDate(new Date(Date.now() - i * 864e5), 'Europe/Madrid', 'yyyy-MM-dd'));
  usuarios.forEach(u => {
    const email = String(u[0]).toLowerCase(); if (!email) return;
    const suyos = ninos.filter(n => String(n[1]).toLowerCase() === email);
    const bloques = [];
    suyos.forEach(n => {
      let d = {}; try { d = JSON.parse(n[13] || '{}') || {}; } catch (e) {}
      if (d.aj && d.aj.resumen === false) return;
      const st = d.st || {}, porDia = st.dias || {};
      const minDias = dias.map(k => Math.round((porDia[k] || 0) / 60));
      const minSemana = minDias.reduce((a, b) => a + b, 0), diasActivo = minDias.filter(x => x > 0).length;
      let nivel = 0; const plan = d.plan || {}; while (plan[nivel] && (plan[nivel].m >= 2 || plan[nivel].e >= 3)) nivel++;
      const dificiles = Object.keys((d.mem && d.mem.fail) || {}).filter(k => /^(o|p|h|vf):/.test(k)).sort((a, b) => d.mem.fail[b] - d.mem.fail[a]).slice(0, 8).map(k => k.replace(/^\w+:/, '').replace(/[01]$/, ''));
      const pct = st.ej ? Math.round(st.ok / st.ej * 100) : 0;
      const barras = minDias.slice().reverse().map((m, i) => '<td style="vertical-align:bottom;text-align:center;padding:0 3px"><div style="width:22px;margin:auto;height:' + Math.min(80, m * 4 + 2) + 'px;background:#17ff5f;border-radius:6px 6px 0 0"></div><div style="font-size:11px;color:#9ab">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'][(new Date(Date.now() - (6 - i) * 864e5).getDay() + 6) % 7] + '</div></td>').join('');
      const animo = diasActivo >= 5 ? '¡Semana espectacular! 🌟' : diasActivo >= 3 ? '¡Muy buena semana! 👏' : diasActivo >= 1 ? 'Un poquito cada día marca la diferencia 💪' : 'Esta semana no ha jugado. ¡Lucas le está esperando! 🤖';
      bloques.push('<div style="background:#0f1d3d;border:1px solid #2b4a7a;border-radius:16px;padding:18px;margin:14px 0">' +
        '<h2 style="margin:0 0 6px;color:#fff">' + n[2] + ' <span style="font-size:14px;color:#9ab">(' + n[3] + ' años)</span></h2>' +
        '<p style="margin:0 0 12px;color:#ffd23f;font-weight:bold">' + animo + '</p>' +
        '<table style="width:100%;color:#fff;font-size:14px"><tr>' +
        '<td><b style="font-size:24px;color:#17ff5f">' + minSemana + '</b><br>minutos esta semana</td>' +
        '<td><b style="font-size:24px;color:#17ff5f">' + diasActivo + '/7</b><br>días jugando</td>' +
        '<td><b style="font-size:24px;color:#17ff5f">' + pct + '%</b><br>aciertos</td></tr></table>' +
        '<table style="margin:14px 0"><tr>' + barras + '</tr></table>' +
        '<p style="color:#fff;margin:6px 0">🪐 Va por el planeta de <b>' + (PL[Math.min(nivel, 24)] || '') + '</b> · ⭐ ' + (d.est || 0) + ' estrellas · 🔥 racha de ' + ((d.racha && d.racha.n) || 0) + ' días · 📒 ' + ((d.peg || []).length) + ' pegatinas</p>' +
        (dificiles.length ? '<p style="color:#fff;margin:6px 0">🧠 Operaciones para repasar juntos: <b>' + dificiles.join(', ') + '</b></p>' : '') +
        '</div>');
    });
    if (!bloques.length) return;
    MailApp.sendEmail({
      to: email, name: 'Los números de Lucas', subject: '🔢 Resumen semanal de Los números de Lucas',
      htmlBody: '<div style="font-family:Arial,sans-serif;background:#050a1a;color:#fff;padding:24px;border-radius:18px;max-width:560px;margin:auto">' +
        '<h1 style="color:#17ff5f;margin:0">🚀 Los números de Lucas</h1><p style="color:#cde">Hola' + (u[1] ? ' ' + u[1] : '') + ', este es el resumen de matemáticas de esta semana:</p>' +
        bloques.join('') +
        '<p style="text-align:center;margin:20px 0"><a href="https://puntofibra.github.io/los-numeros-de-lucas/" style="background:#17ff5f;color:#032b12;padding:12px 22px;border-radius:14px;text-decoration:none;font-weight:bold">Abrir Los números de Lucas</a></p>' +
        '<p style="color:#789;font-size:12px">Puedes desactivar este correo en la Zona de papás → Ajustes. FuturMovil</p></div>'
    });
  });
}


/* ---------------- licencia (pago único tras 15 días de uso) ---------------- */
function pagoAviso_(d) {
  const u = porToken_(d.token); if (!u) return { ok: false, error: 'Sesión caducada' };
  if (!u.v[U.pagoAviso]) u.h.getRange(u.fila, U.pagoAviso + 1).setValue(new Date());
  try {
    MailApp.sendEmail({ to: ADMIN, name: 'Los números de Lucas', subject: '💶 Pago pendiente de confirmar · ' + u.v[0],
      htmlBody: '<p><b>' + u.v[0] + '</b> (' + (u.v[U.nombre] || '') + ') dice que ha pagado la licencia de Los números de Lucas (' + PRECIO + ' €).</p><p>Compruébalo en myPOS y actívalo desde el modo admin de la app.</p>' });
  } catch (e) {}
  return { ok: true };
}

/* ---------------- llave NFC del admin ---------------- */
function hashSerial_(serial) {
  const P = PropertiesService.getScriptProperties();
  let sal = P.getProperty('NFC_SAL'); if (!sal) { sal = Utilities.getUuid(); P.setProperty('NFC_SAL', sal); }
  return hash_(String(serial).toUpperCase().replace(/[^0-9A-F]/g, ''), sal);
}
function nfcEstado_() { return { ok: true, registrada: !!PropertiesService.getScriptProperties().getProperty('NFC_HASH') }; }
function nfcRegistrar_(d) {
  const P = PropertiesService.getScriptProperties();
  if (P.getProperty('NFC_HASH')) return { ok: false, error: 'Ya hay una llave guardada' };
  const u = porToken_(d.token);
  if (!u || String(u.v[0]).toLowerCase() !== ADMIN) return { ok: false, error: 'Solo la cuenta de administrador puede guardar la llave' };
  if (!d.serial) return { ok: false, error: 'Llave sin número de serie' };
  P.setProperty('NFC_HASH', hashSerial_(d.serial));
  return nfcToken_();
}
function nfcLogin_(d) {
  const C = CacheService.getScriptCache(), fallos = Number(C.get('nfc_fallos') || 0);
  if (fallos >= 5) return { ok: false, error: 'Demasiados intentos. Espera 10 minutos.' };
  const h = PropertiesService.getScriptProperties().getProperty('NFC_HASH');
  if (!h || !d.serial || hashSerial_(d.serial) !== h) { C.put('nfc_fallos', String(fallos + 1), 600); return { ok: false, error: 'Esta llave no es la del administrador' }; }
  C.remove('nfc_fallos');
  return nfcToken_();
}
function nfcToken_() {
  const t = Utilities.getUuid();
  CacheService.getScriptCache().put('adm_' + t, '1', 12 * 3600);
  return { ok: true, adminToken: t };
}
function admin_(d) {
  if (!d.adminToken || !CacheService.getScriptCache().get('adm_' + d.adminToken)) return { ok: false, error: 'Sesión de admin caducada o no válida' };
  const hoy = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd');
  if (d.op === 'pjNuevos') { PropertiesService.getScriptProperties().setProperty('PJ_NUEVOS', d.valor ? '1' : '0'); return { ok: true }; }
  if (d.op === 'nfcBorrar') { PropertiesService.getScriptProperties().deleteProperty('NFC_HASH'); return { ok: true }; }
  if (d.op === 'resumen') { resumenSemanal(ADMIN); return { ok: true, a: ADMIN }; }
  if (d.op === 'stats') {
    const us = hUsuarios_().getDataRange().getValues().slice(1), ns = hNinos_().getDataRange().getValues().slice(1);
    const hace7 = Date.now() - 7 * 864e5;
    const lista = ns.map(n => ({ nombre: n[2], email: n[1], edad: n[3], nivel: Number(n[5]) || 0, est: n[6], min: n[9], ej: Number(n[10]) || 0, t: new Date(n[12]).getTime() || 0 }))
      .sort((a, b) => b.t - a.t);
    return { ok: true, usuarios: us.length, ninos: ns.length, activos7: lista.filter(x => x.t > hace7).length,
      hoy: lista.filter(x => x.t && Utilities.formatDate(new Date(x.t), 'Europe/Madrid', 'yyyy-MM-dd') === hoy).length,
      ejercicios: lista.reduce((a, x) => a + x.ej, 0),
      lista: lista.slice(0, 40).map(x => Object.assign(x, { ult: x.t ? Utilities.formatDate(new Date(x.t), 'Europe/Madrid', 'dd/MM HH:mm') : '-' })) };
  }
  if (d.op === 'pagos') {
    const us = hUsuarios_().getDataRange().getValues().slice(1);
    const f = x => x ? Utilities.formatDate(new Date(x), 'Europe/Madrid', 'dd/MM/yyyy HH:mm') : '';
    return { ok: true,
      pendientes: us.filter(u => u[U.pagoAviso] && !u[U.licencia]).map(u => ({ email: u[0], nombre: u[U.nombre], dias: u[U.diasUso], aviso: f(u[U.pagoAviso]) })),
      licencias: us.filter(u => u[U.licencia]).map(u => ({ email: u[0], nombre: u[U.nombre], fecha: f(u[U.licencia]) })),
      prueba: us.filter(u => !u[U.licencia]).map(u => ({ email: u[0], dias: Number(u[U.diasUso]) || 0 })).sort((a, b) => b.dias - a.dias).slice(0, 30) };
  }
  if (d.op === 'activar' || d.op === 'quitar') {
    const u = buscaUsuario_(String(d.email || '').trim().toLowerCase()); if (!u) return { ok: false, error: 'No existe esa cuenta' };
    u.h.getRange(u.fila, U.licencia + 1).setValue(d.op === 'activar' ? new Date() : '');
    if (d.op === 'activar') try { MailApp.sendEmail({ to: u.v[0], name: 'Los números de Lucas', subject: '🚀 ¡Los números de Lucas desbloqueado para siempre!',
      htmlBody: '<div style="font-family:Arial;background:#050a1a;color:#fff;padding:24px;border-radius:16px"><h2 style="color:#17ff5f">¡Gracias por tu apoyo!</h2><p>Tu licencia vitalicia de <b>Los números de Lucas</b> ya está activada. Lucas y los planetas os esperan.</p><p style="color:#9ab">FuturMovil</p></div>' }); } catch (e) {}
    return { ok: true };
  }
  if (d.op === 'reiniciarDias') {
    const u = buscaUsuario_(String(d.email || '').trim().toLowerCase()); if (!u) return { ok: false, error: 'No existe esa cuenta' };
    u.h.getRange(u.fila, U.diasUso + 1, 1, 2).setValues([[Number(d.dias) || 0, '']]); return { ok: true };
  }
  return { ok: false, error: 'Operación desconocida' };
}
