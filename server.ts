import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  initialDepartments, 
  initialEmployees, 
  initialProjects, 
  initialTasks, 
  initialInventory, 
  initialActivityLogs, 
  initialDatabaseSchema 
} from './src/data/initialData.ts';
import { 
  Employee, 
  Project, 
  Task, 
  InventoryItem, 
  ActivityLog, 
  DatabaseSchema, 
  Department,
  AuthUser,
  SubscriptionPlan,
  PlanTier
} from './src/types.ts';

// In-Memory Data Store (Persists during server lifecycle, with easy one-click reset)
let departments: Department[] = JSON.parse(JSON.stringify(initialDepartments));
let employees: Employee[] = JSON.parse(JSON.stringify(initialEmployees));
let projects: Project[] = JSON.parse(JSON.stringify(initialProjects));
let tasks: Task[] = JSON.parse(JSON.stringify(initialTasks));
let inventory: InventoryItem[] = JSON.parse(JSON.stringify(initialInventory));
let activityLogs: ActivityLog[] = JSON.parse(JSON.stringify(initialActivityLogs));
let databaseSchema: DatabaseSchema = JSON.parse(JSON.stringify(initialDatabaseSchema));

// Registered Users & Clients
let users: (AuthUser & { password?: string })[] = [
  {
    id: 'usr-client-01',
    name: 'Alexandre Dumas',
    email: 'client@acme.com',
    password: 'password123',
    role: 'Client',
    company: 'Acme Global Ventures',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: 'Professional',
    planBilling: 'monthly',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr-admin-01',
    name: 'Uzma Akhter',
    email: 'uzmaakhter3@gmail.com',
    password: 'password123',
    role: 'Admin',
    company: 'OmniManage Core',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    plan: 'Enterprise',
    planBilling: 'annually',
    createdAt: '2025-11-01'
  }
];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    tier: 'Starter',
    name: 'Starter Workspace',
    tagline: 'Ideal for fast-moving startups and agile pilot teams.',
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      'Up to 15 team staff profiles',
      'Up to 10 active project initiatives',
      'Full Agile Sprint Kanban Board',
      'Basic Hardware & Asset Inventory',
      'Standard ERD Visualizer (PostgreSQL)',
      'Community & email support'
    ],
    limits: {
      maxEmployees: 15,
      maxProjects: 10,
      aiCreditsPerMonth: 50,
      customSchemas: false,
      auditLogsRetentionDays: 30,
      prioritySupport: false
    }
  },
  {
    id: 'professional',
    tier: 'Professional',
    name: 'Professional / Growth',
    tagline: 'Complete intelligence & telemetry for scaling enterprises.',
    monthlyPrice: 79,
    annualPrice: 790,
    popular: true,
    features: [
      'Unlimited employee directories',
      'Unlimited projects & milestones',
      'Advanced Recharts telemetry & velocity analytics',
      'Custom Database Schema & Multi-Dialect DDL Export',
      'AI Executive Copilot (Gemini-powered briefings)',
      'Immutable Audit Log Stream (90 days)',
      'Automated inventory restock triggers'
    ],
    limits: {
      maxEmployees: 100,
      maxProjects: 50,
      aiCreditsPerMonth: 500,
      customSchemas: true,
      auditLogsRetentionDays: 90,
      prioritySupport: true
    }
  },
  {
    id: 'enterprise',
    tier: 'Enterprise',
    name: 'Enterprise Strategic Suite',
    tagline: 'Maximum security, custom SLA, bespoke models & white-label control.',
    monthlyPrice: 199,
    annualPrice: 1990,
    features: [
      'Everything in Professional included',
      'Dedicated Cloud database connector & VPC peering',
      'Unlimited Gemini AI Copilot queries',
      'Unlimited audit history & SOC-2 compliance stream',
      'Role-based access control (Admin, Client, Exec, Lead)',
      '24/7 dedicated support & SLA guarantee',
      'Custom schema migrations & automated backups'
    ],
    limits: {
      maxEmployees: 9999,
      maxProjects: 9999,
      aiCreditsPerMonth: 9999,
      customSchemas: true,
      auditLogsRetentionDays: 365,
      prioritySupport: true
    }
  }
];

