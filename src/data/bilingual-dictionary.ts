/**
 * Nyrava Guardians Bilingual Dictionary Core (en-US & es-MX)
 * Child-friendly, natural phrasing for English and Mexican/Latin American Spanish.
 */

export type LocaleId = "en-US" | "es-MX";

export interface GuardianDialogue {
  greeting: string;
  intro: string;
  askPermission: string;
  accept: string;
  decline: string;
  explainMore: string;
  walkAway: string;
  spanishSwitch: string;
  englishSwitch: string;
}

export interface ActivityIntro {
  title: string;
  whatItIs: string;
  whatYouLearn: string;
  gameType: string;
  prerequisites: string;
  unlocks: string;
}

export const GUARDIAN_DIALOGUES: Record<string, Record<LocaleId, GuardianDialogue>> = {
  lex: {
    "en-US": {
      greeting: "Hi there! I'm Lex, the Analyst.",
      intro:
        "You found the Data Arena! Here we analyze patterns, classify datasets, and evaluate AI answers.",
      askPermission:
        "AI can sound very confident even when it's wrong. Want to test if you can spot the pattern with me?",
      accept: "Awesome logic! Let's examine the first dataset together.",
      decline: "No problem at all! I'll be right here whenever you want to analyze patterns.",
      explainMore:
        "We'll check whether the AI's answer actually matches real evidence or if it's hallucinating.",
      walkAway: "Catch you later! Keep your eyes open for data patterns.",
      spanishSwitch: "¡Claro que sí! Ahora podemos analizar los datos en español.",
      englishSwitch: "Switching back to English! Let's continue analyzing patterns.",
    },
    "es-MX": {
      greeting: "¡Hola! Soy Lex, el Analista.",
      intro:
        "¡Llegaste a la Arena de Datos! Aquí analizamos patrones, clasificamos datos y evaluamos las respuestas de la IA.",
      askPermission:
        "La IA puede sonar muy segura de sí misma aunque esté equivocada. ¿Quieres poner a prueba tus dotes de detective de datos conmigo?",
      accept: "¡Excelente razonamiento! Vamos a examinar el primer conjunto de datos.",
      decline: "¡Sin problema! Aquí estaré cuando quieras analizar patrones.",
      explainMore:
        "Revisaremos si las respuestas de la IA realmente coinciden con la evidencia real o si está inventando cosas.",
      walkAway: "¡Nos vemos luego! Sigue observando los patrones de información.",
      spanishSwitch: "¡Claro que sí! Ahora podemos analizar los datos en español.",
      englishSwitch: "¡De vuelta al inglés! Sigamos analizando patrones.",
    },
  },
  nova: {
    "en-US": {
      greeting: "Hey! I'm Nova, the Investigator.",
      intro:
        "Welcome to the Mystery Network! In this zone, we uncover misinformation and check sources.",
      askPermission:
        "I found something strange in this news story. Would you like to help me check if the sources are real?",
      accept: "Great investigation spirit! Let's inspect the evidence lens.",
      decline: "No worries! Take your time exploring. The mystery will wait for you.",
      explainMore:
        "We'll look at who wrote the claim, whether other reliable sources confirm it, and if images were altered.",
      walkAway: "No problem! I'll be here when you're ready to investigate.",
      spanishSwitch: "¡Por supuesto! Investigaremos las fuentes en español.",
      englishSwitch: "Back to English! Let's solve this mystery.",
    },
    "es-MX": {
      greeting: "¡Hola! Soy Nova, la Investigadora.",
      intro:
        "¡Te damos la bienvenida a la Red de Misterios! En esta zona descubrimos noticias falsas y verificamos fuentes.",
      askPermission:
        "Encontré algo muy raro en esta noticia. ¿Te gustaría ayudarme a revisar si las fuentes son reales?",
      accept: "¡Excelente espíritu detective! Vamos a usar el lente de evidencia.",
      decline: "¡No te preocupes! Tómate tu tiempo para explorar. El misterio esperará.",
      explainMore:
        "Revisaremos quién escribió la nota, si otros sitios confiables la confirman y si la imagen fue cambiada por IA.",
      walkAway: "¡No hay problema! Estaré aquí cuando estés listo para investigar.",
      spanishSwitch: "¡Por supuesto! Investigaremos las fuentes en español.",
      englishSwitch: "¡De vuelta al inglés! Resolvamos este misterio.",
    },
  },
  zoey: {
    "en-US": {
      greeting: "Welcome! I'm Zoe, the Protector.",
      intro:
        "You've entered the Privacy Shield Zone. We keep our personal info, passwords, and identity safe online.",
      askPermission:
        "Someone is asking for personal details in a public game room. Want to help activate the Privacy Shield?",
      accept: "Shields up! Let's protect our friends and keep passwords safe.",
      decline: "Stay safe! I'll guard this station while you explore.",
      explainMore:
        "You'll learn what information is safe to share with friends and what should always stay private.",
      walkAway: "Take care! Remember to keep your passwords private.",
      spanishSwitch: "¡Claro! Protegeremos tu privacidad en español.",
      englishSwitch: "Switching to English! Protecting privacy together.",
    },
    "es-MX": {
      greeting: "¡Hola! Soy Zoe, la Protectora.",
      intro:
        "Entraste a la Zona del Escudo de Privacidad. Aquí cuidamos nuestra información personal y contraseñas.",
      askPermission:
        "Alguien está pidiendo datos personales en una sala pública. ¿Quieres ayudarme a activar el Escudo de Privacidad?",
      accept:
        "¡Escudos arriba! Protejamos a nuestros amigos y mantengamos las contraseñas seguras.",
      decline: "¡Cuídate mucho! Protegeré esta estación mientras exploras.",
      explainMore:
        "Aprenderás qué información se puede compartir con amigos y cuál debe mantenerse siempre privada.",
      walkAway: "¡Hasta luego! Recuerda no compartir tus contraseñas con nadie.",
      spanishSwitch: "¡Claro! Protegeremos tu privacidad en español.",
      englishSwitch: "¡De vuelta al inglés! Protegiendo tu privacidad juntos.",
    },
  },
  jacob: {
    "en-US": {
      greeting: "Hey maker! I'm Jacob, the Builder.",
      intro:
        "Welcome to the Builder District! Here we code robots, assemble AI workflows, and construct custom worlds.",
      askPermission:
        "My sorting robot needs new instructions to separate safe code from bugs. Want to try programming it?",
      accept: "Awesome! Grab the coding tools and let's program this bot.",
      decline: "Cool! I'll keep tweaking the robot gears until you come back.",
      explainMore:
        "We'll build step-by-step algorithms and debug robot choices using block or code instructions.",
      walkAway: "Keep creating! The workshop is open anytime.",
      spanishSwitch: "¡Súper! Ahora construiremos en español.",
      englishSwitch: "Back to English! Let's build something awesome.",
    },
    "es-MX": {
      greeting: "¡Hola creador! Soy Jacob, el Constructor.",
      intro:
        "¡Te damos la bienvenida al Distrito Constructor! Aquí programamos robots y construimos mundos con IA.",
      askPermission:
        "Mi robot ordenador necesita nuevas instrucciones para separar el código seguro de los errores. ¿Quieres programarlo conmigo?",
      accept: "¡Genial! Toma las herramientas de código y programemos a este robot.",
      decline: "¡De acuerdo! Ajustaré los engranes del robot mientras regresas.",
      explainMore: "Crearemos algoritmos paso a paso y corregiremos las instrucciones del robot.",
      walkAway: "¡Sigue creando! El taller está abierto cuando quieras.",
      spanishSwitch: "¡Súper! Ahora construiremos en español.",
      englishSwitch: "¡De vuelta al inglés! Vamos a construir algo genial.",
    },
  },
  dayana: {
    "en-US": {
      greeting: "Hello friend! I'm Dayana, the Communicator.",
      intro:
        "You found the Communication Realm! Here we learn digital kindness, empathy, and how algorithms spread messages.",
      askPermission:
        "A message is spreading fast on the network and causing confusion. Want to help restore friendly communication?",
      accept: "Wonderful! Kindness and truth travel far when we work together.",
      decline: "No problem at all! Warm messages will be waiting for you.",
      explainMore:
        "We'll look at how recommendation algorithms recommend posts and how to choose respectful communication.",
      walkAway: "See you soon! Keep spreading digital kindness.",
      spanishSwitch: "¡Qué alegría! Nos comunicaremos en español.",
      englishSwitch: "Back to English! Spreading positive energy.",
    },
    "es-MX": {
      greeting: "¡Hola amigo! Soy Dayana, la Comunicadora.",
      intro:
        "¡Llegaste al Reino de la Comunicación! Aquí aprendemos sobre empatía digital y cómo se difunden los mensajes.",
      askPermission:
        "Un mensaje se está compartiendo muy rápido y causa confusión. ¿Quieres ayudarme a difundir empatía y claridad?",
      accept: "¡Maravilloso! La amabilidad y la verdad llegan lejos cuando trabajamos juntos.",
      decline: "¡No te preocupes! Siempre habrá mensajes positivos esperándote.",
      explainMore:
        "Veremos cómo funcionan los algoritmos de recomendación y cómo comunicarnos con respeto.",
      walkAway: "¡Hasta pronto! Sigue difundiendo amabilidad digital.",
      spanishSwitch: "¡Qué alegría! Nos comunicaremos en español.",
      englishSwitch: "¡De vuelta al inglés! Difundiendo buena energía.",
    },
  },
  sarah: {
    "en-US": {
      greeting: "Alert! I'm Sarah, the Security Specialist.",
      intro:
        "You've entered the Cyber Defense Zone! We defend against phishing, suspicious messages, and deepfake impersonation.",
      askPermission:
        "A suspicious email just hit the command center. Want to run a Scam Patrol investigation with me?",
      accept: "Threat Scanner active! Let's analyze the email headers and link domain.",
      decline: "Acknowledged. Standing by at the security terminal.",
      explainMore:
        "You'll learn how to inspect urgent links, verify sender domains, and stop phishing attacks.",
      walkAway: "Security scan paused. Stay alert online!",
      spanishSwitch: "¡Entendido! Activando escáner de seguridad en español.",
      englishSwitch: "Switching back to English! Defensive systems online.",
    },
    "es-MX": {
      greeting: "¡Alerta! Soy Sarah, la Especialista en Ciberseguridad.",
      intro:
        "¡Entraste a la Zona de Ciberdefensa! Defendemos el sistema contra phishing, mensajes sospechosos y deepfakes.",
      askPermission:
        "Llegó un correo sospechoso al centro de mando. ¿Quieres hacer una investigación de Patrulla de Estafas conmigo?",
      accept: "¡Escáner de amenazas activo! Analicemos el remitente y el enlace dudoso.",
      decline: "Entendido. Me quedo en la terminal de seguridad por si decides volver.",
      explainMore:
        "Aprenderás a inspeccionar enlaces urgentes, verificar dominios y detener ataques de phishing.",
      walkAway: "Pausa en el escáner. ¡Mantén la alerta en internet!",
      spanishSwitch: "¡Entendido! Activando escáner de seguridad en español.",
      englishSwitch: "¡De vuelta al inglés! Sistemas defensivos en línea.",
    },
  },
};

