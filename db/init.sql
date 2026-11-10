-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 120.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    budget_hours DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours DECIMAL(10, 4) NOT NULL,
    is_billable BOOLEAN NOT NULL DEFAULT TRUE,
    raw_notes TEXT,
    ai_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Unbilled', -- 'Unbilled', 'Invoiced', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    hours_total DECIMAL(10, 2) NOT NULL,
    pdf_path VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Sent', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Test Consultant
-- BCrypt hash for "password123":
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alex@devtimer.io',
    '$2a$11$39jK0F7604lE01fCqV44sux8gJbV7V3o/a.h702dKvh43rD.gO8s6',
    'Alex Rivers (Senior Consultant)'
) ON CONFLICT (email) DO NOTHING;

-- Seed Sample Clients
INSERT INTO clients (id, user_id, name, company, email, hourly_rate, currency)
VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sarah Jenkins',
    'Acme Corp',
    'sarah@acmecorp.com',
    150.00,
    'USD'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Marcus Vance',
    'Starlight Labs',
    'marcus@starlight.io',
    175.00,
    'USD'
) ON CONFLICT DO NOTHING;

-- Seed Sample Projects
INSERT INTO projects (id, client_id, name, color, budget_hours)
VALUES 
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Cloud Migration & Architecture',
    '#3b82f6',
    80.00
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Security Audit & Penetration Test',
    '#10b981',
    40.00
) ON CONFLICT DO NOTHING;

-- Seed Sample Time Entries
INSERT INTO time_entries (user_id, client_id, project_id, task_name, start_time, end_time, duration_hours, is_billable, raw_notes, ai_summary, status)
VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Terraform AWS ECS Cluster setup',
    NOW() - INTERVAL '3 hours',
    NOW(),
    3.00,
    TRUE,
    'Configured multi-AZ VPC, subnets, and ECS Fargate cluster with auto-scaling policies.',
    '• Provisioned enterprise multi-AZ AWS infrastructure via Terraform\n• Deployed autoscaled containerized cluster',
    'Unbilled'
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'OWASP Vulnerability Scan & Remediation',
    NOW() - INTERVAL '1 day 4 hours',
    NOW() - INTERVAL '1 day',
    4.00,
    TRUE,
    'Executed DAST scans, isolated CSRF vulnerability in auth module, issued remediation patch.',
    '• Conducted DAST automated & manual security audit\n• Patched high-severity authentication bypass vulnerability',
    'Unbilled'
);
