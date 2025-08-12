import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '未知日期';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '未知时间';
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else {
    return '刚刚';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 9.0) return '#10B981';
  if (score >= 8.0) return '#3B82F6';
  if (score >= 7.0) return '#F59E0B';
  return '#EF4444';
}

export function getUserTitle(position: string | undefined): string {
  const titles: Record<string, string> = {
    undergraduate: '本科生',
    master: '硕士研究生',
    phd: '博士研究生',
    postdoc: '博士后',
    assistant_professor: '助理教授',
    associate_professor: '副教授',
    professor: '教授',
    researcher: '研究员',
    other: '其他'
  };
  return titles[position || 'other'] || '研究者';
}

export function getFieldLabel(field: string | undefined): string {
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
  return fields[field || 'other'] || '未设置';
}

export function getBadgeIcon(type: string): string {
  const icons: Record<string, string> = {
    first_analysis: '🎯',
    analysis_explorer: '🔍',
    analysis_master: '👑',
    knowledge_sharer: '📚',
    popular_analyst: '⭐',
    active_commentator: '💭',
    rising_star: '🌟',
    social_butterfly: '🦋',
    generous_sharer: '🎁'
  };
  return icons[type] || '🏆';
}

export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  return labels[rarity] || '普通';
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    analysis: '📊',
    like: '❤️',
    comment: '💬',
    share: '📤',
    follow: '👥',
    badge: '🏆'
  };
  return icons[type] || '📝';
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return labels[priority] || '中优先级';
}

export function getTrendIcon(trend: number): string {
  if (trend > 0) return '📈';
  if (trend < 0) return '📉';
  return '➡️';
}

export function getTrendValue(trend: number): string {
  if (trend > 0) return `+${trend}%`;
  if (trend < 0) return `${trend}%`;
  return '0%';
}

export function getTrendClass(trend: number): string {
  if (trend > 0) return 'text-green-600 bg-green-50';
  if (trend < 0) return 'text-red-600 bg-red-50';
  return 'text-gray-600 bg-gray-50';
}

export function getRankClass(rank: number): string {
  if (rank <= 3) return 'text-yellow-600';
  if (rank <= 10) return 'text-blue-600';
  return 'text-gray-600';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}