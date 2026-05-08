// Cloudflare Pages Function: GET /api/feed
// Returns: active 2026 outbreaks (curated, ≥ April 2026) + live news/alerts (≥ April 2026)
// + per-source health metadata so the UI can show degraded states.

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

type SourceHealth = {
  name: 'WHO' | 'GoogleNews';
  ok: boolean;
  itemCount: number;
  fetchedAt: string;
  latencyMs: number;
  error?: string;
};

const KEYWORDS =
  /hantavirus|hantaviral|\bHPS\b|\bHFRS\b|sin nombre|andes virus|puumala|hantaan|seoul virus|choclo|laguna negra|araraquara|juquitiba/i;
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function decodeEntities(s: string): string {
  return decodeOnce(decodeOnce(s));
}

function stripHtml(s: string): string {
  return decodeEntities(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRSS(xml: string, source: 'WHO' | 'GoogleNews', tier: 1 | 2): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
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
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return await res.text();
}

async function fetchSource(
  name: SourceHealth['name'],
  url: string,
  tier: 1 | 2,
): Promise<{ items: FeedItem[]; health: SourceHealth }> {
  const startedAt = Date.now();
  const fetchedAt = new Date().toISOString();
  try {
    const xml = await fetchText(url);
    const items = parseRSS(xml, name, tier);
    return {
      items,
      health: {
        name,
        ok: true,
        itemCount: items.length,
        fetchedAt,
        latencyMs: Date.now() - startedAt,
      },
    };
  } catch (e) {
    return {
      items: [],
      health: {
        name,
        ok: false,
        itemCount: 0,
        fetchedAt,
        latencyMs: Date.now() - startedAt,
        error: e instanceof Error ? e.message : String(e),
      },
    };
  }
}

export const onRequestGet: PagesFunction = async () => {
  const [who, gnews] = await Promise.all([
    fetchSource(
      'WHO',
      'https://www.who.int/rss-feeds/news-english.xml',
      1,
    ),
    fetchSource(
      'GoogleNews',
      'https://news.google.com/rss/search?q=hantavirus+OR+%22Sin+Nombre%22+OR+%22Andes+virus%22+OR+Puumala+OR+HFRS+OR+HPS&hl=en-US&gl=US&ceid=US:en',
      2,
    ),
  ]);

  const merged = [...who.items, ...gnews.items]
    .filter((it) => !Number.isNaN(new Date(it.publishedAt).getTime()))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 100);

  const sourceHealth: SourceHealth[] = [who.health, gnews.health];
  const allDown = sourceHealth.every((s) => !s.ok);
  const anyDown = sourceHealth.some((s) => !s.ok);

  // Log failures so they show up in `wrangler tail` / dashboard logs.
  for (const h of sourceHealth) {
    if (!h.ok) console.error(`[feed] ${h.name} failed: ${h.error} (${h.latencyMs}ms)`);
  }

  const body = {
    outbreaks: ACTIVE_OUTBREAKS,
    feed: merged,
    meta: {
      generatedAt: new Date().toISOString(),
      sources: SOURCE_NOTES,
      sourceHealth,
      degraded: anyDown,
      cutoff: REPORTING_CUTOFF,
      notes:
        'Reports limited to events published from 1 April 2026 onwards. Curated outbreak entries are corroborated by primary public-health sources; live items are aggregated from WHO News and Google News and filtered for hantavirus keywords.',
    },
  };

  return new Response(JSON.stringify(body), {
    status: allDown ? 503 : 200,
    headers: {
      'content-type': 'application/json',
      // 30s cache when degraded so we recover quickly; 10min when healthy.
      'cache-control': allDown
        ? 'public, max-age=30, s-maxage=30'
        : 'public, max-age=600, s-maxage=600',
      'access-control-allow-origin': '*',
    },
  });
};
