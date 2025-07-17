package service

import (
	"context"
	"papergraph/config"
	"papergraph/model"
	"time"

	"go.uber.org/zap"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	oauth2api "google.golang.org/api/oauth2/v2"
	"gorm.io/gorm"
)

// GoogleOAuthService 封装Google OAuth登录相关逻辑
type GoogleOAuthService struct {
	OAuthConfig *oauth2.Config
}

// NewGoogleOAuthService 创建GoogleOAuthService实例
func NewGoogleOAuthService(cfg config.GoogleOAuthConfig) *GoogleOAuthService {
	return &GoogleOAuthService{
		OAuthConfig: &oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

// GetLoginURL 获取Google登录跳转URL
func (s *GoogleOAuthService) GetLoginURL(state string) string {
	url := s.OAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	config.Logger.Info("生成Google登录URL", zap.String("url", url), zap.String("state", state))
	return url
}

// HandleCallback 处理Google回调，获取用户信息并自动注册/登录
func (s *GoogleOAuthService) HandleCallback(ctx context.Context, code string) (*model.User, error) {
	config.Logger.Info("处理Google回调", zap.String("code", code))
	token, err := s.OAuthConfig.Exchange(ctx, code)
	if err != nil {
		config.Logger.Error("OAuth换取token失败", zap.Error(err))
		return nil, err
	}
	oauth2Service, err := oauth2api.New(s.OAuthConfig.Client(ctx, token))
	if err != nil {
		config.Logger.Error("创建oauth2Service失败", zap.Error(err))
		return nil, err
	}
	userinfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		config.Logger.Error("获取用户信息失败", zap.Error(err))
		return nil, err
	}
	config.Logger.Info("获取到Google用户信息", zap.String("email", userinfo.Email), zap.String("name", userinfo.Name))
	// 查找或创建用户
	var user model.User
	db := config.DB
	err = db.Where("gmail = ?", userinfo.Email).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		config.Logger.Info("新用户注册", zap.String("gmail", userinfo.Email))
		// 新用户，自动注册
		user = model.User{
			Gmail:     userinfo.Email,
			Name:      userinfo.Name,
			Avatar:    userinfo.Picture,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			LastLogin: time.Now(),
		}
		err = db.Create(&user).Error
		if err != nil {
			config.Logger.Error("新用户注册失败", zap.Error(err))
			return nil, err
		}
	} else if err == nil {
		config.Logger.Info("已有用户登录", zap.String("gmail", user.Gmail))
		// 已有用户，更新登录时间
		user.LastLogin = time.Now()
		user.UpdatedAt = time.Now()
		db.Save(&user)
	} else {
		config.Logger.Error("查找用户失败", zap.Error(err))
		return nil, err
	}
	return &user, nil
}
