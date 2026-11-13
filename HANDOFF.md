# TATTVA FRONTEND MVP HANDOFF GUIDE

> **Target Audience:** Tattva Backend & Next.js Monorepo Team  
> **Repository:** `bnavalyal/Tattva`  
> **Handoff Branch:** `restructure/mvp-handoff`  
> **Status:** ✅ Clean Build (`tsc -b && vite build` passing with 0 errors)

---

## 1. Executive Summary

This repository has been **strictly restructured** down to a set of pure, well-typed, presentational UI components matching the official Tattva Golden Path and `@tattva/contracts` data schemas.

### The Golden Path Implemented:
1. **Curated Learning Source ($\ge 25$ min)**: Verified technical source attached to each inquiry.
2. **Root Technical Question**: Ingests prompt and initializes root node on canvas.
3. **AI Explanation & Exactly 3 Follow-Up Questions**: Adaptive branches dynamically expandable by the learner.
4. **Persistent Branching Knowledge Graph**: Interactive `@xyflow/react` tree layout showing reasoning evolution.
5. **Adversarial Trap (`⚠️ Be Careful Here!!`)**: Misconception interception mechanism that halts flow with an alert banner and locked input until the learner acknowledges/resolves the trap.
6. **Research Mode (3x Multiplier)**: Socratic mentor mode with distinct visual styling and points telemetry.
7. **Cognitive Stamina Counter**: Real-time intellectual execution counter.

---

## 2. Directory Structure After Restructure

```
src/
├── components/
│   ├── CreateInquiryView.tsx     # Clean question & source composer
│   ├── HomeDashboardView.tsx     # Minimal serif+gold landing & inquiry history
│   ├── InquiryWorkspace.tsx      # React Flow graph + follow-up buttons + composer
│   ├── KnowledgeFlowNode.tsx     # Custom Flow node with trap state & follow-ups
│   ├── SourceWorkspaceView.tsx   # 50/50 split-screen shell (Source | Workspace)
│   └── TopNavBar.tsx             # Overview & My Knowledge Graphs only + Stamina
├── context/
│   └── ThemeContext.tsx          # Dark Obsidian & Light Sage theme provider
├── data/
│   └── mockTattva.ts             # Realistic sample data strictly adhering to contracts
├── types/
│   └── tattva.ts                 # Verbatim @tattva/contracts TypeScript interfaces
├── utils/
│   └── graphLayout.ts            # Framework-agnostic top-down hierarchical tree layout
├── App.tsx                       # Interactive demo container wiring presentational views
├── index.css                     # Design tokens & color system
└── main.tsx
```

---

## 3. Data Contracts (`src/types/tattva.ts`)

Every component strictly accepts and emits data shaped according to these contracts:

```typescript
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
  trapResolvedAt: string | null; // ISO 8601 or null
  followUps: FollowUpQuestion[];
  createdAt: string;
}

export type SourceType = 'video' | 'document' | 'transcript';

export interface LearningSourceSummary {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceReference: string;
  durationMinutes: number;
}

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

export interface MeResponse {
  user: {
    id: string;
    isAnonymous: boolean;
  };
}
```

---

## 4. Component Interfaces & Integration Notes

### A. `TopNavBar.tsx`
* **Props:**
  ```typescript
  interface TopNavBarProps {
    activeView?: 'home' | 'workspace' | 'create';
    onChangeView: (view: 'home' | 'workspace' | 'create') => void;
    staminaScore?: number;
    user?: { id: string; isAnonymous: boolean };
    onStartNewInquiry?: () => void;
  }
  ```
* **Notes:** Features Tattva sacred geometry wireframe emblem, "Overview" and "My Knowledge Graphs" tabs, live Cognitive Stamina score badge, and Dark/Light mode toggle.

