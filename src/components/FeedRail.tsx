import type { FeedItem } from '../types';

const SOURCE_COLOR: Record<string, string> = {
  WHO: '#7aa6ff',
  CDC: '#5fd28b',
  ECDC: '#ffd166',
  PAHO: '#f4a261',
  GoogleNews: '#cdd0d4',
};

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

type Props = {
  feed: FeedItem[];
  selectedIso: string | null;
  onSelect: (iso: string | null) => void;
};

export function FeedRail({ feed, selectedIso, onSelect }: Props) {
  const items = selectedIso ? feed.filter((f) => f.iso === selectedIso) : feed;

  return (
    <aside className="border-l border-border bg-panel/40 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted">
          Live alerts {selectedIso ? `· ${selectedIso}` : ''}
        </div>
        {selectedIso && (
          <button onClick={() => onSelect(null)} className="text-[10px] text-muted hover:text-accent">clear ✕</button>
        )}
      </div>
      <div className="px-3 py-2 border-b border-border text-[10px] text-muted leading-snug">
        WHO News · Google News — keyword-filtered, refreshed every 10 min.
      </div>
      <div className="overflow-auto flex-1">
        {items.length === 0 && (
          <div className="px-3 py-8 text-xs text-muted leading-relaxed">
            No live alerts loaded.
            <div className="mt-2 text-[10px]">
              The live feed is served by the Cloudflare Pages Function. Run <code className="text-accent">wrangler pages dev</code> or deploy to see real WHO/ProMED/GDELT items here.
            </div>
          </div>
        )}
        {items.map((f) => (
          <a
            key={f.id}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-3 border-b border-border/60 hover:bg-bg/60"
          >
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span style={{ color: SOURCE_COLOR[f.source] }}>{f.source} · T{f.tier}</span>
              <span className="text-muted">{ago(f.publishedAt)}</span>
            </div>
            <div className="text-sm leading-snug mt-1">{f.title}</div>
            {f.summary && <div className="text-xs text-muted mt-1 line-clamp-2">{f.summary}</div>}
            {f.country && <div className="text-[10px] text-muted mt-1">📍 {f.country}</div>}
          </a>
        ))}
      </div>
    </aside>
  );
}
