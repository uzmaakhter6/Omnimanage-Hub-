import React from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Activity, 
  Layers,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  SystemStats, 
  Employee, 
  Project, 
  Task, 
  InventoryItem, 
  ActivityLog, 
  Department, 
  ActiveTab 
} from '../types';
import { PerformanceTrendChart } from './PerformanceTrendChart';

interface DashboardViewProps {
  stats: SystemStats | null;
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  inventory: InventoryItem[];
  activityLogs: ActivityLog[];
  departments: Department[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: (type?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  employees,
  projects,
  tasks,
  inventory,
  activityLogs,
  departments,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').slice(0, 4);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold);
  const topProjects = projects.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              System Live & Healthy
            </span>
            <span className="text-xs text-slate-400">Enterprise Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1.5 tracking-tight">
            Management Control & Schema Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time telemetry across staff directories, multi-department initiatives, sprint queues, asset inventory, and relational schemas.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('ai-copilot')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI Executive Brief</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('project')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Initiative</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div 
          onClick={() => setActiveTab('employees')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Workforce</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{stats?.totalEmployees ?? 0}</span>
            <span className="text-xs font-medium text-emerald-400">
              {stats?.activeEmployees ?? 0} Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Across {departments.length} Departments</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Active Projects & Budget */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Project Initiatives</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{stats?.totalProjects ?? 0}</span>
            <span className="text-xs font-medium text-indigo-300">
              {stats?.budgetUtilization ?? 0}% Burned
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>${((stats?.totalSpent ?? 0) / 1000).toFixed(0)}k of ${((stats?.totalBudget ?? 0) / 1000).toFixed(0)}k budget</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Sprint Tasks Velocity */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sprint Task Velocity</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">
              {stats ? Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100) : 0}%
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {stats?.completedTasks ?? 0} / {stats?.totalTasks ?? 0} Done
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{tasks.filter(t => t.status === 'In Progress').length} in active flight</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Inventory Asset Value */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Asset & Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">
              ${((stats?.totalInventoryValue ?? 0) / 1000).toFixed(1)}k
            </span>
            {stats && stats.lowStockItemsCount > 0 ? (
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.lowStockItemsCount} Low
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-400">Optimal</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{inventory.length} Tracked hardware & licenses</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Workforce Performance & Task Completion Trend Chart (Recharts) */}
      <PerformanceTrendChart
        employees={employees}
        tasks={tasks}
        departments={departments}
      />

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects & Department Budget (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Progression */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100">Strategic Project Initiatives</h2>
                <p className="text-xs text-slate-400">Milestone completion & financial allocations</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {topProjects.map((p) => (
                <div 
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {p.code}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-200">{p.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.description}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 border ${
                      p.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      p.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      p.status === 'In Review' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      'bg-slate-700/50 text-slate-300 border-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Progress Bar & Budget */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Progress: {p.progress}%</span>
                      <span>${p.spent.toLocaleString()} / ${p.budget.toLocaleString()} ({Math.round((p.spent / p.budget) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.progress === 100 ? 'bg-emerald-400' :
                          p.progress > 60 ? 'bg-indigo-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Lead: <strong className="text-slate-300 font-normal">{p.managerName}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" /> Due: {p.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Structure & Budget Allocation */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Departmental Resource Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <div 
                  key={dept.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{dept.name}</span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: dept.color }} 
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lead: <span className="text-slate-300">{dept.head}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40 font-mono text-slate-400">
                    <span>{dept.employeeCount} Members</span>
                    <span className="text-indigo-300">${(dept.budget / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Action Items & Live Activity Feed */}
        <div className="space-y-6">
          {/* Urgent Tasks Triage */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h2 className="text-base font-bold text-slate-100">Urgent Sprint Triage</h2>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Kanban
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentTasks.map((t) => (
                <div 
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-rose-900/30 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">{t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      {t.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <img src={t.assigneeAvatar} alt={t.assigneeName} className="w-4 h-4 rounded-full object-cover" />
                      <span>{t.assigneeName}</span>
                    </span>
                    <span className="font-mono text-slate-500">Due {t.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts (if any) */}
          {lowStockItems.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Low Inventory Restock Warnings
                </span>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-[11px] font-semibold text-amber-300 hover:underline cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <p className="text-[11px] text-amber-200/80">
                {lowStockItems.length} items dropped below critical stock levels:
              </p>
              <div className="space-y-1">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-[11px] flex justify-between text-amber-100/90 font-mono">
                    <span>{item.name}</span>
                    <span className="font-bold text-amber-400">{item.quantity} left (min {item.minThreshold})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Activity & Audit Stream */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">Live Activity Feed</h2>
              </div>
              <button
                onClick={() => setActiveTab('audit-logs')}
                className="text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                All Logs
              </button>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.action === 'CREATE' ? 'bg-emerald-400' :
                    log.action === 'DELETE' ? 'bg-rose-400' :
                    log.action === 'STATUS_CHANGE' ? 'bg-purple-400' :
                    log.action === 'AI_INSIGHT' ? 'bg-cyan-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 font-medium text-[11px] leading-snug">{log.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{log.user}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
