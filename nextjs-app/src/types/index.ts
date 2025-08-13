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

// User Activity types
export interface UserActivity {
  id: number;
  user_id: number;
  user: User;
  event_type: string;
  target_type: string;
  target_id: number;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  visibility: 'public' | 'private' | 'friends';
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  target_info?: any;
}

export interface CreateActivityRequest {
  user_id: number;
  event_type: string;
  target_type: string;
  target_id: number;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private' | 'friends';
}

export interface ActivityQuery {
  user_id?: number;
  event_type?: string;
  target_type?: string;
  target_id?: number;
  visibility?: string;
  page?: number;
  page_size?: number;
}

export interface ActivityResponse {
  activities: UserActivity[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Event types
export const EVENT_TYPES = {
  PAPER_ANALYZED: 'paper_analyzed',
  PAPER_LIKED: 'paper_liked',
  PAPER_RECOMMENDED: 'paper_recommended',
  PAPER_SHARED: 'paper_shared',
  ANALYSIS_CREATED: 'analysis_created',
  ANALYSIS_UPDATED: 'analysis_updated',
  ANALYSIS_COMPLETED: 'analysis_completed',
  EVALUATION_CREATED: 'evaluation_created',
  EVALUATION_UPDATED: 'evaluation_updated',
  EVALUATION_LIKED: 'evaluation_liked',
  COMMENT_CREATED: 'comment_created',
  COMMENT_LIKED: 'comment_liked',
  COMMENT_REPLIED: 'comment_replied',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  FOLLOW_USER: 'follow_user',
  UNFOLLOW_USER: 'unfollow_user',
} as const;

// Target types
export const TARGET_TYPES = {
  PAPER: 'paper',
  ANALYSIS: 'analysis',
  EVALUATION: 'evaluation',
  COMMENT: 'comment',
  USER: 'user',
  BADGE: 'badge',
} as const;

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