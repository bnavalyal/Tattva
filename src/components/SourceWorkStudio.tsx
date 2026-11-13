import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Play,
  RotateCcw,
  ExternalLink,
  Plus,
  X,
  Layers,
  Award,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import type { StudySource, SourceNote } from '../types/thinkforge';

interface SourceWorkStudioProps {
  source: StudySource;
  onBack: () => void;
  onUpdateSource?: (updated: StudySource) => void;
}

type StudioTab = 'transcript' | 'quizzes' | 'notes' | 'paper' | 'video';

export const SourceWorkStudio: React.FC<SourceWorkStudioProps> = ({
  source: initialSource,
  onBack,
  onUpdateSource,
}) => {
  const [source, setSource] = useState<StudySource>(initialSource);
  const [activeTab, setActiveTab] = useState<StudioTab>('transcript');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    source.knowledgeGraph.rootNodeId
  );
  const [graphZoom, setGraphZoom] = useState<number>(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<SourceNote['category']>('Custom Note');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [socraticInput, setSocraticInput] = useState('');
  const [researchMode, setResearchMode] = useState<boolean>(true);
  const [activeTrap, setActiveTrap] = useState<{
    scenario: string;
    resolution: string;
  } | null>(null);

  // Selected node details
  const selectedNode = useMemo(() => {
    return (
      source.knowledgeGraph.nodes.find((n) => n.id === selectedNodeId) ||
      source.knowledgeGraph.nodes[0]
    );
  }, [source.knowledgeGraph.nodes, selectedNodeId]);

  // Dynamic calculation of topic mastery score
  const masteryStats = useMemo(() => {
    const totalNodes = source.knowledgeGraph.nodes.length;
    const masteredNodes = source.knowledgeGraph.nodes.filter((n) => n.status === 'mastered').length;
    const inProgressNodes = source.knowledgeGraph.nodes.filter((n) => n.status === 'in_progress').length;
    
    // Quiz score
    const totalQuizzes = source.quizzes.length;
    const passedQuizzes = source.quizzes.filter((q) => q.isAnsweredCorrectly).length;
    const quizScorePct = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;
    
    // Combined In-and-Out Mastery: 65% weight on graph concepts + 35% on active quizzes
    const nodeScorePct = totalNodes > 0 ? ((masteredNodes + inProgressNodes * 0.5) / totalNodes) * 100 : 0;
    const compositeScore = Math.round(nodeScorePct * 0.65 + quizScorePct * 0.35);

    let level: StudySource['masteryLevel'] = 'Beginner';
    if (compositeScore >= 90) level = 'Mastered';
    else if (compositeScore >= 75) level = 'Advanced';
    else if (compositeScore >= 60) level = 'Proficient';
    else if (compositeScore >= 40) level = 'Intermediate';

    return {
      totalNodes,
      masteredNodes,
      inProgressNodes,
      unexploredNodes: totalNodes - masteredNodes - inProgressNodes,
      totalQuizzes,
      passedQuizzes,
      compositeScore,
      level,
    };
  }, [source]);

  // Semantic Zoom Calculation:
  const semanticTier = useMemo<'macro' | 'standard' | 'micro'>(() => {
    if (graphZoom < 0.85) return 'macro';
    if (graphZoom <= 1.15) return 'standard';
    return 'micro';
  }, [graphZoom]);

  const visibleNodes = useMemo(() => {
    return source.knowledgeGraph.nodes.filter((node) => {
      const nodeTier = node.tier || (node.depth === 0 ? 'macro' : 'standard');
      if (semanticTier === 'macro') {
        return nodeTier === 'macro' || node.id === source.knowledgeGraph.rootNodeId;
      }
      if (semanticTier === 'standard') {
        return nodeTier === 'macro' || nodeTier === 'standard' || node.id === source.knowledgeGraph.rootNodeId;
      }
      return true; // Micro: show all leaf nodes
    });
  }, [source.knowledgeGraph.nodes, source.knowledgeGraph.rootNodeId, semanticTier]);

  const visibleNodeIdSet = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return source.knowledgeGraph.edges.filter((edge) => {
      if (!visibleNodeIdSet.has(edge.source) || !visibleNodeIdSet.has(edge.target)) return false;
      const edgeTier = edge.tier || 'standard';
      if (semanticTier === 'macro') {
        return edgeTier === 'macro';
      }
      if (semanticTier === 'standard') {
        return edgeTier === 'macro' || edgeTier === 'standard';
      }
      return true; // Micro: show dense crosslinks and sub-invariants
    });
  }, [source.knowledgeGraph.edges, visibleNodeIdSet, semanticTier]);

  const getCollapsedChildrenCount = (parentNodeId: string) => {
    const directChildren = source.knowledgeGraph.edges
      .filter((e) => e.source === parentNodeId)
      .map((e) => e.target);
    const hiddenChildren = directChildren.filter((childId) => !visibleNodeIdSet.has(childId));
    return hiddenChildren.length;
  };

  // Handle quiz answer selection
  const handleSelectQuizOption = (quizId: string, optionIndex: number) => {
    const updatedQuizzes = source.quizzes.map((q) => {
      if (q.id !== quizId) return q;
      const isCorrect = optionIndex === q.correctOptionIndex;
      return {
        ...q,
        userSelectedIndex: optionIndex,
        isAnsweredCorrectly: isCorrect,
      };
    });

    const targetQuiz = source.quizzes.find((q) => q.id === quizId);
    let updatedNodes = source.knowledgeGraph.nodes;
    if (targetQuiz && optionIndex === targetQuiz.correctOptionIndex) {
      updatedNodes = updatedNodes.map((node) => {
        if (node.id === targetQuiz.relatedConceptNodeId && node.status !== 'mastered') {
          return { ...node, status: 'mastered' };
        }
        return node;
      });
    }

    const updatedSource: StudySource = {
      ...source,
      quizzes: updatedQuizzes,
      knowledgeGraph: {
        ...source.knowledgeGraph,
        nodes: updatedNodes,
      },
    };

    setSource(updatedSource);
    onUpdateSource?.(updatedSource);
  };

  // Reset quiz
  const handleResetQuiz = () => {
    const updatedQuizzes = source.quizzes.map((q) => ({
      ...q,
      userSelectedIndex: null,
      isAnsweredCorrectly: false,
    }));
    const updatedSource = { ...source, quizzes: updatedQuizzes };
    setSource(updatedSource);
    onUpdateSource?.(updatedSource);
  };

  // Toggle graph node status
  const handleToggleNodeStatus = (nodeId: string) => {
    const updatedNodes = source.knowledgeGraph.nodes.map((n) => {
      if (n.id !== nodeId) return n;
      let nextStatus: 'mastered' | 'in_progress' | 'unexplored' = 'mastered';
      if (n.status === 'mastered') nextStatus = 'in_progress';
      else if (n.status === 'in_progress') nextStatus = 'unexplored';
      else nextStatus = 'mastered';
      return { ...n, status: nextStatus };
    });

    const updatedSource = {
      ...source,
      knowledgeGraph: {
        ...source.knowledgeGraph,
        nodes: updatedNodes,
      },
    };
    setSource(updatedSource);
    onUpdateSource?.(updatedSource);
  };

  // Add custom note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: SourceNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent.trim(),
      updatedAt: 'Just now',
    };

    const updatedSource = {
      ...source,
      notes: [newNote, ...source.notes],
    };

    setSource(updatedSource);
    onUpdateSource?.(updatedSource);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0d0f] text-slate-200">
      {/* Studio Header Bar */}
      <header className="border-b border-white/10 bg-[#0b0d0f] px-6 py-3 shadow-md shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#13161b] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/25 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sources</span>
            </button>

            <div className="h-4 w-px bg-white/10" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.5 rounded border border-[#c59a67]/20">
                  {source.category}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  {source.sourceTypeLabel}
                </span>
              </div>
              <h1 className="font-serif-tattva text-base sm:text-lg font-normal text-white mt-0.5 line-clamp-1">
                {source.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PRD §7: Physical [Research Mode] Switch */}
            <button
              type="button"
              onClick={() => setResearchMode((prev) => !prev)}
              title="PRD §7: The Training Weights. Direct answers forbidden; awards 3x Cognitive Stamina."
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition cursor-pointer ${
                researchMode
                  ? 'border-[#a3e635]/60 bg-[#a3e635]/15 text-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                  : 'border-white/10 bg-[#13161b] text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  researchMode ? 'bg-[#a3e635] animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>RESEARCH MODE: {researchMode ? 'ACTIVE (3x)' : 'OFF'}</span>
            </button>

            {/* Mastery Indicator Box */}
            <div className="flex items-center gap-4 bg-[#13161b] border border-white/10 rounded-xl px-4 py-2 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                    TOPIC IN-AND-OUT MASTERY
                  </span>
                  <span className="font-mono text-xs font-bold text-[#c59a67]">
                    {masteryStats.compositeScore}% · {masteryStats.level}
                  </span>
                </div>
                <div className="w-48 bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-[#c59a67] h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${masteryStats.compositeScore}%` }}
                  />
                </div>
              </div>

              <div className="h-7 w-px bg-white/10" />

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="text-center">
                  <div className="font-bold text-[#a3e635]">{masteryStats.masteredNodes}</div>
                  <div className="text-[9px] text-slate-400">Mastered</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#c59a67]">{masteryStats.inProgressNodes}</div>
                  <div className="text-[9px] text-slate-400">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-white">
                    {masteryStats.passedQuizzes}/{masteryStats.totalQuizzes}
                  </div>
                  <div className="text-[9px] text-slate-400">Quiz Passed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio: Dual-Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT SCREEN: SOURCE MATERIAL (Mirroring Screenshot 2) */}
        <div className="lg:col-span-6 xl:col-span-6 border-r border-white/10 flex flex-col bg-[#0e1115] overflow-hidden">
          {/* Sub-nav Tab Bar */}
          <div className="border-b border-white/10 px-6 pt-2.5 flex items-center justify-between bg-[#0b0d0f]">
            <nav className="flex space-x-2" aria-label="Sections">
              <button
                type="button"
                onClick={() => setActiveTab('transcript')}
                className={`py-2 px-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'border-[#c59a67] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Source Transcript
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quizzes')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === 'quizzes'
                    ? 'border-[#c59a67] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Active Quizzes</span>
                <span className="font-mono text-[10px] text-[#a3e635] bg-[#a3e635]/10 px-1 rounded">
                  {masteryStats.passedQuizzes}/{masteryStats.totalQuizzes}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-[#c59a67] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes &amp; Formulas ({source.notes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeTab === 'paper'
                    ? 'border-[#c59a67] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Research Paper</span>
              </button>

              {source.youtubeId && (
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-semibold transition border-b-2 cursor-pointer ${
                    activeTab === 'video'
                      ? 'border-[#c59a67] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Lecture</span>
                </button>
              )}
            </nav>

            {activeTab === 'notes' && (
              <button
                type="button"
                onClick={() => setIsAddingNote(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#181b22] px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-[#c59a67]/60 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            )}

            {activeTab === 'quizzes' && (
              <button
                type="button"
                onClick={handleResetQuiz}
                title="Retake all quizzes"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            )}
          </div>

          {/* Left Screen Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB: TRANSCRIPT (Directly matches Screenshot 2) */}
            {activeTab === 'transcript' && (
              <div className="space-y-6">
                <div>
                  <span className="inline-block rounded font-mono text-[10px] font-bold text-[#c59a67] bg-[#c59a67]/15 border border-[#c59a67]/30 px-2.5 py-0.5 uppercase tracking-wider mb-2">
                    TRANSCRIPT
                  </span>
                  <h2 className="font-serif-tattva text-2xl sm:text-3xl text-white font-normal leading-snug">
                    {source.title}
                  </h2>
                  <div className="mt-2 font-mono text-xs text-slate-400 flex items-center gap-4">
                    <span>RUNTIME {source.duration || '38 min'}</span>
                    <span>REFERENCE seed/{source.id}.txt</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-white/10 pt-4">
                  <p>
                    {source.summary}
                  </p>
                  <p>
                    Arena allocation trades flexibility for throughput. Instead of tracking individual block metadata the way a general-purpose allocator does, an arena allocator reserves one contiguous region up front and satisfies allocations by advancing a single &ldquo;bump&rdquo; pointer. Freeing is batched: the whole arena is reset or released at once, never per-object.
                  </p>
                  <p>
                    This works well when object lifetimes are correlated — a request handler, a single frame of a game loop, a parser pass over one file. It works badly when lifetimes are independent, because there is no way to reclaim an individual object&apos;s memory without invalidating every allocation made after it in the same arena.
                  </p>
                  <p>
                    A free-list allocator reintroduces per-object reclamation by threading freed blocks into a linked list keyed by size class, at the cost of metadata overhead and fragmentation as blocks of mismatched sizes accumulate.
                  </p>

                  <div className="rounded-xl border border-white/10 bg-[#13161b] p-4 space-y-2 mt-4">
                    <div className="font-mono text-xs text-[#a3e635] font-bold uppercase">
                      Architectural Mechanics &amp; Invariants:
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
                      <li>Bump Pointer Time Complexity: \(O(1)\) with zero branch misprediction.</li>
                      <li>Batch Reclamation: Resets arena index to 0 without freeing heap segments.</li>
                      <li>Thread Safety: Per-thread local arenas eliminate global mutex lock contention.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACTIVE QUIZZES */}
            {activeTab === 'quizzes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-[#13161b] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#181b22] border border-white/10 text-[#c59a67] flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Concept Mastery Quizzes ({source.quizzes.length})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Answer to test your in-and-out understanding and advance graph verification.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-bold text-[#a3e635]">
                      {Math.round((masteryStats.passedQuizzes / (source.quizzes.length || 1)) * 100)}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase">Accuracy</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {source.quizzes.map((quiz, qIdx) => {
                    const isAnswered = quiz.userSelectedIndex !== null && quiz.userSelectedIndex !== undefined;
                    return (
                      <div
                        key={quiz.id}
                        className="rounded-2xl border border-white/10 bg-[#13161b] p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="w-6 h-6 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-xs font-mono text-[#c59a67]">
                            Concept: {source.knowledgeGraph.nodes.find(n => n.id === quiz.relatedConceptNodeId)?.label || 'Core Invariant'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {quiz.question}
                        </h4>

                        {/* Options */}
                        <div className="mt-4 space-y-2">
                          {quiz.options.map((option, optIdx) => {
                            const isSelected = quiz.userSelectedIndex === optIdx;
                            const isCorrectOpt = optIdx === quiz.correctOptionIndex;

                            let optClasses =
                              'border border-white/10 bg-[#181b22] hover:border-white/25 text-slate-300';

                            if (isAnswered) {
                              if (isCorrectOpt) {
                                optClasses = 'border-[#a3e635] bg-[#a3e635]/10 text-white font-semibold shadow-[0_0_8px_rgba(163,230,53,0.15)]';
                              } else if (isSelected && !isCorrectOpt) {
                                optClasses = 'border-red-500/80 bg-red-950/20 text-red-200';
                              } else {
                                optClasses = 'border-white/5 bg-[#0e1115] text-slate-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => handleSelectQuizOption(quiz.id, optIdx)}
                                className={`w-full text-left rounded-xl p-3 text-xs leading-relaxed transition flex items-start gap-3 cursor-pointer ${optClasses}`}
                              >
                                <span className="font-mono font-bold text-[11px] mt-0.5 text-slate-400">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className="flex-1">{option}</span>
                                {isAnswered && isCorrectOpt && (
                                  <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation banner */}
                        {isAnswered && (
                          <div className="rounded-xl border border-white/10 bg-[#0e1115] p-3 text-xs text-slate-300 leading-relaxed">
                            <span className="font-bold text-[#a3e635] block mb-1">
                              {quiz.isAnsweredCorrectly ? '✓ Correct Explanation:' : '⚠ Concept Breakdown:'}
                            </span>
                            {quiz.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: NOTES & FORMULAS */}
            {activeTab === 'notes' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    {source.notes.length} Recorded Architectural Notes
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#c59a67]/40 bg-[#c59a67]/15 px-3 py-1 font-mono text-xs font-semibold text-[#c59a67] hover:bg-[#c59a67]/25 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Note
                  </button>
                </div>

                {isAddingNote && (
                  <form
                    onSubmit={handleAddNote}
                    className="rounded-2xl border border-white/15 bg-[#13161b] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#c59a67] uppercase">
                        Add Note or Formula
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Note Title / Invariant"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#c59a67]"
                      required
                    />
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value as SourceNote['category'])}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-2 text-xs text-white outline-none focus:border-[#c59a67]"
                    >
                      <option value="Custom Note">Custom Note</option>
                      <option value="Key Invariant">Key Invariant</option>
                      <option value="Formula">Formula</option>
                      <option value="Implementation">Implementation</option>
                    </select>
                    <textarea
                      placeholder="Content / Formula markdown..."
                      rows={3}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#c59a67]"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#c59a67] px-3 py-1 font-mono text-xs font-bold text-black hover:bg-[#d4a373]"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                )}

                {source.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-white/10 bg-[#13161b] p-5 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded font-mono text-[10px] font-bold text-[#c59a67] bg-[#c59a67]/10 border border-[#c59a67]/20 px-2 py-0.5 uppercase">
                        {note.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{note.updatedAt}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{note.title}</h4>

                    <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans bg-[#0e1115] p-3 rounded-xl border border-white/5">
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: RESEARCH PAPER */}
            {activeTab === 'paper' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-[#13161b] p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded font-mono text-[10px] font-bold uppercase tracking-wider text-[#c59a67] bg-[#c59a67]/10 px-2 py-0.5 border border-[#c59a67]/20">
                        {source.researchPaper.conference} ({source.researchPaper.year})
                      </span>
                      <h3 className="mt-2 font-serif-tattva text-xl font-normal text-white">
                        {source.researchPaper.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        {source.researchPaper.authors}
                      </p>
                    </div>

                    <a
                      href={source.researchPaper.arxivUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181b22] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#c59a67]/60 transition shrink-0 cursor-pointer"
                    >
                      <span>Read Paper</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#13161b] p-5 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Paper Abstract
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-300 italic border-l-2 border-[#c59a67] pl-3">
                    &ldquo;{source.researchPaper.abstract}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* TAB: VIDEO */}
            {activeTab === 'video' && source.youtubeId && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${source.youtubeId}?autoplay=0&rel=0`}
                    title={source.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SCREEN: KNOWLEDGE GRAPH (Mirroring Screenshot 2) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col bg-[#0b0d0f] overflow-hidden relative">
          {/* Header Bar */}
          <div className="border-b border-white/10 bg-[#0b0d0f] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c59a67]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                KNOWLEDGE GRAPH
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* STAMINA 410 Badge from Screenshot 2 */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-500 uppercase">STAMINA</span>
                <span className="font-bold text-[#a3e635] text-sm">410</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-[#13161b]">
                <button
                  type="button"
                  onClick={() => setGraphZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                  title="Zoom Out"
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGraphZoom(1.0)}
                  className="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white"
                >
                  {Math.round(graphZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setGraphZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))}
                  title="Zoom In"
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-[#0b0d0f] select-none min-h-[420px]">
            {/* Dark Radial Dot Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Scaled Canvas */}
            <div
              className="w-full h-full relative overflow-auto p-8"
              style={{
                transform: `scale(${graphZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ minWidth: 720, minHeight: 480 }}
              >
                {visibleEdges.map((edge) => {
                  const sourceNode = source.knowledgeGraph.nodes.find((n) => n.id === edge.source);
                  const targetNode = source.knowledgeGraph.nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const sx = sourceNode.x + 72;
                  const sy = sourceNode.y + 28;
                  const tx = targetNode.x + 72;
                  const ty = targetNode.y + 28;

                  if (edge.isDenseCrosslink) {
                    const mx = (sx + tx) / 2 + (tx > sx ? -24 : 24);
                    const my = Math.min(sy, ty) - 30;
                    return (
                      <g key={edge.id} className="animate-fadeIn">
                        <path
                          d={`M ${sx} ${sy} Q ${mx} ${my}, ${tx} ${ty}`}
                          fill="none"
                          stroke="#c59a67"
                          strokeWidth={2}
                          strokeDasharray="5 3"
                        />
                        {edge.label && (
                          <g>
                            <rect
                              x={mx - 32}
                              y={my - 8}
                              width="64"
                              height="16"
                              rx="4"
                              fill="#13161b"
                              stroke="#c59a67"
                              strokeWidth="0.8"
                            />
                            <text
                              x={mx}
                              y={my + 3.5}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="700"
                              fill="#c59a67"
                              fontFamily="monospace"
                            >
                              {edge.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  }

                  const my = (sy + ty) / 2;
                  return (
                    <path
                      key={edge.id}
                      d={`M ${sx} ${sy} C ${sx} ${my}, ${tx} ${my}, ${tx} ${ty}`}
                      fill="none"
                      stroke={
                        sourceNode.status === 'mastered' && targetNode.status === 'mastered'
                          ? '#a3e635'
                          : 'rgba(255, 255, 255, 0.2)'
                      }
                      strokeWidth={
                        sourceNode.status === 'mastered' && targetNode.status === 'mastered' ? 2.5 : 1.5
                      }
                      strokeDasharray={targetNode.status === 'unexplored' ? '4 3' : 'none'}
                    />
                  );
                })}
              </svg>

              {/* Circular Nodes on Canvas */}
              <div className="relative" style={{ minWidth: 720, minHeight: 460 }}>
                {visibleNodes.map((node) => {
                  const isSelected = node.id === selectedNode.id;
                  const collapsedCount = semanticTier === 'macro' ? getCollapsedChildrenCount(node.id) : 0;

                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setIsDetailOpen(true);
                      }}
                      className={`absolute w-36 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group select-none ${
                        isSelected ? 'scale-105 z-20' : 'hover:scale-105 z-10'
                      }`}
                      style={{ left: node.x, top: node.y }}
                    >
                      <div className="relative">
                        {collapsedCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGraphZoom(1.35);
                              setSelectedNodeId(node.id);
                              setIsDetailOpen(true);
                            }}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded font-mono bg-[#c59a67] text-[#0b0d0f] px-2 py-0.5 text-[8.5px] font-bold shadow-md hover:bg-[#d4a373] transition flex items-center gap-1 z-30 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>+{collapsedCount} Invariants</span>
                          </button>
                        )}

                        {/* Circular Glyphs in Dark Obsidian Theme */}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                            node.status === 'mastered'
                              ? 'border-[#a3e635] bg-[#13161b] text-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.25)] ring-2 ring-[#a3e635]/20'
                              : node.status === 'in_progress'
                              ? 'border-[#c59a67] bg-[#13161b] text-[#c59a67] ring-2 ring-[#c59a67]/20'
                              : 'border-dashed border-white/20 bg-[#0e1115] text-slate-500'
                          } ${
                            isSelected
                              ? 'ring-4 ring-white/40 shadow-xl'
                              : 'group-hover:border-white/50'
                          }`}
                        >
                          {node.status === 'mastered' ? (
                            <CheckCircle2 className="w-6 h-6 text-[#a3e635]" />
                          ) : node.status === 'in_progress' ? (
                            <Layers className="w-5 h-5 text-[#c59a67]" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        {/* Status dot */}
                        <div
                          className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0b0d0f] ${
                            node.status === 'mastered'
                              ? 'bg-[#a3e635]'
                              : node.status === 'in_progress'
                              ? 'bg-[#c59a67]'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Text below node: Name + 1 simple line */}
                      <div className="mt-2 w-full px-1">
                        <div className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-[#c59a67] transition">
                          {node.label}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400 font-medium leading-tight line-clamp-1">
                          {node.shortLine || node.summary}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail Popover Drawer */}
            {isDetailOpen && selectedNode && (
              <div className="absolute inset-x-4 bottom-28 top-auto max-h-[70%] overflow-y-auto rounded-2xl border border-white/15 bg-[#13161b]/98 backdrop-blur-md p-5 shadow-2xl z-40 animate-fadeIn space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.5 rounded border border-[#c59a67]/30">
                      {selectedNode.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ● {selectedNode.status.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                    className="w-6 h-6 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-serif-tattva text-lg text-white font-normal">{selectedNode.label}</h3>
                  <p className="text-xs text-slate-400 italic">
                    &ldquo;{selectedNode.shortLine || selectedNode.summary}&rdquo;
                  </p>
                </div>

                {selectedNode.keyFormula && (
                  <div className="rounded-xl bg-[#0b0d0f] border border-white/10 p-3 font-mono text-xs text-[#a3e635]">
                    {selectedNode.keyFormula}
                  </div>
                )}

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.summary}
                </p>

                {selectedNode.failureMode && (
                  <div className="rounded-xl border border-[#c59a67]/40 bg-[#c59a67]/10 p-3 text-xs text-amber-200">
                    <span className="font-bold text-[#c59a67] block mb-1">Architectural Failure Mode:</span>
                    {selectedNode.failureMode}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleToggleNodeStatus(selectedNode.id)}
                    className="rounded-lg bg-[#c59a67] px-3.5 py-1.5 text-xs font-bold text-[#0b0d0f] hover:bg-[#d4a373] transition cursor-pointer"
                  >
                    {selectedNode.status === 'mastered' ? '✓ Mastered' : 'Mark as Mastered'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('quizzes');
                      setIsDetailOpen(false);
                    }}
                    className="text-xs font-mono text-[#a3e635] hover:underline cursor-pointer"
                  >
                    Practice in Quiz →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SOCRATIC INQUIRY BAR (PRD §3 & §5) */}
          <div className="border-t border-white/10 bg-[#0b0d0f] p-4 space-y-3 shrink-0">
            {/* PRD §5: High-Visibility Adversarial AI Trap Alert */}
            {activeTrap && (
              <div className="rounded-xl border border-red-500/60 bg-red-950/60 p-4 space-y-3 animate-fadeIn shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wider">
                      BE CAREFUL HERE!! (PRD §5 Adversarial Trap)
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold uppercase text-red-200 bg-red-900/60 px-2 py-0.5 rounded border border-red-500/40">
                    Input Locked
                  </span>
                </div>

                <p className="text-xs text-red-200 leading-relaxed font-sans">
                  {activeTrap.scenario}
                </p>

                <div className="pt-2 border-t border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-red-300">
                    Invariant: {activeTrap.resolution}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTrap(null)}
                    className="rounded-lg bg-red-500 px-3.5 py-1.5 font-mono text-xs font-bold text-black hover:bg-red-400 transition cursor-pointer shrink-0"
                  >
                    OVERCOME TRAP &amp; UNLOCK →
                  </button>
                </div>
              </div>
            )}

            {/* Socratic Dialogue Prompt Text */}
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              {researchMode ? (
                <span className="text-[#a3e635] font-mono text-[11px] block mb-1">
                  [ RESEARCH MODE ENGAGED: Socratic Scaffolding &bull; Direct Answers Forbidden ]
                </span>
              ) : null}
              What would escape analysis need to prove about an allocation for it to be arena-eligible without programmer annotation? Compare against jemalloc&apos;s size-class design docs and derive the trade-off yourself before checking the citation.
            </div>

            {/* Socratic Follow-up Chips (§3: Exactly three adaptive meta-questions) */}
            <div className="space-y-1">
              <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                ADAPTIVE FOLLOW-UPS (PRD §3)
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'What would escape analysis need to prove here?',
                  'Where does jemalloc document its size classes?',
                  'What if the client tries to individually free an allocation in the arena?',
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (chip.includes('free')) {
                        setActiveTrap({
                          scenario:
                            'Potential Memory Invariant Violation: Arena allocators do not track per-object metadata. Attempting to free an individual allocation mid-stream invalidates all subsequent arena allocations.',
                          resolution:
                            'In an arena allocator, all deallocations are batched into a reset (bump_ptr = 0). Per-object lifetime tracking belongs in a free-list or jemalloc size class.',
                        });
                      } else {
                        setSocraticInput(chip);
                      }
                    }}
                    className="rounded border border-white/10 bg-[#13161b] px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:border-[#c59a67]/60 hover:text-white transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Question Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!socraticInput.trim()) return;

                const lower = socraticInput.toLowerCase();
                if (
                  lower.includes('free') ||
                  lower.includes('delete') ||
                  lower.includes('individual') ||
                  lower.includes('deadlock')
                ) {
                  setActiveTrap({
                    scenario:
                      'Potential Memory Invariant Violation: Arena allocators do not track per-object metadata. Attempting to free an individual allocation mid-stream invalidates all subsequent arena allocations.',
                    resolution:
                      'In an arena allocator, all deallocations are batched into a reset (bump_ptr = 0). Per-object lifetime tracking belongs in a free-list or jemalloc size class.',
                  });
                }
                setSocraticInput('');
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                disabled={Boolean(activeTrap)}
                value={socraticInput}
                onChange={(e) => setSocraticInput(e.target.value)}
                placeholder={
                  activeTrap
                    ? 'Input locked: resolve the adversarial trap above to continue...'
                    : 'Ask a technical question about the source material...'
                }
                className={`flex-1 rounded-xl border border-white/10 bg-[#13161b] px-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#c59a67]/60 font-sans ${
                  activeTrap ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button
                type="submit"
                disabled={Boolean(activeTrap)}
                className={`rounded-xl border border-white/15 bg-[#181b22] px-4 py-2 font-mono text-xs font-bold text-slate-200 transition ${
                  activeTrap
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:text-white hover:border-[#c59a67] cursor-pointer'
                }`}
              >
                ASK
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
