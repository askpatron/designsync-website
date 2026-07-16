# Design Sync | Marketing Website

The public marketing site for **trydesignsync.com**. Separate from the ops app (`../designsync`, live at app.trydesignsync.com): this site is the shop window, the app holds the onboarding and client forms. Every CTA here points into the app.

**Stack:** static HTML + CSS + vanilla JS, no build step. Deploy = upload the folder.
**Local:** `preview_start designsync-website` → http://localhost:8110 (port is in the workspace `.claude/launch.json`).
**Status:** built, not launched. **No git remote and no host yet.**

> The preview pane caches `style.css` and `main.js` aggressively and has served stale copies repeatedly. Hard-reload, or verify with headless Chrome (a fresh profile), before believing something is broken.

---

## Sources of truth, in order

1. **`../designsync/docs/campaign/05-LANDING-COPY-DRAFT.md`** — the original campaign plan. This site's copy aligns to it. Its Section 5 headline is where "A freelancer's price, a studio's accountability" comes from.
2. **`../designsync/docs/campaign/04-CONTENT-BRIEF.md`** — the hard rules: no invented facts, no em dashes, placeholders not guesses, **the spec wins over copy**, owner signs off.
3. **`../designsync/docs/campaign/03-DECISIONS.md`** — why the product works the way it does. D3, D6, D8, D9, D10, D12, D18 all show up in this site's copy.
4. **`~/Downloads/DesignSync Graphics Packages.md`** — the owner's real pricing. Supersedes the Figma on every number and inclusion.
5. **Figma:** "Design sync Website - Branding", node `4307-12434`. Authoritative for **design only**. Its copy is template filler and actively contradicted the product, see below.

## Brand (do not re-guess)
Teal **`#0D9DA4`** (no yellow) · black `#101010` · **Inter Tight Medium (500)**, sentence case, tight tracking (~-0.03em). Full tokens in `../designsync/docs/campaign/06-BRAND-TOKENS.md`.

---

## The offer, as sold (decided 2026-07-15)

| | |
|---|---|
| **Growth Monthly** | ₦85,000/mo · 15 designs · 2 revisions each · priority support |
| **Business Monthly** | ₦150,000/mo · 30 designs · 3 revisions each · highest priority · dedicated PM · monthly strategy check-in |
| **Starter** | ₦15,000 · 2 social media designs · the paid entry offer, **never call it a demo** |

- **The two monthlies are the only plans on the landing page.** Other packs exist in the pricing doc; a compare page can come later.
- **In the plans:** general graphics, social media, motion.
- **Branding + logo design is a separate exclusive package, NOT ready.** General graphics must never entertain it.
- **Out, quoted separately:** logo/brand identity, websites and UI/UX, 3D, copywriting, printing.
- Unused designs do not roll over. Auto-renews until cancelled from the portal. 3-day grace on a failed charge.
- Add-ons: extra revision ₦2,000 · 12h rush ₦5,000 · source file ₦5,000 · resize ₦2,000 · extra concept ₦3,500.

**Plan slugs matter.** Card CTAs deep-link `?plan=starter`, `?plan=growth-monthly`, `?plan=business-monthly`. Those only resolve if the plans are named exactly **Starter**, **Growth Monthly**, **Business Monthly** in admin. A mismatch fails to preselect rather than breaking.

---

## The Figma's copy was selling a different business

This is the single most important thing to know before touching copy. The design was modelled on wegrow.design and magier.com, who sell **unlimited** design subscriptions. Design Sync sells **counted** designs. Nearly every commercial claim on the page was false and has been replaced:

| The Figma said | Reality |
|---|---|
| "Try it free for 3 days" | No trial exists. Entry is ₦15,000 for 2 designs. |
| Standard: logo design, branding, website design | All excluded |
| Pro: Webflow, video editing, product design, UI/UX | All excluded |
| "Unlimited requests" · "Unlimited revisions" | Counted designs, 2 or 3 revisions |
| "Native source files" included | ₦5,000 add-on |
| "1 Dedicated Project manager" on all plans | Business Monthly only |
| "UI/UX, web, brand, and motion all in one place" | Three of four excluded |

**Two further claims were caught by checking the app rather than the docs**, and would have shipped as lies:
- **"plus an instant assistant"** (in the campaign plan itself) — there is no AI assistant. No `LlmDriver`, nothing.
- **"Pause, upgrade, or scale"** — there is no pause. Only `SubscriptionService::cancel`.

> Rule that caught them: *every factual claim must match the spec; if copy and spec disagree, the spec wins.* Grep the app before writing a capability.

---

## What is built

