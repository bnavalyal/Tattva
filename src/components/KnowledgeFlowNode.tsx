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
    ? 'border-indigo-500 ring-4 ring-indigo-500/15 shadow-lg shadow-indigo-500/10'
    : data.isOnActivePath
    ? 'border-indigo-300 shadow-md shadow-indigo-500/5'
    : isPeer
    ? 'border-teal-200 hover:border-teal-400 shadow-sm'
    : 'border-slate-200 hover:border-slate-300 shadow-sm';

  return (
    <div
      onClick={() => data.onSelectNode?.(data.nodeId)}
      className={`w-[360px] rounded-2xl border bg-white text-left transition-all duration-200 ${containerClasses}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500"
      />

      {/* Top badge bar */}
      <div
        className={`flex items-center justify-between gap-2 rounded-t-2xl border-b px-4 py-2.5 ${
          isRoot
            ? 'border-indigo-100 bg-indigo-50/70'
            : isPeer
            ? 'border-teal-100 bg-teal-50/70'
            : 'border-slate-100 bg-slate-50/80'
        }`}
      >
        <div className="flex items-center gap-2">
          {isRoot ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <Sparkles className="h-3 w-3" />
              Root Inquiry
            </span>
          ) : isPeer ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <Users className="h-3 w-3" />
              Peer Branch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <GitBranch className="h-3 w-3" />
              Depth {data.depth}
            </span>
          )}

          <span className="truncate text-[11px] font-medium text-slate-500">
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
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-indigo-600"
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
              className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-indigo-600"
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
            className="nodrag inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
            Question
          </p>
          <h4 className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
            {data.question}
          </h4>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/75 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">{data.title}</span>
            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/70">
              +{data.creditsEarned} credits
            </span>
          </div>
          <p
            className={`mt-1 text-xs leading-relaxed text-slate-600 ${
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
                <p className="text-[11px] font-semibold text-slate-500">Key Takeaways</p>
                <ul className="space-y-1">
                  {data.takeaways.slice(0, 3).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.references.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <BookOpen className="h-3 w-3 text-slate-400" />
                {data.references.slice(0, 2).map((ref, idx) => (
                  <span
                    key={idx}
                    className="max-w-[260px] truncate rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600"
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
          <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Explore Follow-Ups
              </span>
              <span className="text-[10px] font-medium text-slate-400">
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
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-50'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-900'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                        isExplored
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
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
        className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500"
      />
    </div>
  );
};
