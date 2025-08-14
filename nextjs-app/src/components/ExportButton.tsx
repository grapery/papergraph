'use client';

import { useState } from 'react';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { PDFExporter } from '@/lib/pdfExporter';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
  title?: string;
  type?: 'report' | 'charts';
  chartIds?: string[];
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({
  targetId,
  filename,
  title,
  type = 'report',
  chartIds = [],
  className,
  variant = 'default',
  size = 'default'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const pdfExporter = PDFExporter.getInstance();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (type === 'charts' && chartIds.length > 0) {
        await pdfExporter.exportChartsToPDF(chartIds, {
          filename: filename || 'charts-report.pdf',
          title: title || '图表分析报告'
        });
      } else {
        await pdfExporter.exportToPDF(targetId, {
          filename: filename || 'report.pdf',
          title: title || '论文分析报告'
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'default',
      'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
      'hover:bg-gray-100': variant === 'ghost',
      'h-10 px-4 py-2': size === 'default',
      'h-9 px-3': size === 'sm',
      'h-11 px-8': size === 'lg'
    },
    className
  );

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={baseClasses}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          导出中...
        </>
      ) : (
        <>
          {type === 'charts' ? (
            <BarChart3 className="w-4 h-4 mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          导出PDF
        </>
      )}
    </button>
  );
}

interface ExportOptionsProps {
  targetId: string;
  chartIds?: string[];
  className?: string;
}

export function ExportOptions({ targetId, chartIds = [], className }: ExportOptionsProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Download className="w-4 h-4 mr-2" />
        导出报告
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <ExportButton
              targetId={targetId}
              filename="full-report.pdf"
              title="完整分析报告"
              type="report"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none rounded-none"
              variant="ghost"
              size="default"
            />
            {chartIds.length > 0 && (
              <ExportButton
                targetId={targetId}
                chartIds={chartIds}
                filename="charts-report.pdf"
                title="图表分析报告"
                type="charts"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none rounded-none"
                variant="ghost"
                size="default"
              />
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}