- **Hero** — five real card artworks on a wheel that turns endlessly (96s). They sit on a measured circle: centre (720, 1036.6), radius 875, each tangent, 21.7° apart. The deck is laid out twice so the reset is invisible. Secondary CTA is **"Try 2 designs for ₦15,000"**, price on the button.
- **Skills** — six cards, **all six video** (motion, presentations, social, brochure, business card, packaging). Endless marquee, deck laid out **three times** so it still tiles at 4K (needs trackW ≥ viewport + one set). 24MB of masters compressed to 772KB. Masters archived in `~/Documents/Personal/Design Sync/Subscription Package/`.
- **Process** — three steps, images re-cropped to the card's inner rect.
- **Why choose us** — the campaign plan's six, minus the claims we cannot back.
- **Pricing** — the two monthlies, the Starter line, inclusions, and an explicit "quoted separately" line.
- **Work** — four portfolio stills.
- **FAQ** — twelve, replacing template questions about websites and SEO. Refund answer is the owner's policy.
- **Footer** — closing CTA + legal links into the app.
- **Live chat** — a "Chat with us" launcher. Tawk's script is **not** embedded; it loads on click (property `6a591c54940f101d53239d3b/1jtm1db40`), then maximises and our button steps aside. **Verified:** 0 requests to tawk.to on page load, exactly 1 after the click. **Unverified:** that the widget renders. From localhost the script is refused (`ERR_FAILED` / `ERR_BLOCKED_BY_ORB`) though the property is live and curl gets a clean 200 with `ACAO: *`. **Tawk's own verbatim snippet fails identically here**, which rules out our loader. Re-check on the real domain; if it still fails, look at domain restrictions in Tawk admin, not at this code.
- **Headings** fill **letter by letter** on scroll (grey → ink). All letters share one timeline declared on the heading; per-letter `view()` would make line two lag line one for merely sitting lower.

**Motion fallbacks are all the Figma.** No scroll-timeline support, or reduced-motion, or JS never running, leaves the designed state. Nothing depends on an animation.

---

## Blocked on the owner

1. **How motion counts against a monthly quota** — the plans say "graphics, social and motion" but cannot say what a motion piece costs. At ₦85,000 ÷ 15 = **₦5,667 a slot**, a client could spend all 15 on animated video, the same price as a source-file add-on. The FAQ deliberately does not answer this. *(Open in the campaign plan as `[[MOTION_COUNTS]]` since 10 July.)*
2. **`[[MOTION_TURNAROUND]]`** — motion is not 24 to 48 hours.
3. **`[[IP_TERMS]]`** — the doc grants *commercial use*, which is not ownership transfer. A business buyer will ask.
4. **Cal.com link** for "Book a call". Decided (Cal.com, never WhatsApp), URL not supplied, so the button is not on the page rather than pointing nowhere.
5. **Terms + Privacy** — needs legal entity name + RC, registered address, support email, phone. Owner disagrees with parts of the pricing doc's policies and wants a proposal to edit.
6. **Testimonials** — owner is designing a hover-to-reveal video treatment (2-3 client videos, highlighted quote, hover plays). Section untouched until that lands.
7. **Host + git remote.** Local-only. It cannot go live.

## Decided, for the record
- **Never expose WhatsApp publicly** (matches D12: clients only, never on ads).
- **Book a call = Cal.com.**
- **Support = Tawk.to** (D18 already named it). Owner set it up 2026-07-15, property `6a591c54940f101d53239d3b`. Loaded on click, never on page load. **Owner still needs to fix the widget colour: they have `#0B9DA5`, brand is `#0D9DA4`** (Tawk admin → Appearance). Their suggested messages are Tawk's defaults ("I have a question") and would earn more as real pre-sale questions.
- **Once Tawk is confirmed live on the real domain**, write the "How do I reach a human?" FAQ, which is currently one of three deliberately left out.
- **No cookie consent banner for now.** The banner is an EU ePrivacy requirement; NDPA has no equivalent, it needs a lawful basis + transparency, not a click-through. A banner on paid landing traffic costs conversions. **Revisit when expanding regions.** Recommended click-to-load for Tawk so nothing is tracked before a visitor asks for chat, which also keeps a heavy third-party script off the critical path.
- **Not a lawyer.** Legal copy gets professional review, per the content brief.

## Known, not urgent
- `#999999` on white is **2.85:1**, under the 3:1 WCAG AA needs even for large text. The scroll fill resolves it on the way past, but any heading a visitor never reaches stays grey.
- Google Fonts is loaded from Google, sending visitor IPs to them. Nigeria-first this is low risk; self-hosting Inter Tight removes it.
- Tawk's free tier brands the widget ("Add free live chat to your site") unless paid.
- The decisions above should be folded into `../designsync/docs/campaign/03-DECISIONS.md` when that repo is quiet. It was skipped here because a parallel session is live in it.
