import { z } from 'zod';

const imageDataUriPattern = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const imageUploadBodySchema = z.object({
  file: z
    .string()
    .trim()
    .min(1, 'Image file is required')
    .max(10_000_000, 'Image payload is too large')
    .refine(
      (value) => imageDataUriPattern.test(value) || /^https?:\/\/\S+$/i.test(value),
      'Image file must be a data URI or URL',
    ),
  folder: z
    .string()
    .trim()
    .max(100)
    .regex(
      /^[A-Za-z0-9/_-]+$/,
      'Folder may only contain letters, numbers, slashes, underscores, and hyphens',
    )
    .optional(),
});

export type ImageUploadBody = z.infer<typeof imageUploadBodySchema>;