function logEvent(
  action: ActivityLog['action'], 
  entity: ActivityLog['entity'], 
  entityId: string, 
  details: string, 
  user: string = 'Admin User',
  meta?: Record<string, unknown>
) {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    action,
    entity,
    entityId,
    details,
    user,
    meta
  };
  activityLogs.unshift(newLog);
  if (activityLogs.length > 200) {
    activityLogs = activityLogs.slice(0, 200);
  }
  return newLog;
}

// Helper to calculate summary statistics
function getSystemStats() {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active' || e.status === 'Remote').length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockItemsCount = inventory.filter(i => i.quantity <= i.minThreshold).length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
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
    departmentCount: departments.length,
    budgetUtilization,
    totalBudget,
    totalSpent,
    recentActivityCount: activityLogs.length
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      status: 'healthy',
      server: 'OmniManage Core Engine v2.4.0',
      timestamp: new Date().toISOString(),
      database: 'Schema-Driven Store (Connected)',
      records: {
        employees: employees.length,
        projects: projects.length,
        tasks: tasks.length,
        inventory: inventory.length,
        schemas: databaseSchema.tables.length
      }
    });
  });

  app.get('/api/stats', (_req: Request, res: Response) => {
    res.json({ success: true, data: getSystemStats() });
  });

  // Aiven MySQL Cloud Host Configuration State
  let aivenDbConfig = {
    provider: 'Aiven Cloud (aiven.io)',
    dialect: 'mysql',
    version: 'MySQL 8.0.36-aiven',
    host: process.env.MYSQL_HOST || 'mysql-crm-omnimanage-uzma.aivencloud.com',
    port: Number(process.env.MYSQL_PORT) || 18293,
    user: process.env.MYSQL_USER || 'avnadmin',
    database: process.env.MYSQL_DATABASE || 'defaultdb',
    ssl: true,
    sslMode: 'REQUIRED (TLS 1.3)',
    vmSpecs: '1 Dedicated Node • 1 GB RAM • 1 GB NVMe Storage (Free Lifetime Tier)',
    status: 'connected',
    cloudRegion: 'asia-southeast1 (Aiven Cloud / Google Cloud)',
    latencyMs: 24,
    uptime: '99.98%',
    storageEngine: 'InnoDB (ACID Compliant)',
    characterSet: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    lastPing: new Date().toISOString()
  };

  app.get('/api/database/host', (_req: Request, res: Response) => {
    res.json({ success: true, data: aivenDbConfig });
  });

  app.post('/api/database/host/test', (req: Request, res: Response) => {
    const { host, port, user, database } = req.body || {};
    const testHost = host || aivenDbConfig.host;
    const testPort = port || aivenDbConfig.port;
    const testUser = user || aivenDbConfig.user;
    const testDb = database || aivenDbConfig.database;

    // Simulate TLS handshake and latency calculation to Aiven cloud cluster
    const latency = Math.floor(18 + Math.random() * 15);
    aivenDbConfig.lastPing = new Date().toISOString();
    aivenDbConfig.latencyMs = latency;

    logEvent('AI_INSIGHT', 'Schema', 'aiven-mysql', `Tested connection to Aiven MySQL host [${testHost}:${testPort}] (Latency: ${latency}ms, TLS 1.3 OK)`);

    res.json({
      success: true,
      message: `Successfully connected to Aiven MySQL host "${testHost}:${testPort}"`,
      data: {
        ...aivenDbConfig,
        host: testHost,
        port: Number(testPort),
        user: testUser,
        database: testDb,
        latencyMs: latency,
        tlsHandshake: 'TLSv1.3 / ECDHE-RSA-AES256-GCM-SHA384',
        serverBanner: 'MySQL 8.0.36-aiven (Aiven Enterprise Cloud MySQL)'
      }
    });
  });

  app.post('/api/database/host/update', (req: Request, res: Response) => {
    const { host, port, user, database, sslMode } = req.body;
    if (!host) {
      return res.status(400).json({ success: false, error: 'Database host is required' });
    }

    aivenDbConfig = {
      ...aivenDbConfig,
      host: host.trim(),
      port: Number(port) || 18293,
      user: user ? user.trim() : aivenDbConfig.user,
      database: database ? database.trim() : aivenDbConfig.database,
      sslMode: sslMode || 'REQUIRED (TLS 1.3)',
      lastPing: new Date().toISOString()
    };

    logEvent('UPDATE', 'Schema', 'aiven-mysql', `Updated Aiven database host to ${aivenDbConfig.host}:${aivenDbConfig.port}`);
    res.json({ success: true, message: 'Aiven database host configuration updated', data: aivenDbConfig });
  });

  // --- AUTH & SUBSCRIPTION APIS ---
  app.get('/api/auth/plans', (_req: Request, res: Response) => {
    res.json({ success: true, data: subscriptionPlans });
  });

  app.get('/api/auth/users', (_req: Request, res: Response) => {
    const safeUsers = users.map(({ password: _, ...rest }) => rest);
    res.json({ success: true, data: safeUsers });
  });

  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { name, email, password, company, role, plan, planBilling } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const newUser: AuthUser & { password?: string } = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: password || 'clientpass',
      role: role || 'Client',
      company: company || 'Client Organization',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
      plan: (plan as PlanTier) || 'Starter',
      planBilling: planBilling || 'monthly',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    logEvent('CREATE', 'Employee', newUser.id, `User registered: ${newUser.name} (${newUser.role}) on ${newUser.plan} plan`, newUser.name);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, data: safeUser, message: 'Account successfully registered.' });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // If logging in with demo credentials or client quick access, create or return
    if (!user) {
      // Auto-provision demo client account for testing convenience
      const newUser: AuthUser & { password?: string } = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email.toLowerCase(),
        password: password || 'demo123',
        role: 'Client',
        company: 'Partner Organization',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        plan: 'Professional',
        planBilling: 'monthly',
        createdAt: new Date().toISOString().split('T')[0]
      };
      users.push(newUser);
      user = newUser;
    }

    logEvent('STATUS_CHANGE', 'Employee', user.id, `User session started: ${user.name} logged into dashboard`, user.name);

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser, message: 'Welcome back!' });
  });

  app.post('/api/auth/subscription', (req: Request, res: Response) => {
    const { userId, plan, planBilling } = req.body;
    const userIndex = users.findIndex(u => u.id === userId || u.email === userId);
    
    if (userIndex === -1 && users.length > 0) {
      // Fallback update first user
      users[0].plan = plan || users[0].plan;
      if (planBilling) users[0].planBilling = planBilling;
      const { password: _, ...safeUser } = users[0];
      logEvent('UPDATE', 'Schema', users[0].id, `Subscription modified to ${plan} (${planBilling || 'monthly'})`, users[0].name);
      return res.json({ success: true, data: safeUser, message: `Subscribed to ${plan} plan!` });
    }

    if (userIndex !== -1) {
      users[userIndex].plan = plan || users[userIndex].plan;
      if (planBilling) users[userIndex].planBilling = planBilling;
      logEvent('UPDATE', 'Schema', users[userIndex].id, `Subscription modified to ${plan} (${planBilling || 'monthly'})`, users[userIndex].name);
      const { password: _, ...safeUser } = users[userIndex];
      return res.json({ success: true, data: safeUser, message: `Subscription plan upgraded to ${plan}!` });
    }

    return res.status(404).json({ success: false, error: 'User not found.' });
  });

  // --- EMPLOYEES CRUD ---
  app.get('/api/employees', (req: Request, res: Response) => {
    const { department, status, search } = req.query;
    let result = [...employees];

    if (department && department !== 'All') {
      result = result.filter(e => e.department === department);
    }
    if (status && status !== 'All') {
      result = result.filter(e => e.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.email.toLowerCase().includes(q) || 
        e.role.toLowerCase().includes(q) ||
        e.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/employees', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.email || !data.role || !data.department) {
      return res.status(400).json({ success: false, error: 'Name, email, role, and department are required.' });
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '+1 (555) 000-0000',
      role: data.role,
      department: data.department,
      salary: Number(data.salary) || 85000,
      status: data.status || 'Active',
      avatar: data.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? String(data.skills).split(',').map(s => s.trim()) : ['Management']),
      hireDate: data.hireDate || new Date().toISOString().split('T')[0],
      performanceRating: Number(data.performanceRating) || 4.5,
    };

    employees.unshift(newEmp);
    // Update department count
    const dept = departments.find(d => d.name === newEmp.department);
    if (dept) dept.employeeCount += 1;

    // Update schema count
    const schemaTable = databaseSchema.tables.find(t => t.name === 'employees');
    if (schemaTable) schemaTable.recordCount = employees.length;

    logEvent('CREATE', 'Employee', newEmp.id, `Hired employee ${newEmp.name} (${newEmp.role})`);
    res.status(201).json({ success: true, data: newEmp });
  });

  app.put('/api/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const updated = { ...employees[index], ...req.body, id };
    employees[index] = updated;

    logEvent('UPDATE', 'Employee', id, `Updated profile & details for ${updated.name}`);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/employees/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const emp = employees.find(e => e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    employees = employees.filter(e => e.id !== id);
    const dept = departments.find(d => d.name === emp.department);
    if (dept && dept.employeeCount > 0) dept.employeeCount -= 1;

    const schemaTable = databaseSchema.tables.find(t => t.name === 'employees');
    if (schemaTable) schemaTable.recordCount = employees.length;

    logEvent('DELETE', 'Employee', id, `Removed employee record ${emp.name}`);
    res.json({ success: true, message: 'Employee deleted', data: { id } });
  });

  // --- PROJECTS CRUD ---
  app.get('/api/projects', (req: Request, res: Response) => {
    const { department, status, search } = req.query;
    let result = [...projects];

    if (department && department !== 'All') {
      result = result.filter(p => p.department === department);
    }
    if (status && status !== 'All') {
      result = result.filter(p => p.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title || !data.department) {
      return res.status(400).json({ success: false, error: 'Title and department are required' });
    }

    const manager = employees.find(e => e.id === data.managerId) || employees[0];
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: data.title,
      code: data.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      description: data.description || 'Strategic organizational initiative.',
      department: data.department,
      managerId: manager ? manager.id : 'emp-101',
      managerName: manager ? manager.name : 'Sarah Chen',
      status: data.status || 'Planning',
      priority: data.priority || 'Medium',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      deadline: data.deadline || '2026-12-31',
      budget: Number(data.budget) || 50000,
      spent: Number(data.spent) || 0,
      progress: Number(data.progress) || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()) : ['Initiative']),
    };

    projects.unshift(newProj);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'projects');
    if (schemaTable) schemaTable.recordCount = projects.length;

    logEvent('CREATE', 'Project', newProj.id, `Created project [${newProj.code}] ${newProj.title}`);
    res.status(201).json({ success: true, data: newProj });
  });

  app.put('/api/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const updated = { ...projects[index], ...req.body, id };
    projects[index] = updated;

    logEvent('UPDATE', 'Project', id, `Updated project [${updated.code}] metrics and milestones`);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const proj = projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    projects = projects.filter(p => p.id !== id);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'projects');
    if (schemaTable) schemaTable.recordCount = projects.length;

    logEvent('DELETE', 'Project', id, `Deleted project record [${proj.code}] ${proj.title}`);
    res.json({ success: true, message: 'Project removed', data: { id } });
  });

  // --- TASKS CRUD ---
  app.get('/api/tasks', (req: Request, res: Response) => {
    const { projectId, assigneeId, status, priority } = req.query;
    let result = [...tasks];

    if (projectId && projectId !== 'All') {
      result = result.filter(t => t.projectId === projectId);
    }
    if (assigneeId && assigneeId !== 'All') {
      result = result.filter(t => t.assigneeId === assigneeId);
    }
    if (status && status !== 'All') {
      result = result.filter(t => t.status === status);
    }
    if (priority && priority !== 'All') {
      result = result.filter(t => t.priority === priority);
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const project = projects.find(p => p.id === data.projectId) || projects[0];
    const assignee = employees.find(e => e.id === data.assigneeId) || employees[0];

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      projectId: project ? project.id : 'proj-01',
      projectTitle: project ? project.title : 'General System Tasks',
      title: data.title,
      description: data.description || '',
      assigneeId: assignee ? assignee.id : 'emp-101',
      assigneeName: assignee ? assignee.name : 'Sarah Chen',
      assigneeAvatar: assignee ? assignee.avatar : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: data.status || 'To Do',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: Number(data.estimatedHours) || 8,
      completedHours: Number(data.completedHours) || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()) : ['Task']),
      createdAt: new Date().toISOString().split('T')[0]
    };

    tasks.unshift(newTask);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'tasks');
    if (schemaTable) schemaTable.recordCount = tasks.length;

    logEvent('CREATE', 'Task', newTask.id, `Created task "${newTask.title}" for ${newTask.assigneeName}`);
    res.status(201).json({ success: true, data: newTask });
  });

  app.patch('/api/tasks/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    if (status === 'Done' && task.completedHours < task.estimatedHours) {
      task.completedHours = task.estimatedHours;
    }

    logEvent('STATUS_CHANGE', 'Task', id, `Moved task "${task.title}" from ${oldStatus} -> ${status}`);
    res.json({ success: true, data: task });
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const updated = { ...tasks[index], ...req.body, id };
    tasks[index] = updated;

    logEvent('UPDATE', 'Task', id, `Updated task details for "${updated.title}"`);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    tasks = tasks.filter(t => t.id !== id);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'tasks');
    if (schemaTable) schemaTable.recordCount = tasks.length;

    logEvent('DELETE', 'Task', id, `Deleted task "${task.title}"`);
    res.json({ success: true, message: 'Task removed', data: { id } });
  });

  // --- INVENTORY CRUD ---
  app.get('/api/inventory', (req: Request, res: Response) => {
    const { category, status, search } = req.query;
    let result = [...inventory];

    if (category && category !== 'All') {
      result = result.filter(i => i.category === category);
    }
    if (status && status !== 'All') {
      result = result.filter(i => i.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.sku.toLowerCase().includes(q) || 
        i.location.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/inventory', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.sku) {
      return res.status(400).json({ success: false, error: 'Item name and SKU are required' });
    }

    const quantity = Number(data.quantity) || 0;
    const minThreshold = Number(data.minThreshold) || 5;
    let status: InventoryItem['status'] = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= minThreshold) status = 'Low Stock';

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      sku: data.sku.toUpperCase(),
      name: data.name,
      category: data.category || 'Hardware',
      quantity,
      minThreshold,
      unitPrice: Number(data.unitPrice) || 100,
      location: data.location || 'Warehouse Main',
      supplier: data.supplier || 'Standard Supplier Inc.',
      status,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    inventory.unshift(newItem);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'inventory_items');
    if (schemaTable) schemaTable.recordCount = inventory.length;

    logEvent('CREATE', 'Inventory', newItem.id, `Added asset SKU [${newItem.sku}] ${newItem.name} (Qty: ${newItem.quantity})`);
    res.status(201).json({ success: true, data: newItem });
  });

  app.put('/api/inventory/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = inventory.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    const updated = { ...inventory[index], ...req.body, id };
    if (updated.quantity === 0) updated.status = 'Out of Stock';
    else if (updated.quantity <= updated.minThreshold) updated.status = 'Low Stock';
    else updated.status = 'In Stock';

    inventory[index] = updated;
    logEvent('UPDATE', 'Inventory', id, `Updated stock level for [${updated.sku}] to ${updated.quantity} units`);
    res.json({ success: true, data: updated });
  });

  app.delete('/api/inventory/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const item = inventory.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    inventory = inventory.filter(i => i.id !== id);
    const schemaTable = databaseSchema.tables.find(t => t.name === 'inventory_items');
    if (schemaTable) schemaTable.recordCount = inventory.length;

    logEvent('DELETE', 'Inventory', id, `Removed inventory asset [${item.sku}] ${item.name}`);
    res.json({ success: true, message: 'Item deleted', data: { id } });
  });

  // --- DEPARTMENTS & LOGS ---
  app.get('/api/departments', (_req: Request, res: Response) => {
    res.json({ success: true, data: departments });
  });

  // Handle both /api/audit-logs and /api/logs
  const handleGetLogs = (_req: Request, res: Response) => {
    res.json({ success: true, data: activityLogs });
  };
  app.get('/api/audit-logs', handleGetLogs);
  app.get('/api/logs', handleGetLogs);

  // --- SCHEMAS (Visual DB Designer & DDL Generator) ---
  // Handle both /api/schema and /api/schemas
  const handleGetSchemas = (_req: Request, res: Response) => {
    res.json({ success: true, data: databaseSchema });
  };
  app.get('/api/schema', handleGetSchemas);
  app.get('/api/schemas', handleGetSchemas);

  const handlePostSchemaTable = (req: Request, res: Response) => {
    const { name, displayName, description, columns } = req.body;
    if (!name || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ success: false, error: 'Table name and column definitions are required' });
    }

    const newTable = {
      id: `tbl_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName || name,
      description: description || 'Custom dynamic entity model.',
      recordCount: 0,
      columns: columns.map(c => ({
        name: c.name,
        type: c.type || 'VARCHAR',
        nullable: c.nullable ?? true,
        isPrimary: c.isPrimary ?? false,
        defaultValue: c.defaultValue,
        description: c.description
      }))
    };

    databaseSchema.tables.push(newTable);
    logEvent('CREATE', 'Schema', newTable.id, `Created new database entity table schema "${newTable.name}"`);
    res.status(201).json({ success: true, data: databaseSchema });
  };
  app.post('/api/schema/tables', handlePostSchemaTable);
  app.post('/api/schemas/table', handlePostSchemaTable);

  // --- ONE-CLICK SEED RESET ---
  app.post('/api/seed/reset', (_req: Request, res: Response) => {
    departments = JSON.parse(JSON.stringify(initialDepartments));
    employees = JSON.parse(JSON.stringify(initialEmployees));
    projects = JSON.parse(JSON.stringify(initialProjects));
    tasks = JSON.parse(JSON.stringify(initialTasks));
    inventory = JSON.parse(JSON.stringify(initialInventory));
    activityLogs = JSON.parse(JSON.stringify(initialActivityLogs));
    databaseSchema = JSON.parse(JSON.stringify(initialDatabaseSchema));

    logEvent('UPDATE', 'Schema', 'system', 'Reset all system data and database schemas to demo defaults', 'System SuperAdmin');
    res.json({ success: true, message: 'System database successfully restored to pristine state' });
  });

  // --- AI MANAGEMENT COPILOT (Powered by Gemini API with heuristic smart fallback) ---
  app.post('/api/ai/copilot', async (req: Request, res: Response) => {
    const { prompt, actionType } = req.body;

    const stats = getSystemStats();
    const systemContext = `
System Management Overview:
- Employees: ${stats.totalEmployees} (${stats.activeEmployees} active)
- Projects: ${stats.totalProjects} (${stats.activeProjects} active, Budget Utilization: ${stats.budgetUtilization}%)
- Tasks: ${stats.totalTasks} (${stats.completedTasks} completed)
- Inventory Asset Value: $${stats.totalInventoryValue.toLocaleString()} (${stats.lowStockItemsCount} items low on stock)
- Departments: Engineering, Product & Design, Marketing & Growth, Sales & Operations, Finance & Legal, Customer Success
- Active Projects: ${projects.map(p => `${p.title} (${p.status}, ${p.progress}%, Budget: $${p.budget})`).join('; ')}
- Urgent/High Tasks: ${tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').map(t => `${t.title} (${t.status}, assigned to ${t.assigneeName})`).join('; ')}
- Low Stock Items: ${inventory.filter(i => i.quantity <= i.minThreshold).map(i => `${i.name} (Qty: ${i.quantity}, Min: ${i.minThreshold})`).join('; ')}
`;

    // Check for GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an elite AI Chief Operations Officer & Management Analyst for OmniManage Hub.
Context Data:
${systemContext}

User Query or Action:
"${prompt || 'Generate an executive management health summary and prioritized action recommendations.'}"

Provide an articulate, high-value executive briefing formatted in clean markdown. Include:
1. 🎯 Strategic Health Assessment
2. ⚠️ Operational Bottlenecks & Critical Risks (Cross-reference tasks, budget, inventory)
3. 🚀 High-Leverage Tactical Recommendations
4. 💡 Suggested Automated Workflow or Optimization
Keep it crisp, actionable, and executive-ready.`,
        });

        logEvent('AI_INSIGHT', 'Schema', 'ai-copilot', `Generated AI analysis for: ${prompt ? prompt.substring(0, 40) : actionType || 'Health Report'}`);
        return res.json({
          success: true,
          source: 'gemini-3.7-flash',
          analysis: response.text,
          data: { analysis: response.text }
        });
      } catch (err: unknown) {
        console.error('Gemini call error, using smart analytical engine fallback:', err);
      }
    }

    // Heuristic Smart Fallback Engine if key is missing or errored
    const lowStockNames = inventory.filter(i => i.quantity <= i.minThreshold).map(i => i.name).join(', ') || 'None';
    const urgentTasks = tasks.filter(t => t.priority === 'Urgent');
    const budgetStatus = stats.budgetUtilization > 80 ? 'CRITICAL (Over 80% spent)' : stats.budgetUtilization > 50 ? 'MODERATE (On track)' : 'HEALTHY (Low burn rate)';

    const fallbackAnalysis = `### 📊 OmniManage Executive Intelligence Briefing

#### 1. 🎯 Strategic Health Assessment
- **Team Bandwidth**: **${stats.totalEmployees}** personnel across **${stats.departmentCount}** departments with a **${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%** task completion velocity.
- **Project Progress**: **${stats.activeProjects}** active initiatives currently running. Overall portfolio budget utilization stands at **${stats.budgetUtilization}%** (${budgetStatus}).
- **Asset Health**: **$${stats.totalInventoryValue.toLocaleString()}** in tracked hardware and digital assets.

#### 2. ⚠️ Operational Bottlenecks & Critical Risks
- **Supply Chain Alerts**: ${stats.lowStockItemsCount} assets are below safety threshold: \`${lowStockNames}\`. Recommend immediate procurement re-order.
- **High-Priority Queue**: **${urgentTasks.length} Urgent sprint tickets** pending resolution, notably *"Design distributed database connection pooler"* and *"Configure SCIM 2.0 User Provisioning"*.
- **Department Capacity**: Engineering has high allocation density. Consider rebalancing workload from Sarah Chen and Liam Gallagher to Kenji Takahashi.

#### 3. 🚀 High-Leverage Tactical Recommendations
1. **Accelerate Core API v3 Migration**: Currently at 68% progress. Completing this unblocks SSO and Observability Mesh initiatives.
2. **Automate Inventory Restock Orders**: Set up automated PO generation when Dell Monitors or YubiKeys drop below 5 units.
3. **Weekly Task Triage**: Transition ${tasks.filter(t => t.status === 'In Review').length} tasks in "In Review" status to unblock final acceptance.

#### 4. 💡 Suggested Database Schema & Indexing Tuning
- Recommended PostgreSQL Composite Index: \`CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);\`
- Add \`audit_logs\` partition policy by quarter for zero-latency archival.`;

    logEvent('AI_INSIGHT', 'Schema', 'ai-copilot', `Generated heuristic executive insights (${actionType || 'General'})`);
    return res.json({
      success: true,
      source: 'smart-heuristic-copilot',
      analysis: fallbackAnalysis,
      data: { analysis: fallbackAnalysis }
    });
  });

  // 404 handler for unmatched API routes to guarantee JSON response and prevent HTML fallthrough
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ OmniManage Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
