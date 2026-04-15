import React from 'react';
import { Outlet } from 'react-router-dom';

function LayoutGithub() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Mintlify 风格导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-[1200px] mx-auto px-6 py-3 text-center">
          <h1 className="text-lg font-semibold text-near-black tracking-tight">快乐日记</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      {/* Mintlify 风格页脚 */}
      <footer className="border-t border-[rgba(0,0,0,0.05)] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray-400">© 2025 快乐日记 - 记录美好生活的每一天</p>
        </div>
      </footer>
    </div>
  );
}

export default LayoutGithub;
