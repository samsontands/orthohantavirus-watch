// Cloudflare Pages Function: GET /api/feed
// Returns: active 2026 outbreaks (curated, ≥ April 2026) + live news/alerts (filtered to ≥ April 2026)
// Cached on Cloudflare edge for 10 minutes.

import { ACTIVE_OUTBREAKS, REPORTING_CUTOFF, SOURCE_NOTES } from '../../src/data/surveillance';

type FeedItem = {
  id: string;
  source: 'WHO' | 'GoogleNews';
  tier: 1 | 2 | 3;
  title: string;
  url: string;
  publishedAt: string;
  country?: string;
  iso?: string;
  summary?: string;
};

const KEYWORDS = /hantavirus|hantaviral|\bHPS\b|\bHFRS\b|sin nombre|andes virus|puumala|hantaan|seoul virus|choclo|laguna negra|araraquara|juquitiba/i;
const CUTOFF_MS = new Date(REPORTING_CUTOFF).getTime();

const COUNTRY_TO_ISO: Record<string, string> = {
  'United States': 'USA', USA: 'USA', US: 'USA',
  Argentina: 'ARG', Chile: 'CHL', Brazil: 'BRA', Panama: 'PAN', Bolivia: 'BOL', Paraguay: 'PRY', Uruguay: 'URY', Peru: 'PER',
  Canada: 'CAN', Mexico: 'MEX',
  China: 'CHN', 'Republic of Korea': 'KOR', 'South Korea': 'KOR', Korea: 'KOR', Japan: 'JPN', Singapore: 'SGP',
  Russia: 'RUS', 'Russian Federation': 'RUS',
  Finland: 'FIN', Sweden: 'SWE', Norway: 'NOR', Germany: 'DEU', France: 'FRA', Belgium: 'BEL', Netherlands: 'NLD',
  Slovenia: 'SVN', Croatia: 'HRV', Austria: 'AUT', Switzerland: 'CHE',
  'United Kingdom': 'GBR', UK: 'GBR', Britain: 'GBR', British: 'GBR',
};

function extractIso(text: string): { country?: string; iso?: string } {
  for (const [name, iso] of Object.entries(COUNTRY_TO_ISO)) {
    if (text.includes(name)) return { country: name, iso };
  }
  return {};
}

function decodeOnce(s: string): string {
  return s
    .replace(/&amp;/g, '&')      // unwrap double-encoding first
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function decodeEntities(s: string): string {
  // Some sources double-encode (&amp;nbsp;). Run twice; idempotent on single-encoded text.
  return decodeOnce(decodeOnce(s));
}

function stripHtml(s: string): string {
  return decodeEntities(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRSS(xml: string, source: 'WHO' | 'GoogleNews', tier: 1 | 2): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let m;
  let i = 0;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block);
      if (!r) return '';
      const raw = r[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
      return stripHtml(raw);
    };
    const title = get('title');
    const link = get('link');
    const desc = get('description');
    const pub = get('pubDate') || get('dc:date') || new Date().toISOString();
    const blob = `${title} ${desc}`;
    if (!KEYWORDS.test(blob)) continue;
    const ts = new Date(pub).getTime();
    if (Number.isNaN(ts) || ts < CUTOFF_MS) continue;
    const { country, iso } = extractIso(blob);
    items.push({
      id: `${source}-${i++}-${ts}`,
      source,
      tier,
      title,
      url: link,
      publishedAt: new Date(pub).toISOString(),
      country,
      iso,
      summary: desc.slice(0, 280),
    });
  }
  return items;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'OrthohantavirusWatch/0.1 (+https://orthohantavirus.watch)' },
    cf: { cacheTtl: 600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.text();
}

async function fetchWHO(): Promise<FeedItem[]> {
  try {
    const xml = await fetchText('https://www.who.int/rss-feeds/news-english.xml');
    return parseRSS(xml, 'WHO', 1);
  } catch {
    return [];
  }
}

async function fetchGoogleNews(): Promise<FeedItem[]> {
  try {
    const xml = await fetchText(
      'https://news.google.com/rss/search?q=hantavirus+OR+%22Sin+Nombre%22+OR+%22Andes+virus%22+OR+Puumala+OR+HFRS+OR+HPS&hl=en-US&gl=US&ceid=US:en',
    );
    return parseRSS(xml, 'GoogleNews', 2);
  } catch {
    return [];
  }
}

export const onRequestGet: PagesFunction = async () => {
  const [whoIt, gnewsIt] = await Promise.all([fetchWHO(), fetchGoogleNews()]);

  const merged = [...whoIt, ...gnewsIt]
    .filter((it) => !Number.isNaN(new Date(it.publishedAt).getTime()))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 100);

  const body = {
    outbreaks: ACTIVE_OUTBREAKS,
    feed: merged,
    meta: {
      generatedAt: new Date().toISOString(),
      sources: SOURCE_NOTES,
      cutoff: REPORTING_CUTOFF,
      notes:
        'Reports limited to events published from 1 April 2026 onwards. Curated outbreak entries are corroborated by primary public-health sources; live items are aggregated from WHO News and Google News and filtered for hantavirus keywords.',
    },
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=600, s-maxage=600',
      'access-control-allow-origin': '*',
    },
  });
};
