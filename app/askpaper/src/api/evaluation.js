import axios from './axios'

// 评价相关API
export const evaluationApi = {
  // 创建评价
  createEvaluation: (data) => {
    return axios.post('/evaluations', data)
  },

  // 获取评价详情
  getEvaluation: (id) => {
    return axios.get(`/evaluations/${id}`)
  },

  // 获取论文的评价列表
  getPaperEvaluations: (paperId, page = 1, pageSize = 10) => {
    return axios.get(`/papers/${paperId}/evaluations`, {
      params: { page, pageSize }
    })
  },

  // 获取我的评价列表
  getMyEvaluations: (page = 1, pageSize = 10) => {
    return axios.get('/evaluations/my', {
      params: { page, pageSize }
    })
  },

  // 更新评价
  updateEvaluation: (id, data) => {
    return axios.put(`/evaluations/${id}`, data)
  },

  // 删除评价
  deleteEvaluation: (id) => {
    return axios.delete(`/evaluations/${id}`)
  },

  // 点赞评价
  likeEvaluation: (id) => {
    return axios.post(`/evaluations/${id}/like`)
  },

  // 获取评价统计
  getEvaluationStatistics: (paperId) => {
    return axios.get(`/papers/${paperId}/evaluations/statistics`)
  },

  // 获取高分评价
  getTopEvaluations: (limit = 10) => {
    return axios.get('/evaluations/top', {
      params: { limit }
    })
  },

  // 搜索评价
  searchEvaluations: (query, page = 1, pageSize = 10) => {
    return axios.get('/evaluations/search', {
      params: { q: query, page, pageSize }
    })
  }
}

// 评价数据格式化工具
export const evaluationUtils = {
  // 获取维度名称
  getDimensionName(key) {
    const names = {
      'originality': '原创性',
      'depth': '深度洞察',
      'logic': '逻辑严谨',
      'evidence': '证据支撑',
      'language': '语言表达',
      'value': '学术价值'
    }
    return names[key] || key
  },

  // 获取指标名称
  getMetricName(dimensionKey, metricKey) {
    const metricNames = {
      'originality': {
        'innovation': '创新点明确',
        'comparison': '文献对比'
      },
      'depth': {
        'analysis': '分析层次',
        'insight': '洞察力'
      },
      'logic': {
        'coherence': '逻辑连贯',
        'structure': '结构清晰'
      },
      'evidence': {
        'data': '数据支持',
        'citation': '文献支撑'
      },
      'language': {
        'clarity': '表达清晰',
        'accuracy': '用词准确'
      },
      'value': {
        'contribution': '学术贡献',
        'application': '应用价值'
      }
    }
    return metricNames[dimensionKey]?.[metricKey] || metricKey
  },

  // 获取分数描述
  getScoreDescription(score) {
    if (score >= 8.0) return '优秀'
    if (score >= 6.0) return '良好'
    if (score >= 4.0) return '一般'
    return '较差'
  },

  // 获取分数颜色
  getScoreColor(score) {
    if (score >= 8.0) return '#10b981'
    if (score >= 6.0) return '#f59e0b'
    if (score >= 4.0) return '#ef4444'
    return '#6b7280'
  },

  // 获取建议文本
  getRecommendation(score) {
    if (score >= 8.0) return '可以考虑投稿到高水平期刊，建议进一步完善细节'
    if (score >= 6.0) return '适合投稿到一般期刊，建议重点改进薄弱环节'
    if (score >= 4.0) return '需要大幅改进，建议补充数据和分析'
    return '建议重新构思论文框架和研究方法'
  },

  // 格式化评价数据
  formatEvaluationData(data) {
    if (!data) return null

    return {
      ...data,
      dimensions: data.dimensions?.map(dim => ({
        ...dim,
        name: this.getDimensionName(dim.dimension_key),
        metrics: dim.metrics?.map(metric => ({
          ...metric,
          name: this.getMetricName(dim.dimension_key, metric.metric_key)
        }))
      })) || []
    }
  },

  // 计算分类分数
  calculateCategoryScores(evaluation) {
    if (!evaluation) return {}

    return {
      content: ((evaluation.originality_score + evaluation.depth_score) / 2).toFixed(1),
      structure: evaluation.logic_score.toFixed(1),
      language: evaluation.language_score.toFixed(1),
      method: evaluation.evidence_score.toFixed(1),
      value: evaluation.value_score.toFixed(1)
    }
  },

  // 生成雷达图数据
  generateRadarChartData(evaluation) {
    if (!evaluation) return []

    return [
      {
        label: '原创性',
        score: evaluation.originality_score
      },
      {
        label: '深度洞察',
        score: evaluation.depth_score
      },
      {
        label: '逻辑严谨',
        score: evaluation.logic_score
      },
      {
        label: '证据支撑',
        score: evaluation.evidence_score
      },
      {
        label: '语言表达',
        score: evaluation.language_score
      },
      {
        label: '学术价值',
        score: evaluation.value_score
      }
    ]
  }
}