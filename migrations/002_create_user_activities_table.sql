-- 创建用户活动事件表
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    target_id INTEGER NOT NULL,
    title VARCHAR(256),
    content TEXT,
    metadata TEXT,
    visibility VARCHAR(16) DEFAULT 'public',
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- 外键约束
    CONSTRAINT fk_user_activities_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- 索引
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'paper_analyzed', 'paper_liked', 'paper_recommended', 'paper_shared',
        'analysis_created', 'analysis_updated', 'analysis_completed',
        'evaluation_created', 'evaluation_updated', 'evaluation_liked',
        'comment_created', 'comment_liked', 'comment_replied',
        'badge_earned', 'level_up', 'follow_user', 'unfollow_user'
    )),
    
    CONSTRAINT chk_target_type CHECK (target_type IN (
        'paper', 'analysis', 'evaluation', 'comment', 'user', 'badge'
    )),
    
    CONSTRAINT chk_visibility CHECK (visibility IN ('public', 'private', 'friends'))
);

-- 创建索引以提高查询性能
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_event_type ON user_activities(event_type);
CREATE INDEX idx_user_activities_target_type ON user_activities(target_type);
CREATE INDEX idx_user_activities_target_id ON user_activities(target_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_visibility ON user_activities(visibility);
CREATE INDEX idx_user_activities_user_event ON user_activities(user_id, event_type, created_at DESC);
CREATE INDEX idx_user_activities_user_target ON user_activities(user_id, target_type, target_id);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activities_updated_at 
    BEFORE UPDATE ON user_activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();