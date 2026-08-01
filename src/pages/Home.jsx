import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiaryDeck from '../components/DiaryDeck';
import { useCurrentUser } from '../contexts/UserContext';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiaries = async () => {
      if (!currentUser) {
        setDiaries([]);
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

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card-mint text-center max-w-md">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-brand mb-3">Choose a profile</p>
          <h2 className="text-2xl font-semibold text-near-black mb-3">先选择一位家庭成员</h2>
          <p className="text-gray-500 mb-6">选择用户后即可浏览属于他的成长档案。</p>
          <button onClick={() => navigate('/users')} className="btn-primary">前往用户管理</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">正在整理日记卡片...</div>;
  }

  return (
    <div className="py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-brand mb-2">Family archive</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-near-black">{currentUser.name} 的成长日记</h1>
          <p className="text-gray-500 mt-2">共 {diaries.length} 篇，滚动或拖动卡片继续浏览</p>
        </div>
        <button onClick={() => navigate('/diaries')} className="btn-primary">写日记</button>
      </div>
      <DiaryDeck diaries={diaries} currentUser={currentUser} />
    </div>
  );
};

export default Home;
