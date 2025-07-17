package service

import (
	"errors"
	"papergraph/config"
	"papergraph/model"
	"time"

	"go.uber.org/zap"
)

// CommentService 评论相关业务逻辑
type CommentService struct{}

// NewCommentService 创建CommentService实例
func NewCommentService() *CommentService {
	return &CommentService{}
}

// AddComment 添加评论或回复
func (s *CommentService) AddComment(userID, taskID uint, content string, parentID *uint) (*model.Comment, error) {
	config.Logger.Info("添加评论", zap.Uint("user_id", userID), zap.Uint("task_id", taskID), zap.String("content", content))
	if content == "" {
		config.Logger.Warn("评论内容为空", zap.Uint("user_id", userID), zap.Uint("task_id", taskID))
		return nil, errors.New("评论内容不能为空")
	}
	comment := model.Comment{
		TaskID:    taskID,
		UserID:    userID,
		Content:   content,
		ParentID:  parentID,
		CreatedAt: time.Now(),
	}
	db := config.DB
	if err := db.Create(&comment).Error; err != nil {
		config.Logger.Error("保存评论失败", zap.Error(err), zap.Uint("user_id", userID), zap.Uint("task_id", taskID))
		return nil, err
	}
	config.Logger.Info("评论保存成功", zap.Uint("comment_id", comment.ID))
	return &comment, nil
}

// GetComments 获取某分析任务下的评论列表，按时间正序
func (s *CommentService) GetComments(taskID uint) ([]model.Comment, error) {
	config.Logger.Info("获取评论列表", zap.Uint("task_id", taskID))
	db := config.DB
	var comments []model.Comment
	if err := db.Where("task_id = ?", taskID).Order("created_at asc").Find(&comments).Error; err != nil {
		config.Logger.Error("查询评论失败", zap.Error(err), zap.Uint("task_id", taskID))
		return nil, err
	}
	return comments, nil
}
