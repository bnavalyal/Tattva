import React from 'react';
import {
  Award,
  ChevronRight,
  Cpu,
  Database,
  Home,
  Network,
  PlaySquare,
  PlusCircle,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import type { AppView } from '../types/thinkforge';

interface YouTubeSidebarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  curiosityCredits: number;
  totalNodesExplored: number;
  inquiryCount: number;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const YouTubeSidebar: React.FC<YouTubeSidebarProps> = ({
  activeView,
  onChangeView,
  collapsed,
  curiosityCredits,
  totalNodesExplored,
  inquiryCount,
  onSelectCategoryFilter,
}) => {
  const mainNavItems: {
    id: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'home',
      label: 'Overview',
      icon: <Home className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'create',
      label: 'New Inquiry',
      icon: <PlusCircle className="w-4 h-4 shrink-0 text-[#c59a67]" />,
      badge: '+1.0',
    },
    {
      id: 'workspace',
      label: 'Workspaces',
      icon: <Network className="w-4 h-4 shrink-0" />,
      badge: `${inquiryCount}`,
    },
    {
      id: 'videos',
      label: 'Masterclasses',
      icon: <PlaySquare className="w-4 h-4 shrink-0" />,
      badge: '18+',
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'profile',
      label: 'Stamina Ledger',
      icon: <Award className="w-4 h-4 shrink-0 text-[#a3e635]" />,
    },
  ];

  const engineeringCategories = [
    { name: 'AIML', label: 'AI & Machine Learning', icon: <Sparkles className="w-3.5 h-3.5 text-[#a3e635]" /> },
    { name: 'Cybersecurity', label: 'Cybersecurity & Defense', icon: <Shield className="w-3.5 h-3.5 text-teal-400" /> },
    { name: 'AIDS', label: 'AI & Data Science', icon: <Database className="w-3.5 h-3.5 text-sky-400" /> },
    { name: 'Computer Science', label: 'Computer Science Core', icon: <Cpu className="w-3.5 h-3.5 text-[#c59a67]" /> },
  ];

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`shrink-0 border-r border-white/10 bg-[#0b0d0f] flex flex-col transition-all duration-200 z-30 select-none text-slate-300 ${
        collapsed ? 'w-[68px]' : 'w-56 xl:w-60'
      }`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {/* Primary Navigation List */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                title={item.label}
                className={`w-full flex items-center rounded-xl transition cursor-pointer text-left ${
                  collapsed
                    ? 'flex-col justify-center py-2.5 px-1 gap-1 text-[10px] font-semibold'
                    : 'flex-row justify-between px-3 py-2 gap-2.5 text-xs font-semibold'
                } ${
                  isActive
                    ? 'bg-[#181b22] text-white border border-white/15 shadow-xs'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-2.5 ${collapsed ? 'flex-col' : ''}`}>
                  <span className={isActive ? 'text-[#c59a67]' : ''}>{item.icon}</span>
                  <span className={`truncate ${collapsed ? 'text-center text-[10px]' : ''}`}>
                    {item.label}
                  </span>
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-[#c59a67]/20 text-[#c59a67] border border-[#c59a67]/40'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Engineering Disciplines */}
        {!collapsed && (
          <div className="pt-3 border-t border-white/10 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
              <span>Disciplines</span>
            </div>

            {engineeringCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  onSelectCategoryFilter?.(cat.name);
                  onChangeView('videos');
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Section 3: Telemetry Footer */}
        {!collapsed && (
          <div className="pt-3 border-t border-white/10 px-3">
            <div className="rounded-xl border border-white/10 bg-[#13161b] p-2.5 space-y-1">
              <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                SYSTEM TELEMETRY
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Nodes:</span>
                <span className="font-mono font-bold text-white">{totalNodesExplored}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stamina:</span>
                <span className="font-mono font-bold text-[#a3e635]">
                  {(348 + curiosityCredits).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-white/10 text-[10px] text-slate-500 font-mono">
          <div>TATTVA v2.0</div>
          <div className="text-slate-600">The Intellectual Execution Platform</div>
        </div>
      )}
    </aside>
  );
};
