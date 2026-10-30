import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StaffManagementView } from './components/StaffManagementView';
import { ProjectManagementView } from './components/ProjectManagementView';
import { TaskKanbanView } from './components/TaskKanbanView';
import { InventoryManagementView } from './components/InventoryManagementView';
import { SchemaStudioView } from './components/SchemaStudioView';
import { AICopilotView } from './components/AICopilotView';
import { AuditLogsView } from './components/AuditLogsView';
import { AuthView } from './components/AuthView';
import { SubscriptionView } from './components/SubscriptionView';
import { GitDocsHubModal } from './components/GitDocsHubModal';
import { 
  SystemStats, 
  Employee, 
  Project, 
  Task, 
  InventoryItem, 
  Department, 
  DatabaseSchema, 
  ActivityLog,
  ActiveTab,
  TaskStatus,
  SchemaColumn,
  AuthUser,
  PlanTier
} from './types';
import { 
  initialDatabaseSchema, 
  initialDepartments, 
  initialEmployees, 
  initialProjects, 
  initialTasks, 
  initialInventory, 
  initialActivityLogs 
} from './data/initialData';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function computeStats(
  empList: Employee[],
  projList: Project[],
  taskList: Task[],
  invList: InventoryItem[],
  deptList: Department[],
  logList: ActivityLog[]
): SystemStats {
  const totalEmployees = empList.length;
  const activeEmployees = empList.filter(e => e.status === 'Active' || e.status === 'Remote').length;
  const totalProjects = projList.length;
  const activeProjects = projList.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(t => t.status === 'Done').length;
  const totalInventoryValue = invList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockItemsCount = invList.filter(i => i.quantity <= i.minThreshold).length;
  const totalBudget = projList.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projList.reduce((sum, p) => sum + p.spent, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalEmployees,
    activeEmployees,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    totalInventoryValue,
    lowStockItemsCount,
    departmentCount: deptList.length,
    budgetUtilization,
    recentActivityCount: logList.length
  };
}

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Request to ${url} failed with status ${res.status}`);
      return fallback;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`Request to ${url} did not return JSON, received ${contentType}`);
      return fallback;
    }
    const json = await res.json();
    if (json && typeof json === 'object') {
      if ('success' in json && 'data' in json && json.data !== undefined) {
        return json.data as T;
      }
      return json as T;
    }
    return fallback;
  } catch (err) {
    console.warn(`SafeFetch error for ${url}:`, err);
    return fallback;
  }
}

export default function App() {
  // Authentication State: persistent session via localStorage
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('omni_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize with rich demo dataset immediately
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema>(initialDatabaseSchema);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [stats, setStats] = useState<SystemStats>(() => 
    computeStats(initialEmployees, initialProjects, initialTasks, initialInventory, initialDepartments, initialActivityLogs)
  );

  const [loading, setLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // GitHub & MySQL Docs Hub Modal + DML Permissions Mode (Safe Demo Mode: Delete Revoked for Students vs Full Admin DML)
  const [isGitDocsOpen, setIsGitDocsOpen] = useState(false);
  const [isDmlSafeMode, setIsDmlSafeMode] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('omni_auth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('omni_auth_user');
    } catch {
      // ignore
    }
    showToast('Signed out of workspace.');
  };

  const handleUpdateSubscription = async (plan: PlanTier, planBilling: 'monthly' | 'annually') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, plan, planBilling })
      });
      const data = await res.json().catch(() => null);
      const updatedUser: AuthUser = data?.data || {
        ...currentUser,
        plan,
        planBilling
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('omni_auth_user', JSON.stringify(updatedUser));
      fetchAllData();
    } catch {
      const updatedUser: AuthUser = {
        ...currentUser,
        plan,
        planBilling
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('omni_auth_user', JSON.stringify(updatedUser));
    }
  };

  // Fetch all live data from Express Backend
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statsData,
        empData,
        projData,
        taskData,
        invData,
        deptData,
        schemaData,
        logsData
      ] = await Promise.all([
        safeFetch<SystemStats | null>('/api/stats', null),
        safeFetch<Employee[]>('/api/employees', []),
        safeFetch<Project[]>('/api/projects', []),
        safeFetch<Task[]>('/api/tasks', []),
        safeFetch<InventoryItem[]>('/api/inventory', []),
        safeFetch<Department[]>('/api/departments', []),
        safeFetch<DatabaseSchema | null>('/api/schema', null),
        safeFetch<ActivityLog[]>('/api/audit-logs', [])
      ]);

      let currentEmp = employees;
      let currentProj = projects;
      let currentTask = tasks;
      let currentInv = inventory;
      let currentDept = departments;
      let currentLogs = auditLogs;

      if (Array.isArray(empData) && empData.length > 0) {
        setEmployees(empData);
        currentEmp = empData;
      }
      if (Array.isArray(projData) && projData.length > 0) {
        setProjects(projData);
        currentProj = projData;
      }
      if (Array.isArray(taskData) && taskData.length > 0) {
        setTasks(taskData);
        currentTask = taskData;
      }
      if (Array.isArray(invData) && invData.length > 0) {
        setInventory(invData);
        currentInv = invData;
      }
      if (Array.isArray(deptData) && deptData.length > 0) {
        setDepartments(deptData);
        currentDept = deptData;
      }
      if (schemaData && schemaData.tables) {
        setDatabaseSchema(schemaData);
      }
      if (Array.isArray(logsData) && logsData.length > 0) {
        setAuditLogs(logsData);
        currentLogs = logsData;
      }

      if (statsData) {
        setStats(statsData);
      } else {
        setStats(computeStats(currentEmp, currentProj, currentTask, currentInv, currentDept, currentLogs));
      }

      setServerOnline(true);
    } catch (err) {
      console.warn('Backend synchronization warning:', err);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, [employees, projects, tasks, inventory, departments, auditLogs]);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Seed Reset
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Sample dataset and database schemas reloaded successfully.');
        fetchAllData();
      } else {
        showToast('Reset completed locally.');
        setEmployees(initialEmployees);
        setProjects(initialProjects);
        setTasks(initialTasks);
        setInventory(initialInventory);
        setDepartments(initialDepartments);
        setDatabaseSchema(initialDatabaseSchema);
        setAuditLogs(initialActivityLogs);
        setStats(computeStats(initialEmployees, initialProjects, initialTasks, initialInventory, initialDepartments, initialActivityLogs));
      }
    } catch (err) {
      showToast('Reset completed locally.');
      setEmployees(initialEmployees);
      setProjects(initialProjects);
      setTasks(initialTasks);
      setInventory(initialInventory);
      setDepartments(initialDepartments);
      setDatabaseSchema(initialDatabaseSchema);
      setAuditLogs(initialActivityLogs);
      setStats(computeStats(initialEmployees, initialProjects, initialTasks, initialInventory, initialDepartments, initialActivityLogs));
    }
  };

  // Employee CRUD
  const handleAddEmployee = async (emp: Partial<Employee>) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const item = data.data || data;
        showToast(`Staff member "${item.name || 'Employee'}" added.`);
        fetchAllData();
      } else {
        const newEmp: Employee = {
          id: `emp-${Date.now()}`,
          name: emp.name || 'New Staff',
          email: emp.email || 'staff@omnigroup.io',
          phone: emp.phone || '+1 (555) 000-0000',
          role: emp.role || 'Specialist',
          department: emp.department || 'Engineering',
          salary: Number(emp.salary) || 85000,
          status: emp.status || 'Active',
          avatar: emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          skills: emp.skills || ['Management'],
          hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
          performanceRating: Number(emp.performanceRating) || 4.5
        };
        const updated = [newEmp, ...employees];
        setEmployees(updated);
        setStats(prev => ({ ...prev, totalEmployees: updated.length, activeEmployees: prev.activeEmployees + 1 }));
        showToast(`Staff member "${newEmp.name}" added.`);
      }
    } catch (err) {
      showToast('Error creating staff record.', 'error');
    }
  };

  const handleUpdateEmployee = async (id: string, emp: Partial<Employee>) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Staff record updated.');
        fetchAllData();
      } else {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...emp } : e));
        showToast('Staff record updated.');
      }
    } catch (err) {
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...emp } : e));
      showToast('Staff record updated.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Staff record deleted.');
        fetchAllData();
      } else {
        const updated = employees.filter(e => e.id !== id);
        setEmployees(updated);
        setStats(prev => ({ ...prev, totalEmployees: updated.length }));
        showToast('Staff record deleted.');
      }
    } catch (err) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      setStats(prev => ({ ...prev, totalEmployees: updated.length }));
      showToast('Staff record deleted.');
    }
  };

  // Project CRUD
  const handleAddProject = async (proj: Partial<Project>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const item = data.data || data;
        showToast(`Project initiative "${item.title || 'Project'}" registered.`);
        fetchAllData();
      } else {
        const newProj: Project = {
          id: `proj-${Date.now()}`,
          title: proj.title || 'New Initiative',
          code: proj.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
          description: proj.description || 'Strategic organizational initiative.',
          department: proj.department || 'Engineering',
          managerId: proj.managerId || 'emp-101',
          managerName: proj.managerName || 'Sarah Chen',
          status: proj.status || 'Planning',
          priority: proj.priority || 'Medium',
          startDate: proj.startDate || new Date().toISOString().split('T')[0],
          deadline: proj.deadline || '2026-12-31',
          budget: Number(proj.budget) || 50000,
          spent: Number(proj.spent) || 0,
          progress: Number(proj.progress) || 0,
          tags: proj.tags || ['Initiative']
        };
        const updated = [newProj, ...projects];
        setProjects(updated);
        setStats(prev => ({ ...prev, totalProjects: updated.length, activeProjects: prev.activeProjects + 1 }));
        showToast(`Project initiative "${newProj.title}" registered.`);
      }
    } catch (err) {
      showToast('Error registering project.', 'error');
    }
  };

  const handleUpdateProject = async (id: string, proj: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Project updated successfully.');
        fetchAllData();
      } else {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...proj } : p));
        showToast('Project updated successfully.');
      }
    } catch (err) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...proj } : p));
      showToast('Project updated successfully.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Project removed.');
        fetchAllData();
      } else {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        setStats(prev => ({ ...prev, totalProjects: updated.length }));
        showToast('Project removed.');
      }
    } catch (err) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      setStats(prev => ({ ...prev, totalProjects: updated.length }));
      showToast('Project removed.');
    }
  };

  // Task CRUD
  const handleAddTask = async (task: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const item = data.data || data;
        showToast(`Sprint ticket "${item.title || 'Task'}" created.`);
        fetchAllData();
      } else {
        const newTask: Task = {
          id: `tsk-${Date.now()}`,
          projectId: task.projectId || 'proj-01',
          projectTitle: task.projectTitle || 'General System Tasks',
          title: task.title || 'New Sprint Ticket',
          description: task.description || '',
          assigneeId: task.assigneeId || 'emp-101',
          assigneeName: task.assigneeName || 'Sarah Chen',
          assigneeAvatar: task.assigneeAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          status: task.status || 'To Do',
          priority: task.priority || 'Medium',
          dueDate: task.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          estimatedHours: Number(task.estimatedHours) || 8,
          completedHours: Number(task.completedHours) || 0,
          tags: task.tags || ['Task'],
          createdAt: new Date().toISOString().split('T')[0]
        };
        const updated = [newTask, ...tasks];
        setTasks(updated);
        setStats(prev => ({ ...prev, totalTasks: updated.length }));
        showToast(`Sprint ticket "${newTask.title}" created.`);
      }
    } catch (err) {
      showToast('Error creating task ticket.', 'error');
    }
  };

  const handleUpdateTask = async (id: string, task: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Ticket details updated.');
        fetchAllData();
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
        showToast('Ticket details updated.');
      }
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
      showToast('Ticket details updated.');
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast(`Task moved to ${status}.`);
        fetchAllData();
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        showToast(`Task moved to ${status}.`);
      }
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      showToast(`Task moved to ${status}.`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Sprint ticket deleted.');
        fetchAllData();
      } else {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        setStats(prev => ({ ...prev, totalTasks: updated.length }));
        showToast('Sprint ticket deleted.');
      }
    } catch (err) {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      setStats(prev => ({ ...prev, totalTasks: updated.length }));
      showToast('Sprint ticket deleted.');
    }
  };

  // Inventory CRUD
  const handleAddInventory = async (item: Partial<InventoryItem>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        const created = data.data || data;
        showToast(`Asset "${created.name || 'Item'}" added to catalog.`);
        fetchAllData();
      } else {
        const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          sku: (item.sku || `SKU-${Date.now()}`).toUpperCase(),
          name: item.name || 'New Hardware Asset',
          category: item.category || 'Hardware',
          quantity: Number(item.quantity) || 0,
          minThreshold: Number(item.minThreshold) || 5,
          unitPrice: Number(item.unitPrice) || 100,
          location: item.location || 'Warehouse Main',
          supplier: item.supplier || 'Standard Supplier Inc.',
          status: (Number(item.quantity) || 0) === 0 ? 'Out of Stock' : (Number(item.quantity) || 0) <= (Number(item.minThreshold) || 5) ? 'Low Stock' : 'In Stock',
          lastRestocked: new Date().toISOString().split('T')[0]
        };
        const updated = [newItem, ...inventory];
        setInventory(updated);
        setStats(prev => ({
          ...prev,
          totalInventoryValue: prev.totalInventoryValue + (newItem.quantity * newItem.unitPrice),
          lowStockItemsCount: newItem.quantity <= newItem.minThreshold ? prev.lowStockItemsCount + 1 : prev.lowStockItemsCount
        }));
        showToast(`Asset "${newItem.name}" added to catalog.`);
      }
    } catch (err) {
      showToast('Error adding inventory item.', 'error');
    }
  };

  const handleUpdateInventory = async (id: string, item: Partial<InventoryItem>) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Asset record updated.');
        fetchAllData();
      } else {
        setInventory(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
        showToast('Asset record updated.');
      }
    } catch (err) {
      setInventory(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
      showToast('Asset record updated.');
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast('Asset item removed.');
        fetchAllData();
      } else {
        setInventory(prev => prev.filter(i => i.id !== id));
        showToast('Asset item removed.');
      }
    } catch (err) {
      setInventory(prev => prev.filter(i => i.id !== id));
      showToast('Asset item removed.');
    }
  };

  // Custom Schema Table
  const handleAddCustomTable = async (tableData: {
    name: string;
    displayName: string;
    description: string;
    columns: SchemaColumn[];
  }) => {
    try {
      const res = await fetch('/api/schema/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        showToast(`Schema table "${tableData.name}" created.`);
        fetchAllData();
      } else {
        const newTable = {
          id: `tbl_${tableData.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: tableData.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: tableData.displayName || tableData.name,
          description: tableData.description || 'Custom dynamic entity model.',
          recordCount: 0,
          columns: tableData.columns
        };
        setDatabaseSchema(prev => ({
          ...prev,
          tables: [...prev.tables, newTable]
        }));
        showToast(`Schema table "${tableData.name}" created.`);
      }
    } catch (err) {
      showToast('Error creating schema table.', 'error');
    }
  };

  // AI Copilot Server Call
  const handleRunAICopilot = async (prompt: string, actionType?: string) => {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, actionType })
      });
      const data = await res.json().catch(() => null);
      if (data && (data.success || data.analysis || data.data)) {
        return {
          source: data.source || 'gemini-3.7-flash',
          analysis: data.analysis || (data.data && data.data.analysis) || ''
        };
      }
      throw new Error(data?.error || 'Copilot service responded with an error.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Copilot error';
      console.warn('AI copilot error:', err);
      return {
        source: 'smart-heuristic-copilot',
        analysis: `### 📊 OmniManage Executive Intelligence Briefing\n\n- **Personnel**: ${stats.totalEmployees} team members active across ${stats.departmentCount} departments.\n- **Active Projects**: ${stats.activeProjects} initiatives with ${stats.budgetUtilization}% budget utilization.\n- **Sprint Queue**: ${tasks.filter(t => t.priority === 'Urgent').length} urgent tickets pending triage.\n- **Action Item**: Review high-priority items and restock items with low threshold.`
      };
    }
  };

  const handleOpenQuickAdd = (type: string = 'task') => {
    if (type === 'employee') setActiveTab('employees');
    else if (type === 'project') setActiveTab('projects');
    else if (type === 'inventory') setActiveTab('inventory');
    else setActiveTab('tasks');
  };

  // IF NOT AUTHENTICATED: Display Login & Sign Up page FIRST for clients
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
        <AuthView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div
              className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-medium ${
                notification.type === 'success'
                  ? 'bg-slate-900 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                  : 'bg-slate-900 border-rose-500/50 text-rose-300 shadow-rose-950/40'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AFTER AUTHENTICATION: Show the complete client management workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        serverOnline={serverOnline}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetSeed={handleResetData}
        onOpenQuickAdd={() => handleOpenQuickAdd('task')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenGitDocs={() => setIsGitDocsOpen(true)}
        isDmlSafeMode={isDmlSafeMode}
        onToggleDmlMode={(mode) => {
          setIsDmlSafeMode(mode);
          showToast(mode ? 'Safe Demo Mode Activated: Delete rights revoked.' : 'SuperAdmin Mode Activated: Full DML Unlocked.');
        }}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          schemaTableCount={databaseSchema.tables.length}
          currentUser={currentUser}
          onOpenGitDocs={() => setIsGitDocsOpen(true)}
        />

        {/* Content View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/60">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                employees={employees}
                projects={projects}
                tasks={tasks}
                inventory={inventory}
                activityLogs={auditLogs}
                departments={departments}
                setActiveTab={setActiveTab}
                onOpenQuickAdd={handleOpenQuickAdd}
              />
            )}

            {activeTab === 'employees' && (
              <StaffManagementView
                employees={employees}
                departments={departments}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectManagementView
                projects={projects}
                employees={employees}
                departments={departments}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskKanbanView
                tasks={tasks}
                projects={projects}
                employees={employees}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManagementView
                inventory={inventory}
                onAddInventory={handleAddInventory}
                onUpdateInventory={handleUpdateInventory}
                onDeleteInventory={handleDeleteInventory}
                isDmlSafeMode={isDmlSafeMode}
                onToggleDmlMode={(mode) => {
                  setIsDmlSafeMode(mode);
                  showToast(mode ? 'Safe Demo Mode Activated: Delete rights revoked.' : 'SuperAdmin Mode Activated: Full DML Unlocked.');
                }}
              />
            )}

            {activeTab === 'schema' && (
              <SchemaStudioView
                databaseSchema={databaseSchema}
                employees={employees}
                projects={projects}
                tasks={tasks}
                inventory={inventory}
                departments={departments}
                auditLogs={auditLogs}
                onAddCustomTable={handleAddCustomTable}
              />
            )}

            {activeTab === 'ai-copilot' && (
              <AICopilotView onRunAnalysis={handleRunAICopilot} />
            )}

            {activeTab === 'audit-logs' && (
              <AuditLogsView logs={auditLogs} />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionView
                currentUser={currentUser}
                stats={stats}
                onUpdateSubscription={handleUpdateSubscription}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* GitHub Repository & MySQL Presentation Hub Modal */}
      <GitDocsHubModal
        isOpen={isGitDocsOpen}
        onClose={() => setIsGitDocsOpen(false)}
        isDmlSafeMode={isDmlSafeMode}
        onToggleDmlMode={(mode) => {
          setIsDmlSafeMode(mode);
          showToast(mode ? 'Safe Demo Mode Activated: Delete rights revoked.' : 'SuperAdmin Mode Activated: Full DML Unlocked.');
        }}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                : 'bg-slate-900 border-rose-500/50 text-rose-300 shadow-rose-950/40'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
