import { type GuardianCourse } from "../guardian-course-schema.ts";

export const COMMUNICATION_STUDIO_COURSE: GuardianCourse = {
  id: "communication-studio",
  title: {
    en: "Digital Civility & Media Studio: The Online Discourse",
    es: "Civismo Digital y Estudio de Medios: El Discurso en Línea",
  },
  subject: {
    en: "Communication Ethics & Cyberbullying Prevention",
    es: "Ética de la Comunicación y Prevención del Ciberacoso",
  },
  category: {
    en: "Communication & Ethics",
    es: "Comunicación y Ética",
  },
  badgeId: "civility-champion",
  estimatedMinutes: 15,
  xpReward: 300,
  creditReward: 90,
  skills: [
    {
      id: "constructive_discourse",
      name: { en: "Constructive Discourse", es: "Discurso Constructivo" },
      description: {
        en: "Communicating respectfully online even during disagreements.",
        es: "Comunicarse con respeto en línea incluso durante desacuerdos.",
      },
      criticalThreshold: 80,
    },
    {
      id: "cyberbullying_intervention",
      name: { en: "Upstander Intervention", es: "Intervención de Defensor" },
      description: {
        en: "Supporting targets of harassment and reporting toxic behavior safely.",
        es: "Apoyar a víctimas de acoso y reportar conductas tóxicas con seguridad.",
      },
      criticalThreshold: 80,
    },
  ],
  story: {
    title: {
      en: "Chapter 1 — The Toxic Chat Spill",
      es: "Capítulo 1 — El Chat Tóxico",
    },
    chapters: [
      {
        id: "ch1-chat-spill",
        title: { en: "Harassment in the Game Lobby", es: "Acoso en la Sala de Juego" },
        narrative: {
          en: "During a multiplayer match in Isla Central, several players began sending mean insults to a new Guardian who made a mistake. Nyrava materialized with a sad expression.",
          es: "Durante una partida multijugador, varios jugadores enviaron insultos a un nuevo Guardian que cometió un error. Nyrava apareció con expresión triste.",
        },
        dialogue: [
          {
            speaker: "Nyrava",
            text: {
              en: "Guardian, negative toxicity ruins the experience for everyone. A true Guardian doesn't join in or stay silent.",
              es: "¡Guardian! La toxicidad arruina la experiencia para todos. Un verdadero Guardian no se une ni se queda callado.",
            },
            emotion: "warning",
          },
          {
            speaker: "Guardian",
            text: {
              en: "Should I argument back aggressively to defend them?",
              es: "¿Debería discutir agresivamente para defenderlo?",
            },
            emotion: "curious",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "No! Feeding the argument makes it worse. Be an Upstander: support the player privately, use block tools, and report the behavior.",
              es: "¡No! Alimentar la pelea lo empeora. Sé un Defensor: apoya al jugador en privado, usa bloqueos y reporta.",
            },
            emotion: "neutral",
          },
        ],
      },
    ],
  },
  investigation: {
    title: {
      en: "Investigation — 2 Communication Pillars",
      es: "Investigación — 2 Pilares de Comunicación",
    },
    discoveries: [
      {
        id: "civ-1-upstander",
        number: 1,
        title: { en: "PILLAR #1 — Bystander vs. Upstander", es: "PILAR #1 — Espectador vs. Defensor" },
        concept: {
          en: "Standing up for others using in-game reporting and block tools.",
          es: "Defender a otros usando herramientas de reporte y bloqueo.",
        },
        explanation: {
          en: "Bystanders watch toxicity happen; Upstanders take safe action to report and support.",
          es: "Los espectadores ven la toxicidad pasar; los Defensores toman acción segura para reportar y apoyar.",
        },
        keyTakeaway: {
          en: "Report toxic behavior immediately to protect community civility.",
          es: "Reporta conductas tóxicas de inmediato para proteger la comunidad.",
        },
      },
    ],
  },
  skill: {
    title: {
      en: "The Civility Rule: PAUSE → SUPPORT → REPORT",
      es: "La Regla del Civismo: PAUSA → APOYA → REPORTA",
    },
    ruleName: {
      en: "DIGITAL CIVILITY RULE",
      es: "REGLA DE CIVISMO DIGITAL",
    },
    ruleSteps: [
      {
        step: "STOP",
        title: { en: "1. PAUSE & COOL OFF", es: "1. PAUSA Y ENFRÍATE" },
        action: {
          en: "Never send messages while feeling angry or upset.",
          es: "Nunca envíes mensajes estando molesto o enojado.",
        },
        questionsToAsk: [
          { en: "Will this comment help or hurt the conversation?", es: "¿Este comentario ayudará o dañará la conversación?" },
        ],
        safeExample: {
          en: "Pausing prevents regretful online statements.",
          es: "Pausar previene comentarios lamentables en línea.",
        },
      },
      {
        step: "THINK",
        title: { en: "2. BE AN UPSTANDER", es: "2. SÉ UN DEFENSOR" },
        action: {
          en: "Send a friendly message to someone targeted by toxic chat.",
          es: "Envía un mensaje amable a alguien objetivo de chat tóxico.",
        },
        questionsToAsk: [
          { en: "How can I show kindness right now?", es: "¿Cómo puedo mostrar amabilidad en este momento?" },
        ],
        safeExample: {
          en: "Kindness weakens toxic online behavior.",
          es: "La amabilidad debilita el comportamiento tóxico.",
        },
      },
      {
        step: "CHECK",
        title: { en: "3. USE BLOCK & REPORT TOOLS", es: "3. USA BLOQUEO Y REPORTE" },
        action: {
          en: "Mute toxic players and submit a clear report.",
          es: "Silencia jugadores tóxicos y envía un reporte claro.",
        },
        questionsToAsk: [
          { en: "Is this behavior breaking community safety rules?", es: "¿Esta conducta rompe las reglas de seguridad?" },
        ],
        safeExample: {
          en: "Reporting keeps gaming lobbies safe for everyone.",
          es: "Reportar mantiene las salas de juego seguras para todos.",
        },
      },
    ],
  },
  simulations: {
    title: {
      en: "Digital Civility Simulation",
      es: "Simulación de Civismo Digital",
    },
    scenarios: [
      {
        id: "sim-1-upstander-choice",
        skillId: "cyberbullying_intervention",
        title: { en: "Scenario 1: Toxic Chat Reaction", es: "Escenario 1: Reacción a Chat Tóxico" },
        situation: {
          en: "A player in your team is being called mean names by an opponent for missing a shot. What is the best Guardian action?",
          es: "Un jugador de tu equipo recibe insultos de un oponente por fallar un tiro. ¿Cuál es la mejor acción Guardian?",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Mute the opponent, report the insults, and cheer on your teammate.", es: "Silenciar al oponente, reportar los insultos y animar a tu compañero." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Civility Champion!", es: "🟢 ¡Campeón de Civismo!" },
            feedbackText: {
              en: "Perfect! You protected your teammate, avoided escalation, and reported toxic behavior.",
              es: "¡Perfecto! Protegiste a tu compañero, evitaste la escalada y reportaste la conducta tóxica.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Insult the opponent back using even worse words.", es: "Insultar al oponente de vuelta con palabras peores." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Escalation Hazard", es: "🟡 Peligro de Escalada" },
            feedbackText: {
              en: "Fighting toxicity with more insults gets your account penalized too!",
              es: "¡Luchar contra la toxicidad con más insultos sanciona tu cuenta también!",
            },
          },
        ],
      },
    ],
  },
  assessment: {
    title: {
      en: "Digital Civility Competency Test",
      es: "Examen de Competencia de Civismo Digital",
    },
    passingScore: 75,
    questions: [
      {
        id: "q1-upstander-definition",
        type: "recognition",
        skillId: "cyberbullying_intervention",
        prompt: {
          en: "What does it mean to be an Upstander in online gaming?",
          es: "¿Qué significa ser un Defensor en los juegos en línea?",
        },
        options: [
          { en: "Ignoring everything and logging off forever", es: "Ignorar todo y cerrar sesión para siempre" },
          { en: "Safe action to support targets of bullying and reporting toxic behavior", es: "Tomar acción segura para apoyar a víctimas de acoso y reportar conductas tóxicas" },
          { en: "Joining in the insults to fit in", es: "Unirse a los insultos para encajar" },
          { en: "Sharing toxic chats on public media", es: "Compartir chats tóxicos en redes públicas" },
        ],
        correctIndex: 1,
        explanation: {
          en: "Upstanders use safe reporting and positive support to build safer communities.",
          es: "Los Defensores usan reportes seguros y apoyo positivo para construir comunidades más seguras.",
        },
      },
    ],
  },
};
