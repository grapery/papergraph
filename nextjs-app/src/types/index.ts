// User types
export interface User {
  id: number;
  name: string;
  email?: string;
  gmail?: string;
  avatar?: string;
  institution?: string;
  position?: string;
  field?: string;
  bio?: string;
  interests?: string[];
  created_at?: string;
  stats?: UserStats;
}

export interface UserStats {
  analyses: number;
  followers: number;
  following: number;
  likes: number;
  citations: number;
  badges: number;
}

// Paper types
export interface Paper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  subcategory: string;
  publishDate: string;
  evaluation: Evaluation;
  stats: PaperStats;
}

export interface PaperStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  citations: number;
}

export interface Evaluation {
  innovation: number;      // 创新性
  methodology: number;     // 方法论
  impact: number;          // 影响力
  clarity: number;         // 清晰度
  reproducibility: number; // 可复现性
  significance: number;    // 重要性
  overall: number;        // 综合评分
}

// Analysis types
export interface Analysis {
  id: number;
  paper: Paper;
  overallScore: number;
  rank: number;
  percentile: number;
  trend: number;
  dimensions: Evaluation;
  summary?: string;
  keyFindings?: Finding[];
  strengths?: Strength[];
  weaknesses?: Weakness[];
  recommendations?: Recommendation[];
}

export interface Finding {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Strength {
  id: string;
  icon: string;
  title: string;
  score: number;
  description: string;
  evidence: string[];
}

export interface Weakness {
  id: string;
  icon: string;
  title: string;
  score: number;
  description: string;
  suggestions: string[];
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

// Badge types
export interface Badge {
  id: number;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

// Activity types
export interface Activity {
  id: number;
  type: 'analysis' | 'like' | 'comment' | 'share' | 'follow' | 'badge';
  content: string;
  created_at: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Navigation types
export interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  institution?: string;
  position?: string;
  field?: string;
}

export interface ProfileForm {
  name: string;
  email: string;
  institution?: string;
  position?: string;
  field?: string;
  bio?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}