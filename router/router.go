package router

import (
	"papergraph/config"
	"papergraph/handler"
	"papergraph/middleware"
	"papergraph/service"

	"github.com/gin-gonic/gin"
)

// InitRouter 初始化路由，支持注入订阅服务和奖章服务
func InitRouter(subSvc *service.SubscriptionService, badgeSvc *service.BadgeService) *gin.Engine {
	r := gin.Default()

	// 1. VUE静态资源服务，服务前端构建产物（assets、favicon等）
	r.Static("/assets", "./app/static/assets")               // VUE构建产物的静态资源
	r.StaticFile("/favicon.ico", "./app/static/favicon.ico") // 网站图标

	// Google登录相关路由
	r.GET("/login/google", handler.GoogleLoginHandler)
	r.GET("/auth/google/callback", handler.GoogleCallbackHandler)

	// 受保护的API
	auth := r.Group("/api", middleware.AuthMiddleware())
	auth.GET("/me", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		gmail, _ := c.Get("gmail")
		c.JSON(200, gin.H{"user_id": userID, "gmail": gmail})
	})
	auth.POST("/upload", handler.UploadPaperHandler)
	auth.POST("/start_analysis", handler.StartAnalysisHandler)
	auth.GET("/tasks", handler.GetUserTasksHandler)
	auth.GET("/task_detail", handler.GetTaskDetailHandler)
	auth.GET("/analysis_result", handler.GetAnalysisResultHandler)
	auth.GET("/active_tasks", handler.GetUserActiveTasksHandler)
	auth.POST("/set_public", handler.SetTaskPublicStatusHandler)
	auth.POST("/like", handler.LikeTaskHandler)
	auth.POST("/unlike", handler.UnlikeTaskHandler)
	auth.POST("/comment", handler.AddCommentHandler)
	r.GET("/comments", handler.GetCommentsHandler)
	r.GET("/public_feed", handler.GetPublicFeedHandler)

	// 订阅相关接口
	subHandler := handler.NewSubscriptionHandler(subSvc)
	auth.GET("/subscription/products", subHandler.ListProducts)
	auth.POST("/subscription/buy", subHandler.BuySubscription)
	auth.GET("/subscription/free_trial_count", subHandler.GetFreeTrialCount)
	auth.POST("/subscription/decrement_trial", subHandler.DecrementFreeTrial)
	auth.GET("/subscription/payment_records", subHandler.ListPaymentRecords)
	auth.GET("/subscription/user_subscriptions", subHandler.ListUserSubscriptions)

	// 社交和奖章相关接口
	socialHandler := handler.NewSocialHandler(nil, badgeSvc, config.DB)
	auth.GET("/user/:user_id/badges", socialHandler.GetUserBadges)
	auth.GET("/user/:user_id/stats", socialHandler.GetUserStats)
	auth.POST("/task/react", socialHandler.ReactToTask)

	// 评价相关接口
	evalHandler := handler.NewEvaluationHandler(config.DB)
	auth.POST("/evaluations", evalHandler.CreateEvaluation)
	auth.GET("/evaluations/my", evalHandler.GetMyEvaluations)
	auth.PUT("/evaluations/:id", evalHandler.UpdateEvaluation)
	auth.DELETE("/evaluations/:id", evalHandler.DeleteEvaluation)
	auth.POST("/evaluations/:id/like", evalHandler.LikeEvaluation)
	
	// 公开评价接口（无需认证）
	r.GET("/evaluations/:id", evalHandler.GetEvaluation)
	r.GET("/papers/:paperId/evaluations", evalHandler.GetEvaluationsByPaper)
	r.GET("/papers/:paperId/evaluations/statistics", evalHandler.GetEvaluationStatistics)
	r.GET("/evaluations/top", evalHandler.GetTopEvaluations)
	r.GET("/evaluations/search", evalHandler.SearchEvaluations)

	// 2. SPA fallback：所有未命中后端API的路由都返回index.html，由VUE前端路由处理
	r.NoRoute(func(c *gin.Context) {
		c.File("./app/static/index.html")
	})

	return r
}
