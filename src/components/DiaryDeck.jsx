import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules';
import { DateUtils, StringUtils } from '../utils/helpers';
import { getInitialIndex, modulo } from '../utils/diaryDeckCore';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import '../styles/diary-deck.css';

const DiaryDeck = ({
  diaries = [],
  selectedDiaryId,
  onSelect,
  userName,
  currentUser
}) => {
  const [selectedIndex, setSelectedIndex] = useState(() => getInitialIndex(diaries, selectedDiaryId));
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const selectedIndexRef = useRef(selectedIndex);
  const swiperRef = useRef(null);
  const pendingDetailsOpen = useRef(false);
  const closeButtonRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const timelineItemsRef = useRef(new Map());
  const dialogTitleId = useId();

  const selectDiary = useCallback((index, notify = true) => {
    if (!diaries.length) return;
    const nextIndex = modulo(index, diaries.length);
    selectedIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
    if (notify) onSelect?.(diaries[nextIndex]);
  }, [diaries, onSelect]);

  useEffect(() => {
    if (!diaries.length) {
      selectedIndexRef.current = 0;
      setSelectedIndex(0);
      return;
    }

    const selectedFromProps = selectedDiaryId === undefined
      ? -1
      : diaries.findIndex((diary) => diary.id === selectedDiaryId);
    const nextIndex = selectedFromProps >= 0
      ? selectedFromProps
      : modulo(selectedIndexRef.current, diaries.length);

    selectDiary(nextIndex, false);
    if (swiperRef.current && swiperRef.current.realIndex !== nextIndex) {
      swiperRef.current.slideToLoop(nextIndex, 0, false);
    }
  }, [diaries, selectedDiaryId, selectDiary]);

  const handleSwiper = useCallback((swiper) => {
    swiperRef.current = swiper;
    if (diaries.length > 1) {
      swiper.slideToLoop(selectedIndexRef.current, 0, false);
    }
  }, [diaries.length]);

  const handleSlideChange = useCallback((swiper) => {
    selectDiary(swiper.realIndex);
  }, [selectDiary]);

  const handleSlideChangeTransitionEnd = useCallback((swiper) => {
    if (pendingDetailsOpen.current && swiper.realIndex === selectedIndexRef.current) {
      pendingDetailsOpen.current = false;
      setIsDetailsOpen(true);
    }
  }, []);

  const handleCardClick = useCallback((index) => {
    if (!swiperRef.current) return;
    if (swiperRef.current.realIndex === index) {
      setIsDetailsOpen(true);
      return;
    }
    pendingDetailsOpen.current = true;
    swiperRef.current.slideToLoop(index);
  }, []);

  useEffect(() => {
    if (!isDetailsOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsDetailsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDetailsOpen]);

  useEffect(() => {
    const timeline = timelineScrollRef.current;
    const activeItem = timelineItemsRef.current.get(selectedIndex);
    if (!timeline || !activeItem) return;
    const timelineRect = timeline.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const delta = (activeRect.left + activeRect.right - timelineRect.left - timelineRect.right) / 2;
    timeline.scrollTo({ left: timeline.scrollLeft + delta, behavior: 'smooth' });
  }, [selectedIndex]);

  if (!diaries.length) {
    return (
      <section className="diary-deck diary-deck--empty" aria-label="日记卡片">
        <div className="diary-deck__empty-state">
          <span className="diary-deck__empty-mark" aria-hidden="true">+</span>
          <h2>还没有日记</h2>
          <p>写下第一篇成长记录，它会出现在这里。</p>
        </div>
      </section>
    );
  }

  const selectedDiary = diaries[selectedIndex] || diaries[0];
  const displayName = userName || currentUser?.name;

  return (
    <section className="diary-deck" aria-label={`${displayName ? `${displayName}的` : ''}日记卡片`}>
      <div className="diary-deck__stage">
        <div className="diary-deck__glow" aria-hidden="true" />
        <div className="diary-deck__timeline" aria-label="日记时间轴">
          <div ref={timelineScrollRef} className="diary-deck__timeline-scroll">
            <div className="diary-deck__timeline-track" aria-hidden="true" />
            <div className="diary-deck__timeline-items">
              {diaries.map((diary, diaryIndex) => (
                <button
                  key={diary.id}
                  ref={(element) => {
                    if (element) timelineItemsRef.current.set(diaryIndex, element);
                    else timelineItemsRef.current.delete(diaryIndex);
                  }}
                  className={`diary-deck__timeline-item ${selectedIndex === diaryIndex ? 'is-active' : ''}`}
                  type="button"
                  aria-current={selectedIndex === diaryIndex ? 'date' : undefined}
                  aria-label={`定位到${DateUtils.formatReadableDate(diary.date)}的日记`}
                  onClick={() => {
                    pendingDetailsOpen.current = false;
                    if (swiperRef.current?.realIndex === diaryIndex) return;
                    swiperRef.current?.slideToLoop(diaryIndex);
                  }}
                >
                  <span className="diary-deck__timeline-dot" aria-hidden="true" />
                  <span className="diary-deck__timeline-year">{diary.date.slice(0, 4)}</span>
                  <span className="diary-deck__timeline-date">{diary.date.slice(5).replace('-', '.')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Swiper
          className="diary-deck__swiper"
          modules={[EffectCoverflow, Mousewheel, Keyboard, A11y]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 64,
            stretch: 20,
            depth: 155,
            modifier: 1,
            scale: 0.88,
            slideShadows: false
          }}
          breakpoints={{
            701: {
              coverflowEffect: {
                rotate: 66,
                stretch: 40,
                depth: 182,
                modifier: 1.04,
                scale: 0.9,
                slideShadows: false
              }
            }
          }}
          centeredSlides
          slidesPerView="auto"
          initialSlide={selectedIndex}
          loop={diaries.length > 1}
          speed={640}
          grabCursor
          watchSlidesProgress
          resistance
          resistanceRatio={0.72}
          threshold={4}
          longSwipesRatio={0.18}
          longSwipesMs={260}
          mousewheel={{
            forceToAxis: false,
            sensitivity: 0.7,
            thresholdDelta: 10,
            thresholdTime: 70
          }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true, containerMessage: '循环日记卡片组' }}
          onSwiper={handleSwiper}
          onSlideChange={handleSlideChange}
          onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
        >
          {diaries.map((diary, diaryIndex) => {
            const title = diary.title || DateUtils.formatReadableDate(diary.date);
            const image = diary.images?.[0];

            return (
              <SwiperSlide
                key={diary.id}
                className="diary-deck__slide"
                role="option"
                aria-label={`${title}，${DateUtils.formatReadableDate(diary.date)}`}
                aria-selected={selectedIndex === diaryIndex}
                onClick={() => handleCardClick(diaryIndex)}
              >
                <article className="diary-deck__card">
                  <div className="diary-deck__card-surface">
                    {image && <img className="diary-deck__card-image" src={image} alt={`${title}配图`} />}
                    <span className="diary-deck__card-date">{diary.date}</span>
                    <span className="diary-deck__card-title">{title}</span>
                    <span className="diary-deck__card-dot" aria-hidden="true" />
                    <span className="diary-deck__card-index">{String(diaryIndex + 1).padStart(2, '0')}</span>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          className="diary-deck__nav diary-deck__nav--previous"
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="上一则日记"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          className="diary-deck__nav diary-deck__nav--next"
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="下一则日记"
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>

      {isDetailsOpen && (
        <div
          className="diary-deck__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsDetailsOpen(false);
          }}
        >
          <div
            className="diary-deck__details diary-deck__details--modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-live="polite"
          >
            <button
              ref={closeButtonRef}
              className="diary-deck__details-close"
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              aria-label="关闭日记详情"
              title="关闭日记详情"
            >
              <span aria-hidden="true">&#10005;</span>
            </button>
            <div className="diary-deck__details-heading">
              <div>
                <span className="diary-deck__eyebrow">SELECTED ENTRY · {selectedDiary.date}</span>
                <h2 id={dialogTitleId}>{selectedDiary.title || '无标题日记'}</h2>
              </div>
              <time dateTime={selectedDiary.date}>{DateUtils.formatReadableDate(selectedDiary.date)}</time>
            </div>
            <div className="diary-deck__details-meta">
              {displayName && <span>{displayName}</span>}
              <span>{selectedDiary.images?.length || 0} 张图片</span>
              <span>{Math.max(1, Math.ceil(StringUtils.stripHtml(selectedDiary.content || '').length / 300))} 分钟阅读</span>
            </div>
            <div className="diary-deck__details-content" dangerouslySetInnerHTML={{ __html: selectedDiary.content || '<p>这篇日记还没有正文。</p>' }} />
            {selectedDiary.images?.length > 0 && (
              <div className="diary-deck__details-images">
                {selectedDiary.images.map((image, imageIndex) => (
                  <img key={`${selectedDiary.id}-image-${imageIndex}`} src={image} alt={`${selectedDiary.title || '日记'}配图 ${imageIndex + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DiaryDeck;
