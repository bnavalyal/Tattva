import React from 'react';
import {
  ArrowRight,
  Clock,
  GitBranch,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { Inquiry } from '../types/tattva';

export interface HomeDashboardViewProps {
  inquiries: Inquiry[];
  onSelectInquiry: (inquiryId: string) => void;
  onStartNewInquiry: () => void;
}

/**
 * PRD-aligned Minimal Home Landing View (Part 3)
 * Welcome/hero block + "Start a new inquiry" CTA + Learner's existing inquiries list.
 */
export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  inquiries,
  onSelectInquiry,
  onStartNewInquiry,
}) => {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 text-slate-200">
      {/* 1. Hero Block: Serif + Gold Visual Identity */}
      <div className="space-y-4 text-left border-b border-white/10 pb-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-[#c59a67] uppercase tracking-wider bg-[#c59a67]/10 px-2.5 py-0.5 rounded border border-[#c59a67]/30">
            INTELLECTUAL EXECUTION PLATFORM
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="font-mono text-xs text-slate-400">
            SYSTEM: ACTIVE
          </span>
        </div>

        <h1 className="font-serif-tattva text-4xl sm:text-5xl text-white font-normal tracking-tight leading-tight">
          Your thinking leaves evidence.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-sans">
          Build deep technical understanding. Challenge your assumptions. Every inquiry you launch grows a persistent, branching knowledge graph tested against adversarial misconceptions.
        </p>

        {/* Primary CTA */}
        <div className="pt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={onStartNewInquiry}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c59a67] px-5 py-3 font-mono text-xs font-bold text-black hover:bg-[#d4a373] transition cursor-pointer shadow-lg shadow-black/40"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>START A NEW INQUIRY</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* 2. Learner's Inquiries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#c59a67]" />
            <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Your Active Knowledge Graphs ({inquiries.length})
            </h2>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Select an inquiry to enter split-screen workspace
          </span>
        </div>

        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#13161b]/50 p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
              <Sparkles className="w-5 h-5 text-[#c59a67]" />
            </div>
            <p className="text-sm text-slate-300 font-medium">No inquiries initiated yet.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select &ldquo;Start a new inquiry&rdquo; above to ingest a technical learning source and begin your first-principles crucible.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => {
              const formattedDate = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={inquiry.id}
                  onClick={() => onSelectInquiry(inquiry.id)}
                  className="rounded-2xl border border-white/10 bg-[#13161b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#c59a67]/60 transition-all duration-200 cursor-pointer shadow-md group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.5 rounded border border-[#c59a67]/20">
                        INQUIRY
                      </span>
                      <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-serif-tattva text-lg text-white font-normal group-hover:text-[#c59a67] transition">
                      {inquiry.title || 'Untitled Technical Inquiry'}
                    </h3>

                    <div className="font-mono text-[11px] text-slate-500">
                      Learning Source Ref: {inquiry.learningSourceId}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 font-mono text-xs font-semibold text-[#c59a67] group-hover:translate-x-1 transition-transform">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
