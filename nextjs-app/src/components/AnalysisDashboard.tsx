'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, Title } from 'chart.js';
import { Radar, Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAnalyses } from '@/hooks/useData';
import { cn } from '@/lib/utils';
import { 
  Download, 
  Share2, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  Minus,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title
);

type TabType = 'summary' | 'strengths' | 'weaknesses' | 'recommendations';

export default function AnalysisDashboard({ analysis }: { analysis: any }) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [chartType, setChartType] = useState<'radar' | 'polar'>('radar');
  const [barType, setBarType] = useState<'bar' | 'horizontal'>('bar');
  const [lineType, setLineType] = useState<'line' | 'area'>('line');
  const [doughnutType, setDoughnutType] = useState<'doughnut' | 'pie'>('doughnut');

  const radarRef = useRef<any>(null);
  const barRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const doughnutRef = useRef<any>(null);

  const tabs = [
    { id: 'summary' as TabType, label: '摘要', icon: FileText },
    { id: 'strengths' as TabType, label: '优势', icon: CheckCircle },
    { id: 'weaknesses' as TabType, label: '不足', icon: AlertTriangle },
    { id: 'recommendations' as TabType, label: '建议', icon: Lightbulb },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return '#10B981';
    if (score >= 8.0) return '#3B82F6';
    if (score >= 7.0) return '#F59E0B';
    return '#EF4444';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return TrendingUp;
    if (trend < 0) return TrendingDown;
    return Minus;
  };

  const getTrendClass = (trend: number) => {
    if (trend > 0) return 'text-green-600 bg-green-50';
    if (trend < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Radar Chart Data
  const radarData = {
    labels: ['创新性', '方法论', '影响力', '清晰度', '可复现性', '重要性'],
    datasets: [
      {
        label: '论文评分',
        data: [
          analysis.dimensions?.innovation || 0,
          analysis.dimensions?.methodology || 0,
          analysis.dimensions?.impact || 0,
          analysis.dimensions?.clarity || 0,
          analysis.dimensions?.reproducibility || 0,
          analysis.dimensions?.significance || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Bar Chart Data
  const barData = {
    labels: ['创新性', '方法论', '影响力', '清晰度', '可复现性', '重要性'],
    datasets: [
      {
        label: '评分',
        data: [
          analysis.dimensions?.innovation || 0,
          analysis.dimensions?.methodology || 0,
          analysis.dimensions?.impact || 0,
          analysis.dimensions?.clarity || 0,
          analysis.dimensions?.reproducibility || 0,
          analysis.dimensions?.significance || 0,
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: barType === 'horizontal' ? 'y' as const : 'x' as const,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Line Chart Data
  const lineData = {
    labels: ['1月前', '3周前', '2周前', '1周前', '现在'],
    datasets: [
      {
        label: '评分趋势',
        data: [7.2, 7.5, 7.8, 8.1, analysis.overallScore || 8.0],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: lineType === 'area',
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['优秀 (9-10)', '良好 (8-9)', '一般 (7-8)', '待改进 (6-7)', '较差 (<6)'],
    datasets: [
      {
        data: [15, 35, 30, 15, 5],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
          '#6B7280',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const toggleRadarChart = () => {
    setChartType(chartType === 'radar' ? 'polar' : 'radar');
  };

  const toggleBarChart = () => {
    setBarType(barType === 'bar' ? 'horizontal' : 'bar');
  };

  const toggleLineChart = () => {
    setLineType(lineType === 'line' ? 'area' : 'line');
  };

  const toggleDoughnutChart = () => {
    setDoughnutType(doughnutType === 'doughnut' ? 'pie' : 'doughnut');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {analysis.paper?.title || '论文分析报告'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{analysis.paper?.authors?.join(', ') || '未知作者'}</span>
                <span>•</span>
                <span>{new Date(analysis.paper?.publishDate).toLocaleDateString('zh-CN')}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {getFieldLabel(analysis.paper?.category)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4" />
                导出报告
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Printer className="w-4 h-4" />
                打印
              </button>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">综合评分</h2>
            <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium', getTrendClass(analysis.trend))}>
              {(() => {
                const Icon = getTrendIcon(analysis.trend);
                return Icon && <Icon className="w-4 h-4" />;
              })()}
              <span>{analysis.trend > 0 ? `+${analysis.trend}%` : analysis.trend < 0 ? `${analysis.trend}%` : '0%'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200" style={{ borderColor: getScoreColor(analysis.overallScore) }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold" style={{ color: getScoreColor(analysis.overallScore) }}>
                    {analysis.overallScore?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-500">/10</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  排名 #{analysis.rank || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  超越 {analysis.percentile || 0}% 的论文
                </div>
              </div>
              
              <div className="space-y-2">
                {['innovation', 'methodology', 'impact'].map((dimension) => (
                  <div key={dimension} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">
                      {getDimensionLabel(dimension)}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(analysis.dimensions?.[dimension] || 0) * 10}%`,
                          backgroundColor: getScoreColor(analysis.dimensions?.[dimension] || 0)
                        }}
                      />
                    </div>
                    <span className="w-12 text-sm font-medium text-gray-900 text-right">
                      {(analysis.dimensions?.[dimension] || 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">多维度评价雷达图</h3>
              <button onClick={toggleRadarChart} className="p-2 hover:bg-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="h-80">
              <Radar ref={radarRef} data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">各维度评分对比</h3>
              <button onClick={toggleBarChart} className="p-2 hover:bg-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="h-80">
              <Bar ref={barRef} data={barData} options={barOptions} />
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">评分趋势变化</h3>
              <button onClick={toggleLineChart} className="p-2 hover:bg-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="h-80">
              <Line ref={lineRef} data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">评分分布</h3>
              <button onClick={toggleDoughnutChart} className="p-2 hover:bg-gray-100 rounded-lg">
                <Target className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="h-80">
              <Doughnut ref={doughnutRef} data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">分析摘要</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.summary || '该论文在多个维度上表现出色，具有较高的学术价值和应用前景。'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">主要发现</h3>
                  <div className="space-y-3">
                    {analysis.keyFindings?.map((finding: any) => (
                      <div key={finding.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl">{finding.icon}</div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{finding.title}</h4>
                          <p className="text-sm text-gray-600">{finding.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'strengths' && (
              <div className="space-y-4">
                {analysis.strengths?.map((strength: any) => (
                  <div key={strength.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{strength.icon}</div>
                        <h4 className="font-medium text-gray-900">{strength.title}</h4>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {strength.score?.toFixed(1) || '0.0'}/10
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{strength.description}</p>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">证据支持：</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {strength.evidence?.map((evidence: string, index: number) => (
                            <li key={index}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'weaknesses' && (
              <div className="space-y-4">
                {analysis.weaknesses?.map((weakness: any) => (
                  <div key={weakness.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{weakness.icon}</div>
                        <h4 className="font-medium text-gray-900">{weakness.title}</h4>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {weakness.score?.toFixed(1) || '0.0'}/10
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{weakness.description}</p>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">改进建议：</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {weakness.suggestions?.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {analysis.recommendations?.map((recommendation: any) => (
                  <div 
                    key={recommendation.id} 
                    className={cn(
                      'border-l-4 p-4 bg-gray-50 rounded-r-lg',
                      recommendation.priority === 'high' ? 'border-l-red-600' :
                      recommendation.priority === 'medium' ? 'border-l-yellow-600' :
                      'border-l-green-600'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-600' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      )}>
                        {recommendation.priority === 'high' ? '高优先级' :
                         recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                      <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-2">{recommendation.description}</p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">预期影响：</span>
                      <span>{recommendation.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDimensionLabel(dimension: string): string {
  const labels: Record<string, string> = {
    innovation: '创新性',
    methodology: '方法论',
    impact: '影响力',
    clarity: '清晰度',
    reproducibility: '可复现性',
    significance: '重要性',
  };
  return labels[dimension] || dimension;
}

function getFieldLabel(field: string): string {
  const fields: Record<string, string> = {
    'cs-ai': '人工智能',
    'cs-system': '计算机系统',
    'bio-med': '生物医学',
    'physics': '物理学',
    'chemistry': '化学',
    'math': '数学',
    'economics': '经济学',
    'env-science': '环境科学',
    'other': '其他'
  };
  return fields[field] || '未设置';
}