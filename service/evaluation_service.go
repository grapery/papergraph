package service

import (
	"papergraph/model"
	"time"

	"gorm.io/gorm"
)

// EvaluationService 评价服务
type EvaluationService struct {
	db *gorm.DB
}

// NewEvaluationService 创建评价服务
func NewEvaluationService(db *gorm.DB) *EvaluationService {
	return &EvaluationService{db: db}
}

// CreateEvaluation 创建论文评价
func (s *EvaluationService) CreateEvaluation(evaluation *model.PaperEvaluation) error {
	return s.db.Create(evaluation).Error
}

// GetEvaluationByID 根据ID获取评价
func (s *EvaluationService) GetEvaluationByID(id uint) (*model.PaperEvaluation, error) {
	var evaluation model.PaperEvaluation
	err := s.db.Preload("Dimensions.Metrics").First(&evaluation, id).Error
	if err != nil {
		return nil, err
	}
	return &evaluation, nil
}

// GetEvaluationByAnalysisID 根据分析ID获取评价
func (s *EvaluationService) GetEvaluationByAnalysisID(analysisID uint) (*model.PaperEvaluation, error) {
	var evaluation model.PaperEvaluation
	err := s.db.Where("analysis_id = ?", analysisID).Preload("Dimensions.Metrics").First(&evaluation).Error
	if err != nil {
		return nil, err
	}
	return &evaluation, nil
}

