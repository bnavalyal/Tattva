import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  AppView,
  CuriosityTransaction,
  EngineeringVideo,
  InquirySession,
  LearningObjectiveId,
  ThinkForgeUser,
} from '../types/thinkforge';
import { ENGINEERING_VIDEOS } from '../data/engineeringVideos';

interface HomeDashboardViewProps {
  user: ThinkForgeUser;
  inquiries: InquirySession[];
  activeInquiryId: string;
  curiosityCredits: number;
  recentTransactions: CuriosityTransaction[];
  totalNodesExplored: number;
  peerContributionsCount: number;
  onOpenInquiry: (inquiryId: string) => void;
  onStartNewInquiry: (prefill?: {
    subject?: string;
    question?: string;
    objective?: LearningObjectiveId;
  }) => void;
  onLaunchTopicDirectly: (payload: {
    subject: string;
    question: string;
    objective: LearningObjectiveId;
  }) => void;
  onNavigate: (view: AppView) => void;
  onSelectVideo?: (video: EngineeringVideo) => void;
  onConvertVideoToInquiry?: (video: EngineeringVideo) => void;
  onOpenSourceInStudio?: (sourceId: string) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  user: _user,
  inquiries: _inquiries,
  activeInquiryId: _activeInquiryId,
  curiosityCredits,
  recentTransactions: _recentTransactions,
  totalNodesExplored: _totalNodesExplored,
  peerContributionsCount: _peerContributionsCount,
  onOpenInquiry: _onOpenInquiry,
  onStartNewInquiry: _onStartNewInquiry,
  onLaunchTopicDirectly: _onLaunchTopicDirectly,
  onNavigate,
  onSelectVideo,
  onConvertVideoToInquiry: _onConvertVideoToInquiry,
  onOpenSourceInStudio,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');

  const categories = ['All', 'AIML', 'Cybersecurity', 'AIDS', 'Computer Science'];

