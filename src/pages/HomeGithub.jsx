import React, { useEffect, useMemo, useState } from 'react';
import DiaryDeck from '../components/DiaryDeck';
import api from '../services/api';

const HomeGithub = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
        if (data.length) setSelectedUserId(data[0].id);
        else setLoading(false);
      } catch (error) {
        console.error('加载用户失败:', error);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const loadDiaries = async () => {
      try {
        setLoading(true);
        const data = await api.getDiaries();
        setDiaries(
          data
            .filter((diary) => diary.userId === selectedUserId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
        setSelectedMonth('');
      } catch (error) {
        console.error('加载日记失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiaries();
  }, [selectedUserId]);

  const currentUser = users.find((user) => user.id === selectedUserId);
  const months = useMemo(
    () => [...new Set(diaries.map((diary) => diary.date.slice(0, 7)))].sort().reverse(),
    [diaries]
  );
  const visibleDiaries = selectedMonth
    ? diaries.filter((diary) => diary.date.startsWith(selectedMonth))
    : diaries;

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">正在加载家庭日记...</div>;
  }

  if (!users.length) {
    return <div className="card-mint text-center max-w-md mx-auto my-20"><h2 className="text-2xl text-near-black mb-3">暂无用户数据</h2><p className="text-gray-500">请在本地版本添加用户和日记。</p></div>;
  }

  return (
    <div className="py-4 md:py-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-brand mb-2">Family archive</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-near-black">{currentUser?.name} 的成长日记</h1>
          <p className="text-gray-500 mt-2">{visibleDiaries.length} 篇记录 · 无限循环浏览</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="github-user">切换用户</label>
          <select id="github-user" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="px-4 py-2.5 rounded-pill text-sm">
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="github-month">筛选月份</label>
          <select id="github-month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="px-4 py-2.5 rounded-pill text-sm">
            <option value="">全部月份</option>
            {months.map((month) => <option key={month} value={month}>{month.replace('-', '年')}月</option>)}
          </select>
        </div>
      </div>
      <DiaryDeck diaries={visibleDiaries} currentUser={currentUser} />
    </div>
  );
};

export default HomeGithub;
