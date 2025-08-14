// Article database types and interfaces
export interface Article {
  id: number;
  title: string;
  authors: string[];
  authorString: string; // 保存原始作者字符串格式
  abstract: string;
  publishDate: string;
  publishYear: number;
  source?: string; // 文章来源，如 arXiv, DOI 等
  doi?: string;
  url?: string;
  pdfUrl?: string;
  category?: string;
  subcategory?: string;
  language: 'zh' | 'en' | 'other';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  stats: {
    views: number;
    downloads: number;
    shares: number;
    citations: number;
  };
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  color: string;
  category: string; // tag category, e.g., 'method', 'domain', 'technique'
  usageCount: number;
  createdAt: string;
}

export interface ArticleTag {
  id: number;
  articleId: number;
  tagId: number;
  confidence: number; // 标签置信度 0-1
  createdAt: string;
}

export interface ArticleAnalysis {
  id: number;
  articleId: number;
  userId: number;
  overallScore: number;
  dimensions: {
    innovation: number;
    methodology: number;
    impact: number;
    clarity: number;
    reproducibility: number;
    significance: number;
  };
  summary: string;
  keyFindings: KeyFinding[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  extractedTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KeyFinding {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ArticleSearchFilters {
  author?: string;
  tags?: string[];
  category?: string;
  year?: { start?: number; end?: number };
  language?: string;
  minScore?: number;
  maxScore?: number;
  sortBy?: 'date' | 'score' | 'citations' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ArticleSearchResult {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: ArticleSearchFilters;
}

export interface AuthorStats {
  name: string;
  articleCount: number;
  totalCitations: number;
  averageScore: number;
  topCategories: string[];
  topTags: string[];
  latestArticle: string;
}