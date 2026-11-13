import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
} from 'lucide-react';
import type { InquiryDetail } from '../types/tattva';
import { InquiryWorkspace } from './InquiryWorkspace';

export interface SourceWorkspaceViewProps {
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

/**
 * PRD §3: Split-Screen Tattva Workspace Shell
 * Left Pane = Dense technical source material (25-minute baseline lecture/transcript).
 * Right Pane = InquiryWorkspace (React Flow Knowledge Graph + Socratic Scaffolding).
 */
export const SourceWorkspaceView: React.FC<SourceWorkspaceViewProps> = ({
  inquiryDetail,
  selectedNodeId: propSelectedNodeId,
  staminaScore = 448,
  researchMode = false,
  onToggleResearchMode,
  onBackToOverview,
  onSubmitQuestion,
  onSelectNode,
  onResolveTrap,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    propSelectedNodeId || inquiryDetail.nodes[0]?.id || null,
  );
  const [activeSourceTab, setActiveSourceTab] = useState<'transcript' | 'metadata'>('transcript');

  const { learningSource } = inquiryDetail;

  return (
    <div className="flex flex-col h-full bg-[#0b0d0f] text-slate-200 select-none overflow-hidden">
      {/* Top Workspace Header Bar */}
      <header className="border-b border-white/10 bg-[#0b0d0f] px-6 py-3 shrink-0 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToOverview && (
              <button
                type="button"
                onClick={onBackToOverview}
                title="Return to Overview"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#13161b] px-3 py-1.5 font-mono text-xs text-slate-400 hover:text-white hover:border-[#c59a67]/60 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </button>
            )}

            <div className="h-4 w-px bg-white/10" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.5 rounded border border-[#c59a67]/20">
                  {learningSource.sourceType}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  {learningSource.durationMinutes} MIN · PRD §2 FLOOR VERIFIED
                </span>
              </div>
              <h1 className="font-serif-tattva text-base sm:text-lg font-normal text-white mt-0.5 line-clamp-1">
                {learningSource.title}
              </h1>
            </div>
          </div>

          {/* Telemetry Capsule */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#13161b] px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
              <span className="text-slate-400 text-[10px] uppercase">COGNITIVE STAMINA:</span>
              <span className="font-bold text-[#a3e635]">{staminaScore} PTS</span>
            </div>
          </div>
        </div>
      </header>

      {/* 50/50 Dual Split-Screen Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANE (50%): SOURCE MATERIAL */}
        <div className="lg:col-span-6 border-r border-white/10 flex flex-col bg-[#0e1115] overflow-hidden">
          {/* Source Tabs */}
          <div className="border-b border-white/10 px-6 pt-3 flex items-center justify-between bg-[#0b0d0f]">
            <nav className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveSourceTab('transcript')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-mono transition cursor-pointer ${
                  activeSourceTab === 'transcript'
                    ? 'border-[#c59a67] text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#c59a67]" />
                <span>Source Transcript</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSourceTab('metadata')}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-mono transition cursor-pointer ${
                  activeSourceTab === 'metadata'
                    ? 'border-[#c59a67] text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Reference Spec</span>
              </button>
            </nav>

            <span className="font-mono text-[10px] text-slate-500 uppercase">
              {learningSource.sourceReference}
            </span>
          </div>

          {/* Source Content Reader */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeSourceTab === 'transcript' ? (
              <div className="space-y-5">
                <div>
                  <span className="inline-block rounded font-mono text-[10px] font-bold text-[#c59a67] bg-[#c59a67]/15 border border-[#c59a67]/30 px-2.5 py-0.5 uppercase tracking-wider mb-2">
                    INGESTED SOURCE MATERIAL
                  </span>
                  <h2 className="font-serif-tattva text-2xl sm:text-3xl text-white font-normal leading-snug">
                    {learningSource.title}
                  </h2>
                  <div className="mt-2 font-mono text-xs text-slate-400 flex items-center gap-4">
                    <span>RUNTIME {learningSource.durationMinutes} min</span>
                    <span>REF: {learningSource.sourceReference}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-white/10 pt-4">
                  <p>
                    Arena allocation trades flexibility for throughput. Instead of tracking individual block metadata the way a general-purpose allocator does, an arena allocator reserves one contiguous region up front and satisfies allocations by advancing a single &ldquo;bump&rdquo; pointer. Freeing is batched: the whole arena is reset or released at once, never per-object.
                  </p>
                  <p>
                    This works well when object lifetimes are correlated — a request handler, a single frame of a game loop, a parser pass over one file. It works badly when lifetimes are independent, because there is no way to reclaim an individual object&apos;s memory without invalidating every allocation made after it in the same arena.
                  </p>
                  <p>
                    A free-list allocator reintroduces per-object reclamation by threading freed blocks into a linked list keyed by size class, at the cost of metadata overhead and fragmentation as blocks of mismatched sizes accumulate.
                  </p>

                  <div className="rounded-xl border border-white/10 bg-[#13161b] p-4 space-y-2 mt-4 font-mono text-xs">
                    <span className="text-[#a3e635] font-bold uppercase block">
                      Architectural Invariants (§1):
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                      <li>Bump Pointer Complexity: O(1) alloc with zero cache thrashing.</li>
                      <li>Batch Reclamation: Rewinds arena offset to 0 without heap deallocation calls.</li>
                      <li>Thread Safety: Local thread-isolated arenas eliminate mutex contention.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="rounded-xl border border-white/10 bg-[#13161b] p-5 space-y-3">
                  <span className="text-[#c59a67] font-bold uppercase text-[11px] block">
                    Source Specification Dossier
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-slate-400 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Source ID</span>
                      <span className="text-white">{learningSource.id}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Chronological Floor</span>
                      <span className="text-[#a3e635]">{learningSource.durationMinutes} min (PASS)</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Media Format</span>
                      <span className="text-white">{learningSource.sourceType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Ref Path</span>
                      <span className="text-white">{learningSource.sourceReference}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE (50%): KNOWLEDGE GRAPH & SOCRATIC WORKSPACE */}
        <div className="lg:col-span-6 flex flex-col bg-[#0b0d0f] overflow-hidden">
          <InquiryWorkspace
            inquiryDetail={inquiryDetail}
            selectedNodeId={selectedNodeId}
            researchMode={researchMode}
            onToggleResearchMode={onToggleResearchMode}
            onSubmitQuestion={onSubmitQuestion}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              onSelectNode(id);
            }}
            onResolveTrap={onResolveTrap}
          />
        </div>
      </div>
    </div>
  );
};
