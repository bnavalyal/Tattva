import React from 'react';
import {
  Clock,
  GitBranch,
  Sparkles,
  X,
  Youtube,
} from 'lucide-react';
import type { EngineeringVideo } from '../types/thinkforge';

interface VideoPlayerModalProps {
  video: EngineeringVideo | null;
  onClose: () => void;
  onConvertVideoToInquiry: (video: EngineeringVideo) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onConvertVideoToInquiry,
}) => {
  if (!video) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-muted)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
              <Youtube className="w-3.5 h-3.5" />
              {video.lectureBadge}
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)] truncate">
              {video.category} · {video.subtopic}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed Frame (16:9) */}
        <div className="relative w-full aspect-video bg-black shrink-0">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* Video Info & ThinkForge Inquiry Converter */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 id="video-title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {video.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--text-secondary)] font-medium">
                <span className="font-semibold text-[var(--text-primary)]">{video.channelName}</span>
                <span>•</span>
                <span>{video.views}</span>
                <span>•</span>
                <span>{video.uploadDate}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono-ledger bg-[var(--bg-muted)] px-2 py-0.5 rounded text-[var(--text-primary)]">
                  <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
                  {video.duration} (Between 25m - 1hr)
                </span>
              </div>
            </div>

            {/* Turn into Knowledge Graph CTA */}
            <button
              type="button"
              onClick={() => {
                onConvertVideoToInquiry(video);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm shrink-0 cursor-pointer"
            >
              <GitBranch className="w-4 h-4" />
              <span>Explore as Knowledge Graph</span>
            </button>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {video.description}
          </p>

          {/* Key Concepts */}
          <div className="pt-2 border-t border-[var(--border-primary)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Key Engineering Concepts Covered
            </div>
            <div className="flex flex-wrap gap-1.5">
              {video.keyConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-primary)]"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Connected ThinkForge Question */}
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted)] p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                Recommended Graph Question
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 italic">
                &ldquo;{video.suggestedInquiryQuestion}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onConvertVideoToInquiry(video);
                onClose();
              }}
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline shrink-0"
            >
              Launch →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
