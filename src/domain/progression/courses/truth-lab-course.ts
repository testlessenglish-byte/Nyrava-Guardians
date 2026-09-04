import { type GuardianCourse } from "../guardian-course-schema.ts";

export const TRUTH_LAB_COURSE: GuardianCourse = {
  id: "truth-lab",
  title: {
    en: "Fact Verification & Deepfake Analysis: The Synthetic Evidence",
    es: "Verificación de Hechos y Análisis de Deepfakes: La Evidencia Sintética",
  },
  subject: {
    en: "Synthetic Media Analysis & Fact-Checking",
    es: "Análisis de Medios Sintéticos y Verificación de Hechos",
  },
  category: {
    en: "Truth & Information Lab",
    es: "Laboratorio de Verdad e Información",
  },
  badgeId: "truth-verifier",
  estimatedMinutes: 15,
  xpReward: 450,
  creditReward: 150,
  skills: [
    {
      id: "deepfake_detection",
      name: { en: "Deepfake Detection", es: "Detección de Deepfakes" },
      description: {
        en: "Identifying audio/video anomalies, unnatural blinking, and synthetic glitches.",
        es: "Identificar anomalías en audio/video, parpadeos no naturales y fallas sintéticas.",
      },
      criticalThreshold: 80,
    },
    {
      id: "source_cross_examination",
      name: { en: "Source Cross-Examination", es: "Examen Cruzado de Fuentes" },
      description: {
        en: "Checking multiple primary trusted sources before sharing claims.",
        es: "Verificar múltiples fuentes confiables antes de compartir afirmaciones.",
      },
      criticalThreshold: 80,
    },
  ],
  story: {
    title: {
      en: "Chapter 1 — The Fake Announcement Video",
      es: "Capítulo 1 — El Video Falso de Anuncio",
    },
    chapters: [
      {
        id: "ch1-deepfake-video",
        title: { en: "The Altered Hologram", es: "El Holograma Alterado" },
        narrative: {
          en: "A video clip circulated claiming that Isla Central was shutting down all game servers at midnight. The speaker looked like Mayor Lex, but their speech audio sounded Robotic.",
          es: "Circuló un video afirmando que Isla Central cerraría todos los servidores a medianoche. El orador parecía el Alcalde Lex, pero el audio sonaba robótico.",
        },
        dialogue: [
          {
            speaker: "Nyrava",
            text: {
              en: "Guardian, stop! Look closely at the lighting around Mayor Lex's face and listen to the voice rhythm.",
              es: "¡Guardian, detente! Mira la iluminación alrededor del rostro de Lex y escucha el ritmo de voz.",
            },
            emotion: "warning",
          },
          {
            speaker: "Guardian",
            text: {
              en: "The lighting doesn't match his shadow, and his eyes aren't blinking normally!",
              es: "¡La iluminación no coincide con su sombra y sus ojos no parpadean normalmente!",
            },
            emotion: "curious",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "Correct! This is an AI-generated deepfake video designed to cause panic. Always cross-examine with official news feeds.",
              es: "¡Correcto! Es un video deepfake generado por IA para causar pánico. Siempre verifica con canales oficiales.",
            },
            emotion: "warning",
          },
        ],
      },
    ],
  },
  investigation: {
    title: {
      en: "Investigation — 2 Deepfake Clues",
      es: "Investigación — 2 Pistas de Deepfakes",
    },
    discoveries: [
      {
        id: "truth-1-glitches",
        number: 1,
        title: { en: "CLUE #1 — Visual & Audio Anomalies", es: "PISTA #1 — Anomalías Visuales y de Audio" },
        concept: {
          en: "Blurred skin edges, mismatched reflections, and robotic speech phrasing.",
          es: "Bordes difuminados, reflejos desiguales y frases de voz robóticas.",
        },
        explanation: {
          en: "AI generation models often struggle with eye blinking, teeth alignment, glasses reflections, and background lighting.",
          es: "Los modelos de IA a menudo sufren con el parpadeo de ojos, alineación de dientes y reflejos de lentes.",
        },
        keyTakeaway: {
          en: "Inspect edge details and lighting consistency on video clips.",
          es: "Inspecciona detalles de bordes y consistencia de iluminación en videos.",
        },
      },
    ],
  },
  skill: {
    title: {
      en: "The Truth Rule: INSPECT → CROSS-EXAMINE → VERIFY",
      es: "La Regla de la Verdad: INSPECCIONA → EXAMINA → VERIFICA",
    },
    ruleName: {
      en: "FACT VERIFICATION RULE",
      es: "REGLA DE VERIFICACIÓN DE HECHOS",
    },
    ruleSteps: [
      {
        step: "STOP",
        title: { en: "1. INSPECT MEDIA DETAILS", es: "1. INSPECCIONA DETALLES DE MEDIOS" },
        action: {
          en: "Look for visual glitches, unnatural blinking, and weird audio sync.",
          es: "Busca fallas visuales, parpadeos no naturales y desincronización de audio.",
        },
        questionsToAsk: [
          { en: "Does the voice sound natural or synthetic?", es: "¿La voz suena natural o sintética?" },
        ],
        safeExample: {
          en: "Inspection spots synthetic video artifacts.",
          es: "La inspección detecta artefactos de video sintéticos.",
        },
      },
      {
        step: "THINK",
        title: { en: "2. CROSS-EXAMINE SOURCES", es: "2. EXAMINA FUENTES CRUZADAS" },
        action: {
          en: "Check at least 2 independent official news outlets before believing shocking news.",
          es: "Consulta al menos 2 medios oficiales independientes antes de creer noticias impactantes.",
        },
        questionsToAsk: [
          { en: "Is the official Isla Central website reporting this?", es: "¿El sitio oficial de Isla Central reporta esto?" },
        ],
        safeExample: {
          en: "Cross-examination exposes fake news.",
          es: "El examen cruzado expone noticias falsas.",
        },
      },
      {
        step: "CHECK",
        title: { en: "3. STOP THE SPREAD", es: "3. DETÉN LA PROPAGACIÓN" },
        action: {
          en: "Never forward unverified viral clips to friends.",
          es: "Nunca reenvíes clips virales sin verificar a amigos.",
        },
        questionsToAsk: [
          { en: "Am I spreading unverified rumors?", es: "¿Estoy difundiendo rumores no verificados?" },
        ],
        safeExample: {
          en: "Stopping viral deepfakes keeps Isla Central calm.",
          es: "Detener deepfakes virales mantiene la calma en Isla Central.",
        },
      },
    ],
  },
  simulations: {
    title: {
      en: "Deepfake Detection Simulation",
      es: "Simulación de Detección de Deepfakes",
    },
    scenarios: [
      {
        id: "sim-1-video-check",
        skillId: "deepfake_detection",
        title: { en: "Scenario 1: Shocking Video Alert", es: "Escenario 1: Alerta de Video Impactante" },
        situation: {
          en: "A video appears showing your school principal announcing school is canceled for the rest of the year. The speech audio is glitchy and the background is blurry.",
          es: "Aparece un video mostrando al director anunciando que se cancelan las clases el resto del año. El audio tiene fallas y el fondo está borroso.",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Cross-examine on the official school portal before sharing.", es: "Verificar en el portal escolar oficial antes de compartir." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Master Truth Verifier!", es: "🟢 ¡Verificador Maestro de Verdad!" },
            feedbackText: {
              en: "Perfect! You spotted synthetic media glitches and verified through official channels.",
              es: "¡Perfecto! Detectaste fallas de medios sintéticos y verificaste por canales oficiales.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Share it instantly to all social media groups.", es: "Compartirlo al instante en todos los grupos." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Rumor Spreader", es: "🟡 Difusor de Rumores" },
            feedbackText: {
              en: "Sharing unverified synthetic clips spreads panic and misinformation!",
              es: "¡Compartir clips sintéticos sin verificar difunde pánico y desinformación!",
            },
          },
        ],
      },
    ],
  },
  assessment: {
    title: {
      en: "Fact Verification & Deepfake Test",
      es: "Examen de Verificación de Hechos y Deepfakes",
    },
    passingScore: 75,
    questions: [
      {
        id: "q1-deepfake-clues",
        type: "recognition",
        skillId: "deepfake_detection",
        prompt: {
          en: "Which clue suggests a video might be an AI-generated deepfake?",
          es: "¿Qué pista sugiere que un video podría ser un deepfake generado por IA?",
        },
        options: [
          { en: "Unnatural eye blinking and blurry lip movements that do not sync with audio", es: "Parpadeo no natural y movimientos de labios borrosos sin sincronizar" },
          { en: "High resolution 4K quality", es: "Alta resolución en calidad 4K" },
          { en: "Clear professional lighting", es: "Iluminación profesional clara" },
          { en: "A verified official channel mark", es: "Una marca de canal oficial verificado" },
        ],
        correctIndex: 0,
        explanation: {
          en: "Deepfake videos frequently display unnatural eye blinking, skin smoothing artifacts, and lip sync delays.",
          es: "Los videos deepfake frecuentemente muestran parpadeos no naturales y retrasos de sincronía de labios.",
        },
      },
    ],
  },
};
