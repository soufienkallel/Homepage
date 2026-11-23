// CSV import for sales prospects — Zod-validated rows.
// See doc/requirements/mallouliauto_agents_specifications.md §4.2

import { z } from 'zod';
import { supabaseAdmin } from '../shared/supabase.js';
import type { AgentLanguage } from '../shared/types.js';

const CsvRowSchema = z.object({
  segment: z.enum(['insurance', 'garage', 'dealer', 'fleet', 'b2c']),
  company: z.string().min(1, 'company is required'),
  contact_name: z.string().optional().default(''),
  role: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  whatsapp_e164: z
    .string()
    .regex(/^\+\d{8,15}$/, 'Must be E.164 format')
    .optional()
    .or(z.literal('')),
  language: z.enum(['fr', 'ar', 'en']).optional().default('fr'),
  city: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

/**
 * Parse a CSV string into validated prospect rows and insert into Supabase.
 * First row must be a header. Semicolon (;) or comma (,) delimited.
 */
export async function importProspectsFromCsv(csvText: string): Promise<ImportResult> {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return {
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: 'CSV must have at least a header and one data row' }],
    };
  }

  // Detect delimiter
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));

  const results: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const toInsert: Array<Record<string, unknown>> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter).map((v) => v.trim());
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = values[idx] ?? '';
    });

    const parsed = CsvRowSchema.safeParse(raw);
    if (!parsed.success) {
      results.errors.push({
        row: i + 1,
        message: parsed.error.issues.map((e) => `${e.path}: ${e.message}`).join('; '),
      });
      continue;
    }

    const row = parsed.data;
    toInsert.push({
      segment: row.segment,
      company: row.company,
      contact_name: row.contact_name || null,
      role: row.role || null,
      email: row.email || null,
      linkedin_url: row.linkedin_url || null,
      whatsapp_e164: row.whatsapp_e164 || null,
      language: (row.language || 'fr') as AgentLanguage,
      city: row.city || null,
      source: 'csv',
      notes: row.notes || null,
      status: 'new',
    });
  }

  if (toInsert.length === 0) {
    return results;
  }

  // Upsert by email (skip duplicates)
  const { data, error } = await supabaseAdmin()
    .from('agent_prospects')
    .insert(toInsert)
    .select('id');

  if (error) {
    // If unique constraint error, try one-by-one
    if (error.code === '23505') {
      for (const prospect of toInsert) {
        const { error: singleErr } = await supabaseAdmin()
          .from('agent_prospects')
          .insert(prospect)
          .select('id');
        if (singleErr) {
          results.skipped++;
        } else {
          results.imported++;
        }
      }
    } else {
      throw new Error(`[sales/csv-import] Batch insert failed: ${error.message}`);
    }
  } else {
    results.imported = data?.length ?? toInsert.length;
  }

  return results;
}
