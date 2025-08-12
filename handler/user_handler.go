package handler

import (
	"context"
	"net/http"
	"os"
	"papergraph/config"
	"papergraph/service"
	"papergraph/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GoogleLoginHandler 跳转到Google登录
func GoogleLoginHandler(c *gin.Context) {
	// state可用于防CSRF，简单用时间戳
	state := c.Query("state")
	if state == "" {
		state = "state-" + c.ClientIP()
	}
	config.Logger.Info("Google登录请求", zap.String("state", state), zap.String("client_ip", c.ClientIP()))
	// 读取Google OAuth配置
	googleCfg := config.GoogleOAuthConfig{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
	}
	oauthService := service.NewGoogleOAuthService(googleCfg)
	url := oauthService.GetLoginURL(state)
	c.Redirect(http.StatusFound, url)
}

// GoogleCallbackHandler 处理Google回调
func GoogleCallbackHandler(c *gin.Context) {
	code := c.Query("code")
	config.Logger.Info("Google回调请求", zap.String("code", code), zap.String("client_ip", c.ClientIP()))
	if code == "" {
		config.Logger.Warn("Google回调缺少code参数", zap.String("client_ip", c.ClientIP()))
		// 重定向到前端错误页面
		c.Redirect(http.StatusFound, "/feed?error=missing_code")
		return
	}
	googleCfg := config.GoogleOAuthConfig{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
	}
	oauthService := service.NewGoogleOAuthService(googleCfg)
	user, err := oauthService.HandleCallback(context.Background(), code)
	if err != nil {
		config.Logger.Error("Google回调处理失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		// 重定向到前端错误页面
		c.Redirect(http.StatusFound, "/feed?error=auth_failed")
		return
	}
	token, err := utils.GenerateToken(user.ID, user.Gmail)
	if err != nil {
		config.Logger.Error("JWT生成失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		// 重定向到前端错误页面
		c.Redirect(http.StatusFound, "/feed?error=token_generation_failed")
		return
	}
	config.Logger.Info("Google登录成功", zap.Uint("user_id", user.ID), zap.String("gmail", user.Gmail), zap.String("client_ip", c.ClientIP()))

	// 重定向到前端页面，携带 token 和用户信息
	// 注意：这里简化处理，实际项目中可能需要更安全的 token 传递方式
	frontendURL := "/feed?token=" + token + "&login_success=true"
	c.Redirect(http.StatusFound, frontendURL)
}
