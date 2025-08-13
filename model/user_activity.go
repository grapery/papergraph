package model

import (
	"time"

	"gorm.io/gorm"
)

// UserActivity 用户活动事件模型
type UserActivity struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index;not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	
	// 事件类型
	EventType string         `gorm:"size:32;not null;index" json:"event_type"`
	
	// 事件目标信息
	TargetType string         `gorm:"size:32;not null;index" json:"target_type"` // paper, analysis, comment
	TargetID   uint           `gorm:"not null;index" json:"target_id"`
	
	// 事件内容
	Title      string         `gorm:"size:256" json:"title"`
	Content    string         `gorm:"type:text" json:"content"`
	Metadata   string         `gorm:"type:text" json:"metadata"` // JSON格式的额外数据
	
	// 可见性设置
	Visibility string         `gorm:"size:16;default:'public';index" json:"visibility"` // public, private, friends
	
	// 互动数据
	LikeCount  int            `gorm:"default:0" json:"like_count"`
	CommentCount int          `gorm:"default:0" json:"comment_count"`
	
	// 时间戳
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// 事件类型常量
const (
	// 论文相关事件
	EventPaperAnalyzed      = "paper_analyzed"      // AI分析论文
	EventPaperLiked         = "paper_liked"         // 点赞论文
	EventPaperRecommended   = "paper_recommended"   // 推荐论文
	EventPaperShared        = "paper_shared"        // 分享论文
	
	// 分析相关事件
	EventAnalysisCreated    = "analysis_created"    // 创建分析
	EventAnalysisUpdated    = "analysis_updated"    // 更新分析
	EventAnalysisCompleted  = "analysis_completed"  // 分析完成
	
	// 评价相关事件
	EventEvaluationCreated  = "evaluation_created"  // 创建评价
	EventEvaluationUpdated  = "evaluation_updated"  // 更新评价
	EventEvaluationLiked   = "evaluation_liked"   // 点赞评价
	
	// 评论相关事件
	EventCommentCreated    = "comment_created"    // 发表评论
	EventCommentLiked      = "comment_liked"      // 点赞评论
	EventCommentReplied    = "comment_replied"    // 回复评论
	
	// 系统事件
	EventBadgeEarned       = "badge_earned"       // 获得徽章
	EventLevelUp           = "level_up"           // 等级提升
	EventFollowUser        = "follow_user"        // 关注用户
	EventUnfollowUser      = "unfollow_user"      // 取消关注
)

// 目标类型常量
const (
	TargetPaper      = "paper"
	TargetAnalysis   = "analysis"
	TargetEvaluation = "evaluation"
	TargetComment    = "comment"
	TargetUser       = "user"
	TargetBadge      = "badge"
)

// 可见性常量
const (
	VisibilityPublic  = "public"
	VisibilityPrivate = "private"
	VisibilityFriends = "friends"
)

// TableName 指定表名
func (UserActivity) TableName() string {
	return "user_activities"
}