# Commitments shared financial and assessment evidence

Type: repo
Status: living
Owner: Platform
Last updated: 2026-10-31
Core feature: [Commitments](../../../../core/specs/billing/pricing/commitments/commitments.md)

Shared contracts are implemented in source; registry and consumer adoption remain
separate gates.

`CommitmentUnusedValueEvidence` is exported from the package root and the
`azure/recommendations` surface, alongside `isCommitmentUnusedValueEvidence`.
`Recommendation` and
`CommitmentsObsoleteCandidate` optionally expose it as `unusedCommitmentValue`.
Legacy readers and `impactEstimate`/savings contracts retain their meanings.

The discriminated union distinguishes available finite money (including zero)
from unavailable evidence with a specific reason and no money. Available native
evidence uses method `native-unused-amortized`, basis `amortized`, provenance
`billing-backed-native`; approximation uses method
`recurring-charge-utilization-approximation`, basis `billed`, provenance
`billing-backed-approximation`. The unknown-input runtime guard rejects inconsistent
combinations, malformed nested evidence, invalid dates/windows, negative or
nonfinite amounts, and unavailable evidence carrying financial fields. Zero
remains available evidence; omitted optional source metadata remains valid.
Every variant has canonical benefit identity, `additive:false`, coverage,
assumptions, limitations and source observations. Currency comes from the matched
charge; consumers must not apply subscription currency or native discounts.

Available recurring approximations require `utilizationWindow`; native unused
evidence can omit it because its amount is supplied directly by amortization.
The runtime, compile and full packed fixtures reject an available periodless proxy.

Existing report-pack validators apply the same guard to present optional evidence
in compact recommendation bodies (including the catalogue) and direct commitments
projection rows. Legacy omission stays valid. The guard checks wire semantics,
not billing authenticity, recomputed financial admission, ownership or permission.
Engine, API, UI and report-reader adoption and current source checks remain
separate delivery gates; publishing this package does not upgrade those consumers.

`sourceCharge` states source amount and inclusive charge dates, optional service
period endpoints, and optional monthly cadence. Absence of endpoints does not
authorize inferring an invoice service period. `utilizationWindow` separately
states dates, published percentage, observed day count, optional reported hours
per unit and unverified finality. Source retrieval/generation times and utilization
observation time are separate. Partial evidence does not certify complete
adjustment history, final full days or one immutable cross-source generation.

This exposure is not achievable savings. Consumers display its own amount,
currency, method, dates, assumptions/limitations or unavailable reason. They must
not add it into `portfolioContribution`, `savingsAggregate`, scenario/legacy missed
savings, or generic report amount heuristics; deduplicate canonical benefits and
never combine currencies or incompatible windows. Authorization projections must
continue withholding identities and financial values from restricted readers.

The Azure producer's admission rules live in
[the engine specification](../../../../cloud-engine/Specs/billing/commitments/commitments-azure-benefits-summary-and-expiry.md).
Synthetic compile fixtures and `check:commitment-unused-value-contracts` test the
real packed root/subpath declarations and CJS/ESM consumers without installing
dependencies into a consumer repository. A local archive retaining version
1.1.82 is identified by content hash, not a registry release claim.

## Current Azure assessment authority

The dependency-free `azure/benefitAssessmentAdmission` module is exported from
the package root and the existing `azure/recommendations` subpath. It defines
wire guards and comparisons; applications own trusted configuration, membership
authorization, direct storage reads, conditional writes, manual retirement and
fresh admission. This contract does not itself enroll, elect, revoke or delete
an owner. Current readers must adopt it before lifecycle transitions are enabled.

`AzureBenefitAssessmentOwnerV1` carries `companyId`, `tenantId` and
`subscriptionId`. Company identity is case-sensitive; the other identities and
native benefit IDs are canonical lower-case. Normalizers trim input and remove
trailing native-ID slashes. Wire guards require canonical values and reject
query/fragment/percent-encoding/path injection. Recognized Reservation and Savings
Plan order/item segments continue accepting safe alphanumeric/hyphen synthetic
identifiers rather than requiring UUIDs. Native IDs have a 1,024-character bound;
owner segments have a 256-character bound.

