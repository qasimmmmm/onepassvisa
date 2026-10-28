# Compact travel journey release — 28 October 2026

Implements the supplied visual website review across the shared styles and all 28 HTML pages. Existing locally hosted Inter and Plus Jakarta fonts and authentic destination photography are retained.

## Changes

- Compact green/sage homepage with neutral destination selection and three factual benefits beside the finder.
- Short document labels, consistent image crops and prices, document-type/region filters, count, reset, and collapsible mobile filtering.
- All 18 country pages put facts, the passport checker, and fee summary before preparation details. One merged checklist preserves original unique requirements. Mobile totals expand to itemized fees and the official portal.
- Focused application/checkout headers, neutral trip examples, reduced mobile panel nesting, clear Save scope and an explicit saved-trip resume link.
- Accessible Help tabs with deep links, keyboard navigation and Back support; stacked mobile comparisons; distinct About/contact sections; concise document-type comparisons; mobile policy selector.
- Same US$59.99 base fee for every document. Government and priority amounts are unchanged. Türkiye consistently uses the existing US$52 estimate in its US$111.99 standard total, labeled as an estimate because official fees vary by passport.
- Added requirements-check, application-stage, Help and support-entry events using the existing consent-configured analytics path. These new event payloads omit form values. No performance or conversion uplift is claimed.
- CSS and both JavaScript URLs use v12 to invalidate immutable asset caches.

## Verification

- Node pricing suite: 150 passing tests, including every destination, traveler counts, priority, mocked Stripe line items and historical receipt compatibility.
- JavaScript syntax and git whitespace checks pass.
- All 28 HTML files checked for duplicate IDs, same-page anchor targets and v12 asset references. Existing country-page IDs and monetary bindings retained.
- Browser: empty/passport-only finder validation; US-to-Vietnam result; keyboard search/selection; Thailand search yields two documents, arrival filter one, incompatible region zero, reset 18.
- Browser: Help keyboard tabs and history; mobile policy selection; Türkiye calculator shows 52 + 59.99 = 111.99.
- Browser: saved sample trip/contact fields restored through Resume; two travelers progress through all four arrival-card stages; priority recalculates 119.98 to 149.98 for two Thailand TDAC travelers; switching to Vietnam blocks review without required uploads. No contact form, application or payment was submitted.
- Responsive checks across home, directory, country, application, checkout-empty, tracking, Services, Help, About, policies and 404 at 320px; primary templates also checked at 1280px. No document-level horizontal overflow. Mobile fee drawer checked at 390px.
- Home and Help also checked with 200% root text scaling at 390px. Native browser zoom and physical mobile keyboards could not be validated in this environment; text scaling is not a substitute for a complete device/accessibility audit.
- Measured desktop hero: about 606px tall. Vietnam mobile passport checker begins about 587px from the document top in the 390px review frame, ahead of long-form content.
- Representative token contrast ratios: primary/white 7.93:1; secondary/canvas 5.89:1; main text/canvas 14.45:1; secondary/sage 5.47:1.
- One local warm-cache homepage measurement: DOMContentLoaded 78ms, load 90ms, 14 resource entries. This is a local development measurement, not a production Core Web Vitals score or a before/after comparison.

## Existing limitations outside this visual release

The current upload flow retains filenames and metadata but does not transmit document bytes to checkout. Client date validation also does not fully enforce travel/passport chronology. These pre-existing behaviors are not represented as complete upload fulfillment or production end-to-end validation by this release. Backend integration and live statutory eligibility/fee auditing remain separate work.
