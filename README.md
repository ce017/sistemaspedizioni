# Sistema Spedizioni — Website

Static website for Sistema Spedizioni S.r.l. (international freight forwarding & integrated logistics, Pordenone, Italy).

## Stack
- Pure HTML / CSS / vanilla JS — no build step, deploys anywhere as static files
- Three.js (CDN) — animated hero globe with shipping routes
- Client-side i18n — 5 languages (IT, EN, FR, DE, ES), auto-detected from the browser locale, manual switcher in the nav, preference persisted in `localStorage`

## Pages
- `index.html` — home (hero globe, services, stats, reviews, partners)
- `chi-siamo.html` — about, Girelli partnership, environmental commitment
- `servizi.html` — sea / air / road / rail / project cargo / logistics
- `contatti.html` — contacts, quote request form (mailto), map

## Deploy
Any static host. On Vercel: import the repo, framework preset **Other**, no build command, output directory `/`.
