import React, { useState } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  GitBranch,
  MessageSquarePlus,
  Sparkles,
  Users,
} from 'lucide-react';
import type { InquiryNodeData } from '../types/thinkforge';

type FlowInquiryNode = Node<InquiryNodeData>;

export const KnowledgeFlowNode: React.FC<NodeProps<FlowInquiryNode>> = ({
  data,
  selected,
}) => {
  const [expanded, setExpanded] = useState(data.depth === 0);

  const isSelected = Boolean(selected || data.isSelected);
  const isPeer = data.kind === 'peer' || Boolean(data.isPeerContribution);
  const isRoot = data.kind === 'root';

  const containerClasses = isSelected
    ? 'border-[#d4af37] ring-4 ring-[#d4af37]/20 shadow-lg shadow-[#d4af37]/10'
    : data.isOnActivePath
    ? 'border-[#d4af37]/60 shadow-md shadow-[#d4af37]/5'
    : isPeer
    ? 'border-[#c87d55]/40 hover:border-[#c87d55] shadow-sm'
    : 'border-[#2e2822] hover:border-[#a3988c] shadow-sm';

  return (
    <div
      onClick={() => data.onSelectNode?.(data.nodeId)}
      className={`w-[360px] rounded-2xl border bg-[#181512] text-[#f3efea] text-left transition-all duration-200 ${containerClasses}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-[#181512] !bg-[#d4af37]"
      />

      {/* Top badge bar */}
      <div
        className={`flex items-center justify-between gap-2 rounded-t-2xl border-b px-4 py-2.5 ${
          isRoot
            ? 'border-[#d4af37]/20 bg-[#d4af37]/10'
            : isPeer
            ? 'border-[#c87d55]/20 bg-[#c87d55]/10'
            : 'border-[#2e2822] bg-[#221e1a]'
        }`}
      >
        <div className="flex items-center gap-2">
          {isRoot ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37] px-2.5 py-0.5 text-[11px] font-bold text-black">
              <Sparkles className="h-3 w-3" />
              Root Inquiry
            </span>
          ) : isPeer ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c87d55] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <Users className="h-3 w-3" />
              Peer Branch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2e2822] px-2.5 py-0.5 text-[11px] font-semibold text-[#f3efea]">
              <GitBranch className="h-3 w-3 text-[#d4af37]" />
              Depth {data.depth}
            </span>
          )}

          <span className="truncate text-[11px] font-medium text-[#a3988c]">
            {data.authorHandle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {data.onFocusNode && (
            <button
              type="button"
              title="Center graph on this node"
              onClick={(e) => {
                e.stopPropagation();
                data.onFocusNode?.(data.nodeId);
              }}
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-[#a3988c] transition hover:bg-[#221e1a] hover:text-[#d4af37]"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
          )}
          {data.onBranchFromNode && (
            <button
              type="button"
              title="Ask a custom follow-up from this node"
              onClick={(e) => {
                e.stopPropagation();
                data.onBranchFromNode?.(data.nodeId);
              }}
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-[#a3988c] transition hover:bg-[#221e1a] hover:text-[#d4af37]"
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
            className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-[#a3988c] transition hover:bg-[#221e1a] hover:text-[#f3efea]"
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main question & synthesized title */}
      <div className="space-y-2.5 px-4 py-3.5">
        <div>
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wide text-[#d4af37]">
            Question
          </p>
          <h4 className="mt-0.5 text-sm font-semibold leading-snug text-[#f3efea]">
            {data.question}
          </h4>
        </div>

        <div className="rounded-xl border border-[#2e2822] bg-[#221e1a] px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#f3efea]">{data.title}</span>
            <span className="shrink-0 rounded-full bg-[#d4af37]/12 px-2 py-0.5 text-[10px] font-semibold text-[#d4af37] border border-[#d4af37]/30">
              +{data.creditsEarned} credits
            </span>
          </div>
          <p
            className={`mt-1 text-xs leading-relaxed text-[#a3988c] ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {data.explanation}
          </p>
        </div>

        {expanded && (
          <div className="space-y-2 pt-0.5">
            {data.takeaways.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-[#a3988c]">Key Takeaways</p>
                <ul className="space-y-1">
                  {data.takeaways.slice(0, 3).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] leading-snug text-[#a3988c]"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.references.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <BookOpen className="h-3 w-3 text-[#73685d]" />
                {data.references.slice(0, 2).map((ref, idx) => (
                  <span
                    key={idx}
                    className="max-w-[260px] truncate rounded-md border border-[#2e2822] bg-[#181512] px-2 py-0.5 text-[10px] font-medium text-[#a3988c]"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contextual follow-up branches */}
        {data.onSelectFollowUp && (
          <div className="space-y-1.5 border-t border-[#2e2822] pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#73685d]">
                Explore Follow-Ups
              </span>
              <span className="text-[10px] font-mono text-[#a3988c]">
                {data.usedFollowUps.length}/3 explored
              </span>
            </div>
            <div className="space-y-1.5">
              {data.followUps.map((followUp, idx) => {
                const isExplored = data.usedFollowUps.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onSelectFollowUp?.(data.nodeId, idx as 0 | 1 | 2, followUp);
                    }}
                    className={`nodrag flex w-full items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] leading-snug transition ${
                      isExplored
                        ? 'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]'
                        : 'border-[#2e2822] bg-[#181512] text-[#a3988c] hover:border-[#d4af37] hover:text-[#f3efea] hover:bg-[#221e1a]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        isExplored
                          ? 'bg-[#f59e0b] text-black'
                          : 'bg-[#221e1a] text-[#d4af37]'
                      }`}
                    >
                      {isExplored ? <CheckCircle2 className="h-3 w-3" /> : `0${idx + 1}`}
                    </span>
                    <span className="line-clamp-2 flex-1 font-medium">{followUp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-[#181512] !bg-[#d4af37]"
      />
    </div>
  );
};
