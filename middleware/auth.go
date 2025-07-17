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
		// 注入用户信息到上下文
		c.Set("user_id", claims.UserID)
		c.Set("gmail", claims.Gmail)
		c.Next()
	}
}
