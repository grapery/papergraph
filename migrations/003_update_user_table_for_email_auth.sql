-- 003_update_user_table_for_email_auth.sql
-- 更新用户表以支持邮箱密码认证

-- 添加新字段到用户表
ALTER TABLE users 
ADD COLUMN email VARCHAR(128) UNIQUE,
ADD COLUMN password VARCHAR(255),
ADD COLUMN institution VARCHAR(128),
ADD COLUMN position VARCHAR(64),
ADD COLUMN field VARCHAR(64),
ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email';

-- 更新现有记录，将gmail复制到email字段
UPDATE users SET email = gmail WHERE email IS NULL AND gmail IS NOT NULL;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- 添加密码重置令牌表
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    INDEX idx_token_user_id (user_id),
    INDEX idx_token_token (token),
    INDEX idx_token_expires_at (expires_at)
);

-- 添加约束确保email或gmail至少有一个不为空
ALTER TABLE users 
ADD CONSTRAINT chk_user_email_or_gmail 
CHECK ((email IS NOT NULL AND email != '') OR (gmail IS NOT NULL AND gmail != ''));