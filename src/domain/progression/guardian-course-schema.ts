export type AgeBand = "6-8" | "9-12" | "13-15" | "16-17";

export interface LocalizedText {
  en: string;
  es: string;
}

export interface DialogueLine {
  speaker: "Nyrava" | "Guardian" | "System" | "Sender";
  text: LocalizedText;
  emotion?: "neutral" | "warning" | "curious" | "excited" | "proud";
}

export interface StoryChapter {
  id: string;
  title: LocalizedText;
  narrative: LocalizedText;
  dialogue: DialogueLine[];
  messagePreview?: {
    header: LocalizedText;
    body: LocalizedText;
    actionLabel: LocalizedText;
  };
}

export interface WarningSignDiscovery {
  id: string;
  number: number;
  title: LocalizedText;
  concept: LocalizedText;
  explanation: LocalizedText;
  keyTakeaway: LocalizedText;
}

export interface GuardianRuleStep {
  step: "STOP" | "THINK" | "CHECK";
  title: LocalizedText;
  action: LocalizedText;
  questionsToAsk: LocalizedText[];
  safeExample: LocalizedText;
}

export interface SimulationOption {
  id: string;
  text: LocalizedText;
  isCorrect: boolean;
  feedbackTitle: LocalizedText;
  feedbackText: LocalizedText;
}

export interface SimulationScenario {
  id: string;
  skillId: string;
  title: LocalizedText;
  situation: LocalizedText;
  messageContent?: LocalizedText;
  options: SimulationOption[];
}

export type QuestionType = "recognition" | "application" | "reasoning" | "scenario" | "transfer";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  skillId: string;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

export interface SkillDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  criticalThreshold: number; // e.g. 80 for passwords
}

export interface GuardianCourse {
  id: string;
  title: LocalizedText;
  subject: LocalizedText;
  category: LocalizedText;
  badgeId: string;
  estimatedMinutes: number;
  xpReward: number;
  creditReward: number;
  skills: SkillDefinition[];
  story: {
    title: LocalizedText;
    chapters: StoryChapter[];
  };
  investigation: {
    title: LocalizedText;
    discoveries: WarningSignDiscovery[];
  };
  skill: {
    title: LocalizedText;
    ruleName: LocalizedText;
    ruleSteps: GuardianRuleStep[];
  };
  simulations: {
    title: LocalizedText;
    scenarios: SimulationScenario[];
  };
  assessment: {
    title: LocalizedText;
    questions: AssessmentQuestion[];
    passingScore: number;
  };
}
