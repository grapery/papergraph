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

// UserService 用户服务
type UserService struct {
	db *gorm.DB
}

// NewUserService 创建用户服务
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(user *model.User) error {
	return s.db.Create(user).Error
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	err := s.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail 根据邮箱获取用户
func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := s.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByGmail 根据Gmail获取用户
func (s *UserService) GetUserByGmail(gmail string) (*model.User, error) {
	var user model.User
	err := s.db.Where("gmail = ?", gmail).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateLastLogin 更新最后登录时间
func (s *UserService) UpdateLastLogin(userID uint) error {
	return s.db.Model(&model.User{}).Where("id = ?", userID).Update("last_login", time.Now()).Error
}

// UpdatePassword 更新密码
func (s *UserService) UpdatePassword(userID uint, hashedPassword string) error {
	return s.db.Model(&model.User{}).Where("id = ?", userID).Update("password", hashedPassword).Error
}

// CreatePasswordResetToken 创建密码重置令牌
func (s *UserService) CreatePasswordResetToken(userID uint, token string) error {
	resetToken := model.PasswordResetToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	return s.db.Create(&resetToken).Error
}

// IsValidPasswordResetToken 验证密码重置令牌是否有效
func (s *UserService) IsValidPasswordResetToken(userID uint, token string) bool {
	var resetToken model.PasswordResetToken
	err := s.db.Where("user_id = ? AND token = ? AND expires_at > ? AND used_at IS NULL", 
		userID, token, time.Now()).First(&resetToken).Error
	return err == nil
}

// MarkPasswordResetTokenAsUsed 标记密码重置令牌为已使用
func (s *UserService) MarkPasswordResetTokenAsUsed(token string) error {
	return s.db.Model(&model.PasswordResetToken{}).Where("token = ?", token).Update("used_at", time.Now()).Error
}

// DeleteExpiredResetTokens 删除过期的重置令牌
func (s *UserService) DeleteExpiredResetTokens() error {
	return s.db.Where("expires_at < ? OR used_at IS NOT NULL", time.Now()).Delete(&model.PasswordResetToken{}).Error
}
