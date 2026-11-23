// Image HTML validation — attempts a Puppeteer render to catch broken HTML early.
// Opt-in via AGENT_VALIDATE_IMAGES=true (adds latency per draft).
// Used by the runner to trigger retry if image fails to render.

import type { DraftContent } from '../shared/types.js';

/**
 * Whether image validation is enabled (opt-in via env var).
 */
export function isImageValidationEnabled(): boolean {
  return process.env.AGENT_VALIDATE_IMAGES === 'true';
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Render function signature — matches puppeteer-renderer's renderHtmlToPng.
 * Injected at runtime to avoid cross-package import issues.
 */
export type RenderFn = (html: string) => Promise<Buffer>;

/** Module-level render function. Set via `setImageRenderer` before calling `validateImageHtml`. */
let _renderFn: RenderFn | null = null;

/**
 * Register the Puppeteer render function. Call this from the API layer
 * (which has access to puppeteer-renderer) before invoking the runner.
 */
export function setImageRenderer(fn: RenderFn): void {
  _renderFn = fn;
}

/**
 * Validate that an image_html string renders to a non-empty PNG.
 * Requires `setImageRenderer` to have been called first.
 */
export async function validateImageHtml(content: DraftContent): Promise<ImageValidationResult> {
  const html = content.image_html;

  if (!html) {
    // No image HTML to validate — skip
    return { valid: true };
  }

  if (html.length < 50) {
    return { valid: false, error: 'image_html too short (likely incomplete)' };
  }

  // Basic structural checks before expensive Puppeteer render
  if (!html.includes('<html') && !html.includes('<body') && !html.includes('<div')) {
    return { valid: false, error: 'image_html missing basic HTML structure' };
  }

  // Check for channel-appropriate viewport dimension hints (1200×630 for linkedin, 1080×1080 for instagram/facebook)
  if (!html.includes('1200') && !html.includes('630') && !html.includes('1080')) {
    return {
      valid: false,
      error: 'image_html does not reference expected dimensions (1200×630 or 1080×1080)',
    };
  }

  if (!_renderFn) {
    // No renderer registered — skip Puppeteer validation (structural checks only)
    return { valid: true };
  }

  try {
    const buffer = await _renderFn(html);

    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Puppeteer produced empty buffer' };
    }

    // PNG minimum: a valid 1200×630 PNG should be at least ~1KB
    if (buffer.length < 1024) {
      return { valid: false, error: `Rendered PNG suspiciously small (${buffer.length} bytes)` };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Puppeteer render failed: ${(err as Error).message}`,
    };
  }
}
