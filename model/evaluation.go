package model

import (
	"time"

	"gorm.io/gorm"
)

// PaperEvaluation 论文多维度评价模型
// 记录论文的详细评价数据，包含各个维度的量化评分
type PaperEvaluation struct {
	ID           uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	AnalysisID   uint           `gorm:"index" json:"analysis_id"`        // 分析结果ID
	UserID       uint           `gorm:"index" json:"user_id"`           // 评价用户ID
	PaperID      uint           `gorm:"index" json:"paper_id"`          // 论文ID
	
	// 总体评价
	OverallScore float64        `gorm:"type:decimal(5,2)" json:"overall_score"` // 总体评分 (0-10)
	Summary      string         `gorm:"type:text" json:"summary"`                // 总体评价摘要
	Recommendation string       `gorm:"type:text" json:"recommendation"`         // 改进建议
	
	// 各维度评分
	OriginalityScore    float64 `gorm:"type:decimal(5,2)" json:"originality_score"`    // 原创性评分
	DepthScore          float64 `gorm:"type:decimal(5,2)" json:"depth_score"`          // 深度洞察评分
	LogicScore          float64 `gorm:"type:decimal(5,2)" json:"logic_score"`          // 逻辑严谨评分
	EvidenceScore       float64 `gorm:"type:decimal(5,2)" json:"evidence_score"`       // 证据支撑评分
	LanguageScore       float64 `gorm:"type:decimal(5,2)" json:"language_score"`       // 语言表达评分
	ValueScore          float64 `gorm:"type:decimal(5,2)" json:"value_score"`          // 学术价值评分
	
	// 分类评分
	ContentScore        float64 `gorm:"type:decimal(5,2)" json:"content_score"`        // 内容质量评分
	StructureScore      float64 `gorm:"type:decimal(5,2)" json:"structure_score"`      // 结构逻辑评分
	MethodScore         float64 `gorm:"type:decimal(5,2)" json:"method_score"`         // 方法证据评分
	
	// 评价状态
	IsPublic     bool           `gorm:"default:false" json:"is_public"` // 是否公开
	IsVerified   bool           `gorm:"default:false" json:"is_verified"` // 是否已验证
	LikeCount    int            `gorm:"default:0" json:"like_count"`      // 点赞数
	CommentCount int            `gorm:"default:0" json:"comment_count"`   // 评论数
	
	CreatedAt    time.Time      `json:"created_at"`                        // 创建时间
	UpdatedAt    time.Time      `json:"updated_at"`                        // 更新时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                    // 软删除
}

