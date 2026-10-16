# Microsoft 365 custom pricing contracts

Status: implemented; registry release pending
Last updated: 2026-10-16
Parent: ../../../core/specs/licensing/microsoft-365-custom-pricing/microsoft-365-custom-pricing.md
User approval: explicit instruction to implement across repos after the design was presented.

Contracts add optional price-independent full-population facts, override configuration/preview DTOs, reference/customer/mixed estimate basis, customer agreement terms, reference unit rates and source/effective dates. Every new monetary value retains explicit currency and monthly period; zero remains known. Facts and history reject account identifiers, raw reports and unknown keys. History carries aggregate facts only. Existing snapshots without extensions remain valid.

Summary/accounts/history pricingRevision binds independently loaded projections to the same pricing configuration and UTC effective date. Writes use configuration revision/CAS separately. Account enrichment must preserve known zero rates without fabricating zero when all prices are missing.

Implementation: src/accounts/microsoft365PricingOverrides.ts; microsoft365PricingFacts.ts; existing licensing, portal and history validators and root exports. Keep implementation in portable platform; contracts do not depend on it. Tests run against built CJS/ESM plus packed consumer compatibility. Validate malformed values, date intervals, privacy, bounded arrays and legacy snapshots. No registry publication is performed by this task.

Verification ledger: final `npm test` exited 0, including both CJS/ESM builds, contract typechecking, 36 M365 strict/privacy/legacy cases, override/interval checks and packed Node 24 root/AWS/Portfolio/scheduler/reporting consumers. New enum guards reject coercible arrays, and account enrichment distinguishes known zero from all-missing prices. The published KnownResourceGroupSpend CJS/ESM check also passed separately. Registry publication and exact consumer lock adoption remain pending.

Compatibility prerequisite: the local checkout is v1.1.38 while the API already consumes the published KnownResourceGroupSpend contract. Restored the exact origin/main v1.1.41 src/common/knownResourceGroupSpend.ts, its ResourcesByType field/import, root export and published contract check. This is a published-baseline reconciliation, not a new AWS behavior. Preserve other unrelated upstream changes.

The same published-baseline reconciliation includes AwsEstimatedBillingAuthorityBlock, MonthSummaryEntry.estimatedBillingAuthority and the AWS/root exports: UI dashboard contracts already require them. Files are exact origin/main source, without new AWS semantics.

Before publication, reconcile this checkout with the published upstream baseline using the normal release workflow; the local version remains 1.1.38 and consumers already use 1.1.41. The focused source reconciliation supports local testing and is not authorization to publish an older branch over a newer registry baseline.
