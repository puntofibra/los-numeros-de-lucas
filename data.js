/* =====================================================================
   LOS NÚMEROS DE LUCAS · Datos (planetas, narrador, pegatinas)
   Matemáticas de 4 a 8 años (Infantil → 3º de Primaria), método de España:
   contar, comparar, formas, sumar, restar, decenas, dinero, hora y tablas.
   ===================================================================== */
'use strict';

/* ---------- PLANETAS (niveles) ----------
   letra   = etiqueta corta que se ve en el planeta
   silabas = ejemplos que se enseñan al tocar el planeta (se dicen en voz alta)
   cfg     = rango de números y ejercicios que salen (peso de cada tipo)          */
const PLANETAS = [
  { id: 0,  letra: '1 2 3',  nombre: 'Planeta Unito',     color: '#17ff5f', silabas: ['1', '2', '3', '4', '5'], tema: 'Los números del 1 al 5',
    cfg: { lo: 1, hi: 5, t: { cuenta: 5, escucha: 3, globos: 2, traza: 3, ordena: 1 } } },
  { id: 1,  letra: '6-10',   nombre: 'Planeta Diezón',    color: '#b388ff', silabas: ['6', '7', '8', '9', '10'], tema: 'Los números hasta el 10',
    cfg: { lo: 1, hi: 10, t: { cuenta: 4, escucha: 2, globos: 2, traza: 2, vecinos: 1.5, ordena: 2, une: 1 } } },
  { id: 2,  letra: '< = >',  nombre: 'Planeta Comparín',  color: '#ff8a3d', silabas: ['más', 'menos', 'igual'], tema: 'Más, menos e igual',
    cfg: { lo: 0, hi: 10, t: { compara: 6, cuenta: 1.5, vecinos: 2, ordena: 2 } } },
  { id: 3,  letra: '▲ ●',    nombre: 'Planeta Formalia',  color: '#18e0ff', silabas: ['círculo', 'cuadrado', 'triángulo', 'rectángulo'], tema: 'Formas y series',
    cfg: { lo: 1, hi: 10, t: { formas: 6, serie: 4, cuenta: 1 } } },
  { id: 4,  letra: '+5',     nombre: 'Planeta Sumín',     color: '#ff4d5e', silabas: ['1 + 1', '2 + 1', '2 + 2', '3 + 2'], tema: 'Sumas hasta 5',
    cfg: { lo: 0, hi: 5, op: '+', t: { sumaVis: 5, op: 3, une: 1, problema: 1 } } },
  { id: 5,  letra: '−5',     nombre: 'Planeta Restón',    color: '#17ff5f', silabas: ['3 − 1', '4 − 2', '5 − 3'], tema: 'Restas hasta 5',
    cfg: { lo: 0, hi: 5, op: '-', t: { restaVis: 5, op: 3, une: 1, problema: 1 } } },
  { id: 6,  letra: '+10',    nombre: 'Planeta Diezmás',   color: '#b388ff', silabas: ['4 + 3', '5 + 5', '6 + 2'], tema: 'Sumas hasta 10',
    cfg: { lo: 0, hi: 10, op: '+', t: { op: 4, sumaVis: 2, hueco: 2, verdad: 1.5, problema: 1.5, une: 1.5, dictadoOp: 1 } } },
  { id: 7,  letra: '−10',    nombre: 'Planeta Quitín',    color: '#ff8a3d', silabas: ['9 − 4', '10 − 3', '7 − 5'], tema: 'Restas hasta 10',
    cfg: { lo: 0, hi: 10, op: '-', t: { op: 4, restaVis: 2, hueco: 2, verdad: 1.5, problema: 1.5, une: 1.5, mixta: 1 } } },
  { id: 8,  letra: '20',     nombre: 'Planeta Veintín',   color: '#18e0ff', silabas: ['11', '13', '15', '18', '20'], tema: 'Los números hasta el 20',
    cfg: { lo: 0, hi: 20, t: { escucha: 2, vecinos: 3, ordena: 2, cuenta: 1.5, dictado: 3, compara: 2, serie: 1, traza: 1 } } },
  { id: 9,  letra: 'D U',    nombre: 'Planeta Decenia',   color: '#ff4d5e', silabas: ['10', '20', '30', '40', '50'], tema: 'Decenas y unidades',
    cfg: { lo: 10, hi: 50, t: { decenas: 6, dictado: 2, vecinos: 2, compara: 1.5 } } },
  { id: 10, letra: '+20',    nombre: 'Planeta Sumatrón',  color: '#17ff5f', silabas: ['8 + 5', '9 + 9', '12 + 6'], tema: 'Sumas hasta 20',
    cfg: { lo: 0, hi: 20, op: '+', t: { op: 4, hueco: 2, verdad: 1.5, problema: 2, une: 1.5, dictadoOp: 1 } } },
  { id: 11, letra: '−20',    nombre: 'Planeta Restalia',  color: '#b388ff', silabas: ['15 − 7', '20 − 8', '13 − 5'], tema: 'Restas hasta 20',
    cfg: { lo: 0, hi: 20, op: '-', t: { op: 4, hueco: 2, verdad: 1.5, problema: 2, une: 1.5, mixta: 1.5 } } },
  { id: 12, letra: '100',    nombre: 'Planeta Centenar',  color: '#ff8a3d', silabas: ['25', '48', '67', '90', '100'], tema: 'Los números hasta el 100',
    cfg: { lo: 0, hi: 100, t: { decenas: 3, dictado: 3, vecinos: 2, compara: 2, ordena: 2, escucha: 1 } } },
  { id: 13, letra: 'par',    nombre: 'Planeta Parimpar',  color: '#4fc3ff', silabas: ['2', '4', '6', '1', '3', '5'], tema: 'Pares, impares y saltos',
    cfg: { lo: 0, hi: 100, t: { pares: 5, serie: 4, vecinos: 1 } } },
  { id: 14, letra: '+99',    nombre: 'Planeta Dosmás',    color: '#ff4d5e', silabas: ['23 + 14', '40 + 35', '52 + 7'], tema: 'Sumas de dos cifras',
    cfg: { lo: 0, hi: 99, op: '+', dos: true, llevar: false, t: { op: 5, hueco: 1.5, verdad: 1.5, problema: 2, une: 1 } } },
  { id: 15, letra: '−99',    nombre: 'Planeta Dosmenos',  color: '#17ff5f', silabas: ['48 − 23', '76 − 50', '39 − 6'], tema: 'Restas de dos cifras',
    cfg: { lo: 0, hi: 99, op: '-', dos: true, llevar: false, t: { op: 5, hueco: 1.5, verdad: 1.5, problema: 2, une: 1 } } },
  { id: 16, letra: '€',      nombre: 'Planeta Monedín',   color: '#b388ff', silabas: ['1 €', '2 €', '5 €', '10 €', '20 €'], tema: 'El dinero: monedas y billetes',
    cfg: { lo: 1, hi: 50, t: { dinero: 6, compra: 3 } } },
  { id: 17, letra: '🕐',     nombre: 'Planeta Relojín',   color: '#ff4fa3', silabas: ['en punto', 'y media', 'y cuarto'], tema: 'La hora',
    cfg: { lo: 1, hi: 12, t: { hora: 7, horaVF: 2 } } },
  { id: 18, letra: '+ lleva', nombre: 'Planeta Llevón',   color: '#18e0ff', silabas: ['27 + 15', '38 + 46', '59 + 23'], tema: 'Sumas llevando',
    cfg: { lo: 0, hi: 99, op: '+', dos: true, llevar: true, t: { op: 5, problema: 2, verdad: 1, une: 1, hueco: 1 } } },
  { id: 19, letra: '− lleva', nombre: 'Planeta Prestón',  color: '#ff4d5e', silabas: ['42 − 17', '60 − 24', '81 − 39'], tema: 'Restas llevando',
    cfg: { lo: 0, hi: 99, op: '-', dos: true, llevar: true, t: { op: 5, problema: 2, verdad: 1, une: 1, hueco: 1 } } },
  { id: 20, letra: '×2 ×5 ×10', nombre: 'Planeta Tablín', color: '#17ff5f', silabas: ['2 × 3', '5 × 4', '10 × 6'], tema: 'Tablas del 2, del 5 y del 10',
    cfg: { lo: 0, hi: 100, op: 'x', tablas: [2, 5, 10], t: { grupos: 3, op: 4, serie: 1.5, une: 1.5, verdad: 1, hueco: 1 } } },
  { id: 21, letra: '×3 ×4',  nombre: 'Planeta Triquatro', color: '#b388ff', silabas: ['3 × 4', '4 × 6', '3 × 7'], tema: 'Tablas del 3 y del 4',
    cfg: { lo: 0, hi: 100, op: 'x', tablas: [3, 4], t: { grupos: 2, op: 5, serie: 1, une: 1.5, verdad: 1, hueco: 1, problema: 1 } } },
  { id: 22, letra: '×6-9',   nombre: 'Planeta Tablazo',   color: '#ff8a3d', silabas: ['6 × 7', '8 × 4', '9 × 9'], tema: 'Tablas del 6 al 9',
    cfg: { lo: 0, hi: 100, op: 'x', tablas: [6, 7, 8, 9], t: { op: 5, une: 1.5, verdad: 1.5, hueco: 1.5, problema: 1 } } },
  { id: 23, letra: '÷',      nombre: 'Planeta Repartón',  color: '#18e0ff', silabas: ['6 ÷ 2', '10 ÷ 5', '12 ÷ 3', '20 ÷ 4'], tema: 'La división: repartir en partes iguales',
    cfg: { lo: 0, hi: 100, op: '/', tablas: [2, 3, 4, 5, 10], t: { reparto: 4, op: 4, problema: 2.5, hueco: 1.2, verdad: 1.2, une: 1 } } },
  { id: 24, letra: '🏆',     nombre: 'Galaxia Genio',     color: '#ff4d5e', silabas: [], tema: 'Desafíos de genio',
    cfg: { lo: 0, hi: 100, op: 'mix', genio: true, t: {} } }
];

/* objetos con los que se cuenta (emoji + nombre en plural + género) */
const OBJETOS = [
  ['⭐', 'estrellas', 'f'], ['🚀', 'cohetes', 'm'], ['🍎', 'manzanas', 'f'], ['🪐', 'planetas', 'm'], ['🐟', 'peces', 'm'],
  ['🌸', 'flores', 'f'], ['🎈', 'globos', 'm'], ['🍓', 'fresas', 'f'], ['🐞', 'mariquitas', 'f'], ['⚽', 'balones', 'm'],
  ['🧁', 'magdalenas', 'f'], ['🦆', 'patos', 'm'], ['🍪', 'galletas', 'f'], ['🐸', 'ranas', 'f'], ['🌙', 'lunas', 'f'],
  ['👾', 'marcianitos', 'm'], ['🍌', 'plátanos', 'm'], ['🐝', 'abejas', 'f'], ['🦋', 'mariposas', 'f'], ['🚗', 'coches', 'm'],
  ['🍭', 'piruletas', 'f'], ['🐢', 'tortugas', 'f'], ['🍩', 'dónuts', 'm'], ['🎁', 'regalos', 'm'], ['🐣', 'pollitos', 'm']
];
const NOMBRES = ['Lucas', 'Ana', 'Hugo', 'Lucía', 'Mateo', 'Sofía', 'Leo', 'Martina', 'Pablo', 'Vega', 'Dani', 'Noa', 'Álex', 'Carla', 'Marco', 'Julia', 'Bruno', 'Olivia', 'Iker', 'Valeria'];

