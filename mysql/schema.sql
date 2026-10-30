-- ============================================================================
-- OmniManage Hub - Enterprise MySQL Database Schema
-- Dialect: MySQL 8.0+ / MariaDB 10.5+
-- Storage Engine: InnoDB (Full ACID, Row-Level Locking, Foreign Key Constraints)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Hosted on: Aiven Cloud MySQL (1GB RAM, 1GB NVMe Free Lifetime VM)
-- Designed for: Vercel Full-Stack Integration
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `omnimanage`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `omnimanage`;

-- Disable foreign key checks during schema re-creation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `inventory_items`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `departments`;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- Table 1: departments (Organizational Business Units)
-- ----------------------------------------------------------------------------
CREATE TABLE `departments` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `head` VARCHAR(120) NOT NULL,
  `employee_count` INT NOT NULL DEFAULT 0,
  `budget` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `color` VARCHAR(32) NOT NULL DEFAULT 'indigo',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_name` (`name`),
  KEY `idx_dept_budget` (`budget`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: employees (Staff Directory & HR Profiles)
-- ----------------------------------------------------------------------------
CREATE TABLE `employees` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(64) NOT NULL DEFAULT '+1 (555) 000-0000',
  `role` VARCHAR(120) NOT NULL,
  `department_name` VARCHAR(120) NOT NULL,
  `salary` DECIMAL(12, 2) NOT NULL DEFAULT 60000.00,
  `status` ENUM('Active', 'On Leave', 'Remote', 'In Review') NOT NULL DEFAULT 'Active',
  `avatar` VARCHAR(512) DEFAULT NULL,
  `skills` JSON DEFAULT NULL,
  `hire_date` DATE NOT NULL,
  `performance_rating` DECIMAL(3, 2) NOT NULL DEFAULT 4.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_email` (`email`),
  KEY `idx_emp_department` (`department_name`),
  KEY `idx_emp_status` (`status`),
  CONSTRAINT `fk_emp_department`
    FOREIGN KEY (`department_name`) REFERENCES `departments` (`name`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: projects (Enterprise Portfolio Initiatives)
-- ----------------------------------------------------------------------------
CREATE TABLE `projects` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `department_name` VARCHAR(120) NOT NULL,
  `manager_id` VARCHAR(64) NOT NULL,
  `manager_name` VARCHAR(120) NOT NULL,
  `status` ENUM('Planning', 'In Progress', 'In Review', 'Completed', 'On Hold') NOT NULL DEFAULT 'Planning',
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  `start_date` DATE NOT NULL,
  `deadline` DATE NOT NULL,
  `budget` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `spent` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `progress` INT NOT NULL DEFAULT 0,
  `tags` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_code` (`code`),
  KEY `idx_proj_status` (`status`),
  KEY `idx_proj_manager` (`manager_id`),
  CONSTRAINT `fk_proj_department`
    FOREIGN KEY (`department_name`) REFERENCES `departments` (`name`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_proj_manager`
    FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: tasks (Agile Sprint Kanban Tasks)
-- ----------------------------------------------------------------------------
CREATE TABLE `tasks` (
  `id` VARCHAR(64) NOT NULL,
  `project_id` VARCHAR(64) NOT NULL,
  `project_title` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `assignee_id` VARCHAR(64) NOT NULL,
  `assignee_name` VARCHAR(120) NOT NULL,
  `assignee_avatar` VARCHAR(512) DEFAULT NULL,
  `status` ENUM('Backlog', 'To Do', 'In Progress', 'In Review', 'Done') NOT NULL DEFAULT 'To Do',
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  `due_date` DATE NOT NULL,
  `estimated_hours` INT NOT NULL DEFAULT 8,
  `completed_hours` INT NOT NULL DEFAULT 0,
  `tags` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_project` (`project_id`),
  KEY `idx_task_assignee` (`assignee_id`),
  KEY `idx_task_status` (`status`),
  CONSTRAINT `fk_task_project`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_task_assignee`
    FOREIGN KEY (`assignee_id`) REFERENCES `employees` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: inventory_items (Item Master & Physical/Digital Assets)
-- ----------------------------------------------------------------------------
CREATE TABLE `inventory_items` (
  `id` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `category` ENUM('Hardware', 'Software Licenses', 'Networking', 'Office Supplies', 'Electronics') NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `min_threshold` INT NOT NULL DEFAULT 5,
  `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `location` VARCHAR(120) NOT NULL DEFAULT 'Main Warehouse',
  `supplier` VARCHAR(120) NOT NULL DEFAULT 'Primary Vendor',
  `status` ENUM('In Stock', 'Low Stock', 'Out of Stock') NOT NULL DEFAULT 'In Stock',
  `last_restocked` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inventory_sku` (`sku`),
  KEY `idx_inv_category` (`category`),
  KEY `idx_inv_status` (`status`),
  KEY `idx_inv_threshold` (`quantity`, `min_threshold`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: audit_logs (Immutable DML & Security Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'AI_INSIGHT') NOT NULL,
  `entity` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `details` TEXT NOT NULL,
  `user` VARCHAR(120) NOT NULL DEFAULT 'SuperAdmin',
  `sql_query` TEXT DEFAULT NULL,
  `meta` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_timestamp` (`timestamp`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
