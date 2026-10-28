import React from 'react';
import { 
  Building2, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Search, 
  Bell, 
  PlusCircle, 
  CheckCircle2, 
  Server,
  Crown,
  LogOut,
  User
} from 'lucide-react';
import { ActiveTab, SystemStats, AuthUser } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: SystemStats | null;
  serverOnline: boolean;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onResetSeed: () => void;
  onOpenQuickAdd: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  serverOnline,
  currentUser,
  onLogout,
  onResetSeed,
  onOpenQuickAdd,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & System Status */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20 text-white font-bold cursor-pointer"
        >
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span 
              onClick={() => setActiveTab('dashboard')}
              className="font-bold text-slate-100 tracking-tight text-base sm:text-lg cursor-pointer"
            >
              OmniManage
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Integrated Schema, Backend & Management Hub</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, projects, tasks, assets, schemas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & Health */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subscription Plan Button */}
        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-800/80 hover:bg-slate-800 text-amber-300/90 border-slate-700'
          }`}
          title="Manage subscription and licensing"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{currentUser?.plan || 'Pro'} Plan</span>
        </button>

        {/* Live Backend Connection Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-400">REST:</span>
          <span className="font-mono font-medium text-slate-200">{serverOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Quick Add Button */}
        <button
          id="btn-quick-add"
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Create Record</span>
        </button>

        {/* AI Copilot Quick Jump */}
        <button
          id="btn-nav-ai-copilot"
          onClick={() => setActiveTab('ai-copilot')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            activeTab === 'ai-copilot'
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Reset / Seed Data Button */}
        <button
          id="btn-reset-seed"
          onClick={onResetSeed}
          title="Reset sample records & schemas"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Logged in User Profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div 
              onClick={() => setActiveTab('subscription')}
              className="flex items-center gap-2 cursor-pointer group"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-indigo-400 font-bold border border-slate-700">
                  {currentUser.name.substring(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-slate-200 hidden lg:inline group-hover:text-indigo-300 transition-colors">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
