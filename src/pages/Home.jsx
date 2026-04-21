import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../contexts/UserContext';
import { DateUtils } from '../utils/helpers';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import '../styles/book.css';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenDiary, setFullscreenDiary] = useState(null);
  const [fontSize, setFontSize] = useState(100);

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

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center hero-gradient overflow-hidden">
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
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (diaries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center hero-gradient p-4 overflow-hidden">
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

  return (
    <div className="h-full px-2 md:px-4 flex flex-col overflow-hidden">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* 头部信息 - Mintlify 风格 */}
        <div className="text-center shrink-0 pt-4 pb-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>
            {currentUser.name} 的成长日记
          </h1>
          <p className="text-gray-500">共 {diaries.length} 篇日记</p>
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
            {diaries.map((diary) => (
              <SwiperSlide key={diary.id}>
                <div className="h-full bg-white rounded-card border border-[rgba(0,0,0,0.05)] overflow-hidden flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.10)]">
                  {/* 卡片头部图片区域 */}
                  {diary.images && diary.images.length > 0 ? (
                    <div className="relative h-48 shrink-0 overflow-hidden">
                      <img
                        src={diary.images[0]}
                        alt={diary.title || '日记'}
                        className="w-full h-full object-cover"
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* 日期和年龄标签 - 叠加在图片上 */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap items-center">
                        <span className="text-[12px] font-medium text-white bg-brand/90 backdrop-blur-sm px-2 py-0.5 rounded-pill whitespace-nowrap">
                          {DateUtils.formatReadableDate(diary.date)}
                        </span>
                        {currentUser.birthday && getAgeAtDate(currentUser.birthday, diary.date) !== null && (
                          <span className="text-[12px] font-medium text-white bg-[#c37d0d]/95 backdrop-blur-sm px-2 py-0.5 rounded-pill whitespace-nowrap">
                            {getAgeAtDate(currentUser.birthday, diary.date)}岁
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFullscreenDiary(diary); }}
                          className="text-[12px] font-medium text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full hover:bg-black/60 transition-colors flex items-center gap-0.5"
                          title="全屏查看"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <span className="text-[12px] font-medium text-brand-deep bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-pill whitespace-nowrap">
                          {DateUtils.formatReadableDate(diary.date)}
                        </span>
                        {currentUser.birthday && getAgeAtDate(currentUser.birthday, diary.date) !== null && (
                          <span className="text-[12px] font-medium text-[#c37d0d] bg-[#fef3e0]/90 backdrop-blur-sm px-2 py-0.5 rounded-pill whitespace-nowrap">
                            {getAgeAtDate(currentUser.birthday, diary.date)}岁
                          </span>
                        )}
                        <button
                          onClick={() => setFullscreenDiary(diary)}
                          className="text-[12px] font-medium text-gray-500 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-0.5"
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
                      className="text-gray-700 leading-relaxed prose prose-sm max-w-none text-sm [&_p]:mb-3 [&_p]:leading-[1.5]"
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
                          className="w-14 h-14 object-cover rounded-lg border border-[rgba(0,0,0,0.05)]"
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
            左右滑动查看更多 · 共 {diaries.length} 篇
          </p>
        </div>

        {/* 快捷操作 - Mintlify 药丸按钮 */}
        <div className="flex justify-center gap-3 pb-4 shrink-0">
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

      {/* 全屏查看弹窗 */}
      {fullscreenDiary && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* 顶部工具栏 */}
          <div className="shrink-0 px-3 py-2.5 border-b border-[rgba(0,0,0,0.05)] flex items-center justify-between bg-white/95 backdrop-blur-sm gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* 日期 */}
              <span className="text-xs font-medium text-gray-600 truncate">
                {DateUtils.formatReadableDate(fullscreenDiary.date)}
              </span>
              {currentUser.birthday && getAgeAtDate(currentUser.birthday, fullscreenDiary.date) !== null && (
                <span className="text-[11px] font-medium text-[#c37d0d] bg-[#fef3e0] px-1.5 py-0.5 rounded-pill shrink-0">
                  {getAgeAtDate(currentUser.birthday, fullscreenDiary.date)}岁
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* 字体缩小按钮 */}
              <button
                onClick={() => setFontSize(Math.max(60, fontSize - 10))}
                disabled={fontSize <= 60}
                className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="缩小字体"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              {/* 字体大小显示 */}
              <span className="text-[11px] text-gray-400 min-w-[32px] text-center">{fontSize}%</span>
              {/* 字体放大按钮 */}
              <button
                onClick={() => setFontSize(Math.min(200, fontSize + 10))}
                disabled={fontSize >= 200}
                className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="放大字体"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {/* 分隔线 */}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {/* 关闭按钮 */}
              <button
                onClick={() => { setFullscreenDiary(null); setFontSize(100); }}
                className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-near-black transition-colors"
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
                      className="w-full max-h-[400px] object-cover rounded-2xl border border-[rgba(0,0,0,0.05)]"
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
  );
};

export default Home;
