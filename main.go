package main

import (
	"papergraph/config"
	"papergraph/router"
	"papergraph/service"
)

func main() {
	// 初始化配置
	config.Init()
	defer config.Logger.Sync()

	// 初始化服务
	subSvc := service.NewSubscriptionService(config.DB)
	badgeSvc := service.NewBadgeService(config.DB)
	activitySvc := service.NewUserActivityService(config.DB)

	// 初始化路由
	r := router.InitRouter(subSvc, badgeSvc, activitySvc)

	// 启动服务
	r.Run(":8080") // 默认8080端口
}
