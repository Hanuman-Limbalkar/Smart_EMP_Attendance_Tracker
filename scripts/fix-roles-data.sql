-- First, let's check what roles exist
SELECT * FROM roles ORDER BY role_id;

-- Insert missing roles to match the frontend expectations
INSERT INTO roles (role_id, role_name, department_id, base_salary) VALUES
-- HR roles (department_id = 4)
(15, 'HR Manager', 4, 75000.00),
(16, 'HR Specialist', 4, 55000.00),
(17, 'Recruiter', 4, 60000.00),
(18, 'Training Coordinator', 4, 58000.00)
ON CONFLICT (role_id) DO NOTHING;

-- Update the sequence to prevent conflicts
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));

-- Verify the roles are inserted
SELECT r.role_id, r.role_name, d.department_name 
FROM roles r 
JOIN departments d ON r.department_id = d.department_id 
ORDER BY d.department_name, r.role_name;
