import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Columns2,
  Compass,
  GitBranch,
  History,
  LayoutGrid,
  Loader2,
  Map as MapIcon,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Send,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { InquiryNodeData, InquirySession } from '../types/thinkforge';
import { startVoiceCapture } from '../services/inquiryService';
import { getActivePathIds, layoutInquiryTree } from '../utils/graphLayout';
import { formatShortDate, getObjectiveDisplay } from '../utils/objectives';
import { KnowledgeFlowNode } from './KnowledgeFlowNode';

const nodeTypes: NodeTypes = {
  inquiryNode: KnowledgeFlowNode,
};

type PaneMode = 'split' | 'chat' | 'graph';
type HistoryScope = 'path' | 'all';

interface InquiryWorkspaceProps {
  inquiries: InquirySession[];
  activeInquiry: InquirySession;
  onSelectInquiry: (inquiryId: string) => void;
  onNewInquiry: () => void;
  onExploreFollowUp: (
    inquiryId: string,
    parentNodeId: string,
    followUpIndex: number,
    question: string,
  ) => Promise<string | null>;
  onAskCustomQuestion: (
    inquiryId: string,
    parentNodeId: string,
    question: string,
  ) => Promise<string | null>;
  onUpdateGraph: (
    inquiryId: string,
    nodes: Node<InquiryNodeData>[],
    edges: Edge[],
  ) => void;
}

