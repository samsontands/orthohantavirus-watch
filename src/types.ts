export type Strain = 'Sin Nombre' | 'Andes' | 'Hantaan' | 'Seoul' | 'Puumala' | 'Dobrava' | 'Other' | 'Unspecified';

export type LocationRole = 'origin' | 'confirmed' | 'monitoring';

export type OutbreakLocation = {
  iso: string;
  country: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
  lat: number;
  lon: number;
  role: LocationRole;
  cases: number | null;
  deaths: number | null;
  note?: string;
};

export type ActiveOutbreak = {
  id: string;
  label: string;
  startDate: string;
  lastUpdate: string;
  status: 'active' | 'monitoring' | 'contained';
  strain: Strain;
  totalCases: number;
  totalDeaths: number;
  primarySource: { title: string; url: string };
  locations: OutbreakLocation[];
  summary: string;
};

export type FeedItem = {
  id: string;
  source: 'WHO' | 'GoogleNews' | 'CDC' | 'ECDC' | 'PAHO';
  tier: 1 | 2 | 3;
  title: string;
  url: string;
  publishedAt: string;
  country?: string;
  iso?: string;
  summary?: string;
};

export type DashboardData = {
  outbreaks: ActiveOutbreak[];
  feed: FeedItem[];
  meta: {
    generatedAt: string;
    sources: { name: string; url: string }[];
    cutoff: string; // earliest date we report
    notes: string;
  };
};