`AzureBenefitAssessmentAdmissionV1` is `{benefitId, authorityId, revision}` with a
positive safe-integer revision. `ScopedAzureBenefitAssessmentAdmissionV1` adds
the source `owner`. Optional `benefitAssessmentAdmission` appears on
`Recommendation` and `CommitmentsObsoleteCandidate`; omission preserves legacy
typing but cannot authorize an enrolled native identity.

Authority IDs are deterministic opaque SHA-256 identities of the actual trusted
HTTPS Blob service origin and container. `deriveAzureBenefitAssessmentAuthorityIdV1`
accepts an origin and container, never a shared deployment label, credentials,
SAS query, private path or regional fallback. Explicit port 443, case and trailing
origin slash normalize. Other ports and HTTP origins are rejected. The exact
preimage is JSON `['azure-benefit-assessment-authority',1,origin,container]`, with
prefix `aba1_`. Registration provenance uses the actual trusted Table service
origin and preimage `['azure-benefit-assessment-registration-authority',1,origin]`,
with prefix `abra1_`. Applications must pass origins derived from their real
configured authenticated clients. The package cannot prove infrastructure routing.
Distinct origins/containers remain distinct authority even with identical logical
owner/native/revision values. Endpoint alias changes require explicit app migration.

The existing claim key remains
`_engine/benefit-assessment-owners/v1/{sha256(canonicalNativeId)}.json`. It is
independent of company and tenant. Reusable SHA-256 comes from `common/sha256`.

## Private authority reads and complete source subjects

`AzureBenefitAssessmentAuthorityV2` has schemaVersion 2, canonical benefitId,
authorityId, positive revision and private ownerRegistrationAuthorityId. Active
state requires `owner`, forbids `lastOwner`, and retains an optional `retirement`
reference; revision 1 has no retirement, later active revisions require it.
Retired state requires `lastOwner` and `retirement` and forbids `owner`.
The reference is `{operationId,decisionPath,precedingRevision}`; operationId is
a safe segment up to 128 characters and decisionPath must equal
`_engine/benefit-assessment-retirements/v1/{operationId}.json`. For retired state,
precedingRevision is revision minus one. For reactivated state it is below
revision minus one. Engine owns immutable audit content and exact ETag CAS.
`nextAzureBenefitAssessmentRevisionV1` refuses invalid predecessors/overflow;
it does not prove a transition was committed. Legacy schema 1 has no recorded
registration authority or admission revision; the new guard never invents them.

`AzureBenefitAssessmentAuthorityReadV1` is either
`{status:'present',benefitId,authorityId,claim}` or
`{status:'absent'|'unavailable',benefitId,authorityId}`. Present binds the exact
schema-2 claim identity to its outer read. Absent is only a direct authenticated
not-found supplied by the app at that exact trusted authority; missing results,
denials, corruption and failures remain unavailable. Private bodies are never
included in public pending responses.

The complete `AzureBenefitAssessmentDependenciesV1` envelope is
`{schemaVersion:1,subjects:AzureBenefitAssessmentDependencyV1[]}`. Each subject is
one of:

- `{kind:'admitted',benefitId,authorityId,revision}`;
- `{kind:'unclaimed-single',benefitId,authorityId}`, without revision.

`ScopedAzureBenefitAssessmentDependenciesV1` adds a validated owner to every
subject. Unscoped envelopes have one enclosing authorized owner and unique native
IDs. Scoped envelopes sort/deduplicate by JSON tuple
`[benefitId,companyId,tenantId,subscriptionId]`, preserving distinct initially
unclaimed Single source scopes. The builders deduplicate identical inputs;
guards require already sorted unique wire lists. Different variants, authorities
or revisions within the same key conflict and fail closed.

Both envelopes are limited to 4,096 input subjects and 1 MiB decoded JSON.
These are product complete-population limits, independent of presentation limits
(report recommendation/inventory catalogues are 2,000; portfolio shard target is
2 MiB decoded). Readers still enforce the containing artifact's limits. Overflow
makes the affected assessment unavailable; never truncate the subject list while
retaining findings, prose, counts or value. Empty means the new producer inspected
the complete population and found no native assessment subjects. Missing on an
opaque legacy derivative is unverified, not empty.

Optional complete fields appear on RecommendationsView, CommitmentsPlanningView,
CompletedViewManifest/V2/V3, PublishedViewManifestV4, SubscriptionReportEvidencePack
and PortfolioInsightsCompanyContribution (scoped). Manifest V3/V4 and report-pack
guards validate present envelopes; valid native IDs are accepted only at the exact
manifest schema edge. Source subject gathering occurs before compact projections
or retained-row limits. Reportworker-local snapshot descriptors are app-owned and
can reuse the scoped contract.

