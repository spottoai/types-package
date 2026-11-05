# License optimization contracts in types-package

Type: repo
Status: approved
Owner: Platform
Last updated: 2026-11-05
Core feature: [License optimization](../../../../core/specs/licensing/license-optimization/license-optimization.md)

## Purpose and source scope

Root exports in `src/accounts/microsoft365Optimization.ts` and
`src/accounts/microsoft365OptimizationValidation.ts`, plus
`src/accounts/microsoft365OptimizationManagement.ts` and its validation module,
define additive version-one
contracts for the [Microsoft 365 design](../../../../core/specs/licensing/license-optimization/license-optimization-microsoft-365.md).
They do not change current insight enums, stored licensing schemas or response
allowlists. Source implementation of contracts and guards does not establish a
published release, producer output, projection/persistence, browser adoption or
deployment. No package version or consumer pin changes in this slice.

## Boundaries

| Contract | Contents | Trust boundary |
| --- | --- | --- |
| `Microsoft365OptimizationEvidence` | Scan-bound private account candidates, commercial observations and six-month quantity evidence | Company-independent engine output; never a summary/AI response |
| `Microsoft365OptimizationCohortEvidence` | Anonymous full-population weights and uniform qualified alternatives | Internal engine facts for API repricing without loading all person pages; account pages retain cohort references |
| `Microsoft365CommercialSubscription` | Exact subscription/SKU, quantity, term, payment frequency, provenance, observation and independent lifecycle/reduction dates | Recorded inputs are company context; shared engine evidence rejects recorded terms |
| `Microsoft365OptimizationSummary` | Selected-currency anonymous groups for combine, protection and term scenarios | API authorizes, applies company context/prices and serves the projection |
| `Microsoft365OptimizationAccountDetail` | One account's nested finding kinds/options, privilege and MFA review status | API authorizes before reading; callers compare company, scan, currency and pricing/context revisions |
| `Microsoft365PricingConfigurationDocument` | Legacy v1 or atomic company-scoped pricing-v2 rates, terms, quotes and confirmed protection scopes | Dual readers before v2 writes; full context is manager-only |
| Management/write/preview DTOs | Full conditional replacement, pure validation preview and invalid-document recovery | Route owns identity/actor; legacy rates read remains redacted |
| `Microsoft365OptimizationCatalogue` | Unheld product labels, capabilities, plans, providers and dated channel/term reference offers | Reviewed metadata and receipts; no inferred purchasing eligibility |
| `Microsoft365OptimizationHistorySnapshot` | Price-independent subscription/quantity observations with catalogue/rule versions | No people or company context; fresh monthly source observations only |
| Read requests and response unions | Full effective binding, filtered account index, ready/not-collected/stale/unavailable states | Stale states carry no financial/person payload; authorize before source reads |

Money is a monthly tax-exclusive estimate in the selected ISO currency, not invoiced
spend. Price rows preserve exact-SKU agreed/list/unavailable source, explicit zero
and unknown prices; option differences are signed and non-additive. Scenario
savings and compatible portfolio contributions are distinct. Protection investment
is nonnegative and structurally has no savings field. Portfolio contributions in
this extension are not automatically additive with legacy unused/downgrade totals.
Reported amounts/differences are rounded to two decimals, unit prices to four;
safe minor-unit comparisons reconcile declared aggregate contributions. Unknown
eligible saving contributions or unknown protection investment withhold their own
aggregate, including a false zero. An empty known population can have a zero total.

Qualification is eligible, conditional or blocked. Eligible candidates cannot carry
lost/unverified material service plans or blockers. Combine options replace at least
two held products; add-on-only options replace none. Unknown-priced eligible
alternatives prevent a selected cheapest option. Configuration-only protection
reviews can have no purchase option and zero investment. Registration and observed
privilege do not claim MFA enforcement or all-role completeness. The existing
reviewed capability catalogue supplies capability IDs; no second tier model is
introduced here.

