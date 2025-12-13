import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">豆豆小日记</h1>
          <nav className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded transition ${
                isActive('/') 
                  ? 'bg-blue-700 font-semibold' 
                  : 'hover:bg-blue-700'
              }`}
            >
              首页
            </Link>
            <Link
              to="/users"
              className={`px-3 py-2 rounded transition ${
                isActive('/users')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              用户管理
            </Link>
            <Link
              to="/diaries"
              className={`px-3 py-2 rounded transition ${
                isActive('/diaries')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              写日记
            </Link>
            <Link
              to="/display"
              className={`px-3 py-2 rounded transition ${
                isActive('/display')
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-700'
              }`}
            >
              日记展示
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 mt-8">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© 2025 豆豆日记 - 记录美好生活的每一天</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;