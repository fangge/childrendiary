import React, { useState, useEffect } from 'react';
import { DateUtils } from '../utils/helpers';
import api from '../services/api';
import '../styles/book.css';

const HomeGithub = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadDiaries(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      if (data.length > 0) {
        setSelectedUserId(data[0].id);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiaries = async (userId) => {
    try {
      setLoading(true);
      const data = await api.getDiaries();
      const userDiaries = data.filter(diary => diary.userId === userId);
      const sortedDiaries = userDiaries.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      setDiaries(sortedDiaries);
      setCurrentPage(0);
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageTurn = (direction) => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, Math.ceil(diaries.length / 2) - 1)
      : Math.max(currentPage - 1, 0);
    
    setCurrentPage(newPage);
    setTimeout(() => setIsFlipping(false), 600);
  };

  const getCurrentPageDiaries = () => {
    const startIndex = currentPage * 2;
    return diaries.slice(startIndex, startIndex + 2);
  };

  const getCurrentUser = () => {
    return users.find(u => u.id === selectedUserId);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center hero-gradient">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">暂无用户数据</h2>
          <p className="text-gray-500">请在本地版本中添加用户和日记</p>
        </div>
      </div>
    );
  }

  if (diaries.length === 0) {
    const currentUser = getCurrentUser();
    return (
      <div className="min-h-[60vh] flex items-center justify-center hero-gradient p-4">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">还没有日记</h2>
          <p className="text-gray-500 mb-6">{currentUser?.name} 还没有记录日记</p>
          {users.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">切换用户:</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-[rgba(0,0,0,0.08)] rounded-pill focus:ring-brand focus:border-brand bg-white text-sm"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  const pageDiaries = getCurrentPageDiaries();
  const totalPages = Math.ceil(diaries.length / 2);
  const currentUser = getCurrentUser();

  return (
    <div className="py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-5xl mx-auto">
        {/* 头部信息 */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>
            {currentUser?.name} 的成长日记
          </h1>
          <p className="text-sm md:text-base text-gray-500">共 {diaries.length} 篇日记</p>
          
          {/* 用户选择器 */}
          {users.length > 1 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-pill border border-[rgba(0,0,0,0.05)] shadow-card">
                <label className="text-sm font-medium text-gray-500">切换用户:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-3 py-1 border border-[rgba(0,0,0,0.08)] rounded-pill focus:ring-brand focus:border-brand bg-white text-sm"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 翻页书效果 */}
        <div className="relative">
          <div className="book-container perspective-1000">
            <div className={`book ${isFlipping ? 'flipping' : ''}`}>
              {pageDiaries.map((diary, index) => (
                <div
                  key={diary.id}
                  className={`page ${index === 0 ? 'page-left' : 'page-right'} bg-white rounded-card border border-[rgba(0,0,0,0.05)] shadow-card p-4 md:p-6 lg:p-8`}
                >
                  <div className="h-full flex flex-col">
                    {/* 日记日期 */}
                    <div className="mb-3 md:mb-4">
                      <span className="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-pill">
                        {DateUtils.formatReadableDate(diary.date)}
                      </span>
                    </div>

                    {/* 日记标题 */}
                    {diary.title && (
                      <h3 className="text-base md:text-xl lg:text-2xl font-semibold text-near-black tracking-tight mb-3 md:mb-4" style={{ letterSpacing: '-0.2px' }}>
                        {diary.title}
                      </h3>
                    )}

                    {/* 日记内容 */}
                    <div className="flex-1 overflow-y-auto mb-3 md:mb-4">
                      <div
                        className="text-sm md:text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: diary.content }}
                      />
                    </div>

                    {/* 日记图片 */}
                    {diary.images && diary.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4">
                        {diary.images.slice(0, 4).map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`日记图片 ${imgIndex + 1}`}
                            className="w-full h-24 md:h-32 object-cover rounded-card border border-[rgba(0,0,0,0.05)] cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* 页码 */}
                    <div className="text-center text-xs md:text-sm text-gray-400">
                      第 {currentPage * 2 + index + 1} 页
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 翻页按钮 */}
          <div className="flex justify-between items-center mt-6 md:mt-8">
            <button
              onClick={() => handlePageTurn('prev')}
              disabled={currentPage === 0 || isFlipping}
              className="flex items-center gap-2 px-4 md:px-5 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-pill text-sm font-medium text-near-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">上一页</span>
            </button>

            <div className="text-sm md:text-base text-gray-400 font-medium">
              {currentPage + 1} / {totalPages}
            </div>

            <button
              onClick={() => handlePageTurn('next')}
              disabled={currentPage >= totalPages - 1 || isFlipping}
              className="flex items-center gap-2 px-4 md:px-5 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-pill text-sm font-medium text-near-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-button"
            >
              <span className="hidden sm:inline">下一页</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeGithub;
