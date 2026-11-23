// GET /api/admin/analytics?period=7j|30j|lancement&campaign=<name>|_none
// Everything the admin dashboard shows, in one call (docs/specs/2026-09-admin-analytics.md):
// visits (public.homepage_visit_stats), requests of the period classified with the same
// source rules (src/lib/trafficSource.js), requests to handle, and the AI agents' queue.
// Auth: admin Supabase session (server/adminAuth.js). Runtime: Edge.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAdmin } from '../../server/adminAuth.js';
import { classifySource } from '../../src/lib/trafficSource.js';

export const config = { runtime: 'edge' };

const DAY_MS = 24 * 60 * 60 * 1000;
// Tunisia is on UTC+1 all year (no daylight saving time since 2009).
const TUNIS_OFFSET_MS = 60 * 60 * 1000;
// Commercial launch of the site's campaign (docs/campagne-utm.md), midnight Tunis time.
const LAUNCH_DATE = '2026-09-28';
const PERIODS: Record<string, number | 'launch'> = { '7j': 7, '30j': 30, lancement: 'launch' };
const OPEN_STATUSES = ['nouvelle', 'contactee'];
const MAX_SOURCE_ROWS = 10;
const MAX_TRANSITION_ROWS = 12;
const MAX_REQUESTS = 5000;

type RequestRow = {
  created_at: string;
  kind: string;
  status: string;
  utm: Record<string, string> | null;
  referrer: string | null;
};

type VisitStats = {
  visits: number;
  campaignVisits: number;
  formOpened: number;
  // Absent until migration 20261002110000_visit_stats_pricing is applied.
  pricingViewed?: number;
  pricingThenForm?: number;
  sources: { source: string; medium: string | null; visits: number }[];
  days: { date: string; visits: number }[];
  ads: { campaign: string; content: string | null; sources: string[]; visits: number }[];
  // Absent until migration 20261002120000_visit_stats_pages is applied.
  pages?: { path: string; views: number; visits: number; entries: number }[];
  transitions?: { from: string; to: string; visits: number }[];
  devices: Record<string, number>;
  campaigns: string[];
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/** Tunis calendar date (YYYY-MM-DD) of an instant. */
function tunisDate(time: number): string {
  return new Date(time + TUNIS_OFFSET_MS).toISOString().slice(0, 10);
}

/** Instant of midnight, Tunis time, on a YYYY-MM-DD date. */
function tunisMidnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) - TUNIS_OFFSET_MS;
}

function periodBounds(key: string, now: number): { from: number; to: number } {
  const period = PERIODS[key] ?? PERIODS['7j'];
  const todayStart = tunisMidnight(tunisDate(now));
  // Before the launch date, "since launch" is simply today.
  if (period === 'launch')
    return { from: Math.min(tunisMidnight(LAUNCH_DATE), todayStart), to: now };
  return { from: todayStart - (period - 1) * DAY_MS, to: now };
}

function campaignMatches(filter: string | null, campaign: string | null): boolean {
  if (filter === null) return true;
  if (filter === '') return campaign === null;
  return campaign === filter;
}

