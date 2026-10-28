import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  X,
  Layers,
  Calendar
} from 'lucide-react';
import { Project, Employee, Department, DepartmentName, ProjectStatus, TaskPriority } from '../types';

interface ProjectManagementViewProps {
  projects: Project[];
  employees: Employee[];
  departments: Department[];
  onAddProject: (proj: Partial<Project>) => Promise<void>;
  onUpdateProject: (id: string, proj: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({
  projects,
  employees,
  departments,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    department: 'Engineering' as DepartmentName,
    managerId: employees[0]?.id || 'emp-101',
    status: 'In Progress' as ProjectStatus,
    priority: 'High' as TaskPriority,
    startDate: new Date().toISOString().split('T')[0],
    deadline: '2026-11-30',
    budget: 80000,
    spent: 25000,
    progress: 40,
    tags: 'Backend, API, Cloud'
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      department: 'Engineering',
      managerId: employees[0]?.id || 'emp-101',
      status: 'In Progress',
      priority: 'High',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '2026-12-31',
      budget: 75000,
      spent: 10000,
      progress: 20,
      tags: 'Strategic, Core'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      code: p.code,
      description: p.description,
      department: p.department,
      managerId: p.managerId,
      status: p.status,
      priority: p.priority,
      startDate: p.startDate,
      deadline: p.deadline,
      budget: p.budget,
      spent: p.spent,
      progress: p.progress,
      tags: p.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const manager = employees.find(e => e.id === formData.managerId);

    const payload = {
      ...formData,
      tags: tagsArray,
      managerName: manager ? manager.name : 'Sarah Chen',
      budget: Number(formData.budget),
      spent: Number(formData.spent),
      progress: Number(formData.progress)
    };

    if (editingProject) {
      await onUpdateProject(editingProject.id, payload);
    } else {
      await onAddProject(payload);
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.managerName.toLowerCase().includes(q);

    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span>Strategic Project Initiatives</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor organizational roadmap progress, milestone deadlines, and financial budget burns.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Initiative</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, title, manager or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Header: Code & Title */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {p.code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      p.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      p.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {p.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1.5">{p.title}</h3>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 border ${
                  p.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  p.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  p.status === 'In Review' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  p.status === 'Planning' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                  'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {p.description}
              </p>

              {/* Progress & Milestone */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Milestone: {p.progress}%</span>
                  <span className="text-slate-400">${p.spent.toLocaleString()} spent of ${p.budget.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.progress === 100 ? 'bg-emerald-400' :
                      p.progress >= 70 ? 'bg-indigo-500' :
                      p.progress >= 40 ? 'bg-blue-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {p.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Details */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Lead: <strong className="text-slate-200 font-medium">{p.managerName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {p.deadline}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit project"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove project [${p.code}] ${p.title}?`)) {
                      onDeleteProject(p.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                {editingProject ? 'Edit Initiative' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Core API v3 Migration"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="PRJ-CORE"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentName })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Lead Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
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
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Budget Allocation ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Spent Budget ($)</label>
                  <input
                    type="number"
                    value={formData.spent}
                    onChange={(e) => setFormData({ ...formData, spent: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Initiative Objective / Scope</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Describe key outcomes and deliverables..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Infrastructure, Security, Q4"
                />
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
