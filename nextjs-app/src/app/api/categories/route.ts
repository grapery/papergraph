import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock categories data
    const categories = [
      {
        id: 'cs-ai',
        name: '人工智能',
        description: '机器学习、深度学习、自然语言处理等',
        icon: '🤖',
        color: '#3B82F6',
      },
      {
        id: 'cs-system',
        name: '计算机系统',
        description: '操作系统、分布式系统、计算机网络等',
        icon: '💻',
        color: '#10B981',
      },
      {
        id: 'bio-med',
        name: '生物医学',
        description: '生物信息学、医学影像、药物研发等',
        icon: '🧬',
        color: '#F59E0B',
      },
      {
        id: 'physics',
        name: '物理学',
        description: '量子物理、粒子物理、凝聚态物理等',
        icon: '⚛️',
        color: '#EF4444',
      },
      {
        id: 'chemistry',
        name: '化学',
        description: '有机化学、无机化学、物理化学等',
        icon: '🧪',
        color: '#8B5CF6',
      },
      {
        id: 'math',
        name: '数学',
        description: '纯数学、应用数学、统计学等',
        icon: '📐',
        color: '#06B6D4',
      },
      {
        id: 'economics',
        name: '经济学',
        description: '宏观经济、微观经济、金融学等',
        icon: '💰',
        color: '#F97316',
      },
      {
        id: 'env-science',
        name: '环境科学',
        description: '环境工程、生态学、气候变化等',
        icon: '🌍',
        color: '#84CC16',
      },
    ];

    return NextResponse.json({
      code: 0,
      message: '获取分类成功',
      data: categories
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取分类失败' },
      { status: 500 }
    );
  }
}