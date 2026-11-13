import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type {
  AppView,
  CommunityJourney,
  CuriosityEventType,
  CuriosityTransaction,
  EngineeringVideo,
  InquiryNodeData,
  InquirySession,
  LearningObjectiveId,
  ThinkForgeUser,
} from './types/thinkforge';
import {
  INITIAL_COMMUNITY_JOURNEYS,
  INITIAL_CURIOSITY_TRANSACTIONS,
  INITIAL_INQUIRIES,
} from './data/thinkforgeSeed';
import { generateInquiryResponse } from './services/inquiryService';
import {
  getSavedSessionUser,
  readLocalSessionUser,
  saveSessionUser,
  signOutLearner,
} from './services/supabaseClient';
import { createInquiryEdge, layoutInquiryTree } from './utils/graphLayout';
import { AuthGatePage } from './components/AuthGatePage';
import { CommunityView } from './components/CommunityView';
import { CreateInquiryView } from './components/CreateInquiryView';
import { EngineeringVideosView } from './components/EngineeringVideosView';
import { HomeDashboardView } from './components/HomeDashboardView';
import { ProfileRewardsView } from './components/ProfileRewardsView';
import { SourceWorkspaceView } from './components/SourceWorkspaceView';
import { TopNavBar } from './components/TopNavBar';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { YouTubeSidebar } from './components/YouTubeSidebar';
import { INITIAL_STUDY_SOURCES } from './data/sourceWorkspaces';
import type { StudySource } from './types/thinkforge';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function deriveShortTitle(question: string, fallbackTitle: string): string {
  if (fallbackTitle.trim()) return fallbackTitle.trim();
  const cleaned = question.trim().replace(/[?!.]+$/, '');
  return cleaned.length > 52 ? `${cleaned.slice(0, 49)}...` : cleaned;
}

