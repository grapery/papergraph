import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Paper, Analysis, Category } from '@/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  
  // Data state
  categories: Category[];
  papers: Paper[];
  analyses: Analysis[];
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCategories: (categories: Category[]) => void;
  setPapers: (papers: Paper[]) => void;
  setAnalyses: (analyses: Analysis[]) => void;
  
  // Auth actions
  login: (user: User, token: string) => void;
  logout: () => void;
  
  // Data actions
  addPaper: (paper: Paper) => void;
  updatePaper: (id: number, paper: Partial<Paper>) => void;
  removePaper: (id: number) => void;
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: number, analysis: Partial<Analysis>) => void;
  removeAnalysis: (id: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sidebarOpen: false,
      categories: [],
      papers: [],
      analyses: [],
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCategories: (categories) => set({ categories }),
      setPapers: (papers) => set({ papers }),
      setAnalyses: (analyses) => set({ analyses }),
      
      // Auth actions
      login: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, isAuthenticated: true, error: null });
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('mock_user');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },
      
      // Data actions
      addPaper: (paper) => set((state) => ({ 
        papers: [paper, ...state.papers] 
      })),
      
      updatePaper: (id, updates) => set((state) => ({
        papers: state.papers.map(paper => 
          paper.id === id ? { ...paper, ...updates } : paper
        )
      })),
      
      removePaper: (id) => set((state) => ({
        papers: state.papers.filter(paper => paper.id !== id)
      })),
      
      addAnalysis: (analysis) => set((state) => ({ 
        analyses: [analysis, ...state.analyses] 
      })),
      
      updateAnalysis: (id, updates) => set((state) => ({
        analyses: state.analyses.map(analysis => 
          analysis.id === id ? { ...analysis, ...updates } : analysis
        )
      })),
      
      removeAnalysis: (id) => set((state) => ({
        analyses: state.analyses.filter(analysis => analysis.id !== id)
      })),
    }),
    {
      name: 'papergraph-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        categories: state.categories,
      }),
    }
  )
);