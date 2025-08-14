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
	Email  string `json:"email"`
	Gmail  string `json:"gmail"`
	jwt.RegisteredClaims
}

// PasswordResetClaims 密码重置令牌声明
type PasswordResetClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Type   string `json:"type"` // "password_reset"
	jwt.RegisteredClaims
}

// GenerateToken 生成JWT
func GenerateToken(userID uint, email string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7天有效
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

// GeneratePasswordResetToken 生成密码重置令牌
func GeneratePasswordResetToken(userID uint, email string) (string, error) {
	claims := PasswordResetClaims{
		UserID: userID,
		Email:  email,
		Type:   "password_reset",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)), // 1小时有效
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

// ParsePasswordResetToken 解析密码重置令牌
func ParsePasswordResetToken(tokenString string) (*PasswordResetClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &PasswordResetClaims{}, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*PasswordResetClaims); ok && token.Valid {
		// 验证令牌类型
		if claims.Type != "password_reset" {
			return nil, jwt.NewValidationError("invalid token type", jwt.ValidationErrorClaimsInvalid)
		}
		return claims, nil
	}
	return nil, err
}
