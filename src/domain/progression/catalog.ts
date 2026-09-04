import type { LocalizedContent, MasterySkill, ShieldTier } from "./types";

export type PublicMission = {
  id: string;
  title: LocalizedContent;
  summary: LocalizedContent;
  lesson: LocalizedContent[];
  questions: Array<{ id: string; prompt: LocalizedContent; options: LocalizedContent[] }>;
  prerequisiteIds: string[];
  playable: boolean;
  guardian: "sarah";
  xp: number;
  credits: number;
  badgeId: string;
};

export const FOUNDATION_MISSIONS = [
  "phishing-defense",
  "password-safety",
  "personal-information",
] as const;

export const FOUNDATION_CERTIFICATE = {
  id: "digital-safety-foundations",
  name: { en: "Digital Safety Foundations", es: "Fundamentos de Seguridad Digital" },
  curriculumVersion: "2026.1",
} as const;

export const missions: PublicMission[] = [
  {
    id: "phishing-defense",
    title: { en: "Phishing Defense", es: "Defensa contra phishing" },
    summary: {
      en: "Learn to pause, inspect messages, and verify before clicking.",
      es: "Aprende a pausar, revisar mensajes y verificar antes de hacer clic.",
    },
    lesson: [
      {
        en: "Urgency, prizes, threats, and requests for secrets are warning signs.",
        es: "La urgencia, los premios, las amenazas y las solicitudes de secretos son señales de alerta.",
      },
      {
        en: "Check the real sender and destination. Ask a trusted adult when unsure.",
        es: "Revisa el remitente y el destino reales. Pregunta a un adulto de confianza si tienes dudas.",
      },
      {
        en: "Never share passwords or one-time codes through a message.",
        es: "Nunca compartas contraseñas ni códigos de un solo uso por mensaje.",
      },
      {
        en: "Safe Guardians slow down before acting. A real company or school will not need your secret password in a chat message.",
        es: "Los Guardianes seguros se detienen antes de actuar. Una empresa o escuela real no necesita tu contraseña secreta en un mensaje.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          en: "A message says: ‘Your game account closes in 5 minutes—send your password now.’ What should you do?",
          es: "Un mensaje dice: ‘Tu cuenta del juego cerrará en 5 minutos—envía tu contraseña ahora’. ¿Qué haces?",
        },
        options: [
          {
            en: "Send your password quickly so your account is not closed",
            es: "Enviar tu contraseña rápido para que no cierren tu cuenta",
          },
          {
            en: "Do not reply; verify through the official app with a trusted adult",
            es: "No responder; verificar en la app oficial con un adulto de confianza",
          },
          {
            en: "Forward the message to your friends to see if they got it too",
            es: "Reenviar el mensaje a tus amigos para ver si a ellos también les llegó",
          },
        ],
      },
      {
        id: "q2",
        prompt: {
          en: "Which link is safest to use for your school account?",
          es: "¿Qué enlace es más seguro para tu cuenta escolar?",
        },
        options: [
          { en: "A shortened link from a stranger", es: "Un enlace corto de un desconocido" },
          { en: "A link with ‘FREE-PRIZE’ in the address", es: "Un enlace con ‘PREMIO-GRATIS’" },
          { en: "The saved official school website", es: "El sitio escolar oficial guardado" },
        ],
      },
      {
        id: "q3",
        prompt: {
          en: "An email from 'rewards@free-skin-winner-2026.net' says you won a rare skin. How do you verify if the sender address is genuine?",
          es: "Un correo de 'rewards@free-skin-winner-2026.net' dice que ganaste un objeto raro. ¿Cómo verificas si la dirección es genuina?",
        },
        options: [
          {
            en: "Inspect the domain after the @ sign and check if it matches the official game domain",
            es: "Inspeccionar el dominio después del signo @ y verificar si coincide con el dominio oficial del juego",
          },
          { en: "Trust it if it has a cool picture", es: "Confiar en él si tiene una imagen genial" },
          { en: "Reply asking if they are telling the truth", es: "Responder preguntando si están diciendo la verdad" },
        ],
      },
      {
        id: "q4",
        prompt: {
          en: "A surprising message appears to be from a friend. What should you inspect first?",
          es: "Un mensaje inesperado parece ser de un amigo. ¿Qué debes revisar primero?",
        },
        options: [
          { en: "Its colors", es: "Sus colores" },
          {
            en: "The real sender and what the link opens",
            es: "El remitente real y lo que abre el enlace",
          },
          { en: "How many emojis it has", es: "Cuántos emojis tiene" },
        ],
      },
    ],
    prerequisiteIds: [],
    playable: true,
    guardian: "sarah",
    xp: 500,
    credits: 150,
    badgeId: "phishing-hunter",
  },
  {
    id: "password-safety",
    title: { en: "Password Safety", es: "Seguridad de contraseñas" },
    summary: {
      en: "Build strong, unique passphrases and protect sign-in codes.",
      es: "Crea frases de contraseña fuertes y únicas y protege tus códigos de acceso.",
    },
    lesson: [
      {
        en: "A good passphrase is long, memorable to you, and hard for someone else to guess.",
        es: "Una buena frase de contraseña es larga, fácil de recordar para ti y difícil de adivinar para otros.",
      },
      {
        en: "Use a different password for important accounts so one stolen password cannot unlock everything.",
        es: "Usa una contraseña diferente para cuentas importantes para que una contraseña robada no abra todo.",
      },
      {
        en: "Do not use your name, birthday, school, pet, or favorite team as an easy password clue.",
        es: "No uses tu nombre, cumpleaños, escuela, mascota o equipo favorito como pista fácil para una contraseña.",
      },
      {
        en: "Multi-factor authentication adds another lock. Its approval prompts and one-time codes are private too.",
        es: "La autenticación de varios factores agrega otra cerradura. Sus avisos y códigos de un solo uso también son privados.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          en: "Which password is the strongest choice?",
          es: "¿Cuál contraseña es la opción más fuerte?",
        },
        options: [
          { en: "alex2016", es: "alex2016" },
          { en: "Purple-River-Cloud-Train!", es: "Rio-Morado-Nube-Tren!" },
          { en: "password123", es: "password123" },
        ],
      },
      {
        id: "q2",
        prompt: {
          en: "You use the same password for a game and your email. The game is hacked. What is the main danger?",
          es: "Usas la misma contraseña para un juego y tu correo. El juego es hackeado. ¿Cuál es el principal peligro?",
        },
        options: [
          { en: "Nothing changes", es: "No cambia nada" },
          {
            en: "The stolen password may also unlock your email",
            es: "La contraseña robada también puede abrir tu correo",
          },
          { en: "Your screen becomes slower", es: "Tu pantalla se vuelve más lenta" },
        ],
      },
      {
        id: "q3",
        prompt: {
          en: "A friend asks for the approval code that just appeared on your phone. What do you do?",
          es: "Un amigo pide el código de aprobación que acaba de aparecer en tu teléfono. ¿Qué haces?",
        },
        options: [
          { en: "Share it because they are a friend", es: "Compartirlo porque es tu amigo" },
          {
            en: "Keep it private and deny any sign-in you did not start",
            es: "Mantenerlo privado y rechazar cualquier inicio que no comenzaste",
          },
          { en: "Post it in the group chat", es: "Publicarlo en el chat grupal" },
        ],
      },
      {
        id: "q4",
        prompt: {
          en: "Which detail should you avoid using as an obvious password clue?",
          es: "¿Qué dato debes evitar usar como pista obvia de contraseña?",
        },
        options: [
          { en: "Your birthday", es: "Tu cumpleaños" },
          { en: "Unrelated random words", es: "Palabras aleatorias no relacionadas" },
          { en: "A password manager suggestion", es: "Una sugerencia de gestor de contraseñas" },
        ],
      },
    ],
    prerequisiteIds: ["phishing-defense"],
    playable: true,
    guardian: "sarah",
    xp: 500,
    credits: 150,
    badgeId: "password-protector",
  },
  {
    id: "personal-information",
    title: { en: "Personal Information Safety", es: "Seguridad de información personal" },
    summary: {
      en: "Recognize private information and make safer sharing decisions.",
      es: "Reconoce información privada y toma decisiones más seguras al compartir.",
    },
    lesson: [
      {
        en: "Private information includes where you live, where you go to school, phone numbers, passwords, live location, and identifying documents.",
        es: "La información privada incluye dónde vives, dónde estudias, teléfonos, contraseñas, ubicación en vivo y documentos de identidad.",
      },
      {
        en: "Photos can reveal more than your face. Uniforms, street signs, house numbers, and location tags can expose where you are.",
        es: "Las fotos pueden revelar más que tu cara. Uniformes, letreros, números de casa y etiquetas de ubicación pueden mostrar dónde estás.",
      },
      {
        en: "Before sharing, ask: who can see this, do they need it, and would I be comfortable showing it to a trusted adult?",
        es: "Antes de compartir, pregunta: ¿quién puede verlo, lo necesita y me sentiría cómodo mostrándolo a un adulto de confianza?",
      },
      {
        en: "If a stranger asks for personal details, stop the conversation, do not send the information, and tell a trusted adult.",
        es: "Si un desconocido pide datos personales, detén la conversación, no envíes la información y avisa a un adulto de confianza.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: {
          en: "Which item is personal information that should not be posted publicly?",
          es: "¿Qué elemento es información personal que no debe publicarse en público?",
        },
        options: [
          { en: "Your home address", es: "Tu dirección de casa" },
          { en: "Your favorite color", es: "Tu color favorito" },
          { en: "A made-up superhero name", es: "Un nombre inventado de superhéroe" },
        ],
      },
      {
        id: "q2",
        prompt: {
          en: "A photo shows your school uniform and the street sign outside. What is the safest choice?",
          es: "Una foto muestra tu uniforme escolar y el letrero de la calle. ¿Cuál es la opción más segura?",
        },
        options: [
          { en: "Post it with live location", es: "Publicarla con ubicación en vivo" },
          {
            en: "Crop or avoid identifying details before sharing",
            es: "Recortar o evitar datos identificables antes de compartir",
          },
          { en: "Add your class schedule too", es: "Agregar también tu horario de clases" },
        ],
      },
      {
        id: "q3",
        prompt: {
          en: "A new online friend asks where you live so they can visit. What should you do?",
          es: "Un nuevo amigo en línea pregunta dónde vives para visitarte. ¿Qué debes hacer?",
        },
        options: [
          { en: "Send the address", es: "Enviar la dirección" },
          {
            en: "Do not share it and tell a trusted adult",
            es: "No compartirla y avisar a un adulto de confianza",
          },
          { en: "Send a nearby landmark instead", es: "Enviar un punto cercano" },
        ],
      },
      {
        id: "q4",
        prompt: {
          en: "Before posting something, which question is most useful?",
          es: "Antes de publicar algo, ¿qué pregunta es más útil?",
        },
        options: [
          { en: "Will it get likes?", es: "¿Conseguirá muchos me gusta?" },
          {
            en: "Who can see this and does it reveal something private?",
            es: "¿Quién puede verlo y revela algo privado?",
          },
          { en: "Can I post it faster?", es: "¿Puedo publicarlo más rápido?" },
        ],
      },
    ],
    prerequisiteIds: ["password-safety"],
    playable: true,
    guardian: "sarah",
    xp: 500,
    credits: 150,
    badgeId: "privacy-keeper",
  },
];

export const paths = [
  ["digital-safety", "Digital Safety", "Seguridad digital"],
  ["ai-literacy", "AI Literacy", "Alfabetización en IA"],
  ["coding-hardware", "Coding & Hardware", "Código y hardware"],
  ["networks-kindness", "Networks & Kindness", "Redes y amabilidad"],
  ["data-logic", "Data & Logic", "Datos y lógica"],
  ["research-truth", "Research & Truth", "Investigación y verdad"],
  ["responsible-creation", "Responsible Creation", "Creación responsable"],
].map(([id, en, es]) => ({ id, name: { en, es } as LocalizedContent }));

export type ShieldCatalogItem = {
  id: string;
  tier: ShieldTier;
  name: LocalizedContent;
  requirement: LocalizedContent;
  gate:
    | "joined"
    | "foundations"
    | "ten-mastery"
    | "level10-challenge"
    | "two-certificates"
    | "level20-creator"
    | "capstone";
};
export const shields: ShieldCatalogItem[] = [
  [
    "basic-shield",
    1,
    "Basic Shield",
    "Escudo Básico",
    "Join the Guardians",
    "Únete a los Guardianes",
    "joined",
  ],
  [
    "protector-shield",
    2,
    "Protector Shield",
    "Escudo Protector",
    "Complete Password Safety, Phishing Defense, and Personal Information Safety",
    "Completa Seguridad de contraseñas, Defensa contra phishing y Seguridad de información personal",
    "foundations",
  ],
  [
    "guardian-shield",
    3,
    "Guardian Shield",
    "Escudo Guardián",
    "Complete 10 missions and their mastery checks",
    "Completa 10 misiones y sus comprobaciones de dominio",
    "ten-mastery",
  ],
  [
    "defender-shield",
    4,
    "Defender Shield",
    "Escudo Defensor",
    "Reach Level 10 and pass the applied protection challenge",
    "Alcanza el nivel 10 y supera el reto de protección aplicada",
    "level10-challenge",
  ],
  [
    "champion-shield",
    5,
    "Champion Shield",
    "Escudo Campeón",
    "Earn 2 substantial certificates from distinct learning paths",
    "Obtén 2 certificados sustanciales de rutas distintas",
    "two-certificates",
  ],
  [
    "elite-shield",
    6,
    "Elite Shield",
    "Escudo de Élite",
    "Reach Level 20 with advanced mastery and creator safety",
    "Alcanza el nivel 20 con dominio avanzado y seguridad creadora",
    "level20-creator",
  ],
  [
    "legendary-shield",
    7,
    "Legendary Shield",
    "Escudo Legendario",
    "Complete the multi-skill Guardian Capstone",
    "Completa el reto final Guardián multidisciplinario",
    "capstone",
  ],
].map(([id, tier, en, es, ren, res, gate]) => ({
  id: id as string,
  tier: tier as ShieldTier,
  name: { en: en as string, es: es as string },
  requirement: { en: ren as string, es: res as string },
  gate: gate as ShieldCatalogItem["gate"],
}));

export const answerKey: Record<string, number[]> = {
  "phishing-defense": [1, 2, 0, 1],
  "password-safety": [1, 1, 1, 0],
  "personal-information": [0, 1, 1, 1],
};

export const masterySkills: MasterySkill[] = [
  "phishing",
  "passwords",
  "privacy",
  "verification",
  "building",
  "creator-safety",
];