### B. `SourceWorkspaceView.tsx`
* **Props:**
  ```typescript
  interface SourceWorkspaceViewProps {
    inquiryDetail: InquiryDetail;
    selectedNodeId?: string | null;
    staminaScore?: number;
    researchMode?: boolean;
    onToggleResearchMode?: () => void;
    onBackToOverview?: () => void;
    onSubmitQuestion: (
      question: string,
      parentNodeId: string | null,
      selectedFollowUpId: string | null,
      researchMode: boolean,
    ) => void;
    onSelectNode: (nodeId: string) => void;
    onResolveTrap?: (nodeId: string) => void;
  }
  ```
* **Notes:** Split-screen layout. Left pane shows source metadata and technical transcript (verifying $\ge 25$ min baseline). Right pane embeds `InquiryWorkspace`.

### C. `InquiryWorkspace.tsx`
* **Props:**
  ```typescript
  interface InquiryWorkspaceProps {
    inquiryDetail: InquiryDetail;
    selectedNodeId: string | null;
    researchMode?: boolean;
    onToggleResearchMode?: () => void;
    onSubmitQuestion: (
      question: string,
      parentNodeId: string | null,
      selectedFollowUpId: string | null,
      researchMode: boolean,
    ) => void;
    onSelectNode: (nodeId: string) => void;
    onResolveTrap?: (nodeId: string) => void;
  }
  ```
* **Notes:** Built on `@xyflow/react`. Uses custom `KnowledgeFlowNode`, breadcrumb path tracker, adversarial trap warning banner, and bottom follow-up launcher.

### D. `KnowledgeFlowNode.tsx`
* **Custom Node Component** for `@xyflow/react`.
* Highlights:
  - Adversarial trap state: Crimson border + glowing hazard icon + `"⚠️ Be Careful Here!!"` badge.
  - Socratic Research mode: Emerald/lime badge with `RESEARCH MODE` telemetry.
  - Rendered follow-up buttons (`01`, `02`, `03`) with branched indicators.

### E. `HomeDashboardView.tsx`
* **Props:**
  ```typescript
  interface HomeDashboardViewProps {
    inquiries: Inquiry[];
    onSelectInquiry: (inquiryId: string) => void;
    onStartNewInquiry: () => void;
  }
  ```
* **Notes:** Clean landing screen with hero headline *"Your thinking leaves evidence."*, primary CTA *"Start a new inquiry"*, and list of active inquiries.

### F. `CreateInquiryView.tsx`
* **Props:**
  ```typescript
  interface CreateInquiryViewProps {
    initialQuestion?: string;
    initialSourceId?: string;
    onCreateInquiry: (payload: {
      question: string;
      learningSourceId: string;
      researchMode: boolean;
    }) => void;
    onCancel: () => void;
  }
  ```

---

## 5. Design Tokens & Styling

- **Obsidian Dark Surface**: `#0b0d0f` (page), `#13161b` (cards/nodes)
- **Tattva Gold Accent**: `#c59a67`
- **Cognitive Stamina Lime**: `#a3e635`
- **Adversarial Hazard Red**: `#ef4444` / `bg-red-950/60`
- **Typography**:
  - Headlines: `Instrument Serif`, `Playfair Display`, serif
  - Technical / Telemetry: `JetBrains Mono`, `ui-monospace`
  - Body: `Plus Jakarta Sans`, sans-serif

---

## 6. Porting to Next.js (Step-by-Step)

1. Copy `src/components/*` into `apps/web/components/`.
2. Copy `src/types/tattva.ts` or replace imports with `@tattva/contracts`.
3. Copy `src/utils/graphLayout.ts` to `apps/web/utils/graphLayout.ts`.
4. Ensure `@xyflow/react` and `lucide-react` are installed in the Next.js `package.json`.
5. Connect props to Next.js route handlers or TanStack Query calling:
   - `GET /api/v1/inquiries`
   - `GET /api/v1/inquiries/:id`
   - `POST /api/v1/nodes`
   - `GET /api/v1/me`
