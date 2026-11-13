import { Edge, Node } from '@xyflow/react';

export type AppView =
  | 'home'
  | 'create'
  | 'workspace'
  | 'videos'
  | 'community'
  | 'profile'
  | 'tattva200';

export interface EngineeringVideo {
  id: string;
  title: string;
  category: 'AIML' | 'Cybersecurity' | 'AIDS' | 'Computer Science';
  subtopic: string;
  duration: string; // Strictly between 25:00 and 60:00
  durationMinutes: number;
  views: string;
  uploadDate: string;
  channelName: string;
  thumbnail: string;
  youtubeId: string;
  lectureBadge: string;
  description: string;
  keyConcepts: string[];
  suggestedInquiryQuestion: string;
}

export type LearningObjectiveId =
  | 'first-principles'
  | 'deep-research'
  | 'topic-backstory'
  | 'cross-topic'
  | 'exam-prep';

export interface LearningObjectiveMeta {
  id: LearningObjectiveId;
  label: string;
  shortLabel: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export type CardVariant =
  | 'journal'
  | 'monograph'
  | 'indigo'
  | 'emerald'
  | 'amber';

export interface ThinkForgeUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  team: string;
  bio: string;
  focusSubjects: string[];
  authSource: 'supabase' | 'local';
}

export interface InquiryNodeData extends Record<string, unknown> {
  nodeId: string;
  parentId: string | null;
  kind: 'root' | 'branch' | 'peer';
  depth: number;
  question: string;
  title: string;
  explanation: string;
  takeaways: string[];
  references: string[];
  followUps: [string, string, string];
  usedFollowUps: number[];
  authorName: string;
  authorHandle: string;
  isPeerContribution?: boolean;
  creditsEarned: number;
  createdAt: string;
  isSelected?: boolean;
  isOnActivePath?: boolean;
  onSelectFollowUp?: (parentNodeId: string, index: 0 | 1 | 2, prompt: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onBranchFromNode?: (nodeId: string) => void;
}

export interface InquirySession {
  id: string;
  title: string;
  initialQuestion: string;
  subject: string;
  objective: LearningObjectiveId;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorHandle: string;
  isForkedFromCommunity?: boolean;
  forkedFromAuthor?: string;
  nodes: Node<InquiryNodeData>[];
  edges: Edge[];
}

export interface PeerContribution {
  id: string;
  journeyId: string;
  targetNodeId: string;
  targetNodeTitle: string;
  authorName: string;
  authorHandle: string;
  question: string;
  explanation: string;
  createdAt: string;
}

export interface CommunityJourney {
  id: string;
  title: string;
  initialQuestion: string;
  subject: string;
  objective: LearningObjectiveId;
  summary: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  updatedAt: string;
  extensionsCount: number;
  curiositySparks: number;
  starredByUser?: boolean;
  nodes: Node<InquiryNodeData>[];
  edges: Edge[];
  contributions: PeerContribution[];
}

export type CuriosityEventType =
  | 'INQUIRY_CREATED'
  | 'FOLLOWUP_EXPLORED'
  | 'CUSTOM_QUESTION'
  | 'PEER_EXTENSION'
  | 'MILESTONE_UNLOCKED';

export interface CuriosityTransaction {
  id: string;
  createdAt: string;
  inquiryId: string;
  inquiryTitle: string;
  subject: string;
  eventType: CuriosityEventType;
  credits: number;
  description: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  milestoneTarget: string;
  unlocked: boolean;
  progressPct: number;
  creditBonus: number;
}

export interface ExploreSubject {
  id: string;
  name: string;
  tagline: string;
  topicCount: number;
  variant: CardVariant;
}

export interface ExploreTopic {
  id: string;
  subject: string;
  title: string;
  promptQuestion: string;
  defaultObjective: LearningObjectiveId;
  summary: string;
  estimatedDepth: string;
  variant: CardVariant;
}

export interface InquiryGenerationRequest {
  inquiryTitle: string;
  subject: string;
  objective: LearningObjectiveId;
  parentNodeId: string | null;
  parentQuestion?: string;
  parentExplanation?: string;
  question: string;
}

export interface InquiryGenerationResponse {
  node_id: string;
  title: string;
  explanation: string;
  takeaways: string[];
  references: string[];
  follow_ups: [string, string, string];
  credits_awarded: number;
  provider: 'sarvam-bridge' | 'local-mock';
}

// --- Source-Centric Workspace & Work Studio Types ---

export type StudySourceType = 'youtube' | 'paper' | 'algorithm_lab' | 'system_design';

export interface SourceQuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SourceQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  userSelectedIndex?: number | null;
  explanation: string;
  relatedConceptNodeId: string;
  isAnsweredCorrectly?: boolean;
}

export interface SourceNote {
  id: string;
  title: string;
  category: 'Key Formulas' | 'Core Mechanics' | 'Common Pitfalls' | 'Interview & Exam' | 'Custom Note';
  content: string;
  updatedAt: string;
}

export interface SourceResearchPaper {
  title: string;
  authors: string;
  conference: string;
  year: number;
  arxivUrl: string;
  doiUrl?: string;
  abstract: string;
  keyContributions: string[];
  methodologicalBreakdown: string;
}

export interface SourceGraphNode {
  id: string;
  label: string;
  category: string;
  depth: number;
  status: 'mastered' | 'in_progress' | 'unexplored';
  importance: 'critical' | 'foundational' | 'advanced';
  summary: string;
  shortLine?: string; // Concise 1-line description shown on the canvas
  keyFormula?: string;
  failureMode?: string; // What breaks if this concept or invariant is missing
  prerequisites?: string[]; // Connected prerequisite concept names
  successors?: string[]; // Connected successor concept names
  tier?: 'macro' | 'standard' | 'micro'; // Multi-scale semantic zoom tier
  clusterId?: string; // Sub-graph grouping identifier
  x: number;
  y: number;
}

export interface SourceGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  tier?: 'macro' | 'standard' | 'micro'; // Visibility tier across zoom
  isDenseCrosslink?: boolean; // Micro-level cross-cutting dependency
  strength?: 'critical' | 'strong' | 'auxiliary';
}

export interface SourceKnowledgeGraph {
  rootNodeId: string;
  nodes: SourceGraphNode[];
  edges: SourceGraphEdge[];
}

export interface StudySource {
  id: string;
  title: string;
  category: 'AIML' | 'Cybersecurity' | 'AIDS' | 'Computer Science';
  sourceType: StudySourceType;
  sourceTypeLabel: string;
  thumbnail: string;
  youtubeId?: string;
  duration?: string;
  views?: string;
  channelName?: string;
  masteryScore: number; // 0 - 100 ("how much they actually know in that topic in and out")
  masteryLevel: 'Beginner' | 'Intermediate' | 'Proficient' | 'Advanced' | 'Mastered';
  lastStudied: string;
  summary: string;
  quizzes: SourceQuizQuestion[];
  notes: SourceNote[];
  researchPaper: SourceResearchPaper;
  knowledgeGraph: SourceKnowledgeGraph;
}

export interface CommunityArticle {
  id: string;
  title: string;
  subtitle: string;
  category: 'Cybersecurity' | 'AIML' | 'AIDS' | 'Computer Science';
  tags: string[];
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorAvatar?: string;
  publishedAt: string;
  readTime: string;
  sparks: number;
  starredByUser?: boolean;
  commentsCount: number;
  highlights: string[]; // Highlights shown in front on the card!
  content: string; // Whole article shown when clicked!
  connectedGraphNodesCount?: number;
}

