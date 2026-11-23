// Single Node.js function for the agents' long-running routes: /api/agents/<group>/<name>
// (e.g. /api/agents/sales/run). The Hobby plan allows 12 Node.js functions per deployment
// (Edge functions are not counted), so these share one. Static files next to this folder
// (api/agents/sales/prospects.ts, …) take precedence over this dynamic route, so URLs,
// callers and the weekly cron are unchanged. Each handler keeps its own auth check; see
// server/agents/routes/.
// Runtime: Node.js. maxDuration is the longest of the group (sales/worker).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import marketingCorrect from '../../../server/agents/routes/marketing/correct.js';
import marketingRun from '../../../server/agents/routes/marketing/run.js';
import salesCorrect from '../../../server/agents/routes/sales/correct.js';
import salesDiscover from '../../../server/agents/routes/sales/discover.js';
import salesEnrich from '../../../server/agents/routes/sales/enrich.js';
import salesProspectsImport from '../../../server/agents/routes/sales/prospects-import.js';
import salesRun from '../../../server/agents/routes/sales/run.js';
import salesWorker from '../../../server/agents/routes/sales/worker.js';

export const config = { maxDuration: 300 };

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  'marketing/correct': marketingCorrect,
  'marketing/run': marketingRun,
  'sales/correct': salesCorrect,
  'sales/discover': salesDiscover,
  'sales/enrich': salesEnrich,
  'sales/prospects-import': salesProspectsImport,
  'sales/run': salesRun,
  'sales/worker': salesWorker,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { group, name } = req.query;
  const route = `${group}/${name}`;
  const target = Object.hasOwn(ROUTES, route) ? ROUTES[route] : null;
  if (!target) {
    return res.status(404).json({ error: 'Not found' });
  }
  // The path segments are added to the query; handlers never see them.
  delete req.query.group;
  delete req.query.name;
  return target(req, res);
}
