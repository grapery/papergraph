package service

import (
	"errors"
	"fmt"
	"papergraph/config"
	"papergraph/model"
	"time"

	"go.uber.org/zap"
)

// AnalysisService 分析任务相关业务逻辑
type AnalysisService struct{}

// NewAnalysisService 创建AnalysisService实例
func NewAnalysisService() *AnalysisService {
	return &AnalysisService{}
}

// StartAnalysisTask 启动分析任务，调用Gemini分析（mock），保存结果
func (s *AnalysisService) StartAnalysisTask(taskID uint) error {
	config.Logger.Info("启动分析任务", zap.Uint("task_id", taskID))
	db := config.DB
	var task model.AnalysisTask
	if err := db.First(&task, taskID).Error; err != nil {
		config.Logger.Error("任务不存在", zap.Error(err), zap.Uint("task_id", taskID))
		return errors.New("任务不存在")
	}
	if task.Status != "进行中" {
		config.Logger.Warn("任务状态异常", zap.String("status", task.Status), zap.Uint("task_id", taskID))
		return errors.New("任务状态异常")
	}
	// mock分析过程（实际应调用Gemini API）
	resultContent := fmt.Sprintf("[Mock分析结果] 论文ID: %d, 分析时间: %s", task.PaperID, time.Now().Format(time.RFC3339))
	// 保存分析结果
	result := model.AnalysisResult{
		TaskID:    task.ID,
		Content:   resultContent,
		CreatedAt: time.Now(),
	}
	if err := db.Create(&result).Error; err != nil {
		config.Logger.Error("保存分析结果失败", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	// 更新任务状态
	finishTime := time.Now()
	task.Status = "已完成"
	task.FinishedAt = &finishTime
	if err := db.Save(&task).Error; err != nil {
		config.Logger.Error("更新任务状态失败", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	config.Logger.Info("分析任务完成", zap.Uint("task_id", taskID))
	return nil
}

// GetUserAnalysisTasks 获取用户历史分析任务，按时间倒序
func (s *AnalysisService) GetUserAnalysisTasks(userID uint) ([]model.AnalysisTask, error) {
	config.Logger.Info("获取用户历史分析任务", zap.Uint("user_id", userID))
	db := config.DB
	var tasks []model.AnalysisTask
	if err := db.Where("user_id = ?", userID).Order("created_at desc").Find(&tasks).Error; err != nil {
		config.Logger.Error("查询历史任务失败", zap.Error(err), zap.Uint("user_id", userID))
		return nil, err
	}
	return tasks, nil
}

// GetAnalysisTaskDetail 获取单个分析任务详情
func (s *AnalysisService) GetAnalysisTaskDetail(taskID uint) (*model.AnalysisTask, error) {
	config.Logger.Info("获取分析任务详情", zap.Uint("task_id", taskID))
	db := config.DB
	var task model.AnalysisTask
	if err := db.First(&task, taskID).Error; err != nil {
		config.Logger.Error("查询任务详情失败", zap.Error(err), zap.Uint("task_id", taskID))
		return nil, err
	}
	return &task, nil
}

// GetAnalysisResult 获取分析结果
func (s *AnalysisService) GetAnalysisResult(taskID uint) (*model.AnalysisResult, error) {
	config.Logger.Info("获取分析结果", zap.Uint("task_id", taskID))
	db := config.DB
	var result model.AnalysisResult
	if err := db.Where("task_id = ?", taskID).First(&result).Error; err != nil {
		config.Logger.Error("查询分析结果失败", zap.Error(err), zap.Uint("task_id", taskID))
		return nil, err
	}
	return &result, nil
}

// GetUserActiveTasks 获取用户正在分析的任务，最多2个，按创建时间倒序
func (s *AnalysisService) GetUserActiveTasks(userID uint) ([]model.AnalysisTask, error) {
	config.Logger.Info("获取用户正在分析的任务", zap.Uint("user_id", userID))
	db := config.DB
	var tasks []model.AnalysisTask
	if err := db.Where("user_id = ? AND status = ?", userID, "进行中").Order("created_at desc").Limit(2).Find(&tasks).Error; err != nil {
		config.Logger.Error("查询进行中任务失败", zap.Error(err), zap.Uint("user_id", userID))
		return nil, err
	}
	return tasks, nil
}

// SetTaskPublicStatus 设置分析任务公开/私有状态（仅本人可操作）
func (s *AnalysisService) SetTaskPublicStatus(userID, taskID uint, isPublic bool) error {
	config.Logger.Info("切换任务公开/私有状态", zap.Uint("user_id", userID), zap.Uint("task_id", taskID), zap.Bool("is_public", isPublic))
	db := config.DB
	var task model.AnalysisTask
	if err := db.First(&task, taskID).Error; err != nil {
		config.Logger.Error("任务不存在", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	if task.UserID != userID {
		config.Logger.Warn("无权操作", zap.Uint("user_id", userID), zap.Uint("task_id", taskID))
		return errors.New("无权操作")
	}
	task.IsPublic = isPublic
	if err := db.Save(&task).Error; err != nil {
		config.Logger.Error("切换公开状态失败", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	config.Logger.Info("切换公开状态成功", zap.Uint("task_id", taskID), zap.Bool("is_public", isPublic))
	return nil
}

// GetPublicFeed 获取公开分析任务Feed，支持按时间/点赞/建议强度排序
func (s *AnalysisService) GetPublicFeed(orderBy string) ([]model.AnalysisTask, error) {
	config.Logger.Info("获取公开Feed", zap.String("order_by", orderBy))
	db := config.DB
	var tasks []model.AnalysisTask
	query := db.Where("is_public = ? AND status = ?", true, "已完成")
	switch orderBy {
	case "like":
		query = query.Order("like_count desc")
	case "suggest":
		query = query.Order("suggest_score desc")
	default:
		query = query.Order("finished_at desc")
	}
	if err := query.Find(&tasks).Error; err != nil {
		config.Logger.Error("查询公开Feed失败", zap.Error(err))
		return nil, err
	}
	return tasks, nil
}

// LikeTask 点赞分析任务（+1，幂等）
func (s *AnalysisService) LikeTask(taskID uint) error {
	config.Logger.Info("点赞分析任务", zap.Uint("task_id", taskID))
	db := config.DB
	var task model.AnalysisTask
	if err := db.First(&task, taskID).Error; err != nil {
		config.Logger.Error("点赞失败，任务不存在", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	task.LikeCount++
	if err := db.Save(&task).Error; err != nil {
		config.Logger.Error("点赞保存失败", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	config.Logger.Info("点赞成功", zap.Uint("task_id", taskID), zap.Int("like_count", task.LikeCount))
	return nil
}

// UnlikeTask 取消点赞分析任务（-1，幂等，最小为0）
func (s *AnalysisService) UnlikeTask(taskID uint) error {
	config.Logger.Info("取消点赞分析任务", zap.Uint("task_id", taskID))
	db := config.DB
	var task model.AnalysisTask
	if err := db.First(&task, taskID).Error; err != nil {
		config.Logger.Error("取消点赞失败，任务不存在", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	if task.LikeCount > 0 {
		task.LikeCount--
	}
	if err := db.Save(&task).Error; err != nil {
		config.Logger.Error("取消点赞保存失败", zap.Error(err), zap.Uint("task_id", taskID))
		return err
	}
	config.Logger.Info("取消点赞成功", zap.Uint("task_id", taskID), zap.Int("like_count", task.LikeCount))
	return nil
}
