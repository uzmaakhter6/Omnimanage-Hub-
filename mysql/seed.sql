-- ============================================================================
-- OmniManage Hub - Enterprise MySQL Seed Data (DML INSERTs)
-- Compatible with: MySQL 8.0 / Aiven Cloud / Vercel
-- ============================================================================

USE `omnimanage`;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `tasks`;
TRUNCATE TABLE `projects`;
TRUNCATE TABLE `inventory_items`;
TRUNCATE TABLE `employees`;
TRUNCATE TABLE `departments`;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Insert Departments
-- ----------------------------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `head`, `employee_count`, `budget`, `color`) VALUES
('dept-01', 'Engineering', 'Alex Rivera', 28, 750000.00, 'indigo'),
('dept-02', 'Product & Design', 'Elena Rostova', 14, 420000.00, 'purple'),
('dept-03', 'Marketing & Growth', 'Marcus Vance', 12, 380000.00, 'pink'),
('dept-04', 'Sales & Operations', 'Derrick Boone', 22, 610000.00, 'emerald'),
('dept-05', 'Finance & Legal', 'Samantha Sterling', 8, 290000.00, 'amber'),
('dept-06', 'Customer Success', 'Chloe Bennett', 16, 310000.00, 'cyan');

-- ----------------------------------------------------------------------------
-- 2. Insert Employees
-- ----------------------------------------------------------------------------
INSERT INTO `employees` (`id`, `name`, `email`, `phone`, `role`, `department_name`, `salary`, `status`, `avatar`, `skills`, `hire_date`, `performance_rating`) VALUES
('emp-101', 'Sarah Chen', 'sarah.chen@omnigroup.io', '+1 (555) 234-8901', 'Staff Architect', 'Engineering', 165000.00, 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '["MySQL", "Architecture", "Distributed Systems", "TypeScript"]', '2022-03-15', 4.95),
('emp-102', 'Marcus Vance', 'marcus.vance@omnigroup.io', '+1 (555) 345-6789', 'VP of Growth', 'Marketing & Growth', 145000.00, 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '["Growth", "Analytics", "SEO", "PPC"]', '2021-08-01', 4.80),
('emp-103', 'Elena Rostova', 'elena.rostova@omnigroup.io', '+1 (555) 456-7890', 'Principal Designer', 'Product & Design', 138000.00, 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '["UI/UX", "Figma", "Design Systems"]', '2022-01-10', 4.90),
('emp-104', 'David Kim', 'david.kim@omnigroup.io', '+1 (555) 567-8901', 'Senior Backend Engineer', 'Engineering', 142000.00, 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '["MySQL", "Node.js", "Express", "Docker"]', '2023-04-12', 4.65),
('emp-105', 'Amina Diallo', 'amina.diallo@omnigroup.io', '+1 (555) 678-9012', 'Full Stack Engineer', 'Engineering', 125000.00, 'Remote', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '["React", "TypeScript", "Tailwind CSS"]', '2023-09-01', 4.75),
('emp-106', 'Derrick Boone', 'derrick.boone@omnigroup.io', '+1 (555) 789-0123', 'Director of Sales', 'Sales & Operations', 150000.00, 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '["Enterprise CRM", "B2B Sales", "Negotiation"]', '2021-02-15', 4.85),
('emp-107', 'Samantha Sterling', 'samantha.s@omnigroup.io', '+1 (555) 890-1234', 'Financial Controller', 'Finance & Legal', 132000.00, 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '["Financial Modeling", "Audits", "Compliance"]', '2022-06-20', 4.70),
('emp-108', 'Chloe Bennett', 'chloe.bennett@omnigroup.io', '+1 (555) 901-2345', 'Head of Customer Success', 'Customer Success', 118000.00, 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', '["Customer Retention", "Onboarding", "Support"]', '2023-01-15', 4.88);

-- ----------------------------------------------------------------------------
-- 3. Insert Projects
-- ----------------------------------------------------------------------------
INSERT INTO `projects` (`id`, `title`, `code`, `description`, `department_name`, `manager_id`, `manager_name`, `status`, `priority`, `start_date`, `deadline`, `budget`, `spent`, `progress`, `tags`) VALUES
('proj-01', 'Cloud Migration & Database Modernization', 'PRJ-MIGRATE-01', 'Migrating core CRM relational data to Aiven Cloud MySQL with Vercel edge deployment.', 'Engineering', 'emp-101', 'Sarah Chen', 'In Progress', 'Urgent', '2026-01-10', '2026-06-30', 185000.00, 92000.00, 68, '["MySQL", "Aiven", "Vercel", "Cloud"]'),
('proj-02', 'Enterprise Design System v3.0', 'PRJ-DESIGN-02', 'Unified multi-platform component library and dark mode design token framework.', 'Product & Design', 'emp-103', 'Elena Rostova', 'In Progress', 'High', '2026-02-01', '2026-05-15', 95000.00, 48000.00, 52, '["UI/UX", "Tailwind", "Design System"]'),
('proj-03', 'OmniManage CRM Core Modernization', 'PRJ-CRM-03', 'Comprehensive ERP module unification covering Staff, Inventory Item Master, Projects, and Kanban.', 'Engineering', 'emp-101', 'Sarah Chen', 'In Progress', 'Urgent', '2026-01-05', '2026-04-30', 210000.00, 145000.00, 84, '["CRM", "FullStack", "RelationalDB"]'),
('proj-04', 'Global B2B Sales Pipeline Expansion', 'PRJ-SALES-04', 'International distributor channel integration and tiered licensing pricing model rollout.', 'Sales & Operations', 'emp-106', 'Derrick Boone', 'Planning', 'Medium', '2026-03-01', '2026-08-31', 120000.00, 15000.00, 20, '["Sales", "B2B", "Expansion"]');

-- ----------------------------------------------------------------------------
-- 4. Insert Tasks (Agile Sprint Kanban)
-- ----------------------------------------------------------------------------
INSERT INTO `tasks` (`id`, `project_id`, `project_title`, `title`, `description`, `assignee_id`, `assignee_name`, `assignee_avatar`, `status`, `priority`, `due_date`, `estimated_hours`, `completed_hours`, `tags`) VALUES
('tsk-201', 'proj-01', 'Cloud Migration & Database Modernization', 'Configure Aiven Cloud MySQL 8.0 cluster with SSL/TLS', 'Provision 1GB RAM dedicated cloud VM on Aiven and set up SSL connection string.', 'emp-101', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Done', 'Urgent', '2026-02-15', 16, 16, '["MySQL", "Aiven", "DevOps"]'),
('tsk-202', 'proj-01', 'Cloud Migration & Database Modernization', 'Implement DML transaction logging & audit trail', 'Capture INSERT, UPDATE, DELETE queries for inventory and employee actions.', 'emp-104', 'David Kim', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'In Progress', 'High', '2026-03-10', 24, 18, '["MySQL", "DML", "Audit"]'),
('tsk-203', 'proj-03', 'OmniManage CRM Core Modernization', 'Build Item Master inventory DML screen with stock thresholds', 'Provide CRUD + restock DML operations for physical hardware and software licenses.', 'emp-105', 'Amina Diallo', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Done', 'High', '2026-02-28', 20, 20, '["Inventory", "Item Master", "DML"]'),
('tsk-204', 'proj-03', 'OmniManage CRM Core Modernization', 'Implement Safe Demo Mode vs SuperAdmin DML rights toggle', 'Allow administrators and evaluators to test the system without users wiping records.', 'emp-101', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Done', 'Urgent', '2026-03-02', 12, 12, '["Security", "RBAC", "DML"]');

-- ----------------------------------------------------------------------------
-- 5. Insert Inventory Items (Item Master)
-- ----------------------------------------------------------------------------
INSERT INTO `inventory_items` (`id`, `sku`, `name`, `category`, `quantity`, `min_threshold`, `unit_price`, `location`, `supplier`, `status`, `last_restocked`) VALUES
('inv-01', 'HW-MAC-M3-01', 'MacBook Pro 16" M3 Max (64GB)', 'Hardware', 14, 5, 3499.00, 'Warehouse A - Rack 04', 'Apple Direct Enterprise', 'In Stock', '2026-02-10'),
('inv-02', 'HW-DELL-U27-02', 'Dell UltraSharp 27" 4K USB-C Hub', 'Hardware', 28, 8, 580.00, 'Warehouse A - Rack 02', 'Dell Commercial Partner', 'In Stock', '2026-01-20'),
('inv-03', 'NET-CISCO-C9200', 'Cisco Catalyst 9200 48-Port Switch', 'Networking', 3, 4, 2850.00, 'Server Room B - Rack 1', 'Cisco Systems Commercial', 'Low Stock', '2025-11-15'),
('inv-04', 'LIC-JETBRAINS-ULT', 'JetBrains All Products Pack (Annual)', 'Software Licenses', 45, 10, 649.00, 'Digital Cloud Vault', 'JetBrains s.r.o.', 'In Stock', '2026-01-05'),
('inv-05', 'HW-YUBIKEY-5C', 'Yubico YubiKey 5C NFC Security Key', 'Electronics', 62, 15, 55.00, 'Warehouse B - Bin 12', 'Yubico Authorized Dist.', 'In Stock', '2026-02-01'),
('inv-06', 'LIC-SLACK-ENT', 'Slack Enterprise Grid Seat (1 Year)', 'Software Licenses', 2, 10, 180.00, 'Cloud Licensing Portal', 'Salesforce / Slack Inc.', 'Low Stock', '2025-10-12'),
('inv-07', 'HW-LOGI-MX3S', 'Logitech MX Master 3S Wireless Mouse', 'Electronics', 35, 10, 99.00, 'Warehouse A - Bin 08', 'Logitech Commercial', 'In Stock', '2026-01-18'),
('inv-08', 'OFF-HERMAN-AERON', 'Herman Miller Aeron Ergonomic Chair', 'Office Supplies', 12, 4, 1395.00, 'Main Floor Storage', 'Herman Miller Workplace', 'In Stock', '2025-12-05');

-- ----------------------------------------------------------------------------
-- 6. Insert Audit Logs (DML Operations Log)
-- ----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `timestamp`, `action`, `entity`, `entity_id`, `details`, `user`, `sql_query`) VALUES
('log-301', '2026-02-10 09:15:00', 'CREATE', 'Inventory', 'inv-01', 'Added asset SKU [HW-MAC-M3-01] MacBook Pro 16" M3 Max (Qty: 14)', 'Uzma Akhter (Admin)', 'INSERT INTO inventory_items (id, sku, name, category, quantity, unit_price) VALUES (\'inv-01\', \'HW-MAC-M3-01\', \'MacBook Pro 16"\', \'Hardware\', 14, 3499.00);'),
('log-302', '2026-02-15 11:30:20', 'UPDATE', 'Inventory', 'inv-03', 'Stock depleted below minimum safety threshold (3 <= 4)', 'Inventory Automated Monitor', 'UPDATE inventory_items SET quantity = 3, status = \'Low Stock\' WHERE id = \'inv-03\';'),
('log-303', '2026-02-28 14:45:10', 'CREATE', 'Employee', 'emp-101', 'Hired Sarah Chen as Staff Architect in Engineering', 'HR SuperAdmin', 'INSERT INTO employees (id, name, email, role, department_name, salary) VALUES (\'emp-101\', \'Sarah Chen\', \'sarah.chen@omnigroup.io\', \'Staff Architect\', \'Engineering\', 165000.00);'),
('log-304', '2026-03-01 16:00:00', 'UPDATE', 'Project', 'proj-01', 'Adjusted budget allocation for Cloud Migration project to $185,000', 'Finance Controller', 'UPDATE projects SET budget = 185000.00, spent = 92000.00 WHERE id = \'proj-01\';');
