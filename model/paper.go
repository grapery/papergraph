package model

import (
	"time"

	"gorm.io/gorm"
)

// Paper 论文模型，记录用户上传的论文PDF信息
// 包含OSS存储路径、文件大小、状态等
type Paper struct {
	ID        uint           `gorm:"primaryKey" json:"id"`      // 主键ID
	UserID    uint           `gorm:"index" json:"user_id"`      // 上传用户ID
	FileName  string         `gorm:"size:256" json:"file_name"` // 文件名
	OSSPath   string         `gorm:"size:512" json:"oss_path"`  // OSS存储路径
	FileSize  int64          `json:"file_size"`                 // 文件大小（字节）
	Status    string         `gorm:"size:32" json:"status"`     // 状态（已上传/分析中/已完成/失败）
	CreatedAt time.Time      `json:"created_at"`                // 上传时间
	UpdatedAt time.Time      `json:"updated_at"`                // 更新时间
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`            // 软删除
}