async function countOf(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function agentQueue(supabase: SupabaseClient) {
  const drafts = (agentType: string) =>
    supabase
      .from('agent_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('agent_type', agentType)
      .eq('status', 'pending_review');
  // The agents' tables may be absent on a fresh local stack: their queue is secondary.
  try {
    const [marketingDrafts, salesDrafts, jobsQueued] = await Promise.all([
      countOf(drafts('marketing')),
      countOf(drafts('sales')),
      countOf(
        supabase
          .from('agent_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'queued')
      ),
    ]);
    return { marketingDrafts, salesDrafts, jobsQueued };
  } catch {
    return null;
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  const admin = await getAdmin(request);
  if (!admin) return json(401, { error: 'unauthorized' });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(503, { error: 'unavailable' });
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const params = new URL(request.url).searchParams;
  const periodKey =
    PERIODS[params.get('period') ?? ''] !== undefined ? params.get('period')! : '7j';
  const rawCampaign = params.get('campaign');
  const campaign =
    rawCampaign === null || rawCampaign === '' ? null : rawCampaign === '_none' ? '' : rawCampaign;

  const now = Date.now();
  const { from, to } = periodBounds(periodKey, now);
  const fromIso = new Date(from).toISOString();
  const toIso = new Date(to).toISOString();

  try {
    // Retention: page views older than 13 months go (privacy policy). Cheap, indexed.
    const purge = supabase.rpc('purge_old_page_views');
    const [stats, requests, toHandle, late, agents] = await Promise.all([
      supabase.rpc('homepage_visit_stats', { p_from: fromIso, p_to: toIso, p_campaign: campaign }),
      supabase
        .from('contact_requests')
        .select('created_at, kind, status, utm, referrer')
        .gte('created_at', fromIso)
        .lt('created_at', toIso)
        .order('created_at', { ascending: true })
        .limit(MAX_REQUESTS),
      countOf(
        supabase
          .from('contact_requests')
          .select('id', { count: 'exact', head: true })
          .in('status', OPEN_STATUSES)
      ),
      countOf(
        supabase
          .from('contact_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'nouvelle')
          .lt('created_at', new Date(now - DAY_MS).toISOString())
      ),
      agentQueue(supabase),
    ]);
    if (stats.error) throw stats.error;
    if (requests.error) throw requests.error;
    const { error: purgeError } = await purge;
    if (purgeError) console.error('[admin/analytics] purge failed:', purgeError.message);

    const visits = stats.data as VisitStats;
    const classified = ((requests.data ?? []) as RequestRow[])
      .map((row) => ({ ...row, origin: classifySource({ utm: row.utm, referrer: row.referrer }) }))
      .filter((row) => campaignMatches(campaign, row.origin.campaign));

    // Sources: visits and requests joined on source · medium.
    const sources = new Map<
      string,
      { source: string; medium: string | null; visits: number; requests: number; done: number }
    >();
    const sourceRow = (source: string, medium: string | null) => {
      const id = `${source}\u0000${medium ?? ''}`;
      if (!sources.has(id)) sources.set(id, { source, medium, visits: 0, requests: 0, done: 0 });
      return sources.get(id)!;
    };
    for (const row of visits.sources) sourceRow(row.source, row.medium).visits += row.visits;
    for (const row of classified) {
      const entry = sourceRow(row.origin.source, row.origin.medium);
      entry.requests += 1;
      if (row.kind === 'inspection' && row.status === 'realisee') entry.done += 1;
    }
    const sortedSources = [...sources.values()].sort(
      (a, b) => b.visits - a.visits || b.requests - a.requests || a.source.localeCompare(b.source)
    );
    const others = sortedSources.slice(MAX_SOURCE_ROWS).reduce(
      (sum, row) => ({
        source: 'autres',
        medium: null,
        visits: sum.visits + row.visits,
        requests: sum.requests + row.requests,
        done: sum.done + row.done,
      }),
      { source: 'autres', medium: null, visits: 0, requests: 0, done: 0 }
    );
    const sourceRows = sortedSources.slice(0, MAX_SOURCE_ROWS);
    if (sortedSources.length > MAX_SOURCE_ROWS) sourceRows.push(others);

    // Days of the period, zeros included, in Tunis time.
    const visitsByDay = new Map(visits.days.map((d) => [d.date, d.visits]));
    const requestsByDay = new Map<string, number>();
    for (const row of classified) {
      const day = tunisDate(Date.parse(row.created_at));
      requestsByDay.set(day, (requestsByDay.get(day) ?? 0) + 1);
    }
    const days = [];
    for (let t = tunisMidnight(tunisDate(from)); t <= to; t += DAY_MS) {
      const date = tunisDate(t);
      days.push({
        date,
        visits: visitsByDay.get(date) ?? 0,
        requests: requestsByDay.get(date) ?? 0,
      });
    }

    // Ads (utm_content) of campaign links.
    const adRequests = new Map<string, number>();
    for (const row of classified) {
      if (!row.origin.campaign) continue;
      const id = `${row.origin.campaign}\u0000${row.origin.content ?? ''}`;
      adRequests.set(id, (adRequests.get(id) ?? 0) + 1);
    }
    const ads = visits.ads
      .map((ad) => ({
        campaign: ad.campaign,
        content: ad.content,
        sources: ad.sources,
        visits: ad.visits,
        requests: adRequests.get(`${ad.campaign}\u0000${ad.content ?? ''}`) ?? 0,
      }))
      .sort((a, b) => b.visits - a.visits);

    const inspections = classified.filter((row) => row.kind === 'inspection');
    return json(200, {
      period: { key: periodKey, from: fromIso, to: toIso },
      campaign: rawCampaign ?? '',
      campaigns: visits.campaigns.sort(),
      totals: {
        visits: visits.visits,
        campaignVisits: visits.campaignVisits,
        requests: classified.length,
        inspections: inspections.length,
        contacts: classified.length - inspections.length,
      },
      toHandle,
      late,
      sources: sourceRows,
      days,
      funnel: {
        visits: visits.visits,
        formOpened: visits.formOpened,
        pricingViewed: visits.pricingViewed ?? 0,
        pricingThenForm: visits.pricingThenForm ?? 0,
        inspectionRequests: inspections.length,
        inspectionsDone: inspections.filter((row) => row.status === 'realisee').length,
      },
      ads,
      pages: (visits.pages ?? []).sort(
        (a, b) => b.visits - a.visits || b.views - a.views || a.path.localeCompare(b.path)
      ),
      transitions: (visits.transitions ?? [])
        .sort((a, b) => b.visits - a.visits || a.from.localeCompare(b.from))
        .slice(0, MAX_TRANSITION_ROWS),
      devices: {
        mobile: visits.devices.mobile ?? 0,
        desktop: visits.devices.desktop ?? 0,
        tablet: visits.devices.tablet ?? 0,
      },
      agents,
    });
  } catch (err) {
    console.error('[admin/analytics] failed:', (err as Error)?.message || err);
    return json(500, { error: 'server_error' });
  }
}
