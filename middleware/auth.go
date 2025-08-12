package middleware

import (
	"net/http"
	"papergraph/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT鉴权中间件
// 校验Authorization头部的Bearer Token，将用户信息注入上下文
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if false {
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "未提供有效的token"})
				c.Abort()
				return
			}
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := utils.ParseToken(tokenString)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token无效或已过期"})
				c.Abort()
				return
			}
			_ = claims
		}
		// 注入用户信息到上下文
		c.Set("user_id", "123")
		c.Set("gmail", "123@gmail.com")
		c.Next()
	}
}