Options in a combine cohort share the replaced SKU set. Joint eligibility/capacity
allocation can partition a source pattern into smaller uniform cohorts before
selection; presentation can regroup selected targets. The wire guard checks the
minimum declared cost change among complete eligible options and investment equal
to max(0, selected change). Account findings retain their kind and local option IDs;
selected replacements/acquisitions cannot share a product. The API still proves
which alternatives are eligible and the underlying price arithmetic. The engine
reserves Business-family capacity conservatively before publication: worst-case
selection over all eligible targets fits disjoint reserved populations. Repricing
does not reassign unused reservations to residual cohorts.

Third-party coverage uses catalogue provider IDs and opaque scope references,
observed/validity timestamps and account/device units. It cannot overlap missing
or configuration-review capabilities in the same uniform cohort. Account-unit
counts are bounded by the observed account population even when exact scope is
unknown. Display labels come from reviewed provider metadata, never free-text
identity fields. Scan time and projected time remain independent; context validity
is tested at projected time.

Commercial term and billing frequency are independent. Unknown term/source remains
explicit; Graph lifecycle dates cannot confirm an action date. Commercial inference
has an explicit method/confidence and observation months; conflicting observations
and independently sourced reduction timing remain visible. Monthly commitments
cannot use annual payment frequency; upfront payment can cover a monthly term.
Term findings retain per-subscription source/term/quantity/conflicts, committed
annual-plus-three-year capacity and source/target offer receipts with term, payment
frequency and agreed/list/unavailable price source. Inferred/conflicting terms are
conditional, outside eligible savings.
Price receipts preserve offer identity, country, channel, confidence and explicit
20% assumption applicability. Reference offer intervals cannot overlap for one
SKU/market/currency/term/payment/channel key. Known publisher prices require source
and check date. Customer quotes are not verified publisher evidence. Term groups
allow 1,000 subscription rows with explicit omissions; omissions prohibit eligible
money. Recorded unknown terms remove the override and fall through to lower
priority qualified evidence.

Complete demand requires the six completed UTC months immediately before scan time.
Each uses the last qualifying complete monthly observation, not a continuous demand
floor. Guards reject future/current months and stale complete windows. The shared
projector, not these guards, proves the 5% reserve calculation, retained demand,
applicable premium offers, joint eligibility and portfolio allocation.

## Validation, limits and application duties

`Microsoft365ObservedCommercialSubscription` narrows every tenant-shared commercial
source, including nested reduction timing and conflicts, to exclude customer-
recorded context. The broader commercial-input contract still accepts company
records. Both runtime rejection and packed TypeScript fixtures enforce this boundary.
Overall coverage agrees with the channel state set and omissions. Unavailable
account detail cannot select eligible or money-bearing actions. A selected
protection option's expanded gains cover every missing capability. Eligible term
savings must be positive with a cheaper target offer. A known non-saving combine
cohort is omitted or blocked with `not_cost_effective`, rather than treated as an
unknown eligible contribution after a price change.

Root-exported guards validate private evidence, anonymous cohort facts, commercial
observations, public summaries, account detail and every management/history/read
boundary in both CJS and ESM builds. Strict field
allowlists reject accidental identity/raw-report additions to summaries; enums,
real dates, GUIDs, finite amounts, nonnegative safe counts and unique identities
are checked. Eligible term findings need six consecutive months and known seat
bounds. Unknown currency cannot carry monetary values. Independent coverage for
combine, protection and term analysis prevents an uncollected channel appearing
as zero; an unavailable term channel does not erase known protection investment.
Partial scope and omissions withhold affected exact aggregate values. Plain records,
dense arrays, opaque tokens and text without control/bidi/surrogate spoofing are
required at these wire boundaries.

- Evidence: at most 5,000 accounts/page, 16 alternatives/account, 1,000 commercial
  subscriptions and 1,000 demand products; six observations/product.
  Up to 2,000 variable-length pages share page counts and full observed population
  metadata. Other published pages do not contribute to omitted counts.
- Cohort facts: at most 1,000 cohorts and 4 MiB decoded. Cohort weights plus explicit
  omissions reconcile to the full observed population. API company exceptions use
  bounded identity lookups and cohort subtraction/repartition rather than reading
  every account page. Source/authenticated join correctness remains an application
  duty, not a guard-only guarantee.
