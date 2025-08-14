import { NextRequest, NextResponse } from 'next/server';
import { ossUploader } from '@/lib/oss';
import { fileValidation } from '@/lib/oss';

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

    // Validate file type
    if (!fileValidation.isValidFileType(file)) {
      return NextResponse.json(
        { code: 1, message: '仅支持PDF和Markdown格式的文件' },
        { status: 400 }
      );
    }

    // Validate file size
    if (!fileValidation.isValidFileSize(file)) {
      return NextResponse.json(
        { code: 1, message: '文件大小不能超过50MB' },
        { status: 400 }
      );
    }

    // Upload to OSS
    let ossUrl: string;
    try {
      const uploadResult = await ossUploader.uploadFile(file);
      ossUrl = uploadResult.url;
    } catch (error) {
      console.error('OSS upload failed:', error);
      return NextResponse.json(
        { code: 1, message: '文件上传到存储服务失败' },
        { status: 500 }
      );
    }

    // Extract metadata from file (mock implementation)
    const paperMetadata = await extractPaperMetadata(file, ossUrl);

    // Create paper record (mock implementation)
    const paper = await createPaperRecord(paperMetadata);

    // Create analysis task (mock implementation)
    const task = await createAnalysisTask(paper.id);

    return NextResponse.json({
      code: 0,
      message: '文件上传成功',
      data: {
        paper,
        task
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { code: 1, message: '文件上传失败' },
      { status: 500 }
    );
  }
}

// Helper functions (mock implementations)
async function extractPaperMetadata(file: File, ossUrl: string) {
  // In real implementation, this would:
  // 1. Extract text from PDF/Markdown
  // 2. Parse metadata (title, authors, abstract, etc.)
  // 3. Categorize the paper
  
  return {
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    authors: ['待解析'],
    abstract: '正在解析论文内容...',
    category: 'cs-ai',
    subcategory: 'general',
    publishDate: new Date().toISOString().split('T')[0],
    fileSize: file.size,
    fileName: file.name,
    fileType: file.type,
    ossUrl,
    uploadDate: new Date().toISOString(),
    status: 'uploaded'
  };
}

async function createPaperRecord(metadata: any) {
  // Mock paper creation - in real implementation, save to database
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    ...metadata
  };
}

async function createAnalysisTask(paperId: number) {
  // Mock task creation - in real implementation, save to database and queue analysis
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    paperId,
    status: 'pending',
    type: 'analysis',
    createdAt: new Date().toISOString(),
    estimatedTime: 300, // 5 minutes in seconds
    progress: 0
  };
}