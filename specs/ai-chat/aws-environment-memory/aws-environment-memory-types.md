# AWS account environment memory contracts

Status: original contracts published; AWS Chat citation extension verified, publication pending
Last updated: 2026-10-19
Owner: Platform
Approved: Yes — Jay requested the spec and types-package reviewer revisions on 2026-10-19
Parent: [AWS environment memory](../../../../core/specs/ai-chat/aws-environment-memory/aws-environment-memory.md)

## Slice and contract decisions

The parent owns architecture, source authority, coverage, security, rollout and
sequential delivery. This child records only the dependency-free shared types
slice. Jay subsequently published the package. No builder/storage/API/Chat/MCP
implementation or consumer dependency change is included.

- Preserve existing Azure subscription/tenant contracts and acceptance behavior.
  Add parallel AWS account envelopes; account IDs remain twelve-digit strings.
- Replace the unpublished manifest binding with
  `kind: 'aws-account-portal-publication'`, `scope`, `portalRunId`,
  `portalGeneratedAt`, `completedAt` and sorted unique `artifacts: {name, etag}[]`.
  The closed logical-name allowlist covers direct supporting files and summary;
  require summary/resources/recommendations, max 20 descriptors, max 512-character
  ETags and ordered publication/environment timestamps. ETags are opaque receipts.
- Add direct-publication coverage and security posture, Health, governance,
  retirement, data protection, savings-ledger and public-IP artifact families.
  Coverage is not inferred from descriptor presence. Source binding/receipt
  comparison and authorization remain runtime responsibilities of consumers.
- Keep canonical base64url JSON reference tuples. Preserve ARN/native-ID case and
  account ownership. Accept AWS-managed `aws` owners as referenced evidence,
  accountless ARNs and valid native identifiers; these do not prove ownership.
- Expose provider-neutral scope/reference dispatch, AWS scope equality and
  non-throwing AWS artifact-kind/resource-ID/type guards. Keep validator-policy
  construction, policy key lists and provenance internals unexported.
- Parse API-issued `aws-account-projection` references but reject them in compiled
  AWS source references, including nested/continuation positions.
- Share bounded content validation with provider policies. Preserve money basis,
  period, currency, provenance and additivity; AWS provenance adds only
  `account-summary` and `account-resources`. No financial calculations or service
  mapping catalog belongs in this slice.

## Verification and handoff

### AWS Chat citation follow-up

AWS API/Chat implementation identified one omitted client contract in published
1.1.53: `AIEnvironmentEvidenceMatch.artifactKind` and its runtime validator only
accepted Azure artifact kinds. This bounded extension accepts the union of the
existing Azure and AWS artifact catalogues, using their existing guards. The
closed client-safe envelope stays unchanged: no provider scope, resource ID,
publication receipt, storage path or runtime handle is exposed. Unsupported kinds
and malformed metadata remain rejected. Existing Azure guards retain their narrow
contracts. No new package dependency or manual version bump is included.

Declaration and root CJS/ESM runtime regressions failed before the fix for AWS
artifact kinds; the packed AWS consumer also checks the widened citation type.
Fresh `npm test` passed, including the complete build/declaration and contract
suite and installed-tarball CJS/ESM runtime and NodeNext/legacy CommonJS consumer
checks. `npm run lint`, changed-file Prettier and `git diff --check` passed.
The API has a development-only packed candidate; its delivery manifest must adopt
the actual registry version after publication. No package was published here.

Fresh revision verification on 2026-10-19:

- `npm test` passed, including the complete contract suite and installed-tarball
  consumer checks through root and `/environment` CJS/ESM exports and NodeNext/
  legacy CommonJS TypeScript resolution. Existing Azure environment and AWS
  resource-graph contracts passed.
- `check:aws-environment-contracts` covers exact publication receipts, timestamp
  ordering, required source versions, coverage, money and nested/continuation
  evidence; `check:environment-provider-contracts` covers public dispatch,
  legitimate identifiers and the absence of internal construction exports.
  Initial private-export and revised artifact checks failed before implementation.
- `npm run lint`, changed-source Prettier and `git diff --check` passed. Independent
  read-only review found no actionable issues or spec/contract discrepancy.
- Parent, separate MCP spec and child metadata/links passed. Full core naming
  lint still reports unrelated existing metadata/fixture-name violations.
- Source changes add no dependencies or version bump. Generated output is
  rebuilt for package verification/release; unrelated stale tracked distribution
  rebuild churn is excluded from this source patch. Build before directly using
  local generated exports. The pre-existing tax-metadata spec edit is preserved
  and remains outside this slice.

## Published release

Jay published these contracts as **1.1.50**. The [release workflow](https://github.com/spottoai/types-package/actions/runs/39178824758)
for environment commit `9da8d5c` passed lint, build, contracts, publication and
tagging; release commit `d05ebbe` records the version. The subsequent
[1.1.51 release](https://github.com/spottoai/types-package/actions/runs/39186130589)
also succeeded and includes the environment contracts. This checkout's manifest
and delivery lock now select 1.1.53; the citation follow-up above is unpublished.

Consumers must adopt a verified exact published version in their own slices.
The current platform, engine and API manifests still select older versions; no
dependency upgrades were performed here. Shared builder extraction with Azure
adoption is the next planned implementation. Runtime/API/Chat/MCP checks and
real Blob validation remain planned in their owning slices.