- Summary: at most 256 groups, 16 alternatives/group, 32 source/target products and
  128 capability/plan references per list.
- Account detail: at most 128 nested findings, 16 options per finding.
- Management inputs: 1,000 subscription terms, 1,000 term quotes, 200 protection
  confirmations and 1,000 identities per explicit scope; configuration is 1 MiB.
- Catalogue: 1,000 products, 4,000 offers and 4,000 service plans, at most 4 MiB.
  Complete coverage prohibits omitted product/offer counts.
- New decoded-byte budgets: management 8 MiB, summary response including catalogue
  6 MiB, preview 3 MiB, monthly history 2 MiB, filtered account list 4 MiB and
  account response 512 KiB. These named package constants are enforced by guards
  after parsing; consumers enforce the same limits before parsing. Existing
  summary/detail payload limits still apply inside their wrappers.
- Application decoded-byte limits: evidence 24 MiB/page, summary 1 MiB, account
  detail 256 KiB. Guards bound arrays/fields; applications enforce stored/decoded
  byte limits before parsing and pagination/omission scope when publishing.

Applications remain responsible for authorization, source authenticity, source
freshness and tenant/run joins, catalogue membership, complete population evidence,
commercial product joins, scoped third-party context, eligibility, money arithmetic
and joint Business-family capacity. A wire-valid document is not proof of those
facts. Summary AI tools apply an additional identity-free allowlist; they do not
forward these contracts or private candidates indiscriminately.

## Verification and adoption

The complete consumer contract set also includes
`microsoft365OptimizationManagement.ts` and its boundary guards. Management inputs
cover recorded subscription terms, term/payment/subscription-specific dated quotes
and scoped customer confirmations for account/device populations. Pricing v2 keeps
these and legacy rates in one conditional document/save; the package supplies a
dual-version document guard, full-write/preview contracts and invalid-configuration
recovery metadata. Full management reads require manage permission. Legacy v1
readers/guards are unchanged, and existing v1-shaped viewer reads exclude private
optimization configuration. Manager attribution is server-owned.

The same package includes reviewed product/capability/plan/provider/offer metadata,
ready/stale/unavailable transport unions, full projection bindings, filtered account
indexes and price-independent monthly commercial/quantity history. Source evidence
retains its distinct customer-free observed-subscription type. A shared interval-set
guard reuses existing rate validation rather than inventing new pricing arithmetic.
Internal shared wire primitives are not package-root exports.

Packed CJS/ESM and TypeScript/CTS fixtures cover the full input-to-read handoff in
one package. The release contract matrix maps every planned consumer task to a
published shape; no additional shared schema is intentionally deferred for the
agreed term, consolidation and protection work. Future runtime code must adopt
these types and guards rather than introduce competing local wire shapes.
History records catalogue and assignment-qualification rule versions; consumers
cannot silently mix incompatible qualification semantics. Each commercial
observation belongs to the record month and does not postdate its scan. Effective
context revisions change at protection expiry and Keep changes; pricing revisions
include term-quote/reference-offer interval transitions. Supported rollback builds
retain dual readers/context-preserving writes after the first v2 write.

`npm run check:microsoft365-optimization-contracts` exercises both built roots with
valid zero/unknown/partial examples and adversarial extra fields, identities,
unknown prices, unsafe eligible candidates, missing history and selection references.
`npm test` includes the new check and existing licensing/pricing contracts. Build
checks include TypeScript contract consumers. The packed-export check proves root
CJS/ESM exports and declarations survive packaging.

Publish a reviewed stable package before independently pinned engine/platform/API/UI
adoption. Retain old producer behavior until each consumer is wired. Do not widen
existing guard allowlists speculatively or import sibling source as a delivery
dependency. The core solution owns cross-repository behavior and acceptance.

The unpublished v1 shape can be refined during review. After publication, required
shape/strict-allowlist changes use a new schema version with dual-version readers
deployed before producers; retain old readers through supported artifact retention
and consumer adoption. No existing stored schema is widened by this source slice.
