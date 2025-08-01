/**
 * API服务类 - 处理与后端的所有通信
 */
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }
  
  // 上传图片
  async uploadImage(file) {
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象');
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('只能上传图片文件');
    }
    
    // 验证文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`图片大小不能超过5MB (当前大小: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log(`开始上传图片: ${file.name} (${file.size} bytes)`);
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = '上传图片失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage += ` (HTTP ${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('图片上传成功:', result);
      return result;
    } catch (error) {
      console.error('上传图片错误:', error);
      throw error;
    }
  }

  // 通用请求方法
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '请求失败');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 用户相关API
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', 'POST', userData);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, 'PUT', userData);
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, 'DELETE');
  }

  // 日记相关API
  async getDiaries() {
    return this.request('/diaries');
  }

  async createDiary(diaryData) {
    return this.request('/diaries', 'POST', diaryData);
  }

  async updateDiary(diaryId, diaryData) {
    return this.request(`/diaries/${diaryId}`, 'PUT', diaryData);
  }

  async deleteDiary(diaryId) {
    return this.request(`/diaries/${diaryId}`, 'DELETE');
  }
}

// 创建单例实例
const apiService = new ApiService();
