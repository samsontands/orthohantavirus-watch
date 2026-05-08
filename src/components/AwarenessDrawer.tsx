import { symptoms, transmission, prevention } from '../data/awareness';

export function AwarenessDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[440px] max-w-[95%] bg-panel border-l border-border z-40 transform transition-transform overflow-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-panel">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent">Public awareness</div>
            <div className="text-base font-semibold">What you should know</div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-accent">✕</button>
        </div>

        <div className="p-4 space-y-5 text-sm">
          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Symptoms — early</div>
            <ul className="space-y-1.5">
              {symptoms.early.map((s) => (
                <li key={s} className="flex gap-2"><span className="text-accent">●</span><span>{s}</span></li>
              ))}
            </ul>
            <div className="text-[10px] uppercase tracking-widest text-muted mt-3 mb-2">Symptoms — later (seek care)</div>
            <ul className="space-y-1.5">
              {symptoms.late.map((s) => (
                <li key={s} className="flex gap-2"><span className="text-accent">▲</span><span>{s}</span></li>
              ))}
            </ul>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">How it spreads</div>
            <div className="space-y-2">
              {transmission.map((t) => (
                <div key={t.title} className="border border-border rounded p-3">
                  <div className="text-xs font-semibold text-accent">{t.title}</div>
                  <div className="text-xs text-muted mt-1">{t.body}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Prevention</div>
            <div className="space-y-2">
              {prevention.map((p) => (
                <div key={p.title} className="border border-border rounded p-3">
                  <div className="text-xs font-semibold">{p.title}</div>
                  <div className="text-xs text-muted mt-1">{p.body}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-2 border-t border-border">
            <a href="https://www.who.int/health-topics/hantavirus-disease" target="_blank" rel="noreferrer" className="block text-xs text-accent hover:underline">WHO →</a>
            <a href="https://www.cdc.gov/hantavirus/" target="_blank" rel="noreferrer" className="block text-xs text-accent hover:underline mt-1">CDC →</a>
          </section>
        </div>
      </aside>
    </>
  );
}
