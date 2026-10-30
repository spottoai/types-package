"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScopeScanRawFinding = exports.isAwsResourceInAccount = exports.parseScopeScanRawItem = exports.SCOPE_SCAN_FINDING_STATUS_PRIORITY = exports.isAggregatedScopeScanCheck = void 0;
const contracts_1 = require("./contracts");
const internal_1 = require("./internal");
const failures_1 = require("./failures");
/** Only this check emits one row per credential for a single app identity. */
/**
 * Repeated results for one resource and check are summarised (FAIL over MANUAL over PASS) instead of failing the scan:
 * per-credential app results in a tenant, and AWS account scans, where some checks report a resource once per region.
 */
const isAggregatedScopeScanCheck = (scopeType, checkId) => scopeType === 'account' || (scopeType === 'tenant' && checkId === 'entra_app_registration_credential_not_expired');
exports.isAggregatedScopeScanCheck = isAggregatedScopeScanCheck;
exports.SCOPE_SCAN_FINDING_STATUS_PRIORITY = Object.freeze({ PASS: 0, MANUAL: 1, FAIL: 2 });
/** Use the page envelope so single-item acceptance and eventual page parsing have identical depth limits. */
const parseScopeScanRawItem = (value) => {
    const page = (0, internal_1.input)({ schemaVersion: 2, items: [value] });
    if ((0, internal_1.decodedBytes)(page) > contracts_1.FRAMEWORK_ASSESSMENT_LIMITS.pageDecodedBytes)
        throw new failures_1.TerminalAssessmentError('raw-row-too-large');
    return page.items[0];
};
exports.parseScopeScanRawItem = parseScopeScanRawItem;
const object = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return undefined;
    return Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(value))
        .filter(([, descriptor]) => 'value' in descriptor)
        .map(([key, descriptor]) => [key, descriptor.value]));
};
const AWS_PARTITIONS = new Set(['aws', 'aws-us-gov', 'aws-cn']);
/**
 * An AWS resource belongs to the scanned account when it is the account itself, or an ARN whose account segment is
 * empty (global resources such as S3 buckets) or equal to the account. ARNs are case-sensitive and are not folded.
 */
const isAwsResourceInAccount = (uid, accountId) => {
    if (uid === accountId)
        return true;
    const parts = uid.split(':');
    if (parts.length < 6 || parts[0] !== 'arn' || !AWS_PARTITIONS.has(parts[1] ?? '') || !parts[2])
        return false;
    return parts[4] === '' || parts[4] === accountId;
};
exports.isAwsResourceInAccount = isAwsResourceInAccount;
const isAzureResourceInScope = (uid, scope, checkId) => {
    const folded = uid.toLowerCase().replace(/\/$/u, '');
    const ancestor = checkId === 'iam_role_user_access_admin_restricted' &&
        /^\/providers\/(?:microsoft\.management\/managementgroups\/[^/]+\/providers\/)?microsoft\.authorization\/roleassignments\/[a-f0-9-]{36}$/u.test(folded);
    return scope.scopeType === 'tenant'
        ? !folded.startsWith('/')
        : folded.startsWith(`/subscriptions/${scope.scopeId}/`) || folded === `/subscriptions/${scope.scopeId}` || ancestor;
};
/** AWS ids keep their case; Azure ids are folded to lower case without a trailing slash. */
const normalizeResourceId = (uid, scope) => scope.providerName === 'aws' ? uid : uid.toLowerCase().replace(/\/$/u, '');
/** Positive native-scope contradictions are terminal even when another field would quarantine the row. */
const parseScopeScanRawFinding = (value, expected) => {
    const row = object(value), cloud = object(row?.cloud), account = object(cloud?.account), metadata = object(row?.metadata);
    const knownCheck = typeof metadata?.event_code === 'string' ? metadata.event_code : undefined;
    const scope = expected.scope;
    if ((typeof cloud?.provider === 'string' && cloud.provider !== scope.providerName) ||
        (typeof account?.uid === 'string' && account.uid.toLowerCase() !== scope.scopeId))
        throw new failures_1.TerminalAssessmentError('raw-finding-outside-native-scope');
    const version = object(metadata?.product)?.version;
    if (typeof version === 'string' && version !== expected.sourceVersion)
        throw new failures_1.TerminalAssessmentError('raw-source-version-mismatch');
    if (knownCheck &&
        (!expected.selectedCheckIds.includes(knownCheck) ||
            (scope.scopeType === 'tenant' ? !knownCheck.startsWith('entra_') : knownCheck.startsWith('entra_'))))
        throw new failures_1.TerminalAssessmentError('raw-check-outside-native-scope');
    if (Array.isArray(row?.resources))
        for (const value of row.resources) {
            const entry = object(value);
            if (typeof entry?.uid !== 'string')
                continue;
            const inScope = scope.providerName === 'aws' ? (0, exports.isAwsResourceInAccount)(entry.uid, scope.scopeId) : isAzureResourceInScope(entry.uid, scope, knownCheck);
            if (!inScope)
                throw new failures_1.TerminalAssessmentError('raw-resource-outside-native-scope');
        }
    try {
        const safe = (0, internal_1.record)((0, exports.parseScopeScanRawItem)(value), 'raw finding');
        const safeCloud = (0, internal_1.record)(safe.cloud, 'cloud');
        if ((0, internal_1.identifier)(safeCloud.provider) !== scope.providerName || (0, internal_1.identifier)((0, internal_1.record)(safeCloud.account, 'account').uid).toLowerCase() !== scope.scopeId)
            return null;
        const safeMetadata = (0, internal_1.record)(safe.metadata, 'metadata');
        if ((0, internal_1.identifier)((0, internal_1.record)(safeMetadata.product, 'product').version, 32) !== expected.sourceVersion)
            return null;
        const resources = (0, internal_1.list)(safe.resources, 1);
        if (resources.length !== 1)
            return null;
        const resource = (0, internal_1.record)(resources[0], 'resource');
        if (scope.scopeType === 'tenant' && (0, internal_1.record)(resource.group, 'group').name !== 'entra')
            return null;
        const mappings = safe.unmapped ? (0, internal_1.record)((0, internal_1.record)(safe.unmapped, 'unmapped').compliance ?? {}, 'compliance') : {};
        const frameworkMappings = {};
        for (const [key, value] of Object.entries(mappings))
            frameworkMappings[(0, internal_1.identifier)(key)] = (0, internal_1.unique)((0, internal_1.list)(value).map(value => (0, internal_1.identifier)(value)));
        return {
            checkId: (0, internal_1.identifier)(safeMetadata.event_code),
            resourceId: normalizeResourceId((0, internal_1.identifier)(resource.uid, 4096), scope),
            status: (0, internal_1.choice)(safe.status_code, ['PASS', 'FAIL', 'MANUAL']),
            severity: (0, internal_1.identifier)(safe.severity, 128),
            message: (0, internal_1.text)(safe.message, 65536, false),
            upstreamId: (0, internal_1.identifier)((0, internal_1.record)(safe.finding_info, 'finding_info').uid, 4096),
            frameworkMappings,
        };
    }
    catch {
        return null;
    }
};
exports.parseScopeScanRawFinding = parseScopeScanRawFinding;
//# sourceMappingURL=rawValidation.js.map