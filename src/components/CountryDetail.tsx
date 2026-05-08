import type { DashboardData } from '../types';

type Props = {
  data: DashboardData;
  iso: string;
  onClose: () => void;
};

export function CountryDetail({ data, iso, onClose }: Props) {
  // collect all locations across outbreaks for this iso
  const matches = data.outbreaks.flatMap((o) =>
    o.locations.filter((l) => l.iso === iso).map((l) => ({ outbreak: o, location: l })),
  );
  if (matches.length === 0) return null;

  const head = matches[0].location;
  const articles = data.feed.filter((f) => f.iso === iso).slice(0, 6);

  const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="text-lg font-mono font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  );

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[680px] max-w-[92%] bg-panel/95 backdrop-blur border border-border rounded-lg shadow-2xl z-10">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-xs text-muted font-mono">{head.iso} · {head.region}</div>
          <div className="text-base font-semibold">{head.country}</div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-accent text-sm">✕</button>
      </div>

      {matches.map(({ outbreak, location }) => (
        <div key={outbreak.id} className="border-b border-border">
          <div className="px-4 py-2 text-xs flex items-center justify-between">
            <span className="text-accent font-medium">{outbreak.label}</span>
            <span className="text-[10px] text-muted uppercase tracking-wider">{location.role}</span>
          </div>
          <div className="px-4 pb-3 flex gap-4">
            <Stat label="Cases" value={location.cases !== null ? location.cases.toLocaleString() : '—'} accent="#e63946" />
            <Stat label="Deaths" value={location.deaths !== null ? location.deaths.toLocaleString() : '—'} accent="#f4a261" />
            <Stat label="Outbreak total" value={`${outbreak.totalCases} / ${outbreak.totalDeaths}`} />
            <Stat label="Last update" value={outbreak.lastUpdate} />
          </div>
          {location.note && (
            <div className="px-4 pb-3 text-xs text-muted">{location.note}</div>
          )}
        </div>
      ))}

      {articles.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Recent alerts mentioning {head.country}</div>
          <ul className="space-y-1">
            {articles.map((a) => (
              <li key={a.id} className="text-xs">
                <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                  <span className="text-muted font-mono mr-2">[{a.source}]</span>
                  {a.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 py-2 text-[10px] text-muted font-mono">
        Window: data ≥ {data.meta.cutoff}
      </div>
    </div>
  );
}