`evaluateAzureBenefitAssessmentDependencyV1(subject,expected,read)` returns only
`'admitted'`, `'unclaimed-single'` or `'pending'`. Expected context contains trusted
owner, authorityId and ownerRegistrationAuthorityId. Active matching admission
requires exact owner/native/authority/revision/provenance. An unclaimed Single
subject requires current authoritative absence. Later enrollment invalidates its
old unclaimed branch regardless of saved applied scope. The scoped predicate
additionally checks recorded source owner against expected authorized scope.
Neither predicate validates membership or Single applied-target policy; the app
must enforce both. A Shared-to-Single change cannot bypass an existing claim.

## Safe pending presentation and compatibility

### Complete report projection source bindings

`ReportCommitmentsProjection.assessmentSourceBindings` optionally carries
`AzureReportCommitmentAssessmentBindingsV1`. Root and `azure/recommendations`
export its row/qualified-local-source contracts, strict syntax guard and pure
pack-relative consistency guard. The four mandatory arrays describe every
pre-limit obsolete candidate, reallocation opportunity, renewal and inventory
row, sorted by exact opaque ID. Native indices refer to the exact enclosing
canonical dependency union; `planningSubjectIndices` also includes source-only
assessment contributions such as retirement scenarios. Other recommendation
subjects may remain in the root union. Qualified local Single sources carry only
ID, reservation/savings-plan type, Single scope and optional canonical local
subscription identity. They never become native claims by parsing candidate IDs.

The combined budgets are 4096 rows, 4096 root-native plus referenced local sources,
and 1 MiB UTF-8 JSON for `{benefitAssessmentDependencies,assessmentSourceBindings}`.
No smaller per-ID token grammar/byte cap is imposed: trimmed, well-formed opaque
Unicode and ordinary punctuation remain valid within the wire budget. Native-shaped
malformed paths cannot qualify as local Single identities. Unknown keys/versions,
duplicate IDs, nonascending or out-of-range references, unused local entries,
foreign local subscription qualification, and projected ID/count mismatches fail.
All retained IDs and full/omitted counts must agree with the existing 50-row
projector. Raw inventory can have empty references; owned renewal/action money cannot.

Missing legacy metadata, valid complete-empty metadata and malformed present
metadata are distinct. The report-pack guard rejects malformed present bindings.
These relationships convey no current permission: applications must still check
every root dependency against fresh authority and positive owner registration.
The Azure producer rechecks complete selected planning before compaction and
retains the original root/binding pair privately across prepared attempts.
`node scripts/check-report-assessment-bindings.mjs` checks the pure boundaries;
packed public CJS/ESM and Node/NodeNext imports validate distribution separately.
API adoption and reportworker/current-reader enforcement remain separate gates.

RecommendationsView optionally carries `benefitAssessmentCoverage`:
`{status:'verified'}` or `{status:'pending',reason}` with only
`authority-unavailable`, `admission-unverified`, or `dependency-limit-exceeded`.
The exact runtime guard rejects extra private fields. Missing coverage means
legacy/unverified, never verified. Pending means affected assessment findings and
their counts/value are withheld; it must be visible even for nonfinancial expiry
findings. UI readers render a generic pending assessment state and affected count
coverage as unavailable, without fabricating zero. The observation time belongs
to the enclosing generation/current-read boundary; it grants no lifetime or TTL.
This is separate from recommendation management publication or savings status.

Planning readers can reuse freshness section `benefit-assessments` with status
`unavailable` and safe reason `Benefit assessment verification is pending.`;
report packs use coverage gaps/source availability, and portfolio uses existing
recommendations failure code `benefit-assessment-pending`. Application adoption
must never include foreign owners, registration provenance, claim/audit paths or
raw provider/storage errors in these public diagnostics.

Financial evidence, `unusedCommitmentValue`, savings, counts and additivity retain
their existing semantics. This wire extension performs no financial aggregation.
Packed contract checks exercise actual root/subpath CJS/ESM and Node/NodeNext
declarations, including illegal-state fixtures. They do not prove current reader
adoption, multi-region routing, deployment, live retirement or re-admission.
