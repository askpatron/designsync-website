# Design Sync — Marketing Website

The public marketing site for trydesignsync.com. **Separate from the ops app** (`designsync/`, app.trydesignsync.com): this site is the shop window; the app holds the onboarding forms (`/start`, `/buy`) that every CTA here points at.

**Stack:** static HTML + CSS + vanilla JS, no build step. Deploy = upload the folder.
**Local:** `preview_start designsync-website` → http://localhost:8110 (port registered in the workspace `launch.json`).
**Design source:** Figma "Design sync Website - Branding", node `4307-12434`. Built pixel-faithful from a full-res render (the Figma MCP context/metadata endpoints time out on this file; screenshots work).

## Brand tokens (from the Figma render + docs/campaign/06-BRAND-TOKENS.md in the app repo)
- Teal `#0D9DA4` (bands, accents) · dark teal `#057277` (Pro pricing card)
- Black `#101010` (footer, pill buttons) · headings `#000` with grey second line `#999`
- Body grey `#6B6B6B` · tint backgrounds `#F2F5F5` / `#EBF0F0`
- Type: Inter Tight (Google Fonts), medium 500 headings, tight tracking, sentence case

## Structure
- `index.html` — the whole page (hero, categories, process, why-us, pricing, work, testimonials, FAQ, footer CTA)
- `css/style.css` — tokens + sections + responsive (1024/640 breakpoints)
- `js/main.js` — testimonial carousel arrows + one-open-at-a-time FAQ
- `assets/` — images cropped from the Figma render (hero collage incl. "Trusted by" row, category/step/work images, logos)

## Placeholders needing owner input (all flagged, none invented)
- **Pricing is DUMMY** ($650 Standard / $1,150 Pro) — owner has a pricing doc in progress; swap the two cards + "Included in all plans" list in `index.html` (marked with a comment).
- **FAQ** questions/answers are the design's template copy (website/SEO-focused, one garbled answer in the design); answers 2-6 read "[Answer pending copy sign-off.]".
- **Testimonials** are the design's placeholder review ×4; "Read all reviews" links `#`.
- **Social links** (Instagram, Linkedin) link `#`; Email uses `hello@trydesignsync.com` (unconfirmed).
- "Request a demo" → mailto (no demo flow exists yet).
- Known design typos kept for sign-off: "EVERTHING IN STANDARD PLUS", step-2 copy "…either as text, video, or audio see monitor progress", duplicated "Unlimited revisions" in the all-plans list.

## Deploy
Target: trydesignsync.com root (host TBD by owner). All CTAs point at https://app.trydesignsync.com/start; footer legal links point at the app's /terms and /privacy.
