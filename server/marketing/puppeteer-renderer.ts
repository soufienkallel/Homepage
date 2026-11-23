// Puppeteer-based HTML→PNG renderer for marketing OG images.
// Used when a draft has `image_html` (full HTML from Claude).
// Falls back to the Satori path for legacy `image_spec` drafts.

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { injectBrandAssets } from './brand-assets.js';
import { NOTO_SANS_ARABIC_WOFF2_BASE64 } from './arabic-font.js';

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;

/** Channel-specific image dimensions — unified 1:1 square for all platforms. */
export const CHANNEL_DIMENSIONS: Record<string, { width: number; height: number }> = {
  linkedin: { width: 1080, height: 1080 },
  facebook: { width: 1080, height: 1080 },
  instagram: { width: 1080, height: 1080 },
};

/** Minimum PNG size (bytes) for a valid rendered image. Below = blank. */
const MIN_VALID_SIZE = 10_000;

/**
 * Wrap a bare SVG string in a minimal HTML document so Puppeteer
 * renders it full-viewport (1080×1080) without margins/scrollbars.
 */
function wrapSvgInHtml(svg: string, w: number, h: number): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden}svg{width:${w}px;height:${h}px;display:block}</style></head><body>${svg}</body></html>`;
}

/**
 * Sanitize HTML that failed to render in headless Chrome.
 * Fixes known issues:
 * - Moves dir="rtl" from <html> to a wrapper div inside <body>
 * - Removes direction:rtl from html/body CSS
 * - Strips backdrop-filter (unsupported in some headless builds)
 */
function sanitizeForHeadless(html: string): string {
  let s = html;
  // Move dir="rtl" from <html> to a wrapper div
  s = s.replace(/<html([^>]*)\s+dir=["']rtl["']([^>]*)>/i, '<html$1$2>');
  // Remove direction:rtl from style blocks
  s = s.replace(/direction\s*:\s*rtl\s*;?/gi, '');
  // Wrap body content in an RTL div
  s = s.replace(
    /<body([^>]*)>([\s\S]*)<\/body>/i,
    '<body$1><div style="direction:rtl;width:100%;height:100%">$2</div></body>'
  );
  // Strip backdrop-filter
  s = s.replace(/backdrop-filter\s*:[^;]+;?/gi, '');
  return s;
}

/**
 * Inject Arabic @font-face if the HTML contains Arabic characters.
 * Vercel's serverless Chrome doesn't have Arabic fonts installed.
 */
function injectArabicFont(html: string): string {
  // Check if HTML contains Arabic Unicode characters (U+0600-U+06FF)
  if (!/[\u0600-\u06FF]/.test(html)) {
    return html;
  }
  const fontFace = `<style>@font-face{font-family:'Noto Sans Arabic';font-style:normal;font-weight:400 700;font-display:block;src:url(data:font/woff2;base64,${NOTO_SANS_ARABIC_WOFF2_BASE64}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFC;}*{font-family:'Noto Sans Arabic',Arial,sans-serif!important;}</style>`;
  // Inject after <head> or at the beginning of <style>
  if (html.includes('</head>')) {
    return html.replace('</head>', fontFace + '</head>');
  }
  // Fallback: inject at start of <body>
  return html.replace(/<body([^>]*)>/i, `<body$1>${fontFace}`);
}

/**
 * Render an HTML document to a PNG buffer using Puppeteer.
 * Defaults to 1200×630 (LinkedIn). Pass a channel name to use channel-specific dimensions.
 */
export async function renderHtmlToPng(html: string, channel?: string): Promise<Buffer> {
  const dims = (channel && CHANNEL_DIMENSIONS[channel]) || {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  };
  const { width, height } = dims;

  // Replace brand placeholder tokens with real SVG data URIs
  html = injectBrandAssets(html);

  // Inject Arabic font if needed (Vercel Chrome has no Arabic fonts)
  html = injectArabicFont(html);

  // Auto-wrap bare SVG fragments in a proper HTML document
  const trimmed = html.trimStart();
  if (!trimmed.startsWith('<!') && !trimmed.toLowerCase().startsWith('<html')) {
    html = wrapSvgInHtml(html, width, height);
  }

  // First attempt: render as-is
  const buf = await renderWithPuppeteer(html, width, height);
  if (buf.length >= MIN_VALID_SIZE) {
    return buf;
  }

  // Second attempt: sanitize HTML to fix known headless Chrome issues
  const sanitized = sanitizeForHeadless(html);
  const buf2 = await renderWithPuppeteer(sanitized, width, height);
  if (buf2.length >= MIN_VALID_SIZE) {
    return buf2;
  }

  throw new Error(
    `Render produced a blank image (${buf2.length} bytes) even after sanitization. ` +
      'The HTML may use unsupported CSS features in headless Chrome.'
  );
}

async function renderWithPuppeteer(html: string, width: number, height: number): Promise<Buffer> {
  // Filter out old headless shell mode — RTL pages render blank in shell mode.
  const args = chromium.args.filter((a: string) => !a.includes('headless'));

  const browser = await puppeteer.launch({
    args,
    defaultViewport: { width, height },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Block all external network requests for security
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('about:') || url.startsWith('blob:')) {
        req.continue();
      } else {
        req.abort('blockedbyclient');
      }
    });

    // Set content directly (no navigation to external URL)
    await page.setContent(html, { waitUntil: 'load' });

    // Small delay to ensure CSS paint completes (gradients, compositing)
    await new Promise((r) => setTimeout(r, 300));

    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width, height },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
