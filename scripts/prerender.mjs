/**
 * Pre-renders the public pages after `vite build` (docs/specs/2026-10-prerendering.md).
 *
 * Each page of PUBLIC_PAGES and each published guide is opened in headless Chromium and
 * saved as dist/<route>.html, so link previews and crawlers that do not run JavaScript get
 * the page's own title, description, sharing image and content. Vercel serves an existing
 * file before applying rewrites; with "cleanUrls", /tarifs is served from tarifs.html.
 *
 * dist/app.html is a copy of the untouched shell: vercel.json rewrites every other address
 * to it (dist/index.html becomes the pre-rendered homepage).
 *
 * Fail-soft: if pre-rendering cannot run (no browser, no database), the build continues
 * with the plain shell for every page, as before; the log says so. PRERENDER_STRICT=1 makes
 * any failure fail the build.
 *
 * Browser: PRERENDER_CHROME_PATH if set; otherwise @sparticuz/chromium on Linux (Vercel);
 * otherwise a locally installed Chrome or Edge.
 */
import { createReadStream, existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { PUBLIC_PAGES } from '../src/lib/trackedPaths.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://mallouliauto.com';
const STRICT = process.env.PRERENDER_STRICT === '1';
const CONSENT_KEY = 'mallouliauto_cookie_consent';

// Not worth a preview or a crawl: a step of the newsletter sign-up.
const SKIPPED = new Set(['/newsletter/confirmation']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

const log = (message) => console.log(`[prerender] ${message}`);

/** Serves dist/ like Vercel would before this script: files first, else the shell. */
function serveDist() {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    let file = path.join(DIST, pathname);
    if (!file.startsWith(DIST) || !existsSync(file) || pathname.endsWith('/')) {
      file = path.join(DIST, 'app.html');
    }
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function launchBrowser() {
  const { default: puppeteer } = await import('puppeteer-core');
  const local = [
    process.env.PRERENDER_CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((candidate) => candidate && existsSync(candidate));

  if (local) {
    return puppeteer.launch({ executablePath: local, headless: true });
  }
  if (process.platform === 'linux') {
    const { default: chromium } = await import('@sparticuz/chromium');
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  throw new Error('no Chrome found: set PRERENDER_CHROME_PATH');
}

/** Published guides, read with the public key: row-level security hides drafts. */
async function publishedGuides() {
  // Same values as the bundle: .env files (local builds) or the build environment (Vercel).
  const env = { ...loadEnv('production', ROOT, 'VITE_'), ...process.env };
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing');
  const response = await fetch(
    `${url}/rest/v1/guides?select=slug,reviewed_at,published_at&status=eq.published&order=published_at.desc`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!response.ok) throw new Error(`guides: HTTP ${response.status}`);
  const rows = await response.json();
  return rows.filter((row) => /^[a-z0-9._~%-]{1,150}$/.test(row.slug));
}

async function renderPage(browser, origin, route) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    // No call to the site's API while rendering: no page view recorded, no chat, no form.
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) request.abort('blockedbyclient');
      else request.continue();
    });
    // No cookie banner frozen into the HTML.
    await page.evaluateOnNewDocument((key) => {
      try {
        localStorage.setItem(key, 'declined');
      } catch {
        /* storage unavailable: the banner may show, harmless */
      }
    }, CONSENT_KEY);
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // SEO.jsx has set the page's tags once the route has rendered (the defaults of
    // index.html are removed by main.jsx before that).
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-default-seo]') &&
        document.querySelector('meta[name="description"]') &&
        document.querySelector('link[rel="canonical"]'),
      { timeout: 10000 }
    );

    return await page.evaluate(() => {
      // The tags each page sets through SEO.jsx: marked so that src/main.jsx removes them
      // when the app starts and React sets them again (no duplicates).
      document.head
        .querySelectorAll(
          'title, meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]'
        )
        .forEach((element) => element.setAttribute('data-default-seo', ''));
      return `<!doctype html>\n${document.documentElement.outerHTML}`;
    });
  } finally {
    await page.close();
  }
}

function outputFile(route) {
  return route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${route.slice(1)}.html`);
}

async function writeSitemap(guides) {
  const base = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  const entries = guides
    .map((guide) => {
      const lastmod = (guide.reviewed_at || guide.published_at || '').slice(0, 10);
      return [
        '  <url>',
        `    <loc>${SITE_URL}/guides/${guide.slug}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.6</priority>',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  if (!entries) return;
  await writeFile(
    path.join(DIST, 'sitemap.xml'),
    base.replace('</urlset>', `${entries}\n</urlset>`)
  );
}

async function main() {
  const shell = path.join(DIST, 'index.html');
  if (!existsSync(shell)) throw new Error('dist/index.html missing: run vite build first');
  // Always first: vercel.json rewrites to /app, so it must exist even if the rest fails.
  // vite build empties dist/, so app.html only exists when this script already ran on this
  // build: index.html is then the pre-rendered homepage and must not become the shell.
  const appShell = path.join(DIST, 'app.html');
  if (!existsSync(appShell)) await copyFile(shell, appShell);

  let browser;
  let server;
  try {
    // Without the database, the fixed pages are still worth pre-rendering.
    const guides = await publishedGuides().catch((error) => {
      if (STRICT) throw error;
      console.warn(`[prerender] WARNING guides not pre-rendered: ${error?.message || error}`);
      return [];
    });
    const routes = [
      ...PUBLIC_PAGES.filter((route) => !SKIPPED.has(route)),
      ...guides.map((guide) => `/guides/${guide.slug}`),
    ];

    server = await serveDist();
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await launchBrowser();

    // Render everything first, write afterwards: the local server keeps serving the
    // untouched shell for every page while rendering.
    const rendered = [];
    for (const route of routes) {
      rendered.push([route, await renderPage(browser, origin, route)]);
      log(`rendered ${route}`);
    }
    for (const [route, html] of rendered) {
      const file = outputFile(route);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, html);
    }
    await writeSitemap(guides);
    log(`${rendered.length} pages pre-rendered, ${guides.length} guides in the sitemap`);
  } finally {
    await browser?.close();
    server?.close();
  }
}

main().catch((error) => {
  const message = `pre-rendering skipped: ${error?.message || error}`;
  if (STRICT) {
    console.error(`[prerender] ${message}`);
    process.exit(1);
  }
  // Fail-soft: every page keeps the plain shell, exactly as before pre-rendering.
  console.warn(`[prerender] WARNING ${message}. The site is served without pre-rendering.`);
});
