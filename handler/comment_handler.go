package handler

import (
	"papergraph/service"
	"papergraph/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AddCommentHandler 添加评论或回复
func AddCommentHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		utils.Error(c, "未登录", 401)
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Error(c, "用户ID类型错误", 500)
		return
	}
	taskIDStr := c.PostForm("task_id")
	content := c.PostForm("content")
	parentIDStr := c.PostForm("parent_id")
	if taskIDStr == "" || content == "" {
		utils.Error(c, "缺少参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	var parentID *uint
	if parentIDStr != "" {
		pid, err := strconv.Atoi(parentIDStr)
		if err == nil {
			pidUint := uint(pid)
			parentID = &pidUint
		}
	}
	service := service.NewCommentService()
	comment, err := service.AddComment(userID, uint(taskID), content, parentID)
	if err != nil {
		utils.Error(c, err.Error(), 400)
		return
	}
	utils.Success(c, comment)
}

// GetCommentsHandler 获取评论列表
func GetCommentsHandler(c *gin.Context) {
	taskIDStr := c.Query("task_id")
	if taskIDStr == "" {
		utils.Error(c, "缺少task_id参数", 400)
		return
	}
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		utils.Error(c, "task_id参数错误", 400)
		return
	}
	service := service.NewCommentService()
	comments, err := service.GetComments(uint(taskID))
	if err != nil {
		utils.Error(c, err.Error(), 500)
		return
	}
	utils.Success(c, comments)
}
