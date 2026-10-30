# Elizabeth Bibla Landscape Architecture — pitch landing page

Open `index.html` in any modern browser. No build step, no dependencies.

## Structure
- `index.html` — page markup (the hero planting plan is inline SVG so it can animate and respond to hover)
- `css/style.css` — design tokens, layout, responsive rules, reduced-motion support
- `js/main.js` — mobile menu, plan legend, services/seasons tabs, work filter, form validation
- `images/` — original artwork (SVG): planting plan, four season elevations, six project renderings, dogwood drawing, monogram/favicon
- `fonts/` — Gloock (display) and Hanken Grotesk (body), self-hosted, SIL Open Font License

## Before going live
- Replace the illustrated project tiles in `images/` with real project photography (keep filenames or update `src`).
- Connect the contact form (`#contactForm`) to Formspree, Resend or the CMS of choice; it currently validates and shows a confirmation only.
