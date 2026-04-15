import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../contexts/UserContext';
import { DateUtils, PrintUtils } from '../utils/helpers';
import api from '../services/api';

const DiaryDisplay = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedMonth, setSelectedMonth] = useState(DateUtils.getCurrentDate().substring(0, 7));

  useEffect(() => {
    if (currentUser) {
      loadDiaries();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadDiaries = async () => {
    try {
      setLoading(true);
      const data = await api.getDiaries();
      const userDiaries = data.filter(diary => diary.userId === currentUser.id);
      setDiaries(userDiaries.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    PrintUtils.print();
  };

  const getDiariesByMonth = () => {
    return diaries.filter(diary => diary.date.startsWith(selectedMonth));
  };

  const getMonthlyStats = () => {
    const monthDiaries = getDiariesByMonth();
    return {
      total: monthDiaries.length,
      withImages: monthDiaries.filter(d => d.images && d.images.length > 0).length,
      totalWords: monthDiaries.reduce((sum, d) => sum + d.content.length, 0)
    };
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center hero-gradient">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">请先选择用户</h2>
          <p className="text-gray-500 mb-6">需要选择一个用户才能查看日记</p>
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

  const monthDiaries = getDiariesByMonth();
  const stats = getMonthlyStats();

  return (
    <div className="py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>日记展示</h1>
            <p className="text-gray-500">{currentUser.name} 的成长记录</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              打印
            </button>
          </div>
        </div>

        {/* 视图切换和月份选择 */}
        <div className="card-mint mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* 视图模式 - 药丸按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
                  viewMode === 'timeline'
                    ? 'bg-near-black text-white shadow-button'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                时间线
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-near-black text-white shadow-button'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                网格
              </button>
            </div>

            {/* 月份选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-500">选择月份:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-[rgba(0,0,0,0.08)] rounded-pill focus:ring-brand focus:border-brand text-sm"
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)] grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-brand">{stats.total}</div>
              <div className="text-sm text-gray-400">篇日记</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-brand-deep">{stats.withImages}</div>
              <div className="text-sm text-gray-400">含图片</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-info-blue">{stats.totalWords}</div>
              <div className="text-sm text-gray-400">总字数</div>
            </div>
          </div>
        </div>

        {/* 日记内容 */}
        {monthDiaries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-featured border border-[rgba(0,0,0,0.05)]">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-near-black mb-2">这个月还没有日记</h3>
            <p className="text-gray-500">选择其他月份或创建新日记</p>
          </div>
        ) : viewMode === 'timeline' ? (
          <TimelineView diaries={monthDiaries} />
        ) : (
          <GridView diaries={monthDiaries} />
        )}
      </div>
    </div>
  );
};

// 时间线视图组件 - Mintlify 风格
const TimelineView = ({ diaries }) => {
  return (
    <div className="relative">
      {/* 时间线 - 品牌绿色 */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand/20"></div>

      <div className="space-y-8">
        {diaries.map((diary, index) => (
          <div key={diary.id} className="relative pl-20">
            {/* 时间点 - 品牌绿色圆点 */}
            <div className="absolute left-5 top-0 w-6 h-6 bg-brand rounded-full border-4 border-white shadow-button"></div>

            {/* 日记卡片 */}
            <div className="bg-white rounded-card border border-[rgba(0,0,0,0.05)] shadow-card hover:border-[rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden">
              <div className="p-6">
                {/* 日期 */}
                <div className="mb-2">
                  <span className="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-pill">
                    {DateUtils.formatReadableDate(diary.date)}
                  </span>
                </div>

                {/* 标题 */}
                {diary.title && (
                  <h3 className="text-xl font-semibold text-near-black tracking-tight mb-3" style={{ letterSpacing: '-0.2px' }}>
                    {diary.title}
                  </h3>
                )}

                {/* 内容 */}
                <div
                  className="text-gray-700 leading-relaxed mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: diary.content }}
                />

                {/* 图片 */}
                {diary.images && diary.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {diary.images.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt={`日记图片 ${imgIndex + 1}`}
                        className="w-full h-40 object-cover rounded-card border border-[rgba(0,0,0,0.05)] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 网格视图组件
const GridView = ({ diaries }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="bg-white rounded-card border border-[rgba(0,0,0,0.05)] shadow-card hover:border-[rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden"
        >
          {/* 图片 */}
          {diary.images && diary.images.length > 0 && (
            <div className="relative h-48 bg-gray-50">
              <img
                src={diary.images[0]}
                alt="日记图片"
                className="w-full h-full object-cover"
              />
              {diary.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-near-black/60 text-white text-xs px-2 py-1 rounded-pill">
                  +{diary.images.length - 1}
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {/* 日期标签 */}
            <div className="mb-2">
              <span className="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-pill">
                {DateUtils.formatReadableDate(diary.date)}
              </span>
            </div>

            {/* 标题 */}
            {diary.title && (
              <h3 className="text-lg font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.2px' }}>
                {diary.title}
              </h3>
            )}

            {/* 内容 */}
            <div
              className="text-gray-500 text-sm line-clamp-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: diary.content }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryDisplay;
