const cloudinaryUploadMarker = '/image/upload/';

interface ResponsiveImageOptions {
  fallbackWidth?: number;
  sizes: string;
  widths: readonly number[];
}

function isCloudinaryImageUrl(source: string) {
  try {
    const url = new URL(source);
    return url.hostname.endsWith('cloudinary.com') && url.pathname.includes(cloudinaryUploadMarker);
  } catch {
    return false;
  }
}

function createCloudinaryImageUrl(source: string, width: number) {
  if (!isCloudinaryImageUrl(source)) {
    return source;
  }

  const url = new URL(source);
  const markerIndex = url.pathname.indexOf(cloudinaryUploadMarker);
  const pathPrefix = url.pathname.slice(0, markerIndex + cloudinaryUploadMarker.length);
  const imagePath = url.pathname.slice(markerIndex + cloudinaryUploadMarker.length);

  url.pathname = `${pathPrefix}f_auto,q_auto,c_limit,w_${width}/${imagePath}`;

  return url.toString();
}

function normalizeWidths(widths: readonly number[]) {
  return Array.from(new Set(widths))
    .filter((width) => Number.isInteger(width) && width > 0)
    .sort((first, second) => first - second);
}

export function getOptimizedImageUrl(source: string, width: number) {
  return createCloudinaryImageUrl(source, width);
}

export function getResponsiveImageProps(source: string, options: ResponsiveImageOptions) {
  const widths = normalizeWidths(options.widths);

  if (!isCloudinaryImageUrl(source) || widths.length === 0) {
    return {
      src: source,
    };
  }

  const fallbackWidth = options.fallbackWidth ?? widths[Math.floor(widths.length / 2)] ?? widths[0];

  return {
    sizes: options.sizes,
    src: createCloudinaryImageUrl(source, fallbackWidth),
    srcSet: widths.map((width) => `${createCloudinaryImageUrl(source, width)} ${width}w`).join(', '),
  };
}
