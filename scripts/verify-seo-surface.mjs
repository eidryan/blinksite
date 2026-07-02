import { readFileSync } from 'node:fs';
import handler, {
  addCanonicalHomeToSitemap,
  buildUpstreamUrl,
  normalizePressPath,
} from '../api/press-proxy.js';

const checks = [];

function check(name, pass, expected) {
  checks.push({ name, pass, expected });
}

function assert(name, pass, expected) {
  check(name, pass, expected);
  if (!pass) {
    throw new Error(`${name}: expected ${expected}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function createMockResponse() {
  const headers = new Map();
  const chunks = [];

  return {
    statusCode: 200,
    setHeader(key, value) {
      headers.set(key.toLowerCase(), String(value));
    },
    end(chunk = '') {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      this.body = Buffer.concat(chunks).toString('utf8');
    },
    getHeader(key) {
      return headers.get(key.toLowerCase());
    },
    hasHeader(key) {
      return headers.has(key.toLowerCase());
    },
    body: '',
  };
}

async function verifyProxyBehavior() {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });

    return new Response(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '<url>',
        '<loc>https://blinkgroup.com.br/radar</loc>',
        '</url>',
        '</urlset>',
      ].join('\n'),
      {
        status: 200,
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
          'content-encoding': 'gzip',
          'content-length': '999',
          'content-type': 'application/xml',
          etag: '"upstream-etag"',
          'last-modified': 'Tue, 30 Jun 2026 12:32:42 GMT',
          'x-robots-tag': 'noindex',
          'x-vercel-cache': 'HIT',
        },
      },
    );
  };

  try {
    const req = {
      method: 'GET',
      url: '/api/press-proxy?path=sitemap.xml',
      headers: {
        accept: 'application/xml',
        'accept-language': 'pt-BR',
        host: 'blinkgroup.com.br',
      },
    };
    const res = createMockResponse();

    await handler(req, res);

    assert('Proxy returns upstream status', res.statusCode === 200, 'status 200');
    assert('Proxy strips upstream x-robots-tag', !res.hasHeader('x-robots-tag'), 'no x-robots-tag header');
    assert('Proxy drops unsafe content-length', !res.hasHeader('content-length'), 'no copied content-length');
    assert('Proxy drops unsafe content-encoding', !res.hasHeader('content-encoding'), 'no copied content-encoding');
    assert('Proxy drops stale sitemap etag after body rewrite', !res.hasHeader('etag'), 'no copied etag');
    assert('Proxy drops stale sitemap last-modified after body rewrite', !res.hasHeader('last-modified'), 'no copied last-modified');
    assert('Proxy keeps cache-control', res.getHeader('cache-control') === 'public, max-age=0, must-revalidate', 'cache-control copied');
    assert('Proxy keeps XML content type', res.getHeader('content-type') === 'application/xml', 'application/xml content type');
    assert('Proxy adds canonical home to sitemap', res.body.includes('<loc>https://blinkgroup.com.br/</loc>'), 'home URL in sitemap');
    assert('Proxy preserves upstream article URLs', res.body.includes('<loc>https://blinkgroup.com.br/radar</loc>'), 'Radar URL still present');
    assert('Proxy fetches the Blink Press sitemap', calls[0]?.url === 'https://blink-press-blinkgroup.vercel.app/sitemap.xml', 'Blink Press sitemap URL');
    assert('Proxy forwards allowed request headers', calls[0]?.init.headers.accept === 'application/xml', 'accept header forwarded');
    assert('Proxy does not forward host header', !Object.hasOwn(calls[0]?.init.headers ?? {}, 'host'), 'host header omitted');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function verifyForbiddenPath() {
  const originalFetch = globalThis.fetch;
  let called = false;

  globalThis.fetch = async () => {
    called = true;
    return new Response('unexpected');
  };

  try {
    const req = {
      method: 'GET',
      url: '/api/press-proxy?path=https://example.com',
      headers: {},
    };
    const res = createMockResponse();

    await handler(req, res);

    assert('Proxy rejects forbidden paths', res.statusCode === 404, 'status 404');
    assert('Proxy does not fetch forbidden paths', called === false, 'fetch not called');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function verifyRouteMap() {
  const config = readJson('vercel.json');
  const redirects = config.redirects ?? [];
  const rewrites = config.rewrites ?? [];
  const bySource = new Map(rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));
  const wwwRootRedirect = redirects.find((redirect) => redirect.source === '/');
  const wwwPathRedirect = redirects.find((redirect) => redirect.source === '/:path*');

  check('Canonical www root redirect exists', Boolean(wwwRootRedirect), 'root redirect from www to apex');
  check(
    'Canonical www root redirect is host-scoped',
    JSON.stringify(wwwRootRedirect?.has ?? []) === JSON.stringify([{ type: 'host', value: 'www.blinkgroup.com.br' }]),
    'host www.blinkgroup.com.br',
  );
  check(
    'Canonical www root redirect targets apex domain',
    wwwRootRedirect?.destination === 'https://blinkgroup.com.br/',
    'https://blinkgroup.com.br/',
  );
  check('Canonical www root redirect is permanent', wwwRootRedirect?.permanent === true, 'permanent true');
  check('Canonical www path redirect exists', Boolean(wwwPathRedirect), 'path redirect from www to apex');
  check(
    'Canonical www path redirect is host-scoped',
    JSON.stringify(wwwPathRedirect?.has ?? []) === JSON.stringify([{ type: 'host', value: 'www.blinkgroup.com.br' }]),
    'host www.blinkgroup.com.br',
  );
  check(
    'Canonical www path redirect targets apex domain',
    wwwPathRedirect?.destination === 'https://blinkgroup.com.br/:path*',
    'https://blinkgroup.com.br/:path*',
  );
  check('Canonical www path redirect is permanent', wwwPathRedirect?.permanent === true, 'permanent true');

  const expectedProxyRewrites = {
    '/radar': '/api/press-proxy?path=radar',
    '/radar/:path*': '/api/press-proxy?path=radar/:path*',
    '/research': '/api/press-proxy?path=research',
    '/research/:path*': '/api/press-proxy?path=research/:path*',
    '/api/radar/latest': '/api/press-proxy?path=api/radar/latest',
    '/sitemap.xml': '/api/press-proxy?path=sitemap.xml',
    '/robots.txt': '/api/press-proxy?path=robots.txt',
  };

  for (const [source, destination] of Object.entries(expectedProxyRewrites)) {
    check(
      `Rewrite ${source} uses local SEO proxy`,
      bySource.get(source) === destination,
      destination,
    );
  }

  const seoSources = new Set(Object.keys(expectedProxyRewrites));
  for (const rewrite of rewrites) {
    if (seoSources.has(rewrite.source)) {
      check(
        `Rewrite ${rewrite.source} avoids direct .vercel.app SEO origin`,
        !rewrite.destination.includes('blink-press-blinkgroup.vercel.app'),
        'local proxy destination',
      );
    }
  }
}

function verifyHelpers() {
  check('Allows /radar', normalizePressPath('/radar') === 'radar', 'radar');
  check('Allows /research slug', normalizePressPath('/research/paper') === 'research/paper', 'research/paper');
  check('Allows latest API', normalizePressPath('/api/radar/latest') === 'api/radar/latest', 'api/radar/latest');
  check('Rejects traversal', normalizePressPath('/radar/../admin') === null, 'null');
  check('Rejects external URL path', normalizePressPath('https://example.com') === null, 'null');

  const upstream = buildUpstreamUrl('/radar/post', [
    ['path', '/radar/post'],
    ['_rsc', 'abc'],
  ]);

  check(
    'Builds Blink Press URL with query passthrough',
    String(upstream) === 'https://blink-press-blinkgroup.vercel.app/radar/post?_rsc=abc',
    'Blink Press URL with _rsc query',
  );

  const sitemap = '<urlset><url><loc>https://blinkgroup.com.br/radar</loc></url></urlset>';
  const withHome = addCanonicalHomeToSitemap(sitemap);
  check('Sitemap helper adds home once', withHome.includes('<loc>https://blinkgroup.com.br/</loc>'), 'home URL present');
  check('Sitemap helper is idempotent', addCanonicalHomeToSitemap(withHome) === withHome, 'same sitemap on second pass');
}

verifyHelpers();
verifyRouteMap();
await verifyProxyBehavior();
await verifyForbiddenPath();

const failed = checks.filter((entry) => !entry.pass);

if (failed.length > 0) {
  console.error('SEO surface verification failed:');
  for (const failure of failed) {
    console.error(`- ${failure.name}: expected ${failure.expected}`);
  }
  process.exit(1);
}

console.log(`SEO surface verification passed (${checks.length} checks).`);
