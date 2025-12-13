import dayjs from 'dayjs';

/**
 * 日期工具函数
 */
export const DateUtils = {
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    return dayjs(date).format('YYYY-MM-DD');
  },
  
  // 获取当前日期
  getCurrentDate() {
    return dayjs().format('YYYY-MM-DD');
  },
  
  // 格式化日期为可读格式
  formatReadableDate(date) {
    return dayjs(date).format('YYYY年MM月DD日');
  },
  
  // 比较两个日期
  isSameDate(date1, date2) {
    return dayjs(date1).isSame(dayjs(date2), 'day');
  },
  
  // 检查日期是否在范围内
  isDateInRange(date, startDate, endDate) {
    const d = dayjs(date);
    const start = startDate ? dayjs(startDate) : null;
    const end = endDate ? dayjs(endDate) : null;
    
    if (start && d.isBefore(start, 'day')) return false;
    if (end && d.isAfter(end, 'day')) return false;
    return true;
  }
};

/**
 * 打印工具函数
 */
export const PrintUtils = {
  // 打印当前页面
  print() {
    window.print();
  },
  
  // 打印指定元素
  printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`找不到ID为 ${elementId} 的元素`);
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>打印</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};

/**
 * 验证工具函数
 */
export const ValidationUtils = {
  // 验证必填字段
  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  // 验证日期格式
  isValidDate(dateString) {
    return dayjs(dateString).isValid();
  },
  
  // 验证文件类型
  isValidImageFile(file) {
    if (!file) return false;
    return file.type.startsWith('image/');
  },
  
  // 验证文件大小
  isValidFileSize(file, maxSizeMB = 5) {
    if (!file) return false;
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  }
};

/**
 * 本地存储工具函数
 */
export const StorageUtils = {
  // 保存到localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存到localStorage失败:', error);
      return false;
    }
  },
  
  // 从localStorage获取
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('从localStorage获取失败:', error);
      return defaultValue;
    }
  },
  
  // 从localStorage删除
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('从localStorage删除失败:', error);
      return false;
    }
  },
  
  // 清空localStorage
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空localStorage失败:', error);
      return false;
    }
  }
};

/**
 * 字符串工具函数
 */
export const StringUtils = {
  // 截断字符串
  truncate(str, maxLength = 50) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  },
  
  // 移除HTML标签
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  
  // 高亮搜索关键词
  highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
};