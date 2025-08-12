package handler

import (
	"strconv"
	"papergraph/model"
	"papergraph/service"
	"papergraph/utils"
	
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// EvaluationHandler 评价处理器
type EvaluationHandler struct {
	evaluationService *service.EvaluationService
}

// NewEvaluationHandler 创建评价处理器
func NewEvaluationHandler(db *gorm.DB) *EvaluationHandler {
	return &EvaluationHandler{
		evaluationService: service.NewEvaluationService(db),
	}
}

// CreateEvaluation 创建评价
// @Summary 创建评价
// @Description 创建新的论文评价
// @Tags evaluation
// @Accept json
// @Produce json
// @Param evaluation body model.PaperEvaluation true "评价数据"
// @Success 201 {object} model.PaperEvaluation
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations [post]
func (h *EvaluationHandler) CreateEvaluation(c *gin.Context) {
	var evaluation model.PaperEvaluation
	if err := c.ShouldBindJSON(&evaluation); err != nil {
		utils.FailWithMsg(c, "Invalid request data")
		return
	}
	
	// 验证用户权限
	userID := c.GetUint("user_id")
	if userID == 0 {
		utils.FailWithMsg(c, "Unauthorized")
		return
	}
	
	evaluation.UserID = userID
	
	// 创建评价
	if err := h.evaluationService.CreateEvaluation(&evaluation); err != nil {
		utils.FailWithMsg(c, "Failed to create evaluation")
		return
	}
	
	utils.OkWithData(c, evaluation)
}

// GetEvaluation 获取评价详情
// @Summary 获取评价详情
// @Description 根据ID获取评价的详细信息
// @Tags evaluation
// @Produce json
// @Param id path int true "评价ID"
// @Success 200 {object} model.PaperEvaluation
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id} [get]
func (h *EvaluationHandler) GetEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid evaluation ID")
		return
	}
	
	evaluation, err := h.evaluationService.GetEvaluationByID(uint(id))
	if err != nil {
		utils.FailWithMsg(c, "Evaluation not found")
		return
	}
	
	utils.OkWithData(c, evaluation)
}

// GetEvaluationsByPaper 获取论文的评价列表
// @Summary 获取论文的评价列表
// @Description 获取指定论文的所有公开评价
// @Tags evaluation
// @Produce json
// @Param paperId path int true "论文ID"
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页大小" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/papers/{paperId}/evaluations [get]
func (h *EvaluationHandler) GetEvaluationsByPaper(c *gin.Context) {
	paperIdStr := c.Param("paperId")
	paperId, err := strconv.ParseUint(paperIdStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid paper ID")
		return
	}
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	
	evaluations, total, err := h.evaluationService.GetEvaluationsByPaperID(uint(paperId), page, pageSize)
	if err != nil {
		utils.FailWithMsg(c, "Failed to get evaluations")
		return
	}
	
	utils.OkWithData(c, gin.H{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
	})
}

// GetMyEvaluations 获取我的评价列表
// @Summary 获取我的评价列表
// @Description 获取当前用户创建的所有评价
// @Tags evaluation
// @Produce json
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页大小" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/my [get]
func (h *EvaluationHandler) GetMyEvaluations(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		utils.FailWithMsg(c, "Unauthorized")
		return
	}
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	
	evaluations, total, err := h.evaluationService.GetEvaluationsByUserID(userID, page, pageSize)
	if err != nil {
		utils.FailWithMsg(c, "Failed to get evaluations")
		return
	}
	
	utils.OkWithData(c, gin.H{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
	})
}

