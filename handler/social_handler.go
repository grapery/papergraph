package handler

import (
	"net/http"
	"papergraph/config"
	"papergraph/model"
	"papergraph/service"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SocialHandler struct {
	socialService *service.SocialService
	badgeService  *service.BadgeService
	db            *gorm.DB
}

func NewSocialHandler(socialService *service.SocialService, badgeService *service.BadgeService, db *gorm.DB) *SocialHandler {
	return &SocialHandler{
		socialService: socialService,
		badgeService:  badgeService,
		db:            db,
	}
}

// FollowUser 关注用户
func (h *SocialHandler) FollowUser(c *gin.Context) {
	userID := c.GetUint("user_id")
	followingIDStr := c.Param("user_id")

	followingID, err := strconv.ParseUint(followingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	err = h.socialService.FollowUser(userID, uint(followingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "关注失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "关注成功"})
}

// UnfollowUser 取消关注用户
func (h *SocialHandler) UnfollowUser(c *gin.Context) {
	userID := c.GetUint("user_id")
	followingIDStr := c.Param("user_id")

	followingID, err := strconv.ParseUint(followingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	err = h.socialService.UnfollowUser(userID, uint(followingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "取消关注失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "取消关注成功"})
}

// GetFollowing 获取关注列表
func (h *SocialHandler) GetFollowing(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetFollowing", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	following, err := h.socialService.GetFollowing(uint(targetUserID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取关注列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": following})
}

// GetFollowers 获取粉丝列表
func (h *SocialHandler) GetFollowers(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetFollowers", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	followers, err := h.socialService.GetFollowers(uint(targetUserID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取粉丝列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": followers})
}

// GetUserActivityFeed 获取用户活动Feed流
func (h *SocialHandler) GetUserActivityFeed(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetUserActivityFeed", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	activities, err := h.socialService.GetUserActivityFeed(uint(targetUserID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取活动Feed失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": activities})
}

// GetUserAnalysisFeed 获取用户分析Feed流
func (h *SocialHandler) GetUserAnalysisFeed(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetUserAnalysisFeed", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	limit := 20
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	analyses, err := h.socialService.GetUserAnalysisFeed(uint(targetUserID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取分析Feed失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": analyses})
}

// GetUserBadges 获取用户奖章
func (h *SocialHandler) GetUserBadges(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetUserBadges", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	badges, err := h.badgeService.GetUserBadges(uint(targetUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取奖章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": badges})
}

// GetUserStats 获取用户统计
func (h *SocialHandler) GetUserStats(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetUserIDStr := c.Param("user_id")
	config.Logger.Info("GetUserStats", zap.String("user_id", strconv.Itoa(int(userID))), zap.String("target_user_id", targetUserIDStr))
	targetUserID, err := strconv.ParseUint(targetUserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的用户ID"})
		return
	}

	stats, err := h.badgeService.GetUserStats(uint(targetUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "获取用户统计失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "data": stats})
}

// ReactToTask 对任务进行评价
func (h *SocialHandler) ReactToTask(c *gin.Context) {
	userID := c.GetUint("user_id")

	taskIDStr := c.PostForm("task_id")
	reactionType := c.PostForm("reaction_type")

	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的任务ID"})
		return
	}

	// 验证评价类型
	validReactions := map[string]bool{
		"like":     true,
		"agree":    true,
		"disagree": true,
		"biased":   true,
		"share":    true,
	}

	if !validReactions[reactionType] {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的评价类型"})
		return
	}

	// 检查是否已经评价过
	existing, err := h.socialService.GetUserReactionForTask(userID, uint(taskID), reactionType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "检查评价状态失败"})
		return
	}

	// 如果已经评价过，则取消评价
	if existing != nil {
		err = h.db.Delete(existing).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "取消评价失败"})
			return
		}

		// 记录取消评价活动
		content := "取消了对分析的评价"
		switch reactionType {
		case "like":
			content = "取消点赞了分析"
		case "agree":
			content = "取消认同了分析"
		case "disagree":
			content = "取消不认同了分析"
		case "biased":
			content = "取消标记分析有偏差"
		case "share":
			content = "取消分享了分析"
		}

		h.socialService.AddUserActivity(userID, "unreact", "task", uint(taskID), "取消评价", content)

		c.JSON(http.StatusOK, gin.H{"code": 0, "message": "取消评价成功"})
		return
	}

	// 添加新的评价
	reaction := model.TaskReaction{
		TaskID:       uint(taskID),
		UserID:       userID,
		ReactionType: reactionType,
		CreatedAt:    time.Now(),
	}

	err = h.db.Create(&reaction).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "评价失败"})
		return
	}

	// 记录评价活动
	content := "对分析进行了评价"
	switch reactionType {
	case "like":
		content = "点赞了分析"
	case "agree":
		content = "认同了分析"
	case "disagree":
		content = "不认同了分析"
	case "biased":
		content = "标记分析有偏差"
	case "share":
		content = "分享了分析"
	}

	h.socialService.AddUserActivity(userID, "react", "task", uint(taskID), "评价", content)

	// 更新用户统计
	updates := map[string]interface{}{}
	switch reactionType {
	case "like":
		updates["like_count"] = gorm.Expr("like_count + ?", 1)
	case "share":
		updates["share_count"] = gorm.Expr("share_count + ?", 1)
	}

	if len(updates) > 0 {
		h.badgeService.UpdateUserStats(userID, updates)
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "评价成功"})
}
