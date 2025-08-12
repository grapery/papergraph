package handler

import (
	"io/ioutil"
	"papergraph/service"
	"papergraph/utils"
	"strconv"

	"papergraph/config"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UploadPaperHandler 论文上传接口
// 需登录，支持多部分表单上传PDF
func UploadPaperHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	config.Logger.Info("论文上传请求", zap.Any("user_id_val", userIDVal), zap.Bool("exists", exists), zap.String("client_ip", c.ClientIP()))
	if !exists {
		config.Logger.Warn("未登录上传论文", zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "未登录", 401)
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		// 兼容int类型
		if idInt, ok2 := userIDVal.(int); ok2 {
			userID = uint(idInt)
		} else if idInt64, ok3 := userIDVal.(int64); ok3 {
			userID = uint(idInt64)
		} else if idStr, ok4 := userIDVal.(string); ok4 {
			id, _ := strconv.Atoi(idStr)
			userID = uint(id)
		} else {
			utils.Error(c, "用户ID类型错误", 500)
			return
		}
	}
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		config.Logger.Warn("文件获取失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "文件获取失败", 400)
		return
	}
	defer file.Close()
	fileData, err := ioutil.ReadAll(file)
	if err != nil {
		config.Logger.Warn("文件读取失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, "文件读取失败", 400)
		return
	}
	fileSize := int64(len(fileData))
	paperService := service.NewPaperService()
	paper, task, err := paperService.UploadAndCreateTask(userID, header.Filename, fileData, fileSize)
	if err != nil {
		config.Logger.Error("上传与任务创建失败", zap.Error(err), zap.String("client_ip", c.ClientIP()))
		utils.Error(c, err.Error(), 400)
		return
	}
	config.Logger.Info("论文上传与任务创建成功", zap.Uint("user_id", userID), zap.Uint("paper_id", paper.ID), zap.Uint("task_id", task.ID), zap.String("client_ip", c.ClientIP()))
	utils.Success(c, gin.H{"paper": paper, "task": task})
}