// UpdateEvaluation 更新评价
// @Summary 更新评价
// @Description 更新指定的评价信息
// @Tags evaluation
// @Accept json
// @Produce json
// @Param id path int true "评价ID"
// @Param evaluation body model.PaperEvaluation true "评价数据"
// @Success 200 {object} model.PaperEvaluation
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id} [put]
func (h *EvaluationHandler) UpdateEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid evaluation ID")
		return
	}
	
	var evaluation model.PaperEvaluation
	if err := c.ShouldBindJSON(&evaluation); err != nil {
		utils.FailWithMsg(c, "Invalid request data")
		return
	}
	
	// 验证用户权限
	userID := c.GetUint("user_id")
	if userID == 0 {
		utils.FailWithMsg(c, "Unauthorized")
		return
	}
	
	evaluation.ID = uint(id)
	evaluation.UserID = userID
	
	if err := h.evaluationService.UpdateEvaluation(&evaluation); err != nil {
		utils.FailWithMsg(c, "Failed to update evaluation")
		return
	}
	
	utils.OkWithData(c, evaluation)
}

// DeleteEvaluation 删除评价
// @Summary 删除评价
// @Description 删除指定的评价
// @Tags evaluation
// @Produce json
// @Param id path int true "评价ID"
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id} [delete]
func (h *EvaluationHandler) DeleteEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid evaluation ID")
		return
	}
	
	// 验证用户权限
	userID := c.GetUint("user_id")
	if userID == 0 {
		utils.FailWithMsg(c, "Unauthorized")
		return
	}
	
	if err := h.evaluationService.DeleteEvaluation(uint(id)); err != nil {
		utils.FailWithMsg(c, "Failed to delete evaluation")
		return
	}
	
	utils.OkWithMsg(c, "Evaluation deleted successfully")
}

// LikeEvaluation 点赞评价
// @Summary 点赞评价
// @Description 为指定评价点赞
// @Tags evaluation
// @Produce json
// @Param id path int true "评价ID"
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id}/like [post]
func (h *EvaluationHandler) LikeEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid evaluation ID")
		return
	}
	
	// 验证用户权限
	userID := c.GetUint("user_id")
	if userID == 0 {
		utils.FailWithMsg(c, "Unauthorized")
		return
	}
	
	if err := h.evaluationService.LikeEvaluation(uint(id), userID); err != nil {
		utils.FailWithMsg(c, "Failed to like evaluation")
		return
	}
	
	utils.OkWithMsg(c, "Evaluation liked successfully")
}

// GetEvaluationStatistics 获取评价统计
// @Summary 获取评价统计
// @Description 获取指定论文的评价统计数据
// @Tags evaluation
// @Produce json
// @Param paperId path int true "论文ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/papers/{paperId}/evaluations/statistics [get]
func (h *EvaluationHandler) GetEvaluationStatistics(c *gin.Context) {
	paperIdStr := c.Param("paperId")
	paperId, err := strconv.ParseUint(paperIdStr, 10, 32)
	if err != nil {
		utils.FailWithMsg(c, "Invalid paper ID")
		return
	}
	
	stats, err := h.evaluationService.GetEvaluationStatistics(uint(paperId))
	if err != nil {
		utils.FailWithMsg(c, "Failed to get evaluation statistics")
		return
	}
	
	utils.OkWithData(c, stats)
}

// GetTopEvaluations 获取高分评价
// @Summary 获取高分评价
// @Description 获取评分最高的评价列表
// @Tags evaluation
// @Produce json
// @Param limit query int false "返回数量限制" default(10)
// @Success 200 {object} []model.PaperEvaluation
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/top [get]
func (h *EvaluationHandler) GetTopEvaluations(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}
	
	evaluations, err := h.evaluationService.GetTopEvaluations(limit)
	if err != nil {
		utils.FailWithMsg(c, "Failed to get top evaluations")
		return
	}
	
	utils.OkWithData(c, evaluations)
}

// SearchEvaluations 搜索评价
// @Summary 搜索评价
// @Description 根据关键词搜索评价内容
// @Tags evaluation
// @Produce json
// @Param q query string true "搜索关键词"
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页大小" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/search [get]
func (h *EvaluationHandler) SearchEvaluations(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.FailWithMsg(c, "Search query is required")
		return
	}
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	
	evaluations, total, err := h.evaluationService.SearchEvaluations(query, page, pageSize)
	if err != nil {
		utils.FailWithMsg(c, "Failed to search evaluations")
		return
	}
	
	utils.OkWithData(c, gin.H{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
		"query":       query,
	})
}