export function App() {
  const [user, setUser] = useState<ThinkForgeUser | null>(() => readLocalSessionUser());
  const [activeView, setActiveView] = useState<AppView>('home');

  const [inquiries, setInquiries] = useState<InquirySession[]>(() => INITIAL_INQUIRIES);
  const [activeInquiryId, setActiveInquiryId] = useState<string>(
    () => INITIAL_INQUIRIES[0]?.id ?? '',
  );
  const [communityJourneys, setCommunityJourneys] = useState<CommunityJourney[]>(
    () => INITIAL_COMMUNITY_JOURNEYS,
  );
  const [transactions, setTransactions] = useState<CuriosityTransaction[]>(
    () => INITIAL_CURIOSITY_TRANSACTIONS,
  );
  const [lastCreditDelta, setLastCreditDelta] = useState<number | null>(null);
  const creditTimerRef = useRef<number | null>(null);

  const [createPrefill, setCreatePrefill] = useState<{
    subject?: string;
    question?: string;
    objective?: LearningObjectiveId;
  }>({});

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<EngineeringVideo | null>(null);
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('All');
  const [studySources, setStudySources] = useState<StudySource[]>(() => INITIAL_STUDY_SOURCES);
  const [activeStudioSourceId, setActiveStudioSourceId] = useState<string | null>(null);

  const handleConvertVideoToInquiry = useCallback((video: EngineeringVideo) => {
    setCreatePrefill({
      subject: video.category,
      question: video.suggestedInquiryQuestion,
      objective: 'first-principles',
    });
    setActiveView('create');
  }, []);

  // Hydrate persisted Supabase/local user if available
  useEffect(() => {
    let mounted = true;
    Promise.resolve(getSavedSessionUser()).then((saved) => {
      if (mounted && saved && !user) {
        setUser(saved);
      }
    });
    return () => {
      mounted = false;
      if (creditTimerRef.current) {
        window.clearTimeout(creditTimerRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const awardCuriosityCredits = useCallback(
    (params: {
      inquiryId: string;
      inquiryTitle: string;
      subject: string;
      eventType: CuriosityEventType;
      credits: number;
      description: string;
    }) => {
      const tx: CuriosityTransaction = {
        id: makeId('tx'),
        createdAt: new Date().toISOString(),
        ...params,
      };
      setTransactions((prev) => [tx, ...prev]);
      setLastCreditDelta(params.credits);
      if (creditTimerRef.current) {
        window.clearTimeout(creditTimerRef.current);
      }
      creditTimerRef.current = window.setTimeout(() => {
        setLastCreditDelta(null);
      }, 2600);
    },
    [],
  );

  const curiosityCredits = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.credits, 0),
    [transactions],
  );

  const totalNodesExplored = useMemo(
    () => inquiries.reduce((sum, inq) => sum + inq.nodes.length, 0),
    [inquiries],
  );

  const peerContributionsCount = useMemo(
    () => transactions.filter((tx) => tx.eventType === 'PEER_EXTENSION').length,
    [transactions],
  );

  const _activeInquiry = useMemo(
    () => inquiries.find((item) => item.id === activeInquiryId) ?? inquiries[0] ?? null,
    [activeInquiryId, inquiries],
  );

  const handleAuthenticated = (authedUser: ThinkForgeUser, remember: boolean) => {
    saveSessionUser(authedUser, remember);
    setUser(authedUser);
    setActiveView('home');
  };

  const handleSignOut = async () => {
    await signOutLearner();
    setUser(null);
    setActiveView('home');
  };

  const handleUpdateProfile = (
    updates: Pick<ThinkForgeUser, 'name' | 'team' | 'bio' | 'focusSubjects'>,
  ) => {
    if (!user) return;
    const updated: ThinkForgeUser = { ...user, ...updates };
    setUser(updated);
    saveSessionUser(updated, true);
  };

  const handleOpenInquiry = (inquiryId: string) => {
    setActiveInquiryId(inquiryId);
    setActiveView('workspace');
  };

  const handleStartNewInquiry = (prefill?: {
    subject?: string;
    question?: string;
    objective?: LearningObjectiveId;
  }) => {
    setCreatePrefill(prefill ?? {});
    setActiveView('create');
  };

  const handleCreateInquiry = async (payload: {
    subject: string;
    question: string;
    objective: LearningObjectiveId;
  }) => {
    if (!user) return;
    const response = await generateInquiryResponse({
      inquiryTitle: payload.question,
      question: payload.question,
      subject: payload.subject,
      objective: payload.objective,
      parentNodeId: null,
    });

    const inquiryId = makeId('inq');
    const rootNodeId = makeId('node');
    const nowIso = new Date().toISOString();

    const rootNode: Node<InquiryNodeData> = {
      id: rootNodeId,
      type: 'inquiryNode',
      position: { x: 240, y: 24 },
      data: {
        nodeId: rootNodeId,
        parentId: null,
        kind: 'root',
        depth: 0,
        question: payload.question,
        title: deriveShortTitle(payload.question, response.title),
        explanation: response.explanation,
        takeaways: response.takeaways,
        references: response.references,
        followUps: response.follow_ups,
        usedFollowUps: [],
        authorName: user.name,
        authorHandle: user.handle,
        creditsEarned: response.credits_awarded || 25,
        createdAt: nowIso,
      },
    };

    const newSession: InquirySession = {
      id: inquiryId,
      title: deriveShortTitle(payload.question, response.title),
      initialQuestion: payload.question,
      subject: payload.subject,
      objective: payload.objective,
      createdAt: nowIso,
      updatedAt: nowIso,
      authorName: user.name,
      authorHandle: user.handle,
      nodes: [rootNode],
      edges: [],
    };

    setInquiries((prev) => [newSession, ...prev]);
    setActiveInquiryId(inquiryId);
    setCreatePrefill({});

    // Determine or generate matching StudySource for Work Studio
    const qLower = payload.question.toLowerCase();
    let targetSourceId = 'source-transformers';
    if (qLower.includes('celebrity') || qLower.includes('knows') || qLower.includes('stack')) {
      targetSourceId = 'source-celebrity-problem';
    } else if (
      qLower.includes('diffie') ||
      qLower.includes('rsa') ||
      qLower.includes('crypto') ||
      qLower.includes('forward secrecy')
    ) {
      targetSourceId = 'source-rsa-crypto';
    } else if (
      qLower.includes('pca') ||
      qLower.includes('covariance') ||
      qLower.includes('eigen') ||
      qLower.includes('standardiz')
    ) {
      targetSourceId = 'source-pca';
    } else if (
      qLower.includes('semaphore') ||
      qLower.includes('deadlock') ||
      qLower.includes('mutex') ||
      qLower.includes('coffman') ||
      qLower.includes('concurrency')
    ) {
      targetSourceId = 'source-os-sync';
    } else if (qLower.includes('sliding') || qLower.includes('window') || qLower.includes('deque')) {
      targetSourceId = 'source-sliding-window';
    } else {
      const newSourceId = `source-${Date.now().toString(36)}`;
      const derivedTitle = deriveShortTitle(payload.question, response.title);
      const newSource: StudySource = {
        id: newSourceId,
        title: derivedTitle,
        category:
          payload.subject === 'Cybersecurity' ||
          payload.subject === 'AIDS' ||
          payload.subject === 'Computer Science' ||
          payload.subject === 'AIML'
            ? payload.subject
            : 'AIML',
        sourceType: 'paper',
        sourceTypeLabel:
          payload.objective === 'exam-prep'
            ? 'Interview & Code Studio'
            : payload.objective === 'deep-research'
            ? 'Deep Research Paper'
            : 'First-Principles Studio',
        thumbnail: '/thumbnails/thumb_aiml_01.jpg',
        masteryScore: 68,
        masteryLevel: 'Intermediate',
        lastStudied: 'Just now',
        summary: response.explanation,
        quizzes: [
          {
            id: `quiz-${newSourceId}-01`,
            question: response.follow_ups[0]
              ? `Concept Check: ${response.follow_ups[0]}`
              : `What is the core mathematical invariant of ${derivedTitle}?`,
            options: [
              response.takeaways[0] || 'Primary invariant guarantees correct convergence',
              'Non-deterministic heuristic without bounded complexity',
              'Unbounded exponential memory overhead',
              'Incompatible with parallel matrix execution',
            ],
            correctOptionIndex: 0,
            userSelectedIndex: null,
            isAnsweredCorrectly: false,
            explanation: response.explanation,
            relatedConceptNodeId: `node-${newSourceId}-root`,
          },
          {
            id: `quiz-${newSourceId}-02`,
            question: response.follow_ups[1]
              ? `Exploration: ${response.follow_ups[1]}`
              : `How do edge cases impact execution in ${derivedTitle}?`,
            options: [
              'Boundary conditions require strict validation to prevent state corruption',
              'Edge cases are eliminated automatically by compiler flags',
              'Operations default to arbitrary random values',
              'No edge case constraints exist in production systems',
            ],
            correctOptionIndex: 0,
            userSelectedIndex: null,
            isAnsweredCorrectly: false,
            explanation: response.takeaways[1] || response.explanation,
            relatedConceptNodeId: `node-${newSourceId}-core`,
          },
        ],
        notes: [
          {
            id: `note-${newSourceId}-01`,
            title: `Core Principles: ${derivedTitle}`,
            category: 'Core Mechanics',
            content: `${response.explanation}\n\n**Key Takeaways:**\n${response.takeaways
              .map((t) => `- ${t}`)
              .join('\n')}`,
            updatedAt: 'Just now',
          },
          {
            id: `note-${newSourceId}-02`,
            title: 'Foundational Literature & References',
            category: 'Key Formulas',
            content: `**Seminal References:**\n${response.references
              .map((r) => `- ${r}`)
              .join('\n')}`,
            updatedAt: 'Just now',
          },
        ],
        researchPaper: {
          title: response.title,
          authors: 'ThinkForge Research Collective',
          conference: 'Foundations & Synthesis Conference',
          year: 2026,
          arxivUrl: 'https://arxiv.org',
          abstract: response.explanation,
          keyContributions: response.takeaways,
          methodologicalBreakdown: `Formal breakdown of ${payload.question} under ${payload.objective} constraints.`,
        },
        knowledgeGraph: {
          rootNodeId: `node-${newSourceId}-root`,
          nodes: [
            {
              id: `node-${newSourceId}-root`,
              label: derivedTitle,
              category: 'Root Concept',
              depth: 0,
              status: 'in_progress',
              importance: 'critical',
              summary: response.explanation,
              keyFormula: response.takeaways[0] || undefined,
              x: 280,
              y: 50,
            },
            {
              id: `node-${newSourceId}-core`,
              label: response.follow_ups[0]
                ? deriveShortTitle(response.follow_ups[0], 'Core Principles')
                : 'Core Principles',
              category: 'Core Principles',
              depth: 1,
              status: 'in_progress',
              importance: 'foundational',
              summary: response.takeaways[0] || response.explanation,
              x: 120,
              y: 180,
            },
            {
              id: `node-${newSourceId}-advanced`,
              label: response.follow_ups[1]
                ? deriveShortTitle(response.follow_ups[1], 'Advanced Analysis')
                : 'Advanced Analysis',
              category: 'Optimization',
              depth: 1,
              status: 'unexplored',
              importance: 'advanced',
              summary: response.takeaways[1] || response.explanation,
              x: 440,
              y: 180,
            },
          ],
          edges: [
            {
              id: `e-${newSourceId}-1`,
              source: `node-${newSourceId}-root`,
              target: `node-${newSourceId}-core`,
            },
            {
              id: `e-${newSourceId}-2`,
              source: `node-${newSourceId}-root`,
              target: `node-${newSourceId}-advanced`,
            },
          ],
        },
      };

      setStudySources((prev) => [newSource, ...prev]);
      targetSourceId = newSourceId;
    }

    setActiveStudioSourceId(targetSourceId);
    setActiveView('workspace');

    awardCuriosityCredits({
      inquiryId,
      inquiryTitle: newSession.title,
      subject: payload.subject,
      eventType: 'INQUIRY_CREATED',
      credits: 25,
      description: `Launched a new inquiry graph: "${payload.question}"`,
    });
  };

  const _appendBranchToInquiry = async (params: {
    inquiryId: string;
    parentNodeId: string;
    question: string;
    followUpIndex?: number;
  }): Promise<string | null> => {
    if (!user) return null;
    const session = inquiries.find((i) => i.id === params.inquiryId);
    if (!session) return null;

    const parentNode = session.nodes.find((n) => n.id === params.parentNodeId);
    if (!parentNode) return null;

    // If this exact question was already branched under this parent, focus it cleanly
    const existingChild = session.nodes.find(
      (n) =>
        n.data.parentId === params.parentNodeId &&
        n.data.question.toLowerCase() === params.question.trim().toLowerCase(),
    );
    if (existingChild) {
      return existingChild.id;
    }

    const nextDepth = parentNode.data.depth + 1;
    const response = await generateInquiryResponse({
      inquiryTitle: session.title,
      question: params.question,
      subject: session.subject,
      objective: session.objective,
      parentNodeId: parentNode.id,
      parentQuestion: parentNode.data.question,
      parentExplanation: parentNode.data.explanation,
    });

    const newNodeId = makeId('node');
    const nowIso = new Date().toISOString();
    const earnedCredits = response.credits_awarded || 15;

    const newNode: Node<InquiryNodeData> = {
      id: newNodeId,
      type: 'inquiryNode',
      position: {
        x: parentNode.position.x + 220,
        y: parentNode.position.y + 380,
      },
      data: {
        nodeId: newNodeId,
        parentId: parentNode.id,
        kind: 'branch',
        depth: nextDepth,
        question: params.question,
        title: deriveShortTitle(params.question, response.title),
        explanation: response.explanation,
        takeaways: response.takeaways,
        references: response.references,
        followUps: response.follow_ups,
        usedFollowUps: [],
        authorName: user.name,
        authorHandle: user.handle,
        creditsEarned: earnedCredits,
        createdAt: nowIso,
      },
    };

    const edgeLabel =
      typeof params.followUpIndex === 'number'
        ? `Branch 0${params.followUpIndex + 1}`
        : 'Custom Follow-Up';
    const newEdge = createInquiryEdge(parentNode.id, newNodeId, edgeLabel);

    setInquiries((prev) =>
      prev.map((item) => {
        if (item.id !== params.inquiryId) return item;
        const updatedNodes = item.nodes.map((node) => {
          if (
            node.id === params.parentNodeId &&
            typeof params.followUpIndex === 'number' &&
            !node.data.usedFollowUps.includes(params.followUpIndex)
          ) {
            return {
              ...node,
              data: {
                ...node.data,
                usedFollowUps: [...node.data.usedFollowUps, params.followUpIndex],
              },
            };
          }
          return node;
        });

        const nextEdges = [...item.edges, newEdge];
        const laidOut = layoutInquiryTree([...updatedNodes, newNode], nextEdges);

        return {
          ...item,
          updatedAt: nowIso,
          nodes: laidOut,
          edges: nextEdges,
        };
      }),
    );

    awardCuriosityCredits({
      inquiryId: session.id,
      inquiryTitle: session.title,
      subject: session.subject,
      eventType:
        typeof params.followUpIndex === 'number' ? 'FOLLOWUP_EXPLORED' : 'CUSTOM_QUESTION',
      credits: earnedCredits,
      description: `Branched into follow-up: "${params.question}"`,
    });

    return newNodeId;
  };

  const _handleUpdateGraph = useCallback(
    (inquiryId: string, nodes: Node<InquiryNodeData>[], edges: Edge[]) => {
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, nodes, edges } : item)),
      );
    },
    [],
  );

  const handleToggleCommunitySpark = (journeyId: string) => {
    setCommunityJourneys((prev) =>
      prev.map((j) => {
        if (j.id !== journeyId) return j;
        const nextStarred = !j.starredByUser;
        return {
          ...j,
          starredByUser: nextStarred,
          curiositySparks: Math.max(0, j.curiositySparks + (nextStarred ? 1 : -1)),
        };
      }),
    );
  };

  const handleExtendCommunityJourney = async (
    journeyId: string,
    targetNodeId: string,
    question: string,
    insight: string,
  ): Promise<string | null> => {
    if (!user) return null;
    const journey = communityJourneys.find((j) => j.id === journeyId);
    if (!journey) return null;

    const targetNode = journey.nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return null;

    const nextDepth = targetNode.data.depth + 1;
    const response = await generateInquiryResponse({
      inquiryTitle: journey.title,
      question,
      subject: journey.subject,
      objective: journey.objective,
      parentNodeId: targetNode.id,
      parentQuestion: targetNode.data.question,
      parentExplanation: targetNode.data.explanation,
    });

    const newNodeId = makeId('peer-node');
    const nowIso = new Date().toISOString();

    const peerNode: Node<InquiryNodeData> = {
      id: newNodeId,
      type: 'inquiryNode',
      position: {
        x: targetNode.position.x + 220,
        y: targetNode.position.y + 380,
      },
      data: {
        nodeId: newNodeId,
        parentId: targetNode.id,
        kind: 'peer',
        depth: nextDepth,
        isPeerContribution: true,
        question,
        title: deriveShortTitle(question, response.title),
        explanation: response.explanation,
        takeaways: response.takeaways,
        references: response.references,
        followUps: response.follow_ups,
        usedFollowUps: [],
        authorName: user.name,
        authorHandle: user.handle,
        creditsEarned: 30,
        createdAt: nowIso,
      },
    };

    const peerEdge = createInquiryEdge(targetNode.id, newNodeId, 'Peer Branch');
    const noteText = insight.trim()
      ? `${insight.trim()} — ${response.explanation}`
      : response.explanation;

    setCommunityJourneys((prev) =>
      prev.map((j) => {
        if (j.id !== journeyId) return j;
        const nextEdges = [...j.edges, peerEdge];
        const laidOut = layoutInquiryTree([...j.nodes, peerNode], nextEdges);
        return {
          ...j,
          updatedAt: nowIso,
          extensionsCount: j.extensionsCount + 1,
          nodes: laidOut,
          edges: nextEdges,
          contributions: [
            {
              id: makeId('contrib'),
              journeyId: journey.id,
              targetNodeId: targetNode.id,
              targetNodeTitle: targetNode.data.title,
              authorName: user.name,
              authorHandle: user.handle,
              question,
              explanation: noteText,
              createdAt: nowIso,
            },
            ...j.contributions,
          ],
        };
      }),
    );

    awardCuriosityCredits({
      inquiryId: journey.id,
      inquiryTitle: journey.title,
      subject: journey.subject,
      eventType: 'PEER_EXTENSION',
      credits: 30,
      description: `Extended ${journey.authorName}'s graph with "${question}"`,
    });

    return newNodeId;
  };

  const handleForkCommunityJourney = (journeyId: string) => {
    if (!user) return;
    const journey = communityJourneys.find((j) => j.id === journeyId);
    if (!journey) return;

    const forkedId = makeId('fork');
    const nowIso = new Date().toISOString();
    const clonedSession: InquirySession = {
      id: forkedId,
      title: `${journey.title} (Fork)`,
      initialQuestion: journey.initialQuestion,
      subject: journey.subject,
      objective: journey.objective,
      createdAt: nowIso,
      updatedAt: nowIso,
      authorName: user.name,
      authorHandle: user.handle,
      isForkedFromCommunity: true,
      forkedFromAuthor: journey.authorName,
      nodes: layoutInquiryTree(journey.nodes, journey.edges),
      edges: journey.edges.map((e) => ({ ...e })),
    };

    setInquiries((prev) => [clonedSession, ...prev]);
    setActiveInquiryId(forkedId);
    setActiveView('workspace');
  };

  void _activeInquiry;
  void _appendBranchToInquiry;
  void _handleUpdateGraph;

  if (!user) {
    return <AuthGatePage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <TopNavBar
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
        activeView={activeView}
        onChangeView={(view) => {
          if (view === 'workspace') setActiveStudioSourceId(null);
          setActiveView(view);
        }}
        curiosityCredits={curiosityCredits}
        lastCreditDelta={lastCreditDelta}
        inquiryCount={inquiries.length}
        user={user}
        onSignOut={handleSignOut}
        onGlobalSearch={() => {
          setVideoCategoryFilter('All');
          setActiveView('videos');
        }}
      />

      {/* Main Body: YouTube-Style Left Sidebar + Scrollable View */}
      <div className="flex flex-1 overflow-hidden">
        <YouTubeSidebar
          activeView={activeView}
          onChangeView={(view) => {
            if (view === 'workspace') setActiveStudioSourceId(null);
            setActiveView(view);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          curiosityCredits={curiosityCredits}
          totalNodesExplored={totalNodesExplored}
          inquiryCount={inquiries.length}
          onSelectCategoryFilter={(cat) => {
            setVideoCategoryFilter(cat);
            setActiveView('videos');
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {activeView === 'home' && (
            <HomeDashboardView
              user={user}
              inquiries={inquiries}
              activeInquiryId={activeInquiryId}
              curiosityCredits={curiosityCredits}
              recentTransactions={transactions}
              totalNodesExplored={totalNodesExplored}
              peerContributionsCount={peerContributionsCount}
              onOpenInquiry={handleOpenInquiry}
              onStartNewInquiry={handleStartNewInquiry}
              onLaunchTopicDirectly={handleCreateInquiry}
              onNavigate={setActiveView}
              onSelectVideo={setActiveVideo}
              onConvertVideoToInquiry={handleConvertVideoToInquiry}
              onOpenSourceInStudio={(sourceId) => {
                setActiveStudioSourceId(sourceId);
                setActiveView('workspace');
              }}
            />
          )}

          {activeView === 'videos' && (
            <EngineeringVideosView
              initialCategory={videoCategoryFilter}
              onSelectVideo={setActiveVideo}
              onConvertVideoToInquiry={handleConvertVideoToInquiry}
              onOpenSourceInStudio={(sourceId) => {
                setActiveStudioSourceId(sourceId);
                setActiveView('workspace');
              }}
            />
          )}

          {activeView === 'create' && (
            <CreateInquiryView
              user={user}
              initialSubject={createPrefill.subject}
              initialQuestion={createPrefill.question}
              initialObjective={createPrefill.objective}
              onCreateInquiry={handleCreateInquiry}
              onCancel={() => setActiveView('home')}
            />
          )}

          {activeView === 'workspace' && (
            <SourceWorkspaceView
              sources={studySources}
              activeSourceId={activeStudioSourceId}
              onUpdateSource={(updated) => {
                setStudySources((prev) =>
                  prev.map((s) => (s.id === updated.id ? updated : s)),
                );
              }}
            />
          )}

          {activeView === 'community' && (
            <CommunityView
              journeys={communityJourneys}
              onToggleSpark={handleToggleCommunitySpark}
              onExtendJourney={handleExtendCommunityJourney}
              onForkJourney={handleForkCommunityJourney}
              onOpenSourceInStudio={(sourceId) => {
                setActiveStudioSourceId(sourceId);
                setActiveView('workspace');
              }}
            />
          )}

          {activeView === 'profile' && (
            <ProfileRewardsView
              user={user}
              onUpdateProfile={handleUpdateProfile}
              inquiries={inquiries}
              curiosityCredits={curiosityCredits}
              transactions={transactions}
              totalNodesExplored={totalNodesExplored}
              peerContributionsCount={peerContributionsCount}
              onOpenInquiry={handleOpenInquiry}
            />
          )}
        </main>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onConvertVideoToInquiry={handleConvertVideoToInquiry}
      />
    </div>
  );
}

export default App;
