import crypto from 'node:crypto';
import { getCloudinaryConfig } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

interface CloudinaryUploadResponse {
  secure_url?: unknown;
  public_id?: unknown;
  width?: unknown;
  height?: unknown;
  format?: unknown;
  resource_type?: unknown;
  error?: {
    message?: unknown;
  };
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
}

function createSignature(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

function getOptionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export async function uploadImageToCloudinary(input: {
  file: Buffer;
  folder: 'noviq/categories' | 'noviq/products';
  contentType: string;
}): Promise<UploadedImage> {
  const cloudinaryConfig = getCloudinaryConfig();

  if (!cloudinaryConfig) {
    throw new AppError('خدمة الصور غير مهيأة', 503);
  }

  const folder = input.folder;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createSignature({ folder, timestamp }, cloudinaryConfig.apiSecret);
  const formData = new FormData();

  formData.set('api_key', cloudinaryConfig.apiKey);
  const fileBytes = new Uint8Array(input.file.byteLength);
  fileBytes.set(input.file);
  formData.set('file', new Blob([fileBytes.buffer], { type: input.contentType }), 'image');
  formData.set('folder', folder);
  formData.set('signature', signature);
  formData.set('timestamp', timestamp);

  let response: Response;

  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        body: formData,
        method: 'POST',
      },
    );
  } catch {
    throw new AppError('Cloudinary upload request failed', 502);
  }

  const payload = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok || !payload) {
    throw new AppError('Cloudinary upload failed', 502);
  }

  const url = getOptionalString(payload.secure_url);
  const publicId = getOptionalString(payload.public_id);

  if (!url || !publicId) {
    throw new AppError('Cloudinary upload response was invalid', 502);
  }

  const uploadedImage: UploadedImage = {
    publicId,
    url,
  };

  const width = getOptionalNumber(payload.width);
  const height = getOptionalNumber(payload.height);
  const format = getOptionalString(payload.format);
  const resourceType = getOptionalString(payload.resource_type);

  if (width !== undefined) {
    uploadedImage.width = width;
  }

  if (height !== undefined) {
    uploadedImage.height = height;
  }

  if (format) {
    uploadedImage.format = format;
  }

  if (resourceType) {
    uploadedImage.resourceType = resourceType;
  }

  return uploadedImage;
}
