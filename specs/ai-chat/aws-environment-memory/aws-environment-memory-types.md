# AWS account environment memory contracts

Status: reviewer revisions implemented and verified locally; registry release/adoption outstanding
Last updated: 2026-10-19
Owner: Platform
Approved: Yes — Jay requested the spec and types-package reviewer revisions on 2026-10-19
Parent: [AWS environment memory](../../../../core/specs/ai-chat/aws-environment-memory/aws-environment-memory.md)

## Slice and contract decisions

The parent owns architecture, source authority, coverage, security, rollout and
sequential delivery. This child records only the dependency-free shared types
slice. No builder/storage/API/Chat/MCP implementation, package publication,
manual version bump or consumer dependency change is included.

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

Registry release must rebuild through normal automation and consumers must adopt
an exact published version. No version bump or package publication is authorized
by the current revision request. Runtime/shared-builder/API/Chat/MCP checks and
real Blob validation remain planned in their owning slices.
