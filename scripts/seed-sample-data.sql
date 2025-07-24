-- Insert sample data after creating tables

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

-- Insert sample employees
INSERT INTO employees (employee_name, email, phone, department_id, role_id, hire_date, salary, status) VALUES
-- Engineering employees
('John Doe', 'john.doe@company.com', '+1-555-123-4567', 1, 1, '2022-01-15', 95000.00, 'Active'),
('Alice Johnson', 'alice.johnson@company.com', '+1-555-234-5678', 1, 2, '2023-03-10', 65000.00, 'Active'),
('Bob Smith', 'bob.smith@company.com', '+1-555-345-6789', 1, 3, '2021-08-20', 120000.00, 'Active'),
('Carol White', 'carol.white@company.com', '+1-555-456-7890', 1, 4, '2022-11-05', 85000.00, 'Active'),

-- Marketing employees
('Sarah Wilson', 'sarah.wilson@company.com', '+1-555-678-9012', 2, 6, '2021-08-20', 80000.00, 'Active'),
('Emma Davis', 'emma.davis@company.com', '+1-555-789-0123', 2, 7, '2023-01-15', 55000.00, 'Active'),

-- Sales employees
('Mike Johnson', 'mike.johnson@company.com', '+1-555-123-4567', 3, 11, '2023-03-10', 85000.00, 'Active'),
('Jennifer Taylor', 'jennifer.taylor@company.com', '+1-555-234-5678', 3, 12, '2022-07-15', 50000.00, 'Active'),

-- HR employees
('Emily Davis', 'emily.davis@company.com', '+1-555-678-9012', 4, 15, '2022-11-05', 75000.00, 'Active'),

-- Finance employees
('David Brown', 'david.brown@company.com', '+1-555-012-3456', 5, 19, '2021-06-12', 90000.00, 'Active')
ON CONFLICT (email) DO NOTHING;
