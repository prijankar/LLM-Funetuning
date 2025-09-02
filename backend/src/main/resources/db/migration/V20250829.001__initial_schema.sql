-- ==============================
-- Create roles table
-- ==============================
CREATE TABLE IF NOT EXISTS roles (
                                     id BIGSERIAL PRIMARY KEY,
                                     role_name VARCHAR(20) NOT NULL UNIQUE
);

-- ==============================
-- Create app_users table
-- ==============================
CREATE TABLE IF NOT EXISTS app_users (
                                         id BIGSERIAL PRIMARY KEY,
                                         username VARCHAR(20) NOT NULL UNIQUE,
                                         email VARCHAR(50) NOT NULL UNIQUE,
                                         password VARCHAR(120) NOT NULL,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP
);

-- ==============================
-- Create user_roles join table
-- ==============================
CREATE TABLE IF NOT EXISTS user_roles (
                                          user_id BIGINT NOT NULL,
                                          role_id BIGINT NOT NULL,
                                          PRIMARY KEY (user_id, role_id),
                                          FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE,
                                          FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- ==============================
-- Create indexes (safe idempotent)
-- ==============================
CREATE INDEX IF NOT EXISTS idx_user_username ON app_users (username);
CREATE INDEX IF NOT EXISTS idx_user_email ON app_users (email);
CREATE INDEX IF NOT EXISTS idx_role_name ON roles (role_name);

-- ==============================
-- Insert default roles (idempotent)
-- ==============================
INSERT INTO roles (role_name) VALUES ('ADMIN')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO roles (role_name) VALUES ('USER')
ON CONFLICT (role_name) DO NOTHING;

-- ==============================
-- Optional: Insert a default admin user (idempotent)
-- (Password should be hashed!)
-- ==============================
INSERT INTO app_users (username, email, password)
VALUES ('admin', 'admin@example.com', 'changeme')
ON CONFLICT (username) DO NOTHING;

-- ==============================
-- Optional: Assign ADMIN role to default admin user (idempotent)
-- ==============================
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM app_users u

         JOIN roles r ON r.role_name = 'ADMIN'
WHERE u.username = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ==============================
-- Debug: Show current data
-- ==============================
SELECT * FROM roles;
SELECT * FROM app_users;

SELECT * FROM user_roles;
