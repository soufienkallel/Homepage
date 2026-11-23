#!/usr/bin/env node
// Points the git-ignored `.env` at the local Supabase stack (`supabase start`) so that
// `vercel dev` runs the site and its functions against it. See docs/dev-local.md.
//
// `.env` is the only env file of this repo (template: `.env.example`). This script updates
// the keys below in place and leaves every other line (Anthropic, Mailjet, …) untouched.
// Keys are read from `supabase status` and never printed.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const TARGET = '.env';
const PLACEHOLDERS = new Set(['', '...', 'change-me']);

let status;
try {
  status = execFileSync('supabase', ['status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: process.platform === 'win32',
  });
} catch {
  console.error('Local Supabase is not running: start Docker, then `supabase start`.');
  process.exit(1);
}

const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?(.*?)"?\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]),
  );

const supabase = parseEnv(status);
const missing = ['API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY'].filter((key) => !supabase[key]);
if (missing.length) {
  console.error(`\`supabase status\` did not return ${missing.join(', ')}.`);
  process.exit(1);
}

const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : '';
const existing = parseEnv(current);
const isSet = (key) => key in existing && !PLACEHOLDERS.has(existing[key]);

// Always follow the running local stack.
const updates = {
  SUPABASE_URL: supabase.API_URL,
  SUPABASE_SERVICE_ROLE_KEY: supabase.SERVICE_ROLE_KEY,
  VITE_SUPABASE_URL: supabase.API_URL,
  VITE_SUPABASE_ANON_KEY: supabase.ANON_KEY,
  // Site and functions share the origin under `vercel dev`: no separate API URL.
  VITE_API_BASE_URL: '',
  VITE_CHAT_API_URL: '',
};
// Filled only when absent or still a placeholder.
if (!isSet('RATE_LIMIT_SALT')) updates.RATE_LIMIT_SALT = randomBytes(16).toString('hex');
if (!isSet('CRON_SECRET')) updates.CRON_SECRET = randomBytes(24).toString('hex');
if (!isSet('PUBLIC_SITE_URL')) updates.PUBLIC_SITE_URL = 'http://localhost:3000';

const pending = new Map(Object.entries(updates));
const lines = current
  .split(/\r?\n/)
  .map((line) => {
    const key = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1];
    if (!key || !pending.has(key)) return line;
    const value = pending.get(key);
    pending.delete(key);
    return `${key}=${value}`;
  })
  .filter((line, index, all) => !(index === all.length - 1 && line === ''));
if (pending.size) {
  lines.push('', '# Added by `npm run env:local` (local Supabase stack)');
  for (const [key, value] of pending) lines.push(`${key}=${value}`);
}

writeFileSync(TARGET, `${lines.join('\n')}\n`, 'utf8');
console.log(
  `Updated ${TARGET} for the local Supabase stack at ${supabase.API_URL}: ${Object.keys(updates).join(', ')}.`,
);
