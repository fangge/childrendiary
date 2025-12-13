import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * 数据存储管理 Hook
 */
export function useStorage() {
  const [users, setUsers] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取所有用户
  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      console.error('获取用户失败:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存用户
  const saveUser = useCallback(async (user) => {
    try {
      setLoading(true);
      setError(null);
      const savedUser = await apiService.createUser(user);
      setUsers(prev => [...prev, savedUser]);
      return savedUser;
    } catch (err) {
      console.error('保存用户失败:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新用户
  const updateUser = useCallback(async (userId, updatedUser) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updateUser(userId, updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updatedUser } : user
      ));
      return true;
    } catch (err) {
      console.error('更新用户失败:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除用户
  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setDiaries(prev => prev.filter(diary => diary.userId !== userId));
      return true;
    } catch (err) {
      console.error('删除用户失败:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取所有日记
  const getDiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDiaries();
      setDiaries(data);
      return data;
    } catch (err) {
      console.error('获取日记失败:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存日记
  const saveDiary = useCallback(async (diary) => {
    try {
      setLoading(true);
      setError(null);
      const savedDiary = await apiService.createDiary(diary);
      setDiaries(prev => [...prev, savedDiary]);
      return savedDiary;
    } catch (err) {
      console.error('保存日记失败:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新日记
  const updateDiary = useCallback(async (diaryId, updatedDiary) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updateDiary(diaryId, updatedDiary);
      setDiaries(prev => prev.map(diary => 
        diary.id === diaryId ? { ...diary, ...updatedDiary } : diary
      ));
      return true;
    } catch (err) {
      console.error('更新日记失败:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除日记
  const deleteDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteDiary(diaryId);
      setDiaries(prev => prev.filter(diary => diary.id !== diaryId));
      return true;
    } catch (err) {
      console.error('删除日记失败:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据用户ID和日期范围获取日记
  const getDiariesByUserAndDateRange = useCallback((userId, startDate, endDate) => {
    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      const matchesUser = userId ? diary.userId === userId : true;
      const matchesStartDate = start ? diaryDate >= start : true;
      const matchesEndDate = end ? diaryDate <= end : true;
      
      return matchesUser && matchesStartDate && matchesEndDate;
    });
  }, [diaries]);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        const usersData = await getUsers();
        await getDiaries();
        
        // 如果没有用户，添加示例数据
        if (usersData.length === 0) {
          const user1 = await saveUser({ name: '张三', gender: '男' });
          const user2 = await saveUser({ name: '李四', gender: '女' });
          
          await saveDiary({
            userId: user1.id,
            date: '2025-08-01',
            title: '美好的一天',
            content: '<p>今天天气真好，我去公园散步了。看到了很多小动物，心情非常愉快。</p>'
          });
          
          await saveDiary({
            userId: user2.id,
            date: '2025-08-01',
            title: '工作日记',
            content: '<p>今天完成了一个重要的项目，团队合作非常愉快。</p>'
          });
        }
      } catch (err) {
        console.error('初始化数据失败:', err);
      }
    };

    initData();
  }, []); // 只在组件挂载时执行一次

  return {
    users,
    diaries,
    loading,
    error,
    getUsers,
    saveUser,
    updateUser,
    deleteUser,
    getDiaries,
    saveDiary,
    updateDiary,
    deleteDiary,
    getDiariesByUserAndDateRange
  };
}