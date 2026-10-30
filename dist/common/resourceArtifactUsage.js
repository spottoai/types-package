"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceArtifactDetailPage = exports.isResourceArtifactUsageEvidence = exports.isResourceArtifactFinding = exports.isResourceArtifactSummary = exports.isResourceArtifactUsageIndex = exports.isResourceArtifactUsagePointer = exports.isResourceArtifactUsageManifest = exports.validateResourceArtifactDetailPage = exports.validateResourceArtifactUsageEvidence = exports.validateResourceArtifactFinding = exports.validateResourceArtifactSummary = exports.validateResourceArtifactUsageIndex = exports.validateResourceArtifactUsagePointer = exports.validateResourceArtifactUsageManifest = exports.isResourceArtifactId = exports.resourceArtifactUsageRunPrefix = exports.RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES = exports.RESOURCE_ARTIFACT_ID_PATTERN = exports.RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES = exports.RESOURCE_ARTIFACT_USAGE_MAX_ROWS = exports.RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION = void 0;
const resourceIdentity_js_1 = require("./resourceIdentity.js");
const artifactRunReference_js_1 = require("../azure/artifactRunReference.js");
const validationHelpers_js_1 = require("./validationHelpers.js");
exports.RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION = 1;
exports.RESOURCE_ARTIFACT_USAGE_MAX_ROWS = 200;
exports.RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES = 2097152;
exports.RESOURCE_ARTIFACT_ID_PATTERN = /^artifact:[a-f0-9]{64}$/;
exports.RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES = [
    'configured-tag-resolved',
    'configured-digest',
    'unresolved',
    'changed-during-collection',
    'unsupported',
    'unavailable',
];
/** Reuses the existing injective safe run encoder; producer owns the remainder. */
const resourceArtifactUsageRunPrefix = (runId) => `runs/${(0, artifactRunReference_js_1.encodeArtifactRunReferenceV1)(runId)}/artifact-usage`;
exports.resourceArtifactUsageRunPrefix = resourceArtifactUsageRunPrefix;
const isResourceArtifactId = (value) => typeof value === 'string' && exports.RESOURCE_ARTIFACT_ID_PATTERN.test(value);
exports.isResourceArtifactId = isResourceArtifactId;
const COMPLETENESS = ['complete', 'partial', 'unavailable', 'unsupported', 'stale'];
const SOURCE_STATUSES = ['available', 'partial', 'unavailable', 'unsupported', 'stale', 'restricted'];
const DETAIL_SECTIONS = ['summary', 'findings', 'usages'];
const BINDING_KEYS = ['schemaVersion', 'companyId', 'provider', 'accountId', 'artifactGeneration'];
const id = (value, field) => {
    const result = (0, validationHelpers_js_1.requiredString)(value, field);
    if (!(0, exports.isResourceArtifactId)(result))
        throw new Error(`${field} must be artifact: followed by 64 lowercase hexadecimal characters.`);
    return result;
};
const identifier = (value, field) => {
    const result = (0, validationHelpers_js_1.requiredString)(value, field);
    if (!(0, resourceIdentity_js_1.isKebabIdentifier)(result))
        throw new Error(`${field} must be an open kebab-case identifier.`);
    return result;
};
const strings = (value, field) => (0, validationHelpers_js_1.asArray)(value, field).map((item, index) => (0, validationHelpers_js_1.requiredString)(item, `${field}[${index}]`));
const optionalString = (record, key, field) => {
    if (record[key] !== undefined)
        (0, validationHelpers_js_1.requiredString)(record[key], `${field}.${key}`);
};
const optionalDate = (record, key, field) => {
    if (record[key] !== undefined)
        (0, validationHelpers_js_1.isoTimestamp)(record[key], `${field}.${key}`);
};
const optionalCount = (record, key, field) => {
    if (record[key] !== undefined)
        (0, validationHelpers_js_1.nonNegativeInteger)(record[key], `${field}.${key}`);
};
const digest = (value, field) => {
    if (typeof value !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(value))
        throw new Error(`${field} must be a lowercase SHA-256 manifest digest.`);
};
const checkBinding = (record, expected) => {
    (0, validationHelpers_js_1.assertValue)(record.schemaVersion, exports.RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION, 'schemaVersion');
    (0, validationHelpers_js_1.requiredString)(record.companyId, 'companyId');
    (0, validationHelpers_js_1.requiredEnum)(record.provider, ['azure', 'aws'], 'provider');
    (0, validationHelpers_js_1.requiredString)(record.accountId, 'accountId');
    const generation = (0, validationHelpers_js_1.asRecord)(record.artifactGeneration, 'artifactGeneration');
    (0, validationHelpers_js_1.assertExactKeys)(generation, ['runId', 'generatedAt'], 'artifactGeneration');
    if (!(0, artifactRunReference_js_1.isRawArtifactRunIdV1)(generation.runId))
        throw new Error('artifactGeneration.runId must be a bounded valid raw run ID.');
    (0, validationHelpers_js_1.isoTimestamp)(generation.generatedAt, 'artifactGeneration.generatedAt');
    for (const key of ['schemaVersion', 'companyId', 'provider', 'accountId', 'baseRelationshipSnapshotId']) {
        if (expected?.[key] !== undefined)
            (0, validationHelpers_js_1.assertValue)(record[key], expected[key], key);
    }
    if (expected?.artifactGeneration) {
        (0, validationHelpers_js_1.assertValue)(generation.runId, expected.artifactGeneration.runId, 'artifactGeneration.runId');
        (0, validationHelpers_js_1.assertValue)(generation.generatedAt, expected.artifactGeneration.generatedAt, 'artifactGeneration.generatedAt');
    }
};
const checkCoverage = (value, field) => {
    const record = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(record, ['sourceId', 'scope', 'status', 'reason', 'observedAt', 'lastSuccessfulAt', 'supportedWorkloadClasses', 'collectedWorkloadClasses', 'limits'], field);
    identifier(record.sourceId, `${field}.sourceId`);
    const scope = (0, validationHelpers_js_1.asRecord)(record.scope, `${field}.scope`);
    (0, validationHelpers_js_1.assertExactKeys)(scope, ['resourceIds', 'workloadClasses'], `${field}.scope`);
    for (const key of ['resourceIds', 'workloadClasses'])
        if (scope[key] !== undefined)
            (0, validationHelpers_js_1.assertUnique)(strings(scope[key], `${field}.scope.${key}`), `${field}.scope.${key}`);
    const status = (0, validationHelpers_js_1.requiredEnum)(record.status, SOURCE_STATUSES, `${field}.status`);
    (0, validationHelpers_js_1.isoTimestamp)(record.observedAt, `${field}.observedAt`);
    optionalDate(record, 'lastSuccessfulAt', field);
    if (status === 'available') {
        (0, validationHelpers_js_1.isoTimestamp)(record.lastSuccessfulAt, `${field}.lastSuccessfulAt`);
        if (record.reason !== undefined)
            throw new Error(`${field}.reason is absent for an available source.`);
    }
    else
        (0, validationHelpers_js_1.requiredString)(record.reason, `${field}.reason`);
    const supported = strings(record.supportedWorkloadClasses, `${field}.supportedWorkloadClasses`);
    const collected = strings(record.collectedWorkloadClasses, `${field}.collectedWorkloadClasses`);
    (0, validationHelpers_js_1.assertUnique)(supported, `${field}.supportedWorkloadClasses`);
    (0, validationHelpers_js_1.assertUnique)(collected, `${field}.collectedWorkloadClasses`);
    if (collected.some(item => !supported.includes(item)))
        throw new Error(`${field}.collectedWorkloadClasses must be supported.`);
    if (record.limits !== undefined) {
        const limits = (0, validationHelpers_js_1.asRecord)(record.limits, `${field}.limits`);
        (0, validationHelpers_js_1.assertExactKeys)(limits, ['maxItems', 'maxRequests', 'maxBytes', 'truncated'], `${field}.limits`);
        for (const key of ['maxItems', 'maxRequests', 'maxBytes'])
            optionalCount(limits, key, `${field}.limits`);
        if (limits.truncated !== undefined && typeof limits.truncated !== 'boolean')
            throw new Error(`${field}.limits.truncated must be boolean.`);
        if (limits.truncated === true && status === 'available')
            throw new Error(`${field} cannot mark a truncated source available.`);
    }
};
const coverages = (value, field) => {
    const rows = (0, validationHelpers_js_1.asArray)(value, field);
    rows.forEach((row, index) => checkCoverage(row, `${field}[${index}]`));
    (0, validationHelpers_js_1.assertUnique)(rows.map(row => String((0, validationHelpers_js_1.asRecord)(row, field).sourceId)), `${field}.sourceIds`);
};
const checkSummary = (value, field) => {
    const record = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(record, [
        'id',
        'artifactKind',
        'name',
        'displayName',
        'ownerResourceId',
        'region',
        'attributes',
        'aliases',
        'childArtifactIds',
        'usageCount',
        'usageCompleteness',
        'sourceCoverage',
        'security',
    ], field);
    id(record.id, `${field}.id`);
    identifier(record.artifactKind, `${field}.artifactKind`);
    for (const key of ['name', 'ownerResourceId', 'region'])
        (0, validationHelpers_js_1.requiredString)(record[key], `${field}.${key}`);
    optionalString(record, 'displayName', field);
    if (!(0, resourceIdentity_js_1.isResourceAttributes)(record.attributes))
        throw new Error(`${field}.attributes must contain flat provider-neutral attributes.`);
    const attributes = (0, validationHelpers_js_1.asRecord)(record.attributes, `${field}.attributes`);
    for (const key of ['registryHost', 'repository'])
        optionalString(attributes, key, `${field}.attributes`);
    if (attributes.registryHost !== undefined && !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(String(attributes.registryHost)))
        throw new Error(`${field}.attributes.registryHost must be a host without credentials, scheme or path.`);
    if (attributes.digest !== undefined)
        digest(attributes.digest, `${field}.attributes.digest`);
    (0, validationHelpers_js_1.asArray)(record.aliases, `${field}.aliases`).forEach((alias, index) => {
        const item = (0, validationHelpers_js_1.asRecord)(alias, `${field}.aliases[${index}]`);
        (0, validationHelpers_js_1.assertExactKeys)(item, ['name', 'observedAt'], `${field}.aliases[${index}]`);
        (0, validationHelpers_js_1.requiredString)(item.name, `${field}.aliases[${index}].name`);
        (0, validationHelpers_js_1.isoTimestamp)(item.observedAt, `${field}.aliases[${index}].observedAt`);
    });
    if (record.childArtifactIds !== undefined) {
        const children = (0, validationHelpers_js_1.asArray)(record.childArtifactIds, `${field}.childArtifactIds`).map(child => id(child, `${field}.childArtifactIds`));
        (0, validationHelpers_js_1.assertUnique)(children, `${field}.childArtifactIds`);
        if (children.includes(String(record.id)))
            throw new Error(`${field} cannot be its own child artifact.`);
    }
    const completeness = (0, validationHelpers_js_1.requiredEnum)(record.usageCompleteness, COMPLETENESS, `${field}.usageCompleteness`);
    optionalCount(record, 'usageCount', field);
    if (['unavailable', 'unsupported'].includes(completeness) && record.usageCount !== undefined)
        throw new Error(`${field}.usageCount requires observed evidence.`);
    coverages(record.sourceCoverage, `${field}.sourceCoverage`);
    const security = (0, validationHelpers_js_1.asRecord)(record.security, `${field}.security`);
    const status = (0, validationHelpers_js_1.requiredEnum)(security.status, ['available', 'partial', 'unavailable', 'restricted', 'stale'], `${field}.security.status`);
    if (status === 'restricted' || status === 'unavailable') {
        (0, validationHelpers_js_1.assertExactKeys)(security, ['status'], `${field}.security`);
    }
    else {
        (0, validationHelpers_js_1.assertExactKeys)(security, ['status', 'packageFindingCount', 'cveCount', 'severityCounts', 'observedAt'], `${field}.security`);
        optionalCount(security, 'packageFindingCount', `${field}.security`);
        optionalCount(security, 'cveCount', `${field}.security`);
        optionalDate(security, 'observedAt', `${field}.security`);
        if (security.severityCounts !== undefined) {
            const counts = (0, validationHelpers_js_1.asRecord)(security.severityCounts, `${field}.security.severityCounts`);
            for (const [key, count] of Object.entries(counts)) {
                (0, validationHelpers_js_1.requiredString)(key, `${field}.security.severityCounts.key`);
                (0, validationHelpers_js_1.nonNegativeInteger)(count, `${field}.security.severityCounts.${key}`);
            }
        }
    }
};
const checkFinding = (value, field) => {
    const record = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(record, ['id', 'providerFindingId', 'sourceId', 'status', 'softwareName', 'detectedVersions', 'fixedVersion', 'cves', 'observedAt', 'evaluatedAt'], field);
    for (const key of ['id', 'providerFindingId', 'status', 'softwareName'])
        (0, validationHelpers_js_1.requiredString)(record[key], `${field}.${key}`);
    identifier(record.sourceId, `${field}.sourceId`);
    strings(record.detectedVersions, `${field}.detectedVersions`);
    optionalString(record, 'fixedVersion', field);
    (0, validationHelpers_js_1.isoTimestamp)(record.observedAt, `${field}.observedAt`);
    optionalDate(record, 'evaluatedAt', field);
    const cves = (0, validationHelpers_js_1.asArray)(record.cves, `${field}.cves`);
    cves.forEach((cve, index) => {
        const item = (0, validationHelpers_js_1.asRecord)(cve, `${field}.cves[${index}]`);
        (0, validationHelpers_js_1.assertExactKeys)(item, ['id', 'severity', 'fixStatus', 'fixedVersion'], `${field}.cves[${index}]`);
        (0, validationHelpers_js_1.requiredString)(item.id, `${field}.cves[${index}].id`);
        (0, validationHelpers_js_1.requiredString)(item.severity, `${field}.cves[${index}].severity`);
        optionalString(item, 'fixStatus', `${field}.cves[${index}]`);
        optionalString(item, 'fixedVersion', `${field}.cves[${index}]`);
    });
    (0, validationHelpers_js_1.assertUnique)(cves.map(cve => String((0, validationHelpers_js_1.asRecord)(cve, field).id)), `${field}.cves`);
};
const checkUsage = (value, field) => {
    const record = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(record, [
        'id',
        'sourceId',
        'resourceId',
        'resourceName',
        'parentResourceId',
        'reference',
        'tag',
        'digest',
        'observedAt',
        'resolvedAt',
        'resolutionState',
        'runtimeDigestObserved',
        'previousDigest',
        'currentDigest',
    ], field);
    for (const key of ['id', 'resourceId', 'resourceName', 'reference'])
        (0, validationHelpers_js_1.requiredString)(record[key], `${field}.${key}`);
    identifier(record.sourceId, `${field}.sourceId`);
    for (const key of ['parentResourceId', 'tag'])
        optionalString(record, key, field);
    for (const key of ['digest', 'previousDigest', 'currentDigest'])
        if (record[key] !== undefined)
            digest(record[key], `${field}.${key}`);
    (0, validationHelpers_js_1.isoTimestamp)(record.observedAt, `${field}.observedAt`);
    optionalDate(record, 'resolvedAt', field);
    (0, validationHelpers_js_1.assertValue)(record.runtimeDigestObserved, false, `${field}.runtimeDigestObserved`);
    const state = (0, validationHelpers_js_1.requiredEnum)(record.resolutionState, exports.RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES, `${field}.resolutionState`);
    if (state === 'configured-tag-resolved') {
        (0, validationHelpers_js_1.requiredString)(record.tag, `${field}.tag`);
        digest(record.digest, `${field}.digest`);
        (0, validationHelpers_js_1.isoTimestamp)(record.resolvedAt, `${field}.resolvedAt`);
    }
    else if (state === 'configured-digest') {
        digest(record.digest, `${field}.digest`);
        if (record.tag !== undefined)
            throw new Error(`${field}.tag is absent for configured-digest evidence.`);
    }
    else if (record.digest !== undefined || record.resolvedAt !== undefined)
        throw new Error(`${field} cannot attach an exact digest for ${state} evidence.`);
    if (state !== 'changed-during-collection' && (record.previousDigest !== undefined || record.currentDigest !== undefined))
        throw new Error(`${field} diagnostic digests require changed-during-collection.`);
    if (state === 'changed-during-collection' && record.previousDigest !== undefined && record.previousDigest === record.currentDigest)
        throw new Error(`${field} changed digests must differ.`);
};
const checkDescriptor = (value, field, runId, keys) => {
    const record = (0, validationHelpers_js_1.asRecord)(value, field);
    (0, validationHelpers_js_1.assertExactKeys)(record, keys, field);
    const path = (0, validationHelpers_js_1.requiredString)(record.path, `${field}.path`);
    const prefix = `${(0, exports.resourceArtifactUsageRunPrefix)(runId)}/`;
    if (!path.startsWith(prefix) ||
        /[\\%?#\s]/.test(path) ||
        Array.from(path).some(character => character.charCodeAt(0) < 32) ||
        path.split('/').some(segment => !segment || segment === '.' || segment === '..'))
        throw new Error(`${field}.path must remain in its exact immutable run namespace.`);
    const bytes = (0, validationHelpers_js_1.nonNegativeInteger)(record.byteLength, `${field}.byteLength`);
    if (bytes > exports.RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES)
        throw new Error(`${field}.byteLength exceeds the decoded budget.`);
    if (typeof record.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.sha256))
        throw new Error(`${field}.sha256 must be lowercase hexadecimal SHA-256.`);
    return record;
};
const checkManifest = (record, expected) => {
    (0, validationHelpers_js_1.assertExactKeys)(record, [...BINDING_KEYS, 'baseRelationshipSnapshotId', 'sourceCoverage', 'expiresAt', 'paging', 'files'], 'manifest');
    checkBinding(record, expected);
    (0, validationHelpers_js_1.requiredString)(record.baseRelationshipSnapshotId, 'baseRelationshipSnapshotId');
    coverages(record.sourceCoverage, 'sourceCoverage');
    (0, validationHelpers_js_1.isoTimestamp)(record.expiresAt, 'expiresAt');
    const generatedAt = String((0, validationHelpers_js_1.asRecord)(record.artifactGeneration, 'artifactGeneration').generatedAt);
    if (Date.parse(String(record.expiresAt)) <= Date.parse(generatedAt))
        throw new Error('expiresAt must follow generation time.');
    const paging = (0, validationHelpers_js_1.asRecord)(record.paging, 'paging');
    (0, validationHelpers_js_1.assertExactKeys)(paging, ['maxRows', 'maxDecodedBytes'], 'paging');
    (0, validationHelpers_js_1.assertValue)(paging.maxRows, exports.RESOURCE_ARTIFACT_USAGE_MAX_ROWS, 'paging.maxRows');
    (0, validationHelpers_js_1.assertValue)(paging.maxDecodedBytes, exports.RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES, 'paging.maxDecodedBytes');
    const runId = String((0, validationHelpers_js_1.asRecord)(record.artifactGeneration, 'artifactGeneration').runId);
    const files = (0, validationHelpers_js_1.asArray)(record.files, 'files', true).map((value, index) => {
        const field = `files[${index}]`;
        const file = checkDescriptor(value, field, runId, ['path', 'byteLength', 'sha256', 'role', 'artifactId', 'page']);
        const role = (0, validationHelpers_js_1.requiredEnum)(file.role, ['graph', 'index', ...DETAIL_SECTIONS], `${field}.role`);
        let suffix;
        if (role === 'graph' || role === 'index') {
            if (file.artifactId !== undefined || file.page !== undefined)
                throw new Error(`${field} graph/index files cannot select an artifact or page.`);
            suffix = `${role}.json.gz`;
        }
        else {
            const artifactId = id(file.artifactId, `${field}.artifactId`);
            if (role === 'summary') {
                if (file.page !== undefined)
                    throw new Error(`${field} summary is a single unnumbered file.`);
                suffix = `details/${artifactId}/summary.json.gz`;
            }
            else
                suffix = `details/${artifactId}/${role}/${(0, validationHelpers_js_1.nonNegativeInteger)(file.page, `${field}.page`)}.json.gz`;
        }
        (0, validationHelpers_js_1.assertValue)(file.path, `${(0, exports.resourceArtifactUsageRunPrefix)(runId)}/${suffix}`, `${field}.path`);
        return file;
    });
    (0, validationHelpers_js_1.assertUnique)(files.map(file => String(file.path)), 'files.paths');
    for (const role of ['graph', 'index'])
        if (files.filter(file => file.role === role).length !== 1)
            throw new Error(`files must declare exactly one ${role}.`);
    const artifactIds = new Set(files.filter(file => file.artifactId !== undefined).map(file => String(file.artifactId)));
    for (const artifactId of artifactIds) {
        if (files.filter(file => file.artifactId === artifactId && file.role === 'summary').length !== 1)
            throw new Error(`files must declare a summary for ${artifactId}.`);
        for (const role of ['findings', 'usages']) {
            const pages = files
                .filter(file => file.artifactId === artifactId && file.role === role)
                .map(file => Number(file.page))
                .sort((a, b) => a - b);
            if (pages.some((page, index) => page !== index))
                throw new Error(`files.${artifactId}.${role} pages must be contiguous from zero.`);
        }
    }
};
const checkPointer = (record, expected) => {
    (0, validationHelpers_js_1.assertExactKeys)(record, [...BINDING_KEYS, 'manifest', 'completedAt'], 'pointer');
    checkBinding(record, expected);
    (0, validationHelpers_js_1.isoTimestamp)(record.completedAt, 'completedAt');
    const generation = (0, validationHelpers_js_1.asRecord)(record.artifactGeneration, 'artifactGeneration');
    if (Date.parse(String(record.completedAt)) < Date.parse(String(generation.generatedAt)))
        throw new Error('completedAt cannot precede generation time.');
    const descriptor = checkDescriptor(record.manifest, 'manifest', String(generation.runId), ['path', 'byteLength', 'sha256']);
    (0, validationHelpers_js_1.assertValue)(descriptor.path, `${(0, exports.resourceArtifactUsageRunPrefix)(String(generation.runId))}/manifest.json`, 'manifest.path');
};
const checkIndex = (record, expected) => {
    (0, validationHelpers_js_1.assertExactKeys)(record, [...BINDING_KEYS, 'baseRelationshipSnapshotId', 'artifacts', 'resourceArtifacts'], 'index');
    checkBinding(record, expected);
    (0, validationHelpers_js_1.requiredString)(record.baseRelationshipSnapshotId, 'baseRelationshipSnapshotId');
    const artifacts = (0, validationHelpers_js_1.asArray)(record.artifacts, 'artifacts');
    artifacts.forEach((summary, index) => checkSummary(summary, `artifacts[${index}]`));
    const ids = artifacts.map(artifact => String((0, validationHelpers_js_1.asRecord)(artifact, 'artifacts').id));
    (0, validationHelpers_js_1.assertUnique)(ids, 'artifacts.ids');
    const joins = (0, validationHelpers_js_1.asRecord)(record.resourceArtifacts, 'resourceArtifacts');
    for (const [resourceId, artifactIds] of Object.entries(joins)) {
        (0, validationHelpers_js_1.requiredString)(resourceId, 'resourceArtifacts.resourceId');
        const references = (0, validationHelpers_js_1.asArray)(artifactIds, `resourceArtifacts.${resourceId}`).map(value => id(value, `resourceArtifacts.${resourceId}`));
        (0, validationHelpers_js_1.assertUnique)(references, `resourceArtifacts.${resourceId}`);
        if (references.some(reference => !ids.includes(reference)))
            throw new Error(`resourceArtifacts.${resourceId} contains an undeclared artifact.`);
    }
    for (const artifact of artifacts) {
        const summary = (0, validationHelpers_js_1.asRecord)(artifact, 'artifacts');
        if (Array.isArray(summary.childArtifactIds) && summary.childArtifactIds.some(child => !ids.includes(String(child))))
            throw new Error('childArtifactIds must be declared in the same index.');
    }
};
const checkPage = (record, expected) => {
    (0, validationHelpers_js_1.assertExactKeys)(record, [...BINDING_KEYS, 'artifactId', 'section', 'page', 'rows', 'count', 'completeness', 'nextPage'], 'page');
    checkBinding(record, expected);
    id(record.artifactId, 'artifactId');
    const section = (0, validationHelpers_js_1.requiredEnum)(record.section, DETAIL_SECTIONS, 'section');
    const page = (0, validationHelpers_js_1.nonNegativeInteger)(record.page, 'page');
    const completeness = (0, validationHelpers_js_1.requiredEnum)(record.completeness, [...COMPLETENESS, 'restricted'], 'completeness');
    const rows = (0, validationHelpers_js_1.asArray)(record.rows, 'rows');
    if (rows.length > exports.RESOURCE_ARTIFACT_USAGE_MAX_ROWS)
        throw new Error('rows exceeds the page limit.');
    optionalCount(record, 'count', 'page');
    optionalCount(record, 'nextPage', 'page');
    if (record.nextPage !== undefined && record.nextPage !== page + 1)
        throw new Error('nextPage must be the immediate next declared page.');
    if (section === 'summary' && (page !== 0 || rows.length > 1 || record.nextPage !== undefined))
        throw new Error('summary is a single page with at most one row.');
    if (['unavailable', 'unsupported', 'restricted'].includes(completeness) &&
        (rows.length || record.count !== undefined || record.nextPage !== undefined))
        throw new Error('Unobserved/restricted sections cannot contain rows or counts.');
    if (record.count !== undefined && Number(record.count) < rows.length)
        throw new Error('count cannot be smaller than its observed page rows.');
    rows.forEach((row, index) => {
        const field = `rows[${index}]`;
        if (section === 'summary') {
            checkSummary(row, field);
            (0, validationHelpers_js_1.assertValue)((0, validationHelpers_js_1.asRecord)(row, field).id, record.artifactId, `${field}.id`);
        }
        else if (section === 'findings')
            checkFinding(row, field);
        else
            checkUsage(row, field);
    });
    (0, validationHelpers_js_1.assertUnique)(rows.map(row => String((0, validationHelpers_js_1.asRecord)(row, 'rows').id)), 'rows.ids');
    for (const key of ['artifactId', 'section', 'page'])
        if (expected?.[key] !== undefined)
            (0, validationHelpers_js_1.assertValue)(record[key], expected[key], key);
};
/** JSON UTF-8 byte length without Node or browser runtime dependencies. */
const jsonBytes = (value) => {
    const serialized = JSON.stringify(value);
    let bytes = 0;
    for (const character of serialized) {
        const codePoint = character.codePointAt(0);
        bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    }
    return bytes;
};
const validate = (value, check) => {
    try {
        (0, validationHelpers_js_1.assertPlainJson)(value, 'artifactUsage', key => ['__proto__', 'prototype', 'constructor'].includes(key));
        if (jsonBytes(value) > exports.RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES)
            throw new Error('artifactUsage exceeds the 2 MiB decoded JSON budget.');
        check((0, validationHelpers_js_1.asRecord)(value, 'artifactUsage'));
        return [];
    }
    catch (error) {
        return [error instanceof Error ? error.message : 'Invalid artifact usage document.'];
    }
};
const validateResourceArtifactUsageManifest = (value, expected) => validate(value, record => checkManifest(record, expected));
exports.validateResourceArtifactUsageManifest = validateResourceArtifactUsageManifest;
const validateResourceArtifactUsagePointer = (value, expected) => validate(value, record => checkPointer(record, expected));
exports.validateResourceArtifactUsagePointer = validateResourceArtifactUsagePointer;
const validateResourceArtifactUsageIndex = (value, expected) => validate(value, record => checkIndex(record, expected));
exports.validateResourceArtifactUsageIndex = validateResourceArtifactUsageIndex;
const validateResourceArtifactSummary = (value) => validate(value, record => checkSummary(record, 'summary'));
exports.validateResourceArtifactSummary = validateResourceArtifactSummary;
const validateResourceArtifactFinding = (value) => validate(value, record => checkFinding(record, 'finding'));
exports.validateResourceArtifactFinding = validateResourceArtifactFinding;
const validateResourceArtifactUsageEvidence = (value) => validate(value, record => checkUsage(record, 'usage'));
exports.validateResourceArtifactUsageEvidence = validateResourceArtifactUsageEvidence;
const validateResourceArtifactDetailPage = (value, expected) => validate(value, record => checkPage(record, expected));
exports.validateResourceArtifactDetailPage = validateResourceArtifactDetailPage;
const isResourceArtifactUsageManifest = (value, expected) => (0, exports.validateResourceArtifactUsageManifest)(value, expected).length === 0;
exports.isResourceArtifactUsageManifest = isResourceArtifactUsageManifest;
const isResourceArtifactUsagePointer = (value, expected) => (0, exports.validateResourceArtifactUsagePointer)(value, expected).length === 0;
exports.isResourceArtifactUsagePointer = isResourceArtifactUsagePointer;
const isResourceArtifactUsageIndex = (value, expected) => (0, exports.validateResourceArtifactUsageIndex)(value, expected).length === 0;
exports.isResourceArtifactUsageIndex = isResourceArtifactUsageIndex;
const isResourceArtifactSummary = (value) => (0, exports.validateResourceArtifactSummary)(value).length === 0;
exports.isResourceArtifactSummary = isResourceArtifactSummary;
const isResourceArtifactFinding = (value) => (0, exports.validateResourceArtifactFinding)(value).length === 0;
exports.isResourceArtifactFinding = isResourceArtifactFinding;
const isResourceArtifactUsageEvidence = (value) => (0, exports.validateResourceArtifactUsageEvidence)(value).length === 0;
exports.isResourceArtifactUsageEvidence = isResourceArtifactUsageEvidence;
const isResourceArtifactDetailPage = (value, expected) => (0, exports.validateResourceArtifactDetailPage)(value, expected).length === 0;
exports.isResourceArtifactDetailPage = isResourceArtifactDetailPage;
//# sourceMappingURL=resourceArtifactUsage.js.map