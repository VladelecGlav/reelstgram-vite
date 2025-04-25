import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

// Настройка formidable для обработки загрузки файлов
export const config = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер body, чтобы использовать formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Настройка formidable
  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/uploads'), // Папка для сохранения файлов
    keepExtensions: true, // Сохраняем расширения файлов
  });

  try {
    // Создаём папку uploads, если её нет
    await fs.mkdir(path.join(process.cwd(), 'public/uploads'), { recursive: true });

    // Парсим форму
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Получаем файл из формы
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Формируем URL для загруженного файла
    const fileName = path.basename(file.filepath);
    const fileUrl = `/uploads/${fileName}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};