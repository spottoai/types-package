"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAwsReviewChecklistScope = normalizeAwsReviewChecklistScope;
exports.normalizeAwsReviewChecklistScanCommand = normalizeAwsReviewChecklistScanCommand;
exports.buildAwsReviewChecklistResultPath = buildAwsReviewChecklistResultPath;
exports.buildAwsReviewChecklistStatePath = buildAwsReviewChecklistStatePath;
exports.buildAwsReviewChecklistManualDocument = buildAwsReviewChecklistManualDocument;
const SCOPE_KEYS = ['providerName', 'companyId', 'cloudAccountId', 'providerScopeId'];
const COMMAND_KEYS = [...SCOPE_KEYS, 'schemaVersion', 'action', 'checklistId', 'requestId', 'requestedAt', 'sourceVersion'];
const SAFE_IDENTITY = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const CHECKLIST_ID = /^aws-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^[a-f0-9]{64}$/;
const GUID = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
function record(value, label) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`${label} must be an object`);
    return value;
}
function exactKeys(value, keys, label) {
    for (const key of Object.keys(value)) {
        if (!keys.includes(key))
            throw new Error(`${label} contains unsupported field ${key}`);
    }
}
function safeIdentity(value, label) {
    if (typeof value !== 'string' || !SAFE_IDENTITY.test(value))
        throw new Error(`${label} must be a safe identity of 1–128 characters`);
    return value;
}
function checklistIdentity(value) {
    if (typeof value !== 'string' || value.length > 128 || !CHECKLIST_ID.test(value))
        throw new Error('checklistId must be a canonical aws- slug');
    return value;
}
function sourceVersion(value) {
    if (typeof value !== 'string' || !SHA256.test(value))
        throw new Error('sourceVersion must be a lowercase SHA-256 digest');
    return value;
}
function timestamp(value, label) {
    if (typeof value !== 'string' || !ISO_TIMESTAMP.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) {
        throw new Error(`${label} must be a canonical UTC ISO timestamp`);
    }
    return value;
}
function normalizeAwsReviewChecklistScope(value) {
    const scope = record(value, 'AWS review checklist scope');
    exactKeys(scope, SCOPE_KEYS, 'AWS review checklist scope');
    if (scope.providerName !== 'aws')
        throw new Error('providerName must be aws');
    if (typeof scope.providerScopeId !== 'string' || !/^\d{12}$/.test(scope.providerScopeId))
        throw new Error('providerScopeId must be a twelve-digit AWS account ID');
    return {
        providerName: 'aws',
        companyId: safeIdentity(scope.companyId, 'companyId'),
        cloudAccountId: safeIdentity(scope.cloudAccountId, 'cloudAccountId'),
        providerScopeId: scope.providerScopeId,
    };
}
function normalizeAwsReviewChecklistScanCommand(value) {
    const command = record(value, 'AWS review checklist command');
    exactKeys(command, COMMAND_KEYS, 'AWS review checklist command');
    if (command.schemaVersion !== 1)
        throw new Error('schemaVersion must be 1');
    if (command.action !== 'aws-checklist-review')
        throw new Error('action must be aws-checklist-review');
    // Scope validation deliberately receives only its fields, never the command envelope.
    const scope = normalizeAwsReviewChecklistScope({
        providerName: command.providerName,
        companyId: command.companyId,
        cloudAccountId: command.cloudAccountId,
        providerScopeId: command.providerScopeId,
    });
    return {
        ...scope,
        schemaVersion: 1,
        action: 'aws-checklist-review',
        checklistId: checklistIdentity(command.checklistId),
        requestId: safeIdentity(command.requestId, 'requestId'),
        requestedAt: timestamp(command.requestedAt, 'requestedAt'),
        sourceVersion: sourceVersion(command.sourceVersion),
    };
}
function artifactPath(scope, checklistId, container, folder) {
    const identity = normalizeAwsReviewChecklistScope(scope);
    const id = checklistIdentity(checklistId);
    return `${container}/subscriptions/${identity.providerScopeId}/${folder}/${identity.companyId}/${identity.cloudAccountId}/${id}.json`;
}
/** Full container-prefixed private result path; identities cannot contain path delimiters. */
function buildAwsReviewChecklistResultPath(scope, checklistId) {
    return artifactPath(scope, checklistId, 'aws-portal', 'review-checklist');
}
function buildAwsReviewChecklistStatePath(scope, checklistId) {
    return artifactPath(scope, checklistId, 'aws-raw', 'review-checklist-state');
}
function optionalString(value, label) {
    if (value === undefined || value === null)
        return null;
    if (typeof value !== 'string')
        throw new Error(`${label} must be a string when present`);
    return value;
}
function optionalEffort(value) {
    if (value === undefined || value === null)
        return null;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
        throw new Error('effortHours must be finite and nonnegative');
    return value;
}
function manualItem(value) {
    const item = record(value, 'AWS review checklist definition item');
    if (typeof item.guid !== 'string' || !GUID.test(item.guid))
        throw new Error('Definition item guid must be a UUID');
    const fields = [
        'id',
        'category',
        'subcategory',
        'text',
        'description',
        'severity',
        'waf',
        'service',
        'link',
        'training',
        'headline',
        'plainSummary',
        'effortReason',
    ];
    const strings = Object.fromEntries(fields.map(field => [field, optionalString(item[field], field)]));
    return {
        ...strings,
        guid: item.guid,
        status: 'NotVerified',
        compliantCount: 0,
        nonCompliantCount: 0,
        compliantIds: [],
        nonCompliantIds: [],
        effortHours: optionalEffort(item.effortHours),
        hasGraph: false,
        graphSourceAI: false,
        assessmentMode: 'manual',
        assessmentReason: 'Manual verification required.',
    };
}
/** The caller supplies its clock. No stored evidence or inferred pass is introduced. */
function buildAwsReviewChecklistManualDocument(scope, projection, generatedAt) {
    const identity = normalizeAwsReviewChecklistScope(scope);
    const definition = record(projection, 'AWS review checklist definition projection');
    if (typeof definition.name !== 'string' || !definition.name.trim())
        throw new Error('Definition name must be a nonempty string');
    if (!Array.isArray(definition.items))
        throw new Error('Definition items must be an array');
    const items = definition.items.map(manualItem);
    if (new Set(items.map(item => item.guid.toLowerCase())).size !== items.length)
        throw new Error('Definition items contain duplicate GUIDs');
    return {
        ...identity,
        schemaVersion: 1,
        checklistId: checklistIdentity(definition.checklistId),
        tenantId: '',
        subscriptionId: identity.providerScopeId,
        sourceVersion: sourceVersion(definition.sourceVersion),
        name: definition.name,
        state: optionalString(definition.state, 'state'),
        timestamp: optionalString(definition.timestamp, 'timestamp'),
        scanStatus: 'NotRun',
        generatedAt: timestamp(generatedAt, 'generatedAt'),
        items,
    };
}
//# sourceMappingURL=awsReviewChecklist.js.map