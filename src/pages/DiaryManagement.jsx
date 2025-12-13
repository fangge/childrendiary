import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuillEditor from '../components/QuillEditor';
import { useCurrentUser } from '../contexts/UserContext';
import { DateUtils, ValidationUtils, StringUtils } from '../utils/helpers';
import api from '../services/api';

const DiaryManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [formData, setFormData] = useState({
    date: DateUtils.getCurrentDate(),
    title: '',
    content: '',
    images: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      loadDiaries();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    filterDiaries();
  }, [diaries, searchKeyword, dateRange]);

  const loadDiaries = async () => {
    try {
      setLoading(true);
      const allDiaries = await api.getDiaries();
      // 过滤出当前用户的日记
      const userDiaries = allDiaries.filter(diary => diary.userId === currentUser.id);
      setDiaries(userDiaries);
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDiaries = () => {
    let filtered = [...diaries];

    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(diary => 
        diary.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        diary.content.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 日期范围筛选
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(diary => 
        DateUtils.isDateInRange(diary.date, dateRange.start, dateRange.end)
      );
    }

    // 按日期降序排序
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredDiaries(filtered);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!ValidationUtils.isRequired(formData.date)) {
      newErrors.date = '请选择日期';
    } else if (!ValidationUtils.isValidDate(formData.date)) {
      newErrors.date = '请输入有效的日期';
    }
    
    // 检查内容是否为空（包括 Quill 的空内容 <p><br></p>）
    const content = formData.content || '';
    const isEmpty = !content || content === '<p><br></p>' || content.trim() === '';
    
    if (isEmpty) {
      newErrors.content = '请输入日记内容';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('提交表单，当前formData:', formData);
    
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }

    try {
      // 如果标题为空或只有空格，使用日期作为标题
      const trimmedTitle = formData.title.trim();
      const title = trimmedTitle ? trimmedTitle : DateUtils.formatReadableDate(formData.date);
      
      const diaryData = {
        ...formData,
        title,
        userId: currentUser.id
      };
      
      console.log('准备保存的日记数据:', diaryData);

      if (editingDiary) {
        console.log('更新日记:', editingDiary.id);
        await api.updateDiary(editingDiary.id, diaryData);
        setDiaries(diaries.map(d => d.id === editingDiary.id ? { ...d, ...diaryData } : d));
      } else {
        console.log('创建新日记');
        const newDiary = await api.createDiary(diaryData);
        console.log('新日记创建成功:', newDiary);
        setDiaries([newDiary, ...diaries]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('保存日记失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (diaryId) => {
    if (!confirm('确定要删除这篇日记吗？')) {
      return;
    }

    try {
      await api.deleteDiary(diaryId);
      setDiaries(diaries.filter(d => d.id !== diaryId));
    } catch (error) {
      console.error('删除日记失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleEdit = (diary) => {
    setEditingDiary(diary);
    setFormData({
      date: diary.date,
      title: diary.title || '',
      content: diary.content,
      images: diary.images || []
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDiary(null);
    setFormData({
      date: DateUtils.getCurrentDate(),
      title: '',
      content: '',
      images: []
    });
    setErrors({});
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (!ValidationUtils.isValidImageFile(file)) {
        alert(`${file.name} 不是有效的图片文件`);
        return false;
      }
      if (!ValidationUtils.isValidFileSize(file, 5)) {
        alert(`${file.name} 大小超过5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const readers = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setFormData({
        ...formData,
        images: [...formData.images, ...images]
      });
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先选择用户</h2>
          <p className="text-gray-600 mb-6">需要选择一个用户才能管理日记</p>
          <button
            onClick={() => navigate('/users')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            前往用户管理
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">日记管理</h1>
            <p className="text-gray-600">管理 {currentUser.name} 的成长日记</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            写日记
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 关键词搜索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索关键词
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索标题或内容..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 开始日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 结束日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              共 {diaries.length} 篇日记，显示 {filteredDiaries.length} 篇
            </p>
            {(searchKeyword || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setDateRange({ start: '', end: '' });
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 日记列表 */}
        {filteredDiaries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {diaries.length === 0 ? '还没有日记' : '没有找到匹配的日记'}
            </h3>
            <p className="text-gray-500 mb-6">
              {diaries.length === 0 ? '点击上方按钮开始记录' : '尝试调整搜索条件'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiaries.map((diary) => (
              <div
                key={diary.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                {/* 日记图片 */}
                {diary.images && diary.images.length > 0 && (
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={diary.images[0]}
                      alt="日记图片"
                      className="w-full h-full object-cover"
                    />
                    {diary.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        +{diary.images.length - 1}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* 日期 */}
                  <div className="text-sm text-gray-500 mb-2">
                    {DateUtils.formatReadableDate(diary.date)}
                  </div>

                  {/* 标题 */}
                  {diary.title && (
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {diary.title}
                    </h3>
                  )}

                  {/* 内容预览 */}
                  <div
                    className="text-gray-600 text-sm mb-4 line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: StringUtils.truncate(diary.content, 150)
                    }}
                  />

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(diary)}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑日记模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6">
              {/* 模态框头部 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingDiary ? '编辑日记' : '写日记'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标题（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="给这篇日记起个标题..."
                  />
                </div>

                {/* 内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容 <span className="text-red-500">*</span>
                  </label>
                  <QuillEditor
                    key={editingDiary ? `edit-${editingDiary.id}` : 'new'}
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="记录今天的故事..."
                    className={errors.content ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                  )}
                </div>

                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图片
                  </label>
                  
                  {/* 图片预览 */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 上传按钮 */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">选择图片</span>
                    </div>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">支持多张图片，每张不超过5MB</p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {editingDiary ? '保存' : '发布'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryManagement;