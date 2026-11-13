import { useCallback, useState } from 'react';
import type { Inquiry, InquiryDetail, QuestionNode } from './types/tattva';
import {
  MOCK_INQUIRIES,
  MOCK_INQUIRY_DETAIL,
  MOCK_ME_USER,
} from './data/mockTattva';
import { TopNavBar, type TopNavView } from './components/TopNavBar';
import { HomeDashboardView } from './components/HomeDashboardView';
import { SourceWorkspaceView } from './components/SourceWorkspaceView';
import { CreateInquiryView } from './components/CreateInquiryView';

export function App() {
  const [activeView, setActiveView] = useState<TopNavView>('home');
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => MOCK_INQUIRIES);
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail>(() => MOCK_INQUIRY_DETAIL);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => MOCK_INQUIRY_DETAIL.nodes[0]?.id || null);
  const [staminaScore, setStaminaScore] = useState<number>(448);
  const [researchMode, setResearchMode] = useState<boolean>(true);

  // Switch to specific inquiry
  const handleSelectInquiry = useCallback((inquiryId: string) => {
    // In actual app, this fetches GET /api/v1/inquiries/:id
    if (inquiryId === MOCK_INQUIRY_DETAIL.id) {
      setInquiryDetail(MOCK_INQUIRY_DETAIL);
      setSelectedNodeId(MOCK_INQUIRY_DETAIL.nodes[0]?.id || null);
    } else {
      const match = inquiries.find((i) => i.id === inquiryId);
      if (match) {
        setInquiryDetail({
          id: match.id,
          learningSource: {
            id: match.learningSourceId,
            title: match.title || 'Technical Inquiry',
            sourceType: 'transcript',
            sourceReference: 'https://ocw.mit.edu',
            durationMinutes: 35,
          },
          nodes: [
            {
              id: `node-${match.id}-root`,
              parentNodeId: null,
              userQuestion: match.title || 'First-principles breakdown',
              aiExplanation:
                'Foundational breakdown initiated. This technical source provides the mathematical and architectural bedrock. Examine the initial follow-up branches to navigate deep implementation tradeoffs.',
              researchMode: true,
              isTrap: false,
              trapMetadata: null,
              trapResolvedAt: null,
              followUps: [
                {
                  id: `fu-${match.id}-1`,
                  position: 1,
                  questionText: 'What are the microarchitectural bottlenecks of this approach?',
                  isSelected: false,
                  childNodeId: null,
                },
                {
                  id: `fu-${match.id}-2`,
                  position: 2,
                  questionText: 'How do boundary conditions behave under high-throughput concurrency?',
                  isSelected: false,
                  childNodeId: null,
                },
                {
                  id: `fu-${match.id}-3`,
                  position: 3,
                  questionText: 'What invariant guarantees correctness when state mutations fail midway?',
                  isSelected: false,
                  childNodeId: null,
                },
              ],
              createdAt: new Date().toISOString(),
            },
          ],
        });
        setSelectedNodeId(`node-${match.id}-root`);
      }
    }
    setActiveView('workspace');
  }, [inquiries]);

  // Handle new inquiry submission
  const handleCreateInquiry = useCallback(
    ({
      question,
      learningSourceId,
      researchMode: rm,
    }: {
      question: string;
      learningSourceId: string;
      researchMode: boolean;
    }) => {
      const newInquiryId = `inq-${Date.now().toString(36)}`;
      const newInquiry: Inquiry = {
        id: newInquiryId,
        userId: MOCK_ME_USER.id,
        learningSourceId,
        title: question.length > 60 ? `${question.slice(0, 57)}...` : question,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const rootNodeId = `node-${Date.now().toString(36)}-root`;
      const rootNode: QuestionNode = {
        id: rootNodeId,
        parentNodeId: null,
        userQuestion: question,
        aiExplanation: rm
          ? `[RESEARCH MODE &middot; SOCRATIC MENTOR]\nConsider the underlying system constraints before committing to an architecture. What fundamental invariant must remain unbroken when your allocation crosses thread boundaries?`
          : `Rigorous technical synthesis: Addressing "${question}" requires analyzing the core structural guarantees and memory layout tradeoffs.`,
        researchMode: rm,
        isTrap: false,
        trapMetadata: null,
        trapResolvedAt: null,
        followUps: [
          {
            id: `fu-${Date.now()}-1`,
            position: 1,
            questionText: 'What happens to cache locality when allocations cross boundary pages?',
            isSelected: false,
            childNodeId: null,
          },
          {
            id: `fu-${Date.now()}-2`,
            position: 2,
            questionText: 'Can formal verification prove the absence of use-after-free here?',
            isSelected: false,
            childNodeId: null,
          },
          {
            id: `fu-${Date.now()}-3`,
            position: 3,
            questionText: 'What is the recovery path if an out-of-memory fault strikes midway?',
            isSelected: false,
            childNodeId: null,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const newDetail: InquiryDetail = {
        id: newInquiryId,
        learningSource: {
          id: learningSourceId,
          title: newInquiry.title || 'Technical Inquiry',
          sourceType: 'transcript',
          sourceReference: 'https://tattva.intellectual-execution.internal',
          durationMinutes: 30,
        },
        nodes: [rootNode],
      };

      setInquiries((prev) => [newInquiry, ...prev]);
      setInquiryDetail(newDetail);
      setSelectedNodeId(rootNodeId);
      setResearchMode(rm);
      setStaminaScore((prev) => prev + (rm ? 30 : 10));
      setActiveView('workspace');
    },
    [],
  );

  // Submit a question / select follow-up within the active workspace
  const handleSubmitQuestion = useCallback(
    (
      questionText: string,
      parentNodeId: string | null,
      selectedFollowUpId: string | null,
      rm: boolean,
    ) => {
      const newNodeId = `node-${Date.now().toString(36)}`;
      const isAdversarial = inquiryDetail.nodes.length % 3 === 2; // Demo trap every 3rd node

      const newNode: QuestionNode = {
        id: newNodeId,
        parentNodeId,
        userQuestion: questionText,
        aiExplanation: rm
          ? `[RESEARCH MODE ACTIVATED]\nNotice that by advancing down this path, you are assuming synchronous completion. What occurs if the subsystem operates under eventual consistency?`
          : `Detailed Analysis: The operation guarantees atomicity across the critical section, bounding the latency to O(1) amortized.`,
        researchMode: rm,
        isTrap: isAdversarial,
        trapMetadata: isAdversarial
          ? {
              misconceptionType: 'Concurrency Hazard / Memory Tear',
              scenario:
                'Assuming atomic word writes protect non-primitive compound structs from partial torn reads across cores without memory fences.',
              resolutionRequired: true,
            }
          : null,
        trapResolvedAt: null,
        followUps: [
          {
            id: `fu-${Date.now()}-1`,
            position: 1,
            questionText: 'How does this behave under aggressive out-of-order CPU execution?',
            isSelected: false,
            childNodeId: null,
          },
          {
            id: `fu-${Date.now()}-2`,
            position: 2,
            questionText: 'What would a formal TLA+ specification check for in this state transition?',
            isSelected: false,
            childNodeId: null,
          },
          {
            id: `fu-${Date.now()}-3`,
            position: 3,
            questionText: 'What is the overhead on the Translation Lookaside Buffer (TLB)?',
            isSelected: false,
            childNodeId: null,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setInquiryDetail((prev) => {
        // Update parent follow-up selection if applicable
        const updatedNodes = prev.nodes.map((node) => {
          if (node.id === parentNodeId && selectedFollowUpId) {
            return {
              ...node,
              followUps: node.followUps.map((fu) =>
                fu.id === selectedFollowUpId
                  ? { ...fu, isSelected: true, childNodeId: newNodeId }
                  : fu,
              ),
            };
          }
          return node;
        });

        return {
          ...prev,
          nodes: [...updatedNodes, newNode],
        };
      });

      setSelectedNodeId(newNodeId);
      setStaminaScore((prev) => prev + (rm ? 30 : 10));
    },
    [inquiryDetail.nodes.length],
  );

  // Resolve adversarial misconception trap
  const handleResolveTrap = useCallback((nodeId: string) => {
    setInquiryDetail((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, trapResolvedAt: new Date().toISOString() }
          : node,
      ),
    }));
    setStaminaScore((prev) => prev + 25);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0b0d0f] text-slate-100">
      {/* Top Navigation */}
      <TopNavBar
        activeView={activeView}
        onChangeView={setActiveView}
        staminaScore={staminaScore}
        user={MOCK_ME_USER}
        onStartNewInquiry={() => setActiveView('create')}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'home' && (
          <div className="h-full overflow-y-auto">
            <HomeDashboardView
              inquiries={inquiries}
              onSelectInquiry={handleSelectInquiry}
              onStartNewInquiry={() => setActiveView('create')}
            />
          </div>
        )}

        {activeView === 'workspace' && (
          <div className="h-full w-full">
            <SourceWorkspaceView
              inquiryDetail={inquiryDetail}
              selectedNodeId={selectedNodeId}
              staminaScore={staminaScore}
              researchMode={researchMode}
              onToggleResearchMode={() => setResearchMode((prev) => !prev)}
              onBackToOverview={() => setActiveView('home')}
              onSubmitQuestion={handleSubmitQuestion}
              onSelectNode={setSelectedNodeId}
              onResolveTrap={handleResolveTrap}
            />
          </div>
        )}

        {activeView === 'create' && (
          <div className="h-full overflow-y-auto">
            <CreateInquiryView
              onCreateInquiry={handleCreateInquiry}
              onCancel={() => setActiveView('home')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
