-- Seed data for Employee Management and Attendance Tracker

-- Insert departments
INSERT INTO departments (department_name, description, manager_name, budget, location) VALUES
('Engineering', 'Software development and technical operations', 'John Smith', 2500000.00, 'Building A, Floor 3'),
('Marketing', 'Brand management and customer acquisition', 'Sarah Johnson', 1200000.00, 'Building B, Floor 2'),
('Sales', 'Revenue generation and client relationships', 'Mike Wilson', 1800000.00, 'Building A, Floor 1'),
('HR', 'Human resources and employee relations', 'Emily Davis', 800000.00, 'Building B, Floor 1'),
('Finance', 'Financial planning and accounting', 'David Brown', 1000000.00, 'Building A, Floor 2')
ON CONFLICT (department_name) DO NOTHING;

-- Insert roles
INSERT INTO roles (role_name, department_id, base_salary) VALUES
-- Engineering roles
('Senior Developer', 1, 95000.00),
('Junior Developer', 1, 65000.00),
('Tech Lead', 1, 120000.00),
('DevOps Engineer', 1, 85000.00),
('Software Architect', 1, 130000.00),

-- Marketing roles
('Marketing Manager', 2, 80000.00),
('Content Creator', 2, 55000.00),
('SEO Specialist', 2, 60000.00),
('Social Media Manager', 2, 58000.00),
('Marketing Analyst', 2, 65000.00),

-- Sales roles
('Sales Manager', 3, 85000.00),
('Sales Representative', 3, 50000.00),
('Account Executive', 3, 70000.00),
('Business Development', 3, 75000.00),

-- HR roles
('HR Manager', 4, 75000.00),
('HR Specialist', 4, 55000.00),
('Recruiter', 4, 60000.00),
('Training Coordinator', 4, 58000.00),

-- Finance roles
('Financial Manager', 5, 90000.00),
('Accountant', 5, 55000.00),
('Financial Analyst', 5, 65000.00),
('Payroll Specialist', 5, 52000.00)
ON CONFLICT (role_name, department_id) DO NOTHING;

-- Insert employees
INSERT INTO employees (employee_name, email, phone, department_id, role_id, hire_date, salary, status) VALUES
-- Engineering employees
('John Doe', 'john.doe@company.com', '+1-555-123-4567', 1, 1, '2022-01-15', 95000.00, 'Active'),
('Alice Johnson', 'alice.johnson@company.com', '+1-555-234-5678', 1, 2, '2023-03-10', 65000.00, 'Active'),
('Bob Smith', 'bob.smith@company.com', '+1-555-345-6789', 1, 3, '2021-08-20', 120000.00, 'Active'),
('Carol White', 'carol.white@company.com', '+1-555-456-7890', 1, 4, '2022-11-05', 85000.00, 'Active'),
('David Lee', 'david.lee@company.com', '+1-555-567-8901', 1, 5, '2020-06-12', 130000.00, 'Active'),

-- Marketing employees
('Sarah Wilson', 'sarah.wilson@company.com', '+1-555-678-9012', 2, 6, '2021-08-20', 80000.00, 'Active'),
('Emma Davis', 'emma.davis@company.com', '+1-555-789-0123', 2, 7, '2023-01-15', 55000.00, 'Active'),
('James Brown', 'james.brown@company.com', '+1-555-890-1234', 2, 8, '2022-05-10', 60000.00, 'Active'),
('Lisa Garcia', 'lisa.garcia@company.com', '+1-555-901-2345', 2, 9, '2022-09-15', 58000.00, 'Active'),
('Tom Miller', 'tom.miller@company.com', '+1-555-012-3456', 2, 10, '2023-02-20', 65000.00, 'Active'),

-- Sales employees
('Mike Johnson', 'mike.johnson@company.com', '+1-555-123-4567', 3, 11, '2023-03-10', 85000.00, 'Active'),
('Jennifer Taylor', 'jennifer.taylor@company.com', '+1-555-234-5678', 3, 12, '2022-07-15', 50000.00, 'Active'),
('Robert Anderson', 'robert.anderson@company.com', '+1-555-345-6789', 3, 13, '2021-12-01', 70000.00, 'Active'),
('Michelle Thomas', 'michelle.thomas@company.com', '+1-555-456-7890', 3, 14, '2022-04-18', 75000.00, 'Active'),
('Kevin Martinez', 'kevin.martinez@company.com', '+1-555-567-8901', 3, 12, '2023-01-08', 52000.00, 'Active'),

-- HR employees
('Emily Davis', 'emily.davis@company.com', '+1-555-678-9012', 4, 15, '2022-11-05', 75000.00, 'Active'),
('Amanda Rodriguez', 'amanda.rodriguez@company.com', '+1-555-789-0123', 4, 16, '2023-02-14', 55000.00, 'Active'),
('Daniel Wilson', 'daniel.wilson@company.com', '+1-555-890-1234', 4, 17, '2022-08-22', 60000.00, 'Active'),
('Jessica Moore', 'jessica.moore@company.com', '+1-555-901-2345', 4, 18, '2023-04-10', 58000.00, 'Active'),

-- Finance employees
('David Brown', 'david.brown@company.com', '+1-555-012-3456', 5, 19, '2021-06-12', 90000.00, 'Active'),
('Rachel Green', 'rachel.green@company.com', '+1-555-123-4567', 5, 20, '2022-10-15', 55000.00, 'Active'),
('Steven Clark', 'steven.clark@company.com', '+1-555-234-5678', 5, 21, '2023-01-20', 65000.00, 'Active'),
('Nicole Lewis', 'nicole.lewis@company.com', '+1-555-345-6789', 5, 22, '2022-12-05', 52000.00, 'Active'),
('Andrew Hall', 'andrew.hall@company.com', '+1-555-456-7890', 5, 20, '2023-03-15', 57000.00, 'Active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample attendance data for the last 30 days
DO $$
DECLARE
    emp_record RECORD;
    date_counter DATE;
    random_check_in TIME;
    random_check_out TIME;
    weekend_day INTEGER;
BEGIN
    -- Loop through each active employee
    FOR emp_record IN SELECT employee_id FROM employees WHERE status = 'Active' LOOP
        -- Generate attendance for last 30 days
        FOR i IN 0..29 LOOP
            date_counter := CURRENT_DATE - i;
            weekend_day := EXTRACT(DOW FROM date_counter); -- 0=Sunday, 6=Saturday
            
            -- Skip weekends for most entries (90% skip rate)
            IF weekend_day IN (0, 6) AND random() > 0.1 THEN
                CONTINUE;
            END IF;
            
            -- 95% chance of attendance on weekdays, 70% on weekends
            IF (weekend_day NOT IN (0, 6) AND random() < 0.95) OR (weekend_day IN (0, 6) AND random() < 0.7) THEN
                -- Generate random check-in time (8:30 AM to 9:30 AM)
                random_check_in := TIME '08:30:00' + (random() * INTERVAL '1 hour');
                
                -- Generate random check-out time (4:30 PM to 6:30 PM)
                random_check_out := TIME '16:30:00' + (random() * INTERVAL '2 hours');
                
                -- 10% chance of no check-out (partial day)
                IF random() < 0.1 THEN
                    random_check_out := NULL;
                END IF;
                
                INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time)
                VALUES (emp_record.employee_id, date_counter, random_check_in, random_check_out)
                ON CONFLICT (employee_id, attendance_date) DO NOTHING;
            ELSE
                -- Mark as absent
                INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status)
                VALUES (emp_record.employee_id, date_counter, NULL, NULL, 'Absent')
                ON CONFLICT (employee_id, attendance_date) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;
