-- Run this first to create the database schema
-- Employee Management and Attendance Tracker Database Schema

-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_name VARCHAR(100),
    budget DECIMAL(12, 2),
    location VARCHAR(200),
    created_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE CASCADE,
    base_salary DECIMAL(10, 2),
    created_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(role_name, department_id)
);

-- 3. Employees table
CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INTEGER REFERENCES departments(department_id),
    role_id INTEGER REFERENCES roles(role_id),
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Terminated')),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    work_hours DECIMAL(4, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Partial', 'Holiday', 'Leave')),
    is_late BOOLEAN DEFAULT FALSE,
    late_minutes INTEGER DEFAULT 0,
    overtime_hours DECIMAL(4, 2) DEFAULT 0,
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, attendance_date)
);

-- 5. Attendance settings table
CREATE TABLE IF NOT EXISTS attendance_settings (
    setting_id SERIAL PRIMARY KEY,
    standard_work_hours DECIMAL(4, 2) DEFAULT 8.0,
    standard_start_time TIME DEFAULT '09:00:00',
    standard_end_time TIME DEFAULT '17:00:00',
    late_threshold_minutes INTEGER DEFAULT 15,
    overtime_threshold_hours DECIMAL(4, 2) DEFAULT 8.0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO attendance_settings (standard_work_hours, standard_start_time, standard_end_time, late_threshold_minutes, overtime_threshold_hours)
VALUES (8.0, '09:00:00', '17:00:00', 15, 8.0)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
