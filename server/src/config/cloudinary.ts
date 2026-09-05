import { env } from './env.js';

export interface CloudinaryConfig {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  uploadFolder: string;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_CLOUD_NAME) {
    return null;
  }

  return {
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadFolder: env.CLOUDINARY_UPLOAD_FOLDER,
  };
}
