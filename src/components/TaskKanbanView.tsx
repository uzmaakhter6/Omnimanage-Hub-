import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit3, 
  X,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Task, Project, Employee, TaskStatus, TaskPriority } from '../types';

interface TaskKanbanViewProps {
  tasks: Task[];
  projects: Project[];
  employees: Employee[];
  onAddTask: (task: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, task: Partial<Task>) => Promise<void>;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'Backlog', label: 'Sprint Backlog', color: 'border-slate-700 bg-slate-900/40 text-slate-400' },
  { id: 'To Do', label: 'To Do Queue', color: 'border-cyan-800/60 bg-cyan-950/20 text-cyan-400' },
  { id: 'In Progress', label: 'In Active Flight', color: 'border-indigo-800/60 bg-indigo-950/20 text-indigo-400' },
  { id: 'In Review', label: 'Code & QA Review', color: 'border-purple-800/60 bg-purple-950/20 text-purple-400' },
  { id: 'Done', label: 'Completed', color: 'border-emerald-800/60 bg-emerald-950/20 text-emerald-400' },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  projects,
  employees,
  onAddTask,
  onUpdateTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id || 'proj-01',
    assigneeId: employees[0]?.id || 'emp-101',
    status: 'To Do' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    estimatedHours: 8,
    completedHours: 0,
    tags: 'API, Core'
  });

  const handleOpenAdd = (defaultStatus: TaskStatus = 'To Do') => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: projects[0]?.id || 'proj-01',
      assigneeId: employees[0]?.id || 'emp-101',
      status: defaultStatus,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: 12,
      completedHours: 0,
      tags: 'Sprint, Task'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      description: t.description,
      projectId: t.projectId,
      assigneeId: t.assigneeId,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      estimatedHours: t.estimatedHours,
      completedHours: t.completedHours,
      tags: t.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const project = projects.find(p => p.id === formData.projectId);
    const assignee = employees.find(e => e.id === formData.assigneeId);

    const payload = {
      ...formData,
      tags: tagsArray,
      projectTitle: project ? project.title : 'General Project',
      assigneeName: assignee ? assignee.name : 'Unassigned',
      assigneeAvatar: assignee ? assignee.avatar : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      estimatedHours: Number(formData.estimatedHours),
      completedHours: Number(formData.completedHours)
    };

    if (editingTask) {
      await onUpdateTask(editingTask.id, payload);
    } else {
      await onAddTask(payload);
    }
    setIsModalOpen(false);
  };

  // Next / Prev status transitions
  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  const filteredTasks = tasks.filter(t => {
    const matchesProj = selectedProject === 'All' || t.projectId === selectedProject;
    const matchesAssignee = selectedAssignee === 'All' || t.assigneeId === selectedAssignee;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assigneeName.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q));

    return matchesProj && matchesAssignee && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-indigo-400" />
            <span>Interactive Sprint Kanban Board</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track workload execution across sprint phases, manage assignees, and progress story points.
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd('To Do')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sprint Ticket</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by title, description or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Assignee:</span>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Assignees</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban 5 Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 space-y-3 min-w-[260px] flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'Done' ? 'bg-emerald-400' :
                    col.id === 'In Progress' ? 'bg-indigo-400' :
                    col.id === 'In Review' ? 'bg-purple-400' :
                    col.id === 'To Do' ? 'bg-cyan-400' : 'bg-slate-400'
                  }`} />
                  <h2 className="text-xs font-bold text-slate-200">{col.label}</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 flex-1">
                {colTasks.map((t) => {
                  const nextStatus = getNextStatus(t.status);
                  const prevStatus = getPrevStatus(t.status);

                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all space-y-2.5 group shadow-sm"
                    >
                      {/* Top: Priority & Project */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="font-mono text-indigo-300 font-semibold truncate max-w-[130px]">
                          {t.projectTitle}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${
                          t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-slate-700/60 text-slate-400 border-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-semibold text-slate-100 leading-snug">
                        {t.title}
                      </h3>

                      {/* Description if present */}
                      {t.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Assignee & Due Date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-700/40">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={t.assigneeAvatar}
                            alt={t.assigneeName}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate max-w-[90px] text-slate-300">{t.assigneeName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {t.dueDate}
                        </span>
                      </div>

                      {/* Hours bar & Action controls */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <span>{t.completedHours}h/{t.estimatedHours}h</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {prevStatus && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, prevStatus)}
                              title={`Move back to ${prevStatus}`}
                              className="p-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Edit task"
                            className="p-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete task "${t.title}"?`)) {
                                onDeleteTask(t.id);
                              }
                            }}
                            title="Delete task"
                            className="p-1 rounded bg-slate-700/60 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, nextStatus)}
                              title={`Move forward to ${nextStatus}`}
                              className="p-1 rounded bg-indigo-600/60 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg text-[11px] text-slate-500">
                    No tickets in {col.label}
                  </div>
                )}
              </div>

              {/* Quick Add at column bottom */}
              <button
                onClick={() => handleOpenAdd(col.id)}
                className="w-full py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Ticket</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                {editingTask ? 'Edit Sprint Ticket' : 'Create Sprint Ticket'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Task Title / Headline</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Implement OpenTelemetry distributed tracing"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Detailed Description / Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Describe technical requirements, expected inputs/outputs, and edge cases..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Parent Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>[{p.code}] {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Assignee</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Status Column</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Completed Hours</label>
                  <input
                    type="number"
                    value={formData.completedHours}
                    onChange={(e) => setFormData({ ...formData, completedHours: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="API, Database, Refactor"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {editingTask ? 'Save Changes' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
