import type { ActiveOutbreak } from '../types';

const ROLE_COLOR: Record<string, string> = {
  origin: '#e63946',
  confirmed: '#f4a261',
  monitoring: '#7aa6ff',
};

type Props = {
  outbreaks: ActiveOutbreak[];
  selectedIso: string | null;
  onSelect: (iso: string | null) => void;
  selectedOutbreak: string | null;
  onSelectOutbreak: (id: string | null) => void;
};

export function FilterRail({ outbreaks, selectedIso, onSelect, selectedOutbreak, onSelectOutbreak }: Props) {
  return (
    <aside className="border-r border-border bg-panel/40 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted">Active outbreaks</div>
      </div>
      <div className="overflow-auto">
        {outbreaks.map((o) => {
          const active = selectedOutbreak === o.id;
          return (
            <div key={o.id} className={`border-b border-border ${active ? 'bg-bg/60' : ''}`}>
              <button
                onClick={() => onSelectOutbreak(active ? null : o.id)}
                className="w-full text-left px-3 py-3 hover:bg-bg/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug">{o.label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted mt-1">
                      {o.status} · since {o.startDate}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono text-accent">{o.totalCases}</div>
                    <div className="text-[10px] text-muted">cases</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted mt-2 leading-snug">{o.summary}</div>
              </button>
              <div className="px-3 pb-3 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted">Locations</div>
                {o.locations.map((l) => {
                  const isActive = selectedIso === l.iso;
                  return (
                    <button
                      key={l.iso}
                      onClick={() => onSelect(isActive ? null : l.iso)}
                      className={`w-full text-left text-xs flex items-center gap-2 px-2 py-1 rounded ${
                        isActive ? 'bg-bg/80 border-l-2 border-l-accent' : 'hover:bg-bg/40'
                      }`}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: ROLE_COLOR[l.role] }}
                      />
                      <span className="flex-1 truncate">{l.country}</span>
                      <span className="text-[10px] text-muted uppercase tracking-wider">{l.role}</span>
                    </button>
                  );
                })}
              </div>
              <a
                href={o.primarySource.url}
                target="_blank"
                rel="noreferrer"
                className="block px-3 pb-3 text-[10px] text-accent hover:underline truncate"
              >
                source: {o.primarySource.title} ↗
              </a>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
