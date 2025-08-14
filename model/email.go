package model

import (
	"time"
	"gorm.io/gorm"
)

// Email 邮件数据模型
type Email struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	
	// Gmail相关字段
	GmailID      string    `gorm:"uniqueIndex;size:255" json:"gmail_id"`    // Gmail邮件ID
	ThreadID     string    `gorm:"index;size:255" json:"thread_id"`         // Gmail线程ID
	Subject      string    `gorm:"size:500" json:"subject"`                 // 邮件主题
	FromEmail    string    `gorm:"index;size:255" json:"from_email"`        // 发件人邮箱
	FromName     string    `gorm:"size:255" json:"from_name"`               // 发件人姓名
	ToEmail      string    `gorm:"index;size:255" json:"to_email"`          // 收件人邮箱
	ToName       string    `gorm:"size:255" json:"to_name"`                 // 收件人姓名
	DateSent     time.Time `gorm:"index" json:"date_sent"`                  // 发送时间
	Body         string    `gorm:"type:text" json:"body"`                   // 邮件正文（纯文本）
	BodyHTML     string    `gorm:"type:longtext" json:"body_html"`          // 邮件正文（HTML）
	Snippet      string    `gorm:"size:1000" json:"snippet"`                // 邮件摘要
	SizeEstimate int64     `json:"size_estimate"`                           // 邮件大小估计
	LabelIDs     string    `gorm:"type:text" json:"label_ids"`              // 标签ID（JSON格式存储）
	
	// 用户关联
	UserID       uint      `gorm:"index" json:"user_id"`                    // 关联的用户ID
	User         User      `gorm:"foreignKey:UserID" json:"user,omitempty"` // 关联的用户
	
	// 分析状态
	IsAnalyzed   bool      `gorm:"default:false" json:"is_analyzed"`        // 是否已分析
	AnalysisResult string  `gorm:"type:text" json:"analysis_result"`        // 分析结果
	
	// 分类标签
	Category     string    `gorm:"size:100" json:"category"`                // 邮件分类
	Priority     string    `gorm:"size:50" json:"priority"`                 // 优先级
	Tags         string    `gorm:"type:text" json:"tags"`                   // 自定义标签（JSON格式）
	
	// 处理状态
	IsRead       bool      `gorm:"default:false" json:"is_read"`            // 是否已读
	IsImportant  bool      `gorm:"default:false" json:"is_important"`       // 是否重要
	IsArchived   bool      `gorm:"default:false" json:"is_archived"`        // 是否已归档
	
	// 统计字段
	WordCount    int       `json:"word_count"`                              // 字数统计
	AttachmentCount int    `json:"attachment_count"`                        // 附件数量
}

// EmailAnalysis 邮件分析结果模型
type EmailAnalysis struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	
	// 关联邮件
	EmailID   uint   `gorm:"index" json:"email_id"`
	Email     Email  `gorm:"foreignKey:EmailID" json:"email,omitempty"`
	
	// 分析结果
	Sentiment     string  `gorm:"size:50" json:"sentiment"`          // 情感分析结果
	SentimentScore float64 `json:"sentiment_score"`                   // 情感得分
	Language      string  `gorm:"size:10" json:"language"`           // 语言检测结果
	Keywords      string  `gorm:"type:text" json:"keywords"`         // 关键词（JSON格式）
	Summary       string  `gorm:"type:text" json:"summary"`          // 摘要
	Topics        string  `gorm:"type:text" json:"topics"`           // 主题分类（JSON格式）
	Entities      string  `gorm:"type:text" json:"entities"`         // 实体识别结果（JSON格式）
	
	// AI生成内容
	GeneratedDraft string `gorm:"type:text" json:"generated_draft"`  // 生成的回复草稿
	Suggestions   string  `gorm:"type:text" json:"suggestions"`      // 处理建议
	
	// 置信度和评分
	Confidence    float64 `json:"confidence"`                        // 分析置信度
	Quality       int     `json:"quality"`                           // 分析质量评分（1-10）
}

// EmailDraft 邮件草稿模型
type EmailDraft struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	
	// 用户关联
	UserID    uint   `gorm:"index" json:"user_id"`
	User      User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	// 原始邮件（如果是回复）
	OriginalEmailID *uint  `gorm:"index" json:"original_email_id,omitempty"`
	OriginalEmail   *Email `gorm:"foreignKey:OriginalEmailID" json:"original_email,omitempty"`
	
	// 草稿内容
	ToEmail     string `gorm:"size:255" json:"to_email"`           // 收件人
	Subject     string `gorm:"size:500" json:"subject"`            // 主题
	Body        string `gorm:"type:text" json:"body"`              // 正文
	BodyHTML    string `gorm:"type:longtext" json:"body_html"`     // HTML正文
	
	// 生成信息
	Prompt      string `gorm:"type:text" json:"prompt"`            // 生成提示
	AIModel     string `gorm:"size:100" json:"ai_model"`           // 使用的AI模型
	
	// 状态
	Status      string `gorm:"size:50;default:'draft'" json:"status"` // 状态：draft, sent, discarded
	IsSent      bool   `gorm:"default:false" json:"is_sent"`       // 是否已发送
	SentAt      *time.Time `json:"sent_at,omitempty"`              // 发送时间
}

// EmailFilter 邮件过滤器模型
type EmailFilter struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	
	// 用户关联
	UserID    uint   `gorm:"index" json:"user_id"`
	User      User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	// 过滤器配置
	Name        string `gorm:"size:255" json:"name"`                // 过滤器名称
	Description string `gorm:"type:text" json:"description"`        // 描述
	Query       string `gorm:"type:text" json:"query"`              // Gmail查询字符串
	Category    string `gorm:"size:100" json:"category"`            // 自动分类
	Priority    string `gorm:"size:50" json:"priority"`             // 自动优先级
	
	// 过滤条件
	FromContains    string `gorm:"size:255" json:"from_contains"`     // 发件人包含
	SubjectContains string `gorm:"size:255" json:"subject_contains"`  // 主题包含
	BodyContains    string `gorm:"size:255" json:"body_contains"`     // 正文包含
	
	// 自动操作
	AutoRead        bool   `gorm:"default:false" json:"auto_read"`        // 自动标记已读
	AutoImportant   bool   `gorm:"default:false" json:"auto_important"`   // 自动标记重要
	AutoArchive     bool   `gorm:"default:false" json:"auto_archive"`     // 自动归档
	AutoAnalyze     bool   `gorm:"default:true" json:"auto_analyze"`      // 自动分析
	
	// 状态
	IsActive        bool   `gorm:"default:true" json:"is_active"`         // 是否激活
	MatchCount      int    `json:"match_count"`                           // 匹配邮件数量
	LastUsed        *time.Time `json:"last_used,omitempty"`               // 最后使用时间
}

// TableName 指定表名
func (Email) TableName() string {
	return "emails"
}

func (EmailAnalysis) TableName() string {
	return "email_analyses"
}

func (EmailDraft) TableName() string {
	return "email_drafts"
}

func (EmailFilter) TableName() string {
	return "email_filters"
}
