import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryDeck from '../components/DiaryDeck';
import { useCurrentUser } from '../contexts/UserContext';
import { PrintUtils } from '../utils/helpers';
import api from '../services/api';

const DiaryDisplay = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiaries = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getDiaries();
        setDiaries(
          data
            .filter((diary) => diary.userId === currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      } catch (error) {
        console.error('加载日记失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiaries();
  }, [currentUser]);

  const months = useMemo(
    () => [...new Set(diaries.map((diary) => diary.date.slice(0, 7)))].sort().reverse(),
    [diaries]
  );
  const visibleDiaries = selectedMonth
    ? diaries.filter((diary) => diary.date.startsWith(selectedMonth))
    : diaries;

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card-mint text-center max-w-md">
          <h2 className="text-2xl font-semibold text-near-black mb-3">请先选择用户</h2>
          <p className="text-gray-500 mb-6">需要选择一个用户才能查看日记。</p>
          <button onClick={() => navigate('/users')} className="btn-primary">前往用户管理</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">正在加载日记档案...</div>;
  }

  return (
    <div className="py-4 md:py-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-brand mb-2">Diary collection</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-near-black">日记展示</h1>
          <p className="text-gray-500 mt-2">{currentUser.name} · {visibleDiaries.length} 篇日记</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="display-month">筛选月份</label>
          <select id="display-month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="px-4 py-2.5 rounded-pill text-sm">
            <option value="">全部月份</option>
            {months.map((month) => <option key={month} value={month}>{month.replace('-', '年')}月</option>)}
          </select>
          <button type="button" onClick={PrintUtils.print} className="btn-secondary">打印</button>
        </div>
      </div>
      <DiaryDeck diaries={visibleDiaries} currentUser={currentUser} />
    </div>
  );
};

export default DiaryDisplay;
