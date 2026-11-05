"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrameworkFindingPageDocument = exports.parseFrameworkAssessmentSummaryDocument = exports.parseFrameworkAssessmentDocument = exports.parseFrameworkCatalogueIndexDocument = exports.parseFrameworkCatalogueDocument = exports.parseFrameworkFindingStatusCounts = exports.parseFrameworkControlAssessment = exports.parseFrameworkFinding = exports.parseFrameworkAssessmentSource = exports.parseFrameworkCatalogueReference = exports.parseAssessmentPageReference = exports.parseAssessmentNativeScope = exports.requireAssessmentHash = exports.requireSourceVersion = exports.requireFrameworkId = void 0;
const contracts_1 = require("./contracts");
const accessValidation_1 = require("./accessValidation");
const internal_1 = require("./internal");
const requireFrameworkId = (value) => {
    const result = (0, internal_1.identifier)(value, 64);
    return /^[a-z0-9][a-z0-9_-]{0,63}$/u.test(result) ? result : (0, internal_1.invalid)('frameworkId');
};
exports.requireFrameworkId = requireFrameworkId;
const requireSourceVersion = (value) => {
    const result = (0, internal_1.identifier)(value, 32);
    return /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/u.test(result) ? result : (0, internal_1.invalid)('sourceVersion');
};
exports.requireSourceVersion = requireSourceVersion;
const requireAssessmentHash = (value) => {
    const result = (0, internal_1.text)(value, 64, false);
    return /^[a-f0-9]{64}$/u.test(result) ? result : (0, internal_1.invalid)('sha256');
};
exports.requireAssessmentHash = requireAssessmentHash;
const scopeType = (value) => (0, internal_1.choice)(value, ['subscription', 'tenant', 'account']);
const scopes = (value) => (0, internal_1.unique)((0, internal_1.list)(value, 3).map(scopeType));
const identifiers = (value) => (0, internal_1.unique)((0, internal_1.list)(value).map(value => (0, internal_1.identifier)(value)));
const scope = (value) => {
    const row = (0, internal_1.shape)(value, ['providerName', 'scopeType', 'scopeId']);
    const providerName = (0, internal_1.choice)(row.providerName, ['azure', 'aws']);
    const kind = scopeType(row.scopeType);
    const scopeId = (0, internal_1.identifier)(row.scopeId);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(scopeId) || scopeId.includes('..'))
        return (0, internal_1.invalid)('scopeId');
    if ((providerName === 'azure' && kind === 'account') || (providerName === 'aws' && kind !== 'account'))
        return (0, internal_1.invalid)('provider scope');
    return { providerName, scopeType: kind, scopeId };
};
const pageReference = (value) => {
    const row = (0, internal_1.shape)(value, ['sha256', 'count', 'decodedBytes']);
    const count = (0, internal_1.number)(row.count, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageItems);
    const bytes = (0, internal_1.number)(row.decodedBytes, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes);
    if (!count || !bytes)
        return (0, internal_1.invalid)('empty page reference');
    return { sha256: (0, exports.requireAssessmentHash)(row.sha256), count, decodedBytes: bytes };
};
const findingCounts = (value) => {
    const row = (0, internal_1.shape)(value, ['PASS', 'FAIL', 'MANUAL']);
    return { PASS: (0, internal_1.number)(row.PASS), FAIL: (0, internal_1.number)(row.FAIL), MANUAL: (0, internal_1.number)(row.MANUAL) };
};
const controlStatuses = ['failed', 'passed', 'partial', 'manual', 'not-applicable', 'not-assessed'];
const controlCounts = (value) => {
    const row = (0, internal_1.shape)(value, controlStatuses);
    return {
        failed: (0, internal_1.number)(row.failed),
        passed: (0, internal_1.number)(row.passed),
        partial: (0, internal_1.number)(row.partial),
        manual: (0, internal_1.number)(row.manual),
        'not-applicable': (0, internal_1.number)(row['not-applicable']),
        'not-assessed': (0, internal_1.number)(row['not-assessed']),
    };
};
const coverage = (value) => (0, internal_1.choice)(value, ['complete', 'partial', 'blocked', 'unassessed']);
const reference = (value) => {
    const row = (0, internal_1.shape)(value, ['sourceVersion', 'bundleSha256', 'frameworkId', 'catalogueSha256', 'catalogueContentSha256']);
    return {
        sourceVersion: (0, exports.requireSourceVersion)(row.sourceVersion),
        bundleSha256: (0, exports.requireAssessmentHash)(row.bundleSha256),
        frameworkId: (0, exports.requireFrameworkId)(row.frameworkId),
        catalogueSha256: (0, exports.requireAssessmentHash)(row.catalogueSha256),
        catalogueContentSha256: (0, exports.requireAssessmentHash)(row.catalogueContentSha256),
    };
};
const source = (value) => {
    const row = (0, internal_1.shape)(value, ['name', 'version', 'requestId', 'eventId', 'requestedAt', 'assessedAt']);
    const result = {
        name: (0, internal_1.choice)(row.name, ['prowler']),
        version: (0, exports.requireSourceVersion)(row.version),
        requestId: (0, internal_1.identifier)(row.requestId),
        eventId: (0, internal_1.identifier)(row.eventId),
        requestedAt: (0, internal_1.timestamp)(row.requestedAt),
        assessedAt: (0, internal_1.timestamp)(row.assessedAt),
    };
    if (!(0, internal_1.requestChronologyValid)(result.assessedAt, result.requestedAt))
        return (0, internal_1.invalid)('assessment chronology');
    return result;
};
const finding = (value) => {
    const row = (0, internal_1.shape)(value, ['id', 'checkId', 'resourceId', 'status', 'collectionStatus', 'severity', 'message', 'controlIds', 'resourceMatch'], ['resource']);
    const result = {
        id: (0, internal_1.identifier)(row.id),
        checkId: (0, internal_1.identifier)(row.checkId),
        resourceId: (0, internal_1.identifier)(row.resourceId, 4096),
        status: (0, internal_1.choice)(row.status, ['PASS', 'FAIL', 'MANUAL']),
        collectionStatus: (0, internal_1.choice)(row.collectionStatus, ['verified', 'unverified']),
        severity: (0, internal_1.choice)(row.severity, ['critical', 'high', 'medium', 'low', 'informational', 'unknown']),
        message: (0, internal_1.text)(row.message),
        controlIds: identifiers(row.controlIds),
        resourceMatch: (0, internal_1.choice)(row.resourceMatch, ['matched', 'unmatched', 'subscription-scope', 'ancestor-scope', 'directory', 'inventory-unavailable']),
    };
    if (row.resource !== undefined) {
        const resource = (0, internal_1.shape)(row.resource, [], ['name', 'type', 'resourceGroup']);
        result.resource = {};
        for (const key of ['name', 'type', 'resourceGroup'])
            if (resource[key] !== undefined)
                result.resource[key] = (0, internal_1.text)(resource[key], 4096, false);
    }
    return result;
};
const control = (value) => {
    const row = (0, internal_1.shape)(value, ['controlId', 'status', 'confidence', 'reason', 'requiredScopes', 'statusCounts', 'checkCounts']);
    const checks = (0, internal_1.shape)(row.checkCounts, ['evaluated', 'blocked', 'manual', 'notApplicable', 'notAssessed']);
    const result = {
        controlId: (0, internal_1.identifier)(row.controlId),
        status: (0, internal_1.choice)(row.status, controlStatuses),
        confidence: (0, internal_1.choice)(row.confidence, ['verified', 'unverified']),
        reason: (0, internal_1.identifier)(row.reason, 1024),
        requiredScopes: scopes(row.requiredScopes),
        statusCounts: findingCounts(row.statusCounts),
        checkCounts: {
            evaluated: (0, internal_1.number)(checks.evaluated),
            blocked: (0, internal_1.number)(checks.blocked),
            manual: (0, internal_1.number)(checks.manual),
            notApplicable: (0, internal_1.number)(checks.notApplicable),
            notAssessed: (0, internal_1.number)(checks.notAssessed),
        },
    };
    if (result.status === 'passed' &&
        (result.confidence !== 'verified' ||
            result.statusCounts.FAIL ||
            result.statusCounts.MANUAL ||
            result.checkCounts.blocked ||
            result.checkCounts.manual ||
            result.checkCounts.notAssessed ||
            !result.checkCounts.evaluated))
        return (0, internal_1.invalid)('passed control coverage');
    if (result.status === 'failed' && !result.statusCounts.FAIL)
        return (0, internal_1.invalid)('failed control evidence');
    return result;
};
const catalogue = (value) => {
    const catalogueShape = internal_1.shape;
    const schemaVersion = 2;
    let genericNodes = 0;
    // One budget covers generic attributes and metadata across every control.
    const genericJson = (value, depth = 0) => {
        if (++genericNodes > 100000 || depth > 8)
            return (0, internal_1.invalid)('catalogue generic JSON budget');
        if (Array.isArray(value))
            value.forEach(child => genericJson(child, depth + 1));
        else if (value !== null && typeof value === 'object')
            Object.values(value).forEach(child => genericJson(child, depth + 1));
        return value;
    };
    const row = catalogueShape(value, [
        'schemaVersion',
        'sourceVersion',
        'frameworkId',
        'name',
        'version',
        'description',
        'catalogueSha256',
        'attribution',
        'controls',
        'checks',
        'unavailableCheckIds',
    ]);
    if (row.schemaVersion !== schemaVersion)
        return (0, internal_1.invalid)('schemaVersion');
    const attribution = catalogueShape(row.attribution, ['project', 'url']);
    const controls = (0, internal_1.list)(row.controls).map(value => {
        const item = catalogueShape(value, ['controlId', 'title', 'description', 'checkIds', 'attributes', 'metadata']);
        const metadata = (0, internal_1.record)(item.metadata, 'metadata');
        if (['Id', 'Name', 'Description', 'Checks', 'Attributes'].some(key => Object.prototype.hasOwnProperty.call(metadata, key)))
            return (0, internal_1.invalid)('metadata identity');
        return {
            controlId: (0, internal_1.identifier)(item.controlId),
            title: (0, internal_1.text)(item.title),
            description: (0, internal_1.text)(item.description),
            checkIds: identifiers(item.checkIds),
            attributes: genericJson((0, internal_1.list)(item.attributes, 1000)),
            metadata: genericJson(metadata),
        };
    });
    const checks = (0, internal_1.list)(row.checks).map(value => {
        const item = catalogueShape(value, [
            'checkId',
            'title',
            'description',
            'risk',
            'severity',
            'service',
            'resourceType',
            'categories',
            'references',
            'scopeTypes',
            'remediation',
        ]);
        const remediation = catalogueShape(item.remediation, ['recommendation', 'code']);
        const recommendation = catalogueShape(remediation.recommendation, ['text', 'url']);
        const code = catalogueShape(remediation.code, ['cli', 'nativeIaC', 'other', 'terraform']);
        return {
            checkId: (0, internal_1.identifier)(item.checkId),
            title: (0, internal_1.text)(item.title),
            description: (0, internal_1.text)(item.description),
            risk: (0, internal_1.text)(item.risk),
            severity: (0, internal_1.identifier)(item.severity),
            service: (0, internal_1.text)(item.service),
            resourceType: (0, internal_1.text)(item.resourceType),
            categories: (0, internal_1.unique)((0, internal_1.list)(item.categories, 1000).map(value => (0, internal_1.identifier)(value))),
            references: (0, internal_1.unique)((0, internal_1.list)(item.references, 1000).map(value => (0, internal_1.httpUrl)(value))),
            scopeTypes: scopes(item.scopeTypes),
            remediation: {
                recommendation: { text: (0, internal_1.text)(recommendation.text), url: (0, internal_1.httpUrl)(recommendation.url, true) },
                code: { cli: (0, internal_1.text)(code.cli), nativeIaC: (0, internal_1.text)(code.nativeIaC), other: (0, internal_1.text)(code.other), terraform: (0, internal_1.text)(code.terraform) },
            },
        };
    });
    (0, internal_1.unique)(controls.map(item => item.controlId));
    (0, internal_1.unique)(checks.map(item => item.checkId));
    const unavailableCheckIds = identifiers(row.unavailableCheckIds);
    const known = new Set(checks.map(item => item.checkId));
    const unavailable = new Set(unavailableCheckIds);
    const mapped = new Set(controls.flatMap(item => item.checkIds));
    if ([...mapped].some(id => !known.has(id) && !unavailable.has(id)) ||
        [...known].some(id => !mapped.has(id) || unavailable.has(id)) ||
        unavailableCheckIds.some(id => !mapped.has(id)))
        return (0, internal_1.invalid)('catalogue check references');
    return {
        schemaVersion,
        sourceVersion: (0, exports.requireSourceVersion)(row.sourceVersion),
        frameworkId: (0, exports.requireFrameworkId)(row.frameworkId),
        name: (0, internal_1.text)(row.name, 512, false),
        version: (0, internal_1.text)(row.version, 256),
        description: (0, internal_1.text)(row.description),
        catalogueSha256: (0, exports.requireAssessmentHash)(row.catalogueSha256),
        attribution: { project: (0, internal_1.choice)(attribution.project, ['Prowler']), url: (0, internal_1.httpUrl)(attribution.url) },
        controls,
        checks,
        unavailableCheckIds,
    };
};
const indexEntry = (value) => {
    const row = (0, internal_1.shape)(value, ['frameworkId', 'aliases', 'name', 'version', 'description', 'catalogueSha256', 'scopeTypes', 'catalogueContentSha256']);
    const result = {
        frameworkId: (0, exports.requireFrameworkId)(row.frameworkId),
        aliases: (0, internal_1.unique)((0, internal_1.list)(row.aliases, 1000).map(exports.requireFrameworkId)),
        name: (0, internal_1.text)(row.name, 512, false),
        version: (0, internal_1.text)(row.version, 256),
        description: (0, internal_1.text)(row.description),
        catalogueSha256: (0, exports.requireAssessmentHash)(row.catalogueSha256),
        scopeTypes: scopes(row.scopeTypes),
    };
    return { ...result, catalogueContentSha256: (0, exports.requireAssessmentHash)(row.catalogueContentSha256) };
};
const indexNames = (entries) => {
    (0, internal_1.unique)(entries.flatMap(entry => [entry.frameworkId, ...entry.aliases]));
};
const parseAssessmentNativeScope = (value) => scope((0, internal_1.input)(value));
exports.parseAssessmentNativeScope = parseAssessmentNativeScope;
const parseAssessmentPageReference = (value) => pageReference((0, internal_1.input)(value));
exports.parseAssessmentPageReference = parseAssessmentPageReference;
const parseFrameworkCatalogueReference = (value) => reference((0, internal_1.input)(value));
exports.parseFrameworkCatalogueReference = parseFrameworkCatalogueReference;
const parseFrameworkAssessmentSource = (value) => source((0, internal_1.input)(value));
exports.parseFrameworkAssessmentSource = parseFrameworkAssessmentSource;
const parseFrameworkFinding = (value) => finding((0, internal_1.input)(value));
exports.parseFrameworkFinding = parseFrameworkFinding;
const parseFrameworkControlAssessment = (value) => control((0, internal_1.input)(value));
exports.parseFrameworkControlAssessment = parseFrameworkControlAssessment;
const parseFrameworkFindingStatusCounts = (value) => findingCounts((0, internal_1.input)(value));
exports.parseFrameworkFindingStatusCounts = parseFrameworkFindingStatusCounts;
const parseFrameworkCatalogueDocument = (value) => catalogue((0, internal_1.input)(value));
exports.parseFrameworkCatalogueDocument = parseFrameworkCatalogueDocument;
const parseFrameworkCatalogueIndexDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'providerName', 'sourceVersion', 'bundleSha256', 'frameworks']);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const frameworks = (0, internal_1.list)(row.frameworks, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.frameworks).map(value => indexEntry(value));
    indexNames(frameworks);
    const providerName = (0, internal_1.choice)(row.providerName, ['azure', 'aws']);
    if (frameworks.some(entry => entry.scopeTypes.some(kind => (providerName === 'azure' ? kind === 'account' : kind !== 'account'))))
        return (0, internal_1.invalid)('catalogue provider scopes');
    return {
        schemaVersion: 2,
        providerName,
        sourceVersion: (0, exports.requireSourceVersion)(row.sourceVersion),
        bundleSha256: (0, exports.requireAssessmentHash)(row.bundleSha256),
        frameworks,
    };
};
exports.parseFrameworkCatalogueIndexDocument = parseFrameworkCatalogueIndexDocument;
const parseFrameworkAssessmentDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), [
        'schemaVersion',
        'generationSha256',
        'scope',
        'frameworkId',
        'frameworkName',
        'frameworkVersion',
        'catalogue',
        'source',
        'coverage',
        'summary',
        'access',
        'controls',
        'findingPages',
    ]);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const summary = (0, internal_1.shape)(row.summary, ['findingCount', 'statusCounts']);
    const result = {
        schemaVersion: 2,
        generationSha256: (0, exports.requireAssessmentHash)(row.generationSha256),
        scope: scope(row.scope),
        frameworkId: (0, exports.requireFrameworkId)(row.frameworkId),
        frameworkName: (0, internal_1.text)(row.frameworkName, 512, false),
        frameworkVersion: (0, internal_1.text)(row.frameworkVersion, 256),
        catalogue: reference(row.catalogue),
        source: source(row.source),
        coverage: coverage(row.coverage),
        summary: { findingCount: (0, internal_1.number)(summary.findingCount), statusCounts: findingCounts(summary.statusCounts) },
        access: (0, accessValidation_1.parseAssessmentAccess)(row.access),
        controls: (0, internal_1.list)(row.controls).map(control),
        findingPages: (0, internal_1.list)(row.findingPages, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pages).map(pageReference),
    };
    (0, internal_1.unique)(result.controls.map(item => item.controlId));
    (0, internal_1.unique)(result.findingPages.map(item => item.sha256));
    if (result.access.provider !== result.scope.providerName ||
        result.access.scopeType !== result.scope.scopeType ||
        (0, accessValidation_1.assessmentAccessScopeId)(result.access) !== result.scope.scopeId ||
        result.access.observedAt !== result.source.assessedAt ||
        result.frameworkId !== result.catalogue.frameworkId ||
        result.source.version !== result.catalogue.sourceVersion ||
        Object.values(result.summary.statusCounts).reduce((sum, count) => sum + count, 0) !== result.summary.findingCount ||
        result.findingPages.reduce((sum, page) => sum + page.count, 0) !== result.summary.findingCount)
        return (0, internal_1.invalid)('assessment binding/counts');
    return result;
};
exports.parseFrameworkAssessmentDocument = parseFrameworkAssessmentDocument;
const parseFrameworkAssessmentSummaryDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'scope', 'sourceVersion', 'generationSha256', 'frameworks']);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const sourceVersion = (0, exports.requireSourceVersion)(row.sourceVersion);
    const frameworks = (0, internal_1.list)(row.frameworks, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.frameworks).map(value => {
        const item = (0, internal_1.shape)(value, [
            'frameworkId',
            'frameworkName',
            'frameworkVersion',
            'catalogue',
            'source',
            'coverage',
            'findingCount',
            'controlStatusCounts',
            'statusCounts',
            'access',
        ]);
        const result = {
            frameworkId: (0, exports.requireFrameworkId)(item.frameworkId),
            frameworkName: (0, internal_1.text)(item.frameworkName, 512, false),
            frameworkVersion: (0, internal_1.text)(item.frameworkVersion, 256),
            catalogue: reference(item.catalogue),
            source: source(item.source),
            coverage: coverage(item.coverage),
            findingCount: (0, internal_1.number)(item.findingCount),
            controlStatusCounts: controlCounts(item.controlStatusCounts),
            statusCounts: findingCounts(item.statusCounts),
            access: (0, accessValidation_1.parseAssessmentAccessSummary)(item.access),
        };
        if (Object.values(result.statusCounts).reduce((sum, count) => sum + count, 0) !== result.findingCount ||
            result.frameworkId !== result.catalogue.frameworkId ||
            result.catalogue.sourceVersion !== sourceVersion ||
            result.source.version !== sourceVersion)
            return (0, internal_1.invalid)('summary binding');
        return result;
    });
    (0, internal_1.unique)(frameworks.map(item => item.frameworkId));
    return { schemaVersion: 2, scope: scope(row.scope), sourceVersion, generationSha256: (0, exports.requireAssessmentHash)(row.generationSha256), frameworks };
};
exports.parseFrameworkAssessmentSummaryDocument = parseFrameworkAssessmentSummaryDocument;
const parseFrameworkFindingPageDocument = (value) => {
    const row = (0, internal_1.shape)((0, internal_1.input)(value), ['schemaVersion', 'items']);
    if (row.schemaVersion !== 2)
        return (0, internal_1.invalid)('schemaVersion');
    const result = { schemaVersion: 2, items: (0, internal_1.list)(row.items, contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageItems).map(finding) };
    (0, internal_1.unique)(result.items.map(item => item.id));
    if ((0, internal_1.decodedBytes)(result) > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes)
        return (0, internal_1.invalid)('page size');
    return result;
};
exports.parseFrameworkFindingPageDocument = parseFrameworkFindingPageDocument;
//# sourceMappingURL=validation.js.map