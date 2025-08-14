'use client';

import PaperUpload from '@/components/PaperUpload';

export default function UploadAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">论文分析</h1>
            <p className="mt-1 text-sm text-gray-600">
              上传您的论文文件或提供URL链接，我们将为您进行智能分析
            </p>
          </div>
        </div>
      </div>
      
      <main className="py-8">
        <PaperUpload />
      </main>
    </div>
  );
}