const WorkspaceInner: React.FC<InquiryWorkspaceProps> = ({
  inquiries,
  activeInquiry,
  onSelectInquiry,
  onNewInquiry,
  onExploreFollowUp,
  onAskCustomQuestion,
  onUpdateGraph,
}) => {
  const reactFlowInstance = useReactFlow<Node<InquiryNodeData>, Edge>();
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const [isDesktopLg, setIsDesktopLg] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );
  const [paneMode, setPaneMode] = useState<PaneMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 'chat' : 'split',
  );
  const [splitPercent, setSplitPercent] = useState<number>(47);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    activeInquiry.nodes[0]?.id ?? '',
  );
  const [historyScope, setHistoryScope] = useState<HistoryScope>('all');
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isGeneratingBranch, setIsGeneratingBranch] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Responsive listener for laptop / tablet / mobile transitions
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktopLg(desktop);
      setPaneMode((prev) => {
        if (!desktop && prev === 'split') return 'chat';
        return prev;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sync selected node when switching active inquiry
  useEffect(() => {
    const latestNode = activeInquiry.nodes[activeInquiry.nodes.length - 1];
    const exists = activeInquiry.nodes.some((n) => n.id === selectedNodeId);
    if (!exists) {
      setSelectedNodeId(latestNode?.id ?? activeInquiry.nodes[0]?.id ?? '');
    }
    const timer = window.setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 320 });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [activeInquiry.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fit graph smoothly when switching back to Graph or Split pane
  useEffect(() => {
    if (paneMode === 'graph' || paneMode === 'split') {
      const timer = window.setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 280 });
      }, 90);
      return () => window.clearTimeout(timer);
    }
  }, [paneMode, splitPercent, reactFlowInstance]);

  // Clean up active voice session on unmount
  useEffect(() => {
    return () => {
      stopVoiceRef.current?.();
    };
  }, []);

  const focusNodeInGraph = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const target = activeInquiry.nodes.find((n) => n.id === nodeId);
      if (target && (paneMode === 'split' || paneMode === 'graph')) {
        reactFlowInstance.setCenter(target.position.x + 180, target.position.y + 130, {
          zoom: 0.95,
          duration: 380,
        });
      }
    },
    [activeInquiry.nodes, paneMode, reactFlowInstance],
  );

  const handleBranchFromNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      if (paneMode === 'graph') {
        setPaneMode(isDesktopLg ? 'split' : 'chat');
      }
      window.setTimeout(() => {
        composerInputRef.current?.focus();
      }, 60);
    },
    [isDesktopLg, paneMode],
  );

  const handleTriggerFollowUp = useCallback(
    async (parentNodeId: string, idx: number, questionText: string) => {
      if (isGeneratingBranch) return;
      setIsGeneratingBranch(true);
      try {
        const createdId = await onExploreFollowUp(
          activeInquiry.id,
          parentNodeId,
          idx,
          questionText,
        );
        if (createdId) {
          setSelectedNodeId(createdId);
          window.setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.22, duration: 360 });
          }, 100);
        }
      } finally {
        setIsGeneratingBranch(false);
      }
    },
    [activeInquiry.id, isGeneratingBranch, onExploreFollowUp, reactFlowInstance],
  );

  const handleSubmitCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customQuestion.trim();
    if (!trimmed || isGeneratingBranch) return;
    const anchorId = selectedNodeId || activeInquiry.nodes[0]?.id;
    if (!anchorId) return;

    setIsGeneratingBranch(true);
    try {
      const createdId = await onAskCustomQuestion(activeInquiry.id, anchorId, trimmed);
      setCustomQuestion('');
      if (createdId) {
        setSelectedNodeId(createdId);
        window.setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.22, duration: 360 });
        }, 100);
      }
    } finally {
      setIsGeneratingBranch(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListeningVoice) {
      stopVoiceRef.current?.();
      setIsListeningVoice(false);
      return;
    }

    setIsListeningVoice(true);
    stopVoiceRef.current = startVoiceCapture({
      fallbackText: 'What real-world edge case challenges this mechanism most?',
      onResult: (transcript) => {
        setCustomQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      onEnd: () => {
        setIsListeningVoice(false);
      },
    });
  };

  // Drag handler for smooth 30%-70% split pane resizing
  const handleStartSplitDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplit(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(70, Math.max(30, rawPct));
      setSplitPercent(Math.round(clamped * 10) / 10);
    };

    const onMouseUp = () => {
      setIsDraggingSplit(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAutoLayout = () => {
    const laidOut = layoutInquiryTree(activeInquiry.nodes, activeInquiry.edges);
    onUpdateGraph(activeInquiry.id, laidOut, activeInquiry.edges);
    window.setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.22, duration: 360 });
    }, 60);
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<InquiryNodeData>>[]) => {
      const nextNodes = applyNodeChanges(changes, activeInquiry.nodes);
      onUpdateGraph(activeInquiry.id, nextNodes, activeInquiry.edges);
    },
    [activeInquiry.edges, activeInquiry.id, activeInquiry.nodes, onUpdateGraph],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const nextEdges = applyEdgeChanges(changes, activeInquiry.edges);
      onUpdateGraph(activeInquiry.id, activeInquiry.nodes, nextEdges);
    },
    [activeInquiry.edges, activeInquiry.id, activeInquiry.nodes, onUpdateGraph],
  );

  const activePathIds = useMemo(
    () => getActivePathIds(selectedNodeId, activeInquiry.nodes),
    [activeInquiry.nodes, selectedNodeId],
  );

  const activePathSet = useMemo(() => new Set(activePathIds), [activePathIds]);

  const selectedNode = useMemo(
    () =>
      activeInquiry.nodes.find((n) => n.id === selectedNodeId) ??
      activeInquiry.nodes[0] ??
      null,
    [activeInquiry.nodes, selectedNodeId],
  );

  const conversationTurns = useMemo(() => {
    if (historyScope === 'path') {
      return activePathIds
        .map((id) => activeInquiry.nodes.find((n) => n.id === id))
        .filter((n): n is Node<InquiryNodeData> => Boolean(n));
    }
    return [...activeInquiry.nodes].sort(
      (a, b) =>
        new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime(),
    );
  }, [activeInquiry.nodes, activePathIds, historyScope]);

  const maxDepth = useMemo(
    () => activeInquiry.nodes.reduce((max, n) => Math.max(max, n.data.depth), 0),
    [activeInquiry.nodes],
  );

  const renderNodes = useMemo(
    () =>
      activeInquiry.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNode?.id,
          isOnActivePath: activePathSet.has(node.id),
          onSelectNode: (id: string) => setSelectedNodeId(id),
          onFocusNode: focusNodeInGraph,
          onBranchFromNode: handleBranchFromNode,
          onSelectFollowUp: handleTriggerFollowUp,
        },
      })),
    [
      activeInquiry.nodes,
      activePathSet,
      focusNodeInGraph,
      handleBranchFromNode,
      handleTriggerFollowUp,
      selectedNode?.id,
    ],
  );

  const objectiveMeta = getObjectiveDisplay(activeInquiry.objective);

  const effectiveLeftWidth =
    paneMode === 'split' && isDesktopLg
      ? `${splitPercent}%`
      : paneMode === 'chat'
      ? '100%'
      : '0%';

  const effectiveRightWidth =
    paneMode === 'split' && isDesktopLg
      ? `${100 - splitPercent}%`
      : paneMode === 'graph'
      ? '100%'
      : '0%';

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col bg-[var(--bg-canvas)]">
      {/* Workspace Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <select
              aria-label="Switch active inquiry"
              value={activeInquiry.id}
              onChange={(e) => onSelectInquiry(e.target.value)}
              className="max-w-[260px] truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition hover:border-[#d4af37]/40 focus:border-[#d4af37]"
            >
              {inquiries.map((inq) => (
                <option key={inq.id} value={inq.id}>
                  {inq.title}
                </option>
              ))}
            </select>

            <span
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${objectiveMeta.badgeClasses}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${objectiveMeta.dotClasses}`} />
              {objectiveMeta.shortLabel}
            </span>

            <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 md:inline-flex">
              {activeInquiry.subject}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Responsive Mode Switcher */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
            {isDesktopLg && (
              <button
                type="button"
                onClick={() => setPaneMode('split')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  paneMode === 'split'
                    ? 'bg-white text-[#d4af37] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" />
                Split
              </button>
            )}
            <button
              type="button"
              onClick={() => setPaneMode('chat')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                paneMode === 'chat'
                  ? 'bg-white text-[#d4af37] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Explanation
            </button>
            <button
              type="button"
              onClick={() => setPaneMode('graph')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                paneMode === 'graph'
                  ? 'bg-white text-[#d4af37] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Graph ({activeInquiry.nodes.length})
            </button>
          </div>

          {/* Clear New Inquiry Button */}
          <button
            type="button"
            onClick={onNewInquiry}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4af37] text-black px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e5c158]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Inquiry
          </button>
        </div>
      </div>

      {/* Main Split Workspace Container */}
      <div
        ref={splitContainerRef}
        className={`relative flex flex-1 overflow-hidden ${
          isDraggingSplit ? 'select-none' : ''
        }`}
      >
        {/* LEFT PANE: AI Conversation, Contextual Follow-ups & Explanation */}
        {(paneMode === 'split' || paneMode === 'chat') && (
          <div
            style={{ width: effectiveLeftWidth }}
            className="flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-150 ease-out"
          >
            {/* History Scope + Path Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <History className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {activePathIds.map((id, idx) => {
                  const n = activeInquiry.nodes.find((item) => item.id === id);
                  if (!n) return null;
                  const isLast = idx === activePathIds.length - 1;
                  return (
                    <React.Fragment key={id}>
                      {idx > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />}
                      <button
                        type="button"
                        onClick={() => focusNodeInGraph(id)}
                        className={`max-w-[140px] truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium transition ${
                          isLast
                            ? 'bg-[#d4af37]/15 font-semibold text-[#e5c158]'
                            : 'text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {idx === 0 ? 'Root' : n.data.title}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setHistoryScope('all')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    historyScope === 'all'
                      ? 'bg-[#d4af37] text-black text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({activeInquiry.nodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryScope('path')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    historyScope === 'path'
                      ? 'bg-[#d4af37] text-black text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Path ({activePathIds.length})
                </button>
              </div>
            </div>

            {/* Scrollable Conversation History + Active Explanation */}
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Conversation Thread Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Conversation History
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click any step to inspect &amp; highlight in graph
                  </span>
                </div>

                <div className="space-y-2">
                  {conversationTurns.map((turn, idx) => {
                    const isActive = turn.id === selectedNode?.id;
                    return (
                      <button
                        key={turn.id}
                        type="button"
                        onClick={() => focusNodeInGraph(turn.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isActive
                            ? 'border-[#d4af37]/50 bg-[#d4af37]/10 shadow-sm'
                            : 'border-slate-200/80 bg-slate-50/50 hover:border-[#d4af37]/30 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d4af37]">
                            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] border border-[#d4af37]/30">
                              Q{idx + 1}
                            </span>
                            {turn.data.kind === 'root'
                              ? 'Root Question'
                              : turn.data.kind === 'peer'
                              ? 'Peer Contribution'
                              : `Branch Depth ${turn.data.depth}`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatShortDate(turn.data.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-semibold text-slate-900">
                          {turn.data.question}
                        </p>
                        {!isActive && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                            {turn.data.title} — {turn.data.explanation}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Node Detailed AI Explanation & 3 Contextual Follow-Ups */}
              {selectedNode && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#d4af37]">
                        <Compass className="h-3 w-3" />
                        {objectiveMeta.shortLabel}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Depth {selectedNode.data.depth}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDesktopLg) setPaneMode('graph');
                        window.setTimeout(() => focusNodeInGraph(selectedNode.id), 40);
                      }}
                      className="text-xs font-semibold text-[#d4af37] hover:text-[#e5c158]"
                    >
                      Center Node in Graph →
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h2 className="text-base font-bold leading-snug text-slate-900">
                      {selectedNode.data.question}
                    </h2>

                    <div className="rounded-xl bg-slate-50/80 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[#d4af37]">
                        {selectedNode.data.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {selectedNode.data.explanation}
                      </p>
                    </div>

                    {/* Key Takeaways */}
                    {selectedNode.data.takeaways.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Key Takeaways
                        </h4>
                        <ul className="space-y-1.5">
                          {selectedNode.data.takeaways.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37]/100" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* References */}
                    {selectedNode.data.references.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        {selectedNode.data.references.map((ref, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Three Contextual Follow-Up Questions */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#d4af37]" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
                          3 Contextual Follow-Up Questions
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        Select to branch graph (+15 credits)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedNode.data.followUps.map((fq, idx) => {
                        const alreadyExplored =
                          selectedNode.data.usedFollowUps.includes(idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isGeneratingBranch}
                            onClick={() =>
                              handleTriggerFollowUp(selectedNode.id, idx, fq)
                            }
                            className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                              alreadyExplored
                                ? 'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f3efea] hover:bg-[#f59e0b]/15'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10'
                            } disabled:opacity-60`}
                          >
                            <span
                              className={`mt-0.5 inline-flex h-5 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                alreadyExplored
                                  ? 'bg-[#f59e0b] text-black text-white'
                                  : 'bg-[#d4af37]/15 text-[#d4af37]'
                              }`}
                            >
                              {alreadyExplored ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                `0${idx + 1}`
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-snug">{fq}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {alreadyExplored
                                  ? 'Explored · Click to revisit or inspect this branch'
                                  : 'Click to explore this follow-up branch'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Custom Question Composer */}
            <form
              onSubmit={handleSubmitCustomQuestion}
              className="border-t border-slate-200 bg-slate-50/80 p-3.5 sm:px-5"
            >
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Branching from:{' '}
                  <strong className="font-semibold text-slate-700">
                    {selectedNode?.data.title ?? 'Root Node'}
                  </strong>
                </span>
                {isGeneratingBranch && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#d4af37]">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating branch...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={composerInputRef}
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask your own follow-up question to branch from here..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                />
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title={
                    isListeningVoice
                      ? 'Stop voice input'
                      : 'Voice input (Sarvam STT integration hook)'
                  }
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                    isListeningVoice
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isListeningVoice ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isGeneratingBranch}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#d4af37] text-black px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e5c158] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Explore</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RESIZABLE SPLIT DIVIDER (Desktop Split Mode) */}
        {paneMode === 'split' && isDesktopLg && (
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label="Resize explanation and knowledge graph panels"
            aria-valuemin={30}
            aria-valuemax={70}
            aria-valuenow={Math.round(splitPercent)}
            onMouseDown={handleStartSplitDrag}
            onDoubleClick={() => setSplitPercent(47)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                setSplitPercent((p) => Math.max(30, p - 3));
              } else if (e.key === 'ArrowRight') {
                setSplitPercent((p) => Math.min(70, p + 3));
              } else if (e.key === 'Enter') {
                setSplitPercent(47);
              }
            }}
            title="Drag to resize panes (double-click to reset)"
            className="group relative z-20 flex w-2.5 shrink-0 cursor-col-resize items-center justify-center bg-slate-100 transition hover:bg-[#d4af37]/15 focus:outline-none"
          >
            <div className="h-10 w-1 rounded-full bg-slate-300 transition group-hover:bg-[#d4af37]/100" />
          </div>
        )}

        {/* RIGHT PANE: Interactive React Flow Knowledge Graph */}
        {(paneMode === 'split' || paneMode === 'graph') && (
          <div
            style={{ width: effectiveRightWidth }}
            className="relative h-full bg-[var(--bg-canvas)] transition-[width] duration-150 ease-out"
          >
            {/* Floating Graph Controls & Metrics Bar */}
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
                <GitBranch className="h-3.5 w-3.5 text-[#d4af37]" />
                <span className="font-semibold text-slate-800">
                  {activeInquiry.nodes.length} nodes
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">Depth {maxDepth}</span>
              </div>

              <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-sm backdrop-blur">
                <button
                  type="button"
                  onClick={() => reactFlowInstance.zoomIn({ duration: 200 })}
                  title="Zoom in"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => reactFlowInstance.zoomOut({ duration: 200 })}
                  title="Zoom out"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => reactFlowInstance.fitView({ padding: 0.22, duration: 320 })}
                  title="Fit entire knowledge graph"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Fit</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoLayout}
                  title="Arrange nodes cleanly"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Auto-Layout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMinimap((prev) => !prev)}
                  title="Toggle graph minimap"
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                    showMinimap
                      ? 'bg-[#d4af37]/10 text-[#d4af37]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>

            <ReactFlow
              nodes={renderNodes}
              edges={activeInquiry.edges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              fitView
              fitViewOptions={{ padding: 0.22 }}
              minZoom={0.35}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={22} size={1} color="#cad2c5" />
              <Controls position="bottom-left" showInteractive={false} />
              {showMinimap && (
                <MiniMap
                  position="bottom-right"
                  pannable
                  zoomable
                  nodeColor={(node) => {
                    const data = node.data as InquiryNodeData | undefined;
                    if (data?.kind === 'root') return '#52796f';
                    if (data?.kind === 'peer') return '#84a98c';
                    return '#354f52';
                  }}
                />
              )}
            </ReactFlow>
          </div>
        )}
      </div>
    </div>
  );
};

export const InquiryWorkspace: React.FC<InquiryWorkspaceProps> = (props) => (
  <ReactFlowProvider>
    <WorkspaceInner {...props} />
  </ReactFlowProvider>
);
