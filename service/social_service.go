package service

import (
	"papergraph/model"
	"time"

	"gorm.io/gorm"
)

type SocialService struct {
	db *gorm.DB
}

func NewSocialService(db *gorm.DB) *SocialService {
	return &SocialService{db: db}
}

// FollowUser 关注用户
func (s *SocialService) FollowUser(followerID, followingID uint) error {
	// 检查是否已关注
	var existingFollow model.UserFollow
	err := s.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).
		First(&existingFollow).Error
	if err == nil {
		return nil // 已关注，无需重复关注
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}

	// 不能关注自己
	if followerID == followingID {
		return nil
	}

	// 创建关注关系
	follow := model.UserFollow{
		FollowerID:  followerID,
		FollowingID: followingID,
		CreatedAt:   time.Now(),
	}

	// 记录关注活动
	activity := model.UserActivity{
		UserID:      followerID,
		EventType:   model.EventFollowUser,
		TargetID:    followingID,
		TargetType:  model.TargetUser,
		Title:       "关注了用户",
		CreatedAt:   time.Now(),
	}

	// 更新用户统计
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&follow).Error; err != nil {
			return err
		}

		if err := tx.Create(&activity).Error; err != nil {
			return err
		}

		// 更新关注者的关注数量
		if err := tx.Model(&model.UserStats{}).
			Where("user_id = ?", followerID).
			UpdateColumn("following_count", gorm.Expr("following_count + ?", 1)).Error; err != nil {
			return err
		}

		// 更新被关注者的粉丝数量
		if err := tx.Model(&model.UserStats{}).
			Where("user_id = ?", followingID).
			UpdateColumn("follower_count", gorm.Expr("follower_count + ?", 1)).Error; err != nil {
			return err
		}

		return nil
	})
}

// UnfollowUser 取消关注用户
func (s *SocialService) UnfollowUser(followerID, followingID uint) error {
	// 删除关注关系
	err := s.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Delete(&model.UserFollow{}).Error
	if err != nil {
		return err
	}

	// 更新用户统计
	return s.db.Transaction(func(tx *gorm.DB) error {
		// 更新关注者的关注数量
		if err := tx.Model(&model.UserStats{}).
			Where("user_id = ?", followerID).
			UpdateColumn("following_count", gorm.Expr("GREATEST(following_count - 1, 0)")).Error; err != nil {
			return err
		}

		// 更新被关注者的粉丝数量
		if err := tx.Model(&model.UserStats{}).
			Where("user_id = ?", followingID).
			UpdateColumn("follower_count", gorm.Expr("GREATEST(follower_count - 1, 0)")).Error; err != nil {
			return err
		}

		return nil
	})
}

// GetFollowing 获取用户关注列表
func (s *SocialService) GetFollowing(userID uint, limit, offset int) ([]model.UserFollow, error) {
	var follows []model.UserFollow
	err := s.db.Where("follower_id = ?", userID).
		Preload("Following").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error
	return follows, err
}

// GetFollowers 获取用户粉丝列表
func (s *SocialService) GetFollowers(userID uint, limit, offset int) ([]model.UserFollow, error) {
	var follows []model.UserFollow
	err := s.db.Where("following_id = ?", userID).
		Preload("Follower").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error
	return follows, err
}

// IsFollowing 检查是否已关注
func (s *SocialService) IsFollowing(followerID, followingID uint) (bool, error) {
	var count int64
	err := s.db.Model(&model.UserFollow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count).Error
	return count > 0, err
}

// GetUserActivityFeed 获取用户活动Feed流
func (s *SocialService) GetUserActivityFeed(userID uint, limit, offset int) ([]model.UserActivity, error) {
	var activities []model.UserActivity
	
	// 获取用户自己和关注用户的活动ID列表
	var followingIDs []uint
	s.db.Model(&model.UserFollow{}).
		Where("follower_id = ?", userID).
		Pluck("following_id", &followingIDs)
	
	// 包含用户自己的ID
	userIDs := append([]uint{userID}, followingIDs...)
	
	err := s.db.Where("user_id IN ?", userIDs).
		Preload("User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&activities).Error
	
	return activities, err
}

// GetUserAnalysisFeed 获取用户分析Feed流
func (s *SocialService) GetUserAnalysisFeed(userID uint, limit, offset int) ([]model.AnalysisTask, error) {
	var tasks []model.AnalysisTask
	
	// 获取用户自己和关注用户的公开分析
	var followingIDs []uint
	s.db.Model(&model.UserFollow{}).
		Where("follower_id = ?", userID).
		Pluck("following_id", &followingIDs)
	
	// 包含用户自己的ID
	userIDs := append([]uint{userID}, followingIDs...)
	
	err := s.db.Where("user_id IN ? AND is_public = ?", userIDs, true).
		Preload("User").
		Preload("Paper").
		Preload("AnalysisResult").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tasks).Error
	
	return tasks, err
}

// AddUserActivity 添加用户活动记录
func (s *SocialService) AddUserActivity(userID uint, eventType, targetType string, targetID uint, title, content string) error {
	activity := model.UserActivity{
		UserID:      userID,
		EventType:   eventType,
		TargetID:    targetID,
		TargetType:  targetType,
		Title:       title,
		Content:     content,
		CreatedAt:   time.Now(),
	}
	
	return s.db.Create(&activity).Error
}

// GetTaskReactions 获取任务的所有评价
func (s *SocialService) GetTaskReactions(taskID uint) (map[string]int64, error) {
	var reactions []model.TaskReaction
	err := s.db.Where("task_id = ?", taskID).Find(&reactions).Error
	if err != nil {
		return nil, err
	}
	
	// 统计各种评价数量
	result := make(map[string]int64)
	for _, reaction := range reactions {
		result[reaction.ReactionType]++
	}
	
	return result, nil
}

// GetUserReactionForTask 获取用户对任务的特定评价
func (s *SocialService) GetUserReactionForTask(userID, taskID uint, reactionType string) (*model.TaskReaction, error) {
	var reaction model.TaskReaction
	err := s.db.Where("user_id = ? AND task_id = ? AND reaction_type = ?", userID, taskID, reactionType).
		First(&reaction).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &reaction, err
}