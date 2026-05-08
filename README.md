# orthohantavirus.watch

Public surveillance dashboard for human hantavirus disease (HPS / HFRS).

**Stack:** Vite + React + TypeScript, Tailwind, react-globe.gl + Three.js, Recharts. Hosted on Cloudflare Pages with a Pages Function (`functions/api/feed.ts`) that aggregates live alerts from WHO, ProMED, and GDELT.

## Data sources

All numbers are real and cite their original public-health authority. See the in-app **⌕ Sources** drawer or `src/data/surveillance.ts` for the full list. No mock numbers are used.

- **Country surveillance** — CDC, PAHO, ECDC, RKI SurvStat, THL, KDCA, China CDC, Rospotrebnadzor, Sciensano, Folkhälsomyndigheten, Santé publique France, Brazil MS/SVS.
- **Live alerts** — WHO Disease Outbreak News RSS, ProMED-mail RSS, GDELT 2.0 DOC API. Filtered for hantavirus keywords; refreshed every 30 minutes via Cloudflare edge cache.
- **Annual time series** — CDC HPS reported cases by year of onset (US).

## Local development

```bash
npm install
npm run dev               # Vite at http://localhost:5173 — uses curated data only (no live feed)
npx wrangler pages dev    # full stack including the /api/feed function
```

## Deploy to Cloudflare Pages (orthohantavirus.watch)

One-time:

```bash
npx wrangler login
npx wrangler pages project create orthohantavirus-watch --production-branch main
```

Each deploy:

```bash
npm run deploy            # builds to dist/ and uploads via wrangler pages deploy
```

Then in the Cloudflare dashboard: **Pages → orthohantavirus-watch → Custom domains → Set up custom domain → `orthohantavirus.watch`**. If your domain isn't yet on Cloudflare DNS, you'll be prompted to either change nameservers or add a CNAME — Cloudflare walks you through it.

## Adding a country

Edit `src/data/surveillance.ts`. Each entry must include:

- `latest.year` — the reporting year of the figure
- `latest.cumulative` — `true` for cumulative-since-onset, `false` for annual
- `latest.sourceTitle` and `latest.sourceUrl` — the public report you took the number from

Numbers without a verifiable named source should not be added.
