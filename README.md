# 豆豆日记 (DouDou Diary)

一个简单而功能强大的日记记录应用，帮助用户记录生活中的每一个精彩瞬间。

## 功能特点

- **用户管理**：创建和管理用户信息，包括姓名和性别
- **日记管理**：使用富文本编辑器记录日记，支持多种格式
- **日记展示**：以书本翻页效果浏览日记，支持按用户和日期筛选
- **打印功能**：支持将日记打印保存

## 技术栈

- HTML5 / CSS3 / JavaScript
- Tailwind CSS 用于样式
- Quill.js 富文本编辑器
- Turn.js 实现书本翻页效果
- Day.js 处理日期
- localStorage 存储数据

## 快速开始

### 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

然后在浏览器中访问 http://localhost:3000

### 构建项目

```bash
# 构建项目
pnpm build
```

### 部署到GitHub Pages

```bash
# 部署到GitHub Pages
pnpm deploy
```

## 项目结构

```
doudoudiary2/
├── src/                  # 源代码
│   ├── assets/           # 静态资源
│   │   ├── css/          # CSS样式
│   │   ├── js/           # JavaScript脚本
│   │   └── images/       # 图片资源
│   ├── pages/            # 页面
│   │   ├── user-management.html    # 用户管理页面
│   │   ├── diary-management.html   # 日记管理页面
│   │   └── diary-display.html      # 日记展示页面
│   └── index.html        # 主页
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind CSS配置
└── README.md             # 项目说明
```

## 使用指南

1. **首页**：提供应用概述和主要功能的导航链接
2. **用户管理**：创建、编辑和删除用户
3. **写日记**：选择用户、日期，并使用富文本编辑器记录日记
4. **日记展示**：以书本形式浏览日记，可以按用户和日期范围筛选，支持打印功能

## 数据存储

应用使用浏览器的localStorage存储用户和日记数据，无需后端服务器。

## 许可证

ISC