  const filteredVideos = useMemo(() => {
    return ENGINEERING_VIDEOS.filter((video) => {
      const matchCat = selectedCategory === 'All' || video.category === selectedCategory;
      const matchQuery =
        !videoSearchQuery.trim() ||
        video.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
        video.subtopic.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
        video.keyConcepts.some((c) => c.toLowerCase().includes(videoSearchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, videoSearchQuery]);

  // Concept Matrix items matching Screenshot 1
  const conceptMatrixColumns = [
    {
      num: '01',
      title: 'COMPUTER SYSTEMS',
      items: [
        { name: 'Memory Allocation', status: 'completed', targetSource: 'source-transformers' },
        { name: 'Page Fault Handling', status: 'completed', targetSource: 'source-os-sync' },
        { name: 'Virtual Memory', status: 'completed', targetSource: 'source-os-sync' },
        { name: 'Process Scheduling', status: 'completed', targetSource: 'source-os-sync' },
        { name: 'Cache Coherence', status: 'available', targetSource: 'source-os-sync' },
        { name: 'Kernel Interrupts', status: 'locked', targetSource: null },
      ],
    },
    {
      num: '02',
      title: 'ALGORITHMS & THEORY',
      items: [
        { name: 'Big-O Complexity', status: 'completed', targetSource: 'source-celebrity-problem' },
        { name: 'Graph Traversal', status: 'completed', targetSource: 'source-celebrity-problem' },
        { name: 'B-Tree Rebalancing', status: 'available', targetSource: 'source-celebrity-problem' },
        { name: 'Dynamic Programming', status: 'locked', targetSource: null },
        { name: 'Turing Reducibility', status: 'locked', targetSource: null },
      ],
    },
    {
      num: '03',
      title: 'MATHEMATICAL FOUNDATIONS',
      items: [
        { name: 'RSA Encryption', status: 'completed', targetSource: 'source-rsa-crypto' },
        { name: 'Graph Theory', status: 'completed', targetSource: 'source-pca' },
        { name: 'Linear Algebra', status: 'available', targetSource: 'source-pca' },
        { name: 'Probability Space', status: 'locked', targetSource: null },
        { name: 'Information Entropy', status: 'locked', targetSource: null },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 text-slate-200">
      {/* 1. TOP HERO: "YOUR LEARNING ENVIRONMENT" & "Your thinking leaves evidence." */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-slate-400 uppercase">
          <span>YOUR LEARNING ENVIRONMENT</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
            <span>12 NOV 2026 • SYSTEM: ACTIVE</span>
          </span>
        </div>

        <div>
          <h1 className="font-serif-tattva text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
            Your thinking leaves evidence.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Build deep technical understanding. Challenge your assumptions. Make your intellectual execution visible.
          </p>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD (Matches Screenshot 1 exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: TATTVA 200 CONCEPT MATRIX */}
          <div className="rounded-2xl border border-white/10 bg-[#13161b] p-6 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top Bar with Gold Progress Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-wider text-white uppercase font-sans">
                  TATTVA 200
                </h2>
                <p className="mt-1 text-xs text-slate-400 max-w-lg leading-relaxed">
                  200 concepts. One rigorous path to technical mastery. The essential concepts that distinguish someone who knows the terminology from someone who understands the machinery.
                </p>
              </div>

              <div className="shrink-0 text-right space-y-1.5">
                <div className="font-mono text-xs font-semibold text-slate-300">
                  <span className="text-white font-bold">12</span> / 200 CONCEPTS CONQUERED
                </div>
                <div className="h-1.5 w-36 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#c59a67] transition-all" style={{ width: '14%' }} />
                </div>
              </div>
            </div>

            {/* Concept Matrix 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {conceptMatrixColumns.map((col) => (
                <div key={col.num} className="space-y-2.5">
                  <div className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {col.num} — {col.title}
                  </div>

                  <div className="space-y-1.5">
                    {col.items.map((item, idx) => {
                      const isCompleted = item.status === 'completed';
                      const isAvailable = item.status === 'available';
                      const isLocked = item.status === 'locked';

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (item.targetSource && onOpenSourceInStudio) {
                              onOpenSourceInStudio(item.targetSource);
                            } else {
                              onNavigate('workspace');
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer border ${
                            isCompleted
                              ? 'border-white/10 bg-[#181b22] text-slate-200 hover:border-[#a3e635]/40'
                              : isAvailable
                              ? 'border-[#c59a67]/60 bg-[#1c1917] text-white shadow-xs hover:border-[#c59a67]'
                              : 'border-white/5 bg-[#0e1115] text-slate-600 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium truncate mr-2">{item.name}</span>

                          <div className="shrink-0">
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#a3e635]">
                                <span>COMPLETED</span>
                                <CheckCircle2 className="w-3 h-3 text-[#a3e635]" />
                              </span>
                            )}
                            {isAvailable && (
                              <span className="font-mono text-[10px] font-bold text-[#c59a67] uppercase tracking-wider">
                                AVAILABLE
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500">
                                <span>LOCKED</span>
                                <Lock className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: 3. CONTINUE INQUIRY */}
          <div className="rounded-2xl border border-white/10 bg-[#13161b] p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase tracking-widest">
                3. CONTINUE INQUIRY
              </span>
              <span className="text-slate-400">
                COMPUTER SYSTEMS • 25 MIN SOURCE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif-tattva text-2xl font-normal text-white">
                  Memory Allocation &amp; Arenas
                </h3>
                <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                  Explore allocation strategies, memory lifetime, fragmentation, and arena-based memory management
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Subtle soundwave graphic */}
                <div className="hidden sm:flex items-center gap-0.5 h-8 opacity-40">
                  <div className="w-0.5 h-4 bg-[#c59a67]" />
                  <div className="w-0.5 h-7 bg-[#c59a67]" />
                  <div className="w-0.5 h-5 bg-[#c59a67]" />
                  <div className="w-0.5 h-8 bg-[#c59a67]" />
                  <div className="w-0.5 h-3 bg-[#c59a67]" />
                  <div className="w-0.5 h-6 bg-[#c59a67]" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSourceInStudio) {
                      onOpenSourceInStudio('source-transformers');
                    } else {
                      onNavigate('workspace');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c59a67] px-4 py-2.5 text-xs font-bold text-[#0b0d0f] hover:bg-[#d4a373] transition shadow-md cursor-pointer"
                >
                  <span>RESUME INQUIRY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COGNITIVE STAMINA, LEDGER & RECENT (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* MODULE A: COGNITIVE STAMINA */}
          <div className="rounded-2xl border border-white/10 bg-[#13161b] p-5 shadow-2xl space-y-2">
            <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              COGNITIVE STAMINA
            </div>

            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {(348 + curiosityCredits).toLocaleString()} STAMINA
            </div>

            <div className="text-xs text-slate-400">
              Verified intellectual activity.
            </div>

            <div className="pt-2">
              <span className="inline-block font-mono text-[10px] font-bold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/30 px-2 py-1 rounded">
                [ RESEARCH MODE: ACTIVE (3x MULTIPLIER) ]
              </span>
            </div>
          </div>

          {/* MODULE B: STAMINA LEDGER */}
          <div className="rounded-2xl border border-white/10 bg-[#13161b] p-5 shadow-2xl space-y-3 font-mono">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              STAMINA LEDGER
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                <div>
                  <div className="text-slate-300 font-semibold">0x8A12 • 12 NOV 10:24</div>
                  <div className="text-[10px] text-slate-500">• INQ_INITIATED</div>
                </div>
                <span className="font-bold text-[#a3e635]">+1.0</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                <div>
                  <div className="text-slate-300 font-semibold">0x7B9E • 12 NOV 10:48</div>
                  <div className="text-[10px] text-slate-500">• FOL_EXPLORED</div>
                </div>
                <span className="font-bold text-[#a3e635]">+1.0</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                <div>
                  <div className="text-slate-300 font-semibold">0x9C33 • 11 NOV 16:30</div>
                  <div className="text-[10px] text-slate-500">• RES_SESSION_ML</div>
                </div>
                <span className="font-bold text-[#a3e635]">+3.0</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                <div>
                  <div className="text-slate-300 font-semibold">0xEF10 • 11 NOV 17:15</div>
                  <div className="text-[10px] text-slate-500">• CONC_CONQUERED</div>
                </div>
                <span className="font-bold text-[#a3e635]">+5.0</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <div>
                  <div className="text-slate-300 font-semibold">0xDA23 • 10 NOV 09:12</div>
                  <div className="text-[10px] text-slate-500">• INQ_INITIATED</div>
                </div>
                <span className="font-bold text-[#a3e635]">+1.0</span>
              </div>
            </div>
          </div>

          {/* MODULE C: RECENT INQUIRIES */}
          <div className="rounded-2xl border border-white/10 bg-[#13161b] p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                RECENT INQUIRIES
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#c59a67]" />
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => onNavigate('workspace')}
                className="p-2.5 rounded-xl border border-white/5 bg-[#181b22] hover:border-white/20 transition cursor-pointer"
              >
                <div className="font-medium text-white truncate">
                  Understanding Virtual Memory
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>11 NOV</span>
                  <span className="text-[#a3e635] font-semibold">COMPLETED</span>
                </div>
              </div>

              <div
                onClick={() => onNavigate('workspace')}
                className="p-2.5 rounded-xl border border-white/5 bg-[#181b22] hover:border-white/20 transition cursor-pointer"
              >
                <div className="font-medium text-white truncate">
                  Cache Coherence Protocols
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>10 NOV</span>
                  <span className="text-[#a3e635] font-semibold">COMPLETED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ENGINEERING MASTERCLASS ARCHIVE (Dark Matte Obsidian Cards) */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59a67]" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans">
                Engineering Masterclasses (25m – 1hr)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              University lectures &amp; placement deep-dives across AIML, Cybersecurity, AIDS, and Computer Science.
            </p>
          </div>

          {/* Category filter pills & search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                placeholder="Filter lectures..."
                className="rounded-full border border-white/10 bg-[#13161b] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c59a67]"
              />
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#c59a67] text-[#0b0d0f] font-bold shadow-xs'
                    : 'border border-white/10 bg-[#13161b] text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl border border-white/10 bg-[#13161b] overflow-hidden shadow-xl hover:border-[#c59a67]/50 transition group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div
                  className="relative aspect-video w-full bg-stone-900 cursor-pointer overflow-hidden"
                  onClick={() => onSelectVideo?.(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 rounded bg-black/80 backdrop-blur-xs px-2 py-0.5 font-mono text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#c59a67]" />
                    <span>{video.duration}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-12 h-12 rounded-full bg-[#c59a67] text-[#0b0d0f] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-[#c59a67] font-semibold">{video.subtopic}</span>
                    <span>{video.views}</span>
                  </div>

                  <h3
                    onClick={() => onSelectVideo?.(video)}
                    className="text-sm font-bold text-white group-hover:text-[#c59a67] transition line-clamp-2 cursor-pointer leading-snug"
                  >
                    {video.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 pt-0 border-t border-white/5 mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectVideo?.(video)}
                  className="font-medium text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-[#c59a67]" />
                  <span>Watch Lecture</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('workspace')}
                  className="rounded-lg border border-white/10 bg-[#181b22] px-3 py-1 font-semibold text-slate-200 hover:border-[#c59a67]/60 hover:text-white transition cursor-pointer"
                >
                  Study Source →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
