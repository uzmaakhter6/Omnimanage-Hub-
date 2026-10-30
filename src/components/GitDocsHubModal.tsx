import React, { useState } from 'react';
import { 
  X, 
  Github, 
  Database, 
  Server, 
  Layers, 
  FileText, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Code2, 
  Cpu, 
  HardDrive, 
  Terminal, 
  ArrowRight,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

interface GitDocsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDmlSafeMode: boolean;
  onToggleDmlMode: (safeMode: boolean) => void;
}

export const GitDocsHubModal: React.FC<GitDocsHubModalProps> = ({
  isOpen,
  onClose,
  isDmlSafeMode,
  onToggleDmlMode
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'mysql-aiven' | 'erd' | 'dml-rbac' | 'sql-scripts'>('readme');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rawEnvSnippet = `# MySQL Database Configuration (Aiven Cloud Free Lifetime 1GB VM)
DB_DIALECT="mysql"
MYSQL_HOST="mysql-crm-omnimanage-uzma.aivencloud.com"
MYSQL_PORT="18293"
MYSQL_USER="avnadmin"
MYSQL_PASSWORD="your_aiven_password_here"
MYSQL_DATABASE="defaultdb"
MYSQL_SSL="true"`;

  const rawCliConnect = `mysql --host=mysql-crm-omnimanage-uzma.aivencloud.com \\
  --port=18293 \\
  --user=avnadmin \\
  --password \\
  --ssl-mode=REQUIRED \\
  defaultdb`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 shadow-md">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono tracking-tight">
                  GitHub Repository & MySQL Presentation Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Git Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official project documentation, Aiven Cloud MySQL specs, ER diagram, and DML governance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-4 sm:px-6 pt-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'readme'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>README.md (Git Presentation)</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql-aiven')}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'mysql-aiven'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MySQL & Aiven Cloud (1GB VM)</span>
          </button>

          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'erd'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ER Diagram & Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('dml-rbac')}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'dml-rbac'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DML Operations & Demo Rights</span>
          </button>

          <button
            onClick={() => setActiveTab('sql-scripts')}
            className={`px-3 py-2.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sql-scripts'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>MySQL SQL Scripts</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-300">
          
          {/* TAB 1: README.md VIEW */}
          {activeTab === 'readme' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>Repository: omnimanage-crm</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Public</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formatted for GitHub presentation, technical evaluation, and project submission.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard('git clone https://github.com/your-username/omnimanage-crm.git', 'clone')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'clone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedKey === 'clone' ? 'Cloned!' : 'Copy Clone URL'}</span>
                  </button>

                  <button
                    onClick={() => {
                      fetch('/README.md')
                        .then(r => r.text())
                        .then(txt => downloadFile('README.md', txt));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download README.md</span>
                  </button>
                </div>
              </div>

              {/* Formatted Markdown Display */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs sm:text-sm space-y-5 leading-relaxed text-slate-300">
                <div className="border-b border-slate-800 pb-4">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                    OmniManage Hub — Enterprise CRM & Management System
                  </h1>
                  <p className="text-slate-400 mt-2 text-xs sm:text-sm">
                    Full-Stack Enterprise Resource Management Platform powered by React 19, TypeScript, Express REST API, and MySQL 8.0 hosted on Aiven Cloud with Vercel Production Deployment.
                  </p>
                  
                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-2 mt-3 font-mono text-[11px]">
                    <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      MySQL 8.0 (InnoDB)
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Aiven.io (1GB RAM Cloud VM)
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      React 19 + TypeScript
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Node.js / Express REST API
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Vercel Edge Cloud
                    </span>
                  </div>
                </div>

                {/* Key Architecture Highlight */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Architectural Decision: Why MySQL on Aiven instead of Supabase?</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    While Vercel commonly recommends Supabase for database hosting, Supabase strictly defaults to <strong>PostgreSQL</strong> and does not support MySQL. Because our academic course curriculum is centered exclusively on <strong>MySQL</strong> (InnoDB transactions, indexing, SQL-92 dialect, and ACID guarantees), we hosted our MySQL cluster on <strong>Aiven Cloud (`aiven.io`)</strong> using their lifetime free tier (1GB RAM, 1GB NVMe VM), perfectly linking with Vercel's edge deployment.
                  </p>
                </div>

                {/* Core Modules Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Core Functional Modules & Course Coverage
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-cyan-300 font-mono mb-1">1. Item Master & Inventory DML</div>
                      <p className="text-slate-400 text-[11px]">
                        Hardware & Software licenses, stock threshold alarms, unit costs, and real-time restock UPDATE / DELETE DML operations.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-indigo-300 font-mono mb-1">2. Staff Directory & HR</div>
                      <p className="text-slate-400 text-[11px]">
                        Employee profiles, departmental assignments, salary budgeting, and performance rating distribution.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-purple-300 font-mono mb-1">3. Projects & Initiatives</div>
                      <p className="text-slate-400 text-[11px]">
                        Multi-department capital allocation, manager assignments, and live budget utilization tracking.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-emerald-300 font-mono mb-1">4. Agile Sprint Kanban</div>
                      <p className="text-slate-400 text-[11px]">
                        Drag-and-drop task status transitions with foreign key relationships linked to projects and assignees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveTab('mysql-aiven')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span>View Aiven Cloud MySQL Technical Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MYSQL & AIVEN CLOUD SPECIFICATION */}
          {activeTab === 'mysql-aiven' && (
            <div className="space-y-6">
              {/* Architecture comparison card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-850 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Chosen: Aiven Cloud MySQL 8.0</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Curriculum Compliant
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300 font-mono">
                    <li className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Dedicated VM: 1 vCPU, 1 GB RAM (Free Lifetime)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Storage: 1 GB High-Speed NVMe Storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Engine: Native MySQL 8.0 with InnoDB ACID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Security: Mandatory TLS 1.3 SSL/TLS Encryption</span>
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-750">
                    Matches exactly what was taught in class (MySQL syntax, constraints, foreign keys).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-850/60 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-400" />
                      <span>Supabase Default (Rejected)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      Not MySQL
                    </span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-400 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>Engine: PostgreSQL ONLY (No MySQL support)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>Dialect: Uses Postgres syntax instead of MySQL</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>Incompatible with course requirements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>Compliance risk during project defense</span>
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-750">
                    Supabase was proposed by Vercel defaults, but properly substituted with Aiven MySQL.
                  </p>
                </div>
              </div>

              {/* Live Connection Details */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Aiven MySQL Cluster Connection Strings
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    Port: 18293
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Node.js / Vercel .env Configuration</span>
                      <button
                        onClick={() => copyToClipboard(rawEnvSnippet, 'env')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto">
                      {rawEnvSnippet}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>MySQL CLI Direct Command</span>
                      <button
                        onClick={() => copyToClipboard(rawCliConnect, 'cli')}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'cli' ? 'Copied' : 'Copy Command'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                      {rawCliConnect}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ER DIAGRAM & SCHEMA SPECIFICATION */}
          {activeTab === 'erd' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Entity Relationship Diagram (ERD) Structure</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Normalized 3NF relational schema enforcing strict referential integrity with cascading updates and deletions where appropriate.
                </p>
              </div>

              {/* ASCII Diagram Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                <pre className="text-[11px] font-mono text-amber-200 leading-tight">
{`+----------------------------------+          +----------------------------------+
|           DEPARTMENTS            |          |            EMPLOYEES             |
+----------------------------------+          +----------------------------------+
| PK  id              VARCHAR(64)  | 1      N | PK  id              VARCHAR(64)  |
| UQ  name            VARCHAR(120) |<---------| FK  department_name VARCHAR(120) |
| NN  head            VARCHAR(120) |          | UQ  email           VARCHAR(191) |
| NN  employee_count  INT          |          | NN  name            VARCHAR(120) |
| NN  budget          DECIMAL(14,2)|          | NN  role            VARCHAR(120) |
+----------------------------------+          | NN  salary          DECIMAL(12,2)|
                  │                           | NN  status          ENUM(...)    |
                  │ 1                         +----------------------------------+
                  │                                             │
                  │ N                                           │ 1 (manager)
                  ▼                                             ▼ N
+----------------------------------+          +----------------------------------+
|             PROJECTS             |          |              TASKS               |
+----------------------------------+          +----------------------------------+
| PK  id              VARCHAR(64)  | 1      N | PK  id              VARCHAR(64)  |
| UQ  code            VARCHAR(64)  |<---------| FK  project_id      VARCHAR(64)  |
| NN  title           VARCHAR(191) |          | FK  assignee_id     VARCHAR(64)  |
| FK  department_name VARCHAR(120) |          | NN  title           VARCHAR(191) |
| FK  manager_id      VARCHAR(64)  |          | NN  status          ENUM(...)    |
| NN  budget          DECIMAL(14,2)|          | NN  due_date        DATE         |
+----------------------------------+          +----------------------------------+

+----------------------------------+          +----------------------------------+
|         INVENTORY_ITEMS          |          |            AUDIT_LOGS            |
|          (ITEM MASTER)           |          |         (DML AUDIT TRAIL)        |
+----------------------------------+          +----------------------------------+
| PK  id              VARCHAR(64)  |          | PK  id              VARCHAR(64)  |
| UQ  sku             VARCHAR(64)  |          | NN  timestamp       TIMESTAMP    |
| NN  name            VARCHAR(191) |          | NN  action          ENUM(...)    |
| NN  category        ENUM(...)    |          | NN  entity          VARCHAR(64)  |
| NN  quantity        INT          |          | NN  entity_id       VARCHAR(64)  |
| NN  min_threshold   INT          |          | NN  details         TEXT         |
| NN  unit_price      DECIMAL(12,2)|          | NN  user            VARCHAR(120) |
| NN  status          ENUM(...)    |          |     sql_query       TEXT         |
+----------------------------------+          +----------------------------------+`}
                </pre>
              </div>

              {/* Table breakdown summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                {[
                  { name: 'departments', cols: 7, notNull: 7, pk: 'id', desc: 'Org business units & budgets' },
                  { name: 'employees', cols: 12, notNull: 10, pk: 'id', desc: 'Staff directory & ratings' },
                  { name: 'projects', cols: 15, notNull: 12, pk: 'id', desc: 'Enterprise portfolio initiatives' },
                  { name: 'tasks', cols: 13, notNull: 11, pk: 'id', desc: 'Agile Kanban sprint cards' },
                  { name: 'inventory_items', cols: 11, notNull: 11, pk: 'id', desc: 'Item Master & stock assets' },
                  { name: 'audit_logs', cols: 9, notNull: 7, pk: 'id', desc: 'DML query execution trail' }
                ].map((tbl, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-cyan-300">{tbl.name}</div>
                    <div className="text-[10px] text-slate-400">PK: {tbl.pk} • {tbl.notNull}/{tbl.cols} NOT NULL</div>
                    <div className="text-[10px] text-slate-500 font-sans">{tbl.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DML OPERATIONS & RBAC DEMO RIGHTS */}
          {activeTab === 'dml-rbac' && (
            <div className="space-y-6">
              {/* Permission Mode Switcher Banner */}
              <div className="p-5 rounded-xl bg-slate-850 border border-purple-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>DML Permissions & Academic Presentation Mode</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Controls whether destructive DELETE operations are active or safely locked to prevent accidental data loss.
                    </p>
                  </div>

                  {/* Mode Switcher Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleDmlMode(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isDmlSafeMode
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Safe Demo (Delete Revoked)</span>
                    </button>

                    <button
                      onClick={() => onToggleDmlMode(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        !isDmlSafeMode
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>SuperAdmin (Full DML)</span>
                    </button>
                  </div>
                </div>

                {/* Status Callout */}
                <div className={`p-3.5 rounded-lg text-xs font-mono border ${
                  isDmlSafeMode
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                }`}>
                  {isDmlSafeMode ? (
                    <div>
                      <strong>🛡️ Current Status: Safe Demo Mode Active</strong>
                      <p className="text-[11px] text-emerald-300/80 mt-1">
                        DELETE rights are temporarily revoked for students and public visitors. This ensures master inventory records, projects, and staff records cannot be wiped clean during demonstrations and evaluations. Switch to Admin mode anytime to test unrestricted DELETE queries.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <strong>👑 Current Status: SuperAdmin Full DML Active</strong>
                      <p className="text-[11px] text-purple-300/80 mt-1">
                        All DML operations (INSERT, UPDATE, DELETE) are fully unlocked. Every statement executed will be logged with full SQL syntax in the audit trail.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* DML Operations Examples */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Item Master & Inventory DML Syntax Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold">1. INSERT (Create Asset)</div>
                    <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`INSERT INTO inventory_items (
  id, sku, name, category, quantity, unit_price
) VALUES (
  'inv-09', 'HW-DELL-5570', 'Dell Precision', 'Hardware', 10, 2450.00
);`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-cyan-400 font-bold">2. UPDATE (Restock & Status)</div>
                    <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`UPDATE inventory_items
SET quantity = quantity + 10,
    status = 'In Stock',
    last_restocked = CURDATE()
WHERE id = 'inv-03';`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-amber-400 font-bold">3. SELECT (Threshold Filtering)</div>
                    <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`SELECT sku, name, quantity, min_threshold
FROM inventory_items
WHERE quantity <= min_threshold;`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-rose-400 font-bold">4. DELETE (Decommission Item)</div>
                    <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`-- Protected by Safe Demo Mode
DELETE FROM inventory_items
WHERE id = 'inv-08';`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RAW MYSQL SCRIPTS (DDL & DML) */}
          {activeTab === 'sql-scripts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>Pure MySQL 8.0 DDL & DML Scripts</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready to import into Aiven Cloud MySQL, phpMyAdmin, or MySQL Workbench.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetch('/mysql/schema.sql')
                        .then(r => r.text())
                        .then(txt => downloadFile('schema.sql', txt));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download schema.sql</span>
                  </button>

                  <button
                    onClick={() => {
                      fetch('/mysql/seed.sql')
                        .then(r => r.text())
                        .then(txt => downloadFile('seed.sql', txt));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download seed.sql</span>
                  </button>
                </div>
              </div>

              {/* DDL Preview snippet */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">mysql/schema.sql (Table Definitions)</span>
                  <span className="text-[10px] text-slate-500">InnoDB • utf8mb4_unicode_ci</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto">
{`CREATE TABLE \`inventory_items\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`sku\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(191) NOT NULL,
  \`category\` ENUM('Hardware', 'Software Licenses', 'Networking', 'Office Supplies', 'Electronics') NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 0,
  \`min_threshold\` INT NOT NULL DEFAULT 5,
  \`unit_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`location\` VARCHAR(120) NOT NULL DEFAULT 'Main Warehouse',
  \`supplier\` VARCHAR(120) NOT NULL DEFAULT 'Primary Vendor',
  \`status\` ENUM('In Stock', 'Low Stock', 'Out of Stock') NOT NULL DEFAULT 'In Stock',
  \`last_restocked\` DATE NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_inventory_sku\` (\`sku\`),
  KEY \`idx_inv_category\` (\`category\`),
  KEY \`idx_inv_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`}
                </pre>
              </div>

              {/* CLI import command instructions */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="font-bold text-slate-200">Execute on Aiven Cloud MySQL:</div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px]">
                  mysql -h mysql-crm-omnimanage-uzma.aivencloud.com -P 18293 -u avnadmin -p defaultdb &lt; mysql/schema.sql
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Hosted On:</span>
            <span className="text-cyan-300 font-bold">Vercel (Frontend)</span>
            <span>+</span>
            <span className="text-emerald-300 font-bold">Aiven Cloud MySQL (1GB VM)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-[11px]">Academic Course Compliance: Verified</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Close Hub
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
