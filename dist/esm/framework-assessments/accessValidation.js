/** The native scope id the access evidence is bound to. */
export const assessmentAccessScopeId = (access) => access.scopeType === 'tenant' ? access.tenantId : access.scopeType === 'account' ? access.accountId : access.subscriptionId;
/** The capability that reports provider initialisation (credentials, region discovery) for each provider. */
export const ASSESSMENT_PROVIDER_CAPABILITY = Object.freeze({ azure: 'azure-provider', aws: 'aws-provider' });
const PROVIDER_CAPABILITIES = new Set(Object.values(ASSESSMENT_PROVIDER_CAPABILITY));
const AWS_ACCOUNT_ID = /^\d{12}$/u;
import { choice, identifier, input, invalid, list, number, shape, timestamp, unique } from './internal.js';
export const parseAssessmentAccessSummary = (value) => {
    const row = shape(input(value), ['status'], ['reason']);
    return {
        status: choice(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
        ...(row.reason === undefined ? {} : { reason: identifier(row.reason, 1024) }),
    };
};
/** Bounded public evidence: arbitrary sidecar strings and storage locators are rejected. */
export const parseAssessmentAccess = (value) => {
    const row = shape(input(value), ['schemaVersion', 'provider', 'scopeType', 'observedAt', 'source', 'status', 'diagnosticsComplete', 'suppressedFindingCount', 'checks', 'issues'], ['tenantId', 'subscriptionId', 'accountId', 'reason', 'inventory']);
    if (row.schemaVersion !== 1 || typeof row.diagnosticsComplete !== 'boolean')
        return invalid('access identity');
    const provider = choice(row.provider, ['azure', 'aws']);
    const scopeType = choice(row.scopeType, provider === 'aws' ? ['account'] : ['subscription', 'tenant']);
    const idField = scopeType === 'tenant' ? 'tenantId' : scopeType === 'account' ? 'accountId' : 'subscriptionId';
    const scopeId = identifier(row[idField]);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(scopeId) ||
        scopeId.includes('..') ||
        (scopeType === 'account' && !AWS_ACCOUNT_ID.test(scopeId)) ||
        ['tenantId', 'subscriptionId', 'accountId'].some(field => field !== idField && row[field] !== undefined))
        return invalid('access scope');
    const checks = list(row.checks).map(value => {
        const check = shape(value, ['checkId', 'status']);
        return { checkId: identifier(check.checkId), status: choice(check.status, ['evaluated', 'blocked', 'manual-review', 'not-observed', 'unknown']) };
    });
    unique(checks.map(check => check.checkId));
    const known = new Set(checks.map(check => check.checkId));
    const issues = list(row.issues, 1000).map((value) => {
        const issue = shape(value, ['capability', 'reason', 'affectedCheckIds', 'readPermissionGuidance'], ['httpStatus', 'providerErrorCode', 'origin', 'checkId', 'droppedFindingCount']);
        const result = {
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
        if (result.affectedCheckIds.some(id => !known.has(id)))
            return invalid('access issue checks');
        if (issue.httpStatus !== undefined) {
            result.httpStatus = number(issue.httpStatus, 599);
            if (result.httpStatus < 400)
                return invalid('httpStatus');
        }
        if (issue.providerErrorCode !== undefined)
            result.providerErrorCode = identifier(issue.providerErrorCode);
        if (issue.origin !== undefined)
            result.origin = choice(issue.origin, [
                'service-collection',
                'provider-initialization',
                'tenant-domain-lookup',
                'check-execution',
                'output-transform',
            ]);
        if (issue.checkId !== undefined) {
            result.checkId = identifier(issue.checkId);
            if (!known.has(result.checkId) || !['check-execution', 'output-transform'].includes(result.origin ?? ''))
                return invalid('issue check origin');
        }
        if (issue.droppedFindingCount !== undefined) {
            result.droppedFindingCount = number(issue.droppedFindingCount, 1000000);
            if (!result.droppedFindingCount || result.origin !== 'output-transform')
                return invalid('droppedFindingCount');
        }
        return result;
    });
    const scopeFields = scopeType === 'account'
        ? { provider: 'aws', scopeType, accountId: scopeId }
        : scopeType === 'tenant'
            ? { provider: 'azure', scopeType, tenantId: scopeId }
            : { provider: 'azure', scopeType, subscriptionId: scopeId };
    const result = {
        schemaVersion: 1,
        ...scopeFields,
        observedAt: timestamp(row.observedAt),
        source: choice(row.source, ['collector', 'unavailable', 'import']),
        status: choice(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
        diagnosticsComplete: row.diagnosticsComplete,
        suppressedFindingCount: number(row.suppressedFindingCount),
        checks,
        issues,
    };
    if (row.reason !== undefined)
        result.reason = identifier(row.reason, 1024);
    if (row.inventory !== undefined) {
        const inventory = shape(row.inventory, [], ['status', 'availability', 'complete', 'resourceCount', 'observedAt', 'reason', 'rawSha256', 'observationSha256', 'conformedSha256']);
        result.inventory = {};
        for (const key of ['status', 'availability', 'reason'])
            if (inventory[key] !== undefined)
                result.inventory[key] = identifier(inventory[key], 1024);
        for (const key of ['rawSha256', 'observationSha256', 'conformedSha256'])
            if (inventory[key] !== undefined) {
                const digest = identifier(inventory[key], 64);
                if (!/^[a-f0-9]{64}$/u.test(digest))
                    return invalid('inventory digest');
                result.inventory[key] = digest;
            }
        if (inventory.resourceCount !== undefined)
            result.inventory.resourceCount = number(inventory.resourceCount);
        if (inventory.observedAt !== undefined)
            result.inventory.observedAt = timestamp(inventory.observedAt);
        if (inventory.complete !== undefined) {
            if (typeof inventory.complete !== 'boolean')
                return invalid('inventory complete');
            result.inventory.complete = inventory.complete;
        }
    }
    return result;
};
export const validateScopeScanAccess = (manifest, observations) => {
    const access = parseAssessmentAccess(manifest.access);
    const scopeId = assessmentAccessScopeId(access);
    if (manifest.scope.providerName !== access.provider ||
        manifest.scope.scopeType !== access.scopeType ||
        manifest.scope.scopeId !== scopeId ||
        access.observedAt !== manifest.generatedAt ||
        access.checks.length !== manifest.selectedCheckIds.length ||
        access.checks.some(check => !manifest.selectedCheckIds.includes(check.checkId)))
        return invalid('access manifest binding');
    for (const row of observations) {
        if (row.collectionStatus === 'verified' &&
            (access.source !== 'collector' ||
                !access.diagnosticsComplete ||
                !access.checks.some(check => check.checkId === row.checkId && ['evaluated', 'manual-review', 'unknown'].includes(check.status)) ||
                access.issues.some(issue => issue.origin !== 'tenant-domain-lookup' &&
                    (issue.checkId === row.checkId ||
                        (!PROVIDER_CAPABILITIES.has(issue.capability) && issue.origin === 'service-collection' && issue.affectedCheckIds.includes(row.checkId))))))
            return invalid('verified finding access');
    }
    return { diagnosticsComplete: access.diagnosticsComplete, checks: access.checks };
};
