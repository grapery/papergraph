import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { code: 1, message: '未选择文件' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { code: 1, message: '仅支持PDF文件' },
        { status: 400 }
      );
    }

    // Mock upload response - in real implementation, this would:
    // 1. Save the file to storage
    // 2. Extract metadata from PDF
    // 3. Create database records
    // 4. Return paper and task info

    const mockPaper = {
      id: Math.floor(Math.random() * 1000) + 1,
      title: '示例论文标题',
      authors: ['作者一', '作者二', '作者三'],
      abstract: '这是一个示例论文摘要，用于演示文件上传功能...',
      category: 'cs-ai',
      subcategory: 'machine-learning',
      publishDate: new Date().toISOString().split('T')[0],
      fileSize: file.size,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      status: 'uploaded'
    };

    const mockTask = {
      id: Math.floor(Math.random() * 1000) + 1,
      paperId: mockPaper.id,
      status: 'pending',
      type: 'analysis',
      createdAt: new Date().toISOString(),
      estimatedTime: 300, // 5 minutes
      progress: 0
    };

    return NextResponse.json({
      code: 0,
      message: '文件上传成功',
      data: {
        paper: mockPaper,
        task: mockTask
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { code: 1, message: '文件上传失败' },
      { status: 500 }
    );
  }
}