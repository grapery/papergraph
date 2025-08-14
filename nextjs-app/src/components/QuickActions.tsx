'use client';

import Link from 'next/link';
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  ArrowRight,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple';
}

function QuickActionCard({ title, description, icon, href, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200'
  };

  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border-2 transition-all duration-200 ${colorClasses[color]} group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}

export default function QuickActions() {
  const actions = [
    {
      title: '上传论文',
      description: '上传PDF或Markdown格式的论文文件进行智能分析',
      icon: <Upload className="w-6 h-6" />,
      href: '/upload-analysis',
      color: 'blue' as const
    },
    {
      title: 'URL导入',
      description: '通过URL链接导入论文，支持自动下载和格式验证',
      icon: <LinkIcon className="w-6 h-6" />,
      href: '/upload-analysis',
      color: 'green' as const
    },
    {
      title: '查看分析',
      description: '浏览已完成的论文分析结果和评价报告',
      icon: <FileText className="w-6 h-6" />,
      href: '/my-analyses',
      color: 'purple' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action) => (
        <QuickActionCard
          key={action.title}
          title={action.title}
          description={action.description}
          icon={action.icon}
          href={action.href}
          color={action.color}
        />
      ))}
    </div>
  );
}