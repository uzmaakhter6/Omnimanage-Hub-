export type DepartmentName = 
  | 'Engineering'
  | 'Product & Design'
  | 'Marketing & Growth'
  | 'Sales & Operations'
  | 'Finance & Legal'
  | 'Customer Success';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote' | 'In Review';
export type ProjectStatus = 'Planning' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type InventoryCategory = 'Hardware' | 'Office Supplies' | 'Software Licenses' | 'Networking' | 'Electronics';

export interface Department {
  id: string;
  name: DepartmentName;
  head: string;
  employeeCount: number;
  budget: number;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: DepartmentName;
  salary: number;
  status: EmployeeStatus;
  avatar: string;
  skills: string[];
  hireDate: string;
  performanceRating: number; // 1 to 5
}

export interface Project {
  id: string;
  title: string;
  code: string;
  description: string;
  department: DepartmentName;
  managerId: string;
  managerName: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  progress: number; // 0 - 100
  tags: string[];
}

export interface Task {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
  tags: string[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  location: string;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'AI_INSIGHT';
  entity: 'Employee' | 'Project' | 'Task' | 'Inventory' | 'Schema';
  entityId: string;
  details: string;
  user: string;
  meta?: Record<string, unknown>;
}

export type AuditLog = ActivityLog;

export interface SchemaColumn {
  name: string;
  type: 'UUID' | 'VARCHAR' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSONB' | 'TIMESTAMP' | 'ENUM';
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: { table: string; column: string };
  defaultValue?: string;
  description?: string;
}

export interface SchemaTable {
  id: string;
  name: string;
  displayName: string;
  description: string;
  columns: SchemaColumn[];
  indexes?: string[];
  recordCount: number;
}

export interface SchemaRelation {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: '1:1' | '1:N' | 'N:M';
}

export interface DatabaseSchema {
  version: string;
  tables: SchemaTable[];
  relations: SchemaRelation[];
}

export interface SystemStats {
  totalEmployees: number;
  activeEmployees: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalInventoryValue: number;
  lowStockItemsCount: number;
  departmentCount: number;
  budgetUtilization: number;
  recentActivityCount: number;
}

export type ActiveTab = 
  | 'dashboard'
  | 'employees'
  | 'projects'
  | 'tasks'
  | 'inventory'
  | 'schema'
  | 'ai-copilot'
  | 'audit-logs'
  | 'subscription';

export type NavigationTab = ActiveTab;

export type PlanTier = 'Starter' | 'Professional' | 'Enterprise';
export type UserRole = 'Admin' | 'Client' | 'Manager' | 'Executive';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatar?: string;
  plan: PlanTier;
  planBilling: 'monthly' | 'annually';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'starter' | 'professional' | 'enterprise';
  tier: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  limits: {
    maxEmployees: number;
    maxProjects: number;
    aiCreditsPerMonth: number;
    customSchemas: boolean;
    auditLogsRetentionDays: number;
    prioritySupport: boolean;
  };
}

