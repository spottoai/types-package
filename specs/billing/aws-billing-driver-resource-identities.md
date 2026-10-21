# AWS billing driver resource identity correction

Status: Types changes complete; package release and consumer adoption outstanding
Updated: 2026-10-21
Owner: Shared billing contracts
Authorization: Jay requested all types-package changes before engine or analyzer changes.

## Scope and decision

Correct the dependency-free AWS billing driver identity guard used by
`isBillingCostAnalysisBusinessPayloadV1`. Follow Jay's subsequent instruction to
support many services without service-name branches or an allowlist. Validate
safe ARN structure with optional Region/account and slash-leading resources;
any explicit account must match the billing account. Preserve native identifiers, field/path
restrictions, control-data rejection and Azure validation intact. An accepted
recorded identity is display evidence, never proof of ownership or access.

The captured failed account `305430375019` establishes a shared guard rejection
of otherwise valid API Gateway and Route53 identities. Commit only synthetic
fixtures; retained customer input/results remain private operator evidence.

Primary provider contracts (examples do not become validator service branches):
- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html
- https://docs.aws.amazon.com/apigateway/latest/developerguide/arn-format-reference.html
- https://docs.aws.amazon.com/service-authorization/latest/reference/list_route53.html

Shared resource DTOs already allow finite signed percentage changes and zero
cost with a positive baseline. Preserve those semantics and document them.
Evidence sufficient to include a baseline-only resource remains the producer's
responsibility; missing evidence cannot be treated as measured zero. No new
wire fields or schema version, compatibility parser, SDK/I/O dependency,
publication, consumer installation or live runner change is included.

## Tasks and verification

1. Extend existing AWS business-boundary regressions for both CJS and ESM:
   previously unseen service names, optional Region/account combinations,
   slash-leading and qualified paths, real ARN examples, partitions, explicit own and
   foreign accounts, malformed/control/traversal identities, alias leakage,
   decreases, assessed zero and unassessed null. Observe rejection before fix.
2. Correct only the pure identity guard and clarify resource DTO documentation.
   No service-specific strings or per-service grammar belong in the guard.
   Keep bounded safe characters, complete ARN structure and explicit-account
   matching; exact service validity and ownership remain producer checks.
3. Include the AWS driver checks in `npm test`; exercise published root exports
   in the existing packed CJS/ESM gate. Run build, focused tests, full package
   tests and lint. Replay the private captured business payload against built
   guards without changing stored data or exposing customer values.

## Risks and remaining work

- Widening the exemption could expose artifact controls: retain exact driver
  traversal context and test unsafe IDs and additive/aliased control fields.
- Structural validity and accountless ARNs do not prove ownership: engine/analyzer must still bind
  evidence to the captured account, service, period and generation.
- Baseline-only attribution and decreasing-resource calculations still require
  engine/analyzer alignment. Tests of shared shape acceptance are not evidence
  that those producer/consumer checks are fixed.
- Source changes require a subsequent package release and consumer adoption.
  Do not alter installed dependencies of the active frozen runners.

## Completion criteria

Focused RED/GREEN, both built formats, packed root imports, existing Azure and
control-data rejection cases, full `npm test`, and fresh scoped lint pass.
Record exact outcomes and distinguish source completion from release/adoption.

## Verification evidence

- The service-agnostic regression was RED against a fresh isolated build of the
  service-specific candidate: a previously unseen regional accountless service
  was rejected. It is GREEN after removing all service branches.
- Final `npm test` exited 0 in `/tmp/types-billing-contract-x4ig9ybf`, including
  fresh dual builds, contract typechecks, AWS driver regressions, existing Azure
  contracts, and packed root import/require consumer checks.
- Final isolated `npm run lint` exited 0. Scoped formatting and `git diff --check`
  pass in the owning checkout. Independent contract and security source reviews
  reported no actionable findings for the revised generic contract.
- The unchanged private captured failed business payload passes both new built
  validators. A mutation to an explicit foreign account remains rejected. No
  stored input/result was edited and no network calls were made for this replay.
- A prior direct probe encountered independently rewritten shared-checkout
  generated outputs and failed an unchanged baseline case. It is not counted
  as feature RED evidence. Final commands use an isolated source copy and
  complete fresh outputs; shared tracked `dist` was not restored by this task.
  Own untracked early build outputs were backed up and removed. A complete
  verified local candidate tarball is retained without registry publication.

Local command logs, package integrity and private-replay hashes are under
`logs/aws-billing-driver-contract/` (ignored). Source/tests/package-manifest
hashes bind the isolated candidate to the owning checkout. Package version is
unchanged; the registry release, consumer adoption, engine/analyzer corrections
and any replay or refresh of live jobs remain separate work.
