'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  FileText, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare
} from 'lucide-react';

const navigationItems = [
  { name: '首页', path: '/home', icon: Home },
  { name: '探索', path: '/feed', icon: Search },
  { name: '我的分析', path: '/my-analyses', icon: FileText },
  { name: '评价', path: '/evaluation', icon: BarChart3 },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleLogin = () => {
    // Mock login for development
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    };
    
    const mockToken = 'mock_token_' + Date.now();
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link 
              href="/feed"
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-blue-600">Papergraph</span>
            </Link>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center gap-1 ml-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* Messages */}
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                    <span className="text-sm font-medium text-gray-900 max-w-20 truncate">
                      {user.name || user.email}
                    </span>
                  </button>
                  
                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          个人资料
                        </Link>
                        
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          设置
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                登录
              </button>
            )}
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-blue-600">Papergraph</span>
              </div>
            </div>
            
            <nav className="p-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors',
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}