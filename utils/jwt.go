package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// JWTSecret 建议用更安全的方式存储
var JWTSecret = []byte("your_jwt_secret")

// Claims 自定义声明结构体
type Claims struct {
	UserID uint   `json:"user_id"`
	Gmail  string `json:"gmail"`
	jwt.RegisteredClaims
}

// GenerateToken 生成JWT
func GenerateToken(userID uint, gmail string) (string, error) {
	claims := Claims{
		UserID: userID,
		Gmail:  gmail,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7天有效
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

// ParseToken 解析JWT
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, err
}
