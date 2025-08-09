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
		Host:     "localhost",
		Port:     3306,
		User:     "root",
		Password: "12345678",
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
	err = db.AutoMigrate(
		&model.User{},
		&model.Paper{},
		&model.AnalysisTask{},
		&model.AnalysisResult{},
		&model.Comment{},
		&model.Product{},
		&model.UserSubscription{},
		&model.PaymentRecord{},
		&model.BadgeTemplate{},
		&model.UserBadge{},
		&model.UserStats{},
		&model.UserActivity{},
		&model.UserFollow{},
		&model.TaskReaction{},
		// 评价相关模型
		&model.PaperEvaluation{},
		&model.EvaluationDimension{},
		&model.EvaluationMetric{},
		&model.EvaluationComment{},
		&model.EvaluationLike{},
	)
	if err != nil {
		panic("自动迁移失败: " + err.Error())
	}
	fmt.Println("数据库连接和自动迁移完成")

	// 初始化默认产品数据
	initializeProducts()

	// 初始化默认奖章模板数据
	initializeBadgeTemplates()
}

// initializeProducts 初始化默认产品数据
func initializeProducts() {
	// 检查是否已有产品数据
	var count int64
	DB.Model(&model.Product{}).Count(&count)

	if count == 0 {
		// 创建默认产品
		products := []model.Product{
			{
				Name:     "免费版",
				Price:    0,
				Duration: 1, // 1个月
			},
			{
				Name:     "专业版",
				Price:    29,
				Duration: 1, // 1个月
			},
			{
				Name:     "企业版",
				Price:    99,
				Duration: 1, // 1个月
			},
		}

		for _, product := range products {
			if err := DB.Create(&product).Error; err != nil {
				fmt.Printf("创建产品失败: %s\n", err.Error())
			} else {
				fmt.Printf("创建产品成功: %s\n", product.Name)
			}
		}
		fmt.Println("默认产品初始化完成")
	} else {
		fmt.Printf("已有 %d 个产品，跳过初始化\n", count)
	}
}

// initializeBadgeTemplates 初始化默认奖章模板数据
func initializeBadgeTemplates() {
	// 检查是否已有奖章模板数据
	var count int64
	DB.Model(&model.BadgeTemplate{}).Count(&count)

	if count == 0 {
		// 创建默认奖章模板
		badgeTemplates := []model.BadgeTemplate{
			// 分析类奖章
			{
				Type:        "first_analysis",
				Name:        "初次分析",
				Description: "完成第一篇论文分析",
				Icon:        "/badges/first_analysis.png",
				Condition:   "完成1篇论文分析",
				Level:       1,
				Category:    "analysis",
			},
			{
				Type:        "analysis_explorer",
				Name:        "分析探索者",
				Description: "完成10篇论文分析",
				Icon:        "/badges/analysis_explorer.png",
				Condition:   "完成10篇论文分析",
				Level:       2,
				Category:    "analysis",
			},
			{
				Type:        "analysis_master",
				Name:        "分析大师",
				Description: "完成50篇论文分析",
				Icon:        "/badges/analysis_master.png",
				Condition:   "完成50篇论文分析",
				Level:       3,
				Category:    "analysis",
			},
			{
				Type:        "analysis_legend",
				Name:        "分析传奇",
				Description: "完成100篇论文分析",
				Icon:        "/badges/analysis_legend.png",
				Condition:   "完成100篇论文分析",
				Level:       4,
				Category:    "analysis",
			},

			// 社交类奖章
			{
				Type:        "popular_analyst",
				Name:        "人气分析师",
				Description: "分析获得10个点赞",
				Icon:        "/badges/popular_analyst.png",
				Condition:   "获得10个点赞",
				Level:       2,
				Category:    "social",
			},
			{
				Type:        "superstar_analyst",
				Name:        "明星分析师",
				Description: "分析获得100个点赞",
				Icon:        "/badges/superstar_analyst.png",
				Condition:   "获得100个点赞",
				Level:       3,
				Category:    "social",
			},
			{
				Type:        "rising_star",
				Name:        "新星用户",
				Description: "获得10个粉丝",
				Icon:        "/badges/rising_star.png",
				Condition:   "获得10个粉丝",
				Level:       2,
				Category:    "social",
			},
			{
				Type:        "social_butterfly",
				Name:        "社交达人",
				Description: "关注20个用户",
				Icon:        "/badges/social_butterfly.png",
				Condition:   "关注20个用户",
				Level:       2,
				Category:    "social",
			},
			{
				Type:        "active_commentator",
				Name:        "活跃评论家",
				Description: "发表20条评论",
				Icon:        "/badges/active_commentator.png",
				Condition:   "发表20条评论",
				Level:       2,
				Category:    "social",
			},

			// 分享类奖章
			{
				Type:        "knowledge_sharer",
				Name:        "知识分享者",
				Description: "公开分享5篇论文分析",
				Icon:        "/badges/knowledge_sharer.png",
				Condition:   "公开分享5篇分析",
				Level:       2,
				Category:    "sharing",
			},
			{
				Type:        "generous_sharer",
				Name:        "慷慨分享者",
				Description: "分享5次分析结果",
				Icon:        "/badges/generous_sharer.png",
				Condition:   "分享5次分析",
				Level:       2,
				Category:    "sharing",
			},

			// 订阅类奖章
			{
				Type:        "premium_member",
				Name:        "高级会员",
				Description: "订阅专业版或企业版",
				Icon:        "/badges/premium_member.png",
				Condition:   "订阅付费版本",
				Level:       2,
				Category:    "subscription",
			},
			{
				Type:        "enterprise_user",
				Name:        "企业用户",
				Description: "订阅企业版",
				Icon:        "/badges/enterprise_user.png",
				Condition:   "订阅企业版",
				Level:       3,
				Category:    "subscription",
			},
		}

		for _, template := range badgeTemplates {
			if err := DB.Create(&template).Error; err != nil {
				fmt.Printf("创建奖章模板失败: %s\n", err.Error())
			} else {
				fmt.Printf("创建奖章模板成功: %s\n", template.Name)
			}
		}
		fmt.Println("默认奖章模板初始化完成")
	} else {
		fmt.Printf("已有 %d 个奖章模板，跳过初始化\n", count)
	}
}
