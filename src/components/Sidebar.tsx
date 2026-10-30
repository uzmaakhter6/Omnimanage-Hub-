import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  KanbanSquare, 
  Package, 
  Database, 
  Sparkles, 
  History, 
  Layers,
  ArrowUpRight,
  Crown,
  Github,
  Terminal
} from 'lucide-react';
import { ActiveTab, SystemStats, AuthUser } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: SystemStats | null;
  schemaTableCount: number;
  currentUser: AuthUser | null;
  onOpenGitDocs?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  schemaTableCount,
  currentUser,
  onOpenGitDocs,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Overview & KPIs',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'employees' as ActiveTab,
      label: 'Staff & Team',
      icon: Users,
      badge: stats ? `${stats.totalEmployees}` : null,
    },
    {
      id: 'projects' as ActiveTab,
      label: 'Projects Portfolio',
      icon: Briefcase,
      badge: stats ? `${stats.activeProjects} active` : null,
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Sprint Kanban',
      icon: KanbanSquare,
      badge: stats ? `${stats.totalTasks - stats.completedTasks}` : null,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Inventory & Assets',
      icon: Package,
      badge: stats && stats.lowStockItemsCount > 0 ? `${stats.lowStockItemsCount} low` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'schema' as ActiveTab,
      label: 'Database Schema Studio',
      icon: Database,
      badge: `${schemaTableCount} tables`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'ai-copilot' as ActiveTab,
      label: 'AI Management Copilot',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'audit-logs' as ActiveTab,
      label: 'Audit & Activity Logs',
      icon: History,
      badge: stats ? `${stats.recentActivityCount}` : null,
    },
    {
      id: 'subscription' as ActiveTab,
      label: 'Subscription & License',
      icon: Crown,
      badge: currentUser?.plan || 'Pro',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Management Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                        item.badgeColor || (isActive ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Schema Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Schema Architecture</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">v2.4 Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Relational schemas with ERD visualizer, SQL DDL generator & REST endpoints.
          </p>
          <button
            onClick={() => setActiveTab('schema')}
            className="w-full flex items-center justify-center gap-1 py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition-colors border border-cyan-500/20 cursor-pointer"
          >
            <span>Open Schema Designer</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          {onOpenGitDocs && (
            <button
              onClick={onOpenGitDocs}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white text-[11px] font-mono transition-colors border border-slate-700 cursor-pointer mt-1"
            >
              <Github className="w-3 h-3 text-cyan-400" />
              <span>Git & MySQL Docs Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Profile / Logged-in User Card */}
      <div 
        onClick={() => setActiveTab('subscription')}
        className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-slate-800/40 p-2 rounded-xl transition-all group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover border border-indigo-500/40 shrink-0" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'CL'}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-slate-200 text-xs truncate group-hover:text-indigo-300 transition-colors">
              {currentUser?.name || 'Client Portal'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{currentUser?.role || 'Client'}</span>
              <span>•</span>
              <span className="text-amber-400 font-mono font-medium">{currentUser?.plan || 'Pro'}</span>
            </div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Session Active" />
      </div>
    </aside>
  );
};
