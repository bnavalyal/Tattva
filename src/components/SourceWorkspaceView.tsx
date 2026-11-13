import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import type { StudySource } from '../types/thinkforge';
import { SourceWorkStudio } from './SourceWorkStudio';

interface SourceWorkspaceViewProps {
  sources: StudySource[];
  onUpdateSource?: (updated: StudySource) => void;
  activeSourceId?: string | null;
}

export const SourceWorkspaceView: React.FC<SourceWorkspaceViewProps> = ({
  sources: initialSources,
  onUpdateSource,
  activeSourceId: propActiveSourceId,
}) => {
  const [sources, setSources] = useState<StudySource[]>(initialSources);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(
    propActiveSourceId || null
  );

  useEffect(() => {
    setActiveSourceId(propActiveSourceId || null);
  }, [propActiveSourceId]);

  useEffect(() => {
    setSources(initialSources);
  }, [initialSources]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSource = useMemo(() => {
    if (!activeSourceId) return null;
    return sources.find((s) => s.id === activeSourceId) || null;
  }, [sources, activeSourceId]);

  const categories = ['All', 'AIML', 'Cybersecurity', 'AIDS', 'Computer Science'];

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const matchCat =
        selectedCategory === 'All' || source.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [sources, selectedCategory, searchQuery]);

  // Overall average mastery across all sources
  const overallAvgMastery = useMemo(() => {
    if (sources.length === 0) return 0;
    const sum = sources.reduce((acc, s) => acc + s.masteryScore, 0);
    return Math.round(sum / sources.length);
  }, [sources]);

  const handleUpdateSource = (updated: StudySource) => {
    const next = sources.map((s) => (s.id === updated.id ? updated : s));
    setSources(next);
    onUpdateSource?.(updated);
  };

  // If a source is selected, render the dedicated Work Studio!
  if (activeSource) {
    return (
      <SourceWorkStudio
        source={activeSource}
        onBack={() => setActiveSourceId(null)}
        onUpdateSource={handleUpdateSource}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 text-slate-200">
      {/* Workspace Header & One-Point Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#c59a67] uppercase tracking-wider bg-[#c59a67]/10 px-2.5 py-0.5 rounded border border-[#c59a67]/30">
              Source-Centric Workspaces
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">
              {sources.length} Active Sources
            </span>
          </div>
          <h1 className="mt-2 font-serif-tattva text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Learning Sources &amp; Work Studios
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed font-sans">
            Each card represents an active topic you are mastering. Select a card to launch its dedicated Work Studio with live quizzes, formula notes, research papers, and a single knowledge graph.
          </p>
        </div>

        {/* Global Mastery Snapshot */}
        <div className="flex items-center gap-4 bg-[#13161b] border border-white/10 rounded-2xl p-4 shadow-xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-stone-900 text-[#c59a67] flex items-center justify-center font-bold text-lg border border-white/10">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Average Mastery
            </div>
            <div className="font-mono text-2xl font-bold text-white">
              {overallAvgMastery}%
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Across all {sources.length} study sources
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#c59a67] text-[#0b0d0f] font-bold shadow-xs'
                  : 'border border-white/10 bg-[#13161b] text-slate-400 hover:text-white hover:border-white/25'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources or concepts..."
            className="w-full rounded-xl border border-white/10 bg-[#13161b] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#c59a67]/60 focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Grid of Single Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((source) => {
          const totalQuizzes = source.quizzes.length;
          const passedQuizzes = source.quizzes.filter((q) => q.isAnsweredCorrectly).length;
          const totalNodes = source.knowledgeGraph.nodes.length;
          const masteredNodes = source.knowledgeGraph.nodes.filter((n) => n.status === 'mastered').length;

          return (
            <div
              key={source.id}
              onClick={() => setActiveSourceId(source.id)}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#13161b] shadow-xl hover:border-[#c59a67]/60 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={source.thumbnail}
                    alt={source.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Source Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-white uppercase tracking-wider border border-white/10">
                    <BookOpen className="w-3 h-3 text-[#c59a67]" />
                    <span>{source.sourceTypeLabel}</span>
                  </div>

                  {/* Duration Badge */}
                  {source.duration && (
                    <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 text-[11px] font-mono font-bold text-white border border-white/10">
                      {source.duration}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#c59a67]">
                      {source.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {source.lastStudied}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif-tattva text-lg font-normal text-white group-hover:text-[#c59a67] transition line-clamp-2 leading-snug">
                    {source.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {source.summary}
                  </p>

                  {/* One-Point In-and-Out Mastery Gauge */}
                  <div className="rounded-xl border border-white/5 bg-[#0e1115] p-3 space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] tracking-wider text-slate-400 uppercase">
                        TOPIC MASTERY
                      </span>
                      <span className="text-xs font-bold text-[#c59a67]">
                        {source.masteryScore}% · {source.masteryLevel}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#c59a67] h-full rounded-full transition-all duration-300"
                        style={{ width: `${source.masteryScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span>{masteredNodes}/{totalNodes} Concepts Mastered</span>
                      <span>Quiz: {passedQuizzes}/{totalQuizzes} Passed</span>
                    </div>
                  </div>

                  {/* Badges of Studios available inside */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                    <div className="rounded-lg bg-[#181b22] border border-white/5 p-2">
                      <div className="font-bold text-white">{totalQuizzes}</div>
                      <div className="text-[9px] text-slate-400">Quizzes</div>
                    </div>

                    <div className="rounded-lg bg-[#181b22] border border-white/5 p-2">
                      <div className="font-bold text-white">{source.notes.length}</div>
                      <div className="text-[9px] text-slate-400">Notes</div>
                    </div>

                    <div className="rounded-lg bg-[#181b22] border border-white/5 p-2">
                      <div className="font-bold text-[#a3e635]">{totalNodes}</div>
                      <div className="text-[9px] text-slate-400">Graph Nodes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/10 bg-[#181b22] py-2.5 text-xs font-bold text-white group-hover:bg-[#c59a67] group-hover:text-[#0b0d0f] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Launch Work Studio</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