export const UI_STRINGS: Record<LocaleId, Record<string, string>> = {
  "en-US": {
    idle: "READY",
    listening: "LISTENING",
    thinking: "THINKING",
    speaking: "SPEAKING",
    paused: "PAUSED",
    ended: "ENDED",
    muteMic: "Mute Mic",
    unmuteMic: "Unmute Mic",
    autoConvo: "Auto Conversations",
    langToggle: "EN | ES",
    currentWorld: "Isla Central",
    startActivity: "Try Challenge",
    askQuestion: "Ask Question",
    walkAway: "Walk Away",
    mastered: "Mastered",
    inProgress: "In Progress",
    locked: "Locked",
    new: "New",
  },
  "es-MX": {
    idle: "LISTO",
    listening: "ESCUCHANDO",
    thinking: "PENSANDO",
    speaking: "HABLANDO",
    paused: "PAUSADO",
    ended: "FINALIZADO",
    muteMic: "Silenciar Mic",
    unmuteMic: "Activar Mic",
    autoConvo: "Conversaciones Auto",
    langToggle: "ES | EN",
    currentWorld: "Isla Central",
    startActivity: "Intentar Reto",
    askQuestion: "Hacer Pregunta",
    walkAway: "Alejarse",
    mastered: "Dominado",
    inProgress: "En Progreso",
    locked: "Bloqueado",
    new: "Nuevo",
  },
};
