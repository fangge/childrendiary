import React, { useState, useEffect } from 'react';
import { DateUtils } from '../utils/helpers';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import '../styles/book.css';

const HomeGithub = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [fullscreenDiary, setFullscreenDiary] = useState(null);
  const [fontSize, setFontSize] = useState(100);

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
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDiaries = () => {
    if (!selectedMonth) return diaries;
    return diaries.filter(diary => diary.date.startsWith(selectedMonth));
  };

  const getAvailableMonths = () => {
    const months = [...new Set(diaries.map(d => d.date.substring(0, 7)))];
    months.sort().reverse();
    return months;
  };

  const getAgeAtDate = (birthday, date) => {
    const birth = new Date(birthday);
    const target = new Date(date);
    let age = target.getFullYear() - birth.getFullYear();
    const monthDiff = target.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const getCurrentUser = () => {
    return users.find(u => u.id === selectedUserId);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center hero-gradient overflow-hidden">
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

  const filteredDiaries = getFilteredDiaries();

  if (filteredDiaries.length === 0 && diaries.length > 0) {
    const currentUser = getCurrentUser();
    return (
      <div className="h-full flex items-center justify-center hero-gradient p-4 overflow-hidden">
        <div className="text-center p-10 bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-near-black tracking-tight mb-3">该月份没有日记</h2>
          <p className="text-gray-500 mb-6">{currentUser?.name} 在所选月份没有记录日记</p>
          <div className="flex flex-col items-center gap-4">
            {users.length > 1 && (
              <div className="w-full">
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
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-500 mb-2">筛选月份:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-[rgba(0,0,0,0.08)] rounded-pill focus:ring-brand focus:border-brand bg-white text-sm"
              >
                <option value="">全部</option>
                {getAvailableMonths().map(month => (
                  <option key={month} value={month}>
                    {month.replace('-', '年') + '月'}
                  </option>
                ))}
              </select>
              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="mt-2 text-sm text-brand hover:text-brand-deep font-medium"
                >
                  清除月份筛选
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (diaries.length === 0) {
    const currentUser = getCurrentUser();
    return (
      <div className="h-full flex items-center justify-center hero-gradient p-4 overflow-hidden">
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

  const currentUser = getCurrentUser();

  return (
    <div className="h-full px-2 md:px-4 flex flex-col overflow-hidden">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* 头部信息 */}
        <div className="text-center shrink-0 pt-4 pb-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>
            {currentUser?.name} 的成长日记
          </h1>
          <p className="text-sm md:text-base text-gray-500">共 {filteredDiaries.length} 篇日记</p>
          
          {/* 用户选择器和月份筛选 */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {users.length > 1 && (
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-pill border border-[rgba(0,0,0,0.05)] shadow-card">
                <label className="text-sm font-medium text-gray-500">用户:</label>
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
            )}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-pill border border-[rgba(0,0,0,0.05)] shadow-card">
              <label className="text-sm font-medium text-gray-500">月份:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 border border-[rgba(0,0,0,0.08)] rounded-pill focus:ring-brand focus:border-brand bg-white text-sm"
              >
                <option value="">全部</option>
                {getAvailableMonths().map(month => (
                  <option key={month} value={month}>
                    {month.replace('-', '年') + '月'}
                  </option>
                ))}
              </select>
              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="text-sm text-brand hover:text-brand-deep font-medium"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 堆叠卡片展示 - Swiper EffectCards */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <Swiper
            effect="cards"
            modules={[EffectCards]}
            grabCursor={true}
            cardsEffect={{
              perSlideRotate: 1,
              perSlideOffset: 4,
              rotate: true,
              slideShadows: false,
            }}
            className="w-[320px] h-[480px] md:w-[360px] md:h-[540px]"
          >
            {filteredDiaries.map((diary) => (
              <SwiperSlide key={diary.id}>
                <div className="h-full bg-white rounded-card border border-[rgba(0,0,0,0.05)] overflow-hidden flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.10)]">
                  {/* 卡片头部图片区域 */}
                  {diary.images && diary.images.length > 0 ? (
                    <div className="relative h-48 shrink-0 overflow-hidden">
                      <img
                        src={diary.images[0]}
                        alt={diary.title || '日记'}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => window.open(diary.images[0], '_blank')}
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* 日期和年龄标签 - 叠加在图片上 */}
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-white bg-brand/90 backdrop-blur-sm px-2.5 py-1 rounded-pill">
                          {DateUtils.formatReadableDate(diary.date)}
                        </span>
                        {currentUser?.birthday && getAgeAtDate(currentUser.birthday, diary.date) !== null && (
                          <span className="text-[13px] font-medium text-white bg-[#c37d0d]/95 backdrop-blur-sm px-2.5 py-1 rounded-pill">
                            {getAgeAtDate(currentUser.birthday, diary.date)}岁
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFullscreenDiary(diary); }}
                          className="text-[13px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-pill hover:bg-black/60 transition-colors flex items-center gap-1"
                          title="全屏查看"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                          </svg>
                        </button>
                      </div>

                      {/* 标题叠加在图片上 */}
                      {diary.title && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-semibold text-white tracking-tight drop-shadow-lg" style={{ letterSpacing: '-0.2px' }}>
                            {diary.title}
                          </h3>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 无图片时的纯色头部 */
                    <div className="relative h-32 shrink-0 bg-gradient-to-br from-brand-light to-brand/20 flex flex-col justify-between p-5">
                      {/* 日期和年龄标签 */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-brand-deep bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-pill">
                          {DateUtils.formatReadableDate(diary.date)}
                        </span>
                        {currentUser?.birthday && getAgeAtDate(currentUser.birthday, diary.date) !== null && (
                          <span className="text-[13px] font-medium text-[#c37d0d] bg-[#fef3e0]/90 backdrop-blur-sm px-2.5 py-1 rounded-pill">
                            {getAgeAtDate(currentUser.birthday, diary.date)}岁
                          </span>
                        )}
                        <button
                          onClick={() => setFullscreenDiary(diary)}
                          className="text-[13px] font-medium text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-pill hover:bg-gray-100 transition-colors flex items-center gap-1"
                          title="全屏查看"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                          </svg>
                        </button>
                      </div>
                      {/* 标题 */}
                      {diary.title && (
                        <h3 className="text-xl font-semibold text-near-black tracking-tight" style={{ letterSpacing: '-0.2px' }}>
                          {diary.title}
                        </h3>
                      )}
                    </div>
                  )}

                  {/* 日记内容 */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div
                      className="text-sm md:text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: diary.content }}
                    />
                  </div>

                  {/* 更多图片缩略图 */}
                  {diary.images && diary.images.length > 1 && (
                    <div className="px-5 pb-4 flex gap-2">
                      {diary.images.slice(1, 4).map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`日记图片 ${imgIndex + 2}`}
                          className="w-14 h-14 object-cover rounded-lg border border-[rgba(0,0,0,0.05)] cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                      {diary.images.length > 4 && (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-[rgba(0,0,0,0.05)] flex items-center justify-center text-xs text-gray-400">
                          +{diary.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 页码指示器 */}
        <div className="text-center mt-3 mb-2 shrink-0">
          <p className="text-sm text-gray-400">
            左右滑动查看更多 · 共 {filteredDiaries.length} 篇
          </p>
        </div>
      </div>

      {/* 全屏查看弹窗 */}
      {fullscreenDiary && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* 顶部工具栏 */}
          <div className="shrink-0 px-4 py-3 border-b border-[rgba(0,0,0,0.05)] flex items-center justify-between bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {/* 日期和年龄 */}
              <span className="text-sm font-medium text-gray-600">
                {DateUtils.formatReadableDate(fullscreenDiary.date)}
              </span>
              {currentUser?.birthday && getAgeAtDate(currentUser.birthday, fullscreenDiary.date) !== null && (
                <span className="text-[13px] font-medium text-[#c37d0d] bg-[#fef3e0] px-2.5 py-1 rounded-pill">
                  {getAgeAtDate(currentUser.birthday, fullscreenDiary.date)}岁
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 字体缩小按钮 */}
              <button
                onClick={() => setFontSize(Math.max(60, fontSize - 10))}
                disabled={fontSize <= 60}
                className="w-8 h-8 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="缩小字体"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              {/* 字体大小显示 */}
              <span className="text-xs text-gray-400 min-w-[36px] text-center">{fontSize}%</span>
              {/* 字体放大按钮 */}
              <button
                onClick={() => setFontSize(Math.min(200, fontSize + 10))}
                disabled={fontSize >= 200}
                className="w-8 h-8 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="放大字体"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {/* 分隔线 */}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {/* 关闭按钮 */}
              <button
                onClick={() => { setFullscreenDiary(null); setFontSize(100); }}
                className="w-8 h-8 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-near-black transition-colors"
                title="关闭"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 全屏内容区域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 md:p-10" style={{ fontSize: `${fontSize}%` }}>
              {/* 图片展示 */}
              {fullscreenDiary.images && fullscreenDiary.images.length > 0 && (
                <div className="mb-6 space-y-3">
                  {fullscreenDiary.images.map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image}
                      alt={`日记图片 ${imgIndex + 1}`}
                      className="w-full max-h-[400px] object-cover rounded-2xl border border-[rgba(0,0,0,0.05)] cursor-pointer"
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* 标题 */}
              {fullscreenDiary.title && (
                <h2 className="text-2xl md:text-3xl font-semibold text-near-black tracking-tight mb-5" style={{ letterSpacing: '-0.3px' }}>
                  {fullscreenDiary.title}
                </h2>
              )}

              {/* 内容 */}
              <div
                className="text-gray-700 leading-relaxed prose prose-base max-w-none [&_p]:mb-4 [&_p]:leading-[1.7]"
                dangerouslySetInnerHTML={{ __html: fullscreenDiary.content }}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HomeGithub;