const NARRADOR = {
  viaje: ['¡Agárrate fuerte! ¡Volamos al siguiente planeta!', '¡Motores a tope! ¡Rumbo al nuevo planeta!', '¡Despegamos! Nuevo planeta a la vista.'],
  saludo: [
    '¡Hola, {n}! Soy Lucas. ¿Jugamos con los números?',
    '¡{n}, qué alegría verte! Mis circuitos están listos para contar.',
    '¡Bienvenido otra vez, {n}! Hoy vamos a viajar por el espacio de los números.',
    '¡Hola, {n}! He cargado mis baterías para sumar contigo.',
    '¡Bip bip! Detecto a un genio de los números. ¡Hola, {n}!',
    '¡{n}! Te estaba esperando en mi nave. ¡Despegamos!',
    '¡Buenas, {n}! ¿Preparado para una misión de números?',
    '¡Hola, campeón de las mates! ¿Jugamos, {n}?',
    '¡Qué bien que hayas venido, {n}! Los números te echaban de menos.',
    '¡Sistemas activados! Hola, {n}. ¡A contar se ha dicho!'
  ],
  bien: [
    '¡Muy bien!', '¡Genial!', '¡Fantástico!', '¡Eso es!', '¡Perfecto!', '¡Bravo!', '¡Increíble!',
    '¡Lo has clavado!', '¡Eres un crack!', '¡Superbién!', '¡Correcto!', '¡Qué bien cuentas!',
    '¡Mis circuitos echan chispas de alegría!', '¡Bip bip, respuesta correcta!', '¡Así se hace!',
    '¡Eres un genio de los números!', '¡Toma ya!', '¡Me encanta cómo piensas!', '¡Lo has conseguido!',
    '¡Estupendo!', '¡Maravilloso!', '¡Eres una estrella!', '¡Qué listo eres!', '¡Brillante!',
    '¡Sigue así!', '¡Fenomenal!', '¡Turbo cálculo activado!', '¡Lo haces genial!', '¡Chachi!',
    '¡Has acertado!', '¡Qué máquina!', '¡Diez de diez!', '¡Alucinante!', '¡Ni una calculadora lo haría mejor!'
  ],
  mal: [
    'Casi, casi. ¡Prueba otra vez!', '¡Uy! Inténtalo de nuevo.', 'No pasa nada, vuelve a probar.',
    'Mmm, esa no es. ¡Tú puedes!', 'Fíjate bien y prueba otra vez.', '¡Ups! Mis sensores dicen que no. ¡Otra vez!',
    'Equivocarse es aprender. ¡Venga!', 'Cuenta despacito y vuelve a intentarlo.', '¡Casi lo tienes!',
    'Respira, piensa y prueba.', 'Esa no, pero vas muy bien.', 'Prueba con otra, campeón.',
    '¡Ánimo! A la siguiente va la vencida.', 'Puedes ayudarte con los dedos.', 'Uy, se me ha cruzado un cable. ¡Otra vez!'
  ],
  pista: ['Te ayudo:', 'Una pista de robot:', 'Pista secreta:', 'Piensa conmigo:', 'Vamos a hacerlo juntos:'],
  fin3: ['¡Misión perfecta! ¡Tres estrellas!', '¡Eres un genio de otra galaxia! ¡Tres estrellas!', '¡Increíble! ¡Lo has hecho todo genial!'],
  fin2: ['¡Muy buena misión! ¡Dos estrellas!', '¡Lo has hecho muy bien! Sigue practicando.', '¡Genial! Cada día cuentas mejor.'],
  fin1: ['¡Misión completada! Practicando serás un crack.', '¡Bien hecho! La próxima vez, más estrellas.', '¡Lo has terminado! Eso es lo importante.'],
  planeta: ['¡Has desbloqueado un planeta nuevo!', '¡Nuevo planeta a la vista! ¡Vamos a explorarlo!', '¡Bip bip! Coordenadas del nuevo planeta recibidas.'],
  pegatina: ['¡Has ganado una pegatina nueva!', '¡Mira qué pegatina! Ya está en tu álbum.', '¡Pegatina conseguida! ¡Colecciónalas todas!'],
  ins: {
    cuenta:   ['¿Cuántos hay? Cuenta con el dedo.', 'Cuenta despacito. ¿Cuántos ves?', '¿Cuántos hay en total?', '¡A contar! ¿Cuántos son?'],
    escucha:  ['Escucha y toca el número.', 'Busca el número que te digo.', '¿Dónde está el número?', 'Toca el número que oyes.'],
    globos:   ['¡Explota las burbujas con el {x}!', 'Atrapa todas las burbujas con el {x}', '¡Rápido! Toca las burbujas del {x}'],
    traza:    ['Repasa el número {x} con el dedo.', 'Dibuja el {x} siguiendo la guía.', '¡A escribir! Repasa el {x}.'],
    ordena:   ['Toca los números de menor a mayor.', 'Ordena los números, del más pequeño al más grande.', '¡Ponlos en orden!'],
    ordenaD:  ['Ahora al revés: toca los números de mayor a menor.', 'Ordena del más grande al más pequeño.'],
    vecinos:  ['¿Qué número falta?', 'Busca el número que va en el hueco.', 'Completa la fila de números.'],
    comparaG: ['¿Dónde hay más?', 'Toca el grupo que tiene más.', '¿Qué grupo es más grande?'],
    comparaM: ['¿Dónde hay menos?', 'Toca el grupo que tiene menos.'],
    comparaS: ['¿Qué signo va en medio? Mayor que, menor que o igual.', 'Elige el signo correcto.', 'Compara los números y pon el signo.'],
    formas:   ['Toca el {x}.', '¿Dónde está el {x}?', 'Busca el {x}.'],
    lados:    ['¿Cuántos lados tiene esta forma?', 'Cuenta los lados. ¿Cuántos tiene?'],
    serie:    ['¿Qué va después? Mira la serie.', 'Completa la serie.', '¿Qué sigue? Busca el truco.'],
    sumaVis:  ['Junta los dos grupos. ¿Cuántos hay?', '¡A sumar! Cuenta todos.', '¿Cuántos son en total?'],
    restaVis: ['Quita los tachados. ¿Cuántos quedan?', '¡A restar! ¿Cuántos quedan?', 'Algunos se van. ¿Cuántos se quedan?'],
    op:       ['¡A calcular! ¿Cuál es el resultado?', 'Resuelve la operación.', 'Piensa bien. ¿Cuánto es?', '¡Turbo cálculo! ¿Cuánto da?'],
    hueco:    ['¿Qué número falta en la operación?', 'Busca el número escondido.', 'Completa la operación.'],
    verdad:   ['¿Es verdad o es mentira?', '¿Está bien hecha la operación?', 'Comprueba: ¿verdad o mentira?'],
    problema: ['Escucha el problema y piensa.', '¡Un problema! Escucha con atención.', 'Lucas tiene un problema. ¿Le ayudas?'],
    une:      ['Une cada operación con su resultado.', 'Toca una operación y después su resultado.', 'Empareja las operaciones.'],
    dictado:  ['¡Dictado de números! Escucha y forma el número.', 'Te digo un número y tú lo construyes.', 'Escucha bien y escribe el número con las piezas.'],
    dictadoOp:['Escucha la operación y toca el resultado.', '¡Cálculo de oído! Escucha bien.'],
    decenas:  ['¿Qué número es? Cuenta las decenas y las unidades.', 'Cada barra son diez. ¿Qué número forman?', 'Decenas y unidades: ¿qué número es?'],
    decenasP: ['¿Cuántas decenas tiene este número?', '¿Cuántas unidades tiene este número?'],
    pares:    ['¿Es un número par o impar?', 'Par o impar: ¿tú qué dices?', 'Piensa: ¿se puede repartir en parejas?'],
    dinero:   ['¿Cuánto dinero hay?', 'Suma las monedas y los billetes.', 'Cuenta el dinero. ¿Cuántos euros son?'],
    compra:   ['¿Te llega el dinero para comprarlo?', 'Mira el precio. ¿Puedes comprarlo?'],
    hora:     ['¿Qué hora es?', 'Mira el reloj. ¿Qué hora marca?', 'La aguja corta dice la hora. ¿Qué hora es?'],
    horaVF:   ['¿Es esa la hora del reloj?', 'Mira el reloj. ¿Verdad o mentira?'],
    grupos:   ['¿Cuántos hay en total? Cuenta los grupos.', 'Grupos iguales: ¿cuántos hay?'],
    mixta:    ['¿Es una suma o una resta? ¡Calcula!', 'Atención: mira bien el signo.'],
    reparto:  ['Reparte en partes iguales. ¿Cuántos le tocan a cada uno?', '¡A repartir! ¿Cuántos van en cada plato?', 'Divide en grupos iguales. ¿Cuántos hay en cada uno?']
  }
};

