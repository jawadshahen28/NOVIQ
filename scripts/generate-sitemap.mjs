import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const siteUrl = 'https://noviqshop.shop';
const outputPath = path.resolve('public/sitemap.xml');

function loadDotenvFile(filePath, targetEnv) {
  return readFile(filePath, 'utf8')
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#') || !trimmedLine.includes('=')) {
          continue;
        }

        const separatorIndex = trimmedLine.indexOf('=');
        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

        if (key) {
          targetEnv[key] = value;
        }
      }
    })
    .catch((error) => {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    });
}

function normalizeApiBaseUrl(value) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error('VITE_API_BASE_URL is required to generate public/sitemap.xml');
  }

  const url = new URL(trimmedValue);
  const normalizedSiteUrl = new URL(siteUrl);

  if (url.origin === normalizedSiteUrl.origin) {
    throw new Error('VITE_API_BASE_URL must point to the backend API service, not noviqshop.shop');
  }

  const normalizedUrl = url.toString().replace(/\/+$/, '');

  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

function createStorefrontUrl(pathname) {
  const normalizedPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;

  return `${siteUrl}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchApiData(apiBaseUrl, pathName) {
  const response = await fetch(`${apiBaseUrl}${pathName}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${pathName}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (!payload || payload.success !== true || !payload.data) {
    throw new Error(`Unexpected API response for ${pathName}`);
  }

  return payload.data;
}

function getSlugItems(items, label) {
  if (!Array.isArray(items)) {
    throw new Error(`Expected ${label} to be an array`);
  }

  return items
    .filter((item) => item && typeof item.slug === 'string' && item.slug.trim())
    .map((item) => ({ slug: item.slug.trim().toLowerCase() }));
}

function renderUrl(loc, priority) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function renderSitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

async function generateSitemap() {
  const fileEnv = {};

  for (const filePath of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    await loadDotenvFile(filePath, fileEnv);
  }

  const apiBaseUrl = normalizeApiBaseUrl(
    process.env.SITEMAP_API_BASE_URL ??
      process.env.VITE_API_BASE_URL ??
      fileEnv.SITEMAP_API_BASE_URL ??
      fileEnv.VITE_API_BASE_URL,
  );
  const [categoryData, productData] = await Promise.all([
    fetchApiData(apiBaseUrl, '/categories'),
    fetchApiData(apiBaseUrl, '/products'),
  ]);
  const categories = getSlugItems(categoryData.categories, 'categories');
  const products = getSlugItems(productData.products, 'products');
  const entries = [
    renderUrl(createStorefrontUrl('/'), '1.0'),
    ...categories.map((category) => renderUrl(createStorefrontUrl(`/category/${category.slug}`), '0.8')),
    ...products.map((product) => renderUrl(createStorefrontUrl(`/product/${product.slug}`), '0.7')),
  ];

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderSitemap(entries), 'utf8');

  console.info(
    `[sitemap] Wrote ${outputPath} with ${categories.length} categories and ${products.length} products`,
  );
}

generateSitemap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[sitemap] ${message}`);
  process.exit(1);
});
