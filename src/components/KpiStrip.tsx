import type { DashboardData } from '../types';

const fmt = new Intl.NumberFormat('en-US');

function Cell({ label, value, accent, sub }: { label: string; value: string | number; accent?: string; sub?: string }) {
  return (
    <div className="px-4 py-2 border-r border-border last:border-r-0 flex-1 min-w-[140px]">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="text-xl font-semibold mt-0.5 font-mono" style={{ color: accent ?? '#e6e8eb' }}>
        {typeof value === 'number' ? fmt.format(value) : value}
      </div>
      {sub && <div className="text-[10px] text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function KpiStrip({ data }: { data: DashboardData }) {
  const cases = data.outbreaks.reduce((s, o) => s + o.totalCases, 0);
  const deaths = data.outbreaks.reduce((s, o) => s + o.totalDeaths, 0);
  const cfr = cases > 0 ? `${((deaths / cases) * 100).toFixed(1)}%` : '—';
  const monitoring = new Set(
    data.outbreaks.flatMap((o) => o.locations.map((l) => l.iso)),
  ).size;
  const alerts24h = data.feed.filter(
    (f) => Date.now() - new Date(f.publishedAt).getTime() < 24 * 3600 * 1000,
  ).length;
  const lastFeed = data.feed[0]?.publishedAt?.slice(0, 10) ?? '—';

  return (
    <div className="flex flex-wrap border-b border-border bg-panel/40">
      <Cell label="Active outbreaks" value={data.outbreaks.length} accent="#e63946" sub={`since ${data.meta.cutoff}`} />
      <Cell label="Confirmed cases" value={cases} accent="#e63946" sub="from active outbreaks" />
      <Cell label="Deaths" value={deaths} accent="#f4a261" />
      <Cell label="Case fatality" value={cfr} sub="deaths / confirmed" />
      <Cell label="Countries involved" value={monitoring} sub="origin + monitoring" />
      <Cell label="Alerts · 24h" value={alerts24h} accent={alerts24h > 0 ? '#e63946' : undefined} sub="WHO + Google News" />
      <Cell label="Latest alert" value={lastFeed} />
    </div>
  );
}
