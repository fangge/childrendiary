/**
 * API服务类 - 处理与后端的所有通信
 * 在GitHub Pages环境中从静态JSON文件获取数据
 */
class ApiService {
  constructor() {
    // 检测是否在GitHub Pages环境中
    this.isGitHubPages = window.location.hostname.includes('github.io');
    this.baseUrl = 'http://localhost:3001/api';
    
    // 设置静态数据路径
    if (this.isGitHubPages) {
      // 在GitHub Pages环境中，使用相对路径
      this.staticDataPath = './data';
    } else {
      // 在本地开发环境中，使用相对路径
      const currentPath = window.location.pathname;
      console.log('当前页面路径:', currentPath);
      
      // 根据当前页面路径确定正确的相对路径
      if (currentPath.includes('/pages/')) {
        // 如果是在pages目录下的页面，需要多上一级目录
        this.staticDataPath = '../../server/data';
      } else {
        // 如果是在根目录下的页面
        this.staticDataPath = './server/data';
      }
      
      console.log('本地开发环境：使用静态数据路径:', this.staticDataPath);
    }
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
    
    // 在GitHub Pages环境中，由于无法保存文件，返回一个模拟的成功响应
    if (this.isGitHubPages) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const imageId = `img_${Date.now()}`;
            resolve({
              success: true,
              imageId: imageId,
              url: reader.result // 返回Base64编码的图片数据
            });
          } catch (error) {
            reject(new Error('处理图片失败: ' + error.message));
          }
        };
        reader.onerror = () => reject(new Error('读取图片失败'));
        reader.readAsDataURL(file);
      });
    }
    
    // 在非GitHub Pages环境中，使用API上传图片
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
    // 在GitHub Pages环境中，从静态JSON文件获取数据
    if (this.isGitHubPages) {
      return this.handleStaticDataRequest(endpoint, method, data);
    }
    
    // 在非GitHub Pages环境中，使用真实API
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
      console.log(`发送请求到: ${url}`, { method, data });
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorMessage = `请求失败: HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // 如果无法解析JSON，使用默认错误消息
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`请求成功: ${url}`, result);
      return result;
    } catch (error) {
      console.error(`API请求错误 (${url}):`, error);
      
      // 如果服务器连接失败，尝试从本地JSON文件获取数据（开发环境备用方案）
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('服务器连接失败，尝试从本地JSON文件获取数据');
        return this.handleStaticDataRequest(endpoint, method, data);
      }
      
      throw error;
    }
  }
  
  // 处理静态数据请求
  async handleStaticDataRequest(endpoint, method, data) {
    // 只允许GET请求
    if (method !== 'GET') {
      return { success: false, error: `GitHub Pages环境只支持GET请求` };
    }

    // 只在GitHub Pages环境下生效
    if (!this.isGitHubPages) {
      throw new Error('本地开发环境不应调用handleStaticDataRequest');
    }

    // 只读静态json
    if (endpoint === '/users') {
      const response = await fetch(`${this.staticDataPath}/users.json`);
      if (!response.ok) throw new Error(`获取用户数据失败: ${response.status}`);
      const data = await response.json();
      return data.users || [];
    }
    if (endpoint === '/diaries') {
      const response = await fetch(`${this.staticDataPath}/diaries.json`);
      if (!response.ok) throw new Error(`获取日记数据失败: ${response.status}`);
      const data = await response.json();
      return data.diaries || [];
    }
    return { success: false, error: '不支持的请求' };
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
