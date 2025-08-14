package handler

import (
	"net/http"
	"papergraph/model"
	"papergraph/service"
	"papergraph/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler 认证处理器
type AuthHandler struct {
	userService *service.UserService
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(userService *service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	Institution string `json:"institution"`
	Position    string `json:"position"`
	Field       string `json:"field"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// ForgotPasswordRequest 忘记密码请求
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest 重置密码请求
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// Register 用户注册
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求数据格式错误"})
		return
	}

	// 检查邮箱是否已存在
	existingUser, err := h.userService.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该邮箱已被注册"})
		return
	}

	// 检查Gmail是否已存在（如果用户同时提供了Gmail）
	if req.Email != "" {
		existingGmailUser, err := h.userService.GetUserByGmail(req.Email)
		if err == nil && existingGmailUser != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "该邮箱已被Gmail账号注册"})
			return
		}
	}

	// 哈希密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	// 创建用户
	user := &model.User{
		Email:        req.Email,
		Password:     string(hashedPassword),
		Name:         req.Name,
		Institution:  req.Institution,
		Position:     req.Position,
		Field:        req.Field,
		AuthProvider: "email",
		Avatar:       "https://api.dicebear.com/7.x/miniavs/svg?seed=" + req.Email,
	}

	if err := h.userService.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "用户创建失败"})
		return
	}

	// 生成JWT令牌
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "令牌生成失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "注册成功",
		"data": gin.H{
			"user": gin.H{
				"id":          user.ID,
				"name":        user.Name,
				"email":       user.Email,
				"institution": user.Institution,
				"position":    user.Position,
				"field":       user.Field,
				"avatar":      user.Avatar,
				"created_at":  user.CreatedAt,
				"updated_at":  user.UpdatedAt,
			},
			"token": token,
		},
	})
}

// Login 用户登录
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求数据格式错误"})
		return
	}

	// 查找用户（通过邮箱）
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "邮箱或密码错误"})
		return
	}

	// 检查认证方式
	if user.AuthProvider != "email" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "请使用" + user.AuthProvider + "方式登录"})
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "邮箱或密码错误"})
		return
	}

	// 更新最后登录时间
	h.userService.UpdateLastLogin(user.ID)

	// 生成JWT令牌
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "令牌生成失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"data": gin.H{
			"user": gin.H{
				"id":          user.ID,
				"name":        user.Name,
				"email":       user.Email,
				"institution": user.Institution,
				"position":    user.Position,
				"field":       user.Field,
				"avatar":      user.Avatar,
				"created_at":  user.CreatedAt,
				"updated_at":  user.UpdatedAt,
			},
			"token": token,
		},
	})
}

// ForgotPassword 忘记密码
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求数据格式错误"})
		return
	}

	// 查找用户
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		// 安全考虑：不透露用户是否存在
		c.JSON(http.StatusOK, gin.H{
			"message": "如果该邮箱地址存在，您将收到重置密码的邮件",
		})
		return
	}

	// 检查认证方式
	if user.AuthProvider != "email" {
		c.JSON(http.StatusOK, gin.H{
			"message": "请使用" + user.AuthProvider + "方式重置密码",
		})
		return
	}

	// 生成重置令牌
	token, err := utils.GeneratePasswordResetToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "重置令牌生成失败"})
		return
	}

	// 保存重置令牌
	if err := h.userService.CreatePasswordResetToken(user.ID, token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "重置令牌保存失败"})
		return
	}

	// 在实际应用中，这里应该发送邮件
	// 现在只是记录到日志
	c.JSON(http.StatusOK, gin.H{
		"message": "如果该邮箱地址存在，您将收到重置密码的邮件",
		"debug": gin.H{
			"token": token,
			"reset_link": "http://localhost:3002/forgot-password?token=" + token,
		},
	})
}

// ResetPassword 重置密码
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求数据格式错误"})
		return
	}

	// 验证重置令牌
	claims, err := utils.ParsePasswordResetToken(req.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "重置令牌无效或已过期"})
		return
	}

	// 查找用户
	user, err := h.userService.GetUserByID(claims.UserID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 检查认证方式
	if user.AuthProvider != "email" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请使用" + user.AuthProvider + "方式重置密码"})
		return
	}

	// 验证重置令牌是否有效
	if !h.userService.IsValidPasswordResetToken(user.ID, req.Token) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "重置令牌无效或已过期"})
		return
	}

	// 哈希新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	// 更新密码
	if err := h.userService.UpdatePassword(user.ID, string(hashedPassword)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码更新失败"})
		return
	}

	// 标记重置令牌为已使用
	h.userService.MarkPasswordResetTokenAsUsed(req.Token)

	c.JSON(http.StatusOK, gin.H{
		"message": "密码重置成功",
	})
}

// GetMe 获取当前用户信息
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未授权访问"})
		return
	}

	id, err := strconv.ParseUint(userID.(string), 10, 32)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的用户ID"})
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":          user.ID,
			"name":        user.Name,
			"email":       user.Email,
			"institution": user.Institution,
			"position":    user.Position,
			"field":       user.Field,
			"avatar":      user.Avatar,
			"created_at":  user.CreatedAt,
			"updated_at":  user.UpdatedAt,
			"last_login":  user.LastLogin,
			"auth_provider": user.AuthProvider,
		},
	})
}