import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { LearningObjectiveId, ThinkForgeUser } from '../types/thinkforge';

interface CreateInquiryViewProps {
  user: ThinkForgeUser;
  initialSubject?: string;
  initialQuestion?: string;
  initialObjective?: LearningObjectiveId;
  onCreateInquiry: (payload: {
    subject: string;
    question: string;
    objective: LearningObjectiveId;
  }) => Promise<void> | void;
  onCancel: () => void;
}

const QUICK_STARTERS = [
  {
    topic: 'Transformers & Scaled Dot-Product Attention',
    category: 'AIML',
    question: 'Why does scaled dot-product attention divide by sqrt(d_k) to prevent vanishing gradients?',
    lens: 'first-principles' as LearningObjectiveId,
  },
  {
    topic: 'The Celebrity Problem & Stack Elimination',
    category: 'Computer Science',
    question: 'How does stack elimination guarantee finding at most one candidate celebrity in O(N)?',
    lens: 'exam-prep' as LearningObjectiveId,
  },
  {
    topic: 'Diffie-Hellman Key Exchange & PFS',
    category: 'Cybersecurity',
    question: 'Why does ephemeral Diffie-Hellman provide perfect forward secrecy while static RSA cannot?',
    lens: 'deep-research' as LearningObjectiveId,
  },
  {
    topic: 'Principal Component Analysis (PCA)',
    category: 'AIDS',
    question: 'Why must dataset features be standardized before computing the covariance matrix in PCA?',
    lens: 'first-principles' as LearningObjectiveId,
  },
  {
    topic: 'OS Semaphores & Deadlock Avoidance',
    category: 'Computer Science',
    question: 'How do Dijkstra counting semaphores break Coffman conditions to prevent circular wait?',
    lens: 'first-principles' as LearningObjectiveId,
  },
];

export const CreateInquiryView: React.FC<CreateInquiryViewProps> = ({
  user: _user,
  initialSubject = 'AI & Machine Learning',
  initialQuestion = '',
  initialObjective = 'first-principles',
  onCreateInquiry,
  onCancel,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [question, setQuestion] = useState(initialQuestion);
  const [objective, setObjective] = useState<LearningObjectiveId>(initialObjective);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
    if (initialSubject) setSubject(initialSubject);
    if (initialObjective) setObjective(initialObjective);
  }, [initialQuestion, initialSubject, initialObjective]);

  const categories = [
    { id: 'AI & Machine Learning', label: 'AIML' },
    { id: 'Cybersecurity & Defense', label: 'Cybersecurity' },
    { id: 'AI & Data Science', label: 'AIDS' },
    { id: 'Computer Science Core', label: 'Computer Science' },
  ];

  const focusLenses: { id: LearningObjectiveId; label: string; icon: typeof Compass; hint: string }[] = [
    {
      id: 'first-principles',
      label: 'First Principles',
      icon: Compass,
      hint: 'Deconstruct fundamental laws & math invariants',
    },
    {
      id: 'exam-prep',
      label: 'Interview & Code',
      icon: Code2,
      hint: 'DSA algorithms, time complexity, & coding edge cases',
    },
    {
      id: 'deep-research',
      label: 'Deep Research',
      icon: BookOpen,
      hint: 'Seminal papers, architectural bottlenecks & failure modes',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuestion = question.trim();
    const trimmedSubject = subject.trim() || 'General Inquiry';

    if (trimmedQuestion.length < 6) {
      setErrorMsg('Please enter a specific concept, question, or paste a link (at least 6 characters).');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    try {
      await onCreateInquiry({
        subject: trimmedSubject,
        question: trimmedQuestion,
        objective,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 text-slate-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#181512] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#d4af37] fill-current" />
            <span>TATTVA Knowledge Studio Launcher</span>
          </span>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="rounded-2xl border border-white/10 bg-[#181512] p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Header Message */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-serif-tattva text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">
            What engineering concept or problem do you want to master?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Type any question, topic, or paste a link. TATTVA immediately launches your dedicated Work Studio with active quizzes, formulas, notes, and a single knowledge graph.
          </p>
        </div>

        {/* Central Command Input Box */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/15 focus-within:border-[#d4af37] bg-[#12100e] shadow-xl transition-all overflow-hidden">
            {/* Textarea */}
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Why does scaled dot-product attention divide by sqrt(d_k)? Or paste: https://youtube.com/watch?v=... / arXiv link"
              className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed font-sans"
              autoFocus
            />

            {/* Bottom Toolbar */}
            <div className="border-t border-white/10 bg-[#181512] px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                  DOMAIN:
                </span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded border border-white/10 bg-[#12100e] px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] text-slate-500 font-mono">
                  Cmd/Ctrl + Enter ↵
                </span>

                <button
                  type="submit"
                  disabled={isGenerating || question.trim().length < 6}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-[#12100e] px-5 py-2 text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Launch Work Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3 text-xs font-mono text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Minimal 3-Option Focus Mode Switcher */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Study Lens
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {focusLenses.find((l) => l.id === objective)?.hint}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {focusLenses.map((lens) => {
                const isSelected = objective === lens.id;
                const Icon = lens.icon;
                return (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => setObjective(lens.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-[#d4af37] bg-[#181512] text-white ring-1 ring-[#d4af37]/40'
                        : 'border-white/10 bg-[#12100e] text-slate-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#d4af37] text-[#12100e]' : 'bg-[#181512] text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{lens.label}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Quick Inspiration Chips */}
        <div className="border-t border-white/10 pt-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Or launch directly from a popular masterclass topic:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_STARTERS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(starter.category);
                  setQuestion(starter.question);
                  setObjective(starter.lens);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#12100e] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:border-[#d4af37] hover:text-white transition cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span>{starter.topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features Indicator footer */}
        <div className="border-t border-white/10 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-[11px] text-slate-400">
          <div className="flex items-center justify-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Single Knowledge Graph</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Active Concept Quizzes</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Formulas &amp; Notes</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Research Papers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
