# ThinkForge — Curiosity-Driven Knowledge Network (Team CurioMinds)

> *"Don't just find answers. Discover better questions."*

ThinkForge is a **Build with Sarvam** hackathon frontend built by **Team CurioMinds** using React, TypeScript, Vite, Tailwind CSS, Lucide Icons, and `@xyflow/react`.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Core Screens

1. **Welcome & Sign-In Gate (`AuthGatePage`)**
   - Simplified learner entry with email sign-in, account creation, and 1-click hackathon demo profiles (`ananya@thinkforge.dev` / `thinkforge2026`).
2. **Home Dashboard (`HomeDashboardView`)**
   - Welcome hero banner, **Continue Learning** cards, **Explore Subjects & Topics** filter grid, **Recent Inquiries**, and Curiosity Credits summary.
3. **Create an Inquiry (`CreateInquiryView`)**
   - Custom topic/question composer paired with the 5 ThinkForge learning objectives:
     - First-principles understanding
     - Deep research
     - Topic backstory
     - Cross-topic connections
     - Exam preparation
4. **AI Learning Workspace & Interactive Knowledge Graph (`InquiryWorkspace`)**
   - Resizable split-screen interface syncing an AI Explanation + 3 Contextual Follow-Ups + Conversation History panel with a live `@xyflow/react` tree graph featuring zoom, pan, fit-view, auto-layout, minimap, and a clean New Inquiry workflow.
5. **Community Explorer (`CommunityView`)**
   - Browse public inquiry journeys, inspect peer graphs, fork paths into your personal workspace, or contribute new peer follow-up branches.
6. **Profile & Rewards (`ProfileRewardsView`)**
   - Editable learner profile, Curiosity Credits milestone ladder, Achievement Badges, learning objective breakdown, and activity ledger.

## Frontend Integration Seams

Optional backend and Sarvam integration points are structured cleanly via environment variables (see `.env.example`):

- **AI / Sarvam Bridge**: [`src/services/inquiryService.ts`](src/services/inquiryService.ts) (`VITE_API_BASE_URL`, `VITE_USE_MOCK_ENGINE=true`) plus `startVoiceCapture` hook for speech-to-text.
- **Auth & Persistence**: [`src/services/supabaseClient.ts`](src/services/supabaseClient.ts) (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with local demo fallback.
