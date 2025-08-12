package model

import (
	"time"

	"gorm.io/gorm"
)

// Comment 评论模型
// 支持对分析任务结果的评论和回复
type Comment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`     // 主键ID
	TaskID    uint           `gorm:"index" json:"task_id"`     // 分析任务ID
	UserID    uint           `gorm:"index" json:"user_id"`     // 评论用户ID
	Content   string         `gorm:"type:text" json:"content"` // 评论内容
	ParentID  *uint          `json:"parent_id"`                // 父评论ID，顶级为null
	CreatedAt time.Time      `json:"created_at"`               // 创建时间
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`           // 软删除
}
