import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Activity, 
  Sparkles, 
  PlusCircle, 
  Edit3, 
  Trash2,
  Database
} from 'lucide-react';
import { ActivityLog } from '../types';

interface AuditLogsViewProps {
  logs: ActivityLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('All');
  const [filterEntity, setFilterEntity] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesEntity = filterEntity === 'All' || log.entity === filterEntity;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      log.details.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q);

    return matchesAction && matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Immutable Audit & Telemetry Activity Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log tracking data mutations, authorization events, and AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {logs.length} Total Audit Records
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit details, actor, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="AI_INSIGHT">AI_INSIGHT</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Entity:</span>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Entities</option>
            <option value="Employee">Employee</option>
            <option value="Project">Project</option>
            <option value="Task">Task</option>
            <option value="Inventory">Inventory</option>
            <option value="Schema">Schema</option>
          </select>
        </div>
      </div>

      {/* Logs Stream List */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        {filteredLogs.map((log) => {
          const isAI = log.action === 'AI_INSIGHT';
          const isCreate = log.action === 'CREATE';
          const isDelete = log.action === 'DELETE';
          const isUpdate = log.action === 'UPDATE' || log.action === 'STATUS_CHANGE';

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isAI ? 'bg-purple-500/20 text-purple-300' :
                    isCreate ? 'bg-emerald-500/20 text-emerald-300' :
                    isDelete ? 'bg-rose-500/20 text-rose-300' :
                    'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {isAI ? <Sparkles className="w-4 h-4" /> :
                   isCreate ? <PlusCircle className="w-4 h-4" /> :
                   isDelete ? <Trash2 className="w-4 h-4" /> :
                   <Edit3 className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isAI ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        isCreate ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        isDelete ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-200">
                      [{log.entity}] {log.entityId}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{log.details}</p>
                </div>
              </div>

              {/* Timestamp & User */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-end text-[11px] text-slate-400 font-mono shrink-0">
                <span className="text-slate-300 font-sans flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  {log.user}
                </span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs">
            No audit log records match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
