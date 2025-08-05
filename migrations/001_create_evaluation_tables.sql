-- 论文多维度评价系统数据库迁移脚本
-- 创建时间: 2025-01-05

-- 创建论文评价表
CREATE TABLE IF NOT EXISTS paper_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    user_id INT NOT NULL,
    paper_id INT NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL COMMENT '总体评分 (0-10)',
    summary TEXT COMMENT '总体评价摘要',
    recommendation TEXT COMMENT '改进建议',
    originality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '原创性评分',
    depth_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '深度洞察评分',
    logic_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '逻辑严谨评分',
    evidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '证据支撑评分',
    language_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '语言表达评分',
    value_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '学术价值评分',
    content_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '内容质量评分',
    structure_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '结构逻辑评分',
    method_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '方法证据评分',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    is_verified BOOLEAN DEFAULT FALSE COMMENT '是否已验证',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_user_id (user_id),
    INDEX idx_paper_id (paper_id),
    INDEX idx_overall_score (overall_score),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论文多维度评价表';

-- 创建评价维度详情表
CREATE TABLE IF NOT EXISTS evaluation_dimensions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    dimension_key VARCHAR(32) NOT NULL COMMENT '维度标识符',
    dimension_name VARCHAR(64) NOT NULL COMMENT '维度名称',
    score DECIMAL(5,2) NOT NULL COMMENT '维度评分',
    description TEXT COMMENT '维度描述',
    evidence TEXT COMMENT '支撑证据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_dimension_key (dimension_key),
    INDEX idx_score (score),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价维度详情表';

-- 创建评价指标表
CREATE TABLE IF NOT EXISTS evaluation_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dimension_id INT NOT NULL,
    metric_key VARCHAR(32) NOT NULL COMMENT '指标标识符',
    metric_name VARCHAR(64) NOT NULL COMMENT '指标名称',
    score DECIMAL(5,2) NOT NULL COMMENT '指标评分',
    description TEXT COMMENT '指标描述',
    evidence TEXT COMMENT '支撑证据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_dimension_id (dimension_id),
    INDEX idx_metric_key (metric_key),
    INDEX idx_score (score),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价指标表';

-- 创建评价评论表
CREATE TABLE IF NOT EXISTS evaluation_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL COMMENT '评论内容',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价评论表';

-- 创建评价点赞表
CREATE TABLE IF NOT EXISTS evaluation_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY uniq_evaluation_user (evaluation_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价点赞表';

-- 插入示例数据（可选）
INSERT INTO paper_evaluations (
    analysis_id, user_id, paper_id, overall_score, summary, recommendation,
    originality_score, depth_score, logic_score, evidence_score, language_score, value_score,
    content_score, structure_score, method_score, is_public
) VALUES (
    1, 1, 1, 7.2, 
    '该论文在原创性和逻辑性方面表现较好，但在证据支撑方面需要加强。整体而言，这是一篇具有良好潜力的论文，值得进一步完善。',
    '建议加强数据收集和文献支撑，提高论文的说服力。同时，可以考虑扩展研究方法的多样性，以增强研究的深度和广度。',
    8.0, 7.0, 8.0, 6.0, 7.0, 7.0, 7.5, 8.0, 6.0, TRUE
) ON DUPLICATE KEY UPDATE id=id;

-- 获取刚插入的评价ID
SET @evaluation_id = LAST_INSERT_ID();

-- 插入维度详情示例数据
INSERT INTO evaluation_dimensions (
    evaluation_id, dimension_key, dimension_name, score, description, evidence
) VALUES
(@evaluation_id, 'originality', '原创性', 8.0, '论文的独创性和新颖性', '提出了新的分析框架，填补了现有研究空白'),
(@evaluation_id, 'depth', '深度洞察', 7.0, '分析的深度和洞察力', '多层次分析，机制解释清晰'),
(@evaluation_id, 'logic', '逻辑严谨', 8.0, '论证的逻辑性和严密性', '论证结构完整，推理过程严密'),
(@evaluation_id, 'evidence', '证据支撑', 6.0, '论据的充分性和可靠性', '数据量适中，但需要更多的文献支撑'),
(@evaluation_id, 'language', '语言表达', 7.0, '语言的质量和表达效果', '表达简洁，逻辑清晰'),
(@evaluation_id, 'value', '学术价值', 7.0, '论文的学术贡献和应用价值', '具有理论贡献和应用前景')
ON DUPLICATE KEY UPDATE id=id;

-- 插入指标示例数据
INSERT INTO evaluation_metrics (
    dimension_id, metric_key, metric_name, score, description, evidence
) VALUES
(1, 'innovation', '创新点明确', 8.0, '是否提出了新的观点、方法或发现', '提出了新的分析框架'),
(1, 'comparison', '文献对比', 7.0, '与已有研究的对比分析', '文献综述全面，对比分析清晰'),
(2, 'analysis', '分析层次', 7.0, '从现象到本质的分析深度', '多层次分析，机制解释清晰'),
(2, 'insight', '洞察力', 7.0, '对问题的深刻理解和见解', '提炼出规律，具有启发性'),
(3, 'coherence', '逻辑连贯', 8.0, '论证过程的逻辑链条', '论证结构完整，推理过程严密'),
(3, 'structure', '结构清晰', 8.0, '文章结构的合理性', '层次分明，过渡自然'),
(4, 'data', '数据支持', 6.0, '数据的充分性和可靠性', '数据量适中，来源可靠'),
(4, 'citation', '文献支撑', 6.0, '参考文献的质量和相关性', '文献权威，引用适中'),
(5, 'clarity', '表达清晰', 7.0, '语言表达的清晰度', '表达简洁，逻辑清晰'),
(5, 'accuracy', '用词准确', 7.0, '术语使用的准确性', '术语规范，用词准确'),
(6, 'contribution', '学术贡献', 7.0, '对学科发展的贡献', '理论贡献，方法创新'),
(6, 'application', '应用价值', 7.0, '实际应用的可能性', '实践指导，应用前景')
ON DUPLICATE KEY UPDATE id=id;