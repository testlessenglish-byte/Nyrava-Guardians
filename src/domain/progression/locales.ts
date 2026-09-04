import type { LocalizedContent } from "./types.ts";
export const messages: Record<string, LocalizedContent> = {};
export function define(key: string, en: string, es: string) {
  messages[key] = { en, es };
  return key;
}
export function t(key: string, locale: string): string {
  const value = messages[key];
  return value ? (locale.startsWith("es") ? value.es : value.en) : key;
}
const ui = {
  journey: ["Guardian Journey", "Viaje Guardián"],
  missions: ["Missions", "Misiones"],
  shields: ["Shields", "Escudos"],
  inventory: ["Inventory", "Inventario"],
  certificates: ["Certificates", "Certificados"],
  home: ["Builder Home", "Hogar Constructor"],
  level: ["Level", "Nivel"],
  next: ["Next level", "Siguiente nivel"],
  credits: ["Guardian Credits", "Créditos Guardián"],
  learn: ["What you will learn", "Lo que aprenderás"],
  win: ["What you can earn", "Lo que puedes ganar"],
  start: ["Start mission", "Iniciar misión"],
  practice: ["Practice again", "Practicar de nuevo"],
  locked: ["Locked", "Bloqueado"],
  available: ["Available", "Disponible"],
  completed: ["Completed", "Completado"],
  mastered: ["Mastered", "Dominado"],
  "not-started": ["Not started", "Sin iniciar"],
  learning: ["Learning", "Aprendiendo"],
  practicing: ["Practicing", "Practicando"],
  back: ["Back to journey", "Volver al viaje"],
  close: ["Return to world", "Volver al mundo"],
  continue: ["Continue", "Continuar"],
  submit: ["Check my answers", "Revisar respuestas"],
  pending: ["Checking with the server…", "Validando en el servidor…"],
  rewards: ["Mission complete", "Misión completada"],
  score: ["Assessment", "Evaluación"],
  retry: [
    "Keep practicing: review the lesson and try again.",
    "Sigue practicando: repasa la lección e inténtalo de nuevo.",
  ],
  demo: [
    "Test journey · server-validated demo rewards, not a verified educational credential. Saved in this browser's anonymous profile.",
    "Viaje de prueba · recompensas de demostración validadas por el servidor, no una credencial educativa verificada. Guardado en el perfil anónimo de este navegador.",
  ],
  offline: [
    "Progress service unavailable. Explore freely; rewards need an online server response.",
    "Servicio de progreso no disponible. Explora libremente; las recompensas requieren respuesta del servidor.",
  ],
  reload: ["Try connection again", "Reintentar conexión"],
  preview: [
    "Prototype shield · final game model pending",
    "Escudo prototipo · modelo final pendiente",
  ],
  concept: [
    "Concept reference—not a game-ready model",
    "Referencia conceptual—no es un modelo listo para el juego",
  ],
  equipped: ["Equipped", "Equipado"],
  equip: ["Equip shield", "Equipar escudo"],
  owned: ["Owned", "Obtenido"],
  requirements: ["How to earn it", "Cómo obtenerlo"],
  perks: ["Future perks", "Ventajas futuras"],
  future: ["Future curriculum—not playable yet", "Currículo futuro—aún no disponible"],
  joined: ["Join the Guardians", "Unirse a los Guardianes"],
  missionCount: ["Completed missions", "Misiones completadas"],
  certificateCount: ["Certificates from different paths", "Certificados de distintas rutas"],
  mastery: ["Mastery", "Dominio"],
  minutes: ["minutes", "minutos"],
  difficulty: ["Difficulty", "Dificultad"],
  progress: ["Certificate progress", "Progreso del certificado"],
  certificateDemo: [
    "Demo completion record · not publicly verifiable",
    "Registro de finalización de prueba · no verificable públicamente",
  ],
  noCertificates: [
    "Master the required missions and capstone to earn a completion record.",
    "Domina las misiones requeridas y el reto final para obtener un registro de finalización.",
  ],
  create: ["Place my object", "Colocar mi objeto"],
  object: ["Choose an approved project", "Elige un proyecto aprobado"],
  size: ["Size", "Tamaño"],
  material: ["Material", "Material"],
  desk: ["Desk", "Escritorio"],
  lamp: ["Lamp", "Lámpara"],
  plant: ["Plant", "Planta"],
  wood: ["Wood", "Madera"],
  blue: ["Blue", "Azul"],
  green: ["Green", "Verde"],
  builderTeaching: [
    "Jacob: Where should your object go? Move the placement sliders, then compare a small and large size. Larger objects need more room. This guided prototype uses approved choices, not live AI.",
    "Jacob: ¿Dónde debe ir tu objeto? Mueve los controles de posición y compara tamaños. Los objetos grandes necesitan más espacio. Este prototipo guiado usa opciones aprobadas, no IA en vivo.",
  ],
  buildLocked: [
    "Earn the Builder Workbench and reach Level 5 to build here.",
    "Gana la Mesa de Constructor y alcanza el nivel 5 para construir aquí.",
  ],
  nextUnlock: ["Next shield", "Siguiente escudo"],
  inspectBoard: ["Open Journey Board", "Abrir Tablero del Viaje"],
  approach: ["Walk to the glowing Journey Board", "Camina hacia el Tablero del Viaje iluminado"],
  earned: ["New rewards earned", "Nuevas recompensas"],
  noDuplicate: [
    "Practice result saved. Previously earned rewards are not awarded twice.",
    "Práctica guardada. Las recompensas obtenidas no se conceden dos veces.",
  ],
  certificateNotReady: [
    "Mastery and capstone requirements remaining",
    "Faltan requisitos de dominio y reto final",
  ],
  localArt: ["Temporary N-mark equipment prototype", "Prototipo temporal de equipo con marca N"],
} satisfies Record<string, [string, string]>;
for (const [key, pair] of Object.entries(ui)) define(`ui.${key}`, pair[0], pair[1]);
for (const [id, en, es] of [
  ["phishing", "Phishing recognition", "Reconocimiento de phishing"],
  ["passwords", "Password safety", "Seguridad de contraseñas"],
  ["privacy", "Personal information", "Información personal"],
  ["verification", "Evidence verification", "Verificación de evidencias"],
  ["building", "Spatial reasoning", "Razonamiento espacial"],
  ["creator-safety", "Safe creation", "Creación segura"],
])
  define(`skill.${id}`, en!, es!);
