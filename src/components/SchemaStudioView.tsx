import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Key, 
  Link2, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Table as TableIcon, 
  Sparkles,
  ArrowRight,
  Shield,
  FileCode,
  X
} from 'lucide-react';
import { DatabaseSchema, SchemaTable, SchemaColumn } from '../types';

interface SchemaStudioViewProps {
  databaseSchema: DatabaseSchema;
  onAddCustomTable: (table: { name: string; displayName: string; description: string; columns: SchemaColumn[] }) => Promise<void>;
}

export const SchemaStudioView: React.FC<SchemaStudioViewProps> = ({
  databaseSchema,
  onAddCustomTable,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'erd' | 'sql' | 'typescript' | 'relations'>('erd');
  const [selectedSqlDialect, setSelectedSqlDialect] = useState<'postgresql' | 'mysql' | 'sqlite'>('postgresql');
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(databaseSchema.tables[0]?.name || null);

  // New Table Modal
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColumns, setNewColumns] = useState<SchemaColumn[]>([
    { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Primary Key' },
    { name: 'title', type: 'VARCHAR', nullable: false, description: 'Title or name' },
    { name: 'status', type: 'VARCHAR', nullable: false, defaultValue: "'Active'" },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'NOW()' }
  ]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddColumnRow = () => {
    setNewColumns([
      ...newColumns,
      { name: `field_${newColumns.length + 1}`, type: 'VARCHAR', nullable: true }
    ]);
  };

  const handleRemoveColumnRow = (index: number) => {
    setNewColumns(newColumns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, key: keyof SchemaColumn, value: unknown) => {
    const updated = [...newColumns];
    updated[index] = { ...updated[index], [key]: value };
    setNewColumns(updated);
  };

  const handleCreateCustomTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName || newColumns.length === 0) return;

    await onAddCustomTable({
      name: newTableName,
      displayName: newDisplayName || newTableName,
      description: newDescription || 'Custom entity model',
      columns: newColumns
    });

    setIsAddTableOpen(false);
    setNewTableName('');
    setNewDisplayName('');
    setNewDescription('');
  };

  // SQL DDL Generator
  const generateSqlDDL = (): string => {
    let ddl = `-- OmniManage Enterprise DDL Schema Export\n-- Generated for: ${selectedSqlDialect.toUpperCase()}\n-- Engine Version: ${databaseSchema.version}\n\n`;

    if (selectedSqlDialect === 'postgresql') {
      ddl += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;
      databaseSchema.tables.forEach(table => {
        ddl += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
        const colDefs = table.columns.map(col => {
          let line = `  ${col.name.padEnd(20)} `;
          if (col.type === 'UUID') line += col.isPrimary ? 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()' : 'UUID';
          else if (col.type === 'VARCHAR') line += 'VARCHAR(255)';
          else if (col.type === 'INTEGER') line += 'INTEGER';
          else if (col.type === 'DECIMAL') line += 'DECIMAL(12, 2)';
          else if (col.type === 'BOOLEAN') line += 'BOOLEAN';
          else if (col.type === 'JSONB') line += 'JSONB';
          else if (col.type === 'TIMESTAMP') line += 'TIMESTAMPTZ';
          else if (col.type === 'ENUM') line += 'VARCHAR(50)';

          if (!col.nullable && !col.isPrimary) line += ' NOT NULL';
          if (col.defaultValue) line += ` DEFAULT ${col.defaultValue}`;
          return line;
        });

        ddl += colDefs.join(',\n');
        ddl += `\n);\n\n`;

        if (table.indexes) {
          table.indexes.forEach(idx => {
            ddl += `CREATE INDEX IF NOT EXISTS ${idx} ON ${table.name};\n`;
          });
          ddl += '\n';
        }
      });

      // Foreign keys
      databaseSchema.relations.forEach(rel => {
        ddl += `ALTER TABLE ${rel.fromTable} ADD CONSTRAINT fk_${rel.fromTable}_${rel.toTable}\n  FOREIGN KEY (${rel.fromColumn}) REFERENCES ${rel.toTable}(${rel.toColumn}) ON DELETE CASCADE;\n\n`;
      });
    } else if (selectedSqlDialect === 'mysql') {
      databaseSchema.tables.forEach(table => {
        ddl += `CREATE TABLE IF NOT EXISTS \`${table.name}\` (\n`;
        const colDefs = table.columns.map(col => {
          let line = `  \`${col.name}\` `;
          if (col.type === 'UUID') line += 'VARCHAR(36)';
          else if (col.type === 'VARCHAR') line += 'VARCHAR(255)';
          else if (col.type === 'INTEGER') line += 'INT';
          else if (col.type === 'DECIMAL') line += 'DECIMAL(12,2)';
          else if (col.type === 'BOOLEAN') line += 'TINYINT(1)';
          else if (col.type === 'JSONB') line += 'JSON';
          else if (col.type === 'TIMESTAMP') line += 'DATETIME';
          else if (col.type === 'ENUM') line += 'VARCHAR(50)';

          if (col.isPrimary) line += ' PRIMARY KEY';
          else if (!col.nullable) line += ' NOT NULL';
          if (col.defaultValue) line += ` DEFAULT ${col.defaultValue}`;
          return line;
        });
        ddl += colDefs.join(',\n');
        ddl += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;
      });
    } else {
      // SQLite
      databaseSchema.tables.forEach(table => {
        ddl += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
        const colDefs = table.columns.map(col => {
          let line = `  ${col.name} `;
          if (col.type === 'UUID') line += col.isPrimary ? 'TEXT PRIMARY KEY' : 'TEXT';
          else if (col.type === 'VARCHAR' || col.type === 'ENUM') line += 'TEXT';
          else if (col.type === 'INTEGER' || col.type === 'BOOLEAN') line += 'INTEGER';
          else if (col.type === 'DECIMAL') line += 'REAL';
          else if (col.type === 'JSONB') line += 'TEXT';
          else if (col.type === 'TIMESTAMP') line += 'TEXT';

          if (!col.nullable && !col.isPrimary) line += ' NOT NULL';
          if (col.defaultValue) line += ` DEFAULT ${col.defaultValue}`;
          return line;
        });
        ddl += colDefs.join(',\n');
        ddl += `\n);\n\n`;
      });
    }

    return ddl;
  };

  // TypeScript Types Generator
  const generateTypeScriptTypes = (): string => {
    let ts = `// Auto-generated TypeScript Database Interfaces\n// OmniManage Schema Version: ${databaseSchema.version}\n\n`;
    databaseSchema.tables.forEach(table => {
      const typeName = table.name
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
        .replace(/s$/, '');

      ts += `/**\n * ${table.displayName} - ${table.description}\n */\n`;
      ts += `export interface ${typeName}Record {\n`;
      table.columns.forEach(col => {
        let tsType = 'string';
        if (col.type === 'INTEGER' || col.type === 'DECIMAL') tsType = 'number';
        else if (col.type === 'BOOLEAN') tsType = 'boolean';
        else if (col.type === 'JSONB') tsType = 'Record<string, unknown> | unknown[]';
        
        const optional = col.nullable ? '?' : '';
        ts += `  ${col.name}${optional}: ${tsType};\n`;
      });
      ts += `}\n\n`;
    });
    return ts;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Relational Database Schema Studio & ERD Designer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore database tables, columns, relational cardinality, indexes, and export production SQL DDL scripts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddTableOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Entity Schema</span>
          </button>
        </div>
      </div>

      {/* View Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('erd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'erd'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Visual ERD Model ({databaseSchema.tables.length} Tables)
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('relations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'relations'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Foreign Key Map ({databaseSchema.relations.length} Relations)
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'sql'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              SQL DDL Generator
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('typescript')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === 'typescript'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              TypeScript Interfaces
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TAB: VISUAL ERD MODEL */}
      {activeSubTab === 'erd' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {databaseSchema.tables.map((table) => {
            const isSelected = selectedTable === table.name;
            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table.name)}
                className={`rounded-xl bg-slate-900/90 border transition-all overflow-hidden flex flex-col justify-between ${
                  isSelected ? 'border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Table Header */}
                <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="font-mono text-xs font-bold text-slate-100">{table.name}</h3>
                      <div className="text-[10px] text-slate-400">{table.displayName}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30">
                    {table.recordCount} rows
                  </span>
                </div>

                {/* Columns List */}
                <div className="p-3 space-y-1.5 flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                    Columns & Data Types ({table.columns.length})
                  </div>
                  {table.columns.map((col, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {col.isPrimary ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                            PK
                          </span>
                        ) : col.isForeign ? (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold">
                            FK
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                        <span className="text-slate-200 truncate">{col.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-cyan-400 font-semibold">{col.type}</span>
                        {!col.nullable && (
                          <span className="text-[9px] text-rose-400 font-sans">NN</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer: Indexes & Description */}
                <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <p className="line-clamp-1">{table.description}</p>
                  {table.indexes && table.indexes.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {table.indexes.map((idx, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {idx}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB: RELATIONS MAP */}
      {activeSubTab === 'relations' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Relational Integrity & Foreign Keys</h2>
              <p className="text-xs text-slate-400">Cardinally mapped foreign constraints across database entities</p>
            </div>
          </div>

          <div className="space-y-3">
            {databaseSchema.relations.map((rel) => (
              <div
                key={rel.id}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                    {rel.type}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="font-bold text-cyan-300">{rel.fromTable}</span>
                      <span className="text-slate-500">.{rel.fromColumn}</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-emerald-300">{rel.toTable}</span>
                      <span className="text-slate-500">.{rel.toColumn}</span>
                    </div>
                    <div className="text-[11px] font-sans text-slate-400">
                      Enforces Referential Integrity & Cascade Deletions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                    ON DELETE CASCADE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SQL DDL GENERATOR */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Target SQL Dialect:</span>
              <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
                {(['postgresql', 'mysql', 'sqlite'] as const).map((dialect) => (
                  <button
                    key={dialect}
                    onClick={() => setSelectedSqlDialect(dialect)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium uppercase transition-all cursor-pointer ${
                      selectedSqlDialect === dialect
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dialect}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(generateSqlDDL())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy DDL Script'}</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[550px] shadow-2xl leading-relaxed">
            <pre>{generateSqlDDL()}</pre>
          </div>
        </div>
      )}

      {/* SUB-TAB: TYPESCRIPT INTERFACES */}
      {activeSubTab === 'typescript' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">TypeScript Data Transfer Objects (DTOs)</span>
            <button
              onClick={() => handleCopy(generateTypeScriptTypes())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy TypeScript'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[550px] shadow-2xl leading-relaxed">
            <pre>{generateTypeScriptTypes()}</pre>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM TABLE MODAL */}
      {isAddTableOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-cyan-400" />
                <span>Create New Database Entity Schema</span>
              </h2>
              <button
                onClick={() => setIsAddTableOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTable} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Table Name (Database SQL identifier)</label>
                  <input
                    type="text"
                    required
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. vendors, invoices, milestones"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Vendors & Suppliers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Entity Scope / Purpose</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Third-party vendor contracts and SLA agreements"
                />
              </div>

              {/* Columns Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Field Column Schema Definitions</span>
                  <button
                    type="button"
                    onClick={handleAddColumnRow}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newColumns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                      <input
                        type="text"
                        required
                        value={col.name}
                        onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                        placeholder="col_name"
                        className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />

                      <select
                        value={col.type}
                        onChange={(e) => handleColumnChange(idx, 'type', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-400 font-mono focus:outline-none"
                      >
                        <option value="UUID">UUID</option>
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="DECIMAL">DECIMAL</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="JSONB">JSONB</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="ENUM">ENUM</option>
                      </select>

                      <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.isPrimary || false}
                          onChange={(e) => handleColumnChange(idx, 'isPrimary', e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                        />
                        <span>PK</span>
                      </label>

                      <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!col.nullable}
                          onChange={(e) => handleColumnChange(idx, 'nullable', !e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                        />
                        <span>Req</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveColumnRow(idx)}
                        disabled={newColumns.length <= 1}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30"
                >
                  Register Table Schema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
