import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Briefcase, 
  Star, 
  Trash2, 
  Edit3, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { Employee, Department, DepartmentName, EmployeeStatus } from '../types';

interface StaffManagementViewProps {
  employees: Employee[];
  departments: Department[];
  onAddEmployee: (emp: Partial<Employee>) => Promise<void>;
  onUpdateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  employees,
  departments,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering' as DepartmentName,
    salary: 110000,
    status: 'Active' as EmployeeStatus,
    skills: '',
    performanceRating: 4.5,
    hireDate: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      email: '',
      phone: '+1 (555) ',
      role: '',
      department: 'Engineering',
      salary: 110000,
      status: 'Active',
      skills: 'TypeScript, React, Node.js',
      performanceRating: 4.8,
      hireDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department,
      salary: emp.salary,
      status: emp.status,
      skills: emp.skills.join(', '),
      performanceRating: emp.performanceRating,
      hireDate: emp.hireDate
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      skills: skillsArray,
      salary: Number(formData.salary),
      performanceRating: Number(formData.performanceRating)
    };

    if (editingEmp) {
      await onUpdateEmployee(editingEmp.id, payload);
    } else {
      await onAddEmployee(payload);
    }
    setIsModalOpen(false);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch = !search || 
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.skills.some(s => s.toLowerCase().includes(q));

    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Staff & Organizational Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage organizational workforce, skill matrices, compensation, and active statuses.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, email or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Department Filter */}
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Remote">Remote</option>
            <option value="On Leave">On Leave</option>
            <option value="In Review">In Review</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Header: Avatar, Name, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{emp.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{emp.role}</p>
                    <span className="text-[11px] text-slate-400">{emp.department}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 border ${
                    emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    emp.status === 'Remote' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                    emp.status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-slate-700/50 text-slate-300 border-slate-600'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* Contact & Compensation Details */}
              <div className="mt-3.5 space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{emp.phone}</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    ${emp.salary.toLocaleString()}/yr
                  </span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {emp.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Rating & Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-semibold text-slate-200">{emp.performanceRating}</span>
                <span className="text-[10px] text-slate-500">/ 5.0</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${emp.name}?`)) {
                      onDeleteEmployee(emp.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <p className="text-sm text-slate-400">No employees match the specified filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedDept('All'); setSelectedStatus('All'); }}
            className="text-xs text-indigo-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                {editingEmp ? 'Edit Employee Record' : 'Add New Staff Member'}
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
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Elena Rostova"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="elena@omnigroup.io"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Lead Architect"
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
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Base Salary (USD)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Employment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Remote">Remote</option>
                    <option value="On Leave">On Leave</option>
                    <option value="In Review">In Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Performance Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.performanceRating}
                    onChange={(e) => setFormData({ ...formData, performanceRating: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Core Competencies / Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Distributed Systems, PostgreSQL, Cloud Run"
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
                  {editingEmp ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
