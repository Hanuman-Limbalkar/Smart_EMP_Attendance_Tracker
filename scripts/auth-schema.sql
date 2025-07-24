-- Authentication tables for the Employee Management System

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Sessions table for token management (optional)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('System Administrator', 'admin@company.com', '$2b$10$rQZ8kHWKtGY5uFQu5oGzKOXvMxvzDQFQmYzQzQzQzQzQzQzQzQzQz', 'admin'),
('HR Manager', 'hr@company.com', '$2b$10$rQZ8kHWKtGY5uFQu5oGzKOXvMxvzDQFQmYzQzQzQzQzQzQzQzQzQz', 'hr'),
('John Doe', 'john.doe@company.com', '$2b$10$rQZ8kHWKtGY5uFQu5oGzKOXvMxvzDQFQmYzQzQzQzQzQzQzQzQzQz', 'employee')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);
