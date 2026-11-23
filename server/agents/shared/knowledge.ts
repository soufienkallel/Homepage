// Loader for the knowledge base used by both agents.
// Source: Supabase agent_knowledge table (dynamic, editable via admin UI).

import type { AgentSegment } from './types.js';
import { supabaseAdmin } from './supabase.js';

export interface KnowledgeBundle {
  company: string;
  voice: string;
  proof: string;
  valueProp: string;
  source: 'database';
}

/**
 * Load knowledge from Supabase.
 * Throws if the database is unreachable or returns no entries.
 */
export async function loadKnowledge(segment: AgentSegment | null): Promise<KnowledgeBundle> {
  const { data, error } = await supabaseAdmin()
    .from('agent_knowledge')
    .select('category, content')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Knowledge base query failed: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error('Knowledge base is empty — seed the agent_knowledge table first.');
  }

  const byCategory = new Map(data.map((row) => [row.category, row.content]));

  const segmentKey = segment ? `value_prop_${segment}` : null;

  return {
    company: byCategory.get('company') ?? '',
    voice: byCategory.get('voice') ?? '',
    proof: byCategory.get('proof') ?? '',
    valueProp: segmentKey ? (byCategory.get(segmentKey) ?? '') : '',
    source: 'database',
  };
}
