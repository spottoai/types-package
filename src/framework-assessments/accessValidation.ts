import type { AssessmentAccess, AssessmentAccessSummary, AssessmentCollectionIssue, EvidenceObservation, ScopeScanManifest } from './contracts';
import { choice, identifier, input, invalid, list, number, shape, timestamp, unique } from './internal';

export const parseAssessmentAccessSummary = (value: unknown): AssessmentAccessSummary => {
  const row = shape(input(value), ['status'], ['reason']);
  return {
    status: choice(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
    ...(row.reason === undefined ? {} : { reason: identifier(row.reason, 1024) }),
  };
};

/** Bounded public evidence: arbitrary sidecar strings and storage locators are rejected. */
export const parseAssessmentAccess = (value: unknown): AssessmentAccess => {
  const row = shape(
    input(value),
    ['schemaVersion', 'provider', 'scopeType', 'observedAt', 'source', 'status', 'diagnosticsComplete', 'suppressedFindingCount', 'checks', 'issues'],
    ['tenantId', 'subscriptionId', 'reason', 'inventory']
  );
  if (row.schemaVersion !== 1 || row.provider !== 'azure' || typeof row.diagnosticsComplete !== 'boolean') return invalid('access identity');
  const scopeType = choice(row.scopeType, ['subscription', 'tenant']);
  const scopeId = identifier(scopeType === 'tenant' ? row.tenantId : row.subscriptionId);
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(scopeId) ||
    scopeId.includes('..') ||
    (scopeType === 'tenant' ? row.subscriptionId !== undefined : row.tenantId !== undefined)
  )
    return invalid('access scope');
  const checks = list(row.checks).map(value => {
    const check = shape(value, ['checkId', 'status']);
    return { checkId: identifier(check.checkId), status: choice(check.status, ['evaluated', 'blocked', 'manual-review', 'not-observed', 'unknown']) };
  });
  unique(checks.map(check => check.checkId));
  const known = new Set(checks.map(check => check.checkId));
  const issues = list(row.issues, 1000).map((value): AssessmentCollectionIssue => {
    const issue = shape(
      value,
      ['capability', 'reason', 'affectedCheckIds', 'readPermissionGuidance'],
      ['httpStatus', 'providerErrorCode', 'origin', 'checkId', 'droppedFindingCount']
    );
    const result: AssessmentCollectionIssue = {
      capability: identifier(issue.capability),
      reason: choice(issue.reason, [
        'missing-permission',
        'access-denied',
        'authentication-failed',
        'license-required',
        'throttled',
        'collection-error',
      ]),
      affectedCheckIds: unique(list(issue.affectedCheckIds).map(value => identifier(value))),
      readPermissionGuidance: unique(list(issue.readPermissionGuidance, 100).map(value => identifier(value, 1024))),
    };
    if (result.affectedCheckIds.some(id => !known.has(id))) return invalid('access issue checks');
    if (issue.httpStatus !== undefined) {
      result.httpStatus = number(issue.httpStatus, 599);
      if (result.httpStatus < 400) return invalid('httpStatus');
    }
    if (issue.providerErrorCode !== undefined) result.providerErrorCode = identifier(issue.providerErrorCode);
    if (issue.origin !== undefined)
      result.origin = choice(issue.origin, [
        'service-collection',
        'provider-initialization',
        'tenant-domain-lookup',
        'check-execution',
        'output-transform',
      ] as const);
    if (issue.checkId !== undefined) {
      result.checkId = identifier(issue.checkId);
      if (!known.has(result.checkId) || !['check-execution', 'output-transform'].includes(result.origin ?? '')) return invalid('issue check origin');
    }
    if (issue.droppedFindingCount !== undefined) {
      result.droppedFindingCount = number(issue.droppedFindingCount, 1000000);
      if (!result.droppedFindingCount || result.origin !== 'output-transform') return invalid('droppedFindingCount');
    }
    return result;
  });
  const result: AssessmentAccess = {
    schemaVersion: 1,
    provider: 'azure',
    ...(scopeType === 'tenant' ? { scopeType, tenantId: scopeId } : { scopeType, subscriptionId: scopeId }),
    observedAt: timestamp(row.observedAt),
    source: choice(row.source, ['collector', 'unavailable', 'import']),
    status: choice(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
    diagnosticsComplete: row.diagnosticsComplete,
    suppressedFindingCount: number(row.suppressedFindingCount),
    checks,
    issues,
  };
  if (row.reason !== undefined) result.reason = identifier(row.reason, 1024);
  if (row.inventory !== undefined) {
    const inventory = shape(
      row.inventory,
      [],
      ['status', 'availability', 'complete', 'resourceCount', 'observedAt', 'reason', 'rawSha256', 'observationSha256', 'conformedSha256']
    );
    result.inventory = {};
    for (const key of ['status', 'availability', 'reason'] as const)
      if (inventory[key] !== undefined) result.inventory[key] = identifier(inventory[key], 1024);
    for (const key of ['rawSha256', 'observationSha256', 'conformedSha256'] as const)
      if (inventory[key] !== undefined) {
        const digest = identifier(inventory[key], 64);
        if (!/^[a-f0-9]{64}$/u.test(digest)) return invalid('inventory digest');
        result.inventory[key] = digest;
      }
    if (inventory.resourceCount !== undefined) result.inventory.resourceCount = number(inventory.resourceCount);
    if (inventory.observedAt !== undefined) result.inventory.observedAt = timestamp(inventory.observedAt);
    if (inventory.complete !== undefined) {
      if (typeof inventory.complete !== 'boolean') return invalid('inventory complete');
      result.inventory.complete = inventory.complete;
    }
  }
  return result;
};

export const validateScopeScanAccess = (
  manifest: ScopeScanManifest,
  observations: readonly EvidenceObservation[]
): Pick<AssessmentAccess, 'diagnosticsComplete' | 'checks'> => {
  const access = parseAssessmentAccess(manifest.access);
  const scopeId = access.scopeType === 'tenant' ? access.tenantId : access.subscriptionId;
  if (
    manifest.scope.providerName !== access.provider ||
    manifest.scope.scopeType !== access.scopeType ||
    manifest.scope.scopeId !== scopeId ||
    access.observedAt !== manifest.generatedAt ||
    access.checks.length !== manifest.selectedCheckIds.length ||
    access.checks.some(check => !manifest.selectedCheckIds.includes(check.checkId))
  )
    return invalid('access manifest binding');
  for (const row of observations) {
    if (
      row.collectionStatus === 'verified' &&
      (access.source !== 'collector' ||
        !access.diagnosticsComplete ||
        !access.checks.some(check => check.checkId === row.checkId && ['evaluated', 'manual-review', 'unknown'].includes(check.status)) ||
        access.issues.some(
          issue =>
            issue.origin !== 'tenant-domain-lookup' &&
            (issue.checkId === row.checkId ||
              (issue.capability !== 'azure-provider' && issue.origin === 'service-collection' && issue.affectedCheckIds.includes(row.checkId)))
        ))
    )
      return invalid('verified finding access');
  }
  return { diagnosticsComplete: access.diagnosticsComplete, checks: access.checks };
};
