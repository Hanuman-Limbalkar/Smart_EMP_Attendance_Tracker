-- Employee Management and Attendance Tracker Database Schema

-- Create database (run this separately)
-- CREATE DATABASE employee_attendance_db;

-- Connect to the database and create tables

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

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 7. Create function to calculate work hours
CREATE OR REPLACE FUNCTION calculate_work_hours(check_in TIME, check_out TIME)
RETURNS DECIMAL(4, 2) AS $$
BEGIN
    IF check_in IS NULL OR check_out IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN EXTRACT(EPOCH FROM (check_out - check_in)) / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to check if employee is late
CREATE OR REPLACE FUNCTION is_employee_late(check_in_time TIME, standard_start TIME DEFAULT '09:00:00', threshold_minutes INTEGER DEFAULT 15)
RETURNS BOOLEAN AS $$
BEGIN
    IF check_in_time IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN check_in_time > (standard_start + (threshold_minutes || ' minutes')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to calculate late minutes
CREATE OR REPLACE FUNCTION calculate_late_minutes(check_in_time TIME, standard_start TIME DEFAULT '09:00:00')
RETURNS INTEGER AS $$
BEGIN
    IF check_in_time IS NULL OR check_in_time <= standard_start THEN
        RETURN 0;
    END IF;
    
    RETURN EXTRACT(EPOCH FROM (check_in_time - standard_start)) / 60;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger function to auto-calculate attendance fields
CREATE OR REPLACE FUNCTION update_attendance_calculations()
RETURNS TRIGGER AS $$
DECLARE
    settings RECORD;
BEGIN
    -- Get attendance settings
    SELECT * INTO settings FROM attendance_settings LIMIT 1;
    
    -- Calculate work hours
    NEW.work_hours := calculate_work_hours(NEW.check_in_time, NEW.check_out_time);
    
    -- Check if late and calculate late minutes
    NEW.is_late := is_employee_late(NEW.check_in_time, settings.standard_start_time, settings.late_threshold_minutes);
    NEW.late_minutes := calculate_late_minutes(NEW.check_in_time, settings.standard_start_time);
    
    -- Calculate overtime
    IF NEW.work_hours > settings.overtime_threshold_hours THEN
        NEW.overtime_hours := NEW.work_hours - settings.overtime_threshold_hours;
    ELSE
        NEW.overtime_hours := 0;
    END IF;
    
    -- Set status based on check-in/check-out
    IF NEW.check_in_time IS NULL AND NEW.check_out_time IS NULL THEN
        NEW.status := 'Absent';
    ELSIF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NULL THEN
        NEW.status := 'Partial';
    ELSE
        NEW.status := 'Present';
    END IF;
    
    -- Update timestamp
    NEW.updated_date := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger
DROP TRIGGER IF EXISTS trigger_update_attendance ON attendance;
CREATE TRIGGER trigger_update_attendance
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_calculations();

-- 12. Create function to get monthly attendance summary
CREATE OR REPLACE FUNCTION get_monthly_attendance_summary(
    target_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    department_name VARCHAR(100),
    total_employees BIGINT,
    total_present BIGINT,
    total_absent BIGINT,
    total_late BIGINT,
    attendance_rate DECIMAL(5, 2),
    avg_work_hours DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.department_name,
        COUNT(DISTINCT e.employee_id) as total_employees,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as total_present,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as total_absent,
        COUNT(CASE WHEN a.is_late = TRUE THEN 1 END) as total_late,
        ROUND(
            (COUNT(CASE WHEN a.status = 'Present' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(a.attendance_id), 0)) * 100, 2
        ) as attendance_rate,
        ROUND(AVG(a.work_hours), 2) as avg_work_hours
    FROM departments d
    LEFT JOIN employees e ON d.department_id = e.department_id
    LEFT JOIN attendance a ON e.employee_id = a.employee_id 
        AND EXTRACT(MONTH FROM a.attendance_date) = target_month
        AND EXTRACT(YEAR FROM a.attendance_date) = target_year
    WHERE e.status = 'Active'
    GROUP BY d.department_id, d.department_name
    ORDER BY d.department_name;
END;
$$ LANGUAGE plpgsql;

-- 13. Create view for employee attendance summary
CREATE OR REPLACE VIEW employee_attendance_summary AS
SELECT 
    e.employee_id,
    e.employee_name,
    e.email,
    d.department_name,
    r.role_name,
    COUNT(a.attendance_id) as total_days_recorded,
    COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as days_present,
    COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as days_absent,
    COUNT(CASE WHEN a.is_late = TRUE THEN 1 END) as days_late,
    ROUND(
        (COUNT(CASE WHEN a.status = 'Present' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(a.attendance_id), 0)) * 100, 2
    ) as attendance_percentage,
    ROUND(AVG(a.work_hours), 2) as avg_daily_hours,
    ROUND(SUM(a.work_hours), 2) as total_work_hours,
    ROUND(SUM(a.overtime_hours), 2) as total_overtime_hours
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN roles r ON e.role_id = r.role_id
LEFT JOIN attendance a ON e.employee_id = a.employee_id
WHERE e.status = 'Active'
GROUP BY e.employee_id, e.employee_name, e.email, d.department_name, r.role_name
ORDER BY e.employee_name;
