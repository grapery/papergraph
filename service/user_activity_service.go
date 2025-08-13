package service

import (
	"encoding/json"
	"fmt"
	"time"

	"papergraph/model"
	"papergraph/utils"

	"gorm.io/gorm"
)

// UserActivityService 用户活动事件服务
type UserActivityService struct {
	db *gorm.DB
}

// NewUserActivityService 创建用户活动事件服务
func NewUserActivityService(db *gorm.DB) *UserActivityService {
	return &UserActivityService{db: db}
}

// CreateActivityRequest 创建活动事件请求
type CreateActivityRequest struct {
	UserID     uint                 `json:"user_id" binding:"required"`
	EventType  string               `json:"event_type" binding:"required"`
	TargetType string               `json:"target_type" binding:"required"`
	TargetID   uint                 `json:"target_id" binding:"required"`
	Title      string               `json:"title"`
	Content    string               `json:"content"`
	Metadata   map[string]interface{} `json:"metadata"`
	Visibility string               `json:"visibility"`
}

// ActivityResponse 活动事件响应
type ActivityResponse struct {
	ID           uint                         `json:"id"`
	UserID       uint                         `json:"user_id"`
	User         *model.User                  `json:"user"`
	EventType    string                       `json:"event_type"`
	TargetType   string                       `json:"target_type"`
	TargetID     uint                         `json:"target_id"`
	Title        string                       `json:"title"`
	Content      string                       `json:"content"`
	Metadata     map[string]interface{}       `json:"metadata"`
	Visibility   string                       `json:"visibility"`
	LikeCount    int                          `json:"like_count"`
	CommentCount int                          `json:"comment_count"`
	CreatedAt    time.Time                    `json:"created_at"`
	UpdatedAt    time.Time                    `json:"updated_at"`
	TargetInfo   interface{}                  `json:"target_info,omitempty"` // 目标对象的详细信息
}

// GetActivitiesQuery 获取活动事件查询参数
type GetActivitiesQuery struct {
	UserID     *uint  `form:"user_id"`
	EventType  string `form:"event_type"`
	TargetType string `form:"target_type"`
	TargetID   *uint  `form:"target_id"`
	Visibility string `form:"visibility"`
	Page       int    `form:"page" binding:"min=1"`
	PageSize   int    `form:"page_size" binding:"min=1,max=100"`
}

// PaginatedActivitiesResponse 分页活动事件响应
type PaginatedActivitiesResponse struct {
	Activities []ActivityResponse `json:"activities"`
	Pagination utils.Pagination   `json:"pagination"`
}

// CreateActivity 创建用户活动事件
func (s *UserActivityService) CreateActivity(req CreateActivityRequest) (*model.UserActivity, error) {
	// 验证事件类型
	if !s.isValidEventType(req.EventType) {
		return nil, fmt.Errorf("invalid event type: %s", req.EventType)
	}

	// 验证目标类型
	if !s.isValidTargetType(req.TargetType) {
		return nil, fmt.Errorf("invalid target type: %s", req.TargetType)
	}

	// 设置默认可见性
	if req.Visibility == "" {
		req.Visibility = model.VisibilityPublic
	}

	// 序列化元数据
	metadataJSON, err := json.Marshal(req.Metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal metadata: %w", err)
	}

	activity := &model.UserActivity{
		UserID:     req.UserID,
		EventType:  req.EventType,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Title:      req.Title,
		Content:    req.Content,
		Metadata:   string(metadataJSON),
		Visibility: req.Visibility,
	}

	if err := s.db.Create(activity).Error; err != nil {
		return nil, fmt.Errorf("failed to create activity: %w", err)
	}

	// 预加载用户信息
	if err := s.db.Preload("User").First(activity, activity.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load activity with user: %w", err)
	}

	return activity, nil
}

// GetActivities 获取用户活动事件列表
func (s *UserActivityService) GetActivities(query GetActivitiesQuery) (*PaginatedActivitiesResponse, error) {
	// 设置默认分页参数
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 || query.PageSize > 100 {
		query.PageSize = 20
	}

	// 构建查询
	db := s.db.Model(&model.UserActivity{}).Preload("User")

	// 添加过滤条件
	if query.UserID != nil {
		db = db.Where("user_id = ?", *query.UserID)
	}
	if query.EventType != "" {
		db = db.Where("event_type = ?", query.EventType)
	}
	if query.TargetType != "" {
		db = db.Where("target_type = ?", query.TargetType)
	}
	if query.TargetID != nil {
		db = db.Where("target_id = ?", *query.TargetID)
	}
	if query.Visibility != "" {
		db = db.Where("visibility = ?", query.Visibility)
	}

	// 只查询未删除的记录
	db = db.Where("deleted_at IS NULL")

	// 获取总数
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count activities: %w", err)
	}

	// 分页查询
	var activities []model.UserActivity
	offset := (query.Page - 1) * query.PageSize
	
	if err := db.Order("created_at DESC").Offset(offset).Limit(query.PageSize).Find(&activities).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch activities: %w", err)
	}

	// 转换为响应格式
	activityResponses := make([]ActivityResponse, len(activities))
	for i, activity := range activities {
		activityResponses[i] = s.convertToActivityResponse(activity)
	}

	// 构建分页信息
	pagination := utils.Pagination{
		Page:       query.Page,
		PageSize:   query.PageSize,
		Total:      total,
		TotalPages: (int(total) + query.PageSize - 1) / query.PageSize,
	}

	return &PaginatedActivitiesResponse{
		Activities: activityResponses,
		Pagination: pagination,
	}, nil
}

