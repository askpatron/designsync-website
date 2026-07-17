# Design Sync | Marketing Website

The public marketing site for the **Graphics on Demand** service. Separate from the ops app (`../designsync`, live at app.trydesignsync.com): this site is the shop window, the app holds the onboarding and client forms. Every CTA here points into the app.

**It does not go at the root.** `trydesignsync.com` is already live and is a different business: "Design Sync | Product Design & Technology Studio", an agency selling bespoke projects. This site sells a productised subscription with a ₦15,000 entry price. Different buyers, and different price anchors that should not share a roof.

**Recommended home: `graphics.trydesignsync.com`** (owner to confirm; DNS free as of 2026-07-17). Named after the product, matches the existing `app.` convention, and expresses the boundary the owner already enforces (branding is exclusive, graphics never entertains it). Avoid `start.` (collides with the app's `/start` flow) and `get.`/`go.` (say nothing). Staying on `trydesignsync.com` also lets a consent cookie scoped to `.trydesignsync.com` be shared with the app, so an accept on the landing page carries into checkout. A subfolder (`trydesignsync.com/graphics`) would be better for SEO but couples deploys to the studio site's host; paid traffic does not care about domain authority.

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

1. **How motion counts against a monthly quota** — the plans say "graphics, social and motion" but cannot say what a motion piece costs. At ₦85,000 ÷ 15 = **₦5,667 a slot**, a client could spend all 15 on animated video, the same price as a source-file add-on. The FAQ deliberately does not answer this, and now nor do the Terms. *(Open in the campaign plan as `[[MOTION_COUNTS]]` since 10 July.)* **Note the contradiction:** the owner's own pricing doc lists motion graphics and video editing under "What's Not Included", while the plans we sell include motion. One of the two is wrong.
2. **`[[MOTION_TURNAROUND]]`** — motion is not 24 to 48 hours.
3. **`[[IP_TERMS]]`** — the doc grants *commercial use*, which is not ownership transfer. A business buyer will ask.
4. **Cal.com link** for "Book a call". Decided (Cal.com, never WhatsApp), URL not supplied, so the button is not on the page rather than pointing nowhere.
5. **Terms + Privacy + Cookies** — **drafted, see `docs/legal/`.** Review copy: <https://claude.ai/code/artifact/137106a4-fe51-4cca-bd4d-d9bc7d43c094>. The Cookie Policy **has no home in the app** (`LegalDocument::TYPES` knows only `terms` and `privacy`); fold it into Privacy §4, put it on the marketing site, or add a third type. Not published: 16 placeholders to fill, starting with legal entity name + RC, registered address, support email, phone. Three real decisions in `docs/legal/README.md`: the IP terms, how motion counts, and the visit-retention period. The app already has the machinery (`/admin/legal` publishes, `/terms` + `/privacy` render, checkout blocks payment without a tick), and both pages currently say "being finalised". **Plain text, not markdown**: the editor is a textarea and the page renders escaped `whitespace-pre-wrap`.
6. **Testimonials** — owner is designing a hover-to-reveal video treatment (2-3 client videos, highlighted quote, hover plays). Section untouched until that lands.
7. **Host + git remote.** Local-only. It cannot go live. Subdomain recommended (`graphics.`, see top); the **host is still unchosen**, and it is a static folder so anything serving files will do.
8. **Meta Pixel, raised 2026-07-16.** Owner is considering it for ads. **It is not a small addition.** It makes four Privacy statements and all of Cookies §4 false, and it **reverses the no-banner decision** below: a pixel is not necessary for the site to work, so legitimate interest cannot carry it and consent is the only basis that fits, meaning a real banner where refusing is as easy as accepting and actually stops the pixel loading. Expansion to other regions makes this worse, not better (ePrivacy + GDPR are stricter than NDPA on precisely this). **Recommendation:** pixel on the marketing site behind a genuine banner, **Conversions API server-side from the Paystack webhook** for the numbers worth deciding on (the pixel cannot see the payment anyway, it happens on Paystack), nothing on the portal. Reasoning in `docs/legal/cookie-policy.txt` §5.

## Decided, for the record
- **Never expose WhatsApp publicly** (matches D12: clients only, never on ads).
- **Book a call = Cal.com.**
- **Support = Tawk.to** (D18 already named it). Owner set it up 2026-07-15, property `6a591c54940f101d53239d3b`. Loaded on click, never on page load. **Owner still needs to fix the widget colour: they have `#0B9DA5`, brand is `#0D9DA4`** (Tawk admin → Appearance). Their suggested messages are Tawk's defaults ("I have a question") and would earn more as real pre-sale questions.
- **Once Tawk is confirmed live on the real domain**, write the "How do I reach a human?" FAQ, which is currently one of three deliberately left out.
- **No cookie consent banner for now.** The banner is an EU ePrivacy requirement; NDPA has no equivalent, it needs a lawful basis + transparency, not a click-through. A banner on paid landing traffic costs conversions. **This decision holds only while every cookie is essential. A Meta Pixel reverses it (blocker 8).** **Revisit when expanding regions.** Recommended click-to-load for Tawk so nothing is tracked before a visitor asks for chat, which also keeps a heavy third-party script off the critical path.
- **Not a lawyer.** Legal copy gets professional review, per the content brief.

## Found in the app while drafting the legal docs (app-side, not this repo)

Surveyed rather than assumed, because a privacy policy that describes a different app is worse than none. Each of these constrains what the policy is allowed to claim:

- **Nothing ever prunes `page_visits`.** No Prunable trait, no scheduled prune. Rows live forever, so no retention period can be published until pruning exists. Small job, worth doing.
- **No account-deletion or client-deletion route exists.** The cascades are defined in the schema but nothing triggers them. NDPA still grants the right, so the policy commits to honouring erasure **by hand** and says so plainly. That is now a promise the business must keep.
- **Portal analytics are identified, not anonymous.** `TrackVisit` stores `user_id` + `client_id`; the code comments claiming anonymity are only true for logged-out traffic.
- **Files are on the server's local disk** (`storage/app/private`), not S3, and **share links are unauthenticated capability URLs**. Both disclosed rather than papered over.
- **`MAIL_MAILER=log` in every committed env file** while `DEPLOYMENT.md` says production uses Resend. Confirm the production `.env` before the policy names Resend.
- Good news worth using: no ad pixels, no third-party analytics, no data sales, no AI processing, essential cookies only. Cleaner than most competitors.

## Known, not urgent
- `#999999` on white is **2.85:1**, under the 3:1 WCAG AA needs even for large text. The scroll fill resolves it on the way past, but any heading a visitor never reaches stays grey.
- Google Fonts is loaded from Google, sending visitor IPs to them. Nigeria-first this is low risk; self-hosting Inter Tight removes it.
- Tawk's free tier brands the widget ("Add free live chat to your site") unless paid.
- The decisions above should be folded into `../designsync/docs/campaign/03-DECISIONS.md` when that repo is quiet. It was skipped here because a parallel session is live in it.
