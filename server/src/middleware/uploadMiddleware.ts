import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const upload = multer({
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError('نوع الصورة غير مدعوم', 400));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  storage: multer.memoryStorage(),
});

export function uploadImageFile(request: Request, response: Response, next: NextFunction) {
  upload.single('image')(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('حجم الصورة كبير جدًا', 400));
      return;
    }

    if (error instanceof multer.MulterError || error instanceof Error) {
      next(new AppError('نوع الصورة غير مدعوم', 400));
      return;
    }

    next(new AppError('فشل رفع الصورة', 400));
  });
}