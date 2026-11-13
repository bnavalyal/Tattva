import React, { useMemo, useState } from 'react';
import {
  Clock,
  Play,
  Sparkles,
  Youtube,
} from 'lucide-react';
import type { EngineeringVideo } from '../types/thinkforge';
import { ENGINEERING_VIDEOS } from '../data/engineeringVideos';

interface EngineeringVideosViewProps {
  onSelectVideo: (video: EngineeringVideo) => void;
  onConvertVideoToInquiry: (video: EngineeringVideo) => void;
  onOpenSourceInStudio?: (sourceId: string) => void;
  initialCategory?: string;
}

export const EngineeringVideosView: React.FC<EngineeringVideosViewProps> = ({
  onSelectVideo,
  onConvertVideoToInquiry: _onConvertVideoToInquiry,
  onOpenSourceInStudio,
  initialCategory = 'All',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'under-35' | 'over-35'>('all');

  const categories = [
    { id: 'All', label: 'All Lectures' },
    { id: 'AIML', label: 'AI & Machine Learning (AIML)' },
    { id: 'Cybersecurity', label: 'Cybersecurity & Defense' },
    { id: 'AIDS', label: 'AI & Data Science (AIDS)' },
    { id: 'Computer Science', label: 'Computer Science Core' },
  ];

  const filteredVideos = useMemo(() => {
    return ENGINEERING_VIDEOS.filter((vid) => {
      // Category filter
      if (selectedCategory !== 'All' && vid.category !== selectedCategory) {
        return false;
      }

      // Duration filter (All are 25m - 60m)
      if (durationFilter === 'under-35' && vid.durationMinutes > 35) {
        return false;
      }
      if (durationFilter === 'over-35' && vid.durationMinutes <= 35) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        vid.title.toLowerCase().includes(q) ||
        vid.subtopic.toLowerCase().includes(q) ||
        vid.description.toLowerCase().includes(q) ||
        vid.keyConcepts.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, durationFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 text-slate-200">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#13161b] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[10px] font-bold text-[#c59a67] bg-[#c59a67]/10 border border-[#c59a67]/30 uppercase tracking-wider">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>TATTVA Masterclass Archive · 25m to 1hr Lectures</span>
            </div>
            <h1 className="font-serif-tattva text-2xl sm:text-4xl font-normal text-white tracking-tight">
              Watch. Master. <span className="text-[#c59a67]">Inquire.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed font-sans">
              Explore authentic, deep-dive university &amp; industry engineering lectures across AIML,
              Cybersecurity, AIDS, and Computer Science. Launch directly into a dedicated TATTVA Work Studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0e1115] text-[#a3e635] border border-white/10">
              {filteredVideos.length} Masterclasses
            </span>
          </div>
        </div>
      </div>

      {/* Filter Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#c59a67] text-[#0b0d0f] font-bold shadow-xs'
                    : 'border border-white/10 bg-[#13161b] text-slate-400 hover:text-white hover:border-white/25'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 bg-[#13161b] border border-white/10 rounded-2xl space-y-3 font-mono">
          <p className="text-slate-400 text-sm">No lectures found matching your criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setDurationFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#c59a67] text-[#0b0d0f] text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#13161b] shadow-xl hover:border-[#c59a67]/60 transition duration-200"
            >
              <div>
                {/* 16:9 Thumbnail Frame with Video Click */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
                  onClick={() => onSelectVideo(video)}
                  title={`Watch ${video.title}`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 opacity-90"
                    loading="lazy"
                  />

                  {/* Play overlay hover indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#c59a67] text-[#0b0d0f] flex items-center justify-center shadow-lg transform scale-95 group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/85 text-white backdrop-blur-xs flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3 text-[#c59a67]" />
                    {video.duration}
                  </span>

                  {/* Category Pill in Top Right */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-black/80 text-[#c59a67] border border-[#c59a67]/30">
                    {video.category}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2 font-mono text-[10px] text-slate-400">
                    <span className="text-[#c59a67]">{video.channelName}</span>
                    <span>{video.views}</span>
                  </div>

                  <h3
                    onClick={() => onSelectVideo(video)}
                    className="font-serif-tattva text-base font-normal text-white line-clamp-2 cursor-pointer group-hover:text-[#c59a67] transition leading-snug"
                  >
                    {video.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {video.description}
                  </p>

                  {/* Key Concepts Tags */}
                  <div className="flex flex-wrap gap-1 pt-1 font-mono">
                    {video.keyConcepts.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 border-t border-white/10 bg-[#0e1115] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectVideo(video)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#c59a67]" />
                  <span>Watch Lecture</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const matchedSourceId =
                      video.id === 'vid-aiml-03'
                        ? 'source-transformers'
                        : video.id === 'vid-cs-01'
                        ? 'source-celebrity-problem'
                        : video.id === 'vid-cyber-02'
                        ? 'source-rsa-crypto'
                        : video.id === 'vid-aids-02'
                        ? 'source-pca'
                        : video.id === 'vid-cs-04'
                        ? 'source-os-sync'
                        : video.id === 'vid-cs-02'
                        ? 'source-sliding-window'
                        : 'source-transformers';

                    if (onOpenSourceInStudio) {
                      onOpenSourceInStudio(matchedSourceId);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#c59a67] text-[#0b0d0f] hover:bg-[#d4a373] shadow-sm cursor-pointer transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Work Studio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
