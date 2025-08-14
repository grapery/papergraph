import { NextRequest, NextResponse } from 'next/server';
import { urlDownloader } from '@/lib/urlDownloader';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { code: 1, message: '请提供论文URL' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { code: 1, message: '无效的URL格式' },
        { status: 400 }
      );
    }

    // Process URL upload (download + upload to OSS)
    const result = await urlDownloader.processUrlUpload(url);

    if (!result.success) {
      return NextResponse.json(
        { 
          code: 1, 
          message: result.error || 'URL处理失败',
          details: result.validation 
        },
        { status: 400 }
      );
    }

    // Extract metadata (mock implementation)
    const paperMetadata = await extractPaperMetadataFromUrl(url, result.ossUrl!);

    // Create paper record (mock implementation)
    const paper = await createPaperRecord(paperMetadata);

    // Create analysis task (mock implementation)
    const task = await createAnalysisTask(paper.id);

    return NextResponse.json({
      code: 0,
      message: 'URL处理成功，论文已开始分析',
      data: {
        paper,
        task,
        source: 'url'
      }
    });

  } catch (error) {
    console.error('URL upload error:', error);
    return NextResponse.json(
      { 
        code: 1, 
        message: error instanceof Error ? error.message : 'URL处理失败'
      },
      { status: 500 }
    );
  }
}

// Endpoint to get file info from URL without downloading
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { code: 1, message: '请提供URL参数' },
        { status: 400 }
      );
    }

    const result = await urlDownloader.getFileInfo(url);

    if (!result.success) {
      return NextResponse.json(
        { 
          code: 1, 
          message: result.error || '获取文件信息失败'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '获取文件信息成功',
      data: result.info
    });

  } catch (error) {
    console.error('Get file info error:', error);
    return NextResponse.json(
      { 
        code: 1, 
        message: '获取文件信息失败'
      },
      { status: 500 }
    );
  }
}

// Helper functions (mock implementations)
async function extractPaperMetadataFromUrl(originalUrl: string, ossUrl: string) {
  // Extract filename from URL
  let fileName = 'imported_paper';
  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;
    const extractedFileName = pathname.split('/').pop();
    if (extractedFileName) {
      fileName = extractedFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
  } catch {
    // Use default filename if URL parsing fails
  }

  // Ensure file has extension
  if (!fileName.includes('.')) {
    fileName += '.pdf';
  }

  return {
    title: fileName.replace(/\.[^/.]+$/, ''),
    authors: ['待解析'],
    abstract: '正在解析论文内容...',
    category: 'cs-ai',
    subcategory: 'general',
    publishDate: new Date().toISOString().split('T')[0],
    fileName,
    sourceUrl: originalUrl,
    ossUrl,
    uploadDate: new Date().toISOString(),
    status: 'uploaded',
    sourceType: 'url'
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