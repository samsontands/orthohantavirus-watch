import { useEffect, useState } from 'react';

export function TopBar({ generatedAt, onAwarenessOpen, onSourcesOpen }: { generatedAt: string; onAwarenessOpen: () => void; onSourcesOpen: () => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ageMin = Math.max(0, Math.round((now.getTime() - new Date(generatedAt).getTime()) / 60000));
  return (
    <header className="border-b border-border bg-panel/80 backdrop-blur">
      <div className="px-4 h-12 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono uppercase tracking-widest text-xs">ORTHOHANTAVIRUS.WATCH</span>
          </div>
          <span className="text-muted text-xs hidden md:inline">global surveillance · public alerts</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted font-mono">
          <span>UTC {now.toISOString().slice(11, 19)}</span>
          <span>FEED · {ageMin}m ago</span>
          <button
            onClick={onSourcesOpen}
            className="border border-border rounded px-2 py-1 hover:border-accent hover:text-accent transition"
          >
            ⌕ Sources
          </button>
          <button
            onClick={onAwarenessOpen}
            className="border border-border rounded px-2 py-1 hover:border-accent hover:text-accent transition"
          >
            ⓘ Awareness
          </button>
        </div>
      </div>
    </header>
  );
}
