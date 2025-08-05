package model

import (
	"time"

	"gorm.io/gorm"
)

// UserFollow 用户关注关系模型
type UserFollow struct {
	ID         uint           `gorm:"primaryKey" json:"id"`          // 主键ID
	FollowerID uint           `gorm:"index" json:"follower_id"`     // 关注者ID
	FollowingID uint          `gorm:"index" json:"following_id"`    // 被关注者ID
	CreatedAt  time.Time      `json:"created_at"`                   // 关注时间
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`               // 软删除
}

// UserActivity 用户活动模型
type UserActivity struct {
	ID          uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	UserID      uint           `gorm:"index" json:"user_id"`           // 用户ID
	ActivityType string         `gorm:"size:32" json:"activity_type"`   // 活动类型：like/comment/share/disagree/biased/follow/analysis
	TargetID    uint           `gorm:"index" json:"target_id"`         // 目标ID（任务ID/评论ID等）
	TargetType  string         `gorm:"size:32" json:"target_type"`     // 目标类型：task/comment/analysis
	Content     string         `gorm:"type:text" json:"content"`       // 活动内容描述
	CreatedAt   time.Time      `json:"created_at"`                     // 活动时间
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// UserBadge 用户奖章模型
type UserBadge struct {
	ID        uint           `gorm:"primaryKey" json:"id"`        // 主键ID
	UserID    uint           `gorm:"index" json:"user_id"`        // 用户ID
	BadgeType string         `gorm:"size:32" json:"badge_type"`   // 奖章类型
	Name      string         `gorm:"size:64" json:"name"`         // 奖章名称
	Description string       `gorm:"size:256" json:"description"` // 奖章描述
	Icon      string         `gorm:"size:128" json:"icon"`        // 奖章图标URL
	Level     int            `json:"level"`                       // 奖章等级
	CreatedAt time.Time      `json:"created_at"`                  // 获得时间
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`              // 软删除
}

// BadgeTemplate 奖章模板模型
type BadgeTemplate struct {
	ID          uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	Type        string         `gorm:"size:32;uniqueIndex" json:"type"` // 奖章类型（唯一）
	Name        string         `gorm:"size:64" json:"name"`             // 奖章名称
	Description string         `gorm:"type:text" json:"description"`   // 奖章描述
	Icon        string         `gorm:"size:128" json:"icon"`            // 奖章图标URL
	Condition   string         `gorm:"type:text" json:"condition"`     // 获得条件描述
	Level       int            `json:"level"`                           // 奖章等级
	Category    string         `gorm:"size:32" json:"category"`        // 奖章分类
	CreatedAt   time.Time      `json:"created_at"`                     // 创建时间
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// TaskReaction 任务评价模型（扩展原有的点赞功能）
type TaskReaction struct {
	ID           uint           `gorm:"primaryKey" json:"id"`                    // 主键ID
	TaskID       uint           `gorm:"index" json:"task_id"`                      // 任务ID
	UserID       uint           `gorm:"index" json:"user_id"`                      // 用户ID
	ReactionType string         `gorm:"size:32;index" json:"reaction_type"`       // 评价类型：like/agree/disagree/biased/share
	CreatedAt    time.Time      `json:"created_at"`                                 // 评价时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                             // 软删除
}

// UserStats 用户统计模型
type UserStats struct {
	ID                uint           `gorm:"primaryKey" json:"id"`                    // 主键ID
	UserID            uint           `gorm:"uniqueIndex" json:"user_id"`               // 用户ID
	AnalysisCount     int            `json:"analysis_count" gorm:"default:0"`           // 分析论文数量
	PublicAnalysisCount int         `json:"public_analysis_count" gorm:"default:0"`   // 公开分析数量
	LikeCount         int            `json:"like_count" gorm:"default:0"`              // 获得点赞数
	CommentCount      int            `json:"comment_count" gorm:"default:0"`           // 评论数量
	FollowerCount     int            `json:"follower_count" gorm:"default:0"`          // 粉丝数量
	FollowingCount   int            `json:"following_count" gorm:"default:0"`          // 关注数量
	ShareCount       int            `json:"share_count" gorm:"default:0"`              // 分享数量
	TotalScore       int            `json:"total_score" gorm:"default:0"`              // 总积分
	CreatedAt        time.Time      `json:"created_at"`                                // 创建时间
	UpdatedAt        time.Time      `json:"updated_at"`                                // 更新时间
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`                            // 软删除
}