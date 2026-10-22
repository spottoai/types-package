import { FRAMEWORK_ASSESSMENT_LIMITS as limits } from './contracts';
import { parseAssessmentAccess } from './accessValidation';
import type {
  AssessmentJsonValue,
  EvidenceObservation,
  ScopeScanCompletion,
  ScopeScanEvidencePageDocument,
  ScopeScanManifest,
  ScopeScanRawPageDocument,
  ScopeScanStatusDocument,
} from './contracts';
import {
  choice,
  decodedBytes,
  identifier,
  input,
  invalid,
  list,
  number,
  record,
  requestChronologyValid,
  shape,
  text,
  timestamp,
  unique,
} from './internal';
import {
  parseAssessmentNativeScope,
  parseAssessmentPageReference,
  parseFrameworkFindingStatusCounts,
  requireAssessmentHash,
  requireSourceVersion,
} from './validation';

const evidenceObservation = (value: unknown): EvidenceObservation => {
  const row = shape(
    value,
    ['id', 'upstreamId', 'checkId', 'resourceId', 'status', 'collectionStatus', 'severity', 'message', 'reviewNotes', 'frameworkMappings'],
    ['evidenceCount']
  );
  const mappings = record(row.frameworkMappings, 'frameworkMappings');
  if (Object.keys(mappings).length > limits.frameworks) return invalid('framework mappings');
  const frameworkMappings: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(mappings)) frameworkMappings[identifier(key)] = unique(list(value).map(value => identifier(value)));
  const result: EvidenceObservation = {
    id: identifier(row.id),
    upstreamId: identifier(row.upstreamId, 4096),
    checkId: identifier(row.checkId),
    resourceId: identifier(row.resourceId, 4096),
    status: choice(row.status, ['PASS', 'FAIL', 'MANUAL']),
    collectionStatus: choice(row.collectionStatus, ['verified', 'unverified']),
    severity: identifier(row.severity),
    message: text(row.message),
    reviewNotes: list(row.reviewNotes, 1000).map(value => text(value)),
    frameworkMappings,
  };
  if (row.evidenceCount !== undefined) {
    result.evidenceCount = number(row.evidenceCount);
    if (!result.evidenceCount) return invalid('evidenceCount');
  }
  return result;
};
export const parseEvidenceObservation = (value: unknown): EvidenceObservation => evidenceObservation(input(value));

