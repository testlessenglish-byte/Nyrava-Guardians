import { type GuardianCourse } from "../guardian-course-schema.ts";

export const PASSWORD_SAFETY_COURSE: GuardianCourse = {
  id: "password-safety",
  title: {
    en: "Password Protection: The Vault Breach",
    es: "Protección de Contraseñas: La Brecha de la Bóveda",
  },
  subject: {
    en: "Credential Security & Multi-Factor Protection",
    es: "Seguridad de Credenciales y Protección Multifactor",
  },
  category: {
    en: "Security Foundations",
    es: "Fundamentos de Seguridad",
  },
  badgeId: "password-protector",
  estimatedMinutes: 15,
  xpReward: 350,
  creditReward: 100,
  skills: [
    {
      id: "passphrase_strength",
      name: { en: "Passphrase Strength", es: "Fortaleza de Frases de Contraseña" },
      description: {
        en: "Creating long, memorable, and unpredictable secret phrases.",
        es: "Crear frases secretas largas, memorables e impredecibles.",
      },
      criticalThreshold: 80,
    },
    {
      id: "unique_credentials",
      name: { en: "Unique Credentials Habit", es: "Hábito de Credenciales Únicas" },
      description: {
        en: "Preventing chain compromises by isolating passwords per service.",
        es: "Prevenir compromisos en cadena aislando contraseñas por servicio.",
      },
      criticalThreshold: 80,
    },
    {
      id: "mfa_protection",
      name: { en: "MFA Code Secrecy", es: "Secreto de Códigos MFA" },
      description: {
        en: "Keeping second-factor authentication push prompts strictly private.",
        es: "Mantener los avisos del segundo factor estrictamente privados.",
      },
      criticalThreshold: 85,
    },
    {
      id: "personal_clue_avoidance",
      name: { en: "Personal Clue Avoidance", es: "Evitar Pistas Personales" },
      description: {
        en: "Removing names, pets, birthdays, and public details from secrets.",
        es: "Eliminar nombres, mascotas, cumpleaños y datos públicos de secretos.",
      },
      criticalThreshold: 75,
    },
  ],
  story: {
    title: {
      en: "Chapter 1 — The Vault Warning",
      es: "Capítulo 1 — La Advertencia de la Bóveda",
    },
    chapters: [
      {
        id: "ch1-vault-alert",
        title: { en: "Unusual Sign-in Attempt", es: "Intento Extraño de Inicio de Sesión" },
        narrative: {
          en: "While customizing your Guardian avatar, a red security banner flashed across your terminal. Nyrava floated down with a serious expression.",
          es: "Mientras personalizabas tu avatar, apareció un banner rojo de seguridad en tu terminal. Nyrava descendió con una expresión seria.",
        },
        dialogue: [
          {
            speaker: "Nyrava",
            text: {
              en: "Guardian, our vault monitor detected a sign-in attempt from an unknown device in another city!",
              es: "¡Guardian, nuestro monitor detectó un intento de inicio de sesión desde un dispositivo desconocido en otra ciudad!",
            },
            emotion: "warning",
          },
          {
            speaker: "Guardian",
            text: {
              en: "How could that happen? My password was easy for me to remember: my pet's name plus 123!",
              es: "¿Cómo pudo pasar? Mi contraseña era fácil de recordar: ¡el nombre de mi mascota más 123!",
            },
            emotion: "curious",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "That is exactly why! Easy for you to remember often means easy for an automated bot to guess from your public profile.",
              es: "¡Por eso mismo! Fácil de recordar para ti a menudo significa fácil de adivinar para un bot desde tu perfil público.",
            },
            emotion: "warning",
          },
        ],
      },
      {
        id: "ch2-mfa-lockdown",
        title: { en: "The 2FA Shield Holds", es: "El Escudo 2FA Se Mantiene" },
        narrative: {
          en: "Your terminal chimed as a 6-digit code arrived on your phone. A chat popup requested the code immediately.",
          es: "Tu terminal sonó cuando llegó un código de 6 dígitos a tu teléfono. Un chat pidió el código de inmediato.",
        },
        dialogue: [
          {
            speaker: "Sender",
            text: {
              en: "Support Bot: Enter your 6-digit code here to verify and block the attacker!",
              es: "Bot de Soporte: ¡Ingresa tu código de 6 dígitos aquí para verificar y bloquear al atacante!",
            },
            emotion: "excited",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "HOLD! That code is the secondary key to your vault. If you paste it there, the attacker gets inside!",
              es: "¡DETENTE! Ese código es la segunda llave de tu bóveda. Si lo pegas ahí, ¡el atacante entrará!",
            },
            emotion: "warning",
          },
        ],
      },
    ],
  },
  investigation: {
    title: {
      en: "Investigation — 3 Vault Vulnerabilities",
      es: "Investigación — 3 Vulnerabilidades de la Bóveda",
    },
    discoveries: [
      {
        id: "vuln-1-predictable",
        number: 1,
        title: { en: "VULNERABILITY #1 — Predictable Personal Clues", es: "VULNERABILIDAD #1 — Pistas Personales Predecibles" },
        concept: {
          en: "Using pet names, birthdays, or sports teams as passwords.",
          es: "Usar nombres de mascotas, cumpleaños o equipos deportivos como contraseña.",
        },
        explanation: {
          en: "Attackers look at social media posts to build automated wordlists containing your pet's name, birth year, and school.",
          es: "Los atacantes miran redes sociales para crear listas automatizadas con el nombre de tu mascota y año de nacimiento.",
        },
        keyTakeaway: {
          en: "Never use public personal facts inside secret passwords.",
          es: "Nunca uses datos personales públicos dentro de contraseñas secretas.",
        },
      },
      {
        id: "vuln-2-reuse",
        number: 2,
        title: { en: "VULNERABILITY #2 — Password Reuse", es: "VULNERABILIDAD #2 — Reutilización de Contraseñas" },
        concept: {
          en: "Using the same password for gaming, school, and email.",
          es: "Usar la misma contraseña para juegos, escuela y correo.",
        },
        explanation: {
          en: "If a low-security website gets leaked, attackers try that exact email and password combination on every major website.",
          es: "Si un sitio web sencillo sufre una fuga, los atacantes prueban esa misma combinación en todos los sitios importantes.",
        },
        keyTakeaway: {
          en: "One breach should never compromise all your accounts.",
          es: "Una fuga nunca debe comprometer todas tus cuentas.",
        },
      },
      {
        id: "vuln-3-mfa-sharing",
        number: 3,
        title: { en: "VULNERABILITY #3 — Sharing Verification Codes", es: "VULNERABILIDAD #3 — Compartir Códigos de Verificación" },
        concept: {
          en: "Pasting SMS or authenticator app codes into chat windows.",
          es: "Pegar códigos de SMS o autenticadores en ventanas de chat.",
        },
        explanation: {
          en: "Verification codes prove you have physical access to your device. No genuine support agent will ever ask you to send them your code.",
          es: "Los códigos demuestran acceso físico a tu dispositivo. Ningún agente genuino te pedirá que le envíes tu código.",
        },
        keyTakeaway: {
          en: "Verification codes are secret passkeys meant for sign-in screens only.",
          es: "Los códigos de verificación son llaves secretas solo para pantallas de inicio de sesión.",
        },
      },
    ],
  },
  skill: {
    title: {
      en: "The Vault Rule: LENGTH + UNPREDICTABILITY + ISOLATION",
      es: "La Regla de la Bóveda: LONGITUD + IMPREDECIBILIDAD + AISLAMIENTO",
    },
    ruleName: {
      en: "PASSPHRASE VAULT RULE",
      es: "REGLA DE LA BÓVEDA DE CONTRASEÑAS",
    },
    ruleSteps: [
      {
        step: "STOP",
        title: { en: "1. USE LONG PASSPHRASES", es: "1. USA FRASES LARGAS" },
        action: {
          en: "Combine 4 random, memorable words with symbols instead of short words.",
          es: "Combina 4 palabras aleatorias y memorables con símbolos en lugar de palabras cortas.",
        },
        questionsToAsk: [
          { en: "Is it longer than 14 characters?", es: "¿Es más larga que 14 caracteres?" },
          { en: "Example: Purple-River-Cloud-Train!", es: "Ejemplo: Rio-Morado-Nube-Tren!" },
        ],
        safeExample: {
          en: "Long passphrases take computer bots thousands of years to guess.",
          es: "Las frases largas le toman a los bots miles de años adivinar.",
        },
      },
      {
        step: "THINK",
        title: { en: "2. ISOLATE IMPORTANT ACCOUNTS", es: "2. AISLA CUENTAS IMPORTANTES" },
        action: {
          en: "Give your primary email and gaming accounts unique secrets.",
          es: "Dale a tu correo principal y juegos contraseñas únicas.",
        },
        questionsToAsk: [
          { en: "If this site gets leaked, will my email stay safe?", es: "Si este sitio se filtra, ¿mi correo estará a salvo?" },
        ],
        safeExample: {
          en: "Unique passwords prevent domino-effect account takeovers.",
          es: "Las contraseñas únicas evitan secuestros en efecto dominó.",
        },
      },
      {
        step: "CHECK",
        title: { en: "3. GUARD SECONDARY CODES", es: "3. PROTEGE CÓDIGOS SECUNDARIOS" },
        action: {
          en: "Treat 2FA codes like master keys. Never share them in chat.",
          es: "Trata los códigos 2FA como llaves maestras. Nunca los compartas en chat.",
        },
        questionsToAsk: [
          { en: "Did I personally start this login prompt?", es: "¿Yo inicié este aviso de inicio de sesión?" },
        ],
        safeExample: {
          en: "Reject any login prompt you didn't initiate.",
          es: "Rechaza cualquier aviso que no hayas iniciado.",
        },
      },
    ],
  },
  simulations: {
    title: {
      en: "Vault Security Training Simulation",
      es: "Simulación de Entrenamiento de Seguridad de Bóveda",
    },
    scenarios: [
      {
        id: "sim-1-passphrase-selection",
        skillId: "passphrase_strength",
        title: { en: "Scenario 1: Choosing a New Password", es: "Escenario 1: Elegir una Nueva Contraseña" },
        situation: {
          en: "You are creating a password for your main Guardian account. Which option provides maximum security?",
          es: "Estás creando una contraseña para tu cuenta principal. ¿Qué opción ofrece la máxima seguridad?",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Guardian2026!", es: "Guardian2026!" },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Too Predictable", es: "🟡 Demasiado Predecible" },
            feedbackText: {
              en: "Short words with predictable years are easily cracked by automated dictionary tools.",
              es: "Palabras cortas con años predecibles son descifradas fácilmente por herramientas automáticas.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Blue-Dragon-Planet-99#", es: "Dragon-Azul-Planeta-99#" },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Master Passphrase!", es: "🟢 ¡Frase de Contraseña Maestra!" },
            feedbackText: {
              en: "Excellent! 4 random words with numbers and symbols form an extremely strong secret vault key.",
              es: "¡Excelente! 4 palabras aleatorias con números y símbolos forman una llave secreta muy fuerte.",
            },
          },
        ],
      },
      {
        id: "sim-2-code-prompt",
        skillId: "mfa_protection",
        title: { en: "Scenario 2: Unexpected 2FA Prompt", es: "Escenario 2: Aviso Inesperado de 2FA" },
        situation: {
          en: "While watching a stream, an SMS code pops up on your phone saying: 'Your sign-in verification code is 849201'. You didn't try to log in.",
          es: "Mientras ves un video, llega un SMS a tu teléfono: 'Tu código de verificación es 849201'. Tú no intentaste iniciar sesión.",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Ignore and reject the prompt, then change your password immediately.", es: "Ignorar y rechazar el aviso, y cambiar tu contraseña de inmediato." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Perfect Vault Defense!", es: "🟢 ¡Defensa de Bóveda Perfecta!" },
            feedbackText: {
              en: "An unexpected code means someone has your password! Rejecting the code stopped them, and changing your password secures your account.",
              es: "¡Un código inesperado significa que alguien tiene tu contraseña! Rechazarlo los detuvo y cambiarla asegura tu cuenta.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Reply to the SMS asking who tried to sign in.", es: "Responder al SMS preguntando quién intentó entrar." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Ineffective", es: "🟡 Ineficaz" },
            feedbackText: {
              en: "Automated SMS senders do not read replies. Act immediately by securing your account.",
              es: "Los remitentes automáticos no leen respuestas. Actúa de inmediato asegurando tu cuenta.",
            },
          },
        ],
      },
    ],
  },
  assessment: {
    title: {
      en: "Password & Credential Competency Test",
      es: "Examen de Competencia de Contraseñas y Credenciales",
    },
    passingScore: 75,
    questions: [
      {
        id: "q1-strongest-passphrase",
        type: "recognition",
        skillId: "passphrase_strength",
        prompt: {
          en: "Which of the following is the strongest secret passphrase?",
          es: "¿Cuál de las siguientes es la frase de contraseña más fuerte?",
        },
        options: [
          { en: "myDogMax1", es: "miPerroMax1" },
          { en: "123456789", es: "123456789" },
          { en: "Falcon-Silver-Forest-88!", es: "Halcón-Plata-Bosque-88!" },
          { en: "password2026", es: "contraseña2026" },
        ],
        correctIndex: 2,
        explanation: {
          en: "Long passphrases built with random words and special characters offer exponentially stronger protection.",
          es: "Las frases de contraseña largas construidas con palabras aleatorias y caracteres especiales ofrecen mayor protección.",
        },
      },
      {
        id: "q2-reuse-danger",
        type: "reasoning",
        skillId: "unique_credentials",
        prompt: {
          en: "Why is reusing the same password across multiple websites dangerous?",
          es: "¿Por qué es peligroso reutilizar la misma contraseña en varios sitios web?",
        },
        options: [
          { en: "It makes your computer run out of memory.", es: "Hace que la computadora se quede sin memoria." },
          { en: "If one website gets breached, attackers can unlock all your other accounts.", es: "Si un sitio web es vulnerado, los atacantes pueden abrir todas tus demás cuentas." },
          { en: "Websites charge extra fees for re-used passwords.", es: "Los sitios cobran tarifas extra por contraseñas reutilizadas." },
          { en: "It changes your username automatically.", es: "Cambia tu nombre de usuario automáticamente." },
        ],
        correctIndex: 1,
        explanation: {
          en: "Attackers test stolen credential pairs across popular platforms in credential stuffing attacks.",
          es: "Los atacantes prueban pares de credenciales robadas en plataformas populares.",
        },
      },
      {
        id: "q3-2fa-secrecy",
        type: "application",
        skillId: "mfa_protection",
        prompt: {
          en: "You suddenly receive an unsolicited phone push notification asking: 'Approve sign-in from New City? (Yes / No)'. You did not try to log in. What should you do?",
          es: "De repente recibes una notificación emergente en tu teléfono: '¿Aprobar inicio de sesión desde Nueva Ciudad? (Sí / No)'. Tú no intentaste entrar. ¿Qué debes hacer?",
        },
        options: [
          { en: "Tap Yes to clear the notification from your screen.", es: "Tocar Sí para borrar la notificación de tu pantalla." },
          { en: "Tap No / Deny immediately, then change your account password.", es: "Tocar No / Rechazar de inmediato y luego cambiar tu contraseña de cuenta." },
          { en: "Wait 1 hour and then tap Yes.", es: "Esperar 1 hora y luego tocar Sí." },
          { en: "Share the alert screenshot on a forum.", es: "Compartir la captura del aviso en un foro." },
        ],
        correctIndex: 1,
        explanation: {
          en: "Unsolicited 2FA push prompts mean an attacker knows your password. Denying the prompt stops them, and changing your password secures your account.",
          es: "Los avisos 2FA no solicitados significan que un atacante sabe tu contraseña. Rechazar el aviso los detiene y cambiar tu contraseña asegura tu cuenta.",
        },
      },
    ],
  },
};
