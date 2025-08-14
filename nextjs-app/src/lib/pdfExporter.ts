import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  filename?: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

export class PDFExporter {
  private static instance: PDFExporter;

  static getInstance(): PDFExporter {
    if (!PDFExporter.instance) {
      PDFExporter.instance = new PDFExporter();
    }
    return PDFExporter.instance;
  }

  async exportToPDF(
    elementId: string,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'report.pdf',
      title = '论文分析报告',
      author = 'PaperGraph',
      subject = '学术论文分析',
      keywords = '论文,分析,报告'
    } = options;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // 显示加载状态
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      // 使用html2canvas生成canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提高分辨率
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 设置PDF元数据
      pdf.setProperties({
        title,
        author,
        subject,
        keywords,
        creator: 'PaperGraph'
      });

      // 计算图片尺寸以适应A4页面
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // 添加标题
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' });

      // 添加生成时间
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const now = new Date().toLocaleString('zh-CN');
      pdf.text(`生成时间: ${now}`, pdfWidth / 2, 25, { align: 'center' });

      // 如果内容高度超过单页，分页处理
      if (imgHeight * ratio > pdfHeight - 40) {
        const remainingHeight = imgHeight * ratio;
        let sourceY = 0;
        let pageNum = 1;

        while (sourceY < imgHeight) {
          if (pageNum > 1) {
            pdf.addPage();
          }

          const pageHeight = Math.min(
            (pdfHeight - 20) / ratio,
            imgHeight - sourceY
          );

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = pageHeight;

          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              pageHeight,
              0,
              0,
              imgWidth,
              pageHeight
            );
          }

          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(
            pageImgData,
            'PNG',
            imgX,
            pageNum > 1 ? 10 : imgY,
            imgWidth * ratio,
            pageHeight * ratio
          );

          sourceY += pageHeight;
          pageNum++;
        }
      } else {
        // 单页内容
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      }

      // 添加页脚
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `第 ${i} 页，共 ${pageCount} 页`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: 'center' }
        );
      }

      // 保存PDF
      pdf.save(filename);

      // 恢复光标
      document.body.style.cursor = originalCursor;

    } catch (error) {
      console.error('PDF导出失败:', error);
      document.body.style.cursor = 'default';
      throw new Error('PDF导出失败，请重试');
    }
  }

  async exportChartsToPDF(
    chartIds: string[],
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'charts-report.pdf',
      title = '图表分析报告',
      author = 'PaperGraph',
      subject = '数据图表分析',
      keywords = '图表,数据,分析'
    } = options;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 设置PDF元数据
      pdf.setProperties({
        title,
        author,
        subject,
        keywords,
        creator: 'PaperGraph'
      });

      // 添加标题
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' });

      // 添加生成时间
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const now = new Date().toLocaleString('zh-CN');
      pdf.text(`生成时间: ${now}`, pdfWidth / 2, 25, { align: 'center' });

      let yPos = 40;

      for (let i = 0; i < chartIds.length; i++) {
        const chartElement = document.getElementById(chartIds[i]);
        if (!chartElement) continue;

        // 如果需要换页
        if (yPos > pdf.internal.pageSize.getHeight() - 80) {
          pdf.addPage();
          yPos = 20;
        }

        // 生成图表图片
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const chartWidth = pdfWidth - 40;
        const chartHeight = (canvas.height * chartWidth) / canvas.width;

        // 添加图表标题
        const chartTitle = chartElement.getAttribute('data-chart-title') || `图表 ${i + 1}`;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(chartTitle, 20, yPos);

        // 添加图表
        pdf.addImage(imgData, 'PNG', 20, yPos + 5, chartWidth, chartHeight);

        yPos += chartHeight + 20;
      }

      // 保存PDF
      pdf.save(filename);

    } catch (error) {
      console.error('图表PDF导出失败:', error);
      throw new Error('图表PDF导出失败，请重试');
    }
  }
}