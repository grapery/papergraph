package utils

import (
	"crypto/rand"
	"encoding/hex"
	"math/big"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Response 通用响应结构体
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Success 返回成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// Error 返回错误响应
func Error(c *gin.Context, msg string, code int) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: msg,
	})
}

// FailWithMsg 失败响应，code=1
func FailWithMsg(c *gin.Context, msg string) {
	Error(c, msg, 1)
}

// OkWithData 成功响应，带数据
func OkWithData(c *gin.Context, data interface{}) {
	Success(c, data)
}

// OkWithMsg 成功响应，带自定义消息
func OkWithMsg(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: msg,
	})
}

// Now 返回当前时间
func Now() time.Time {
	return time.Now()
}

// Pagination 分页信息
type Pagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// GenerateRandomString 生成指定长度的随机字符串
func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		result[i] = charset[num.Int64()]
	}
	return string(result)
}

// GenerateRandomHex 生成指定长度的随机十六进制字符串
func GenerateRandomHex(length int) string {
	bytes := make([]byte, length/2)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
