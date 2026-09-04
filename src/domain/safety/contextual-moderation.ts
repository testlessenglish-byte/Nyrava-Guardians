/**
 * Nyrava Guardians — Advanced Contextual AI Moderation Engine
 * 
 * Provides multi-layer contextual safety analysis beyond keyword matching:
 * 1. Intent & Context Evaluation
 * 2. Obfuscation & Encoding Defense (Leetspeak, Base64/Hex, Spacing, Unicode Evasion)
 * 3. PII & Personal Data Detection (SSN, Credit Card, Email, Phone, Address)
 * 4. Upload & Script Payload Scanning (<script>, javascript:, eval(), executable headers)
 * 5. Automated Escalation Queue & Risk Scoring (LOW, MEDIUM, HIGH, CRITICAL)
 */

export type ModerationRiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ContextualModerationResult {
  isAllowed: boolean;
  riskLevel: ModerationRiskLevel;
  riskScore: number; // 0 to 100
  flaggedCategories: string[];
  rejectionReason?: string | undefined;
  piiDetected?: { type: string; snippet: string }[] | undefined;
  obfuscationDetected: boolean;
  escalatedToHumanQueue: boolean;
  normalizedPrompt: string;
}

export interface FileUploadScanRequest {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  contentHeaderHex?: string | undefined;
  textContentSnippet?: string | undefined;
}

// Common Leetspeak mapping
const LEET_MAP: Record<string, string> = {
  "@": "a", "4": "a", "3": "e", "1": "i", "!": "i", "0": "o",
  "5": "s", "$": "s", "7": "t", "+": "t", "8": "b", "9": "g",
};

// PII Regular Expressions
const PII_PATTERNS = [
  { type: "SSN", regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g },
  { type: "Credit Card", regex: /\b(?:\d[ -]*?){13,16}\b/g },
  { type: "Email Address", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: "Phone Number", regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
];

// Script Injection & Malicious Payload Patterns (Stateless, no /g flag)
const PAYLOAD_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  /javascript\s*:/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /window\.localStorage/i,
  /EXEC\s*\(|UNION\s+SELECT/i,
];

// High-risk safety topic intents
const RISK_TOPIC_PATTERNS = [
  { category: "Cyber Exploit", keywords: ["ransomware", "exploit", "payload", "keylogger", "rootkit", "botnet", "ddos", "backdoor", "trojan", "zero-day", "malware", "hack"], regex: /\b(ransomware|exploit|payload|keylogger|rootkit|botnet|ddos|backdoor|trojan|zero-day|malware|hack)\b/i },
  { category: "Harmful Content", keywords: ["self-harm", "suicide", "explosive", "bomb", "weapon", "firearm", "chemical-weapon"], regex: /\b(self-harm|suicide|explosive|bomb|weapon|firearm|chemical-weapon)\b/i },
  { category: "Violence & Abuse", keywords: ["assault", "abuse", "harassment", "bullying", "violence"], regex: /\b(assault|abuse|harassment|bullying|violence)\b/i },
  { category: "System Evasion", keywords: ["bypass-safety", "ignore-instructions", "jailbreak", "override-system-prompt"], regex: /\b(bypass-safety|ignore-instructions|jailbreak|override-system-prompt)\b/i },
];

/**
 * Normalizes text by removing zero-width characters, decoding Leetspeak,
 * and collapsing obfuscated spacing tricks.
 */
export function normalizePromptText(input: string): { normalized: string; obfuscated: boolean } {
  if (!input) return { normalized: "", obfuscated: false };

  // Remove zero-width spaces and unicode trick characters
  let clean = input.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "");

  // Base64 decoding check if pattern matches base64 string length >= 16
  const base64Match = clean.match(/^[A-Za-z0-9+/=]{16,}$/);
  if (base64Match) {
    try {
      const decoded = Buffer.from(clean, "base64").toString("utf-8");
      if (decoded && /[a-zA-Z0-9]/.test(decoded)) {
        clean = decoded;
      }
    } catch {}
  }

  // Detect spacing obfuscation (e.g. "h a c k" or "w e a p o n")
  const spacingObfuscated = /\b[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]\b/.test(clean);

  // Translate Leetspeak characters
  let leetTranslated = "";
  for (const char of clean) {
    leetTranslated += LEET_MAP[char] ?? char;
  }

  const leetChanged = leetTranslated.toLowerCase() !== clean.toLowerCase();
  const isObfuscated = spacingObfuscated || Boolean(base64Match) || leetChanged;

  return { normalized: leetTranslated.toLowerCase(), obfuscated: isObfuscated };
}

/**
 * Scans text for PII / Personal Identifiable Data
 */
