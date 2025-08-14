import { ossUploader, fileValidation } from './oss';

export interface DownloadResult {
  success: boolean;
  file?: File;
  error?: string;
  fileSize?: number;
  mimeType?: string;
  fileName?: string;
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    size: number;
    type: string;
    name: string;
    extension: string;
  };
}

class URLDownloader {
  /**
   * Download file from URL and validate format
   */
  async downloadAndValidate(url: string): Promise<DownloadResult> {
    try {
      // Validate URL format
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: '无效的URL格式'
        };
      }

      // Check if URL is accessible
      const headResponse = await this.checkUrlAccessibility(url);
      if (!headResponse.ok) {
        return {
          success: false,
          error: `无法访问URL: ${headResponse.status} ${headResponse.statusText}`
        };
      }

      // Get content type and size
      const contentType = headResponse.headers.get('content-type') || '';
      const contentLength = headResponse.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength) : 0;

      // Validate content type before downloading
      const validation = this.validateContentType(contentType, url);
      if (!validation.isValid) {
        return {
          success: false,
          error: `不支持的文件格式: ${validation.errors.join(', ')}`
        };
      }

      // Check file size before downloading
      if (fileSize > 50 * 1024 * 1024) {
        return {
          success: false,
          error: '文件大小超过50MB限制'
        };
      }

      // Download the file
      const downloadResponse = await fetch(url);
      if (!downloadResponse.ok) {
        return {
          success: false,
          error: `下载失败: ${downloadResponse.status} ${downloadResponse.statusText}`
        };
      }

      const blob = await downloadResponse.blob();
      const finalContentType = blob.type || contentType;
      const fileName = this.extractFileName(url, finalContentType);

      // Create file object
      const file = new File([blob], fileName, { type: finalContentType });

      // Final validation of the downloaded file
      const finalValidation = this.validateFile(file);
      if (!finalValidation.isValid) {
        return {
          success: false,
          error: `文件验证失败: ${finalValidation.errors.join(', ')}`
        };
      }

      return {
        success: true,
        file,
        fileSize: file.size,
        mimeType: file.type,
        fileName: file.name
      };

    } catch (error) {
      console.error('URL download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '下载过程中发生未知错误'
      };
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is accessible
   */
  private async checkUrlAccessibility(url: string): Promise<Response> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PapergraphBot/1.0)'
        }
      });
      return response;
    } catch (error) {
      throw new Error(`无法连接到URL: ${error}`);
    }
  }

  /**
   * Validate content type from headers
   */
  private validateContentType(contentType: string, url: string): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = [
      'application/pdf',
      'text/markdown', 
      'text/plain',
      'application/octet-stream'
    ];

    const isValid = validTypes.some(type => 
      contentType.toLowerCase().includes(type.split('/')[0])
    );

    if (!isValid) {
      errors.push(`不支持的内容类型: ${contentType}`);
    }

    // Check file extension from URL as fallback
    if (contentType === 'application/octet-stream' || !contentType) {
      const extension = this.getFileExtensionFromUrl(url);
      const validExtensions = ['.pdf', '.md'];
      
      if (!validExtensions.includes(extension)) {
        errors.push(`无法从URL确定支持的文件格式`);
      } else {
        warnings.push(`内容类型不明确，将根据文件扩展名${extension}处理`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract filename from URL
   */
  private extractFileName(url: string, contentType: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let fileName = pathname.split('/').pop() || 'downloaded_file';

      // Clean filename
      fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Ensure file has extension
      if (!fileName.includes('.')) {
        const extension = this.getExtensionFromContentType(contentType);
        fileName += extension;
      }

      return fileName;
    } catch {
      return 'downloaded_file.pdf';
    }
  }

  /**
   * Get file extension from URL
   */
  private getFileExtensionFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || '';
      const extension = fileName.split('.').pop();
      
      return extension ? `.${extension.toLowerCase()}` : '';
    } catch {
      return '';
    }
  }

  /**
   * Get extension from content type
   */
  private getExtensionFromContentType(contentType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': '.pdf',
      'text/markdown': '.md',
      'text/plain': '.md',
      'text/x-markdown': '.md',
      'application/octet-stream': '.pdf'
    };

    for (const [type, extension] of Object.entries(typeMap)) {
      if (contentType.toLowerCase().includes(type.split('/')[0])) {
        return extension;
      }
    }

    return '.pdf'; // default fallback
  }

  /**
   * Validate downloaded file
   */
  private validateFile(file: File): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate file type
    if (!fileValidation.isValidFileType(file)) {
      errors.push('不支持的文件格式，仅支持PDF和Markdown文件');
    }

    // Validate file size
    if (!fileValidation.isValidFileSize(file)) {
      errors.push('文件大小超过50MB限制');
    }

    // Validate file content (basic checks)
    if (file.size === 0) {
      errors.push('文件为空');
    }

    // Additional validation for PDF files
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size < 100) {
        warnings.push('PDF文件异常小，可能已损坏');
      }
    }

    // Additional validation for Markdown files
    if (file.type.includes('markdown') || file.name.toLowerCase().endsWith('.md')) {
      if (file.size > 10 * 1024 * 1024) {
        warnings.push('Markdown文件较大，处理时间可能较长');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        type: file.type,
        name: file.name,
        extension: fileValidation.getFileExtension(file.name)
      }
    };
  }

  /**
   * Process URL upload (download + upload to OSS)
   */
  async processUrlUpload(url: string): Promise<{
    success: boolean;
    ossUrl?: string;
    error?: string;
    validation?: ValidationReport;
  }> {
    try {
      // Step 1: Download and validate file
      const downloadResult = await this.downloadAndValidate(url);
      
      if (!downloadResult.success || !downloadResult.file) {
        return {
          success: false,
          error: downloadResult.error
        };
      }

      // Step 2: Upload to OSS
      const uploadResult = await ossUploader.uploadFile(downloadResult.file);
      
      return {
        success: true,
        ossUrl: uploadResult.url
      };

    } catch (error) {
      console.error('URL upload processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL上传处理失败'
      };
    }
  }

  /**
   * Get file info from URL without downloading
   */
  async getFileInfo(url: string): Promise<{
    success: boolean;
    info?: {
      size?: number;
      type?: string;
      filename?: string;
      extension?: string;
      accessible: boolean;
    };
    error?: string;
  }> {
    try {
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: '无效的URL格式'
        };
      }

      const response = await this.checkUrlAccessibility(url);
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const contentDisposition = response.headers.get('content-disposition');

      let filename = this.extractFileName(url, contentType || '');
      
      // Try to extract filename from content-disposition header
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      return {
        success: true,
        info: {
          size: contentLength ? parseInt(contentLength) : undefined,
          type: contentType || undefined,
          filename,
          extension: this.getFileExtensionFromUrl(url),
          accessible: response.ok
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取文件信息失败'
      };
    }
  }
}

// Export singleton instance
export const urlDownloader = new URLDownloader();

// Utility functions
export const downloadUtils = {
  /**
   * Convert bytes to human readable format
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Check if URL is from a trusted domain
   */
  isTrustedDomain: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const trustedDomains = [
        'arxiv.org',
        'pdf.semanticscholar.org',
        'researchgate.net',
        'academia.edu',
        'pubmed.ncbi.nlm.nih.gov',
        'dl.acm.org',
        'ieee.org',
        'sciencedirect.com',
        'springer.com',
        'nature.com',
        'wiley.com'
      ];
      
      return trustedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  },

  /**
   * Sanitize filename
   */
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }
};