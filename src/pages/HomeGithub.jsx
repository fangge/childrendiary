import React, { useState, useEffect } from 'react';
import { DateUtils } from '../utils/helpers';
import api from '../services/api';

const HomeGithub = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, grid
  const [selectedMonth, setSelectedMonth] = useState(DateUtils.getCurrentDate().substring(0, 7));

  // 加载所有用户
  useEffect(() => {
    loadUsers();
  }, []);

  // 当选择的用户改变时，加载该用户的日记
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
      // 默认选择第一个用户
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
      const data = await api.getDiaries(userId);
      setDiaries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
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

  const getCurrentUser = () => {
    return users.find(u => u.id === selectedUserId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">暂无用户数据</h2>
          <p className="text-gray-600">请在本地版本中添加用户和日记</p>
        </div>
      </div>
    );
  }

  const monthDiaries = getDiariesByMonth();
  const stats = getMonthlyStats();
  const currentUser = getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 - 用户选择器 */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {currentUser?.name} 的成长日记
              </h1>
              <p className="text-sm md:text-base text-gray-600">记录美好生活的每一天</p>
            </div>
            
            {/* 用户选择器 */}
            {users.length > 1 && (
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">切换用户:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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

        {/* 视图切换和月份选择 */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* 视图模式 */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                时间线
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                网格
              </button>
            </div>

            {/* 月份选择 */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">选择月份:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-indigo-600">{stats.total}</div>
              <div className="text-xs md:text-sm text-gray-600">篇日记</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.withImages}</div>
              <div className="text-xs md:text-sm text-gray-600">含图片</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.totalWords}</div>
              <div className="text-xs md:text-sm text-gray-600">总字数</div>
            </div>
          </div>
        </div>

        {/* 日记内容 */}
        {monthDiaries.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-xl">
            <svg className="w-16 h-16 md:w-24 md:h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">这个月还没有日记</h3>
            <p className="text-sm md:text-base text-gray-500">选择其他月份查看</p>
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

// 时间线视图组件
const TimelineView = ({ diaries }) => {
  return (
    <div className="relative">
      {/* 时间线 - 在移动端隐藏 */}
      <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-200"></div>

      <div className="space-y-6 md:space-y-8">
        {diaries.map((diary) => (
          <div key={diary.id} className="relative md:pl-20">
            {/* 时间点 - 在移动端隐藏 */}
            <div className="hidden md:block absolute left-5 top-0 w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-md"></div>

            {/* 日记卡片 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
              <div className="p-4 md:p-6">
                {/* 日期 */}
                <div className="text-sm md:text-base text-indigo-600 font-semibold mb-2">
                  {DateUtils.formatReadableDate(diary.date)}
                </div>

                {/* 标题 */}
                {diary.title && (
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
                    {diary.title}
                  </h3>
                )}

                {/* 内容 */}
                <div
                  className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 prose prose-sm max-w-none"
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
                        className="w-full h-32 md:h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {diaries.map((diary) => (
        <div
          key={diary.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
        >
          {/* 图片 */}
          {diary.images && diary.images.length > 0 && (
            <div className="relative h-40 md:h-48 bg-gray-100">
              <img
                src={diary.images[0]}
                alt="日记图片"
                className="w-full h-full object-cover"
              />
              {diary.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  +{diary.images.length - 1}
                </div>
              )}
            </div>
          )}

          <div className="p-4 md:p-6">
            {/* 日期 */}
            <div className="text-sm text-indigo-600 font-semibold mb-2">
              {DateUtils.formatReadableDate(diary.date)}
            </div>

            {/* 标题 */}
            {diary.title && (
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">
                {diary.title}
              </h3>
            )}

            {/* 内容 */}
            <div
              className="text-sm text-gray-700 line-clamp-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: diary.content }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeGithub;