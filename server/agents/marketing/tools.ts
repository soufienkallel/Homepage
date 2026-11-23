// Marketing agent tools — read/write agent_drafts via Supabase.
// See doc/requirements/mallouliauto_agents_specifications.md §3.2

import { supabaseAdmin } from '../shared/supabase.js';
import { runGuardrails, type GuardrailInput } from '../shared/guardrails.js';
import type {
  AgentChannel,
  AgentLanguage,
  DraftContent,
  GuardrailReport,
} from '../shared/types.js';

export interface DraftRow {
  id: string;
  channel: AgentChannel;
  language: AgentLanguage;
  body: string;
  hashtags: string[];
  image_brief: string | null;
  pillar: string;
  status: string;
  created_at: string;
}

export async function listRecentDrafts(limit = 20): Promise<DraftRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('agent_drafts')
    .select('id, channel, language, content, status, created_at')
    .eq('agent_type', 'marketing')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`[marketing/tools] listRecentDrafts: ${error.message}`);

  return (data ?? []).map((row) => {
    const c = row.content as Record<string, unknown>;
    return {
      id: row.id as string,
      channel: row.channel as AgentChannel,
      language: row.language as AgentLanguage,
      body: (c.body as string) ?? '',
      hashtags: (c.hashtags as string[]) ?? [],
      image_brief: (c.image_brief as string) ?? null,
      pillar: (c.pillar as string) ?? '',
      status: row.status as string,
      created_at: row.created_at as string,
    };
  });
}

export interface SaveDraftInput {
  channel: AgentChannel;
  language: AgentLanguage;
  content: DraftContent & { pillar?: string };
  run_id: string;
}

export interface SaveDraftResult {
  id: string | null;
  guardrails: GuardrailReport;
  status: 'pending_review' | 'rejected';
}

export async function saveDraft(input: SaveDraftInput): Promise<SaveDraftResult> {
  const guardrailInput: GuardrailInput = {
    agentType: 'marketing',
    channel: input.channel,
    language: input.language,
    content: input.content,
  };
  const guardrails = runGuardrails(guardrailInput);
  const status = guardrails.passed ? 'pending_review' : 'rejected';

  const { data, error } = await supabaseAdmin()
    .from('agent_drafts')
    .insert({
      agent_type: 'marketing',
      channel: input.channel,
      language: input.language,
      status,
      content: input.content,
      guardrails,
      run_id: input.run_id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`[marketing/tools] saveDraft: ${error.message}`);
  return { id: data?.id ?? null, guardrails, status };
}

export async function countTodayDrafts(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin()
    .from('agent_drafts')
    .select('id', { count: 'exact', head: true })
    .eq('agent_type', 'marketing')
    .gte('created_at', today.toISOString());

  if (error) throw new Error(`[marketing/tools] countTodayDrafts: ${error.message}`);
  return count ?? 0;
}
