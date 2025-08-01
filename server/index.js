const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// 确保上传目录存在
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // 目录不存在，创建它
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// 配置multer存储
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // 根据当前日期创建目录
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const dateDir = path.join(__dirname, 'data', 'images', `${year}-${month}-${day}`);
    
    // 确保目录存在
    await ensureDirectoryExists(dateDir);
    
    cb(null, dateDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器，只允许上传图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
// 提供静态文件访问
app.use('/api/images', express.static(path.join(__dirname, 'data', 'images')));

// 数据文件路径
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const diariesFilePath = path.join(__dirname, 'data', 'diaries.json');

// 辅助函数 - 读取JSON文件
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错:`, error);
    if (error.code === 'ENOENT') {
      // 如果文件不存在，创建空数据结构并写入文件
      const emptyData = filePath.includes('users') ? { users: [] } : { diaries: [] };
      await writeJsonFile(filePath, emptyData);
      return emptyData;
    }
    throw error;
  }
}

// 辅助函数 - 写入JSON文件
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`写入文件 ${filePath} 时出错:`, error);
    throw error;
  }
}

// API端点 - 获取所有用户
app.get('/api/users', async (req, res) => {
  try {
    const data = await readJsonFile(usersFilePath);
    res.json(data.users);
  } catch (error) {
    res.status(500).json({ error: '获取用户数据失败' });
  }
});

// API端点 - 添加新用户
app.post('/api/users', async (req, res) => {
  try {
    const data = await readJsonFile(usersFilePath);
    const newUser = req.body;
    
    // 生成唯一ID
    newUser.id = Date.now().toString();
    
    data.users.push(newUser);
    await writeJsonFile(usersFilePath, data);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: '添加用户失败' });
  }
});

// API端点 - 更新用户
app.put('/api/users/:id', async (req, res) => {
  try {
    const data = await readJsonFile(usersFilePath);
    const userId = req.params.id;
    const updatedUser = req.body;
    
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    data.users[userIndex] = { ...data.users[userIndex], ...updatedUser };
    await writeJsonFile(usersFilePath, data);
    
    res.json(data.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新用户失败' });
  }
});

// API端点 - 删除用户
app.delete('/api/users/:id', async (req, res) => {
  try {
    const data = await readJsonFile(usersFilePath);
    const userId = req.params.id;
    
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    data.users.splice(userIndex, 1);
    await writeJsonFile(usersFilePath, data);
    
    // 同时删除该用户的所有日记
    const diariesData = await readJsonFile(diariesFilePath);
    diariesData.diaries = diariesData.diaries.filter(diary => diary.userId !== userId);
    await writeJsonFile(diariesFilePath, diariesData);
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败' });
  }
});

// API端点 - 获取所有日记
app.get('/api/diaries', async (req, res) => {
  try {
    const data = await readJsonFile(diariesFilePath);
    res.json(data.diaries);
  } catch (error) {
    res.status(500).json({ error: '获取日记数据失败' });
  }
});

// API端点 - 添加新日记
app.post('/api/diaries', async (req, res) => {
  try {
    const data = await readJsonFile(diariesFilePath);
    const newDiary = req.body;
    
    // 生成唯一ID
    newDiary.id = Date.now().toString();
    
    data.diaries.push(newDiary);
    await writeJsonFile(diariesFilePath, data);
    
    res.status(201).json(newDiary);
  } catch (error) {
    res.status(500).json({ error: '添加日记失败' });
  }
});

// API端点 - 更新日记
app.put('/api/diaries/:id', async (req, res) => {
  try {
    const data = await readJsonFile(diariesFilePath);
    const diaryId = req.params.id;
    const updatedDiary = req.body;
    
    const diaryIndex = data.diaries.findIndex(diary => diary.id === diaryId);
    
    if (diaryIndex === -1) {
      return res.status(404).json({ error: '日记不存在' });
    }
    
    data.diaries[diaryIndex] = { ...data.diaries[diaryIndex], ...updatedDiary };
    await writeJsonFile(diariesFilePath, data);
    
    res.json(data.diaries[diaryIndex]);
  } catch (error) {
    res.status(500).json({ error: '更新日记失败' });
  }
});

// API端点 - 删除日记
app.delete('/api/diaries/:id', async (req, res) => {
  try {
    const data = await readJsonFile(diariesFilePath);
    const diaryId = req.params.id;
    
    const diaryIndex = data.diaries.findIndex(diary => diary.id === diaryId);
    
    if (diaryIndex === -1) {
      return res.status(404).json({ error: '日记不存在' });
    }
    
    data.diaries.splice(diaryIndex, 1);
    await writeJsonFile(diariesFilePath, data);
    
    res.json({ message: '日记删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除日记失败' });
  }
});

// API端点 - 上传图片
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件或文件类型不正确' });
    }
    
    // 返回图片URL
    const imageUrl = `/api/images/${path.relative(path.join(__dirname, 'data', 'images'), req.file.path)}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: '上传图片失败: ' + error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 确保必要的目录存在并初始化数据文件
(async () => {
  try {
    // 确保目录存在
    await ensureDirectoryExists(path.join(__dirname, 'data'));
    await ensureDirectoryExists(path.join(__dirname, 'data', 'images'));
    
    // 初始化数据文件
    await readJsonFile(usersFilePath);
    await readJsonFile(diariesFilePath);
    
    console.log('数据文件初始化完成');
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
})();
