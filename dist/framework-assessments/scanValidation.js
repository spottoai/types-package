"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScopeScanStatusDocument = exports.parseScopeScanCompletion = exports.parseScopeScanEvidencePageDocument = exports.parseScopeScanRawPageDocument = exports.parseScopeScanManifest = exports.parseEvidenceObservation = void 0;
const contracts_1 = require("./contracts");
const accessValidation_1 = require("./accessValidation");
const internal_1 = require("./internal");
const validation_1 = require("./validation");
const evidenceObservation = (value) => {
    const row = (0, internal_1.shape)(value, ['id', 'upstreamId', 'checkId', 'resourceId', 'status', 'collectionStatus', 'severity', 'message', 'reviewNotes', 'frameworkMappings'], ['evidenceCount']);
    const mappings = (0, internal_1.record)(row.frameworkMappings, 'frameworkMappings');
    if (Object.keys(mappings).length > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.frameworks)
        return (0, internal_1.invalid)('framework mappings');
    const frameworkMappings = {};
    for (const [key, value] of Object.entries(mappings))
        frameworkMappings[(0, internal_1.identifier)(key)] = (0, internal_1.unique)((0, internal_1.list)(value).map(value => (0, internal_1.identifier)(value)));
    const result = {
        id: (0, internal_1.identifier)(row.id),
        upstreamId: (0, internal_1.identifier)(row.upstreamId, 4096),
        checkId: (0, internal_1.identifier)(row.checkId),
        resourceId: (0, internal_1.identifier)(row.resourceId, 4096),
        status: (0, internal_1.choice)(row.status, ['PASS', 'FAIL', 'MANUAL']),
        collectionStatus: (0, internal_1.choice)(row.collectionStatus, ['verified', 'unverified']),
        severity: (0, internal_1.identifier)(row.severity),
        message: (0, internal_1.text)(row.message),
        reviewNotes: (0, internal_1.list)(row.reviewNotes, 1000).map(value => (0, internal_1.text)(value)),
        frameworkMappings,
    };
    if (row.evidenceCount !== undefined) {
        result.evidenceCount = (0, internal_1.number)(row.evidenceCount);
        if (!result.evidenceCount)
            return (0, internal_1.invalid)('evidenceCount');
    }
    return result;
};
const parseEvidenceObservation = (value) => evidenceObservation((0, internal_1.input)(value));
exports.parseEvidenceObservation = parseEvidenceObservation;
const parseScopeScanManifest = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), [
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
    if (row.schemaVersion !== 2 || (row.exitCode !== 0 && row.exitCode !== 3))
        return (0, internal_1.invalid)('manifest identity');
    const request = (0, internal_1.shape)(row.request, ['requestId', 'requestedAt']);
    const audit = (0, internal_1.shape)(row.audit, ['companyId'], ['bootstrapSubscriptionId']);
    const result = {
        schemaVersion: 2,
        scope: (0, validation_1.parseAssessmentNativeScope)(row.scope),
        sourceVersion: (0, validation_1.requireSourceVersion)(row.sourceVersion),
        catalogueBundleSha256: (0, validation_1.requireAssessmentHash)(row.catalogueBundleSha256),
        request: { requestId: (0, internal_1.identifier)(request.requestId), requestedAt: (0, internal_1.timestamp)(request.requestedAt) },
        audit: { companyId: (0, internal_1.identifier)(audit.companyId) },
        attemptId: (0, internal_1.identifier)(row.attemptId),
        generatedAt: (0, internal_1.timestamp)(row.generatedAt),
        exitCode: row.exitCode,
        rawFindingCount: (0, internal_1.number)(row.rawFindingCount),
        findingCount: (0, internal_1.number)(row.findingCount),
        quarantinedFindingCount: (0, internal_1.number)(row.quarantinedFindingCount),
        statusCounts: (0, validation_1.parseFrameworkFindingStatusCounts)(row.statusCounts),
        access: (0, accessValidation_1.parseAssessmentAccess)(row.access),
        selectedCheckIds: (0, internal_1.unique)((0, internal_1.list)(row.selectedCheckIds).map(value => (0, internal_1.identifier)(value))),
        rawPages: (0, internal_1.list)(row.rawPages, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pages).map(validation_1.parseAssessmentPageReference),
        observationPages: (0, internal_1.list)(row.observationPages, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pages).map(validation_1.parseAssessmentPageReference),
    };
    if (audit.bootstrapSubscriptionId !== undefined) {
        // Bootstrap subscriptions authenticate Azure tenant scans only.
        if (result.scope.providerName !== 'azure')
            return (0, internal_1.invalid)('audit bootstrap');
        const bootstrap = (0, internal_1.identifier)(audit.bootstrapSubscriptionId);
        (0, validation_1.parseAssessmentNativeScope)({ providerName: 'azure', scopeType: 'subscription', scopeId: bootstrap });
        result.audit.bootstrapSubscriptionId = bootstrap;
    }
    // Raw pages preserve the scanner's sequence: identical quarantined/raw evidence can repeat content.
    (0, internal_1.unique)(result.observationPages.map(page => page.sha256));
    if (!(0, internal_1.requestChronologyValid)(result.generatedAt, result.request.requestedAt) ||
        result.rawPages.reduce((sum, page) => sum + page.count, 0) !== result.rawFindingCount - result.quarantinedFindingCount ||
        result.observationPages.reduce((sum, page) => sum + page.count, 0) !== result.findingCount ||
        Object.values(result.statusCounts).reduce((sum, count) => sum + count, 0) !== result.findingCount ||
        result.quarantinedFindingCount > result.rawFindingCount)
        return (0, internal_1.invalid)('manifest counts/chronology');
    return result;
};
exports.parseScopeScanManifest = parseScopeScanManifest;
const parseScopeScanRawPageDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'items']);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const result = { schemaVersion: 2, items: (0, internal_1.list)(row.items, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageItems) };
    if ((0, internal_1.decodedBytes)(result) > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes)
        return (0, internal_1.invalid)('raw page size');
    return result;
};
exports.parseScopeScanRawPageDocument = parseScopeScanRawPageDocument;
const parseScopeScanEvidencePageDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'items']);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const result = { schemaVersion: 2, items: (0, internal_1.list)(row.items, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageItems).map(evidenceObservation) };
    (0, internal_1.unique)(result.items.map(item => item.id));
    if ((0, internal_1.decodedBytes)(result) > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes)
        return (0, internal_1.invalid)('evidence page size');
    return result;
};
exports.parseScopeScanEvidencePageDocument = parseScopeScanEvidencePageDocument;
const parseScopeScanCompletion = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), [
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
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    return {
        schemaVersion: 2,
        type: (0, internal_1.choice)(row.type, ['prowler.scope-scan.completed.v2']),
        eventId: (0, internal_1.identifier)(row.eventId),
        scope: (0, validation_1.parseAssessmentNativeScope)(row.scope),
        requestId: (0, internal_1.identifier)(row.requestId),
        attemptId: (0, internal_1.identifier)(row.attemptId),
        sourceVersion: (0, validation_1.requireSourceVersion)(row.sourceVersion),
        manifestSha256: (0, validation_1.requireAssessmentHash)(row.manifestSha256),
        observedAt: (0, internal_1.timestamp)(row.observedAt),
    };
};
exports.parseScopeScanCompletion = parseScopeScanCompletion;
const parseScopeScanStatusDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'scope', 'sourceVersion', 'requestId', 'requestedAt', 'updatedAt', 'state', 'retryable', 'attempt'], ['reason']);
    if (row.schemaVersion !== 2 || typeof row.retryable !== 'boolean')
        return (0, internal_1.invalid)('status identity');
    const result = {
        schemaVersion: 2,
        scope: (0, validation_1.parseAssessmentNativeScope)(row.scope),
        sourceVersion: (0, validation_1.requireSourceVersion)(row.sourceVersion),
        requestId: (0, internal_1.identifier)(row.requestId),
        requestedAt: (0, internal_1.timestamp)(row.requestedAt),
        updatedAt: (0, internal_1.timestamp)(row.updatedAt),
        state: (0, internal_1.choice)(row.state, ['running', 'collected', 'processing', 'completed', 'failed', 'superseded']),
        retryable: row.retryable,
        attempt: (0, internal_1.number)(row.attempt),
    };
    if (row.reason !== undefined)
        result.reason = (0, internal_1.identifier)(row.reason, 1024);
    if (!(0, internal_1.requestChronologyValid)(result.updatedAt, result.requestedAt))
        return (0, internal_1.invalid)('status chronology');
    return result;
};
exports.parseScopeScanStatusDocument = parseScopeScanStatusDocument;
//# sourceMappingURL=scanValidation.js.map