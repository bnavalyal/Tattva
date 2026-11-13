import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export interface CreateInquiryViewProps {
  initialQuestion?: string;
  initialSourceId?: string;
  onCreateInquiry: (payload: {
    question: string;
    learningSourceId: string;
    researchMode: boolean;
  }) => void;
  onCancel: () => void;
}

const CURATED_SOURCES = [
  {
    id: 'src-arena-allocators',
    title: 'Memory Arena Allocators: Design and Trade-offs',
    duration: '38 min',
    sourceType: 'transcript',
    topic: 'Computer Systems',
    sampleQuestion: 'What would escape analysis need to prove for an allocation to be arena-eligible?',
  },
  {
    id: 'src-transformers-attention',
    title: 'Transformers & Self-Attention Architecture',
    duration: '32 min',
    sourceType: 'video',
    topic: 'AI & Machine Learning',
    sampleQuestion: 'Why is scaled dot-product attention divided by sqrt(d_k) to prevent vanishing gradients?',
  },
  {
    id: 'src-tls-forward-secrecy',
    title: 'TLS 1.3 Ephemeral Diffie-Hellman & Forward Secrecy',
    duration: '45 min',
    sourceType: 'document',
    topic: 'Cybersecurity',
    sampleQuestion: 'Why did TLS 1.3 remove static RSA key transport in favor of ephemeral ECDHE?',
  },
];

/**
 * PRD-aligned Question & Inquiry Composer (Part 3)
 * Selects a 25-minute verified technical source and composes the initial Root Question.
 */
export const CreateInquiryView: React.FC<CreateInquiryViewProps> = ({
  initialQuestion = '',
  initialSourceId = 'src-arena-allocators',
  onCreateInquiry,
  onCancel,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialSourceId);
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [researchMode, setResearchMode] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    onCreateInquiry({
      question: question.trim(),
      learningSourceId: selectedSourceId,
      researchMode,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 text-slate-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#13161b] px-3 py-1.5 font-mono text-xs text-slate-400 hover:text-white hover:border-[#c59a67]/60 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        <span className="font-mono text-[10px] font-bold text-[#c59a67] uppercase tracking-wider bg-[#c59a67]/10 px-2.5 py-0.5 rounded border border-[#c59a67]/30">
          PRD §1 &middot; Process of Inquiry
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h1 className="font-serif-tattva text-3xl text-white font-normal">
            Launch Technical Inquiry
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
            Attach your inquiry to a verified, high-friction technical source (&ge;25 min baseline). Asking your root question begins your branching Knowledge Graph.
          </p>
        </div>

        {/* Step 1: Select Curated Source */}
        <div className="space-y-2">
          <label className="block font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Select Curated Learning Source (&ge;25 Min Floor)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {CURATED_SOURCES.map((src) => {
              const isSelected = selectedSourceId === src.id;

              return (
                <div
                  key={src.id}
                  onClick={() => {
                    setSelectedSourceId(src.id);
                    if (!question.trim()) {
                      setQuestion(src.sampleQuestion);
                    }
                  }}
                  className={`rounded-xl border p-4 text-left transition cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'border-[#c59a67] bg-[#181b22] ring-2 ring-[#c59a67]/20 shadow-md'
                      : 'border-white/10 bg-[#13161b] hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#c59a67] uppercase bg-[#c59a67]/10 px-2 py-0.2 rounded border border-[#c59a67]/20">
                        {src.topic}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {src.duration}
                      </span>
                    </div>
                    <div className="font-serif-tattva text-base text-white">{src.title}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      Sample: &ldquo;{src.sampleQuestion}&rdquo;
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-[#c59a67] bg-[#c59a67]' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Compose Question */}
        <div className="space-y-2">
          <label className="block font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Compose Root Question
          </label>
          <textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What technical mechanism, edge-case, or mathematical invariant would you like to investigate?"
            className="w-full rounded-xl border border-white/10 bg-[#13161b] p-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-[#c59a67] font-sans leading-relaxed"
            required
          />
        </div>

        {/* Step 3: Research Mode Toggle */}
        <div className="rounded-xl border border-white/10 bg-[#13161b] p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white uppercase">
                Research Mode (§7)
              </span>
              <span className="rounded bg-[#a3e635]/15 border border-[#a3e635]/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#a3e635]">
                3x Stamina Multiplier
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Forbids direct AI summaries. Instructs the backend to respond with Socratic counter-questions and citations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setResearchMode((prev) => !prev)}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              researchMode ? 'bg-[#a3e635] justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black shadow-md" />
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!question.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c59a67] px-6 py-3 font-mono text-xs font-bold text-black hover:bg-[#d4a373] transition cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>INGEST SOURCE &amp; GENERATE ROOT NODE</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </form>
    </div>
  );
};