// GetUserActivities 获取指定用户的活动事件
func (s *UserActivityService) GetUserActivities(userID uint, query GetActivitiesQuery) (*PaginatedActivitiesResponse, error) {
	query.UserID = &userID
	return s.GetActivities(query)
}

// GetActivityByID 根据ID获取活动事件
func (s *UserActivityService) GetActivityByID(id uint) (*ActivityResponse, error) {
	var activity model.UserActivity
	if err := s.db.Preload("User").First(&activity, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("activity not found")
		}
		return nil, fmt.Errorf("failed to fetch activity: %w", err)
	}

	response := s.convertToActivityResponse(activity)
	return &response, nil
}

// DeleteActivity 删除活动事件
func (s *UserActivityService) DeleteActivity(id uint, userID uint) error {
	var activity model.UserActivity
	if err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&activity).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("activity not found or access denied")
		}
		return fmt.Errorf("failed to fetch activity: %w", err)
	}

	if err := s.db.Delete(&activity).Error; err != nil {
		return fmt.Errorf("failed to delete activity: %w", err)
	}

	return nil
}

// convertToActivityResponse 转换为响应格式
func (s *UserActivityService) convertToActivityResponse(activity model.UserActivity) ActivityResponse {
	// 解析元数据
	var metadata map[string]interface{}
	if activity.Metadata != "" {
		json.Unmarshal([]byte(activity.Metadata), &metadata)
	}

	return ActivityResponse{
		ID:           activity.ID,
		UserID:       activity.UserID,
		User:         &activity.User,
		EventType:    activity.EventType,
		TargetType:   activity.TargetType,
		TargetID:     activity.TargetID,
		Title:        activity.Title,
		Content:      activity.Content,
		Metadata:     metadata,
		Visibility:   activity.Visibility,
		LikeCount:    activity.LikeCount,
		CommentCount: activity.CommentCount,
		CreatedAt:    activity.CreatedAt,
		UpdatedAt:    activity.UpdatedAt,
	}
}

// isValidEventType 验证事件类型
func (s *UserActivityService) isValidEventType(eventType string) bool {
	validTypes := map[string]bool{
		model.EventPaperAnalyzed:     true,
		model.EventPaperLiked:        true,
		model.EventPaperRecommended:  true,
		model.EventPaperShared:       true,
		model.EventAnalysisCreated:   true,
		model.EventAnalysisUpdated:   true,
		model.EventAnalysisCompleted: true,
		model.EventEvaluationCreated: true,
		model.EventEvaluationUpdated: true,
		model.EventEvaluationLiked:  true,
		model.EventCommentCreated:    true,
		model.EventCommentLiked:      true,
		model.EventCommentReplied:    true,
		model.EventBadgeEarned:       true,
		model.EventLevelUp:           true,
		model.EventFollowUser:        true,
		model.EventUnfollowUser:      true,
	}
	return validTypes[eventType]
}

// isValidTargetType 验证目标类型
func (s *UserActivityService) isValidTargetType(targetType string) bool {
	validTypes := map[string]bool{
		model.TargetPaper:      true,
		model.TargetAnalysis:   true,
		model.TargetEvaluation: true,
		model.TargetComment:    true,
		model.TargetUser:       true,
		model.TargetBadge:      true,
	}
	return validTypes[targetType]
}

// GetActivityStats 获取用户活动统计
func (s *UserActivityService) GetActivityStats(userID uint) (map[string]int, error) {
	stats := make(map[string]int)
	
	// 总活动数
	var total int64
	if err := s.db.Model(&model.UserActivity{}).Where("user_id = ? AND deleted_at IS NULL", userID).Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count total activities: %w", err)
	}
	stats["total"] = int(total)

	// 按事件类型统计
	var typeStats []struct {
		EventType string `json:"event_type"`
		Count     int    `json:"count"`
	}
	
	if err := s.db.Model(&model.UserActivity{}).
		Select("event_type, COUNT(*) as count").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Group("event_type").
		Find(&typeStats).Error; err != nil {
		return nil, fmt.Errorf("failed to count activities by type: %w", err)
	}

	for _, stat := range typeStats {
		stats[stat.EventType] = stat.Count
	}

	// 最近7天的活动数
	var recentCount int64
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	if err := s.db.Model(&model.UserActivity{}).
		Where("user_id = ? AND created_at >= ? AND deleted_at IS NULL", userID, sevenDaysAgo).
		Count(&recentCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count recent activities: %w", err)
	}
	stats["recent_7_days"] = int(recentCount)

	return stats, nil
}