// EvaluationDimension 评价维度详情模型
// 记录每个维度的详细评价和证据
type EvaluationDimension struct {
	ID           uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	EvaluationID uint           `gorm:"index" json:"evaluation_id"`      // 评价ID
	DimensionKey string         `gorm:"size:32" json:"dimension_key"`   // 维度标识符
	DimensionName string        `gorm:"size:64" json:"dimension_name"`  // 维度名称
	Score        float64        `gorm:"type:decimal(5,2)" json:"score"` // 维度评分
	Description  string         `gorm:"type:text" json:"description"`   // 维度描述
	Evidence     string         `gorm:"type:text" json:"evidence"`      // 支撑证据
	
	CreatedAt    time.Time      `json:"created_at"`                     // 创建时间
	UpdatedAt    time.Time      `json:"updated_at"`                     // 更新时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// EvaluationMetric 评价指标模型
// 记录每个维度的具体指标评分
type EvaluationMetric struct {
	ID            uint           `gorm:"primaryKey" json:"id"`            // 主键ID
	DimensionID   uint           `gorm:"index" json:"dimension_id"`      // 维度ID
	MetricKey     string         `gorm:"size:32" json:"metric_key"`      // 指标标识符
	MetricName    string         `gorm:"size:64" json:"metric_name"`     // 指标名称
	Score         float64        `gorm:"type:decimal(5,2)" json:"score"`  // 指标评分
	Description   string         `gorm:"type:text" json:"description"`  // 指标描述
	Evidence      string         `gorm:"type:text" json:"evidence"`     // 支撑证据
	
	CreatedAt     time.Time      `json:"created_at"`                      // 创建时间
	UpdatedAt     time.Time      `json:"updated_at"`                      // 更新时间
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`                  // 软删除
}

// EvaluationComment 评价评论模型
// 记录对评价的评论和反馈
type EvaluationComment struct {
	ID           uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	EvaluationID uint           `gorm:"index" json:"evaluation_id"`      // 评价ID
	UserID       uint           `gorm:"index" json:"user_id"`           // 评论用户ID
	Content      string         `gorm:"type:text" json:"content"`       // 评论内容
	LikeCount    int            `gorm:"default:0" json:"like_count"`    // 点赞数
	
	CreatedAt    time.Time      `json:"created_at"`                     // 创建时间
	UpdatedAt    time.Time      `json:"updated_at"`                     // 更新时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// EvaluationLike 评价点赞模型
// 记录用户对评价的点赞
type EvaluationLike struct {
	ID           uint           `gorm:"primaryKey" json:"id"`           // 主键ID
	EvaluationID uint           `gorm:"index" json:"evaluation_id"`      // 评价ID
	UserID       uint           `gorm:"index" json:"user_id"`           // 点赞用户ID
	
	CreatedAt    time.Time      `json:"created_at"`                     // 创建时间
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`                 // 软删除
}

// GetTableName 返回表名
func (PaperEvaluation) TableName() string {
	return "paper_evaluations"
}

func (EvaluationDimension) TableName() string {
	return "evaluation_dimensions"
}

func (EvaluationMetric) TableName() string {
	return "evaluation_metrics"
}

func (EvaluationComment) TableName() string {
	return "evaluation_comments"
}

func (EvaluationLike) TableName() string {
	return "evaluation_likes"
}

// GetDimensionKeyToName 返回维度标识符到名称的映射
func GetDimensionKeyToName() map[string]string {
	return map[string]string{
		"originality": "原创性",
		"depth":       "深度洞察",
		"logic":       "逻辑严谨",
		"evidence":    "证据支撑",
		"language":    "语言表达",
		"value":       "学术价值",
	}
}

// GetMetricKeyToName 返回指标标识符到名称的映射
func GetMetricKeyToName() map[string]map[string]string {
	return map[string]map[string]string{
		"originality": {
			"innovation": "创新点明确",
			"comparison": "文献对比",
		},
		"depth": {
			"analysis": "分析层次",
			"insight":  "洞察力",
		},
		"logic": {
			"coherence": "逻辑连贯",
			"structure": "结构清晰",
		},
		"evidence": {
			"data":     "数据支持",
			"citation": "文献支撑",
		},
		"language": {
			"clarity":  "表达清晰",
			"accuracy": "用词准确",
		},
		"value": {
			"contribution": "学术贡献",
			"application":  "应用价值",
		},
	}
}

// GetScoreDescription 返回分数描述
func GetScoreDescription(score float64) string {
	if score >= 8.0 {
		return "优秀"
	} else if score >= 6.0 {
		return "良好"
	} else if score >= 4.0 {
		return "一般"
	}
	return "较差"
}

// GetScoreColor 返回分数对应的颜色
func GetScoreColor(score float64) string {
	if score >= 8.0 {
		return "#10b981" // 绿色
	} else if score >= 6.0 {
		return "#f59e0b" // 橙色
	} else if score >= 4.0 {
		return "#ef4444" // 红色
	}
	return "#6b7280" // 灰色
}

// GetRecommendation 返回基于分数的建议
func GetRecommendation(score float64) string {
	if score >= 8.0 {
		return "可以考虑投稿到高水平期刊，建议进一步完善细节"
	} else if score >= 6.0 {
		return "适合投稿到一般期刊，建议重点改进薄弱环节"
	} else if score >= 4.0 {
		return "需要大幅改进，建议补充数据和分析"
	}
	return "建议重新构思论文框架和研究方法"
}