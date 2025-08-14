'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  Link, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  File
} from 'lucide-react';

interface UploadMethod {
  id: 'file' | 'url';
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface UploadResponse {
  code: number;
  message: string;
  data: {
    paper: {
      id: number;
      title: string;
      authors: string[];
      abstract: string;
      category: string;
      subcategory: string;
      publishDate: string;
      fileSize: number;
      fileName: string;
      uploadDate: string;
      status: string;
    };
    task: {
      id: number;
      paperId: number;
      status: string;
      type: string;
      createdAt: string;
      estimatedTime: number;
      progress: number;
    };
  };
}

const uploadMethods: UploadMethod[] = [
  {
    id: 'file',
    name: '文件上传',
    description: '上传PDF或Markdown格式的论文文件',
    icon: <Upload className="w-6 h-6" />
  },
  {
    id: 'url',
    name: '链接上传',
    description: '输入论文的URL链接，自动下载并分析',
    icon: <Link className="w-6 h-6" />
  }
];

const supportedFormats = [
  { format: 'PDF', mime: 'application/pdf', extension: '.pdf' },
  { format: 'Markdown', mime: 'text/markdown', extension: '.md' }
];

export default function PaperUpload() {
  const [selectedMethod, setSelectedMethod] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const isValidType = supportedFormats.some(
      format => format.mime === selectedFile.type || 
                selectedFile.name.toLowerCase().endsWith(format.extension)
    );

    if (!isValidType) {
      setError('仅支持PDF和Markdown格式的文件');
      return;
    }

    // Validate file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const validateUrl = (inputUrl: string): boolean => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpload = async () => {
    if (selectedMethod === 'file' && !file) {
      setError('请选择要上传的文件');
      return;
    }

    if (selectedMethod === 'url' && !url) {
      setError('请输入论文URL');
      return;
    }

    if (selectedMethod === 'url' && !validateUrl(url)) {
      setError('请输入有效的URL地址');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadStatus('idle');

    try {
      let response: UploadResponse;

      if (selectedMethod === 'file') {
        response = await uploadFile(file!);
      } else {
        response = await uploadFromUrl(url);
      }

      if (response.code === 0) {
        setUploadStatus('success');
        setUploadResult(response);
        // Reset form
        setFile(null);
        setUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.message);
        setUploadStatus('error');
      }
    } catch (err) {
      setError(selectedMethod === 'file' ? '文件上传失败' : 'URL处理失败');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (fileToUpload: File): Promise<UploadResponse> => {
    // Note: This is a mock implementation
    // In real implementation, this would upload to Alibaba Cloud OSS
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  const uploadFromUrl = async (paperUrl: string): Promise<UploadResponse> => {
    // Note: This is a mock implementation
    // In real implementation, this would:
    // 1. Download the file from URL
    // 2. Validate file format (PDF/Markdown)
    // 3. Upload to OSS
    // 4. Process the file

    const response = await fetch('/api/upload/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: paperUrl }),
    });

    if (!response.ok) {
      throw new Error('URL processing failed');
    }

    return response.json();
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadResult(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">上传论文进行分析</h1>
        <p className="text-gray-600">支持文件上传或URL链接两种方式</p>
      </div>

      {/* Upload Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploadMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                selectedMethod === method.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Upload Area */}
      {uploadStatus === 'idle' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {selectedMethod === 'file' ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.md"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <File className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)} • {file.type || '未知格式'}
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      拖拽文件到此处或点击上传
                    </p>
                    <p className="text-sm text-gray-600">
                      支持 PDF 和 Markdown 格式，最大 50MB
                    </p>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    选择文件
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  论文URL地址
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/paper.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-2">
                  系统将自动下载并分析该URL指向的论文文件
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">注意事项</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• URL必须指向PDF或Markdown格式的文件</li>
                      <li>• 确保URL可以公开访问</li>
                      <li>• 文件大小不能超过50MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isUploading || (!file && !url)}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isUploading || (!file && !url)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {selectedMethod === 'file' ? '正在上传...' : '正在处理...'}
                </div>
              ) : (
                '开始分析'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === 'success' && uploadResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">上传成功！</h2>
            <p className="text-gray-600">您的论文已成功上传并开始分析</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Paper Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                论文信息
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">标题：</span>
                  <span className="text-gray-900 font-medium">{uploadResult.data.paper.title}</span>
                </div>
                <div>
                  <span className="text-gray-600">作者：</span>
                  <span className="text-gray-900">{uploadResult.data.paper.authors.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">文件名：</span>
                  <span className="text-gray-900">{uploadResult.data.paper.fileName}</span>
                </div>
                <div>
                  <span className="text-gray-600">上传时间：</span>
                  <span className="text-gray-900">
                    {new Date(uploadResult.data.paper.uploadDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Task Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">分析任务</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">任务ID：</span>
                  <span className="text-gray-900 font-mono">#{uploadResult.data.task.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">状态：</span>
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-700">处理中</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">预计完成时间：</span>
                  <span className="text-gray-900">
                    {Math.ceil(uploadResult.data.task.estimatedTime / 60)} 分钟
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">创建时间：</span>
                  <span className="text-gray-900">
                    {new Date(uploadResult.data.task.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.href = `/task-detail/${uploadResult.data.task.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看分析进度
            </button>
            <button
              onClick={resetUpload}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              上传新论文
            </button>
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">支持的文件格式</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportedFormats.map((format) => (
            <div key={format.mime} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">{format.format}</div>
                <div className="text-sm text-blue-700">{format.mime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}