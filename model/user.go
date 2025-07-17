package model

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型，记录Gmail Auth信息
// 以Gmail为锚点，唯一标识用户
// 只保存必要的用户信息
// 使用GORM进行ORM映射
type User struct {
	ID             uint           `gorm:"primaryKey" json:"id"`              // 主键ID
	Gmail          string         `gorm:"uniqueIndex;size:128" json:"gmail"` // Gmail邮箱，唯一
	Name           string         `gorm:"size:64" json:"name"`               // 用户昵称
	Avatar         string         `gorm:"size:256" json:"avatar"`            // 头像URL
	CreatedAt      time.Time      `json:"created_at"`                        // 注册时间
	UpdatedAt      time.Time      `json:"updated_at"`                        // 最后更新时间
	LastLogin      time.Time      `json:"last_login"`                        // 最后登录时间
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`                    // 软删除
	FreeTrialCount int            `json:"free_trial_count" gorm:"default:3"` // 剩余免费试用次数
}
