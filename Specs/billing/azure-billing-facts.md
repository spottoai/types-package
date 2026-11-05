# Azure billing facts V1

Status: shared contract delivered in package 1.1.87; producer and reader adoption is independently validated by each owning repository.
Owner: Azure billing / shared contracts.

This additive contract supports small immutable spend and measured cost movement
facts prepared from the effective Azure views billing inputs. It adds no financial
calculator, storage reader, platform dependency, company pricing or authorization.
The existing required environment V1 tree and existing billing DTOs are unchanged.

## Public surface and wire shape

Import from `@spottoai/types-package/azure/billing-facts` or the package root.
Both entrypoints expose `AzureBillingOverviewV1`, `AzureBillingDriversV1`,
`AzureBillingWindowFactsV1`, `AzureBillingFactsSourceV1`,
`isAzureBillingOverviewV1`, `isAzureBillingDriversV1`, and
`AZURE_BILLING_FACTS_LIMITS_V1`. Supporting types are exported alongside them.
Built CommonJS and ESM implementations share the same source contracts.

| Coordinate | Required evidence |
| --- | --- |
| Artifact | `schemaVersion: 1`, artifact kind, UTC publication time |
| Ownership | Company identity and native Azure subscription GUID |
| Generation | Exact immutable Portal run and exact selected billing-input run |
| Both windows | Independent fingerprint; available inputs also retain the corresponding raw source enum and ETag; absence has an explicit receipt/reason |
| Period | Exact adjacent 30-day UTC windows, start inclusive/end exclusive |
| Currency | Verified ISO currency, minor-unit scale and resolution reference; unresolved/mixed currency withholds all numeric money |
| Financial value | Independent billed/amortized and billing-backed/estimated components; signed credits and produced zeros are retained |
| Native discount | Required eligible subset and explicit gross membership availability; fixed commitment purchases/refunds are excluded by the canonical eligibility rules |
| Unknown source | Gross nonzero-row/absolute-money evidence, even when signed unknown totals cancel |

`billing-overview.json` contains the source/currency header, current and previous
window facts, daily points and availability of the immutable sibling
`billing-drivers.json`. The serialized UTF-8 overview is limited to 64 KiB, with
at most 30 ordered unique dates per window. Daily points carry compact all-charge
and eligible-subset basis/provenance totals and unknown material, rather than
duplicating the financial coordinate or resource metadata.

`billing-drivers.json` contains the identical source/currency header and window
totals, plus independent service and resource-type grouping populations. Each row
has a stable opaque identifier, readable label and current/previous canonical
source components. The document is limited to 256 KiB; each grouping has at most
1,024 rows. A grouping is complete or explicitly unavailable due to source,
currency, reconciliation or size constraints. There is no truncated top-N or
page protocol in V1. Overflow can withhold drivers while overview remains usable.
Do not add the two marginals or infer their intersection. Rank complete groups
after applying the current company's permitted pricing projection.

## Financial and coverage invariants

`AzureBillingFactsSpendV1` retains canonical
`AzureFinancialChargeSpendBreakdownV1` monetary fields and
`AzureFinancialChargeSpendBasisTotalsV1` availability. Its enclosing header binds
those compact fields to scope, generation, period and verified currency. Missing
amortized evidence never borrows billed money. Eligible money is a subset, never
an additional source; its signed value can exceed signed native net when excluded
commitment refunds are present. Empty-native and zero/cancelling-native groups
cannot be distinguished from signed amounts, so aggregate gross membership is
producer evidence, not inferred by combining group labels.

All row counts use one **weighted contributing-row coordinate**: independently
for each selected record, use its positive canonical `sourceRowCount`, otherwise
one. `coverage.rowCount`, `coverage.rowsWithoutDate`, spend/daily
`billingBackedRowCount`/`estimatedRowCount` and canonical unknown-material row
counts use that same weighting. They are not the length of the serialized input
array, and weighting must not be guessed after aggregation. Produced window
provenance counts sum to coverage count. Complete groups and fully produced
30-day daily series reconcile provenance populations exactly. Unmarked series
also reconcile all amounts/material counts exactly; the explicit independent
rounding mode below permits only mathematically bounded monetary differences.
Partial daily counts remain subsets, excluding undated contributions. Marked
gross absolute money has the bounded rounding exception described below.

Counts preserve provenance **presence** separately from net amounts. Estimated-only
money with `billingBackedRowCount: 0` does not establish billing-backed zero for a
billing-only consumer. A billing-backed row whose charge is zero remains present.
Zero contributing rows cannot support a nonzero component of that provenance.

Source coverage is complete only with explicit proof for all 30 dates; observed
minimum/maximum dates never establish completeness. This proves source date
coverage, not provider usage completeness or invoice finality. `unknown` daily
points and omitted dates never mean zero. `verified-zero` requires explicit
source date proof and zero produced components/material; it can represent an empty
day or source rows whose recorded charges are zero. `observed` points require
dated source rows inside the observed date range. Undated records remain explicit.

Exact all-charge and provenance totals must match the canonical tool accumulator
on the **same selected generation**. DecompositionTree source fields round source
parts first and can differ by one cent; never copy that sum into exact billing
facts as a substitute. Use the canonical producer's existing integer coordinates
and the explicit independently rounded child mode where applicable, or withhold
the unreconciled spend/grouping. Do not modify exact window totals or allocate
residuals to make separately rounded groups or days add up. The shared guards
only validate already-produced integers and reconciliation; they do not aggregate
raw rows, round money, repair totals or apply discounts.

## Explicit independent minor-unit rounding

