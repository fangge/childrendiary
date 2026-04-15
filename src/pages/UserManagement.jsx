import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../contexts/UserContext';
import { ValidationUtils } from '../utils/helpers';
import api from '../services/api';

const UserManagement = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!ValidationUtils.isRequired(formData.name)) {
      newErrors.name = '请输入姓名';
    }
    
    if (!ValidationUtils.isRequired(formData.birthday)) {
      newErrors.birthday = '请选择生日';
    } else if (!ValidationUtils.isValidDate(formData.birthday)) {
      newErrors.birthday = '请输入有效的日期';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        
        if (currentUser && currentUser.id === editingUser.id) {
          setCurrentUser({ ...currentUser, ...formData });
        }
      } else {
        const newUser = await api.createUser(formData);
        setUsers([...users, newUser]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('保存用户失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('确定要删除这个用户吗？删除后相关日记也会被删除。')) {
      return;
    }

    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleSelectUser = (user) => {
    setCurrentUser(user);
    navigate('/');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      birthday: user.birthday,
      avatar: user.avatar || ''
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ name: '', birthday: '', avatar: '' });
    setErrors({});
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ValidationUtils.isValidImageFile(file)) {
      alert('请选择图片文件');
      return;
    }

    if (!ValidationUtils.isValidFileSize(file, 2)) {
      alert('图片大小不能超过2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, avatar: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 - Mintlify 风格 */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-near-black tracking-tight mb-2" style={{ letterSpacing: '-0.8px' }}>用户管理</h1>
            <p className="text-gray-500">管理所有儿童用户信息</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加用户
          </button>
        </div>

        {/* 用户列表 */}
        {users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-featured border border-[rgba(0,0,0,0.05)]">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-near-black mb-2">还没有用户</h3>
            <p className="text-gray-500">点击上方按钮添加第一个用户</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className={`bg-white rounded-card border shadow-card hover:border-[rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden ${
                  currentUser && currentUser.id === user.id ? 'border-brand ring-2 ring-brand/20' : 'border-[rgba(0,0,0,0.05)]'
                }`}
              >
                <div className="p-6">
                  {/* 头像 */}
                  <div className="flex justify-center mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-brand-light"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-brand-light flex items-center justify-center text-brand text-3xl font-semibold">
                        {user.name}
                      </div>
                    )}
                  </div>

                  {/* 用户信息 */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-near-black mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-400">生日: {user.birthday}</p>
                    {currentUser && currentUser.id === user.id && (
                      <span className="badge-brand inline-block mt-2">
                        当前用户
                      </span>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      选择
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-pill text-sm font-medium transition-colors duration-200"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-error-red rounded-pill text-sm font-medium transition-colors duration-200"
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

      {/* 添加/编辑用户模态框 - Mintlify 风格 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop">
          <div className="bg-white rounded-featured border border-[rgba(0,0,0,0.05)] shadow-card max-w-md w-full max-h-[90vh] overflow-y-auto modal-content">
            <div className="p-8">
              {/* 模态框头部 */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-near-black tracking-tight" style={{ letterSpacing: '-0.2px' }}>
                  {editingUser ? '编辑用户' : '添加用户'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-near-black transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 头像上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头像
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="头像预览"
                        className="w-20 h-20 rounded-full object-cover border-2 border-brand-light"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-near-black rounded-pill text-sm font-medium text-center transition-colors duration-200">
                        选择图片
                      </div>
                    </label>
                  </div>
                </div>

                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-pill focus:ring-brand focus:border-brand ${
                      errors.name ? 'border-error-red' : 'border-[rgba(0,0,0,0.08)]'
                    }`}
                    placeholder="请输入姓名"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-error-red">{errors.name}</p>
                  )}
                </div>

                {/* 生日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生日 <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-pill focus:ring-brand focus:border-brand ${
                      errors.birthday ? 'border-error-red' : 'border-[rgba(0,0,0,0.08)]'
                    }`}
                  />
                  {errors.birthday && (
                    <p className="mt-1.5 text-sm text-error-red">{errors.birthday}</p>
                  )}
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary py-2.5"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-2.5"
                  >
                    {editingUser ? '保存' : '添加'}
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

export default UserManagement;
