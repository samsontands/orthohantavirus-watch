import type { DashboardData } from '../types';
import { ACTIVE_OUTBREAKS, REPORTING_CUTOFF, SOURCE_NOTES } from '../data/surveillance';

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    // 10-min cache bucket: fresh enough to surface deploys quickly, still cache-friendly per bucket.
    const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
    const res = await fetch(`/api/feed?b=${bucket}`);
    if (res.ok) return (await res.json()) as DashboardData;
  } catch {
    // fall through
  }

  return {
    outbreaks: ACTIVE_OUTBREAKS,
    feed: [],
    meta: {
      generatedAt: new Date().toISOString(),
      sources: SOURCE_NOTES,
      cutoff: REPORTING_CUTOFF,
      notes:
        'Local development: curated active outbreaks only. Live alerts (WHO/Google News) are served by the Cloudflare Pages Function and only appear when running `wrangler pages dev` or in production.',
    },
  };
}