The optional `roundingMode: 'independent-minor-units'` field is additive on
`AzureBillingWindowFactsV1` (its daily series) and the `status: 'complete'` branch
of `AzureBillingDriverGroupingV1`. The absent marker retains strict existing
behavior. It is not accepted on unavailable groupings, individual spend records,
or driver window totals. The delivered base contract is package 1.1.87; this
extension is unpublished until separately released and adopted.

TypeScript producers must omit the unused marker key. An own property whose
value is `undefined` is not valid wire data and is rejected before serialization;
JSON serialization drops that property and restores the unmarked wire shape.

New guards accept unmarked base-contract bodies with their existing strict
behavior. The old package guards reject marked bodies as unknown fields; update
consumer validators before producers publish marked artifacts.

Marked collections contain the complete same source population with each child
rounded independently. Parent spend remains authoritative. Consumers must not sum
these children to reconstruct parent totals, change a parent amount, distribute
residual cents or claim a truncated grouping is complete. Source/provenance
partitions remain exact **within each spend**, including parent and every child.
Weighted billing-backed and estimated child row counts sum exactly to the parent.
Availability, verified currency, source/generation/window identity, date proof,
ordering, unknown evidence and byte/row bounds retain their existing checks.

For `n` children and `width` independently rounded primitive components, validation
permits an absolute parent-minus-child-sum difference of at most
`floor((n + 1) * width / 2)` minor units. This follows from at most one half-unit
rounding error at each child and the independently rounded parent, per primitive
coordinate. Sums and differences are checked safely; no arbitrary tolerance is
accepted, and an empty population gains no rounding allowance.
Producers must use round-to-nearest for every primitive coordinate, including
the canonical tie rule. Truncation is outside this marker's rounding model.

| Monetary coordinate | Width |
| --- | --- |
| Native/Marketplace/unknown or eligible, one provenance | 1 |
| Native/Marketplace/unknown or eligible, combined provenance total | 2 |
| All-charge, one provenance across three source partitions | 3 |
| All-charge total across three sources and two provenances | 6 |
| Gross unknown absolute money for one financial basis | 1 |

Canonical unknown materiality is thresholded at the aggregation scope: a group's
gross absolute amount can round to zero even though its weighted rows contribute
to material unknown money at the parent. Marked complete collections therefore
allow child `unknownMaterial.nonZeroRowCount` sums **below** the parent, never
above it or their weighted provenance populations. For example, parent 77 and
child sum 76 are legitimate when the missing material classification is a tiny
group that rounds to zero. Gross absolute amounts still use the width 1 bound.

Full daily monetary reconciliation applies at the existing boundary: all 30 dates
are known and there are no undated contributions. For a marked partial daily
series, including unknown dates or undated contributions, known gross unknown
absolute money is instead bounded on one side:
`sum(known daily gross absolute) <= parent gross absolute + floor((k + 1) / 2)`,
where `k` is the known-day count. The raw gross subset cannot exceed its raw
parent, but independently rounding each known day can make its integer sum
larger. This bound applies independently to billed and amortized gross absolute
money; material/provenance counts still cannot exceed their parent or weighted
population. The unmarked path retains its exact old subset inequality. A marker
does not turn unknown/omitted dates into zero or infer complete source coverage.

## Reader and producer handoff

The guards check strict wire shape, bounded strings/arrays, safe integers, source
enum paths, source/window identity, currency availability, source/provenance sums,
daily coverage and complete grouping reconciliation. They reject controls,
traversal references, duplicate/out-of-period days and rows, contradictory
presence/coverage evidence and oversized serialized UTF-8 JSON. Unknown fields
are rejected; the reviewed optional rounding marker is the sole added wire field.

Readers must enforce the **actual decoded byte limit before parsing**, including
whitespace and transport encoding; object guards can measure only serialized
JSON. Then compare both artifact bodies against the authorized owning manifest,
the exact expected Portal/input generation, company/native subscription, both
window receipts and the other artifact's identical coordinate. A structurally
valid body alone does not prove authorization or the authenticity of its currency,
coverage/fingerprint evidence. Scope authorization precedes reads, including
resource-restricted callers who cannot receive subscription aggregates.

Producers advertise only successfully written/validated immutable sibling facts.
Listed-but-missing/corrupt/mismatched artifacts are integrity failures. Adoption,
old-generation fallback, optional publication, current company pricing and
turn-local read sharing remain the owning engine/API/MCP work. No shared package
publication or consumer dependency/version change is part of this checkpoint.

## Verification and release boundary

`npm run build` builds CJS/ESM output and compile-only contracts, including negative
assignments for missing bases/source identities, invalid currency availability,
cross-period source paths and truncated grouping states.
`npm run check:billing-facts-contracts` runs valid and adversarial built-output
checks through CJS and ESM root/subpath imports. It covers credits, unknown-source
cancellation, unavailable amortized/previous/currency, empty vs zero vs estimated
provenance, weighted rows, explicit source coverage, daily/group reconciliation,
60-day overview size and otherwise reconciled driver populations above/below the
byte limit. Independent-rounding checks cover strict unmarked rejection, bounded
positive/negative daily/group differences, coordinate widths, exact weighted
populations, unavailable bases, internal partition failures, unknown threshold
counts and gross-absolute overages. The command is included in `npm test`.

The existing packed-export gate verifies packed consumers during `npm test`.
Release-like billing-subpath consumer verification and actual engine/API/MCP
adoption remain separate handoff evidence. Consume a built tarball through package
exports for local verification; never cross-import this repository's source or
claim that the unchanged local package version is published with these contracts.
