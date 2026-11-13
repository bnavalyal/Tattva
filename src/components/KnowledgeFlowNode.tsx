import React, { useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  GitBranch,
  MessageSquarePlus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { FollowUpQuestion, QuestionNode } from '../types/tattva';

export interface KnowledgeFlowNodeData extends QuestionNode {
  [key: string]: unknown;
  nodeId: string;
  depth?: number;
  isSelected?: boolean;
  isOnActivePath?: boolean;
  onSelectNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onBranchFromNode?: (nodeId: string) => void;
  onSelectFollowUp?: (nodeId: string, followUp: FollowUpQuestion) => void;
  onResolveTrap?: (nodeId: string) => void;
}

export type FlowQuestionNodeType = Node<KnowledgeFlowNodeData>;

export const KnowledgeFlowNode: React.FC<NodeProps<FlowQuestionNodeType>> = ({
  data,
  selected,
}) => {
  const [expanded, setExpanded] = useState(true);

  const isSelected = Boolean(selected || data.isSelected);
  const isRoot = data.parentNodeId === null;
  const isUnresolvedTrap = Boolean(data.isTrap && !data.trapResolvedAt);
  const isResolvedTrap = Boolean(data.isTrap && data.trapResolvedAt);

  // Dynamic styling based on trap / selection states
  const containerClasses = isUnresolvedTrap
    ? 'border-red-500/80 bg-[#160c0e] ring-4 ring-red-500/20 shadow-2xl shadow-red-950/50'
    : isSelected
    ? 'border-[#c59a67] ring-4 ring-[#c59a67]/20 shadow-xl shadow-black/60 bg-[#13161b]'
    : data.isOnActivePath
    ? 'border-[#c59a67]/50 shadow-md bg-[#13161b]'
    : 'border-white/10 hover:border-white/20 bg-[#13161b] shadow-md';

  return (
    <div
      onClick={() => data.onSelectNode?.(data.nodeId)}
      className={`w-[380px] rounded-2xl border text-left transition-all duration-200 select-none ${containerClasses}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!h-3 !w-3 !border-2 !border-[#0b0d0f] ${
          isUnresolvedTrap ? '!bg-red-500' : '!bg-[#c59a67]'
        }`}
      />

      {/* Top Header / Badge Bar */}
      <div
        className={`flex items-center justify-between gap-2 rounded-t-2xl border-b px-4 py-2.5 ${
          isUnresolvedTrap
            ? 'border-red-500/30 bg-red-950/40 text-red-200'
            : isRoot
            ? 'border-white/10 bg-[#181b22] text-white'
            : 'border-white/10 bg-[#0e1115] text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isUnresolvedTrap ? (
            <span className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-bold uppercase bg-red-500 text-black px-2 py-0.5 animate-pulse">
              <ShieldAlert className="h-3 w-3" />
              Be Careful Here!! (§5)
            </span>
          ) : isResolvedTrap ? (
            <span className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-bold text-[#a3e635] bg-[#a3e635]/15 border border-[#a3e635]/30 px-2 py-0.5">
              <CheckCircle2 className="h-3 w-3" />
              Trap Overcome
            </span>
          ) : isRoot ? (
            <span className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-bold text-[#c59a67] bg-[#c59a67]/15 border border-[#c59a67]/30 px-2 py-0.5 uppercase">
              <Sparkles className="h-3 w-3" />
              Root Inquiry
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded font-mono text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5">
              <GitBranch className="h-3 w-3 text-[#c59a67]" />
              Branch Depth {data.depth ?? 1}
            </span>
          )}

          {data.researchMode && (
            <span className="rounded font-mono text-[9px] font-bold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/25 px-1.5 py-0.5 uppercase">
              3x Research
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {data.onFocusNode && (
            <button
              type="button"
              title="Center graph on this node"
              onClick={(e) => {
                e.stopPropagation();
                data.onFocusNode?.(data.nodeId);
              }}
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
          )}

          {data.onBranchFromNode && !isUnresolvedTrap && (
            <button
              type="button"
              title="Ask custom question branching from here"
              onClick={(e) => {
                e.stopPropagation();
                data.onBranchFromNode?.(data.nodeId);
              }}
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-[#c59a67] transition cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            title={expanded ? 'Collapse details' : 'Expand details'}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="nodrag inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Node Content */}
      <div className="space-y-3 p-4">
        {/* User Question */}
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#c59a67]">
            Question
          </span>
          <h4 className="font-serif-tattva text-sm sm:text-base font-normal text-white mt-0.5 leading-snug">
            {data.userQuestion}
          </h4>
        </div>

        {/* PRD §5 Adversarial Trap Alert Banner */}
        {isUnresolvedTrap && data.trapMetadata && (
          <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-3 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-red-300 uppercase">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>Misconception: {data.trapMetadata.misconceptionType}</span>
            </div>
            <p className="text-xs text-red-200 leading-relaxed font-sans">
              {data.trapMetadata.scenario}
            </p>
            {data.onResolveTrap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onResolveTrap?.(data.nodeId);
                }}
                className="nodrag w-full mt-1.5 rounded-lg bg-red-500 px-3 py-1.5 font-mono text-xs font-bold text-black hover:bg-red-400 transition cursor-pointer"
              >
                Reason Through Invariant &amp; Unlock →
              </button>
            )}
          </div>
        )}

        {/* AI Explanation / Socratic Response */}
        <div className="rounded-xl border border-white/5 bg-[#0e1115] p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>{data.researchMode ? 'SOCRATIC MENTOR GUIDANCE' : 'SYNTHESIZED EXPLANATION'}</span>
            <span>{new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <p
            className={`text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {data.aiExplanation}
          </p>
        </div>

        {/* PRD §3: Exactly 3 Adaptive Follow-Ups */}
        {data.followUps && data.followUps.length > 0 && (
          <div className="space-y-1.5 border-t border-white/10 pt-2.5">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase">
              <span>Adaptive Follow-Ups (§3)</span>
              <span>{data.followUps.filter((f) => f.isSelected || f.childNodeId).length}/3 Branched</span>
            </div>

            {isUnresolvedTrap ? (
              <div className="rounded-lg border border-red-500/20 bg-red-950/30 p-2 text-center text-[10px] font-mono text-red-300">
                Follow-ups locked until you resolve the adversarial trap above.
              </div>
            ) : (
              <div className="space-y-1.5">
                {data.followUps.map((followUp) => {
                  const isBranched = Boolean(followUp.isSelected || followUp.childNodeId);

                  return (
                    <button
                      key={followUp.id}
                      type="button"
                      disabled={isBranched}
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onSelectFollowUp?.(data.nodeId, followUp);
                      }}
                      className={`nodrag flex w-full items-start gap-2 rounded-xl border p-2 text-left text-xs leading-relaxed transition ${
                        isBranched
                          ? 'border-[#a3e635]/30 bg-[#a3e635]/10 text-slate-300 opacity-80 cursor-default'
                          : 'border-white/10 bg-[#0e1115] text-slate-300 hover:border-[#c59a67] hover:text-white hover:bg-[#181b22] cursor-pointer'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-4 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
                          isBranched
                            ? 'bg-[#a3e635] text-black'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isBranched ? <CheckCircle2 className="h-3 w-3" /> : `0${followUp.position}`}
                      </span>
                      <span className="line-clamp-2 flex-1">{followUp.questionText}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`!h-3 !w-3 !border-2 !border-[#0b0d0f] ${
          isUnresolvedTrap ? '!bg-red-500' : '!bg-[#c59a67]'
        }`}
      />
    </div>
  );
};
