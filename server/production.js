const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务 - 从dist目录
app.use(express.static(path.join(__dirname, '../dist')));

// API路由
app.use(express.json());

// 用户API
app.get('/api/users', (req, res) => {
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const newUser = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const filtered = users.filter(u => u.id !== req.params.id);
  fs.writeFileSync(usersPath, JSON.stringify(filtered, null, 2));
  res.json({ success: true });
});

// 日记API
app.get('/api/diaries', (req, res) => {
  const diariesPath = path.join(__dirname, 'data/diaries.json');
  const diaries = JSON.parse(fs.readFileSync(diariesPath, 'utf-8'));
  res.json(diaries);
});

app.post('/api/diaries', (req, res) => {
  const diariesPath = path.join(__dirname, 'data/diaries.json');
  const diaries = JSON.parse(fs.readFileSync(diariesPath, 'utf-8'));
  const newDiary = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  diaries.push(newDiary);
  fs.writeFileSync(diariesPath, JSON.stringify(diaries, null, 2));
  res.json(newDiary);
});

app.put('/api/diaries/:id', (req, res) => {
  const diariesPath = path.join(__dirname, 'data/diaries.json');
  const diaries = JSON.parse(fs.readFileSync(diariesPath, 'utf-8'));
  const index = diaries.findIndex(d => d.id === req.params.id);
  if (index !== -1) {
    diaries[index] = { ...diaries[index], ...req.body };
    fs.writeFileSync(diariesPath, JSON.stringify(diaries, null, 2));
    res.json(diaries[index]);
  } else {
    res.status(404).json({ error: 'Diary not found' });
  }
});

app.delete('/api/diaries/:id', (req, res) => {
  const diariesPath = path.join(__dirname, 'data/diaries.json');
  const diaries = JSON.parse(fs.readFileSync(diariesPath, 'utf-8'));
  const filtered = diaries.filter(d => d.id !== req.params.id);
  fs.writeFileSync(diariesPath, JSON.stringify(filtered, null, 2));
  res.json({ success: true });
});

// 所有其他路由返回index.html（支持React Router）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 生产服务器运行在 http://localhost:${PORT}`);
});