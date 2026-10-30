"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateScopeScanAccess = exports.parseAssessmentAccess = exports.parseAssessmentAccessSummary = exports.ASSESSMENT_PROVIDER_CAPABILITY = exports.assessmentAccessScopeId = void 0;
/** The native scope id the access evidence is bound to. */
const assessmentAccessScopeId = (access) => access.scopeType === 'tenant' ? access.tenantId : access.scopeType === 'account' ? access.accountId : access.subscriptionId;
exports.assessmentAccessScopeId = assessmentAccessScopeId;
/** The capability that reports provider initialisation (credentials, region discovery) for each provider. */
exports.ASSESSMENT_PROVIDER_CAPABILITY = Object.freeze({ azure: 'azure-provider', aws: 'aws-provider' });
const PROVIDER_CAPABILITIES = new Set(Object.values(exports.ASSESSMENT_PROVIDER_CAPABILITY));
const AWS_ACCOUNT_ID = /^\d{12}$/u;
const internal_1 = require("./internal");
const parseAssessmentAccessSummary = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['status'], ['reason']);
    return {
        status: (0, internal_1.choice)(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
        ...(row.reason === undefined ? {} : { reason: (0, internal_1.identifier)(row.reason, 1024) }),
    };
};
exports.parseAssessmentAccessSummary = parseAssessmentAccessSummary;
/** Bounded public evidence: arbitrary sidecar strings and storage locators are rejected. */
const parseAssessmentAccess = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'provider', 'scopeType', 'observedAt', 'source', 'status', 'diagnosticsComplete', 'suppressedFindingCount', 'checks', 'issues'], ['tenantId', 'subscriptionId', 'accountId', 'reason', 'inventory']);
    if (row.schemaVersion !== 1 || typeof row.diagnosticsComplete !== 'boolean')
        return (0, internal_1.invalid)('access identity');
    const provider = (0, internal_1.choice)(row.provider, ['azure', 'aws']);
    const scopeType = (0, internal_1.choice)(row.scopeType, provider === 'aws' ? ['account'] : ['subscription', 'tenant']);
    const idField = scopeType === 'tenant' ? 'tenantId' : scopeType === 'account' ? 'accountId' : 'subscriptionId';
    const scopeId = (0, internal_1.identifier)(row[idField]);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(scopeId) ||
        scopeId.includes('..') ||
        (scopeType === 'account' && !AWS_ACCOUNT_ID.test(scopeId)) ||
        ['tenantId', 'subscriptionId', 'accountId'].some(field => field !== idField && row[field] !== undefined))
        return (0, internal_1.invalid)('access scope');
    const checks = (0, internal_1.list)(row.checks).map(value => {
        const check = (0, internal_1.shape)(value, ['checkId', 'status']);
        return { checkId: (0, internal_1.identifier)(check.checkId), status: (0, internal_1.choice)(check.status, ['evaluated', 'blocked', 'manual-review', 'not-observed', 'unknown']) };
    });
    (0, internal_1.unique)(checks.map(check => check.checkId));
    const known = new Set(checks.map(check => check.checkId));
    const issues = (0, internal_1.list)(row.issues, 1000).map((value) => {
        const issue = (0, internal_1.shape)(value, ['capability', 'reason', 'affectedCheckIds', 'readPermissionGuidance'], ['httpStatus', 'providerErrorCode', 'origin', 'checkId', 'droppedFindingCount']);
        const result = {
            capability: (0, internal_1.identifier)(issue.capability),
            reason: (0, internal_1.choice)(issue.reason, [
                'missing-permission',
                'access-denied',
                'authentication-failed',
                'license-required',
                'throttled',
                'collection-error',
            ]),
            affectedCheckIds: (0, internal_1.unique)((0, internal_1.list)(issue.affectedCheckIds).map(value => (0, internal_1.identifier)(value))),
            readPermissionGuidance: (0, internal_1.unique)((0, internal_1.list)(issue.readPermissionGuidance, 100).map(value => (0, internal_1.identifier)(value, 1024))),
        };
        if (result.affectedCheckIds.some(id => !known.has(id)))
            return (0, internal_1.invalid)('access issue checks');
        if (issue.httpStatus !== undefined) {
            result.httpStatus = (0, internal_1.number)(issue.httpStatus, 599);
            if (result.httpStatus < 400)
                return (0, internal_1.invalid)('httpStatus');
        }
        if (issue.providerErrorCode !== undefined)
            result.providerErrorCode = (0, internal_1.identifier)(issue.providerErrorCode);
        if (issue.origin !== undefined)
            result.origin = (0, internal_1.choice)(issue.origin, [
                'service-collection',
                'provider-initialization',
                'tenant-domain-lookup',
                'check-execution',
                'output-transform',
            ]);
        if (issue.checkId !== undefined) {
            result.checkId = (0, internal_1.identifier)(issue.checkId);
            if (!known.has(result.checkId) || !['check-execution', 'output-transform'].includes(result.origin ?? ''))
                return (0, internal_1.invalid)('issue check origin');
        }
        if (issue.droppedFindingCount !== undefined) {
            result.droppedFindingCount = (0, internal_1.number)(issue.droppedFindingCount, 1000000);
            if (!result.droppedFindingCount || result.origin !== 'output-transform')
                return (0, internal_1.invalid)('droppedFindingCount');
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
        observedAt: (0, internal_1.timestamp)(row.observedAt),
        source: (0, internal_1.choice)(row.source, ['collector', 'unavailable', 'import']),
        status: (0, internal_1.choice)(row.status, ['observations-available', 'partial', 'blocked', 'unknown']),
        diagnosticsComplete: row.diagnosticsComplete,
        suppressedFindingCount: (0, internal_1.number)(row.suppressedFindingCount),
        checks,
        issues,
    };
    if (row.reason !== undefined)
        result.reason = (0, internal_1.identifier)(row.reason, 1024);
    if (row.inventory !== undefined) {
        const inventory = (0, internal_1.shape)(row.inventory, [], ['status', 'availability', 'complete', 'resourceCount', 'observedAt', 'reason', 'rawSha256', 'observationSha256', 'conformedSha256']);
        result.inventory = {};
        for (const key of ['status', 'availability', 'reason'])
            if (inventory[key] !== undefined)
                result.inventory[key] = (0, internal_1.identifier)(inventory[key], 1024);
        for (const key of ['rawSha256', 'observationSha256', 'conformedSha256'])
            if (inventory[key] !== undefined) {
                const digest = (0, internal_1.identifier)(inventory[key], 64);
                if (!/^[a-f0-9]{64}$/u.test(digest))
                    return (0, internal_1.invalid)('inventory digest');
                result.inventory[key] = digest;
            }
        if (inventory.resourceCount !== undefined)
            result.inventory.resourceCount = (0, internal_1.number)(inventory.resourceCount);
        if (inventory.observedAt !== undefined)
            result.inventory.observedAt = (0, internal_1.timestamp)(inventory.observedAt);
        if (inventory.complete !== undefined) {
            if (typeof inventory.complete !== 'boolean')
                return (0, internal_1.invalid)('inventory complete');
            result.inventory.complete = inventory.complete;
        }
    }
    return result;
};
exports.parseAssessmentAccess = parseAssessmentAccess;
const validateScopeScanAccess = (manifest, observations) => {
    const access = (0, exports.parseAssessmentAccess)(manifest.access);
    const scopeId = (0, exports.assessmentAccessScopeId)(access);
    if (manifest.scope.providerName !== access.provider ||
        manifest.scope.scopeType !== access.scopeType ||
        manifest.scope.scopeId !== scopeId ||
        access.observedAt !== manifest.generatedAt ||
        access.checks.length !== manifest.selectedCheckIds.length ||
        access.checks.some(check => !manifest.selectedCheckIds.includes(check.checkId)))
        return (0, internal_1.invalid)('access manifest binding');
    for (const row of observations) {
        if (row.collectionStatus === 'verified' &&
            (access.source !== 'collector' ||
                !access.diagnosticsComplete ||
                !access.checks.some(check => check.checkId === row.checkId && ['evaluated', 'manual-review', 'unknown'].includes(check.status)) ||
                access.issues.some(issue => issue.origin !== 'tenant-domain-lookup' &&
                    (issue.checkId === row.checkId ||
                        (!PROVIDER_CAPABILITIES.has(issue.capability) && issue.origin === 'service-collection' && issue.affectedCheckIds.includes(row.checkId))))))
            return (0, internal_1.invalid)('verified finding access');
    }
    return { diagnosticsComplete: access.diagnosticsComplete, checks: access.checks };
};
exports.validateScopeScanAccess = validateScopeScanAccess;
//# sourceMappingURL=accessValidation.js.map