import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Mintlify 风格导航栏：白色背景 + 模糊 + 底部细线 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 py-3">
          <h1 className="text-lg font-semibold text-near-black tracking-tight">快乐日记</h1>
          <nav className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-brand bg-brand-light' 
                  : 'text-near-black hover:text-brand'
              }`}
            >
              首页
            </Link>
            <Link
              to="/users"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/users')
                  ? 'text-brand bg-brand-light'
                  : 'text-near-black hover:text-brand'
              }`}
            >
              用户管理
            </Link>
            <Link
              to="/diaries"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/diaries')
                  ? 'text-brand bg-brand-light'
                  : 'text-near-black hover:text-brand'
              }`}
            >
              写日记
            </Link>
            <Link
              to="/display"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/display')
                  ? 'text-brand bg-brand-light'
                  : 'text-near-black hover:text-brand'
              }`}
            >
              日记展示
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      {/* Mintlify 风格页脚：白色背景 + 顶部细线 */}
      <footer className="border-t border-[rgba(0,0,0,0.05)] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray-400">© 2026 快乐日记 - 记录美好生活的每一天</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
