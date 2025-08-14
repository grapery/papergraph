package model

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型，支持邮箱密码认证和Gmail Auth
// 以邮箱为锚点，唯一标识用户
// 保存完整的用户信息
// 使用GORM进行ORM映射
type User struct {
	ID             uint           `gorm:"primaryKey" json:"id"`                  // 主键ID
	Email          string         `gorm:"uniqueIndex;size:128" json:"email"`     // 邮箱，唯一
	Password       string         `gorm:"size:255" json:"-"`                     // 密码哈希
	Gmail          string         `gorm:"uniqueIndex;size:128" json:"gmail"`     // Gmail邮箱，唯一
	Name           string         `gorm:"size:64" json:"name"`                   // 用户昵称
	Avatar         string         `gorm:"size:256" json:"avatar"`                // 头像URL
	Institution    string         `gorm:"size:128" json:"institution"`          // 机构
	Position       string         `gorm:"size:64" json:"position"`               // 职位
	Field          string         `gorm:"size:64" json:"field"`                 // 研究领域
	CreatedAt      time.Time      `json:"created_at"`                           // 注册时间
	UpdatedAt      time.Time      `json:"updated_at"`                           // 最后更新时间
	LastLogin      time.Time      `json:"last_login"`                           // 最后登录时间
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`                       // 软删除
	FreeTrialCount int            `json:"free_trial_count" gorm:"default:3"`     // 剩余免费试用次数
	AuthProvider   string         `gorm:"size:20;default:'email'" json:"auth_provider"` // 认证方式: email, google
}

// PasswordResetToken 密码重置令牌模型
type PasswordResetToken struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	Token     string         `gorm:"size:255;not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time      `json:"created_at"`
	UsedAt    *time.Time     `gorm:"index" json:"used_at,omitempty"`
}
