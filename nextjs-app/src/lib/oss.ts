// Alibaba Cloud OSS utility for file uploads
// This is a framework implementation - you'll need to add your actual OSS configuration

export interface OSSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

class OSSUploader {
  private config: OSSConfig;

  constructor(config: OSSConfig) {
    this.config = config;
  }

  /**
   * Upload file to OSS bucket
   */
  async uploadFile(file: File, key?: string): Promise<UploadResult> {
    try {
      // Generate file key if not provided
      const fileKey = key || this.generateFileKey(file.name);
      
      // Note: In real implementation, you would use the official OSS SDK
      // This is a mock implementation that shows the structure
      
      // Mock upload process
      const mockUpload = async (): Promise<UploadResult> => {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const baseUrl = `https://${this.config.bucket}.${this.config.region}.aliyuncs.com`;
        const url = `${baseUrl}/${fileKey}`;
        
        return {
          url,
          key: fileKey,
          size: file.size,
          mimeType: file.type,
        };
      };

      return await mockUpload();
      
    } catch (error) {
      console.error('OSS upload failed:', error);
      throw new Error('文件上传到OSS失败');
    }
  }

  /**
   * Upload file from URL to OSS bucket
   */
  async uploadFromUrl(url: string, key?: string): Promise<UploadResult> {
    try {
      // Download file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download file from URL');
      }

      const blob = await response.blob();
      const fileName = this.extractFileNameFromUrl(url);
      const file = new File([blob], fileName, { type: blob.type });

      // Validate file type
      if (!this.isValidFileType(file)) {
        throw new Error('仅支持PDF和Markdown格式的文件');
      }

      // Validate file size
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('文件大小不能超过50MB');
      }

      return await this.uploadFile(file, key);
      
    } catch (error) {
      console.error('URL upload failed:', error);
      throw error;
    }
  }

  /**
   * Generate unique file key for OSS storage
   */
  private generateFileKey(fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `papers/${timestamp}/${randomString}/${safeFileName}`;
  }

  /**
   * Extract filename from URL
   */
  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'downloaded_file';
      
      // Ensure file has extension
      if (!fileName.includes('.')) {
        const extension = '.pdf'; // default fallback
        return `${fileName}${extension}`;
      }
      
      return fileName;
    } catch {
      return 'downloaded_file.pdf'; // default fallback
    }
  }

  /**
   * Get content type from URL headers
   */
  private async getContentTypeFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.headers.get('content-type') || 'application/octet-stream';
    } catch {
      return 'application/octet-stream';
    }
  }

  /**
   * Get file extension from content type
   */
  private getExtensionFromContentType(contentType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': '.pdf',
      'text/markdown': '.md',
      'text/plain': '.md',
      'application/octet-stream': '.pdf',
    };
    
    return typeMap[contentType] || '.pdf';
  }

  /**
   * Validate file type
   */
  private isValidFileType(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'text/markdown',
      'text/plain',
    ];
    
    const validExtensions = ['.pdf', '.md'];
    const fileName = file.name.toLowerCase();
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Generate signed URL for file access (if needed)
   */
  async generateSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    // Mock implementation - in real OSS SDK, you would use:
    // client.signatureUrl(key, { expires: expiresInSeconds });
    
    const baseUrl = `https://${this.config.bucket}.${this.config.region}.aliyuncs.com`;
    const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = 'mock_signature'; // In real implementation, generate proper signature
    
    return `${baseUrl}/${key}?Expires=${expiry}&OSSAccessKeyId=${this.config.accessKeyId}&Signature=${signature}`;
  }

  /**
   * Delete file from OSS
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // Mock implementation
      console.log(`Deleting file from OSS: ${key}`);
      // In real implementation: client.delete(key);
      
    } catch (error) {
      console.error('OSS delete failed:', error);
      throw new Error('删除文件失败');
    }
  }
}

// Factory function to create OSS uploader
export function createOSSUploader(config: OSSConfig): OSSUploader {
  return new OSSUploader(config);
}

// Default configuration (you should replace these with your actual OSS credentials)
export const defaultOSSConfig: OSSConfig = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
  bucket: process.env.ALIYUN_OSS_BUCKET || 'your-bucket-name',
  endpoint: process.env.ALIYUN_OSS_ENDPOINT,
};

// Export singleton instance
export const ossUploader = createOSSUploader(defaultOSSConfig);

// Utility functions for file validation
export const fileValidation = {
  isValidFileType: (file: File): boolean => {
    const validTypes = ['application/pdf', 'text/markdown', 'text/plain'];
    const validExtensions = ['.pdf', '.md'];
    const fileName = file.name.toLowerCase();
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => fileName.endsWith(ext));
  },

  isValidFileSize: (file: File, maxSizeMB = 50): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension: (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }
};