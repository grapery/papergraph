import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock analysis result - in real implementation, this would come from database
    const mockAnalysisResult = {
      taskId: parseInt(taskId),
      paperId: parseInt(taskId),
      overallScore: 8.3,
      rank: 5,
      percentile: 85,
      trend: 2.5,
      dimensions: {
        innovation: 8.5,
        methodology: 7.8,
        impact: 9.2,
        clarity: 8.0,
        reproducibility: 7.5,
        significance: 8.8,
        overall: 8.3
      },
      summary: '该论文在图像识别领域做出了重要贡献，提出的新架构显著提升了识别准确率。研究方法严谨，实验设计合理，结果具有较好的可复现性。论文在创新性和影响力方面表现突出，对相关领域的发展具有重要的推动作用。',
      keyFindings: [
        {
          id: '1',
          icon: '🎯',
          title: '创新性突出',
          description: '提出的新型深度学习架构在多个基准测试中表现优异，相比现有方法有显著提升。'
        },
        {
          id: '2',
          icon: '📊',
          title: '实验结果可靠',
          description: '通过大量的对比实验和消融研究，验证了所提方法的有效性和各组件的贡献。'
        },
        {
          id: '3',
          icon: '🚀',
          title: '应用前景广阔',
          description: '该方法在医疗影像、自动驾驶、安防监控等多个领域具有潜在的应用价值。'
        }
      ],
      strengths: [
        {
          id: '1',
          icon: '💡',
          title: '技术创新',
          score: 8.5,
          description: '提出的新型架构在理论上具有创新性，解决了现有方法的一些局限性。',
          evidence: [
            '提出了新的注意力机制',
            '设计了更高效的特征提取模块',
            '在多个数据集上验证了有效性'
          ]
        },
        {
          id: '2',
          icon: '📈',
          title: '实验充分',
          score: 8.2,
          description: '实验设计全面，包括对比实验、消融研究和鲁棒性测试。',
          evidence: [
            '在5个主流数据集上进行测试',
            '与8种现有方法进行对比',
            '详细的消融实验分析'
          ]
        }
      ],
      weaknesses: [
        {
          id: '1',
          icon: '⚠️',
          title: '计算复杂度',
          score: 6.8,
          description: '所提方法的计算复杂度较高，在实际应用中可能面临性能挑战。',
          suggestions: [
            '可以考虑模型压缩技术',
            '探索轻量化架构设计',
            '研究模型量化方法'
          ]
        },
        {
          id: '2',
          icon: '🔍',
          title: '理论分析不足',
          score: 7.2,
          description: '对方法的理论分析不够深入，缺乏收敛性保证。',
          suggestions: [
            '增加理论分析部分',
            '提供收敛性证明',
            '深入分析方法的数学性质'
          ]
        }
      ],
      recommendations: [
        {
          id: '1',
          priority: 'high',
          title: '优化计算效率',
          description: '建议研究模型的优化方法，降低计算复杂度，提高实际应用性能。',
          impact: '显著提升方法的实用性和应用范围'
        },
        {
          id: '2',
          priority: 'medium',
          title: '扩展应用场景',
          description: '建议将方法应用到更多领域，验证其通用性和适应性。',
          impact: '扩大方法的应用范围和影响力'
        },
        {
          id: '3',
          priority: 'low',
          title: '开源代码',
          description: '建议开源实现代码，促进学术交流和 reproducibility。',
          impact: '提升研究的透明度和影响力'
        }
      ],
      charts: {
        radar: {
          labels: ['创新性', '方法论', '影响力', '清晰度', '可复现性', '重要性'],
          data: [8.5, 7.8, 9.2, 8.0, 7.5, 8.8]
        },
        trend: {
          labels: ['1月前', '3周前', '2周前', '1周前', '现在'],
          data: [7.2, 7.5, 7.8, 8.1, 8.3]
        },
        distribution: {
          labels: ['优秀 (9-10)', '良好 (8-9)', '一般 (7-8)', '待改进 (6-7)', '较差 (<6)'],
          data: [15, 35, 30, 15, 5]
        }
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      code: 0,
      message: '获取分析结果成功',
      data: mockAnalysisResult
    });
  } catch (error) {
    console.error('获取分析结果失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取分析结果失败' },
      { status: 500 }
    );
  }
}