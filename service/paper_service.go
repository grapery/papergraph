package service

import (
	"errors"
	"fmt"
	"papergraph/config"
	"papergraph/model"
	"papergraph/utils"
	"time"

	"go.uber.org/zap"
)

const MaxPDFSize = 20 * 1024 * 1024 // 20MB

// PaperService 论文相关业务逻辑
type PaperService struct{}

// NewPaperService 创建PaperService实例
func NewPaperService() *PaperService {
	return &PaperService{}
}

// UploadAndCreateTask 上传PDF到OSS并创建分析任务
// userID: 当前用户ID
// fileName: 文件名
// fileData: 文件字节流
// fileSize: 文件大小
func (s *PaperService) UploadAndCreateTask(userID uint, fileName string, fileData []byte, fileSize int64) (*model.Paper, *model.AnalysisTask, error) {
	config.Logger.Info("开始上传论文", zap.Uint("user_id", userID), zap.String("file_name", fileName), zap.Int64("file_size", fileSize))
	if fileSize > MaxPDFSize {
		config.Logger.Warn("文件过大", zap.Int64("file_size", fileSize))
		return nil, nil, errors.New("文件大小不能超过20MB")
	}
	// 上传到OSS
	ossPath, err := utils.UploadToOSS(fileName, fileData)
	if err != nil {
		config.Logger.Error("OSS上传失败", zap.Error(err))
		return nil, nil, fmt.Errorf("OSS上传失败: %w", err)
	}
	config.Logger.Info("OSS上传成功", zap.String("oss_path", ossPath))
	// 保存论文记录
	paper := model.Paper{
		UserID:    userID,
		FileName:  fileName,
		OSSPath:   ossPath,
		FileSize:  fileSize,
		Status:    "分析中",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db := config.DB
	if err := db.Create(&paper).Error; err != nil {
		config.Logger.Error("保存论文记录失败", zap.Error(err))
		return nil, nil, err
	}
	config.Logger.Info("论文记录保存成功", zap.Uint("paper_id", paper.ID))
	// 创建分析任务
	task := model.AnalysisTask{
		UserID:    userID,
		PaperID:   paper.ID,
		Status:    "进行中",
		IsPublic:  false,
		CreatedAt: time.Now(),
	}
	if err := db.Create(&task).Error; err != nil {
		config.Logger.Error("创建分析任务失败", zap.Error(err))
		return &paper, nil, err
	}
	config.Logger.Info("分析任务创建成功", zap.Uint("task_id", task.ID))
	return &paper, &task, nil
}
