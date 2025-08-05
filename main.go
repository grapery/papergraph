package main

import (
	"papergraph/config"
	"papergraph/model"
	"papergraph/router"
	"papergraph/service"
)

func main() {
	// 初始化配置
	config.Init()
	defer config.Logger.Sync()

	// 自动迁移数据库模型
	err := config.DB.AutoMigrate(
		&model.User{},
		&model.Paper{},
		&model.AnalysisTask{},
		&model.AnalysisResult{},
		&model.Comment{},
		&model.Like{},
		&model.Follow{},
		&model.UserBadge{},
		&model.UserActivity{},
		&model.Product{},
		&model.PaymentRecord{},
		&model.UserSubscription{},
		&model.PaperEvaluation{},
		&model.EvaluationDimension{},
		&model.EvaluationMetric{},
		&model.EvaluationComment{},
		&model.EvaluationLike{},
	)
	if err != nil {
		config.Logger.Fatal("Failed to migrate database:", err)
	}

	// 初始化服务
	subSvc := service.NewSubscriptionService(config.DB)
	badgeSvc := service.NewBadgeService(config.DB)

	// 初始化路由
	r := router.InitRouter(subSvc, badgeSvc)

	// 启动服务
	r.Run(":8080") // 默认8080端口
}
