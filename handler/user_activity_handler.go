package handler

import (
	"net/http"
	"strconv"

	"papergraph/middleware"
	"papergraph/service"

	"github.com/gin-gonic/gin"
)

// UserActivityHandler 用户活动事件处理器
type UserActivityHandler struct {
	activityService *service.UserActivityService
}

// NewUserActivityHandler 创建用户活动事件处理器
func NewUserActivityHandler(activityService *service.UserActivityService) *UserActivityHandler {
	return &UserActivityHandler{activityService: activityService}
}

// CreateActivity 创建用户活动事件
// POST /api/activities
func (h *UserActivityHandler) CreateActivity(c *gin.Context) {
	var req service.CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证用户权限（只能创建自己的活动事件）
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if uint(userID.(float64)) != req.UserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "can only create activities for yourself"})
		return
	}

	activity, err := h.activityService.CreateActivity(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Activity created successfully",
		"activity":  activity,
	})
}

// GetActivities 获取活动事件列表
// GET /api/activities
func (h *UserActivityHandler) GetActivities(c *gin.Context) {
	var query service.GetActivitiesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.activityService.GetActivities(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetUserActivities 获取指定用户的活动事件
// GET /api/users/:user_id/activities
func (h *UserActivityHandler) GetUserActivities(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var query service.GetActivitiesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.activityService.GetUserActivities(uint(userID), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetActivityByID 根据ID获取活动事件
// GET /api/activities/:id
func (h *UserActivityHandler) GetActivityByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid activity ID"})
		return
	}

	activity, err := h.activityService.GetActivityByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, activity)
}

// DeleteActivity 删除活动事件
// DELETE /api/activities/:id
func (h *UserActivityHandler) DeleteActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid activity ID"})
		return
	}

	// 获取当前用户ID
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.activityService.DeleteActivity(uint(id), uint(userID.(float64))); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Activity deleted successfully",
	})
}

// GetUserActivityStats 获取用户活动统计
// GET /api/users/:user_id/activities/stats
func (h *UserActivityHandler) GetUserActivityStats(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	stats, err := h.activityService.GetActivityStats(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetMyActivities 获取当前用户的活动事件
// GET /api/me/activities
func (h *UserActivityHandler) GetMyActivities(c *gin.Context) {
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var query service.GetActivitiesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.activityService.GetUserActivities(uint(userID.(float64)), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetFeed 获取活动事件流（支持多种过滤和排序）
// GET /api/feed
func (h *UserActivityHandler) GetFeed(c *gin.Context) {
	var query service.GetActivitiesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 默认只显示公开的活动事件
	if query.Visibility == "" {
		query.Visibility = "public"
	}

	response, err := h.activityService.GetActivities(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// RegisterRoutes 注册路由
func (h *UserActivityHandler) RegisterRoutes(r *gin.RouterGroup) {
	activities := r.Group("/activities")
	{
		activities.POST("", h.CreateActivity)
		activities.GET("", h.GetActivities)
		activities.GET("/feed", h.GetFeed)
		activities.GET("/:id", h.GetActivityByID)
		activities.DELETE("/:id", h.DeleteActivity)
	}

	users := r.Group("/users")
	{
		users.GET("/:user_id/activities", h.GetUserActivities)
		users.GET("/:user_id/activities/stats", h.GetUserActivityStats)
	}

	me := r.Group("/me")
	{
		me.GET("/activities", h.GetMyActivities)
	}
}