# DEV-1036 diagnostic observation contract plan

## Goal

Define shared, cross-runtime contracts that make the newest observe-mode billing input discoverable without creating a second customer authority pointer.

## Invariants

- Observation documents are diagnostic-only and must never validate as either enforceable current-pointer type.
- `latest-enqueued.json` orders candidates only by the Cloud-owned monotonic `sourceRevision`.
- The observation pointer binds the exact immutable input manifest and queue message.
- The analyzer promotion observation is immutable and binds the exact input and output manifests.
- Canonical digests exclude their own digest field and are stable across TypeScript and Python.
- No package publish or consumer dependency update is part of this task.

## Task 1: shared contracts and corpus

Add:

- `BillingAnalyzerInputObservationPointerV1`
- `BillingAnalysisPromotionObservationV1`
- validators for both documents
- canonicalization for `BillingAnalysisPromotionObservationV1` excluding `observationDigest`
- contract/canonical corpus vectors and packed root export checks
- specification text that explicitly separates diagnostics from customer authority

Use strict TDD: first prove the missing exports/validators and authority-rejection assertions fail, then implement the smallest contract surface, then run the focused contract checks and full package test.

## Follow-up repository tasks

1. Cloud writes the observation pointer with bounded ETag CAS after successful enqueue.
2. Analyzer routes V2 before V1 parsing, pins immutable input, writes immutable output and promotion observation.
3. API reads observation documents only in observe mode, emits bounded telemetry, and never returns observed metadata.
4. Cross-repo tests mirror the canonical corpus and prove enforce/off perform zero observation reads.
