package config

import (
	"fmt"
	"papergraph/model"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// DB 全局数据库连接
var DB *gorm.DB

// Logger 全局日志实例
var Logger *zap.Logger

// 免费试用次数配置
var FreeTrialCount int = 3 // 可根据需要调整

// MySQLConfig MySQL数据库配置
type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	Charset  string
}

// GoogleOAuthConfig Google OAuth相关配置
type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

// Init 初始化配置和数据库
func Init() {
	fmt.Println("配置初始化完成")

	// 初始化日志
	var err error
	Logger, err = zap.NewDevelopment()
	if err != nil {
		panic("日志初始化失败: " + err.Error())
	}
	Logger.Info("日志初始化完成")

	// MySQL配置（可根据实际情况修改）
	cfg := MySQLConfig{
		Host:     "127.0.0.1",
		Port:     3306,
		User:     "root",
		Password: "root",
		DBName:   "papergraph",
		Charset:  "utf8mb4",
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName, cfg.Charset)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("数据库连接失败: " + err.Error())
	}
	DB = db

	// 自动迁移所有模型
	err = db.AutoMigrate(&model.User{}, &model.Paper{}, &model.AnalysisTask{}, &model.AnalysisResult{}, &model.Comment{}, &model.Product{}, &model.UserSubscription{}, &model.PaymentRecord{})
	if err != nil {
		panic("自动迁移失败: " + err.Error())
	}
	fmt.Println("数据库连接和自动迁移完成")
}
