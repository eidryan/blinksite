import { Buffer } from 'node:buffer';

const PRESS_ORIGIN = 'https://blink-press-blinkgroup.vercel.app';
const CANONICAL_HOME = 'https://blinkgroup.com.br/';

const ALLOWED_EXACT_PATHS = new Set([
  'api/radar/latest',
  'robots.txt',
  'sitemap.xml',
]);

const ALLOWED_PREFIXES = [
  'radar/',
  'research/',
];

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'rsc',
  'next-router-prefetch',
  'next-router-segment-prefetch',
  'next-router-state-tree',
  'next-url',
  'user-agent',
];

const BLOCKED_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'x-robots-tag',
]);

function getHeader(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value.join(', ');
  return value;
}

export function normalizePressPath(rawPath) {
  if (typeof rawPath !== 'string') return null;

  const normalized = rawPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/{2,}/g, '/');

  if (!normalized || normalized.includes('..')) return null;
  if (ALLOWED_EXACT_PATHS.has(normalized)) return normalized;
  if (normalized === 'radar' || normalized === 'research') return normalized;
  if (ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return normalized;

  return null;
}

export function buildUpstreamUrl(rawPath, queryEntries = []) {
  const path = normalizePressPath(rawPath);
  if (!path) return null;

  const url = new URL(`/${path}`, PRESS_ORIGIN);

  for (const [key, value] of queryEntries) {
    if (key !== 'path') {
      url.searchParams.append(key, value);
    }
  }

  return url;
}

export function copyResponseHeaders(headers) {
  const copied = {};

  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!BLOCKED_RESPONSE_HEADERS.has(lowerKey)) {
      copied[key] = value;
    }
  });

  return copied;
}

export function addCanonicalHomeToSitemap(sitemap) {
  if (sitemap.includes(`<loc>${CANONICAL_HOME}</loc>`)) return sitemap;

  const homeEntry = [
    '<url>',
    `<loc>${CANONICAL_HOME}</loc>`,
    '<changefreq>weekly</changefreq>',
    '<priority>1</priority>',
    '</url>',
  ].join('\n');

  return sitemap.replace(/<urlset([^>]*)>/, `<urlset$1>\n${homeEntry}`);
}

function forwardedRequestHeaders(req) {
  const headers = {};

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = getHeader(req.headers, name);
    if (value) {
      headers[name] = value;
    }
  }

  return headers;
}

function writeHeaders(res, headers) {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const requestUrl = new URL(req.url ?? '/', 'https://blinkgroup.com.br');
  const upstreamUrl = buildUpstreamUrl(
    requestUrl.searchParams.get('path'),
    requestUrl.searchParams.entries(),
  );

  if (!upstreamUrl) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: forwardedRequestHeaders(req),
      redirect: 'manual',
    });

    const headers = copyResponseHeaders(upstreamResponse.headers);

    res.statusCode = upstreamResponse.status;

    if (req.method === 'HEAD') {
      writeHeaders(res, headers);
      res.end();
      return;
    }

    if (normalizePressPath(requestUrl.searchParams.get('path')) === 'sitemap.xml') {
      const sitemap = addCanonicalHomeToSitemap(await upstreamResponse.text());
      delete headers.etag;
      delete headers['last-modified'];
      headers['content-type'] = headers['content-type'] ?? 'application/xml';
      writeHeaders(res, headers);
      res.end(sitemap);
      return;
    }

    writeHeaders(res, headers);
    res.end(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch (error) {
    console.error('Blink Press proxy request failed:', error);
    res.statusCode = 502;
    res.end('Bad Gateway');
  }
}
