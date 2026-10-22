export type InferenceMode = 'hosted' | 'local';

export type HostedModelId = 'gemma-4-26b-a4b-it' | 'gemma-4-31b-it';

export type EnergyLevel = 'Very low' | 'Low' | 'Medium' | 'High';

export type ReplyTone = 'Friendly' | 'Professional' | 'Casual' | 'Polite but firm' | 'Brief and direct';

export type SummaryTone = 'standard' | 'formal' | 'simple';

export interface ConfigStatus {
  hostedGemmaConfigured: boolean;
  devtoConfigured: boolean;
  publisherAuthRequired: boolean;
  defaultHostedModel: string;
  alternateHostedModel: string;
}

export interface LocalOllamaStatus {
  tested: boolean;
  reachable: boolean;
  models: string[];
  lastTestedAt: string | null;
  error?: string;
}

export interface UserPreferences {
  inferenceMode: InferenceMode;
  hostedModel: HostedModelId;
  ollamaBaseUrl: string;
  localModel: string;
  defaultEnergy: EnergyLevel;
  defaultReplyTone: ReplyTone;
  saveHistory: boolean;
  publisherAccessCode: string; // Stored in memory / session for owner convenience
}

// Feature 1: Brain Dump
export interface ActionableTask {
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  effort: string;
  whyNow?: string;
}

export interface DeferredTask {
  task: string;
  reason: string;
}

export interface DroppedTask {
  task: string;
  recommendation: string;
}

export interface BrainDumpResult {
  summary: string;
  nextAction: string;
  actionableTasks: ActionableTask[];
  canWait: DeferredTask[];
  removeOrDelegate: DroppedTask[];
  suggestedOrder: string[];
  rawText?: string;
}

// Feature 2: Tiny Plan
export interface ScheduleItem {
  order: number;
  task: string;
  duration: string;
  isBreak: boolean;
  notes?: string;
}

export interface TinyPlanResult {
  conflictNotes: string | null;
  firstTask: string;
  smallestNextAction: string;
  totalEstimatedMinutes: number;
  schedule: ScheduleItem[];
  whatCanWait: string[];
  stoppingPoint: string;
  rawText?: string;
}

// Feature 3: Two-Line Summary
export interface TwoLineSummaryResult {
  twoLineSummary: string;
  centralMessage: string;
  actionItems: string[];
  importantDatesAndDeadlines: string[];
  ambiguityWarning: string | null;
  rawText?: string;
}

// Feature 4: Reply Assistant
export interface ReplyAssistantResult {
  replyText: string;
  toneUsed: string;
  keyPointsCovered: string[];
  slothTip?: string;
  rawText?: string;
}

// Feature 5 & 6: DEV.to Article
export interface DevtoArticleData {
  title: string;
  description: string;
  tags: string[];
  body_markdown: string;
}

export interface DevtoArticleDetails {
  projectName: string;
  creatorName: string;
  projectDescription: string;
  githubUrl: string;
  demoUrl: string;
  features: string[];
  hostedModel: string;
  localModel: string;
  devEnvironment: string;
  completedTests: string;
  knownLimitations: string;
  whatWasLearned: string;
  additionalNotes: string;
}

export interface SavedPlanHistory {
  id: string;
  timestamp: string;
  title: string;
  plan: TinyPlanResult;
}
