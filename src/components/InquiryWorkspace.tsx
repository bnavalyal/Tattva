import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  ShieldAlert,
} from 'lucide-react';
import type {
  InquiryDetail,
  QuestionNode,
} from '../types/tattva';
import {
  KnowledgeFlowNode,
  type FlowQuestionNodeType,
} from './KnowledgeFlowNode';
import {
  createInquiryEdge,
  layoutInquiryTree,
} from '../utils/graphLayout';

const nodeTypes: NodeTypes = {
  inquiryNode: KnowledgeFlowNode,
};

export interface InquiryWorkspaceProps {
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

const WorkspaceCanvas: React.FC<InquiryWorkspaceProps> = ({
  inquiryDetail,
  selectedNodeId: propSelectedNodeId,
  researchMode = false,
  onToggleResearchMode,
  onSubmitQuestion,
  onSelectNode,
  onResolveTrap,
}) => {
  const reactFlowInstance = useReactFlow<FlowQuestionNodeType, Edge>();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    propSelectedNodeId || inquiryDetail.nodes[0]?.id || null,
  );
  const [composerInput, setComposerInput] = useState('');
  const [branchingFromId, setBranchingFromId] = useState<string | null>(null);

  const selectedNodeId = propSelectedNodeId || internalSelectedId;

  // Sync internal selected ID when prop changes
  useEffect(() => {
    if (propSelectedNodeId) {
      setInternalSelectedId(propSelectedNodeId);
    }
  }, [propSelectedNodeId]);

  // Selected node object
  const selectedNode = useMemo(() => {
    return inquiryDetail.nodes.find((n) => n.id === selectedNodeId) || inquiryDetail.nodes[0] || null;
  }, [inquiryDetail.nodes, selectedNodeId]);

  // Active path from root to selected node
  const activePathIds = useMemo(() => {
    if (!selectedNodeId) return [];
    const chain: string[] = [];
    let curr: QuestionNode | undefined = inquiryDetail.nodes.find((n) => n.id === selectedNodeId);
    const seen = new Set<string>();

    while (curr && !seen.has(curr.id)) {
      seen.add(curr.id);
      chain.unshift(curr.id);
      curr = inquiryDetail.nodes.find((n) => n.id === curr?.parentNodeId);
    }
    return chain;
  }, [inquiryDetail.nodes, selectedNodeId]);

  // Check if current branch or selected node has an unresolved adversarial trap
  const hasUnresolvedTrap = useMemo(() => {
    return inquiryDetail.nodes.some(
      (n) => activePathIds.includes(n.id) && n.isTrap && !n.trapResolvedAt,
    );
  }, [inquiryDetail.nodes, activePathIds]);

  const activeTrapNode = useMemo(() => {
    return inquiryDetail.nodes.find(
      (n) => activePathIds.includes(n.id) && n.isTrap && !n.trapResolvedAt,
    ) || null;
  }, [inquiryDetail.nodes, activePathIds]);

  // Build ReactFlow Nodes
  const initialNodes = useMemo<FlowQuestionNodeType[]>(() => {
    return inquiryDetail.nodes.map((node, idx) => {
      const isSelected = node.id === selectedNodeId;
      const isOnActivePath = activePathIds.includes(node.id);

      return {
        id: node.id,
        type: 'inquiryNode',
        position: { x: 0, y: 0 },
        data: {
          ...node,
          nodeId: node.id,
          depth: idx,
          isSelected,
          isOnActivePath,
          onSelectNode: (id) => {
            setInternalSelectedId(id);
            onSelectNode(id);
          },
          onFocusNode: (id) => {
            setInternalSelectedId(id);
            onSelectNode(id);
            const n = inquiryDetail.nodes.find((item) => item.id === id);
            if (n && reactFlowInstance) {
              reactFlowInstance.fitView({ nodes: [{ id }], duration: 600 });
            }
          },
          onBranchFromNode: (id) => {
            setBranchingFromId(id);
            setInternalSelectedId(id);
            onSelectNode(id);
          },
          onSelectFollowUp: (nodeId, followUp) => {
            onSubmitQuestion(
              followUp.questionText,
              nodeId,
              followUp.id,
              researchMode,
            );
          },
          onResolveTrap: (nodeId) => {
            onResolveTrap?.(nodeId);
          },
        },
      };
    });
  }, [
    inquiryDetail.nodes,
    selectedNodeId,
    activePathIds,
    onSelectNode,
    onSubmitQuestion,
    onResolveTrap,
    researchMode,
    reactFlowInstance,
  ]);

