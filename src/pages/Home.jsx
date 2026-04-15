import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../contexts/UserContext';
import { DateUtils } from '../utils/helpers';
import api from '../services/api';
import '../styles/book.css';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    loadDiaries();
  }, [currentUser]);

  const loadDiaries = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getDiaries();
      const userDiaries = data.filter(diary => diary.userId === currentUser.id);
      const sortedDiaries = userDiaries.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      setDiaries(sortedDiaries);
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

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center hero-gradient">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">欢迎来到儿童成长日记</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">请先选择或创建一个用户来开始记录</p>
          <button
            onClick={() => navigate('/users')}
            className="btn-primary"
          >
            前往用户管理
          </button>
        </div>
      </div>
    );
  }

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

  if (diaries.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center hero-gradient p-4">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">还没有日记</h2>
          <p className="text-gray-500 mb-6">开始记录 {currentUser.name} 的成长故事吧！</p>
          <button
            onClick={() => navigate('/diaries')}
            className="btn-primary"
          >
            创建第一篇日记
          </button>
        </div>
      </div>
    );
  }

  const pageDiaries = getCurrentPageDiaries();
  const totalPages = Math.ceil(diaries.length / 2);

  return (
    <div className="py-8 px-2 md:px-4">
      <div className="max-w-5xl mx-auto">
        {/* 头部信息 - Mintlify 风格 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>
            {currentUser.name} 的成长日记
          </h1>
          <p className="text-gray-500">共 {diaries.length} 篇日记</p>
        </div>

        {/* 翻页书效果 */}
        <div className="relative">
          <div className="book-container perspective-1000">
            <div className={`book ${isFlipping ? 'flipping' : ''}`}>
              {pageDiaries.map((diary, index) => (
                <div
                  key={diary.id}
                  className={`page ${index === 0 ? 'page-left' : 'page-right'} bg-white rounded-card border border-[rgba(0,0,0,0.05)] shadow-card p-6 md:p-8`}
                >
                  <div className="h-full flex flex-col">
                    {/* 日记日期 - Mintlify 风格标签 */}
                    <div className="mb-4">
                      <span className="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-pill">
                        {DateUtils.formatReadableDate(diary.date)}
                      </span>
                    </div>

                    {/* 日记标题 */}
                    {diary.title && (
                      <h3 className="text-xl font-semibold text-near-black tracking-tight mb-4" style={{ letterSpacing: '-0.2px' }}>
                        {diary.title}
                      </h3>
                    )}

                    {/* 日记内容 */}
                    <div className="flex-1 overflow-y-auto mb-4">
                      <div
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: diary.content }}
                      />
                    </div>

                    {/* 日记图片 */}
                    {diary.images && diary.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {diary.images.slice(0, 4).map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`日记图片 ${imgIndex + 1}`}
                            className="w-full h-32 object-cover rounded-card border border-[rgba(0,0,0,0.05)]"
                          />
                        ))}
                      </div>
                    )}

                    {/* 页码 */}
                    <div className="text-center text-xs text-gray-400">
                      第 {currentPage * 2 + index + 1} 页
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 翻页按钮 - Mintlify 药丸风格 */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => handlePageTurn('prev')}
              disabled={currentPage === 0 || isFlipping}
              className="flex items-center gap-2 px-5 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-pill text-sm font-medium text-near-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline">上一页</span>
            </button>

            <div className="text-sm text-gray-400 font-medium">
              {currentPage + 1} / {totalPages}
            </div>

            <button
              onClick={() => handlePageTurn('next')}
              disabled={currentPage >= totalPages - 1 || isFlipping}
              className="flex items-center gap-2 px-5 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-pill text-sm font-medium text-near-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-button"
            >
              <span className="hidden md:inline">下一页</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 快捷操作 - Mintlify 药丸按钮 */}
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => navigate('/diaries')}
            className="btn-primary"
          >
            管理日记
          </button>
          <button
            onClick={() => navigate('/display')}
            className="btn-brand"
          >
            查看展示
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
