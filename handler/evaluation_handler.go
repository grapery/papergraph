package handler

import (
	"net/http"
	"strconv"
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
// @Summary 创建论文评价
// @Description 创建一个新的论文多维度评价
// @Tags evaluation
// @Accept json
// @Produce json
// @Param evaluation body model.PaperEvaluation true "评价数据"
// @Success 201 {object} model.PaperEvaluation
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations [post]
func (h *EvaluationHandler) CreateEvaluation(c *gin.Context) {
	var evaluation model.PaperEvaluation
	if err := c.ShouldBindJSON(&evaluation); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request data", err))
		return
	}
	
	// 验证用户权限
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", nil))
		return
	}
	
	evaluation.UserID = userID
	
	// 创建评价
	if err := h.evaluationService.CreateEvaluation(&evaluation); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to create evaluation", err))
		return
	}
	
	c.JSON(http.StatusCreated, utils.SuccessResponse(evaluation))
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
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid evaluation ID", err))
		return
	}
	
	evaluation, err := h.evaluationService.GetEvaluationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("Evaluation not found", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(evaluation))
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
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid paper ID", err))
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to get evaluations", err))
		return
	}
	
	response := map[string]interface{}{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"pageSize":    pageSize,
		"totalPages":  (total + int64(pageSize) - 1) / int64(pageSize),
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}

// GetMyEvaluations 获取我的评价列表
// @Summary 获取我的评价列表
// @Description 获取当前用户创建的所有评价
// @Tags evaluation
// @Produce json
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页大小" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/my [get]
func (h *EvaluationHandler) GetMyEvaluations(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", nil))
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to get evaluations", err))
		return
	}
	
	response := map[string]interface{}{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"pageSize":    pageSize,
		"totalPages":  (total + int64(pageSize) - 1) / int64(pageSize),
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}

// UpdateEvaluation 更新评价
// @Summary 更新评价
// @Description 更新指定的评价信息
// @Tags evaluation
// @Accept json
// @Produce json
// @Param id path int true "评价ID"
// @Param evaluation body model.PaperEvaluation true "更新数据"
// @Success 200 {object} model.PaperEvaluation
// @Failure 400 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id} [put]
func (h *EvaluationHandler) UpdateEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid evaluation ID", err))
		return
	}
	
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", nil))
		return
	}
	
	// 检查评价是否存在并验证权限
	existingEvaluation, err := h.evaluationService.GetEvaluationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("Evaluation not found", err))
		return
	}
	
	if existingEvaluation.UserID != userID {
		c.JSON(http.StatusForbidden, utils.ErrorResponse("You can only update your own evaluations", nil))
		return
	}
	
	var updateData model.PaperEvaluation
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request data", err))
		return
	}
	
	// 更新评价
	if err := h.evaluationService.UpdateEvaluation(&updateData); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to update evaluation", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(updateData))
}

// DeleteEvaluation 删除评价
// @Summary 删除评价
// @Description 删除指定的评价
// @Tags evaluation
// @Produce json
// @Param id path int true "评价ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id} [delete]
func (h *EvaluationHandler) DeleteEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid evaluation ID", err))
		return
	}
	
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", nil))
		return
	}
	
	// 检查评价是否存在并验证权限
	existingEvaluation, err := h.evaluationService.GetEvaluationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("Evaluation not found", err))
		return
	}
	
	if existingEvaluation.UserID != userID {
		c.JSON(http.StatusForbidden, utils.ErrorResponse("You can only delete your own evaluations", nil))
		return
	}
	
	// 删除评价
	if err := h.evaluationService.DeleteEvaluation(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to delete evaluation", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse("Evaluation deleted successfully"))
}

// LikeEvaluation 点赞评价
// @Summary 点赞评价
// @Description 对指定的评价进行点赞或取消点赞
// @Tags evaluation
// @Produce json
// @Param id path int true "评价ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/evaluations/{id}/like [post]
func (h *EvaluationHandler) LikeEvaluation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid evaluation ID", err))
		return
	}
	
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("Unauthorized", nil))
		return
	}
	
	// 点赞或取消点赞
	if err := h.evaluationService.LikeEvaluation(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to like evaluation", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse("Like operation successful"))
}

// GetEvaluationStatistics 获取评价统计
// @Summary 获取评价统计
// @Description 获取指定论文的评价统计信息
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
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid paper ID", err))
		return
	}
	
	stats, err := h.evaluationService.GetEvaluationStatistics(uint(paperId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to get evaluation statistics", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(stats))
}

// GetTopEvaluations 获取高分评价
// @Summary 获取高分评价
// @Description 获取评分最高的评价列表
// @Tags evaluation
// @Produce json
// @Param limit query int false "限制数量" default(10)
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to get top evaluations", err))
		return
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(evaluations))
}

// SearchEvaluations 搜索评价
// @Summary 搜索评价
// @Description 根据关键词搜索评价
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
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Search query is required", nil))
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("Failed to search evaluations", err))
		return
	}
	
	response := map[string]interface{}{
		"evaluations": evaluations,
		"total":       total,
		"page":        page,
		"pageSize":    pageSize,
		"totalPages":  (total + int64(pageSize) - 1) / int64(pageSize),
		"query":       query,
	}
	
	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}