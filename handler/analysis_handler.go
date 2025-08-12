package handler

import (
	"papergraph/service"
	"papergraph/utils"
	"strconv"

	"papergraph/config"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// StartAnalysisHandler 手动触发分析任务接口（演示用）
func StartAnalysisHandler(c *gin.Context) {
	taskIDStr := c.Query("task_id")
	config.Logger.Info("手动触发分析请求", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	if taskIDStr == "" {
		config.Logger.Warn("缺少task_id参数", zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		config.Logger.Warn("task_id参数错误", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	analysisService := service.NewAnalysisService()
	err = analysisService.StartAnalysisTask(uint(taskID))
	if err != nil {
		config.Logger.Error("分析任务处理失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, err.Error(), 400)
		return
	}
	config.Logger.Info("分析任务处理成功", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	utils.Success(c, gin.H{"message": "分析完成"})
}

// GetUserTasksHandler 获取当前用户历史分析任务列表
func GetUserTasksHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	config.Logger.Info("获取历史任务请求", zap.Any("user_id_val", userIDVal), zap.Bool("exists", exists), zap.String("client_ip", c.ClientIP()))
	if !exists {
		config.Logger.Warn("未登录获取历史任务", zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "未登录", 401)
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Error(c, "用户ID类型错误", 500)
		return
	}
	service := service.NewAnalysisService()
	tasks, err := service.GetUserAnalysisTasks(userID)
	if err != nil {
		config.Logger.Error("获取历史任务失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, err.Error(), 500)
		return
	}
	config.Logger.Info("获取历史任务成功", zap.Any("user_id_val", userIDVal), zap.String("client_ip", c.ClientIP()))
	utils.Success(c, tasks)
}

// GetTaskDetailHandler 获取单个任务详情
func GetTaskDetailHandler(c *gin.Context) {
	taskIDStr := c.Query("task_id")
	config.Logger.Info("获取任务详情请求", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	if taskIDStr == "" {
		config.Logger.Warn("缺少task_id参数", zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		config.Logger.Warn("task_id参数错误", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	service := service.NewAnalysisService()
	task, err := service.GetAnalysisTaskDetail(uint(taskID))
	if err != nil {
		config.Logger.Error("获取任务详情失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, err.Error(), 404)
		return
	}
	config.Logger.Info("获取任务详情成功", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	utils.Success(c, task)
}

// GetAnalysisResultHandler 获取分析结果
func GetAnalysisResultHandler(c *gin.Context) {
	taskIDStr := c.Query("task_id")
	config.Logger.Info("获取分析结果请求", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	if taskIDStr == "" {
		config.Logger.Warn("缺少task_id参数", zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		config.Logger.Warn("task_id参数错误", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	service := service.NewAnalysisService()
	result, err := service.GetAnalysisResult(uint(taskID))
	if err != nil {
		config.Logger.Error("获取分析结果失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, err.Error(), 404)
		return
	}
	config.Logger.Info("获取分析结果成功", zap.String("task_id_str", taskIDStr), zap.String("client_ip", c.ClientIP()))
	utils.Success(c, result)
}

// GetUserActiveTasksHandler 获取当前用户正在分析的任务列表（最多2个）
func GetUserActiveTasksHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Error(c, "未登录", 401)
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Error(c, "用户ID类型错误", 500)
		return
	}
	service := service.NewAnalysisService()
	tasks, err := service.GetUserActiveTasks(userID)
	if err != nil {
		utils.Error(c, err.Error(), 500)
		return
	}
	utils.Success(c, tasks)
}

// SetTaskPublicStatusHandler 切换任务公开/私有状态
func SetTaskPublicStatusHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Error(c, "未登录", 401)
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Error(c, "用户ID类型错误", 500)
		return
	}
	taskIDStr := c.PostForm("task_id")
	isPublicStr := c.PostForm("is_public")
	if taskIDStr == "" || isPublicStr == "" {
		utils.Error(c, "缺少参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	isPublic := isPublicStr == "1" || isPublicStr == "true"
	service := service.NewAnalysisService()
	err = service.SetTaskPublicStatus(userID, uint(taskID), isPublic)
	if err != nil {
		utils.Error(c, err.Error(), 400)
		return
	}
	utils.Success(c, gin.H{"message": "设置成功"})
}

// GetPublicFeedHandler 获取公开分析任务Feed
func GetPublicFeedHandler(c *gin.Context) {
	orderBy := c.Query("order_by") // 可选：like/suggest/默认时间
	service := service.NewAnalysisService()
	tasks, err := service.GetPublicFeed(orderBy)
	if err != nil {
		utils.Error(c, err.Error(), 500)
		return
	}
	utils.Success(c, tasks)
}

// LikeTaskHandler 点赞分析任务
func LikeTaskHandler(c *gin.Context) {
	taskIDStr := c.PostForm("task_id")
	if taskIDStr == "" {
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	service := service.NewAnalysisService()
	err = service.LikeTask(uint(taskID))
	if err != nil {
		utils.Error(c, err.Error(), 400)
		return
	}
	utils.Success(c, gin.H{"message": "点赞成功"})
}

// UnlikeTaskHandler 取消点赞分析任务
func UnlikeTaskHandler(c *gin.Context) {
	taskIDStr := c.PostForm("task_id")
	if taskIDStr == "" {
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	service := service.NewAnalysisService()
	err = service.UnlikeTask(uint(taskID))
	if err != nil {
		utils.Error(c, err.Error(), 400)
		return
	}
	utils.Success(c, gin.H{"message": "取消点赞成功"})
}
