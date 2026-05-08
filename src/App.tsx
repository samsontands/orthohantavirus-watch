import { useEffect, useRef, useState } from 'react';
import type { DashboardData } from './types';
import { loadDashboardData } from './services/feed';
import { TopBar } from './components/TopBar';
import { KpiStrip } from './components/KpiStrip';
import { GlobeView } from './components/GlobeView';
import { FilterRail } from './components/FilterRail';
import { FeedRail } from './components/FeedRail';
import { CountryDetail } from './components/CountryDetail';
import { AwarenessDrawer } from './components/AwarenessDrawer';
import { MethodologyDrawer } from './components/MethodologyDrawer';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<string | null>(null);
  const [awarenessOpen, setAwarenessOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    loadDashboardData().then(setData);
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const ro = new ResizeObserver(() => setStageSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm font-mono">
        Loading 2026 outbreak data…
      </div>
    );
  }

  const filteredOutbreaks = selectedOutbreak
    ? data.outbreaks.filter((o) => o.id === selectedOutbreak)
    : data.outbreaks;

  return (
    <div className="h-full flex flex-col bg-bg text-white">
      <TopBar
        generatedAt={data.meta.generatedAt}
        onAwarenessOpen={() => setAwarenessOpen(true)}
        onSourcesOpen={() => setMethodologyOpen(true)}
      />
      <KpiStrip data={data} />

      <div className="flex-1 grid grid-cols-[300px_1fr_340px] min-h-0">
        <FilterRail
          outbreaks={data.outbreaks}
          selectedIso={selectedIso}
          onSelect={setSelectedIso}
          selectedOutbreak={selectedOutbreak}
          onSelectOutbreak={setSelectedOutbreak}
        />

        <div ref={stageRef} className="relative bg-bg overflow-hidden">
          <GlobeView
            outbreaks={filteredOutbreaks}
            selectedIso={selectedIso}
            onSelect={setSelectedIso}
            width={stageSize.w}
            height={stageSize.h}
          />
          <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest text-muted bg-panel/70 backdrop-blur border border-border rounded px-2 py-1">
            Reporting since {data.meta.cutoff} · {filteredOutbreaks.length} outbreak{filteredOutbreaks.length !== 1 ? 's' : ''}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest bg-panel/70 backdrop-blur border border-border rounded px-3 py-1.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e63946]" />Origin</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f4a261]" />Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7aa6ff]" />Monitoring</span>
          </div>
          {selectedIso && (
            <CountryDetail data={data} iso={selectedIso} onClose={() => setSelectedIso(null)} />
          )}
        </div>

        <FeedRail
          feed={data.feed}
          selectedIso={selectedIso}
          onSelect={setSelectedIso}
          sourceHealth={data.meta.sourceHealth}
        />
      </div>

      <AwarenessDrawer open={awarenessOpen} onClose={() => setAwarenessOpen(false)} />
      <MethodologyDrawer open={methodologyOpen} onClose={() => setMethodologyOpen(false)} data={data} />
    </div>
  );
}
