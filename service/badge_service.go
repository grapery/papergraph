package service

import (
	"papergraph/model"
	"time"

	"gorm.io/gorm"
)

type BadgeService struct {
	db *gorm.DB
}

func NewBadgeService(db *gorm.DB) *BadgeService {
	return &BadgeService{db: db}
}

// CheckAndAwardBadges 检查并颁发奖章
func (s *BadgeService) CheckAndAwardBadges(userID uint) error {
	// 获取用户统计信息
	var stats model.UserStats
	err := s.db.Where("user_id = ?", userID).First(&stats).Error
	if err != nil {
		return err
	}

	// 检查各种奖章条件
	badgesToAward := s.evaluateBadges(userID, &stats)

	// 颁发奖章
	for _, badge := range badgesToAward {
		// 检查是否已获得该奖章
		var existingBadge model.UserBadge
		err := s.db.Where("user_id = ? AND badge_type = ?", userID, badge.Type).
			First(&existingBadge).Error
		if err == nil {
			continue // 已获得，跳过
		}
		if err != gorm.ErrRecordNotFound {
			return err
		}

		// 创建用户奖章
		userBadge := model.UserBadge{
			UserID:      userID,
			BadgeType:   badge.Type,
			Name:        badge.Name,
			Description: badge.Description,
			Icon:        badge.Icon,
			Level:       badge.Level,
			CreatedAt:   time.Now(),
		}

		if err := s.db.Create(&userBadge).Error; err != nil {
			return err
		}

		// 记录获得奖章的活动
		activity := model.UserActivity{
			UserID:      userID,
			EventType:   model.EventBadgeEarned,
			TargetID:    userBadge.ID,
			TargetType:  model.TargetBadge,
			Title:       "获得了奖章：" + badge.Name,
			Content:     badge.Description,
			CreatedAt:   time.Now(),
		}
		
		if err := s.db.Create(&activity).Error; err != nil {
			return err
		}
	}

	return nil
}

// evaluateBadges 评估用户应该获得的奖章
func (s *BadgeService) evaluateBadges(userID uint, stats *model.UserStats) []model.BadgeTemplate {
	var badges []model.BadgeTemplate
	var allTemplates []model.BadgeTemplate
	
	// 获取所有奖章模板
	err := s.db.Find(&allTemplates).Error
	if err != nil {
		return badges
	}

	// 根据用户统计信息评估奖章
	for _, template := range allTemplates {
		shouldAward := false
		
		switch template.Type {
		// 分析类奖章
		case "first_analysis":
			shouldAward = stats.AnalysisCount >= 1
		case "analysis_explorer":
			shouldAward = stats.AnalysisCount >= 10
		case "analysis_master":
			shouldAward = stats.AnalysisCount >= 50
		case "analysis_legend":
			shouldAward = stats.AnalysisCount >= 100
			
		// 社交类奖章
		case "popular_analyst":
			shouldAward = stats.LikeCount >= 10
		case "superstar_analyst":
			shouldAward = stats.LikeCount >= 100
		case "rising_star":
			shouldAward = stats.FollowerCount >= 10
		case "social_butterfly":
			shouldAward = stats.FollowingCount >= 20
		case "active_commentator":
			shouldAward = stats.CommentCount >= 20
			
		// 分享类奖章
		case "knowledge_sharer":
			shouldAward = stats.PublicAnalysisCount >= 5
		case "generous_sharer":
			shouldAward = stats.ShareCount >= 5
			
		// 订阅类奖章 - 这些需要在订阅成功时单独检查
		case "premium_member", "enterprise_user":
			// 这些奖章在订阅服务中处理
			continue
		}
		
		if shouldAward {
			badges = append(badges, template)
		}
	}

	return badges
}

// GetUserBadges 获取用户奖章列表
func (s *BadgeService) GetUserBadges(userID uint) ([]model.UserBadge, error) {
	var badges []model.UserBadge
	err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&badges).Error
	return badges, err
}

// GetUserStats 获取用户统计信息
func (s *BadgeService) GetUserStats(userID uint) (*model.UserStats, error) {
	var stats model.UserStats
	err := s.db.Where("user_id = ?", userID).First(&stats).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// 创建新的统计记录
			stats = model.UserStats{
				UserID:    userID,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			err = s.db.Create(&stats).Error
		}
		return &stats, err
	}
	return &stats, nil
}

// UpdateUserStats 更新用户统计信息
func (s *BadgeService) UpdateUserStats(userID uint, updates map[string]interface{}) error {
	updates["updated_at"] = time.Now()
	return s.db.Model(&model.UserStats{}).
		Where("user_id = ?", userID).
		Updates(updates).Error
}

// AwardSubscriptionBadge 颁发订阅相关奖章
func (s *BadgeService) AwardSubscriptionBadge(userID uint, productName string) error {
	var badgeType string
	if productName == "企业版" {
		badgeType = "enterprise_user"
	} else if productName == "专业版" {
		badgeType = "premium_member"
	} else {
		return nil // 免费版不颁发奖章
	}
	
	// 获取奖章模板
	var template model.BadgeTemplate
	err := s.db.Where("type = ?", badgeType).First(&template).Error
	if err != nil {
		return err
	}
	
	// 检查是否已获得该奖章
	var existingBadge model.UserBadge
	err = s.db.Where("user_id = ? AND badge_type = ?", userID, badgeType).
		First(&existingBadge).Error
	if err == nil {
		return nil // 已获得，跳过
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}
	
	// 创建用户奖章
	userBadge := model.UserBadge{
		UserID:      userID,
		BadgeType:   template.Type,
		Name:        template.Name,
		Description: template.Description,
		Icon:        template.Icon,
		Level:       template.Level,
		CreatedAt:   time.Now(),
	}
	
	if err := s.db.Create(&userBadge).Error; err != nil {
		return err
	}
	
	// 记录获得奖章的活动
	activity := model.UserActivity{
		UserID:      userID,
		EventType:   model.EventBadgeEarned,
		TargetID:    userBadge.ID,
		TargetType:  model.TargetBadge,
		Title:       "获得了奖章：" + template.Name,
		Content:     template.Description,
		CreatedAt:   time.Now(),
	}
	
	return s.db.Create(&activity).Error
}