# 快乐日记 (DouDou Diary)

一个现代化的日记记录应用，使用React和Rspack构建，帮助用户记录生活中的每一个精彩瞬间。

## 在线访问

访问我们的在线演示：[快乐日记](https://fangge.github.io/childrendiary/)

> **注意**：GitHub Pages版本是展示版，仅提供日记浏览功能，不包含用户管理和日记管理功能。

## 功能特点

### 开发环境功能
- **用户管理**：创建和管理用户信息，包括姓名和性别
- **日记管理**：使用富文本编辑器记录日记，支持多种格式
- **日记展示**：以书本翻页效果浏览日记，支持按用户和日期筛选
- **响应式设计**：完美适配桌面端和移动端
- **错误处理**：完善的错误边界和用户反馈

### GitHub Pages功能
- **日记展示**：以书本翻页效果浏览日记
- **响应式设计**：完美适配桌面端和移动端
- **静态数据展示**：从JSON文件读取并展示日记内容

## 技术栈

### 前端框架
- **React 19** - 最新的React版本
- **React Router v7** - 路由管理
- **Rspack** - 高性能构建工具

### UI框架
- **Tailwind CSS v4** - 现代化的CSS框架
- **PostCSS** - CSS处理工具

### 功能库
- **Quill.js** - 富文本编辑器
- **React Quill** - React封装的Quill编辑器
- **Day.js** - 日期处理库
- **Turn.js** - 书本翻页效果

### 后端
- **Express** - Node.js服务器框架
- **CORS** - 跨域资源共享
- **Multer** - 文件上传处理

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install
```

### 开发模式

```bash
# 一键启动后端和前端开发服务器
pnpm start

# 或者分别启动
pnpm run server  # 启动后端服务器 (端口3001)
pnpm run dev     # 启动前端开发服务器 (端口3000)
```

然后在浏览器中访问 http://localhost:3000

### 构建项目

```bash
# 构建开发版本（包含所有管理功能）
pnpm build

# 构建GitHub Pages版本（仅展示功能）
pnpm run build:github
```

### 生产环境预览

```bash
# 构建并启动生产服务器
pnpm run preview
```

### 部署到GitHub Pages

```bash
# 部署到GitHub Pages
pnpm run deploy
```

项目已配置GitHub Actions，每次推送到main或master分支时会自动部署到GitHub Pages。

## 项目结构

```
doudoudiary2/
├── src/                          # 源代码
│   ├── components/               # React组件
│   │   ├── ErrorBoundary.jsx    # 错误边界组件
│   │   ├── Layout.jsx           # 布局组件
│   │   └── Navbar.jsx           # 导航栏组件
│   ├── contexts/                 # React Context
│   │   └── UserContext.jsx      # 用户状态管理
│   ├── hooks/                    # 自定义Hooks
│   │   └── useDiaries.js        # 日记数据Hook
│   ├── pages/                    # 页面组件
│   │   ├── Home.jsx             # 首页
│   │   ├── UserManagement.jsx   # 用户管理页面
│   │   ├── DiaryManagement.jsx  # 日记管理页面
│   │   └── DiaryDisplay.jsx     # 日记展示页面
│   ├── services/                 # API服务
│   │   └── api.js               # API接口封装
│   ├── styles/                   # 样式文件
│   │   └── index.css            # 全局样式
│   ├── utils/                    # 工具函数
│   │   └── date.js              # 日期处理工具
│   ├── App.jsx                   # 主应用组件（开发版）
│   ├── App.github.jsx            # GitHub Pages版本应用组件
│   ├── index.jsx                 # 应用入口（开发版）
│   ├── index.github.jsx          # GitHub Pages版本入口
│   └── index.html                # HTML模板
├── server/                       # 后端服务器
│   ├── index.js                  # 开发服务器
│   ├── production.js             # 生产服务器
│   └── data/                     # 数据文件
│       ├── users.json            # 用户数据
│       └── diaries.json          # 日记数据
├── dist/                         # 构建输出目录
├── rspack.config.js              # Rspack配置（开发版）
├── rspack.config.github.js       # Rspack配置（GitHub Pages版）
├── tailwind.config.js            # Tailwind CSS配置
├── postcss.config.js             # PostCSS配置
├── package.json                  # 项目配置
└── README.md                     # 项目说明
```

## 使用指南

### 开发环境

1. **首页**：提供应用概述和主要功能的导航链接
2. **用户管理**：创建、编辑和删除用户
3. **写日记**：选择用户、日期，并使用富文本编辑器记录日记
4. **日记展示**：以书本形式浏览日记，可以按用户和日期范围筛选

### GitHub Pages环境

- 直接展示日记内容，以书本翻页形式呈现
- 支持响应式设计，在移动端和桌面端都有良好体验

## 数据存储

- **本地开发环境**：使用Node.js后端服务器，数据存储在JSON文件中
- **生产环境**：使用Express服务器，数据持久化到JSON文件
- **GitHub Pages环境**：从静态JSON文件中读取数据，展示已有的日记内容

## 架构特点

### 状态管理
- 使用React Context API进行全局状态管理
- 自定义Hooks封装业务逻辑
- 组件间通过Context共享用户状态

### 路由管理
- React Router v7实现客户端路由
- 支持嵌套路由和布局组件
- 开发版和GitHub Pages版使用不同的路由配置

### 构建优化
- 使用Rspack进行快速构建
- 代码分割和懒加载
- 生产环境代码压缩和优化
- 分离React和第三方库代码

### 样式方案
- Tailwind CSS v4提供原子化CSS
- PostCSS处理CSS
- 响应式设计，支持移动端和桌面端

## 开发指南

### 添加新页面

1. 在`src/pages/`目录创建新的页面组件
2. 在`src/App.jsx`中添加路由配置
3. 在导航栏中添加链接（如需要）

### 添加新API

1. 在`server/index.js`中添加API路由
2. 在`src/services/api.js`中添加API调用函数
3. 在组件中使用API函数

### 修改样式

- 使用Tailwind CSS类名进行样式设置
- 全局样式在`src/styles/index.css`中定义
- 组件特定样式使用内联Tailwind类

## GitHub Pages工作流程

1. 在本地开发环境中更新`server/data`目录中的JSON数据
2. 提交并推送更改到GitHub仓库
3. GitHub Actions自动构建并部署到GitHub Pages
4. GitHub Pages更新，展示最新的日记内容

## 性能优化

- 使用Rspack进行快速构建
- 代码分割减少初始加载时间
- 图片资源优化
- CSS按需加载
- 生产环境代码压缩

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

ISC

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v2.0.0 (2024-12-13)
- 🎉 完全重构为React + Rspack架构
- ✨ 使用React 19和React Router v7
- 🎨 升级到Tailwind CSS v4
- 📱 优化移动端响应式设计
- 🔧 改进构建配置和性能
- 🌐 分离开发版和GitHub Pages版本
- 🐛 修复多个已知问题

### v1.0.0
- 初始版本，使用纯HTML/CSS/JavaScript
