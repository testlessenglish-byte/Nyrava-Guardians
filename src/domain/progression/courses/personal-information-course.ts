import { type GuardianCourse } from "../guardian-course-schema.ts";

export const PERSONAL_INFORMATION_COURSE: GuardianCourse = {
  id: "personal-information",
  title: {
    en: "Personal Information Safety: The Digital Footprint",
    es: "Seguridad de Información Personal: La Huella Digital",
  },
  subject: {
    en: "Privacy Protection & Digital Footprints",
    es: "Protección de Privacidad y Huellas Digitales",
  },
  category: {
    en: "Security Foundations",
    es: "Fundamentos de Seguridad",
  },
  badgeId: "privacy-keeper",
  estimatedMinutes: 15,
  xpReward: 350,
  creditReward: 100,
  skills: [
    {
      id: "private_data_identification",
      name: { en: "Private Data Identification", es: "Identificación de Datos Privados" },
      description: {
        en: "Distinguishing non-sensitive public details from sensitive private facts.",
        es: "Diferenciar datos públicos no sensibles de datos privados sensibles.",
      },
      criticalThreshold: 80,
    },
    {
      id: "photo_metadata_caution",
      name: { en: "Photo & Media Privacy", es: "Privacidad en Fotos y Medios" },
      description: {
        en: "Spotting uniform badges, street signs, house numbers, and geotags.",
        es: "Detectar insignias, letreros de calles, números y etiquetas en fotos.",
      },
      criticalThreshold: 75,
    },
    {
      id: "stranger_boundary_control",
      name: { en: "Boundary & Stranger Control", es: "Control de Límites y Desconocidos" },
      description: {
        en: "Refusing unsolicited requests for live location and personal schedules.",
        es: "Rechazar solicitudes de ubicación en vivo y horarios personales.",
      },
      criticalThreshold: 80,
    },
  ],
  story: {
    title: {
      en: "Chapter 1 — The Overshared Photo",
      es: "Capítulo 1 — La Foto con Exceso de Información",
    },
    chapters: [
      {
        id: "ch1-photo-post",
        title: { en: "A Friendly Photo Share", es: "Compartir una Foto Amistosa" },
        narrative: {
          en: "You snapped a photo of your new gaming trophy sitting near your bedroom window and posted it online with the caption 'Victory after school!' Nyrava zoomed in on the background.",
          es: "Tomaste una foto de tu nuevo trofeo cerca de la ventana y la publicaste con el texto '¡Victoria al salir de la escuela!'. Nyrava se acercó al fondo de la foto.",
        },
        dialogue: [
          {
            speaker: "Nyrava",
            text: {
              en: "Guardian! Look closely at the background of your photo. What do you see through the window?",
              es: "¡Guardian! Mira de cerca el fondo de tu foto. ¿Qué ves a través de la ventana?",
            },
            emotion: "warning",
          },
          {
            speaker: "Guardian",
            text: {
              en: "Just the street sign and my school bus stop... wait, does that reveal where I live?",
              es: "Solo el letrero de la calle y la parada del autobús escolar... espera, ¿eso revela dónde vivo?",
            },
            emotion: "curious",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "Precisely. The street sign plus your school emblem reveals your address and daily routine to anyone on the web.",
              es: "Exactamente. El letrero más el emblema de tu escuela revela tu dirección y rutina diaria a cualquiera en la red.",
            },
            emotion: "warning",
          },
        ],
      },
    ],
  },
  investigation: {
    title: {
      en: "Investigation — 3 Privacy Red Flags",
      es: "Investigación — 3 Banderas Rojas de Privacidad",
    },
    discoveries: [
      {
        id: "priv-1-hidden-clues",
        number: 1,
        title: { en: "RED FLAG #1 — Hidden Background Clues", es: "BANDERA ROJA #1 — Pistas Ocultas en el Fondo" },
        concept: {
          en: "Street signs, house numbers, and school uniforms in photos.",
          es: "Letreros de calles, números de casas y uniformes en fotos.",
        },
        explanation: {
          en: "Photos carry extra visual clues that reveal your physical location even if you don't type your address.",
          es: "Las fotos llevan pistas visuales que revelan tu ubicación física aunque no escribas tu dirección.",
        },
        keyTakeaway: {
          en: "Crop out background landmarks before posting images.",
          es: "Recorta puntos de referencia del fondo antes de publicar fotos.",
        },
      },
      {
        id: "priv-2-live-location",
        number: 2,
        title: { en: "RED FLAG #2 — Live Location Broadcasts", es: "BANDERA ROJA #2 — Transmisión de Ubicación en Vivo" },
        concept: {
          en: "Tagging exact real-time places while you are still there.",
          es: "Etiquetar lugares exactos en tiempo real mientras sigues ahí.",
        },
        explanation: {
          en: "Broadcasting where you are right now lets strangers track your daily movements.",
          es: "Transmitir dónde estás en este momento le permite a desconocidos rastrear tus movimientos diarios.",
        },
        keyTakeaway: {
          en: "Only share travel stories after returning home safely.",
          es: "Comparte historias de viajes solo al regresar a casa a salvo.",
        },
      },
    ],
  },
  skill: {
    title: {
      en: "The Privacy Rule: PAUSE → FILTER → PROTECT",
      es: "La Regla de Privacidad: PAUSA → FILTRA → PROTEGE",
    },
    ruleName: {
      en: "DIGITAL FOOTPRINT RULE",
      es: "REGLA DE LA HUELLA DIGITAL",
    },
    ruleSteps: [
      {
        step: "STOP",
        title: { en: "1. PAUSE BEFORE POSTING", es: "1. PAUSA ANTES DE PUBLICAR" },
        action: {
          en: "Ask yourself: Who can see this, and do they really need to know?",
          es: "Pregúntate: ¿Quién puede ver esto y realmente necesitan saberlo?",
        },
        questionsToAsk: [
          { en: "Would I be comfortable showing this to a trusted adult?", es: "¿Me sentiría cómodo mostrándolo a un adulto de confianza?" },
        ],
        safeExample: {
          en: "Pausing prevents permanent accidental exposure.",
          es: "Pausar previene la exposición accidental permanente.",
        },
      },
      {
        step: "THINK",
        title: { en: "2. FILTER SENSITIVE DETAILS", es: "2. FILTRA DATOS SENSIBLES" },
        action: {
          en: "Keep home addresses, phone numbers, and school names private.",
          es: "Mantén direcciones, teléfonos y escuelas en privado.",
        },
        questionsToAsk: [
          { en: "Does this post reveal where I go every afternoon?", es: "¿Esta publicación revela a dónde voy todas las tardes?" },
        ],
        safeExample: {
          en: "Safe Guardians blur out private badges and street signs.",
          es: "Los Guardianes seguros difuminan insignias y letreros.",
        },
      },
      {
        step: "CHECK",
        title: { en: "3. GUARD PERSONAL BOUNDARIES", es: "3. PROTEGE TUS LÍMITES PERSONALES" },
        action: {
          en: "If a stranger asks for personal details, decline and report.",
          es: "Si un desconocido pide datos personales, rechaza y reporta.",
        },
        questionsToAsk: [
          { en: "Why is an online player asking where I live?", es: "¿Por qué un jugador en línea pregunta dónde vivo?" },
        ],
        safeExample: {
          en: "Refusing private data requests keeps your home safe.",
          es: "Rechazar solicitudes de datos privados mantiene tu hogar seguro.",
        },
      },
    ],
  },
  simulations: {
    title: {
      en: "Privacy & Digital Footprint Simulation",
      es: "Simulación de Privacidad y Huella Digital",
    },
    scenarios: [
      {
        id: "sim-1-photo-check",
        skillId: "photo_metadata_caution",
        title: { en: "Scenario 1: Checking a Profile Photo", es: "Escenario 1: Revisar una Foto de Perfil" },
        situation: {
          en: "You want to post a fun photo wearing your school team jacket outside your front door. What is the safest choice?",
          es: "Quieres publicar una foto divertida con la chaqueta de tu escuela frente a tu puerta. ¿Cuál es la opción más segura?",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Post it with live location tag.", es: "Publicarla con etiqueta de ubicación en vivo." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Privacy Exposure", es: "🟡 Exposición de Privacidad" },
            feedbackText: {
              en: "Posting house numbers with school badges exposes your physical location.",
              es: "Publicar números de casa con insignias de la escuela expone tu ubicación física.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Crop out the house number and street sign before posting.", es: "Recortar el número de casa y el letrero de la calle antes de publicar." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Master Privacy Guardian!", es: "🟢 ¡Guardián Maestro de Privacidad!" },
            feedbackText: {
              en: "Perfect! Cropping private landmarks keeps your photo fun and your location safe.",
              es: "¡Perfecto! Recortar puntos de referencia privados mantiene tu foto divertida y tu ubicación segura.",
            },
          },
        ],
      },
    ],
  },
  assessment: {
    title: {
      en: "Personal Information & Privacy Test",
      es: "Examen de Información Personal y Privacidad",
    },
    passingScore: 75,
    questions: [
      {
        id: "q1-private-info",
        type: "recognition",
        skillId: "private_data_identification",
        prompt: {
          en: "Which of the following should ALWAYS be kept strictly private?",
          es: "¿Cuál de los siguientes NUNCA debe publicarse en público?",
        },
        options: [
          { en: "Your favorite video game title", es: "Tu juego de video favorito" },
          { en: "Your home street address and phone number", es: "Tu dirección de casa y número de teléfono" },
          { en: "Your favorite color", es: "Tu color favorito" },
          { en: "A fictional avatar nickname", es: "Un apodo de avatar ficticio" },
        ],
        correctIndex: 1,
        explanation: {
          en: "Home addresses and phone numbers are sensitive private identity details.",
          es: "Las direcciones de casa y números telefónicos son datos de identidad privados sensibles.",
        },
      },
      {
        id: "q2-stranger-location-request",
        type: "application",
        skillId: "stranger_boundary_control",
        prompt: {
          en: "An online player you just met asks which school you attend so they can meet up. What should you do?",
          es: "Un jugador en línea que acabas de conocer pregunta a qué escuela vas para verse. ¿Qué debes hacer?",
        },
        options: [
          { en: "Tell them the school name.", es: "Decirle el nombre de la escuela." },
          { en: "Refuse to share personal details and tell a trusted adult immediately.", es: "Rechazar compartir datos personales y avisar a un adulto de confianza de inmediato." },
          { en: "Send your daily class schedule.", es: "Enviar tu horario de clases diario." },
          { en: "Post a picture of your school badge.", es: "Publicar una foto de la insignia de tu escuela." },
        ],
        correctIndex: 1,
        explanation: {
          en: "Never share physical location details or school names with strangers online.",
          es: "Nunca compartas datos de ubicación física ni nombres de escuelas con desconocidos.",
        },
      },
    ],
  },
};
