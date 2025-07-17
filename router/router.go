package router

import (
	"papergraph/handler"
	"papergraph/middleware"
	"papergraph/service"

	"github.com/gin-gonic/gin"
)

// InitRouter 初始化路由，支持注入订阅服务
func InitRouter(subSvc *service.SubscriptionService) *gin.Engine {
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

	// 2. SPA fallback：所有未命中后端API的路由都返回index.html，由VUE前端路由处理
	r.NoRoute(func(c *gin.Context) {
		c.File("./app/static/index.html")
	})

	return r
}
