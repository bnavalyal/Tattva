import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Search,
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
import { TypographicJournalCover } from './TypographicJournalCover';

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
  onEnrollSource?: (sourceId: string) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  user: _user,
  inquiries: _inquiries,
  activeInquiryId: _activeInquiryId,
  curiosityCredits: _curiosityCredits,
  recentTransactions: _recentTransactions,
  totalNodesExplored: _totalNodesExplored,
  peerContributionsCount: _peerContributionsCount,
  onOpenInquiry: _onOpenInquiry,
  onStartNewInquiry: _onStartNewInquiry,
  onLaunchTopicDirectly: _onLaunchTopicDirectly,
  onNavigate,
  onSelectVideo: _onSelectVideo,
  onConvertVideoToInquiry: _onConvertVideoToInquiry,
  onOpenSourceInStudio,
  onEnrollSource,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [enrolledNotice, setEnrolledNotice] = useState<string | null>(null);

  const categories = [
    { id: 'All', label: 'All Disciplines' },
    { id: 'Computer Science', label: 'Computer Systems & OS' },
    { id: 'Cybersecurity', label: 'Cybersecurity & Defense' },
    { id: 'AIML', label: 'AI & Machine Learning' },
    { id: 'AIDS', label: 'AI & Data Science' },
  ];

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

  const handleEnroll = (video: EngineeringVideo) => {
    const targetSourceId =
      video.category === 'AIML'
        ? 'source-transformers'
        : video.category === 'Cybersecurity'
        ? 'source-rsa-crypto'
        : video.category === 'AIDS'
        ? 'source-pca'
        : 'source-os-sync';

    onEnrollSource?.(targetSourceId);
    setEnrolledNotice(`Enrolled "${video.title.slice(0, 42)}..." into your Workspace.`);
    setTimeout(() => setEnrolledNotice(null), 3500);
  };

  const handleLaunchCrucible = (video: EngineeringVideo) => {
    const targetSourceId =
      video.category === 'AIML'
        ? 'source-transformers'
        : video.category === 'Cybersecurity'
        ? 'source-rsa-crypto'
        : video.category === 'AIDS'
        ? 'source-pca'
        : 'source-os-sync';

    if (onOpenSourceInStudio) {
      onOpenSourceInStudio(targetSourceId);
    } else {
      onNavigate('workspace');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 text-slate-200">
      {/* 1. TOP EDITORIAL HERO (Simple, Focused Community Hub) */}
      <div className="border-b border-white/10 pb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-[#d4af37] uppercase tracking-wider bg-[#d4af37]/10 px-2.5 py-0.5 rounded border border-[#d4af37]/30">
            PRD §2 · The 25-Minute Baseline Constraint
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs font-mono text-slate-400">
            Community Knowledge Crucible
          </span>
        </div>

        <h1 className="font-serif-tattva text-3xl sm:text-4xl text-white font-normal tracking-tight">
          Where Engineering Rigor Meets First Principles.
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Tattva strictly rejects 60-second shorts and superficial tutorials. Every lecture below meets our mandatory 25-minute chronological floor, designed for GATE aspirants, ISRO scholars, and elite systems engineers dissecting compilers, memory safety, and foundation models.
        </p>

        {/* Global telemetry invariant strip */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <strong className="text-white">18+</strong> Verified Masterclasses
          </span>
          <span>·</span>
          <span>PRD §9 Standardized Academic Covers</span>
          <span>·</span>
          <span>Append-Only Telemetry Active</span>
        </div>
      </div>

      {/* Enrolled toast notification */}
      {enrolledNotice && (
        <div className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-3 text-xs font-mono text-[#d4af37] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
            <span>{enrolledNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('workspace')}
            className="underline font-bold hover:text-white cursor-pointer ml-4"
          >
            Go to My Workspace →
          </button>
        </div>
      )}

      {/* 2. CATEGORY FILTERS & BRACKETED SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-mono transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] font-bold shadow-xs'
                  : 'border-white/10 bg-[#181512] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={videoSearchQuery}
            onChange={(e) => setVideoSearchQuery(e.target.value)}
            placeholder="Search masterclasses, invariants..."
            className="w-full rounded-xl border border-white/10 bg-[#181512] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#d4af37] font-mono"
          />
        </div>
      </div>

      {/* 3. COMMUNITY MASTERCLASS GRID (Standardized Typographic Covers §9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, idx) => (
          <div
            key={video.id}
            className="rounded-2xl border border-white/10 bg-[#181512] p-4 flex flex-col justify-between space-y-4 hover:border-white/20 transition shadow-xl group"
          >
            {/* PRD §9 CSS-Grid Typographic Journal Cover */}
            <div
              className="cursor-pointer"
              onClick={() => handleLaunchCrucible(video)}
              title="Click to enter split-screen crucible"
            >
              <TypographicJournalCover
                title={video.title}
                interlocutor={video.channelName}
                subject={video.category}
                durationMinutes={video.durationMinutes}
                templateIndex={idx}
                codeIndex={String(idx + 1).padStart(2, '0')}
              />
            </div>

            {/* Content Details */}
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-[#d4af37] font-semibold">{video.subtopic}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </span>
              </div>

              <h2
                onClick={() => handleLaunchCrucible(video)}
                className="font-serif-tattva text-lg text-white font-normal leading-snug line-clamp-2 cursor-pointer group-hover:text-[#d4af37] transition"
              >
                {video.title}
              </h2>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {video.description}
              </p>

              {/* Invariants / Key Concepts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {video.keyConcepts.slice(0, 3).map((concept, cIdx) => (
                  <span
                    key={cIdx}
                    className="rounded bg-[#12100e] border border-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleEnroll(video)}
                title="Enroll into your personal Workspace desk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#181512] text-xs font-mono text-slate-300 hover:text-white hover:border-[#d4af37]/60 transition cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>+ Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => handleLaunchCrucible(video)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#d4af37] text-xs font-mono font-bold text-black hover:bg-[#e5c158] transition cursor-pointer shadow-sm"
              >
                <span>ENTER CRUCIBLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. THE ARENA COMMUNITY BOUNTY BANNER (PRD §8) */}
      <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-[#181512] via-[#181512] to-[#181512] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5 rounded uppercase">
              PRD §8 · Decentralized Bounties
            </span>
            <span className="text-xs font-mono text-slate-400">Weekly Challenge</span>
          </div>

          <h3 className="font-serif-tattva text-2xl text-white font-normal">
            The Arena: Crowdsource the Definitive Seed Graph
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Current Challenge: <em>&ldquo;Explain the mathematical intuition behind Fourier Transforms in Signal Processing.&rdquo;</em> Submit your completed Knowledge Graph. Peer-reviewed votes from high-stamina scholars determine the official platform seed.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="rounded-xl border border-white/20 bg-[#221e1a] px-5 py-3 font-mono text-xs font-bold text-white hover:border-[#d4af37] transition cursor-pointer"
          >
            VIEW ARENA BOUNTIES →
          </button>
        </div>
      </div>
    </div>
  );
};
