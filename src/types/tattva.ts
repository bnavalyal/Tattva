// A single node in the Knowledge Graph
export interface TrapMetadata {
  misconceptionType: string;
  scenario: string;
  resolutionRequired: boolean;
}

export interface FollowUpQuestion {
  id: string;
  position: 1 | 2 | 3;
  questionText: string;
  isSelected: boolean;
  childNodeId: string | null;
}

export interface QuestionNode {
  id: string;
  parentNodeId: string | null;
  userQuestion: string;
  aiExplanation: string;
  researchMode: boolean;
  isTrap: boolean;
  trapMetadata: TrapMetadata | null;
  trapResolvedAt: string | null; // ISO 8601, or null if unresolved
  followUps: FollowUpQuestion[];
  createdAt: string; // ISO 8601
}

// The curated learning source attached to an inquiry
export type SourceType = 'video' | 'document' | 'transcript';

export interface LearningSourceSummary {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceReference: string;
  durationMinutes: number;
}

// An inquiry = one learner's workspace against one learning source
export interface Inquiry {
  id: string;
  userId: string;
  learningSourceId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDetail {
  id: string;
  learningSource: LearningSourceSummary;
  nodes: QuestionNode[];
}

// Request body for submitting a question / selecting a follow-up
export interface CreateNodeRequest {
  question: string;
  parentNodeId: string | null;
  selectedFollowUpId: string | null;
  researchMode: boolean;
}

export interface StaminaAwarded {
  eventType: string;
  finalPoints: number;
}

export interface CreateNodeResponse {
  node: QuestionNode;
  staminaAwarded: StaminaAwarded | null;
}

// Verified identity (GET /api/v1/me)
export interface MeResponse {
  user: {
    id: string;
    isAnonymous: boolean;
  };
}