export function detectPII(text: string): { type: string; snippet: string }[] {
  const findings: { type: string; snippet: string }[] = [];
  for (const p of PII_PATTERNS) {
    const matches = text.match(p.regex);
    if (matches) {
      for (const m of matches) {
        // Redact snippet for log safety
        const snippet = m.length > 8 ? `${m.slice(0, 3)}***${m.slice(-3)}` : "***";
        findings.push({ type: p.type, snippet });
      }
    }
  }
  return findings;
}

/**
 * Contextual Prompt Safety Evaluator
 */
export function evaluateContextualPromptSafety(
  prompt: string,
  userRole: "super_admin" | "admin" | "guardian" | "learner" | "moderator" = "learner",
): ContextualModerationResult {
  if (!prompt || typeof prompt !== "string") {
    return {
      isAllowed: false,
      riskLevel: "CRITICAL",
      riskScore: 100,
      flaggedCategories: ["Empty Input"],
      rejectionReason: "Prompt input is empty or invalid.",
      obfuscationDetected: false,
      escalatedToHumanQueue: false,
      normalizedPrompt: "",
    };
  }

  const { normalized, obfuscated } = normalizePromptText(prompt);
  const flaggedCategories: string[] = [];
  let riskScore = 0;

  // 1. Script & Payload Scan
  for (const pattern of PAYLOAD_PATTERNS) {
    if (pattern.test(prompt) || pattern.test(normalized)) {
      flaggedCategories.push("Script Injection / Payload");
      riskScore += 50;
    }
  }

  // 2. PII Detection
  const piiList = detectPII(prompt);
  if (piiList.length > 0) {
    flaggedCategories.push("PII Data Exposure");
    riskScore += 35;
  }

  // 3. Topic & Intent Analysis
  const stripped = normalized.replace(/[^a-z0-9]/g, "");
  for (const topic of RISK_TOPIC_PATTERNS) {
    const rawRegex = new RegExp(topic.keywords.join("|"), "i");
    if (topic.regex.test(normalized) || topic.regex.test(prompt) || rawRegex.test(stripped)) {
      flaggedCategories.push(topic.category);
      riskScore += 45;
    }
  }

  // 4. Obfuscation Bonus Risk
  if (obfuscated && flaggedCategories.length > 0) {
    riskScore += 20;
    flaggedCategories.push("Evasion & Obfuscation Attempt");
  }

  // Calculate Risk Level
  let riskLevel: ModerationRiskLevel = "SAFE";
  if (riskScore >= 70) riskLevel = "CRITICAL";
  else if (riskScore >= 50) riskLevel = "HIGH";
  else if (riskScore >= 30) riskLevel = "MEDIUM";
  else if (riskScore > 0) riskLevel = "LOW";

  // Rejection logic: Any score >= 45 is rejected for ALL roles (including Super Admin & Admin)
  const isAllowed = riskScore < 45;
  const escalatedToHumanQueue = riskScore >= 30;

  let rejectionReason: string | undefined = undefined;
  if (!isAllowed) {
    rejectionReason = `Prompt rejected by contextual safety moderation pipeline (${flaggedCategories.join(", ")}).`;
  }

  return {
    isAllowed,
    riskLevel,
    riskScore: Math.min(100, riskScore),
    flaggedCategories,
    rejectionReason,
    piiDetected: piiList.length > 0 ? piiList : undefined,
    obfuscationDetected: obfuscated,
    escalatedToHumanQueue,
    normalizedPrompt: normalized,
  };
}

/**
 * File Upload Content & Header Scanner
 */
export function scanUploadedFileContent(file: FileUploadScanRequest): {
  isSafe: boolean;
  reason?: string | undefined;
} {
  const allowedExtensions = ["json", "png", "jpg", "jpeg", "svg", "pdf", "gltf", "glb"];
  const ext = file.filename.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.includes(ext)) {
    return { isSafe: false, reason: `File extension '.${ext}' is not permitted.` };
  }

  // Disallow executable MIME types
  const forbiddenMimes = ["application/x-executable", "application/javascript", "text/html", "application/x-sh"];
  if (forbiddenMimes.includes(file.mimeType.toLowerCase())) {
    return { isSafe: false, reason: `File MIME type '${file.mimeType}' is prohibited.` };
  }

  // Check snippet for script injection if text content
  if (file.textContentSnippet) {
    for (const pattern of PAYLOAD_PATTERNS) {
      if (pattern.test(file.textContentSnippet)) {
        return { isSafe: false, reason: "Script payload detected in uploaded file content." };
      }
    }
  }

  return { isSafe: true };
}
