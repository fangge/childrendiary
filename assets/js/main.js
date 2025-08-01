// 数据存储管理
const DiaryStorage = {
  // 用户缓存
  _usersCache: null,
  _diariesCache: null,
  
  // 获取所有用户
  async getUsers() {
    try {
      // 每次都从API获取最新数据
      this._usersCache = await apiService.getUsers();
      return this._usersCache;
    } catch (error) {
      console.error('获取用户失败:', error);
      // 如果API请求失败但缓存有数据，返回缓存数据
      return this._usersCache || [];
    }
  },

  // 同步获取用户（用于不支持异步的场景）
  getUsersSync() {
    return this._usersCache || [];
  },

  // 保存用户
  async saveUser(user) {
    try {
      const savedUser = await apiService.createUser(user);
      // 更新缓存
      if (this._usersCache) {
        this._usersCache.push(savedUser);
      }
      return savedUser;
    } catch (error) {
      console.error('保存用户失败:', error);
      throw error;
    }
  },

  // 更新用户
  async updateUser(userId, updatedUser) {
    try {
      const result = await apiService.updateUser(userId, updatedUser);
      // 更新缓存
      if (this._usersCache) {
        const index = this._usersCache.findIndex(user => user.id === userId);
        if (index !== -1) {
          this._usersCache[index] = { ...this._usersCache[index], ...updatedUser };
        }
      }
      return true;
    } catch (error) {
      console.error('更新用户失败:', error);
      return false;
    }
  },

  // 删除用户
  async deleteUser(userId) {
    try {
      await apiService.deleteUser(userId);
      // 更新缓存
      if (this._usersCache) {
        this._usersCache = this._usersCache.filter(user => user.id !== userId);
      }
      if (this._diariesCache) {
        this._diariesCache = this._diariesCache.filter(diary => diary.userId !== userId);
      }
      return true;
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    }
  },

  // 获取所有日记
  async getDiaries() {
    try {
      // 每次都从API获取最新数据
      this._diariesCache = await apiService.getDiaries();
      return this._diariesCache;
    } catch (error) {
      console.error('获取日记失败:', error);
      // 如果API请求失败但缓存有数据，返回缓存数据
      return this._diariesCache || [];
    }
  },

  // 同步获取日记（用于不支持异步的场景）
  getDiariesSync() {
    return this._diariesCache || [];
  },

  // 保存日记
  async saveDiary(diary) {
    try {
      const savedDiary = await apiService.createDiary(diary);
      // 更新缓存
      if (this._diariesCache) {
        this._diariesCache.push(savedDiary);
      }
      return savedDiary;
    } catch (error) {
      console.error('保存日记失败:', error);
      throw error;
    }
  },

  // 更新日记
  async updateDiary(diaryId, updatedDiary) {
    try {
      const result = await apiService.updateDiary(diaryId, updatedDiary);
      // 更新缓存
      if (this._diariesCache) {
        const index = this._diariesCache.findIndex(diary => diary.id === diaryId);
        if (index !== -1) {
          this._diariesCache[index] = { ...this._diariesCache[index], ...updatedDiary };
        }
      }
      return true;
    } catch (error) {
      console.error('更新日记失败:', error);
      return false;
    }
  },

  // 删除日记
  async deleteDiary(diaryId) {
    try {
      await apiService.deleteDiary(diaryId);
      // 更新缓存
      if (this._diariesCache) {
        this._diariesCache = this._diariesCache.filter(diary => diary.id !== diaryId);
      }
      return true;
    } catch (error) {
      console.error('删除日记失败:', error);
      return false;
    }
  },

  // 根据用户ID和日期范围获取日记
  async getDiariesByUserAndDateRange(userId, startDate, endDate) {
    try {
      const diaries = await this.getDiaries();
      return diaries.filter(diary => {
        const diaryDate = new Date(diary.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        const matchesUser = userId ? diary.userId === userId : true;
        const matchesStartDate = start ? diaryDate >= start : true;
        const matchesEndDate = end ? diaryDate <= end : true;
        
        return matchesUser && matchesStartDate && matchesEndDate;
      });
    } catch (error) {
      console.error('筛选日记失败:', error);
      return [];
    }
  },
  
  // 清除缓存
  clearCache() {
    this._usersCache = null;
    this._diariesCache = null;
  }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // 加载初始数据
    const users = await DiaryStorage.getUsers();
    
    // 检查是否有示例数据，如果没有则添加
    if (users.length === 0) {
      // 添加示例用户
      const user1 = await DiaryStorage.saveUser({ name: '张三', gender: '男' });
      const user2 = await DiaryStorage.saveUser({ name: '李四', gender: '女' });
      
      // 添加示例日记
      await DiaryStorage.saveDiary({
        userId: user1.id,
        date: '2025-08-01',
        title: '美好的一天',
        content: '<p>今天天气真好，我去公园散步了。看到了很多小动物，心情非常愉快。</p>'
      });
      
      await DiaryStorage.saveDiary({
        userId: user2.id,
        date: '2025-08-01',
        title: '工作日记',
        content: '<p>今天完成了一个重要的项目，团队合作非常愉快。</p>'
      });
    }
  } catch (error) {
    console.error('初始化应用失败:', error);
  }
});

// 工具函数
const DiaryUtils = {
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    return dayjs(date).format('YYYY-MM-DD');
  },
  
  // 获取当前日期
  getCurrentDate() {
    return dayjs().format('YYYY-MM-DD');
  },
  
  // 打印日记
  printDiary() {
    window.print();
  }
};
