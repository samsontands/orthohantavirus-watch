import { useEffect, useRef, useMemo } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import type { ActiveOutbreak, OutbreakLocation } from '../types';

type Point = OutbreakLocation & { outbreakId: string; outbreakLabel: string };

type Arc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

const ROLE_COLOR: Record<string, string> = {
  origin: '#e63946',
  confirmed: '#f4a261',
  monitoring: '#7aa6ff',
};

type Props = {
  outbreaks: ActiveOutbreak[];
  selectedIso: string | null;
  onSelect: (iso: string | null) => void;
  width: number;
  height: number;
};

export function GlobeView({ outbreaks, selectedIso, onSelect, width, height }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const points = useMemo<Point[]>(
    () =>
      outbreaks.flatMap((o) =>
        o.locations.map((l) => ({ ...l, outbreakId: o.id, outbreakLabel: o.label })),
      ),
    [outbreaks],
  );

  const arcs = useMemo<Arc[]>(() => {
    return outbreaks.flatMap((o) => {
      const origin = o.locations.find((l) => l.role === 'origin');
      if (!origin) return [];
      return o.locations
        .filter((l) => l.role !== 'origin')
        .map((l) => ({
          startLat: origin.lat,
          startLng: origin.lon,
          endLat: l.lat,
          endLng: l.lon,
        }));
    });
  }, [outbreaks]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.35;
    g.controls().enableZoom = true;
    g.pointOfView({ lat: 30, lng: 0, altitude: 2.2 }, 0);
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || !selectedIso) return;
    const p = points.find((x) => x.iso === selectedIso);
    if (p) g.pointOfView({ lat: p.lat, lng: p.lon, altitude: 1.5 }, 1200);
  }, [selectedIso, points]);

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="#0b0d10"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="#e63946"
      atmosphereAltitude={0.18}
      pointsData={points}
      pointLat={(d: object) => (d as Point).lat}
      pointLng={(d: object) => (d as Point).lon}
      pointColor={(d: object) => ROLE_COLOR[(d as Point).role] ?? '#cdd0d4'}
      pointAltitude={(d: object) => ((d as Point).role === 'origin' ? 0.4 : 0.12)}
      pointRadius={(d: object) => ((d as Point).role === 'origin' ? 1.2 : 0.6)}
      pointLabel={(d: object) => {
        const p = d as Point;
        const cases = p.cases !== null ? `<div><span style="color:#e63946">${p.cases}</span> cases</div>` : '';
        const deaths = p.deaths !== null ? `<div><span style="color:#f4a261">${p.deaths}</span> deaths</div>` : '';
        return `<div style="background:#14181d;border:1px solid #252a31;padding:8px 10px;border-radius:6px;font-family:ui-sans-serif;color:#e6e8eb;max-width:240px">
          <div style="font-weight:600">${p.country}</div>
          <div style="color:#8a939c;font-size:11px;margin-top:2px">${p.role.toUpperCase()} · ${p.outbreakLabel}</div>
          ${cases}${deaths}
          <div style="color:#8a939c;font-size:10px;margin-top:6px">click to zoom</div>
        </div>`;
      }}
      onPointClick={(d: object) => onSelect((d as Point).iso)}
      arcsData={arcs}
      arcColor={() => ['rgba(230,57,70,0.05)', 'rgba(230,57,70,0.85)']}
      arcStroke={0.4}
      arcDashLength={0.4}
      arcDashGap={1.6}
      arcDashAnimateTime={3500}
      arcAltitudeAutoScale={0.4}
      onGlobeClick={() => onSelect(null)}
    />
  );
}
