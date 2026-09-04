import { type GuardianCourse } from "../guardian-course-schema.ts";

export const PHISHING_DEFENSE_COURSE: GuardianCourse = {
  id: "phishing-defense",
  title: {
    en: "Phishing Defense: The Mystery Message",
    es: "Defensa contra Phishing: El Mensaje Misterioso",
  },
  subject: {
    en: "Cyber Safety & Phishing Prevention",
    es: "Ciberseguridad y Prevención de Phishing",
  },
  category: {
    en: "Security Foundations",
    es: "Fundamentos de Seguridad",
  },
  badgeId: "scam-spotter",
  estimatedMinutes: 15,
  xpReward: 350,
  creditReward: 100,
  skills: [
    {
      id: "urgency_detection",
      name: { en: "Urgency Detection", es: "Detección de Urgencia" },
      description: {
        en: "Recognizing artificial pressure tactics and fake deadlines.",
        es: "Reconocer tácticas de presión artificial y fechas límite falsas.",
      },
      criticalThreshold: 75,
    },
    {
      id: "unexpected_prizes",
      name: { en: "Unexpected Prize Caution", es: "Precaución con Premios Inesperados" },
      description: {
        en: "Identifying unsolicited rewards and giveaway scams.",
        es: "Identificar recompensas no solicitadas y estafas de premios.",
      },
      criticalThreshold: 75,
    },
    {
      id: "password_protection",
      name: { en: "Password & Secret Protection", es: "Protección de Contraseñas y Secretos" },
      description: {
        en: "Keeping credentials and verification codes strictly private.",
        es: "Mantener credenciales y códigos de verificación estrictamente privados.",
      },
      criticalThreshold: 80,
    },
    {
      id: "verification_habits",
      name: { en: "Official Verification Habits", es: "Hábitos de Verificación Oficial" },
      description: {
        en: "Checking accounts independently through trusted official apps.",
        es: "Verificar cuentas de forma independiente a través de aplicaciones oficiales.",
      },
      criticalThreshold: 75,
    },
  ],
  story: {
    title: {
      en: "Chapter 1 — The Mysterious Message",
      es: "Capítulo 1 — El Mensaje Misterioso",
    },
    chapters: [
      {
        id: "ch1-notification",
        title: { en: "An Unexpected Notification", es: "Una Notificación Inesperada" },
        narrative: {
          en: "It was a normal afternoon in Isla Central. You were sitting at your home terminal playing your favorite game when your AI companion, Nyrava, suddenly materialized beside your screen with a glowing blue indicator.",
          es: "Era una tarde normal en Isla Central. Estabas sentado en tu terminal jugando tu juego favorito cuando tu compañero IA, Nyrava, apareció de repente junto a tu pantalla con un indicador azul brillante.",
        },
        dialogue: [
          {
            speaker: "Nyrava",
            text: {
              en: "Guardian, attention! A high-priority notification just arrived for your account.",
              es: "¡Guardian, atención! Acaba de llegar una notificación de alta prioridad para tu cuenta.",
            },
            emotion: "warning",
          },
          {
            speaker: "Guardian",
            text: {
              en: "What kind of notification? I wasn't expecting anything.",
              es: "¿Qué tipo de notificación? No estaba esperando nada.",
            },
            emotion: "curious",
          },
          {
            speaker: "Sender",
            text: {
              en: "🎁 CONGRATULATIONS! You have been selected as today's grand winner of a brand-new gaming console! Claim within 10 minutes!",
              es: "🎁 ¡FELICIDADES! ¡Has sido seleccionado como el gran ganador de una consola de videojuegos nueva! ¡Reclama en 10 minutos!",
            },
            emotion: "excited",
          },
        ],
        messagePreview: {
          header: {
            en: "🎁 OFFICIAL PRIZE ALERT — ACT NOW!",
            es: "🎁 ALERTA OFICIAL DE PREMIO — ¡ACTÚA AHORA!",
          },
          body: {
            en: "You won 1st Place in the Guardian Championship! Click below and enter your password & phone number to claim.",
            es: "¡Ganaste el 1er Lugar en el Campeonato Guardian! Haz clic abajo e ingresa tu contraseña y teléfono para reclamar.",
          },
          actionLabel: { en: "👉 CLAIM NOW (10m left)", es: "👉 RECLAMAR AHORA (Quedan 10m)" },
        },
      },
      {
        id: "ch2-investigation-trigger",
        title: { en: "Knowing When to Stop", es: "Saber Cuándo Detenerse" },
        narrative: {
          en: "You moved your mouse cursor toward the bright green button. You felt a wave of excitement, but also a quiet question in the back of your mind.",
          es: "Moviste el cursor hacia el botón verde brillante. Sentiste entusiasmo, pero también una duda en el fondo de tu mente.",
        },
        dialogue: [
          {
            speaker: "Guardian",
            text: {
              en: "Wait... I don't remember entering any contest.",
              es: "Espera... No recuerdo haber entrado en ningún concurso.",
            },
            emotion: "curious",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "STOP! Excellent instinct, Guardian. Remember our core rule: The smartest thing online isn't knowing everything—it's knowing when to stop and think.",
              es: "¡ALTO! Excelente instinto, Guardian. Recuerda nuestra regla: Lo más inteligente en línea no es saberlo todo, sino saber cuándo detenerse a pensar.",
            },
            emotion: "warning",
          },
          {
            speaker: "Nyrava",
            text: {
              en: "I am not saying it is fake yet. I am saying we don't know it is real. Let's start a formal investigation before anyone clicks anything.",
              es: "No digo que sea falso aún. Digo que no sabemos si es real. Iniciemos una investigación formal antes de hacer clic.",
            },
            emotion: "neutral",
          },
        ],
      },
    ],
  },
  investigation: {
    title: {
      en: "The Investigation — 3 Warning Signs",
      es: "La Investigación — 3 Señales de Advertencia",
    },
    discoveries: [
      {
        id: "sign-1-urgency",
        number: 1,
        title: { en: "WARNING SIGN #1 — Artificial Urgency", es: "SEÑAL DE ADVERTENCIA #1 — Urgencia Artificial" },
        concept: {
          en: "Claim your prize within 10 minutes!",
          es: "¡Reclama tu premio en 10 minutos!",
        },
        explanation: {
          en: "Scammers create artificial countdowns and fake deadlines to make your brain panic. They want you to rush so you don't take time to ask 'Is this real?'",
          es: "Los estafadores crean conteos regresivos artificiales para hacerte entrar en pánico. Quieren que te apresures para que no te preguntes '¿Es esto real?'",
        },
        keyTakeaway: {
          en: "Real official rewards rarely expire in 10 minutes.",
          es: "Las recompensas oficiales verdaderas raras veces vencen en 10 minutos.",
        },
      },
      {
        id: "sign-2-unexpected",
        number: 2,
        title: { en: "WARNING SIGN #2 — Unexpected Prize", es: "SEÑAL DE ADVERTENCIA #2 — Premio Inesperado" },
        concept: {
          en: "You have won a free gaming console!",
          es: "¡Has ganado una consola de videojuegos gratis!",
        },
        explanation: {
          en: "If you didn't enter a contest or buy a ticket, receiving a prize notification out of nowhere is a major red flag.",
          es: "Si no participaste en un concurso ni compraste un boleto, recibir una notificación de premio de la nada es una gran señal de alerta.",
        },
        keyTakeaway: {
          en: "Unsolicited prizes are a primary trick to hook your curiosity.",
          es: "Los premios no solicitados son el truco principal para enganchar tu curiosidad.",
        },
      },
      {
        id: "sign-3-secrets",
        number: 3,
        title: { en: "WARNING SIGN #3 — Secret Requests", es: "SEÑAL DE ADVERTENCIA #3 — Solicitud de Secretos" },
        concept: {
          en: "Enter your password, phone number, and verification code.",
          es: "Ingresa tu contraseña, número telefónico y código de verificación.",
        },
        explanation: {
          en: "Passwords and verification codes are secret keys to your digital identity. Legitimate prize providers will NEVER ask for your password or SMS codes.",
          es: "Las contraseñas y códigos de verificación son llaves secretas. Los proveedores legítimos NUNCA te pedirán tus contraseñas ni códigos SMS.",
        },
        keyTakeaway: {
          en: "Never share passwords or 2FA codes with anyone.",
          es: "Nunca compartas contraseñas ni códigos 2FA con nadie.",
        },
      },
    ],
  },
  skill: {
    title: {
      en: "The Guardian Rule: STOP → THINK → CHECK",
      es: "La Regla Guardian: ALTO → PIENSA → VERIFICA",
    },
    ruleName: {
      en: "STOP → THINK → CHECK",
      es: "ALTO → PIENSA → VERIFICA",
    },
    ruleSteps: [
      {
        step: "STOP",
        title: { en: "1. STOP", es: "1. ALTO" },
        action: {
          en: "Do not click links, download attachments, or type passwords immediately.",
          es: "No hagas clic en enlaces, descargues archivos ni escribas contraseñas inmediatamente.",
        },
        questionsToAsk: [
          { en: "Give yourself a 5-second pause.", es: "Tómate una pausa de 5 segundos." },
          { en: "Take your hand off the mouse.", es: "Quita la mano del mouse." },
        ],
        safeExample: {
          en: "Pausing gives your logical brain time to evaluate clues.",
          es: "Pausar le da tiempo a tu cerebro lógico para evaluar pistas.",
        },
      },
      {
        step: "THINK",
        title: { en: "2. THINK", es: "2. PIENSA" },
        action: {
          en: "Evaluate the message with 4 critical questions.",
          es: "Evalúa el mensaje con 4 preguntas críticas.",
        },
        questionsToAsk: [
          { en: "Was I expecting this message?", es: "¿Estaba esperando este mensaje?" },
          { en: "Is it creating artificial urgency or fear?", es: "¿Está creando urgencia o miedo artificial?" },
          { en: "Is it offering an unexpected reward?", es: "¿Ofrece una recompensa inesperada?" },
          { en: "Is it asking for private secrets?", es: "¿Solicita secretos privados?" },
        ],
        safeExample: {
          en: "If the answer to any question is suspicious, treat it as dangerous.",
          es: "Si la respuesta a alguna pregunta es sospechosa, trátalo como peligroso.",
        },
      },
      {
        step: "CHECK",
        title: { en: "3. CHECK", es: "3. VERIFICA" },
        action: {
          en: "Verify through an independent, official channel.",
          es: "Verifica a través de un canal independiente y oficial.",
        },
        questionsToAsk: [
          { en: "Open the official app directly instead of clicking the link.", es: "Abre la app oficial directamente en lugar de hacer clic en el enlace." },
          { en: "Ask a trusted adult or security specialist.", es: "Consulta a un adulto de confianza o especialista en seguridad." },
        ],
        safeExample: {
          en: "Opening the official game app yourself is always 100% safe.",
          es: "Abrir la app oficial del juego tú mismo es siempre 100% seguro.",
        },
      },
    ],
  },
  simulations: {
    title: {
      en: "Guardian Training Simulation",
      es: "Simulación de Entrenamiento Guardian",
    },
    scenarios: [
      {
        id: "sim-1-account-deletion",
        skillId: "urgency_detection",
        title: { en: "Scenario 1: Urgent Account Warning", es: "Escenario 1: Advertencia Urgente de Cuenta" },
        situation: {
          en: "You receive an email: 'URGENT! Your gaming account will be deleted TODAY! Click this link immediately to verify ownership.'",
          es: "Recibes un correo: '¡URGENTE! Tu cuenta será borrada HOY. Haz clic aquí inmediatamente para verificar tu propiedad.'",
        },
        messageContent: {
          en: "⚠️ ACCOUNT DELETION NOTICE — Click here within 5 minutes or lose all progress!",
          es: "⚠️ AVISO DE ELIMINACIÓN — ¡Haz clic en 5 minutos o perderás todo tu progreso!",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Click immediately because you don't want your account deleted.", es: "Hacer clic inmediatamente porque no quieres perder tu cuenta." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Not Quite", es: "🟡 No Exactamente" },
            feedbackText: {
              en: "The message is trying to make you panic. Fake deadlines are a classic scam pressure tactic. Remember: STOP → THINK → CHECK.",
              es: "El mensaje intenta causarte pánico. Las fechas límite falsas son una táctica clásica de presión. Recuerda: ALTO → PIENSA → VERIFICA.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Enter your password to stop the deletion.", es: "Ingresar tu contraseña para detener la eliminación." },
            isCorrect: false,
            feedbackTitle: { en: "🔴 Dangerous Choice", es: "🔴 Elección Peligrosa" },
            feedbackText: {
              en: "Never enter your password on a link sent in an unexpected email! That hands your account keys straight to an attacker.",
              es: "¡Nunca ingreses tu contraseña en un enlace no esperado! Eso le entrega las llaves de tu cuenta al atacante.",
            },
          },
          {
            id: "opt-c",
            text: { en: "Stop, ignore the link, and open the official game app directly to check.", es: "Detenerse, ignorar el enlace y abrir la app oficial del juego directamente para revisar." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Excellent Choice!", es: "🟢 ¡Excelente Elección!" },
            feedbackText: {
              en: "Perfect Guardian action! You recognized artificial urgency and verified through the official app route safely.",
              es: "¡Acción Guardian perfecta! Reconociste la urgencia artificial y verificaste a través de la ruta oficial de la app.",
            },
          },
        ],
      },
      {
        id: "sim-2-code-request",
        skillId: "password_protection",
        title: { en: "Scenario 2: Verification Code Request", es: "Escenario 2: Solicitud de Código de Verificación" },
        situation: {
          en: "A friend's account sends you a chat message: 'Hey! I accidentally sent my login code to your phone. Can you paste it back to me quick?'",
          es: "La cuenta de un amigo te envía un chat: '¡Hola! Envié por error mi código de inicio a tu teléfono. ¿Me lo puedes reenviar rápido?'",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Send the code since it came from your friend's name.", es: "Enviar el código porque vino con el nombre de tu amigo." },
            isCorrect: false,
            feedbackTitle: { en: "🔴 Account Compromise Risk", es: "🔴 Riesgo de Compromiso de Cuenta" },
            feedbackText: {
              en: "Your friend's account may have been hacked! The code sent to YOUR phone is for YOUR account. Never share verification codes.",
              es: "¡La cuenta de tu amigo pudo ser hackeada! El código enviado a TU teléfono es para TU cuenta. Nunca compartas códigos.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Keep the code private and talk to your friend in person or voice call.", es: "Mantener el código privado y hablar con tu amigo en persona o llamada." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Outstanding Security Practice!", es: "🟢 ¡Excelente Práctica de Seguridad!" },
            feedbackText: {
              en: "Verification codes are strictly private. Calling your friend confirmed their account was hijacked.",
              es: "Los códigos de verificación son estrictamente privados. Llamar a tu amigo confirmó que su cuenta fue secuestrada.",
            },
          },
        ],
      },
      {
        id: "sim-3-influencer-giveaway",
        skillId: "unexpected_prizes",
        title: { en: "Scenario 3: Social Media Currency Giveaway", es: "Escenario 3: Sorteo de Moneda en Redes Sociales" },
        situation: {
          en: "A social media post says: 'Giving away 50,000 free Game Coins! Click link & log in with your account to receive instant coins!'",
          es: "Una publicación en redes sociales dice: '¡Regalando 50,000 Monedas gratis! ¡Haz clic e inicia sesión para recibir monedas instantáneas!'",
        },
        options: [
          {
            id: "opt-a",
            text: { en: "Click the link and log in right away.", es: "Hacer clic en el enlace e iniciar sesión de inmediato." },
            isCorrect: false,
            feedbackTitle: { en: "🟡 Phishing Trap", es: "🟡 Trampa de Phishing" },
            feedbackText: {
              en: "Free currency giveaways asking for account logins are fraudulent phishing traps designed to steal accounts.",
              es: "Los sorteos de monedas gratis que piden inicio de sesión son trampas fraudulentas para robar cuentas.",
            },
          },
          {
            id: "opt-b",
            text: { en: "Recognize the unexpected prize trap and report the fake giveaway post.", es: "Reconocer la trampa de premio inesperado y reportar la publicación falsa." },
            isCorrect: true,
            feedbackTitle: { en: "🟢 Master Guardian Spotting!", es: "🟢 ¡Detección de Guardian Maestro!" },
            feedbackText: {
              en: "Spotting fake giveaways keeps your account and your friends' accounts safe!",
              es: "¡Detectar falsos sorteos mantiene tu cuenta y las de tus amigos a salvo!",
            },
          },
        ],
      },
    ],
  },
  assessment: {
    title: {
      en: "Guardian Knowledge & Reasoning Test",
      es: "Prueba de Conocimiento y Razonamiento Guardian",
    },
    passingScore: 75,
    questions: [
      {
        id: "q1-urgency-recognition",
        type: "recognition",
        skillId: "urgency_detection",
        prompt: {
          en: "A message says: 'You won $1,000! You must claim your prize in the next 5 minutes or it will disappear forever!' Which warning sign is being used?",
          es: "Un mensaje dice: '¡Ganaste $1,000! Debes reclamar tu premio en los próximos 5 minutos o desaparecerá.' ¿Qué señal se está usando?",
        },
        options: [
          { en: "Artificial Urgency", es: "Urgencia Artificial" },
          { en: "Software Update Notice", es: "Aviso de Actualización de Software" },
          { en: "Password Reminder", es: "Recordatorio de Contraseña" },
          { en: "Normal Game Notification", es: "Notificación Normal del Juego" },
        ],
        correctIndex: 0,
        explanation: {
          en: "Short 5-minute countdowns create artificial urgency to force hasty decisions.",
          es: "Conteos regresivos cortos de 5 minutos crean urgencia artificial para forzar decisiones apresuradas.",
        },
      },
      {
        id: "q2-verification-codes",
        type: "application",
        skillId: "password_protection",
        prompt: {
          en: "Someone claiming to be from official player support asks for your 6-digit SMS verification code. What should you do?",
          es: "Alguien que dice ser de soporte oficial te pide tu código de verificación SMS de 6 dígitos. ¿Qué debes hacer?",
        },
        options: [
          { en: "Send it immediately since they claim to be support.", es: "Enviarlo de inmediato porque dicen ser de soporte." },
          { en: "Post it in public chat for help.", es: "Publicarlo en el chat público para recibir ayuda." },
          { en: "Keep it strictly private and never share codes.", es: "Mantenerlo estrictamente privado y nunca compartir códigos." },
          { en: "Send it if they promise to delete it afterward.", es: "Enviarlo si prometen borrarlo después." },
        ],
        correctIndex: 2,
        explanation: {
          en: "Verification codes are secret login keys. Official support will NEVER ask for your SMS code.",
          es: "Los códigos de verificación son llaves secretas. El soporte oficial NUNCA te pedirá tu código SMS.",
        },
      },
      {
        id: "q3-unexpected-links",
        type: "scenario",
        skillId: "verification_habits",
        prompt: {
          en: "You receive an unexpected link claiming your account has a billing issue. What is the safest first step?",
          es: "Recibes un enlace inesperado afirmando que tu cuenta tiene un problema de facturación. ¿Cuál es el primer paso más seguro?",
        },
        options: [
          { en: "Click the link quickly to fix it.", es: "Hacer clic en el enlace rápidamente para arreglarlo." },
          { en: "Forward the link to all your friends.", es: "Reenviar el enlace a todos tus amigos." },
          { en: "Apply STOP → THINK → CHECK and verify directly on the official app.", es: "Aplicar ALTO → PIENSA → VERIFICA e ingresar directamente en la app oficial." },
          { en: "Type your password into the link.", es: "Escribir tu contraseña en el enlace." },
        ],
        correctIndex: 2,
        explanation: {
          en: "Navigating directly through official apps avoids dangerous phishing links.",
          es: "Navegar directamente a través de apps oficiales evita enlaces de phishing peligrosos.",
        },
      },
      {
        id: "q4-reasoning-transfer",
        type: "transfer",
        skillId: "unexpected_prizes",
        prompt: {
          en: "You receive a message claiming a delivery company needs your home address to drop off an unexpected package. How does the Guardian Rule apply?",
          es: "Recibes un mensaje diciendo que una paquetería necesita tu dirección para entregar un paquete inesperado. ¿Cómo aplica la Regla Guardian?",
        },
        options: [
          { en: "Give the address right away.", es: "Dar la dirección de inmediato." },
          { en: "Stop, ask if a package was expected, and verify with a trusted adult.", es: "Detenerse, preguntar si se esperaba un paquete y verificar con un adulto de confianza." },
          { en: "Click the tracking link without thinking.", es: "Hacer clic en el enlace sin pensar." },
          { en: "Send your account password instead.", es: "Enviar la contraseña de tu cuenta en su lugar." },
        ],
        correctIndex: 1,
        explanation: {
          en: "The Guardian Rule applies to all unexpected messages asking for private details.",
          es: "La Regla Guardian aplica a todos los mensajes inesperados que piden datos privados.",
        },
      },
    ],
  },
};
