package model

import (
	"time"

	"gorm.io/gorm"
)

// AnalysisTask 分析任务模型
// 记录每次论文分析的任务信息
type AnalysisTask struct {
	ID           uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	UserID       uint           `gorm:"index" json:"user_id"`           // 用户ID
	PaperID      uint           `gorm:"index" json:"paper_id"`          // 论文ID
	Status       string         `gorm:"size:32" json:"status"`          // 状态（进行中/完成/失败）
	IsPublic     bool           `gorm:"default:false" json:"is_public"` // 是否公开
	SuggestScore int            `json:"suggest_score"`                  // 阅读原文建议强度
	LikeCount    int            `json:"like_count"`                     // 点赞数
	ReadCount    int            `json:"read_count"`                     // 阅读数
	CreatedAt    time.Time      `json:"created_at"`                     // 创建时间
	FinishedAt   *time.Time     `json:"finished_at"`                    // 完成时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// AnalysisResult 分析结果模型
// 记录Gemini分析的结果内容
type AnalysisResult struct {
	ID        uint           `gorm:"primaryKey" json:"id"`     // 主键ID
	TaskID    uint           `gorm:"index" json:"task_id"`     // 分析任务ID
	Content   string         `gorm:"type:text" json:"content"` // 分析内容
	CreatedAt time.Time      `json:"created_at"`               // 创建时间
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`           // 软删除
}