/* ---------- PEGATINAS (álbum) ---------- */
const PEGATINAS = [
  { e: '🚀', n: 'Cohete' }, { e: '🪐', n: 'Saturno' }, { e: '🌙', n: 'Luna' }, { e: '⭐', n: 'Estrella' },
  { e: '☄️', n: 'Cometa' }, { e: '🛸', n: 'Ovni' }, { e: '👽', n: 'Marcianito' }, { e: '👾', n: 'Monstruo pixel' },
  { e: '🌍', n: 'Tierra' }, { e: '☀️', n: 'Sol' }, { e: '🌈', n: 'Arcoíris' }, { e: '🔭', n: 'Telescopio' },
  { e: '🧑‍🚀', n: 'Astronauta' }, { e: '🛰️', n: 'Satélite' }, { e: '🌌', n: 'Galaxia' }, { e: '💫', n: 'Chispa' },
  { e: '🦖', n: 'Rex' }, { e: '🐉', n: 'Dragón' }, { e: '🦄', n: 'Unicornio' }, { e: '🐙', n: 'Pulpo' },
  { e: '🦊', n: 'Zorro' }, { e: '🐼', n: 'Panda' }, { e: '🦁', n: 'León' }, { e: '🐬', n: 'Delfín' },
  { e: '🏆', n: 'Copa' }, { e: '🎖️', n: 'Medalla' }, { e: '👑', n: 'Corona' }, { e: '💎', n: 'Diamante' },
  { e: '🎸', n: 'Guitarra' }, { e: '🎮', n: 'Mando' }, { e: '⚽', n: 'Balón' }, { e: '🎨', n: 'Pinturas' },
  { e: '🧮', n: 'Ábaco' }, { e: '🧸', n: 'Osito' }, { e: '🍦', n: 'Helado' }, { e: '🍩', n: 'Dónut' },
  { e: '🌋', n: 'Volcán' }, { e: '🏰', n: 'Castillo' }, { e: '🎡', n: 'Noria' }, { e: '🤖', n: 'Lucas' }
];
const IMAGENES = [];
