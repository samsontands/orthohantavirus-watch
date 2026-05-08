import type { ActiveOutbreak } from '../types';

// Reporting window: 2026-04-01 onwards. Anything older is excluded by editorial policy.
// Each outbreak entry cites a primary source and is corroborated by feed items.

export const REPORTING_CUTOFF = '2026-04-01';

export const ACTIVE_OUTBREAKS: ActiveOutbreak[] = [
  {
    id: 'cruise-2026-05',
    label: 'Cruise ship hantavirus outbreak',
    startDate: '2026-05-05',
    lastUpdate: '2026-05-08',
    status: 'active',
    strain: 'Unspecified',
    totalCases: 8,
    totalDeaths: 3,
    primarySource: {
      title: 'WHO — WHO\'s response to hantavirus cases linked to a cruise ship',
      url: 'https://www.who.int/news/',
    },
    summary:
      'Hantavirus cluster aboard a Dutch-flagged cruise ship; eight confirmed cases and three deaths reported as of 8 May 2026. Disembarked passengers being monitored across multiple countries. CDC has classified the response as Level 3.',
    locations: [
      {
        iso: 'NLD',
        country: 'Netherlands',
        region: 'Europe',
        lat: 52.1,
        lon: 5.3,
        role: 'origin',
        cases: 8,
        deaths: 3,
        note: 'Dutch-flagged vessel. Cluster epicentre.',
      },
      {
        iso: 'USA',
        country: 'United States',
        region: 'Americas',
        lat: 39.8,
        lon: -98.6,
        role: 'monitoring',
        cases: null,
        deaths: null,
        note: 'CDC Level-3 response; five states monitoring disembarked passengers (Oregon, Texas, Virginia, Arizona, plus one further state per CDC).',
      },
      {
        iso: 'GBR',
        country: 'United Kingdom',
        region: 'Europe',
        lat: 54.0,
        lon: -2.5,
        role: 'monitoring',
        cases: null,
        deaths: null,
        note: 'British passengers placed under 45-day self-isolation per BBC, 7 May.',
      },
      {
        iso: 'JPN',
        country: 'Japan',
        region: 'Asia',
        lat: 36.2,
        lon: 138.3,
        role: 'monitoring',
        cases: null,
        deaths: null,
        note: 'Japan health authorities issued public guidance on cruise-linked exposure (Japan Times).',
      },
      {
        iso: 'SGP',
        country: 'Singapore',
        region: 'Asia',
        lat: 1.35,
        lon: 103.8,
        role: 'monitoring',
        cases: null,
        deaths: null,
        note: 'Two residents being tested following cruise exposure (Reuters).',
      },
    ],
  },
];

export const SOURCE_NOTES = [
  { name: 'WHO News (English)', url: 'https://www.who.int/news' },
  { name: 'CDC Hantavirus', url: 'https://www.cdc.gov/hantavirus/' },
  { name: 'ECDC Hantavirus', url: 'https://www.ecdc.europa.eu/en/hantavirus-infection' },
  { name: 'PAHO Hantavirus', url: 'https://www.paho.org/en/topics/hantavirus' },
  { name: 'Google News (hantavirus query)', url: 'https://news.google.com/search?q=hantavirus' },
];