export const parseScopeScanManifest = (value: unknown): ScopeScanManifest => {
  const row = shape(input(value), [
    'schemaVersion',
    'scope',
    'sourceVersion',
    'catalogueBundleSha256',
    'request',
    'audit',
    'attemptId',
    'generatedAt',
    'exitCode',
    'rawFindingCount',
    'findingCount',
    'quarantinedFindingCount',
    'statusCounts',
    'access',
    'selectedCheckIds',
    'rawPages',
    'observationPages',
  ]);
  if (row.schemaVersion !== 2 || (row.exitCode !== 0 && row.exitCode !== 3)) return invalid('manifest identity');
  const request = shape(row.request, ['requestId', 'requestedAt']);
  const audit = shape(row.audit, ['companyId'], ['bootstrapSubscriptionId']);
  const result: ScopeScanManifest = {
    schemaVersion: 2,
    scope: parseAssessmentNativeScope(row.scope),
    sourceVersion: requireSourceVersion(row.sourceVersion),
    catalogueBundleSha256: requireAssessmentHash(row.catalogueBundleSha256),
    request: { requestId: identifier(request.requestId), requestedAt: timestamp(request.requestedAt) },
    audit: { companyId: identifier(audit.companyId) },
    attemptId: identifier(row.attemptId),
    generatedAt: timestamp(row.generatedAt),
    exitCode: row.exitCode,
    rawFindingCount: number(row.rawFindingCount),
    findingCount: number(row.findingCount),
    quarantinedFindingCount: number(row.quarantinedFindingCount),
    statusCounts: parseFrameworkFindingStatusCounts(row.statusCounts),
    access: parseAssessmentAccess(row.access),
    selectedCheckIds: unique(list(row.selectedCheckIds).map(value => identifier(value))),
    rawPages: list(row.rawPages, limits.pages).map(parseAssessmentPageReference),
    observationPages: list(row.observationPages, limits.pages).map(parseAssessmentPageReference),
  };
  if (audit.bootstrapSubscriptionId !== undefined) {
    // Bootstrap subscriptions authenticate Azure tenant scans only.
    if (result.scope.providerName !== 'azure') return invalid('audit bootstrap');
    const bootstrap = identifier(audit.bootstrapSubscriptionId);
    parseAssessmentNativeScope({ providerName: 'azure', scopeType: 'subscription', scopeId: bootstrap });
    result.audit.bootstrapSubscriptionId = bootstrap;
  }
  // Raw pages preserve the scanner's sequence: identical quarantined/raw evidence can repeat content.
  unique(result.observationPages.map(page => page.sha256));
  if (
    !requestChronologyValid(result.generatedAt, result.request.requestedAt) ||
    result.rawPages.reduce((sum, page) => sum + page.count, 0) !== result.rawFindingCount - result.quarantinedFindingCount ||
    result.observationPages.reduce((sum, page) => sum + page.count, 0) !== result.findingCount ||
    Object.values(result.statusCounts).reduce((sum, count) => sum + count, 0) !== result.findingCount ||
    result.quarantinedFindingCount > result.rawFindingCount
  )
    return invalid('manifest counts/chronology');
  return result;
};
export const parseScopeScanRawPageDocument = (value: unknown): ScopeScanRawPageDocument => {
  const row = shape(input(value), ['schemaVersion', 'items']);
  if (row.schemaVersion !== 2) return invalid('schemaVersion');
  const result: ScopeScanRawPageDocument = { schemaVersion: 2, items: list(row.items, limits.pageItems) as AssessmentJsonValue[] };
  if (decodedBytes(result) > limits.pageDecodedBytes) return invalid('raw page size');
  return result;
};
export const parseScopeScanEvidencePageDocument = (value: unknown): ScopeScanEvidencePageDocument => {
  const row = shape(input(value), ['schemaVersion', 'items']);
  if (row.schemaVersion !== 2) return invalid('schemaVersion');
  const result: ScopeScanEvidencePageDocument = { schemaVersion: 2, items: list(row.items, limits.pageItems).map(evidenceObservation) };
  unique(result.items.map(item => item.id));
  if (decodedBytes(result) > limits.pageDecodedBytes) return invalid('evidence page size');
  return result;
};
export const parseScopeScanCompletion = (value: unknown): ScopeScanCompletion => {
  const row = shape(input(value), [
    'schemaVersion',
    'type',
    'eventId',
    'scope',
    'requestId',
    'attemptId',
    'sourceVersion',
    'manifestSha256',
    'observedAt',
  ]);
  if (row.schemaVersion !== 2) return invalid('schemaVersion');
  return {
    schemaVersion: 2,
    type: choice(row.type, ['prowler.scope-scan.completed.v2']),
    eventId: identifier(row.eventId),
    scope: parseAssessmentNativeScope(row.scope),
    requestId: identifier(row.requestId),
    attemptId: identifier(row.attemptId),
    sourceVersion: requireSourceVersion(row.sourceVersion),
    manifestSha256: requireAssessmentHash(row.manifestSha256),
    observedAt: timestamp(row.observedAt),
  };
};
export const parseScopeScanStatusDocument = (value: unknown): ScopeScanStatusDocument => {
  const row = shape(
    input(value),
    ['schemaVersion', 'scope', 'sourceVersion', 'requestId', 'requestedAt', 'updatedAt', 'state', 'retryable', 'attempt'],
    ['reason']
  );
  if (row.schemaVersion !== 2 || typeof row.retryable !== 'boolean') return invalid('status identity');
  const result: ScopeScanStatusDocument = {
    schemaVersion: 2,
    scope: parseAssessmentNativeScope(row.scope),
    sourceVersion: requireSourceVersion(row.sourceVersion),
    requestId: identifier(row.requestId),
    requestedAt: timestamp(row.requestedAt),
    updatedAt: timestamp(row.updatedAt),
    state: choice(row.state, ['running', 'collected', 'processing', 'completed', 'failed', 'superseded']),
    retryable: row.retryable,
    attempt: number(row.attempt),
  };
  if (row.reason !== undefined) result.reason = identifier(row.reason, 1024);
  if (!requestChronologyValid(result.updatedAt, result.requestedAt)) return invalid('status chronology');
  return result;
};
