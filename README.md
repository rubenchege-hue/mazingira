# Mazingira ESG Platform

**Mazingira** ("environment" in Swahili) is a static ESG (Environmental, Social, Governance) and Green Finance reporting platform for Nairobi organizations.

## Features

- **Interactive Dashboard** — Full ESG reporting dashboard with score tracking, charts, and gap analysis across GRI, TCFD, SASB, SDGs, and Green Finance frameworks
- **Emissions Calculator** — Scope 1/2/3 carbon footprint calculator with Kenya-specific factors
- **AI Gap Analyser** — Framework gap analysis identifying missing disclosures
- **Green Finance Analyser** — ICMA GBP/GLP and CMA Kenya Taxonomy alignment tool
- **Materiality Matrix Builder** — Drag-to-position SASB material issues matrix with industry comparison
- **Industry Comparator** — Side-by-side ESG materiality comparison across sectors
- **Report Generator** — NSE-aligned ESG report draft generator
- **Document Vault** — Upload and manage ESG documentation
- **Data Persistence** — All data saved to localStorage, no backend required

## Getting Started

No build tools required. Open any HTML file in a browser:

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
# or
python -m http.server 8080
```

## Deployment

Deployed on Vercel. Push to `main` to trigger automatic redeployment.

```bash
vercel --prod
```

## Tech Stack

- Pure HTML/CSS/JavaScript
- Chart.js (CDN)
- Tabler Icons (CDN)
- Google Fonts (Inter)
- localStorage for persistence

## License

MIT
