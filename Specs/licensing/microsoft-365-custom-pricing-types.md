# Microsoft 365 custom pricing contracts

Status: implemented; registry release pending
Last updated: 2026-10-17
Parent: ../../../core/specs/licensing/microsoft-365-custom-pricing/microsoft-365-custom-pricing.md
User approval: explicit instruction to implement across repos after the design was presented.

Contracts add optional price-independent full-population facts, override configuration/preview DTOs, reference/customer/mixed estimate basis, customer agreement terms, reference unit rates and source/effective dates. Every new monetary value retains explicit currency and monthly period; zero remains known. Facts and history reject account identifiers, raw reports and unknown keys. History carries aggregate facts only. Existing snapshots without extensions remain valid.

Summary/accounts/history pricingRevision binds independently loaded projections to the same saved configuration and effective price interval. Ordinary daily changes do not change the revision. Writes use the response ETag through If-Match and one conditional storage write. Account enrichment lives in the portable platform capability; the old export remains deprecated for consumer compatibility.

Review follow-up: effectiveFrom accepts null for All Months and guards overlapping open periods; old daily intervals remain readable. Rates have at most four decimal places. Manager responses can disclose an invalid configuration for a raw-ETag recovery reset; viewer responses omit updatedBy. Preview exposes projected impact and catalogue priceableCurrencies, held quantities and reviewed unheld products without raw pricing facts. Facts add bounded catalogue target identities, stable edge targetSkuId and a bounded reference group-ranking marker. Pricing carries non-saving downgrade edges for filtering advice. Optional marketCurrency is derived by the engine from organization country and is an estimate default, never invoiced currency. Strict summary/history/privacy guards remain in place; the API sanitizes invalid optional facts before validation.

Optional `evidence.unpricedQuantitiesKnown: true` attests that the producer collected trial-aware paid quantities and review/group contributions for previously unpriced products. Older snapshots omit it; their raw inventory remains valid, but must not become known paid quantities or review zeros merely because a rate was entered. The validator accepts omission or true only. This is producer evidence, not a pricing feature flag.

The final review-follow-up `npm test` exited 0, including the complete CJS/ESM builds, contract typechecks, 36 licensing guard cases, override/catalogue/open-interval/producer-attestation checks and packed Node 24 consumer fixture. Evidence: `%TEMP%/spotto-pricing-review-types-final.log`. The manifest/lock baseline is reconciled with origin/main's published 1.1.42 release-only commit; the new contracts require the next published release and consumer adoption, not a republish of 1.1.42.

Implementation: src/accounts/microsoft365PricingOverrides.ts; microsoft365PricingFacts.ts; existing licensing, portal and history validators and root exports. Keep implementation in portable platform; contracts do not depend on it. Tests run against built CJS/ESM plus packed consumer compatibility. Validate malformed values, date intervals, privacy, bounded arrays and legacy snapshots. No registry publication is performed by this task.

Verification ledger: final `npm test` exited 0, including both CJS/ESM builds, contract typechecking, 36 M365 strict/privacy/legacy cases, override/interval checks and packed Node 24 root/AWS/Portfolio/scheduler/reporting consumers. New enum guards reject coercible arrays, and account enrichment distinguishes known zero from all-missing prices. The published KnownResourceGroupSpend CJS/ESM check also passed separately. Registry publication and exact consumer lock adoption remain pending.

Compatibility prerequisite: the local checkout is v1.1.38 while the API already consumes the published KnownResourceGroupSpend contract. Restored the exact origin/main v1.1.41 src/common/knownResourceGroupSpend.ts, its ResourcesByType field/import, root export and published contract check. This is a published-baseline reconciliation, not a new AWS behavior. Preserve other unrelated upstream changes.

The same published-baseline reconciliation includes AwsEstimatedBillingAuthorityBlock, MonthSummaryEntry.estimatedBillingAuthority and the AWS/root exports: UI dashboard contracts already require them. Files are exact origin/main source, without new AWS semantics.

Before publication, reconcile this checkout with the published upstream baseline using the normal release workflow; the local version remains 1.1.38 and consumers already use 1.1.41. The focused source reconciliation supports local testing and is not authorization to publish an older branch over a newer registry baseline.
