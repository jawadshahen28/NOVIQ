import { useEffect } from 'react';

export const SEO_SITE_NAME = 'NOVIQ';
export const SEO_SITE_URL = 'https://noviqshop.shop';

type OpenGraphType = 'product' | 'website';

interface SeoProps {
  canonicalPath?: string | undefined;
  description: string;
  image?: string | undefined;
  ogType?: OpenGraphType | undefined;
  openGraph?: boolean | undefined;
  robots?: string | undefined;
  title: string;
}

const openGraphProperties = [
  'og:description',
  'og:image',
  'og:site_name',
  'og:title',
  'og:type',
  'og:url',
] as const;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function trimMetaText(value: string, maxLength: number) {
  const normalizedValue = normalizeWhitespace(value);

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  const trimmedValue = normalizedValue.slice(0, maxLength - 3);
  const lastSpaceIndex = trimmedValue.lastIndexOf(' ');
  const clippedValue = lastSpaceIndex > 80 ? trimmedValue.slice(0, lastSpaceIndex) : trimmedValue;

  return `${clippedValue}...`;
}

export function createSiteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return new URL(normalizedPath, SEO_SITE_URL).toString();
}

function createAbsoluteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  if (trimmedValue.startsWith('//')) {
    return `https:${trimmedValue}`;
  }

  try {
    return new URL(trimmedValue).toString();
  } catch {
    return createSiteUrl(trimmedValue);
  }
}

function getOrCreateMeta(attribute: 'name' | 'property', key: string) {
  const elements = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`),
  );
  const [primaryElement] = elements;
  const element = primaryElement ?? document.createElement('meta');

  if (!primaryElement) {
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  for (const duplicateElement of elements.slice(1)) {
    duplicateElement.remove();
  }

  return element;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  const element = getOrCreateMeta(attribute, key);
  element.setAttribute('content', content);
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  const elements = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`),
  );

  for (const element of elements) {
    element.remove();
  }
}

function setCanonical(url: string) {
  const elements = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
  const [primaryElement] = elements;
  const element = primaryElement ?? document.createElement('link');

  if (!primaryElement) {
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  for (const duplicateElement of elements.slice(1)) {
    duplicateElement.remove();
  }

  element.setAttribute('href', url);
}

function removeCanonical() {
  const elements = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));

  for (const element of elements) {
    element.remove();
  }
}

function removeOpenGraphTags() {
  for (const property of openGraphProperties) {
    removeMeta('property', property);
  }
}

export default function Seo({
  canonicalPath,
  description,
  image,
  ogType = 'website',
  openGraph = true,
  robots,
  title,
}: SeoProps) {
  useEffect(() => {
    const normalizedTitle = normalizeWhitespace(title) || SEO_SITE_NAME;
    const normalizedDescription = trimMetaText(description, 170);
    const canonicalUrl = canonicalPath ? createSiteUrl(canonicalPath) : undefined;
    const imageUrl = image ? createAbsoluteUrl(image) : undefined;

    document.title = normalizedTitle;
    setMeta('name', 'description', normalizedDescription);

    if (robots) {
      setMeta('name', 'robots', robots);
    } else {
      removeMeta('name', 'robots');
    }

    if (canonicalUrl) {
      setCanonical(canonicalUrl);
    } else {
      removeCanonical();
    }

    if (!openGraph) {
      removeOpenGraphTags();
      return;
    }

    setMeta('property', 'og:title', normalizedTitle);
    setMeta('property', 'og:description', normalizedDescription);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', SEO_SITE_NAME);

    if (canonicalUrl) {
      setMeta('property', 'og:url', canonicalUrl);
    } else {
      removeMeta('property', 'og:url');
    }

    if (imageUrl) {
      setMeta('property', 'og:image', imageUrl);
    } else {
      removeMeta('property', 'og:image');
    }
  }, [canonicalPath, description, image, ogType, openGraph, robots, title]);

  return null;
}
