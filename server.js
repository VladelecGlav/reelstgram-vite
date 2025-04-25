import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Разрешаем CORS для запросов с http://localhost:5173 (Vite)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Создаём папку uploads, если её нет
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    try {
      await fs.access(uploadPath);
      console.log('Uploads directory exists:', uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
      console.log('Created uploads directory:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Saving file as:', filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение 5MB
  fileFilter: (req, file, cb) => {
    console.log('Filtering file:', file.originalname);
    const filetypes = /jpeg|jpg|png|gif|mp4|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      console.log('File type accepted:', file.mimetype);
      return cb(null, true);
    }
    console.error('File type rejected:', file.mimetype);
    cb(new Error('Only images (jpeg, jpg, png, gif) and videos (mp4, webm) are allowed'));
  },
});

// Делаем папку uploads статической
app.use('/uploads', (req, res, next) => {
  console.log('Request to /uploads:', req.path);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  fallthrough: false // Если файл не найден, передаём управление следующему middleware
}));

// Обработка ошибок для /uploads
app.use('/uploads', (err, req, res, next) => {
  console.error('Error serving file from /uploads:', err.message);
  res.status(500).json({ error: 'Failed to serve file from uploads folder' });
});

// Тестовый маршрут
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.send('Server is running');
});

// Маршрут для загрузки файлов
app.post('/upload', (req, res, next) => {
  console.log('Received upload request');
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error during upload:', err.message);
      return res.status(500).json({ error: `Upload failed: ${err.message}` });
    }
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', fileUrl);
    res.json({ url: fileUrl });
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});