// GetEvaluationsByPaperID 根据论文ID获取评价列表
func (s *EvaluationService) GetEvaluationsByPaperID(paperID uint, page, pageSize int) ([]model.PaperEvaluation, int64, error) {
	var evaluations []model.PaperEvaluation
	var total int64
	
	offset := (page - 1) * pageSize
	
	// 获取总数
	err := s.db.Model(&model.PaperEvaluation{}).Where("paper_id = ? AND is_public = ?", paperID, true).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	// 获取分页数据
	err = s.db.Where("paper_id = ? AND is_public = ?", paperID, true).
		Preload("Dimensions.Metrics").
		Preload("User").
		Order("overall_score DESC, created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&evaluations).Error
	
	return evaluations, total, err
}

// GetEvaluationsByUserID 根据用户ID获取评价列表
func (s *EvaluationService) GetEvaluationsByUserID(userID uint, page, pageSize int) ([]model.PaperEvaluation, int64, error) {
	var evaluations []model.PaperEvaluation
	var total int64
	
	offset := (page - 1) * pageSize
	
	// 获取总数
	err := s.db.Model(&model.PaperEvaluation{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	// 获取分页数据
	err = s.db.Where("user_id = ?", userID).
		Preload("Dimensions.Metrics").
		Preload("Paper").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&evaluations).Error
	
	return evaluations, total, err
}

// UpdateEvaluation 更新评价
func (s *EvaluationService) UpdateEvaluation(evaluation *model.PaperEvaluation) error {
	return s.db.Model(evaluation).Updates(map[string]interface{}{
		"overall_score":       evaluation.OverallScore,
		"summary":            evaluation.Summary,
		"recommendation":     evaluation.Recommendation,
		"originality_score":  evaluation.OriginalityScore,
		"depth_score":        evaluation.DepthScore,
		"logic_score":        evaluation.LogicScore,
		"evidence_score":     evaluation.EvidenceScore,
		"language_score":     evaluation.LanguageScore,
		"value_score":        evaluation.ValueScore,
		"content_score":      evaluation.ContentScore,
		"structure_score":    evaluation.StructureScore,
		"method_score":       evaluation.MethodScore,
		"is_public":          evaluation.IsPublic,
		"updated_at":         time.Now(),
	}).Error
}

// DeleteEvaluation 删除评价
func (s *EvaluationService) DeleteEvaluation(id uint) error {
	return s.db.Delete(&model.PaperEvaluation{}, id).Error
}

// CreateEvaluationDimension 创建评价维度
func (s *EvaluationService) CreateEvaluationDimension(dimension *model.EvaluationDimension) error {
	return s.db.Create(dimension).Error
}

// UpdateEvaluationDimension 更新评价维度
func (s *EvaluationService) UpdateEvaluationDimension(dimension *model.EvaluationDimension) error {
	return s.db.Model(dimension).Updates(map[string]interface{}{
		"score":       dimension.Score,
		"description": dimension.Description,
		"evidence":    dimension.Evidence,
		"updated_at":  time.Now(),
	}).Error
}

// CreateEvaluationMetric 创建评价指标
func (s *EvaluationService) CreateEvaluationMetric(metric *model.EvaluationMetric) error {
	return s.db.Create(metric).Error
}

// UpdateEvaluationMetric 更新评价指标
func (s *EvaluationService) UpdateEvaluationMetric(metric *model.EvaluationMetric) error {
	return s.db.Model(metric).Updates(map[string]interface{}{
		"score":       metric.Score,
		"description": metric.Description,
		"evidence":    metric.Evidence,
		"updated_at":  time.Now(),
	}).Error
}

// LikeEvaluation 点赞评价
func (s *EvaluationService) LikeEvaluation(evaluationID, userID uint) error {
	// 检查是否已经点赞
	var likeCount int64
	err := s.db.Model(&model.EvaluationLike{}).
		Where("evaluation_id = ? AND user_id = ?", evaluationID, userID).
		Count(&likeCount).Error
	if err != nil {
		return err
	}
	
	if likeCount > 0 {
		// 取消点赞
		err = s.db.Where("evaluation_id = ? AND user_id = ?", evaluationID, userID).
			Delete(&model.EvaluationLike{}).Error
		if err != nil {
			return err
		}
		// 减少点赞数
		return s.db.Model(&model.PaperEvaluation{}).
			Where("id = ?", evaluationID).
			Update("like_count", gorm.Expr("like_count - 1")).Error
	} else {
		// 添加点赞
		like := &model.EvaluationLike{
			EvaluationID: evaluationID,
			UserID:       userID,
			CreatedAt:    time.Now(),
		}
		err = s.db.Create(like).Error
		if err != nil {
			return err
		}
		// 增加点赞数
		return s.db.Model(&model.PaperEvaluation{}).
			Where("id = ?", evaluationID).
			Update("like_count", gorm.Expr("like_count + 1")).Error
	}
}

// GetEvaluationStatistics 获取评价统计信息
func (s *EvaluationService) GetEvaluationStatistics(paperID uint) (map[string]interface{}, error) {
	var stats map[string]interface{}
	
	// 获取总体统计
	var totalEvaluations int64
	var avgOverallScore float64
	var scoreDistribution map[int]int
	
	err := s.db.Model(&model.PaperEvaluation{}).
		Where("paper_id = ? AND is_public = ?", paperID, true).
		Count(&totalEvaluations).Error
	if err != nil {
		return nil, err
	}
	
	err = s.db.Model(&model.PaperEvaluation{}).
		Where("paper_id = ? AND is_public = ?", paperID, true).
		Select("AVG(overall_score)").Scan(&avgOverallScore).Error
	if err != nil {
		return nil, err
	}
	
	// 获取分数分布
	var distribution []struct {
		ScoreRange string
		Count      int64
	}
	
	err = s.db.Model(&model.PaperEvaluation{}).
		Where("paper_id = ? AND is_public = ?", paperID, true).
		Select(`
			CASE 
				WHEN overall_score >= 8 THEN 'excellent'
				WHEN overall_score >= 6 THEN 'good'
				WHEN overall_score >= 4 THEN 'average'
				ELSE 'poor'
			END as score_range,
			COUNT(*) as count
		`).Group("score_range").Scan(&distribution).Error
	
	if err != nil {
		return nil, err
	}
	
	scoreDistribution = make(map[int]int)
	for _, d := range distribution {
		switch d.ScoreRange {
		case "excellent":
			scoreDistribution[8] = int(d.Count)
		case "good":
			scoreDistribution[6] = int(d.Count)
		case "average":
			scoreDistribution[4] = int(d.Count)
		case "poor":
			scoreDistribution[0] = int(d.Count)
		}
	}
	
	stats = map[string]interface{}{
		"total_evaluations":    totalEvaluations,
		"avg_overall_score":    avgOverallScore,
		"score_distribution":   scoreDistribution,
	}
	
	return stats, nil
}

// GetTopEvaluations 获取高分评价
func (s *EvaluationService) GetTopEvaluations(limit int) ([]model.PaperEvaluation, error) {
	var evaluations []model.PaperEvaluation
	
	err := s.db.Where("is_public = ?", true).
		Preload("Dimensions.Metrics").
		Preload("User").
		Preload("Paper").
		Order("overall_score DESC, like_count DESC").
		Limit(limit).
		Find(&evaluations).Error
	
	return evaluations, err
}

// SearchEvaluations 搜索评价
func (s *EvaluationService) SearchEvaluations(query string, page, pageSize int) ([]model.PaperEvaluation, int64, error) {
	var evaluations []model.PaperEvaluation
	var total int64
	
	offset := (page - 1) * pageSize
	
	// 搜索标题、摘要、建议等字段
	searchCondition := `
		paper_evaluations.is_public = ? AND (
			paper_evaluations.summary LIKE ? OR
			paper_evaluations.recommendation LIKE ? OR
			papers.file_name LIKE ? OR
			evaluation_dimensions.description LIKE ? OR
			evaluation_dimensions.evidence LIKE ?
		)
	`
	
	searchPattern := "%" + query + "%"
	
	// 获取总数
	err := s.db.Model(&model.PaperEvaluation{}).
		Joins("LEFT JOIN papers ON papers.id = paper_evaluations.paper_id").
		Joins("LEFT JOIN evaluation_dimensions ON evaluation_dimensions.evaluation_id = paper_evaluations.id").
		Where(searchCondition, true, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	
	// 获取分页数据
	err = s.db.Model(&model.PaperEvaluation{}).
		Joins("LEFT JOIN papers ON papers.id = paper_evaluations.paper_id").
		Joins("LEFT JOIN evaluation_dimensions ON evaluation_dimensions.evaluation_id = paper_evaluations.id").
		Where(searchCondition, true, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern).
		Preload("Dimensions.Metrics").
		Preload("User").
		Preload("Paper").
		Group("paper_evaluations.id").
		Order("paper_evaluations.overall_score DESC, paper_evaluations.created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&evaluations).Error
	
	return evaluations, total, err
}