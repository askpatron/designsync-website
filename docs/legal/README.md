# Terms, Privacy + Cookies | drafts for the owner

Three drafts, written to be torn apart. **Nothing here is published yet.**

Review copy, rendered and readable, with every blank and decision marked:
<https://claude.ai/code/artifact/137106a4-fe51-4cca-bd4d-d9bc7d43c094> (private).

**I am not a lawyer and these are not legal advice.** They are an honest, specific
starting point that a lawyer can review in an hour instead of drafting from nothing.
Get them reviewed before they go live, particularly section 9 of the Terms (rights in
the design) and section 16 (liability).

## Where they go

The app already has the machinery: `/admin/legal` publishes them, `/terms` and
`/privacy` render them, and checkout will not let anyone pay without ticking the box.
Both pages are live right now and both say "This document is being finalised."

To publish: paste the finished text into Admin → Legal. Each save creates a new
numbered version, and the version a client accepted is recorded against their purchase.

**These are plain text, not markdown.** The editor is a plain textarea and the page
renders the body escaped with `whitespace-pre-wrap`, so `##` and `**bold**` would show
up literally. Keep the plain-text shape. Do not paste in formatted text from a document.

Nothing publishes until every `[[PLACEHOLDER]]` is gone.

## What I need from you before these can go live

| | |
|---|---|
| `[[LEGAL_ENTITY_NAME]]` | The registered name, e.g. "Design Sync Studios Ltd". Not the brand. |
| `[[RC_NUMBER]]` | The CAC registration number. |
| `[[REGISTERED_ADDRESS]]` | The registered address. |
| `[[SUPPORT_EMAIL]]` | Both documents tell people to email this. `hello@trydesignsync.com` is the *sending* address; decide if it is also the inbox. |
| `[[SUPPORT_PHONE]]` | Or delete the line. Better no phone than a dead one. |
| `[[EFFECTIVE_DATE]]` | The day you publish. |
| `[[COURT_STATE]]` | Usually where the business is registered. |
| `[[HOSTING_PROVIDER]]` + `[[HOSTING_LOCATION]]` | Who runs the server, and what country it sits in. |
| `[[DPO_OR_CONTACT]]` | Can be you. A DPO is only mandatory for a "controller of major importance", which you are not yet. |
| `[[RECORD_RETENTION_YEARS]]` | Ask your accountant. Six is the usual answer. |
| `[[STALE_REQUEST_DAYS]]` | Terms §12: how long a request can sit waiting on the client before you close it. Or delete the clause. |
| `[[MARKETING_PIXEL]]` | Cookies §5. Stays empty until you decide on the Meta Pixel. See below. |

## Where the Cookie Policy lives

Unresolved, and it needs a call. The app only knows two document types, `terms` and
`privacy` (`LegalDocument::TYPES`), so a cookie policy **has no home in the admin editor**.
Three options, in order of effort:

1. **Fold it into the Privacy Policy** as a longer section 4. Free, and honestly fine at
   this size.
2. **Put it on the marketing site** as its own page. Quick, and it is where most of the
   cookies actually are.
3. **Add a third type to the app** so it is versioned and editable like the other two.
   Cleanest; needs a deploy, and the app repo has another session working in it.

## The real decisions

**1. `[[IP_TERMS]]`, Terms §9.** Your pricing doc grants "commercial use". That is a
licence, not ownership, and clients assume they are buying ownership. Both are
legitimate ways to sell, but you must pick one and say it. If you ever want to assign
copyright, note that section 28 of the Copyright Act 2022 requires assignment in
writing and signed, so a line in the Terms would not achieve it on its own. This is
the clause disputes are made of.

**2. `[[MOTION_COUNTS]]`, Terms §2, and `[[MOTION_TURNAROUND]]`, §5.** Still the
biggest commercial risk on the page, and it has been open since 10 July. The plans sell
motion; a Growth slot is worth ₦5,667; one animated video is not ₦5,667 of work. Until
you decide, both the Terms and the FAQ stay silent, which means a client decides for
you, in their favour.

Worth knowing: **your own pricing doc lists motion graphics and video editing under
"What's Not Included"**, and contradicts the plans we are selling on the site. One of
the two is wrong.

**3. `[[MARKETING_PIXEL]]`, Cookies §5. The Meta Pixel.** You raised this; it is not a
small addition. Adding it makes **four statements in the Privacy Policy and the whole of
Cookies §4 false**, all of which must be rewritten in the same change. It also **flips the
no-banner decision**: a pixel is not necessary for the site to work, so legitimate interest
does not cover it and consent is the only basis that fits, which means a real banner where
refusing is as easy as accepting and actually stops the pixel loading. And the day an ad
reaches a European, ePrivacy and the GDPR apply to that visitor, both stricter than the NDPA
on exactly this.

My recommendation: pixel on the marketing site behind a genuine consent banner, **Meta's
Conversions API fired server-side from the Paystack webhook** for the numbers you will
actually make decisions on (more accurate, survives ad blockers, and the pixel cannot see
the payment anyway because it happens on Paystack), and nothing at all on the portal. Full
reasoning in `cookie-policy.txt` §5.

**4. `[[VISIT_RETENTION]]`, Privacy §6.** Today the true answer is "forever", because
nothing in the app deletes page visits. I will not write a retention period the
software does not enforce. Either publish the honest version, or let me add pruning
and then publish a real number. The second is a small job.

## Three things I found in the code that these documents had to be honest about

Written from a survey of the app, not from a template:

- **Portal analytics are not anonymous.** `page_visits` stores `user_id` and
  `client_id` on portal routes. The code comments call it anonymous. It is not, for
  logged-in traffic, so the policy says so.
- **There is no deletion button.** No account-deletion or client-deletion route exists
  anywhere in the app. The Act still gives people the right, so the policy commits to
  honouring it by hand and says plainly that it is manual. That is a promise the
  business now has to keep.
- **Files are on the server's local disk, not S3**, and share links are unauthenticated
  capability URLs: whoever holds the link gets the file. Both documents disclose it
  rather than implying everything is access-controlled.

## What is genuinely good news

No advertising pixels, no third-party analytics, no data sales, no AI processing, and
essential cookies only. That is a cleaner privacy position than almost any competitor,
and it is why **no cookie banner is needed**. Worth saying out loud rather than burying.

This is also the thing the Meta Pixel spends. It is worth spending if the ads pay, but
spend it knowingly.

The only US processors are Resend, Tawk.to and Google Fonts, and each is disclosed with
what it receives and the basis for sending it there, per Part IX of the NDPA. Self
hosting the font would remove Google from that list entirely, if you ever want the list
shorter.
