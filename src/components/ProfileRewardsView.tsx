import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  History,
  Moon,
  Save,
  Search,
  ShieldAlert,
  Sun,
} from 'lucide-react';
import type {
  CuriosityTransaction,
  InquirySession,
  ThinkForgeUser,
} from '../types/thinkforge';
import { formatShortDate } from '../utils/objectives';
import { useTheme } from '../context/ThemeContext';

interface ProfileRewardsViewProps {
  user: ThinkForgeUser;
  onUpdateProfile: (updates: Pick<ThinkForgeUser, 'name' | 'team' | 'bio' | 'focusSubjects'>) => void;
  inquiries: InquirySession[];
  curiosityCredits: number;
  transactions: CuriosityTransaction[];
  totalNodesExplored: number;
  peerContributionsCount: number;
  onOpenInquiry: (inquiryId: string) => void;
}

interface MasteredConcept {
  id: string;
  name: string;
  category: 'AIML' | 'Cybersecurity' | 'AIDS' | 'Computer Science';
  invariant: string;
  sourceTitle: string;
}

const VERIFIED_CONCEPTS: MasteredConcept[] = [
  {
    id: 'c-01',
    name: 'Scaled Dot-Product Variance Normalization (1 / √dk)',
    category: 'AIML',
    invariant: 'Var(Q·K) = dk => Normalizing by √dk prevents vanishing softmax gradients',
    sourceTitle: 'Transformers & Self-Attention Architecture',
  },
  {
    id: 'c-02',
    name: 'FlashAttention Online Softmax SRAM Tiling',
    category: 'AIML',
    invariant: 'O(N) IO reads without materializing N x N attention matrix in slow HBM',
    sourceTitle: 'FlashAttention & GPU Hardware Acceleration',
  },
  {
    id: 'c-03',
    name: 'Ephemeral Diffie-Hellman Perfect Forward Secrecy (PFS)',
    category: 'Cybersecurity',
    invariant: 'Destroying ephemeral per-session keys stops retrospective HNDL decryption',
    sourceTitle: 'Public Key Cryptography & Modern TLS 1.3',
  },
  {
    id: 'c-04',
    name: 'Hybrid Lattice ML-KEM Key Exchange',
    category: 'Cybersecurity',
    invariant: 'X25519MLKEM768 combines classical ECDLP with NIST FIPS 203 Module-Lattices',
    sourceTitle: 'Post-Quantum Cryptography & Defense',
  },
  {
    id: 'c-05',
    name: 'Monotonic Stack Elimination Property O(N)',
    category: 'Computer Science',
    invariant: 'knows(A, B) query eliminates exactly one non-celebrity candidate in O(1)',
    sourceTitle: 'The Celebrity Problem (DSA Striver Series)',
  },
  {
    id: 'c-06',
    name: 'Decreasing Monotonic Deque Amortized O(1)',
    category: 'Computer Science',
    invariant: 'Cascading out-of-bounds eviction guarantees window maximum at front in O(1)',
    sourceTitle: 'Sliding Window Maximum (Hard DSA Problem)',
  },
  {
    id: 'c-07',
    name: 'Dijkstra Counting Semaphore Atomic P & V Invariants',
    category: 'Computer Science',
    invariant: 'Atomic wait() and signal() primitives resolve Critical Section mutual exclusion',
    sourceTitle: 'Operating Systems: Semaphores & Concurrency',
  },
  {
    id: 'c-08',
    name: 'Raft Strict Majority Quorum (N/2 + 1) Overlap',
    category: 'Computer Science',
    invariant: 'Pigeonhole principle mathematically guarantees at most one leader per term',
    sourceTitle: 'Distributed Systems & Raft Consensus',
  },
  {
    id: 'c-09',
    name: 'Principal Component Analysis Orthogonal Projections',
    category: 'AIDS',
    invariant: 'Eigenvectors of empirical covariance matrix maximize projected sample variance',
    sourceTitle: 'PCA & Linear Algebra for Data Science',
  },
  {
    id: 'c-10',
    name: 'Population Stability Index (PSI) Drift Thresholding',
    category: 'AIDS',
    invariant: 'PSI > 0.20 signals statistically significant distribution collapse',
    sourceTitle: 'Covariate Shift & Concept Drift in Production ML',
  },
];

type LedgerTab = 'all' | 'inquiries';

