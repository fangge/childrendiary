import React from 'react';
import { Outlet } from 'react-router-dom';

function LayoutGithub() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold">豆豆小日记</h1>
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

export default LayoutGithub;