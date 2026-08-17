-- ========================================
-- SecureKYC Database Schema (SQL Server)
-- ========================================
-- This script creates the database and all required tables for the SecureKYC application
-- Supports: SQL Server 2019 and later

-- ========================================
-- 1. CREATE DATABASE
-- ========================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'securekyc')
BEGIN
    CREATE DATABASE securekyc;
END
GO

USE securekyc;
GO

-- ========================================
-- 2. CREATE USERS TABLE
-- ========================================
-- Purpose: Stores user account information
-- Columns:
--   - id: Primary key (auto-increment)
--   - full_name: User's full name
--   - email: User's email (unique, used for login)
--   - employee_id: Unique employee ID
--   - password: Hashed password (BCrypt)
--   - role: User role (CUSTOMER, OFFICER, ADMIN)
--   - created_at: Record creation timestamp

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT PRIMARY KEY IDENTITY(1, 1),
        full_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        employee_id NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(MAX) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    -- Create indexes for frequently queried columns
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_employee_id ON users(employee_id);
    
    PRINT 'Table [users] created successfully';
END
GO

-- ========================================
-- 3. CREATE PASSWORD_RESET_TOKENS TABLE
-- ========================================
-- Purpose: Stores password reset tokens for secure password recovery
-- Columns:
--   - id: Primary key (auto-increment)
--   - token: Unique reset token (UUID)
--   - user_id: Foreign key to users table
--   - expiry_date: Token expiration time (default: 15 minutes)
--   - used: Flag indicating if token has been used
--   - created_at: Token creation timestamp

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'password_reset_tokens')
BEGIN
    CREATE TABLE password_reset_tokens (
        id BIGINT PRIMARY KEY IDENTITY(1, 1),
        token NVARCHAR(100) NOT NULL UNIQUE,
        user_id BIGINT NOT NULL,
        expiry_date DATETIME2 NOT NULL,
        used BIT NOT NULL DEFAULT 0,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        
        -- Foreign key constraint
        CONSTRAINT fk_password_reset_tokens_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE
    );
    
    -- Create indexes
    CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
    CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    CREATE INDEX idx_password_reset_tokens_expiry_date ON password_reset_tokens(expiry_date);
    
    PRINT 'Table [password_reset_tokens] created successfully';
END
GO

-- ========================================
-- 4. VERIFICATION QUERIES
-- ========================================
-- Execute these to verify the schema

-- Show all tables
PRINT '=== Database Tables ===';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';

-- Show users table structure
PRINT '=== Users Table Structure ===';
EXEC sp_describe_first_result_set 'SELECT * FROM users';

-- Show password_reset_tokens table structure
PRINT '=== Password Reset Tokens Table Structure ===';
EXEC sp_describe_first_result_set 'SELECT * FROM password_reset_tokens';

GO

-- ========================================
-- 5. SAMPLE DATA (OPTIONAL - Remove in production)
-- ========================================
-- Uncomment to insert test data

/*
INSERT INTO users (full_name, email, employee_id, password, role)
VALUES 
    ('John Doe', 'john@example.com', 'EMP001', '$2a$10$...hashedpassword...', 'CUSTOMER'),
    ('Jane Smith', 'jane@example.com', 'EMP002', '$2a$10$...hashedpassword...', 'OFFICER'),
    ('Admin User', 'admin@example.com', 'EMP003', '$2a$10$...hashedpassword...', 'ADMIN');

SELECT * FROM users;
SELECT * FROM password_reset_tokens;
*/

-- ========================================
-- 6. DATABASE PROPERTIES
-- ========================================
-- Database: securekyc
-- Compatibility Level: 150 (SQL Server 2019)
-- Collation: SQL_Latin1_General_CP1_CI_AS (case-insensitive)
-- Tables: 2 (users, password_reset_tokens)
-- Relationships: 1 (password_reset_tokens.user_id → users.id)