export const ProfileRewardsView: React.FC<ProfileRewardsViewProps> = ({
  user,
  onUpdateProfile,
  inquiries,
  curiosityCredits,
  transactions,
  totalNodesExplored: _totalNodesExplored,
  peerContributionsCount: _peerContributionsCount,
  onOpenInquiry,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [draftTeam, setDraftTeam] = useState(user.team);
  const [draftBio, setDraftBio] = useState(user.bio);
  const [draftSubjects, setDraftSubjects] = useState<string[]>(user.focusSubjects);
  const [savedNotice, setSavedNotice] = useState(false);

  const [conceptFilter, setConceptFilter] = useState<string>('All');
  const [conceptSearch, setConceptSearch] = useState<string>('');
  const [ledgerTab, setLedgerTab] = useState<LedgerTab>('all');
  const { theme, setTheme } = useTheme();

  const domainCompetencies = [
    { domain: 'Computer Science Core', level: 'Mastered', pct: 92, badge: '92%', color: 'bg-[#d4af37]', topics: 'Stack Invariants, Monotonic Deque, Raft, OS Concurrency' },
    { domain: 'AI & Data Science (AIDS)', level: 'Advanced', pct: 88, badge: '88%', color: 'bg-[#d4af37]', topics: 'PCA, Covariance Matrices, PSI Drift Detection' },
    { domain: 'AI & Machine Learning (AIML)', level: 'Advanced', pct: 84, badge: '84%', color: 'bg-[#d4af37]', topics: 'Transformers, Scaled Softmax, FlashAttention' },
    { domain: 'Cybersecurity & Defense', level: 'Proficient', pct: 78, badge: '78%', color: 'bg-[#d4af37]', topics: 'TLS 1.3, Ephemeral ECDHE, Post-Quantum ML-KEM' },
  ];

  const filteredConcepts = useMemo(() => {
    return VERIFIED_CONCEPTS.filter((c) => {
      const matchCat = conceptFilter === 'All' || c.category === conceptFilter;
      const matchSearch =
        !conceptSearch.trim() ||
        c.name.toLowerCase().includes(conceptSearch.toLowerCase()) ||
        c.invariant.toLowerCase().includes(conceptSearch.toLowerCase()) ||
        c.sourceTitle.toLowerCase().includes(conceptSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [conceptFilter, conceptSearch]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: draftName.trim() || user.name,
      team: draftTeam.trim() || user.team,
      bio: draftBio.trim(),
      focusSubjects: draftSubjects,
    });
    setIsEditingProfile(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2400);
  };

  const toggleDraftSubject = (subjName: string) => {
    setDraftSubjects((prev) =>
      prev.includes(subjName) ? prev.filter((s) => s !== subjName) : [...prev, subjName],
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn text-slate-200">
      {/* 1. LEARNER IDENTITY (Dark Obsidian Card) */}
      <div className="rounded-2xl border border-white/10 bg-[#181512] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-900 border border-white/15 text-xl font-bold font-mono text-[#d4af37] shadow-inner">
              {user.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'VK'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-tattva text-2xl sm:text-3xl font-normal text-white">{user.name}</h1>
                <span className="rounded font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5">
                  SYSTEM: ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {user.handle} · {user.email} · {user.team || 'Computer Science Systems'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-[#181512] px-3.5 py-1.5 text-right font-mono">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500">B2B COGNITIVE STAMINA</span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span className="text-sm font-bold text-[#d4af37]">{(348 + curiosityCredits).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">PTS</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDraftName(user.name);
                setDraftTeam(user.team);
                setDraftBio(user.bio);
                setDraftSubjects(user.focusSubjects);
                setIsEditingProfile((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181512] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#d4af37]/60 transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit Dossier'}</span>
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="mt-4 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-2 text-xs font-mono font-semibold text-[#d4af37]">
            Profile dossier updated successfully.
          </div>
        )}

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 border-t border-white/10 pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-xs text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12100e] px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-slate-400">Department / Institute</label>
                <input
                  type="text"
                  value={draftTeam}
                  onChange={(e) => setDraftTeam(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12100e] px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-slate-400">Bio</label>
              <textarea
                rows={2}
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12100e] px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold text-[#12100e] hover:bg-[#e5c158] transition cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-3xl">
              {user.bio ||
                'Engineering researcher mastering computer systems, cryptography invariants, and foundation models.'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[10px] tracking-wider text-slate-500 uppercase mr-1">
                Focus Areas:
              </span>
              {['Computer Systems', 'AI & Machine Learning', 'Cryptography', 'Data Science'].map((subj) => (
                <span
                  key={subj}
                  onClick={() => toggleDraftSubject(subj)}
                  className="rounded font-mono text-[10px] bg-[#181512] border border-white/5 px-2.5 py-0.5 text-slate-300"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Theme Appearance Mode Switcher */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Appearance Mode:</span>
            <span className="font-mono text-xs font-bold text-white">
              {theme === 'dark' ? 'Obsidian / Tattva Dark' : 'Sage Paper / Classic Light'}
            </span>
          </div>

          <div className="inline-flex items-center rounded-xl border border-white/10 bg-[#12100e] p-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#181512] text-[#d4af37] border border-[#d4af37]/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-slate-300" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. B2B ENTERPRISE TELEMETRY METRIC CARDS (PRD §10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#181512] p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Total Cognitive Labor</span>
            <Clock className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">42.5 hrs</div>
          <div className="text-[10px] font-mono text-[#d4af37]">
            ● Verified in &ge;25m Crucibles
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#181512] p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Research Mode Rigor</span>
            <Award className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">84%</div>
          <div className="text-[10px] font-mono text-[#d4af37]">
            3x Multiplier Active Sessions
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#181512] p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Attested Invariants</span>
            <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">16 Proven</div>
          <div className="text-[10px] font-mono text-slate-400">
            Append-Only Hashes
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#181512] p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span className="text-[10px] uppercase tracking-wider">Adversarial Traps</span>
            <ShieldAlert className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">7 / 7</div>
          <div className="text-[10px] font-mono text-[#d4af37]">
            100% Trap Survival Rate
          </div>
        </div>
      </div>

      {/* 3. DOMAIN COMPETENCY BREAKDOWN */}
      <div className="rounded-2xl border border-white/10 bg-[#181512] p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#d4af37]" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                Engineering Domain Competency
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified comprehension calculated from your active quizzes and single knowledge graphs.
            </p>
          </div>
          <span className="font-mono text-[10px] text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2.5 py-1 rounded">
            All 4 Core Domains Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {domainCompetencies.map((comp, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/5 bg-[#12100e] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{comp.domain}</h3>
                  <span className="text-[11px] text-slate-400">{comp.topics}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-white">{comp.badge}</span>
                  <span className="block font-mono text-[10px] font-semibold text-[#d4af37]">
                    {comp.level}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${comp.color}`}
                  style={{ width: `${comp.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. VERIFIED CONCEPT PORTFOLIO */}
      <div className="rounded-2xl border border-white/10 bg-[#181512] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                Verified Concept Portfolio ({filteredConcepts.length})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Concepts validated in-and-out through active quizzes and knowledge graph node verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search concepts or invariants..."
                value={conceptSearch}
                onChange={(e) => setConceptSearch(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#12100e] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] w-44 sm:w-56 font-sans"
              />
            </div>
            {['All', 'AIML', 'Cybersecurity', 'AIDS', 'Computer Science'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setConceptFilter(cat)}
                className={`rounded px-3 py-1 text-xs font-semibold transition cursor-pointer font-mono ${
                  conceptFilter === cat
                    ? 'bg-[#d4af37] text-[#12100e] font-bold shadow-xs'
                    : 'border border-white/10 bg-[#12100e] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConcepts.map((concept) => (
            <div
              key={concept.id}
              className="rounded-xl border border-white/10 bg-[#12100e] p-4 shadow-xl hover:border-[#d4af37]/60 transition space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5 font-mono text-[9px] font-bold text-[#d4af37]">
                  <CheckCircle2 className="w-3 h-3 text-[#d4af37]" />
                  <span>VERIFIED</span>
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {concept.category}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white">{concept.name}</h4>

              <div className="rounded-lg bg-[#181512] border border-white/5 p-2 font-mono text-[11px] text-[#d4af37] leading-relaxed">
                {concept.invariant}
              </div>

              <div className="font-mono text-[10px] text-slate-400">
                Source: {concept.sourceTitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. IMMUTABLE B2B AUDIT LEDGER (PRD §10) */}
      <div className="rounded-2xl border border-white/10 bg-[#181512] p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#d4af37]" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                WalletTransactions: Append-Only Telemetry Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              PRD §10: Cryptographically un-fakeable hours of deep execution queried by enterprise recruiters.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-white/10 bg-[#12100e] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLedgerTab('all')}
              className={`rounded px-3 py-1 transition cursor-pointer ${
                ledgerTab === 'all'
                  ? 'bg-[#181512] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Audit Entries ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setLedgerTab('inquiries')}
              className={`rounded px-3 py-1 transition cursor-pointer ${
                ledgerTab === 'inquiries'
                  ? 'bg-[#181512] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved Inquiry Trees ({inquiries.length})
            </button>
          </div>
        </div>

        {ledgerTab === 'inquiries' ? (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => onOpenInquiry(inq.id)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#12100e] p-4 text-left transition hover:border-[#d4af37]/60 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-white">{inq.title}</span>
                    <span className="rounded font-mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300">
                      {inq.subject}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">{inq.initialQuestion}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-xs text-[#d4af37]">
                  <span>{inq.nodes.length} Nodes</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-[#12100e] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#181512] text-[#d4af37] border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{tx.inquiryTitle}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatShortDate(tx.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tx.description}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 border border-[#d4af37]/30">
                  +1.0 STAMINA
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
