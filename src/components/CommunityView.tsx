import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { CommunityArticle } from '../types/thinkforge';
import { INITIAL_COMMUNITY_ARTICLES } from '../data/communityArticles';
import { FormattedArticleReader } from './FormattedArticleReader';

interface CommunityViewProps {
  onOpenSourceInStudio?: (sourceId: string) => void;
  // Legacy optional props to prevent breaking callers
  journeys?: unknown[];
  onToggleSpark?: (journeyId: string) => void;
  onExtendJourney?: (
    journeyId: string,
    targetNodeId: string,
    question: string,
    insight: string,
  ) => Promise<string | null>;
  onForkJourney?: (journeyId: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onOpenSourceInStudio,
}) => {
  const [articles, setArticles] = useState<CommunityArticle[]>(() => INITIAL_COMMUNITY_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Article Posting Modal State
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityArticle['category']>('Cybersecurity');
  const [newHighlights, setNewHighlights] = useState(['', '', '']);
  const [newContent, setNewContent] = useState('');

  // Comment input state for full article reader
  const [commentInput, setCommentInput] = useState('');
  const [articleComments, setArticleComments] = useState<Record<string, { author: string; text: string; time: string }[]>>({
    'art-cyber-01': [
      { author: 'Neha Gupta', text: 'Hybrid ML-KEM with X25519 is already being tested in Chrome 124 canary. Great breakdown of HNDL!', time: '2 hours ago' },
      { author: 'Kiran Dev', text: 'Does zero-RTT early data require session caches on both edges or can ticket keys handle it?', time: 'Yesterday' }
    ],
    'art-aiml-01': [
      { author: 'Tanmay Bhatt', text: 'Online softmax accumulator equations are identical to Welford algorithm for running variance. Beautiful parallel!', time: '1 day ago' }
    ]
  });

  const categories = ['All', 'Cybersecurity', 'AIML', 'AIDS', 'Computer Science'];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        art.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const activeArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articles.find((a) => a.id === selectedArticleId) || null;
  }, [articles, selectedArticleId]);

  // Toggle like/spark
  const handleToggleSpark = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id !== articleId) return art;
        const isStarred = !art.starredByUser;
        return {
          ...art,
          starredByUser: isStarred,
          sparks: isStarred ? art.sparks + 1 : Math.max(0, art.sparks - 1),
        };
      }),
    );
  };

  // Add comment
  const handleAddComment = (articleId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setArticleComments((prev) => ({
      ...prev,
      [articleId]: [
        ...(prev[articleId] || []),
        { author: 'Bhoomika Naval', text: commentInput.trim(), time: 'Just now' },
      ],
    }));

    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, commentsCount: a.commentsCount + 1 } : a)),
    );
    setCommentInput('');
  };

  // Publish new article
  const handlePostArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const validHighlights = newHighlights.filter((h) => h.trim().length > 0);
    const createdArticle: CommunityArticle = {
      id: `art-${Date.now().toString(36)}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Technical Deep Dive published to ThinkForge Community.',
      category: newCategory,
      tags: [newCategory, 'Engineering', 'Architecture'],
      authorName: 'Bhoomika Naval',
      authorHandle: '@bhoomika_naval',
      authorRole: 'Engineering Fellow · Curiominds',
      publishedAt: 'Today',
      readTime: `${Math.max(3, Math.ceil(newContent.split(' ').length / 180))} min read`,
      sparks: 1,
      starredByUser: true,
      commentsCount: 0,
      connectedGraphNodesCount: 4,
      highlights:
        validHighlights.length > 0
          ? validHighlights
          : ['Core theoretical invariant established', 'Empirical performance bounds verified', 'Production architecture best practices outlined'],
      content: newContent.trim(),
    };

    setArticles([createdArticle, ...articles]);
    setIsPostingModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewHighlights(['', '', '']);
    setNewContent('');
    setSelectedArticleId(createdArticle.id);
  };

  // ----------------------------------------------------
  // FULL ARTICLE READER VIEW (When an article is clicked)
  // ----------------------------------------------------
  if (activeArticle) {
    const comments = articleComments[activeArticle.id] || [];

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-primary)] pb-4">
          <button
            type="button"
            onClick={() => setSelectedArticleId(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Community Articles</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggleSpark(activeArticle.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeArticle.starredByUser
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  activeArticle.starredByUser ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>{activeArticle.sparks} Sparks</span>
            </button>

            {onOpenSourceInStudio && (
              <button
                type="button"
                onClick={() => {
                  const matchedSource =
                    activeArticle.category === 'Cybersecurity'
                      ? 'source-rsa-crypto'
                      : activeArticle.category === 'AIML'
                      ? 'source-transformers'
                      : activeArticle.category === 'AIDS'
                      ? 'source-pca'
                      : 'source-os-sync';
                  onOpenSourceInStudio(matchedSource);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Open in Work Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Article Container with Defined Light Stroke */}
        <div className="rounded-2xl border border-white/10 bg-[#13161b] p-6 sm:p-12 shadow-2xl space-y-8 text-slate-200">
          {/* Article Header */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <span className="rounded font-mono text-[10px] font-bold uppercase tracking-wider text-[#c59a67] bg-[#c59a67]/15 border border-[#c59a67]/30 px-2.5 py-0.5">
                {activeArticle.category}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeArticle.readTime}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">{activeArticle.publishedAt}</span>
            </div>

            <h1 className="font-serif-tattva text-2xl sm:text-4xl font-normal text-white tracking-tight leading-tight">
              {activeArticle.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
              {activeArticle.subtitle}
            </p>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-stone-900 border border-white/10 text-[#c59a67] font-bold flex items-center justify-center text-xs shadow-inner font-mono">
                {activeArticle.authorName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{activeArticle.authorName}</div>
                <div className="text-[11px] font-mono text-slate-500">
                  {activeArticle.authorHandle} · {activeArticle.authorRole}
                </div>
              </div>
            </div>
          </div>

          {/* Highlights Box in Dark Imperial Gold */}
          <div className="rounded-xl border border-[#c59a67]/30 bg-[#c59a67]/10 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#c59a67]">
              <Sparkles className="w-4 h-4 fill-current" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                Key Article Takeaways &amp; Core Invariants
              </h3>
            </div>

            <ul className="space-y-2">
              {activeArticle.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c59a67] mt-2 shrink-0" />
                  <span className="font-medium">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FULL FORMATTED ARTICLE BODY */}
          <div className="pt-2 text-slate-200 font-sans">
            <FormattedArticleReader content={activeArticle.content} />
          </div>

          {/* Article Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/10">
            <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Topics:
            </span>
            {activeArticle.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded font-mono bg-white/5 text-slate-300 px-2.5 py-1 text-xs border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Discussion & Peer Insights */}
        <div className="rounded-2xl border border-white/10 bg-[#13161b] p-6 space-y-6 text-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#c59a67]" />
              <h3 className="text-base font-bold text-white font-sans">
                Community Discussion ({comments.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Peer verified answers</span>
          </div>

          {/* Add Comment Input */}
          <form onSubmit={(e) => handleAddComment(activeArticle.id, e)} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share an insight, question, or architectural critique..."
              className="flex-1 rounded-xl border border-white/10 bg-[#0e1115] px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#c59a67] focus:outline-none font-sans"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#c59a67] px-4 py-2 text-xs font-bold text-[#0b0d0f] hover:bg-[#d4a373] transition cursor-pointer"
            >
              Post Comment
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3 divide-y divide-white/5">
            {comments.map((c, i) => (
              <div key={i} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{c.author}</span>
                  <span className="font-mono text-[10px] text-slate-500">{c.time}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // COMMUNITY FEED VIEW (Highlights shown in front)
  // ----------------------------------------------------
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border-primary)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--brand-sage-light)]/40 px-2.5 py-0.5 text-xs font-bold text-[var(--brand-pine)] uppercase tracking-wider">
              Peer Learning Community
            </span>
            <span className="text-xs text-[var(--text-muted)]">·</span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {articles.length} Published Articles
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Engineering Articles &amp; Research Highlights
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-2xl">
            Read high-yield technical breakdowns across Cybersecurity, AIML, AIDS, and Systems. The key highlights are shown in front on each article—click any card to view the entire article.
          </p>
        </div>

        {/* Action Button: Post an Article */}
        <button
          type="button"
          onClick={() => setIsPostingModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post an Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--brand-pine)] text-white shadow-xs'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics, or authors..."
            className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Feed of Article Cards with Highlights shown in Front */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticleId(article.id)}
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#13161b] p-6 shadow-xl hover:border-[#c59a67]/60 transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-4">
              {/* Header: Domain, Read Time, Date */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded font-mono text-[10px] font-bold uppercase tracking-wider text-[#c59a67] bg-[#c59a67]/15 border border-[#c59a67]/30 px-2.5 py-0.5">
                  {article.category}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                  <span>·</span>
                  <span>{article.publishedAt}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="font-serif-tattva text-xl font-normal text-white group-hover:text-[#c59a67] transition line-clamp-2 leading-snug">
                  {article.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {article.subtitle}
                </p>
              </div>

              {/* HIGHLIGHT OF THAT ARTICLE IN FRONT (As requested) */}
              <div className="rounded-xl border border-[#c59a67]/30 bg-[#c59a67]/10 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[#c59a67]">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                    Key Highlights &amp; Discoveries
                  </span>
                </div>

                <ul className="space-y-1.5 font-sans">
                  {article.highlights.slice(0, 3).map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c59a67] mt-1.5 shrink-0" />
                      <span className="font-medium line-clamp-2">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 font-mono">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              {/* Author info */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-stone-900 border border-white/10 text-[#c59a67] font-bold flex items-center justify-center text-xs font-mono">
                  {article.authorName.charAt(0)}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white">{article.authorName}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={(e) => handleToggleSpark(article.id, e)}
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono transition ${
                    article.starredByUser
                      ? 'bg-rose-950/40 border border-rose-500/50 text-rose-300'
                      : 'text-slate-500 hover:text-rose-400'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      article.starredByUser ? 'fill-rose-400 text-rose-400' : ''
                    }`}
                  />
                  <span>{article.sparks}</span>
                </button>

                <span className="inline-flex items-center gap-1 text-slate-500 font-mono">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{article.commentsCount}</span>
                </span>

                <span className="font-bold text-[#c59a67] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-mono text-xs">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: POST AN ARTICLE */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#13161b] p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#c59a67]" />
                <h3 className="text-base font-bold text-white font-sans">
                  Publish Article to TATTVA Community
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400">Article Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Zero-Knowledge Proofs in Post-Quantum Cryptography"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1115] px-3.5 py-2 text-xs text-white focus:border-[#c59a67] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CommunityArticle['category'])}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1115] px-3 py-2 text-xs text-slate-200 focus:border-[#c59a67] focus:outline-none"
                  >
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="AIML">AI &amp; Machine Learning (AIML)</option>
                    <option value="AIDS">AI &amp; Data Science (AIDS)</option>
                    <option value="Computer Science">Computer Science Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400">Subtitle</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="Short architectural one-liner..."
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1115] px-3.5 py-2 text-xs text-white focus:border-[#c59a67] focus:outline-none"
                  />
                </div>
              </div>

              {/* Highlights Inputs (Shown in front!) */}
              <div className="space-y-2 rounded-xl bg-[#0e1115] border border-white/10 p-4">
                <label className="block text-xs font-mono font-bold text-[#c59a67]">
                  ⚡ 3 Key Highlights (Displayed in front on the card)
                </label>
                <p className="text-[11px] text-slate-400">
                  Summarize the breakthrough takeaways so readers immediately understand the value.
                </p>

                {newHighlights.map((hl, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={hl}
                    onChange={(e) => {
                      const updated = [...newHighlights];
                      updated[idx] = e.target.value;
                      setNewHighlights(updated);
                    }}
                    placeholder={`Highlight #${idx + 1}...`}
                    className="w-full rounded-lg border border-white/10 bg-[#13161b] px-3 py-1.5 text-xs text-white focus:border-[#c59a67] focus:outline-none"
                  />
                ))}
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-mono text-slate-400">
                  Full Article Content (Markdown, equations, and code blocks)
                </label>
                <textarea
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write the complete article breakdown..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0e1115] px-3.5 py-2.5 text-xs text-white focus:border-[#c59a67] focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#c59a67] px-5 py-2 text-xs font-bold text-[#0b0d0f] hover:bg-[#d4a373] transition cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
