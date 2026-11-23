// Sales agent tools — prospect management + draft saving.
// See doc/requirements/mallouliauto_agents_specifications.md §3.2, §4.2

import { supabaseAdmin } from '../shared/supabase.js';
import { runGuardrails, type GuardrailInput } from '../shared/guardrails.js';
import type {
  AgentChannel,
  AgentLanguage,
  AgentSegment,
  DraftContent,
  GuardrailReport,
  ProspectStatus,
} from '../shared/types.js';

// ─── Prospect types ────────────────────────────────────────────────

export interface Prospect {
  id: string;
  segment: AgentSegment;
  company: string;
  contact_name: string | null;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  whatsapp_e164: string | null;
  language: AgentLanguage;
  city: string | null;
  source: string;
  notes: string | null;
  status: ProspectStatus;
  last_touch_at: string | null;
  next_touch_at: string | null;
  created_at: string;
}

// ─── Prospect queries ──────────────────────────────────────────────

export async function getProspect(id: string): Promise<Prospect> {
  const { data, error } = await supabaseAdmin()
    .from('agent_prospects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data)
    throw new Error(`[sales/tools] getProspect: ${error?.message ?? 'not found'}`);
  return data as Prospect;
}

export async function listProspects(opts: {
  segment?: AgentSegment;
  status?: ProspectStatus;
  limit?: number;
}): Promise<Prospect[]> {
  let query = supabaseAdmin()
    .from('agent_prospects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.segment) query = query.eq('segment', opts.segment);
  if (opts.status) query = query.eq('status', opts.status);

  const { data, error } = await query;
  if (error) throw new Error(`[sales/tools] listProspects: ${error.message}`);
  return (data ?? []) as Prospect[];
}

export async function updateProspectStatus(
  id: string,
  status: ProspectStatus,
  extra?: { last_touch_at?: string; next_touch_at?: string }
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('agent_prospects')
    .update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`[sales/tools] updateProspectStatus: ${error.message}`);
}

// ─── Draft saving ──────────────────────────────────────────────────

export interface SaveSalesDraftInput {
  channel: AgentChannel;
  language: AgentLanguage;
  segment: AgentSegment;
  content: DraftContent;
  run_id: string;
  prospect_id: string;
}

export interface SaveSalesDraftResult {
  id: string | null;
  guardrails: GuardrailReport;
  status: 'pending_review' | 'rejected';
}

export async function saveSalesDraft(input: SaveSalesDraftInput): Promise<SaveSalesDraftResult> {
  const calComDemoUrl =
    process.env.CAL_COM_DEMO_URL ??
    'https://calendar.zoho.com/zc/view/slot-booking/zz08011220ffb6cf75cb62a5e4811b76cf2ae7ed1fa19cdea04f9e14b8c2f8a7f24dd480c6';

  const guardrailInput: GuardrailInput = {
    agentType: 'sales',
    channel: input.channel,
    language: input.language,
    content: input.content,
    calComDemoUrl,
  };
  const guardrails = runGuardrails(guardrailInput);
  const status = guardrails.passed ? 'pending_review' : 'rejected';

  const { data, error } = await supabaseAdmin()
    .from('agent_drafts')
    .insert({
      agent_type: 'sales',
      channel: input.channel,
      language: input.language,
      segment: input.segment,
      status,
      content: input.content,
      guardrails,
      run_id: input.run_id,
      prospect_id: input.prospect_id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`[sales/tools] saveSalesDraft: ${error.message}`);
  return { id: data?.id ?? null, guardrails, status };
}

// ─── Prior touches ─────────────────────────────────────────────────

export async function listProspectTouches(prospectId: string): Promise<
  Array<{
    id: string;
    channel: AgentChannel;
    status: string;
    body: string;
    created_at: string;
  }>
> {
  const { data, error } = await supabaseAdmin()
    .from('agent_drafts')
    .select('id, channel, status, content, created_at')
    .eq('agent_type', 'sales')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`[sales/tools] listProspectTouches: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    channel: row.channel as AgentChannel,
    status: row.status as string,
    body: ((row.content as Record<string, unknown>)?.body as string) ?? '',
    created_at: row.created_at as string,
  }));
}
