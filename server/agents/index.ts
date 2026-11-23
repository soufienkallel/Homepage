// @mallouliauto/agents — Marketing, Sales & Chatbot Claude agents
// See doc/requirements/mallouliauto_agents_specifications.md
export * from './shared/types.js';
export * from './shared/guardrails.js';
export * from './shared/claude-client.js';
export * from './shared/knowledge.js';
export { supabaseAdmin } from './shared/supabase.js';
export { runMarketingAgent } from './marketing/runner.js';
export type { MarketingRunOptions, MarketingRunResult } from './marketing/runner.js';
export { retryBlockedDraft } from './marketing/retry.js';
export type { RetryResult } from './marketing/retry.js';
export {
  validateImageHtml,
  isImageValidationEnabled,
  setImageRenderer,
} from './marketing/image-validator.js';
export type { RenderFn, ImageValidationResult } from './marketing/image-validator.js';
export { runSalesAgent } from './sales/runner.js';
export type { SalesRunOptions, SalesRunResult } from './sales/runner.js';
export { importProspectsFromCsv } from './sales/csv-import.js';
export type { ImportResult } from './sales/csv-import.js';
export {
  getProspect,
  listProspects,
  listProspectTouches,
  updateProspectStatus,
} from './sales/tools.js';
export type { Prospect } from './sales/tools.js';
export { discoverProspects } from './sales/discovery.js';
export type { DiscoverOptions, DiscoverResult } from './sales/discovery.js';
export { enrichProspect, enrichProspectsBatch } from './sales/enrichment.js';
export type { EnrichOptions, EnrichBatchOptions, EnrichResult } from './sales/enrichment.js';
export { runChatbot, streamChatbot } from './chatbot/runner.js';
export type { ChatMessage, ChatRunOptions, ChatRunResult } from './chatbot/runner.js';
