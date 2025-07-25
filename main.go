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

	// 初始化订阅服务
	subSvc := service.NewSubscriptionService(config.DB)

	// 初始化路由
	r := router.InitRouter(subSvc)

	// 启动服务
	r.Run(":8080") // 默认8080端口
}
