import type { DashboardData } from '../types';

export function MethodologyDrawer({ open, onClose, data }: { open: boolean; onClose: () => void; data: DashboardData }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[480px] max-w-[95%] bg-panel border-l border-border z-40 transform transition-transform overflow-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-panel">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent">Data sources & methodology</div>
            <div className="text-base font-semibold">Where the numbers come from</div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-accent">✕</button>
        </div>

        <div className="p-4 space-y-5 text-sm">
          <section>
            <div className="bg-accent/10 border border-accent/40 rounded-lg p-3 text-xs leading-relaxed">
              <div className="font-semibold text-accent mb-1">Reporting window</div>
              We only report events published <strong>from {data.meta.cutoff} onwards</strong>. Historical baselines and pre-2026 surveillance are excluded by editorial policy.
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Active outbreaks</div>
            <ul className="space-y-2">
              {data.outbreaks.map((o) => (
                <li key={o.id} className="border border-border rounded p-3 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{o.label}</span>
                    <span className="text-muted">{o.totalCases} / {o.totalDeaths}</span>
                  </div>
                  <div className="text-[10px] text-muted mt-1">{o.startDate} → {o.lastUpdate} · {o.status}</div>
                  <a href={o.primarySource.url} target="_blank" rel="noreferrer" className="block text-[11px] text-accent hover:underline mt-1">
                    {o.primarySource.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Live alert feed</div>
            <ul className="space-y-1 text-xs">
              {data.meta.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">{s.name} ↗</a>
                </li>
              ))}
            </ul>
            <div className="text-[10px] text-muted mt-2">Items filtered by hantavirus keywords AND publish date ≥ {data.meta.cutoff}.</div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Caveats</div>
            <ul className="text-xs text-muted space-y-1.5 list-disc pl-4">
              <li>Numbers in news headlines often differ between outlets — we use the most recent value supported by the cited primary source and surface alternates in the country detail panel.</li>
              <li>"Monitoring" countries have not confirmed cases — they are tracking exposed individuals.</li>
              <li>Hantavirus is not normally transmitted person-to-person; the cruise-ship cluster is being investigated as an environmental/zoonotic exposure.</li>
              <li>For clinical or policy use, consult the linked primary source.</li>
            </ul>
          </section>

          <section className="pt-2 border-t border-border text-[10px] text-muted font-mono">
            Generated {new Date(data.meta.generatedAt).toISOString()}
          </section>
        </div>
      </aside>
    </>
  );
}
