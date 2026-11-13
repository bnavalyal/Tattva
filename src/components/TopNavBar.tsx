import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import type { AppView, ThinkForgeUser } from '../types/thinkforge';
import { useTheme } from '../context/ThemeContext';

interface TopNavBarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  activeView?: AppView;
  onChangeView: (view: AppView) => void;
  curiosityCredits: number;
  lastCreditDelta: number | null;
  inquiryCount: number;
  user: ThinkForgeUser;
  onSignOut: () => void;
  onGlobalSearch?: (query: string) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleSidebar,
  sidebarCollapsed,
  activeView = 'home',
  onChangeView,
  curiosityCredits,
  lastCreditDelta,
  inquiryCount,
  user,
  onSignOut,
  onGlobalSearch,
}) => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onGlobalSearch?.(searchQuery.trim());
      onChangeView('videos');
    }
  };

  return (
    <header className="shrink-0 border-b border-white/10 bg-[#12100e] z-40 text-slate-200">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: TATTVA Brand with Sacred Geometry Wireframe Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeView('home')}
            title="TATTVA: Intellectual Execution Platform"
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            {/* Sacred Geometry Emblem */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 border border-white/15 flex items-center justify-center shadow-inner group-hover:border-[#d4af37]/60 transition">
              <svg className="w-4.5 h-4.5 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="8.5" x2="22" y2="15.5" />
                <line x1="2" y1="15.5" x2="22" y2="8.5" />
              </svg>
            </div>

            <div className="leading-tight">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-extrabold tracking-[0.18em] text-white font-sans uppercase">
                  TATTVA
                </span>
                <span className="hidden xl:inline text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                  INTELLECTUAL EXECUTION PLATFORM
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Official Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => onChangeView('home')}
            className={`py-1 transition relative cursor-pointer ${
              activeView === 'home'
                ? 'text-white font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#d4af37]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => onChangeView('tattva200')}
            className={`py-1 transition relative cursor-pointer ${
              activeView === 'tattva200'
                ? 'text-white font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#d4af37]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tattva 200
          </button>

          <button
            type="button"
            onClick={() => onChangeView('workspace')}
            className={`py-1 transition relative cursor-pointer ${
              activeView === 'workspace'
                ? 'text-white font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#d4af37]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Knowledge Graphs
          </button>

          <button
            type="button"
            onClick={() => onChangeView('videos')}
            className={`py-1 transition relative cursor-pointer ${
              activeView === 'videos'
                ? 'text-white font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#d4af37]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lectures
          </button>

          <button
            type="button"
            onClick={() => onChangeView('community')}
            className={`py-1 transition relative cursor-pointer ${
              activeView === 'community'
                ? 'text-white font-semibold after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[#d4af37]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Community
          </button>
        </nav>

        {/* Right: Search [ Ctrl+K ], Stamina & Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Monospace Search Bracket */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center">
            <div className="flex items-center h-8.5 rounded-lg border border-white/10 bg-[#181512] px-3 font-mono text-xs text-slate-400 focus-within:border-[#d4af37]/60 focus-within:text-slate-200 transition w-56 lg:w-64">
              <span className="text-slate-500 mr-1.5">[</span>
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dashboard / Ctrl+K"
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
              />
              <span className="text-slate-500 ml-1.5">]</span>
            </div>
          </form>

          {/* Cognitive Stamina Badge */}
          <button
            type="button"
            onClick={() => onChangeView('profile')}
            title="Cognitive Stamina & Execution Ledger"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#181512] hover:border-white/20 transition cursor-pointer"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
            <span className="font-mono text-xs font-bold text-white tabular-nums">
              {(348 + curiosityCredits).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase hidden sm:inline">
              STAMINA
            </span>
            {lastCreditDelta !== null && (
              <span className="font-mono text-[10px] font-bold text-[#d4af37]">
                +{lastCreditDelta}
              </span>
            )}
          </button>

          {/* Theme Toggle Button (Dark Obsidian <-> Light Sage Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#181512] hover:border-white/20 transition cursor-pointer text-slate-300 hover:text-white"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline font-mono text-[11px] font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#c87d55]" />
                <span className="hidden xl:inline font-mono text-[11px] font-medium">Dark</span>
              </>
            )}
          </button>

          {/* Account Profile Avatar */}
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              title={`${user.name} (${user.email})`}
              className="flex items-center gap-1.5 p-0.5 rounded-full border border-white/15 bg-[#181512] hover:border-[#d4af37]/60 cursor-pointer transition"
            >
              <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-200 flex items-center justify-center text-xs font-bold font-mono border border-white/10">
                {user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'VK'}
              </div>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 mr-1 transition-transform ${
                  accountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {accountMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-[#181512] border border-white/10 shadow-2xl p-3 z-50 space-y-2.5 animate-fadeIn"
              >
                <div className="pb-2.5 border-b border-white/10">
                  <div className="text-xs font-bold text-white truncate">
                    {user.name}
                  </div>
                  <div className="font-mono text-[11px] text-[#d4af37] truncate">
                    {user.handle}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    System: Active • {inquiryCount} Inquiries
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onChangeView('create');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Launch New Inquiry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onChangeView('profile');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>View Stamina Ledger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-[#c87d55]" />
                      )}
                      <span>Appearance</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#d4af37] px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </button>

                  <div className="pt-1.5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-400 hover:bg-red-950/30 rounded-lg text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
