import { uploadImageToCloudinary } from '../services/cloudinaryUploadService.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fileTypeFromBuffer } from 'file-type';

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

export const uploadImage = asyncHandler(async (request, response) => {
  const file = request.file;
  const type = typeof request.body.type === 'string' ? request.body.type : '';

  if (!file) {
    throw new AppError('يرجى اختيار صورة', 400);
  }

  const detectedType = await fileTypeFromBuffer(file.buffer);
  const detectedExtension = detectedType ? allowedImageTypes.get(detectedType.mime) : undefined;

  if (!detectedType || !detectedExtension || detectedType.mime !== file.mimetype) {
    throw new AppError('نوع الصورة غير مدعوم', 400);
  }

  const folder = type === 'category' ? 'noviq/categories' : type === 'product' ? 'noviq/products' : null;

  if (!folder) {
    throw new AppError('نوع الرفع غير صالح', 400);
  }

  const image = await uploadImageToCloudinary({
    contentType: detectedType.mime,
    file: file.buffer,
    folder,
  });

  return sendSuccess(response, image, 'تم رفع الصورة بنجاح', 201);
});
