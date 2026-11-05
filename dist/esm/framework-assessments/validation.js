import { FRAMEWORK_ASSESSMENT_LIMITS as limits } from './contracts.js';
import { assessmentAccessScopeId, parseAssessmentAccess, parseAssessmentAccessSummary } from './accessValidation.js';
import { choice, decodedBytes, httpUrl, identifier, input, invalid, list, number, record, requestChronologyValid, shape, text, timestamp, unique, } from './internal.js';
export const requireFrameworkId = (value) => {
    const result = identifier(value, 64);
    return /^[a-z0-9][a-z0-9_-]{0,63}$/u.test(result) ? result : invalid('frameworkId');
};
export const requireSourceVersion = (value) => {
    const result = identifier(value, 32);
    return /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/u.test(result) ? result : invalid('sourceVersion');
};
export const requireAssessmentHash = (value) => {
    const result = text(value, 64, false);
    return /^[a-f0-9]{64}$/u.test(result) ? result : invalid('sha256');
};
const scopeType = (value) => choice(value, ['subscription', 'tenant', 'account']);
const scopes = (value) => unique(list(value, 3).map(scopeType));
const identifiers = (value) => unique(list(value).map(value => identifier(value)));
const scope = (value) => {
    const row = shape(value, ['providerName', 'scopeType', 'scopeId']);
    const providerName = choice(row.providerName, ['azure', 'aws']);
    const kind = scopeType(row.scopeType);
    const scopeId = identifier(row.scopeId);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(scopeId) || scopeId.includes('..'))
        return invalid('scopeId');
    if ((providerName === 'azure' && kind === 'account') || (providerName === 'aws' && kind !== 'account'))
        return invalid('provider scope');
    return { providerName, scopeType: kind, scopeId };
};
const pageReference = (value) => {
    const row = shape(value, ['sha256', 'count', 'decodedBytes']);
    const count = number(row.count, limits.pageItems);
    const bytes = number(row.decodedBytes, limits.pageDecodedBytes);
    if (!count || !bytes)
        return invalid('empty page reference');
    return { sha256: requireAssessmentHash(row.sha256), count, decodedBytes: bytes };
};
const findingCounts = (value) => {
    const row = shape(value, ['PASS', 'FAIL', 'MANUAL']);
    return { PASS: number(row.PASS), FAIL: number(row.FAIL), MANUAL: number(row.MANUAL) };
};
const controlStatuses = ['failed', 'passed', 'partial', 'manual', 'not-applicable', 'not-assessed'];
const controlCounts = (value) => {
    const row = shape(value, controlStatuses);
    return {
        failed: number(row.failed),
        passed: number(row.passed),
        partial: number(row.partial),
        manual: number(row.manual),
        'not-applicable': number(row['not-applicable']),
        'not-assessed': number(row['not-assessed']),
    };
};
const coverage = (value) => choice(value, ['complete', 'partial', 'blocked', 'unassessed']);
const reference = (value) => {
    const row = shape(value, ['sourceVersion', 'bundleSha256', 'frameworkId', 'catalogueSha256', 'catalogueContentSha256']);
    return {
        sourceVersion: requireSourceVersion(row.sourceVersion),
        bundleSha256: requireAssessmentHash(row.bundleSha256),
        frameworkId: requireFrameworkId(row.frameworkId),
        catalogueSha256: requireAssessmentHash(row.catalogueSha256),
        catalogueContentSha256: requireAssessmentHash(row.catalogueContentSha256),
    };
};
const source = (value) => {
    const row = shape(value, ['name', 'version', 'requestId', 'eventId', 'requestedAt', 'assessedAt']);
    const result = {
        name: choice(row.name, ['prowler']),
        version: requireSourceVersion(row.version),
        requestId: identifier(row.requestId),
        eventId: identifier(row.eventId),
        requestedAt: timestamp(row.requestedAt),
        assessedAt: timestamp(row.assessedAt),
    };
    if (!requestChronologyValid(result.assessedAt, result.requestedAt))
        return invalid('assessment chronology');
    return result;
};
const finding = (value) => {
    const row = shape(value, ['id', 'checkId', 'resourceId', 'status', 'collectionStatus', 'severity', 'message', 'controlIds', 'resourceMatch'], ['resource']);
    const result = {
        id: identifier(row.id),
        checkId: identifier(row.checkId),
        resourceId: identifier(row.resourceId, 4096),
        status: choice(row.status, ['PASS', 'FAIL', 'MANUAL']),
        collectionStatus: choice(row.collectionStatus, ['verified', 'unverified']),
        severity: choice(row.severity, ['critical', 'high', 'medium', 'low', 'informational', 'unknown']),
        message: text(row.message),
        controlIds: identifiers(row.controlIds),
        resourceMatch: choice(row.resourceMatch, ['matched', 'unmatched', 'subscription-scope', 'ancestor-scope', 'directory', 'inventory-unavailable']),
    };
    if (row.resource !== undefined) {
        const resource = shape(row.resource, [], ['name', 'type', 'resourceGroup']);
        result.resource = {};
        for (const key of ['name', 'type', 'resourceGroup'])
            if (resource[key] !== undefined)
                result.resource[key] = text(resource[key], 4096, false);
    }
    return result;
};
const control = (value) => {
    const row = shape(value, ['controlId', 'status', 'confidence', 'reason', 'requiredScopes', 'statusCounts', 'checkCounts']);
    const checks = shape(row.checkCounts, ['evaluated', 'blocked', 'manual', 'notApplicable', 'notAssessed']);
    const result = {
        controlId: identifier(row.controlId),
        status: choice(row.status, controlStatuses),
        confidence: choice(row.confidence, ['verified', 'unverified']),
        reason: identifier(row.reason, 1024),
        requiredScopes: scopes(row.requiredScopes),
        statusCounts: findingCounts(row.statusCounts),
        checkCounts: {
            evaluated: number(checks.evaluated),
            blocked: number(checks.blocked),
            manual: number(checks.manual),
            notApplicable: number(checks.notApplicable),
            notAssessed: number(checks.notAssessed),
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
        return invalid('passed control coverage');
    if (result.status === 'failed' && !result.statusCounts.FAIL)
        return invalid('failed control evidence');
    return result;
};
const catalogue = (value) => {
    const catalogueShape = shape;
    const schemaVersion = 2;
    let genericNodes = 0;
    // One budget covers generic attributes and metadata across every control.
    const genericJson = (value, depth = 0) => {
        if (++genericNodes > 100000 || depth > 8)
            return invalid('catalogue generic JSON budget');
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
        return invalid('schemaVersion');
    const attribution = catalogueShape(row.attribution, ['project', 'url']);
    const controls = list(row.controls).map(value => {
        const item = catalogueShape(value, ['controlId', 'title', 'description', 'checkIds', 'attributes', 'metadata']);
        const metadata = record(item.metadata, 'metadata');
        if (['Id', 'Name', 'Description', 'Checks', 'Attributes'].some(key => Object.prototype.hasOwnProperty.call(metadata, key)))
            return invalid('metadata identity');
        return {
            controlId: identifier(item.controlId),
            title: text(item.title),
            description: text(item.description),
            checkIds: identifiers(item.checkIds),
            attributes: genericJson(list(item.attributes, 1000)),
            metadata: genericJson(metadata),
        };
    });
    const checks = list(row.checks).map(value => {
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
            checkId: identifier(item.checkId),
            title: text(item.title),
            description: text(item.description),
            risk: text(item.risk),
            severity: identifier(item.severity),
            service: text(item.service),
            resourceType: text(item.resourceType),
            categories: unique(list(item.categories, 1000).map(value => identifier(value))),
            references: unique(list(item.references, 1000).map(value => httpUrl(value))),
            scopeTypes: scopes(item.scopeTypes),
            remediation: {
                recommendation: { text: text(recommendation.text), url: httpUrl(recommendation.url, true) },
                code: { cli: text(code.cli), nativeIaC: text(code.nativeIaC), other: text(code.other), terraform: text(code.terraform) },
            },
        };
    });
    unique(controls.map(item => item.controlId));
    unique(checks.map(item => item.checkId));
    const unavailableCheckIds = identifiers(row.unavailableCheckIds);
    const known = new Set(checks.map(item => item.checkId));
    const unavailable = new Set(unavailableCheckIds);
    const mapped = new Set(controls.flatMap(item => item.checkIds));
    if ([...mapped].some(id => !known.has(id) && !unavailable.has(id)) ||
        [...known].some(id => !mapped.has(id) || unavailable.has(id)) ||
        unavailableCheckIds.some(id => !mapped.has(id)))
        return invalid('catalogue check references');
    return {
        schemaVersion,
        sourceVersion: requireSourceVersion(row.sourceVersion),
        frameworkId: requireFrameworkId(row.frameworkId),
        name: text(row.name, 512, false),
        version: text(row.version, 256),
        description: text(row.description),
        catalogueSha256: requireAssessmentHash(row.catalogueSha256),
        attribution: { project: choice(attribution.project, ['Prowler']), url: httpUrl(attribution.url) },
        controls,
        checks,
        unavailableCheckIds,
    };
};
const indexEntry = (value) => {
    const row = shape(value, ['frameworkId', 'aliases', 'name', 'version', 'description', 'catalogueSha256', 'scopeTypes', 'catalogueContentSha256']);
    const result = {
        frameworkId: requireFrameworkId(row.frameworkId),
        aliases: unique(list(row.aliases, 1000).map(requireFrameworkId)),
        name: text(row.name, 512, false),
        version: text(row.version, 256),
        description: text(row.description),
        catalogueSha256: requireAssessmentHash(row.catalogueSha256),
        scopeTypes: scopes(row.scopeTypes),
    };
    return { ...result, catalogueContentSha256: requireAssessmentHash(row.catalogueContentSha256) };
};
const indexNames = (entries) => {
    unique(entries.flatMap(entry => [entry.frameworkId, ...entry.aliases]));
};
export const parseAssessmentNativeScope = (value) => scope(input(value));
export const parseAssessmentPageReference = (value) => pageReference(input(value));
export const parseFrameworkCatalogueReference = (value) => reference(input(value));
export const parseFrameworkAssessmentSource = (value) => source(input(value));
export const parseFrameworkFinding = (value) => finding(input(value));
export const parseFrameworkControlAssessment = (value) => control(input(value));
export const parseFrameworkFindingStatusCounts = (value) => findingCounts(input(value));
export const parseFrameworkCatalogueDocument = (value) => catalogue(input(value));
export const parseFrameworkCatalogueIndexDocument = (value) => {
    const row = shape(input(value), ['schemaVersion', 'providerName', 'sourceVersion', 'bundleSha256', 'frameworks']);
    if (row.schemaVersion !== 2)
        return invalid('schemaVersion');
    const frameworks = list(row.frameworks, limits.frameworks).map(value => indexEntry(value));
    indexNames(frameworks);
    const providerName = choice(row.providerName, ['azure', 'aws']);
    if (frameworks.some(entry => entry.scopeTypes.some(kind => (providerName === 'azure' ? kind === 'account' : kind !== 'account'))))
        return invalid('catalogue provider scopes');
    return {
        schemaVersion: 2,
        providerName,
        sourceVersion: requireSourceVersion(row.sourceVersion),
        bundleSha256: requireAssessmentHash(row.bundleSha256),
        frameworks,
    };
};
export const parseFrameworkAssessmentDocument = (value) => {
    const row = shape(input(value), [
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
        return invalid('schemaVersion');
    const summary = shape(row.summary, ['findingCount', 'statusCounts']);
    const result = {
        schemaVersion: 2,
        generationSha256: requireAssessmentHash(row.generationSha256),
        scope: scope(row.scope),
        frameworkId: requireFrameworkId(row.frameworkId),
        frameworkName: text(row.frameworkName, 512, false),
        frameworkVersion: text(row.frameworkVersion, 256),
        catalogue: reference(row.catalogue),
        source: source(row.source),
        coverage: coverage(row.coverage),
        summary: { findingCount: number(summary.findingCount), statusCounts: findingCounts(summary.statusCounts) },
        access: parseAssessmentAccess(row.access),
        controls: list(row.controls).map(control),
        findingPages: list(row.findingPages, limits.pages).map(pageReference),
    };
    unique(result.controls.map(item => item.controlId));
    unique(result.findingPages.map(item => item.sha256));
    if (result.access.provider !== result.scope.providerName ||
        result.access.scopeType !== result.scope.scopeType ||
        assessmentAccessScopeId(result.access) !== result.scope.scopeId ||
        result.access.observedAt !== result.source.assessedAt ||
        result.frameworkId !== result.catalogue.frameworkId ||
        result.source.version !== result.catalogue.sourceVersion ||
        Object.values(result.summary.statusCounts).reduce((sum, count) => sum + count, 0) !== result.summary.findingCount ||
        result.findingPages.reduce((sum, page) => sum + page.count, 0) !== result.summary.findingCount)
        return invalid('assessment binding/counts');
    return result;
};
export const parseFrameworkAssessmentSummaryDocument = (value) => {
    const row = shape(input(value), ['schemaVersion', 'scope', 'sourceVersion', 'generationSha256', 'frameworks']);
    if (row.schemaVersion !== 2)
        return invalid('schemaVersion');
    const sourceVersion = requireSourceVersion(row.sourceVersion);
    const frameworks = list(row.frameworks, limits.frameworks).map(value => {
        const item = shape(value, [
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
            frameworkId: requireFrameworkId(item.frameworkId),
            frameworkName: text(item.frameworkName, 512, false),
            frameworkVersion: text(item.frameworkVersion, 256),
            catalogue: reference(item.catalogue),
            source: source(item.source),
            coverage: coverage(item.coverage),
            findingCount: number(item.findingCount),
            controlStatusCounts: controlCounts(item.controlStatusCounts),
            statusCounts: findingCounts(item.statusCounts),
            access: parseAssessmentAccessSummary(item.access),
        };
        if (Object.values(result.statusCounts).reduce((sum, count) => sum + count, 0) !== result.findingCount ||
            result.frameworkId !== result.catalogue.frameworkId ||
            result.catalogue.sourceVersion !== sourceVersion ||
            result.source.version !== sourceVersion)
            return invalid('summary binding');
        return result;
    });
    unique(frameworks.map(item => item.frameworkId));
    return { schemaVersion: 2, scope: scope(row.scope), sourceVersion, generationSha256: requireAssessmentHash(row.generationSha256), frameworks };
};
export const parseFrameworkFindingPageDocument = (value) => {
    const row = shape(input(value), ['schemaVersion', 'items']);
    if (row.schemaVersion !== 2)
        return invalid('schemaVersion');
    const result = { schemaVersion: 2, items: list(row.items, limits.pageItems).map(finding) };
    unique(result.items.map(item => item.id));
    if (decodedBytes(result) > limits.pageDecodedBytes)
        return invalid('page size');
    return result;
};
