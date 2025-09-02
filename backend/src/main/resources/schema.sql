-- Drop existing tables if they exist (in correct order to respect foreign keys)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Create the users table
CREATE TABLE app_users (
                           id BIGSERIAL PRIMARY KEY,
                           username VARCHAR(50) NOT NULL UNIQUE,
                           email VARCHAR(100) NOT NULL UNIQUE,
                           password VARCHAR(120) NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table first
CREATE TABLE roles (
                       id SERIAL PRIMARY KEY,
                       role_name VARCHAR(20) UNIQUE NOT NULL
);

-- Then create user_roles with proper foreign keys
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id INT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_users (id) ON DELETE CASCADE,
                            CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO app_users (username, email, password)
VALUES ('Prijanka', 'pramcharan@qualogy.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM app_users u
         CROSS JOIN roles r
WHERE u.username = 'Prijanka' AND r.role_name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

select *
from roles;

select *
from user_roles;


select *
from app_users;
SELECT * FROM app_users WHERE username = 'Prijanka';