  // Build ReactFlow Edges
  const initialEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];
    for (const node of inquiryDetail.nodes) {
      if (node.parentNodeId) {
        const parent = inquiryDetail.nodes.find((n) => n.id === node.parentNodeId);
        const followUpMatched = parent?.followUps?.find((f) => f.childNodeId === node.id);
        const label = followUpMatched ? `Follow-up 0${followUpMatched.position}` : undefined;
        edges.push(createInquiryEdge(node.parentNodeId, node.id, label));
      }
    }
    return edges;
  }, [inquiryDetail.nodes]);

  // Auto-layout
  const [nodes, setNodes] = useState<FlowQuestionNodeType[]>(() =>
    layoutInquiryTree(initialNodes, initialEdges),
  );
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    const nextNodes = layoutInquiryTree(initialNodes, initialEdges);
    setNodes(nextNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowQuestionNodeType>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.15, duration: 500 });
  }, [reactFlowInstance]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerInput.trim() || hasUnresolvedTrap) return;

    const parentId = branchingFromId || selectedNodeId || null;
    onSubmitQuestion(composerInput.trim(), parentId, null, researchMode);
    setComposerInput('');
    setBranchingFromId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0d0f] text-slate-200 select-none overflow-hidden relative">
      {/* Workspace Sub-header */}
      <div className="border-b border-white/10 bg-[#0e1115] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.5 rounded border border-[#c59a67]/30">
              KNOWLEDGE GRAPH
            </span>
            <span className="text-xs font-mono text-slate-400">
              {inquiryDetail.nodes.length} Nodes Dissected
            </span>
          </div>

          {/* Active Breadcrumb Chain */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-600">/</span>
            {activePathIds.map((id, idx) => {
              const node = inquiryDetail.nodes.find((n) => n.id === id);
              if (!node) return null;
              const isLast = idx === activePathIds.length - 1;

              return (
                <React.Fragment key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      setInternalSelectedId(id);
                      onSelectNode(id);
                    }}
                    className={`truncate max-w-[140px] hover:text-white transition ${
                      isLast ? 'text-[#c59a67] font-bold' : 'text-slate-400'
                    }`}
                  >
                    {node.userQuestion}
                  </button>
                  {!isLast && <ChevronRight className="w-3 h-3 text-slate-600" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* PRD §7: Physical Research Mode Switch */}
          {onToggleResearchMode && (
            <button
              type="button"
              onClick={onToggleResearchMode}
              title="PRD §7: Toggles Socratic reasoning mode with 3x Stamina multiplier"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                researchMode
                  ? 'border-[#a3e635]/60 bg-[#a3e635]/15 text-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                  : 'border-white/10 bg-[#13161b] text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  researchMode ? 'bg-[#a3e635] animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>RESEARCH MODE {researchMode ? '(3x)' : 'OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFitView}
            title="Fit graph to view"
            className="p-1.5 rounded-lg border border-white/10 bg-[#13161b] text-slate-400 hover:text-white hover:border-[#c59a67]/60 transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#0b0d0f]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-[#0b0d0f]"
        >
          <Background color="#ffffff" gap={28} size={1} className="opacity-10" />
          <Controls showInteractive={false} className="!border-white/10 !bg-[#13161b]" />
          <MiniMap
            nodeColor="#c59a67"
            maskColor="rgba(11, 13, 15, 0.85)"
            className="!border !border-white/10 !bg-[#13161b] !rounded-xl !overflow-hidden"
          />
        </ReactFlow>
      </div>

      {/* Socratic Dialogue / Follow-up Composer Bottom Bar */}
      <div className="border-t border-white/10 bg-[#0e1115] p-4 space-y-3 shrink-0">
        {/* Adversarial Trap Warning Banner (§5) */}
        {hasUnresolvedTrap && activeTrapNode?.trapMetadata && (
          <div className="rounded-xl border border-red-500/60 bg-red-950/60 p-4 space-y-2.5 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wider">
                  ⚠️ BE CAREFUL HERE!! (PRD §5 Adversarial Trap Active)
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold uppercase text-red-200 bg-red-900/60 px-2 py-0.5 rounded border border-red-500/40">
                Input Locked
              </span>
            </div>

            <p className="text-xs text-red-200 leading-relaxed font-sans">
              {activeTrapNode.trapMetadata.scenario}
            </p>

            <div className="pt-2 border-t border-red-500/30 flex items-center justify-between">
              <span className="text-[11px] font-mono text-red-300">
                Misconception: {activeTrapNode.trapMetadata.misconceptionType}
              </span>
              <button
                type="button"
                onClick={() => onResolveTrap?.(activeTrapNode.id)}
                className="rounded-lg bg-red-500 px-3.5 py-1.5 font-mono text-xs font-bold text-black hover:bg-red-400 transition cursor-pointer"
              >
                OVERCOME TRAP &amp; UNLOCK GRAPH →
              </button>
            </div>
          </div>
        )}

        {/* Selected Node Follow-ups Quick Launcher */}
        {selectedNode && selectedNode.followUps && selectedNode.followUps.length > 0 && !hasUnresolvedTrap && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase">
              <span>
                Adaptive Follow-Ups from &ldquo;{selectedNode.userQuestion.slice(0, 36)}...&rdquo;
              </span>
              <span>PRD §3</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedNode.followUps.map((followUp) => {
                const isBranched = Boolean(followUp.isSelected || followUp.childNodeId);

                return (
                  <button
                    key={followUp.id}
                    type="button"
                    disabled={isBranched}
                    onClick={() => {
                      onSubmitQuestion(
                        followUp.questionText,
                        selectedNode.id,
                        followUp.id,
                        researchMode,
                      );
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-sans transition flex items-center gap-2 ${
                      isBranched
                        ? 'border-[#a3e635]/30 bg-[#a3e635]/10 text-slate-400 opacity-70 cursor-default'
                        : 'border-white/10 bg-[#13161b] text-slate-300 hover:border-[#c59a67] hover:text-white cursor-pointer'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#c59a67]">
                      0{followUp.position}
                    </span>
                    <span>{followUp.questionText}</span>
                    {isBranched && <CheckCircle2 className="w-3 h-3 text-[#a3e635]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Branching from indicator */}
        {branchingFromId && (
          <div className="flex items-center justify-between text-xs font-mono text-[#c59a67] bg-[#c59a67]/10 px-3 py-1.5 rounded-lg border border-[#c59a67]/30">
            <span>Branching custom question from Node {branchingFromId}</span>
            <button
              type="button"
              onClick={() => setBranchingFromId(null)}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Question Composer Form */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            disabled={hasUnresolvedTrap}
            value={composerInput}
            onChange={(e) => setComposerInput(e.target.value)}
            placeholder={
              hasUnresolvedTrap
                ? 'Input locked: resolve the adversarial trap above to continue reasoning...'
                : branchingFromId
                ? 'Ask custom follow-up question to branch from selected node...'
                : 'Ask a technical inquiry against the source material...'
            }
            className={`flex-1 rounded-xl border border-white/10 bg-[#13161b] px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#c59a67] font-sans ${
              hasUnresolvedTrap ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            type="submit"
            disabled={hasUnresolvedTrap || !composerInput.trim()}
            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 font-mono text-xs font-bold transition ${
              hasUnresolvedTrap || !composerInput.trim()
                ? 'bg-white/5 border border-white/10 text-slate-600 opacity-50 cursor-not-allowed'
                : 'bg-[#c59a67] text-black hover:bg-[#d4a373] cursor-pointer shadow-md'
            }`}
          >
            <span>SUBMIT INQUIRY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export const InquiryWorkspace: React.FC<InquiryWorkspaceProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvas {...props} />
    </ReactFlowProvider>
  );
};
