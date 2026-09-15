"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsOrganizationCommitmentsRefreshAcceptedResponse = validateAwsOrganizationCommitmentsRefreshAcceptedResponse;
exports.validateAwsOrganizationCommitmentsScopeListResponse = validateAwsOrganizationCommitmentsScopeListResponse;
exports.validateAwsOrganizationCommitmentsRefreshStatusResponse = validateAwsOrganizationCommitmentsRefreshStatusResponse;
const organizationCommitments_js_1 = require("./organizationCommitments.js");
const portalPublicArtifactValidationCommon_js_1 = require("./portalPublicArtifactValidationCommon.js");
const pluginPublicArtifactValidationHelpers_js_1 = require("./pluginPublicArtifactValidationHelpers.js");
const ORGANIZATION_ID = /^o-[a-z0-9]{10,32}$/u;
/** Validates one API-authored organization commitments refresh receipt. */
function validateAwsOrganizationCommitmentsRefreshAcceptedResponse(value, expected) {
    const response = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, 'organizationCommitmentsAdmission');
    const disposition = (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(response.disposition, ['accepted', 'already-running', 'cooldown'], 'organizationCommitmentsAdmission.disposition');
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(response, [
        'schemaVersion',
        'provider',
        'scopeType',
        'companyId',
        'estateId',
        'organizationId',
        'managementAccountId',
        'requestId',
        'correlationId',
        'manifestRevision',
        'disposition',
        'acceptedAt',
        ...(disposition === 'cooldown' ? ['nextEligibleAt'] : []),
    ], 'organizationCommitmentsAdmission');
    validateOrganizationApiIdentity(response, expected, 'organizationCommitmentsAdmission');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(response.manifestRevision, expected.manifestRevision, 'organizationCommitmentsAdmission.manifestRevision');
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(response.requestId, 'organizationCommitmentsAdmission.requestId');
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(response.correlationId, 'organizationCommitmentsAdmission.correlationId');
    const acceptedAt = (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(response.acceptedAt, 'organizationCommitmentsAdmission.acceptedAt');
    if (disposition === 'cooldown') {
        const nextEligibleAt = (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(response.nextEligibleAt, 'organizationCommitmentsAdmission.nextEligibleAt');
        if (Date.parse(nextEligibleAt) <= Date.parse(acceptedAt)) {
            throw new Error('organizationCommitmentsAdmission.nextEligibleAt must be later than acceptedAt.');
        }
    }
    (0, portalPublicArtifactValidationCommon_js_1.assertPublicJson)(response, 'organizationCommitmentsAdmission');
    return value;
}
/** Validates the safe organization scope selector response for one company. */
function validateAwsOrganizationCommitmentsScopeListResponse(value, expectedCompanyId) {
    const response = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, 'organizationCommitmentsScopes');
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(response, ['schemaVersion', 'provider', 'companyId', 'organizations'], 'organizationCommitmentsScopes');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(response.schemaVersion, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION, 'organizationCommitmentsScopes.schemaVersion');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(response.provider, 'AWS', 'organizationCommitmentsScopes.provider');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(response.companyId, (0, portalPublicArtifactValidationCommon_js_1.requiredString)(expectedCompanyId, 'expectedCompanyId'), 'organizationCommitmentsScopes.companyId');
    if (!Array.isArray(response.organizations))
        throw new Error('organizationCommitmentsScopes.organizations must be an array.');
    const estateIds = [];
    const organizationIds = [];
    response.organizations.forEach((entry, index) => {
        const field = `organizationCommitmentsScopes.organizations[${index}]`;
        const scope = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(scope, ['scopeType', 'estateId', 'name', 'organizationId', 'managementAccountId', 'accountCount', 'availability', 'canView', 'canRefresh', 'reason'], field);
        (0, portalPublicArtifactValidationCommon_js_1.assertValue)(scope.scopeType, 'organization', `${field}.scopeType`);
        estateIds.push((0, portalPublicArtifactValidationCommon_js_1.requiredString)(scope.estateId, `${field}.estateId`));
        (0, portalPublicArtifactValidationCommon_js_1.requiredString)(scope.name, `${field}.name`);
        organizationIds.push(requiredOrganizationId(scope.organizationId, `${field}.organizationId`));
        requiredAccountId(scope.managementAccountId, `${field}.managementAccountId`);
        const accountCount = (0, portalPublicArtifactValidationCommon_js_1.nonNegativeInteger)(scope.accountCount, `${field}.accountCount`);
        if (accountCount < 1)
            throw new Error(`${field}.accountCount must include the management account.`);
        const availability = (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(scope.availability, ['available', 'unavailable'], `${field}.availability`);
        (0, portalPublicArtifactValidationCommon_js_1.requiredBoolean)(scope.canView, `${field}.canView`);
        const canRefresh = (0, portalPublicArtifactValidationCommon_js_1.requiredBoolean)(scope.canRefresh, `${field}.canRefresh`);
        if (availability === 'available') {
            if (scope.reason !== undefined)
                throw new Error(`${field}.reason is not allowed when the scope is available.`);
        }
        else {
            (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(scope.reason, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS, `${field}.reason`);
            if (canRefresh)
                throw new Error(`${field}.canRefresh must be false when the scope is unavailable.`);
        }
    });
    assertUniqueSorted(estateIds, 'organizationCommitmentsScopes.organizations estateId');
    assertUnique(organizationIds, 'organizationCommitmentsScopes.organizations organizationId');
    (0, portalPublicArtifactValidationCommon_js_1.assertPublicJson)(response, 'organizationCommitmentsScopes');
    return value;
}
/** Validates one sanitized Blob-backed organization commitments status projection. */
function validateAwsOrganizationCommitmentsRefreshStatusResponse(value, expected) {
    const response = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, 'organizationCommitmentsStatus');
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(response, [
        'schemaVersion',
        'provider',
        'scopeType',
        'companyId',
        'estateId',
        'organizationId',
        'managementAccountId',
        'targetManifestRevision',
        'state',
        'requestId',
        'correlationId',
        'requestedAt',
        'updatedAt',
        'stages',
        'failureCode',
        'retryable',
        'nextEligibleAt',
        'latestArtifact',
    ], 'organizationCommitmentsStatus');
    validateOrganizationApiIdentity(response, expected, 'organizationCommitmentsStatus');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(response.targetManifestRevision, (0, portalPublicArtifactValidationCommon_js_1.requiredString)(expected.targetManifestRevision, 'expected.targetManifestRevision'), 'organizationCommitmentsStatus.targetManifestRevision');
    const state = (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(response.state, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES, 'organizationCommitmentsStatus.state');
    (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(response.updatedAt, 'organizationCommitmentsStatus.updatedAt');
    if (state === 'not-started') {
        for (const key of ['requestId', 'correlationId', 'requestedAt', 'failureCode', 'retryable']) {
            if (response[key] !== undefined)
                throw new Error(`organizationCommitmentsStatus.${key} is not allowed before a refresh starts.`);
        }
    }
    else {
        const requestId = (0, portalPublicArtifactValidationCommon_js_1.requiredString)(response.requestId, 'organizationCommitmentsStatus.requestId');
        if (expected.requestId !== undefined)
            (0, portalPublicArtifactValidationCommon_js_1.assertValue)(requestId, expected.requestId, 'organizationCommitmentsStatus.requestId');
        (0, portalPublicArtifactValidationCommon_js_1.requiredString)(response.correlationId, 'organizationCommitmentsStatus.correlationId');
        (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(response.requestedAt, 'organizationCommitmentsStatus.requestedAt');
    }
    if (response.failureCode !== undefined) {
        (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(response.failureCode, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES, 'organizationCommitmentsStatus.failureCode');
    }
    if (state === 'failed' && response.failureCode === undefined) {
        throw new Error('organizationCommitmentsStatus.failureCode is required when the refresh failed.');
    }
    if (response.retryable !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.requiredBoolean)(response.retryable, 'organizationCommitmentsStatus.retryable');
    if (response.nextEligibleAt !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(response.nextEligibleAt, 'organizationCommitmentsStatus.nextEligibleAt');
    validateStages(response.stages);
    if (response.latestArtifact !== undefined)
        validateLatestArtifact(response.latestArtifact, state);
    if (state === 'fresh' && response.latestArtifact === undefined) {
        throw new Error('organizationCommitmentsStatus.latestArtifact is required when the refresh is fresh.');
    }
    (0, portalPublicArtifactValidationCommon_js_1.assertPublicJson)(response, 'organizationCommitmentsStatus');
    return value;
}
function validateStages(value) {
    if (!Array.isArray(value) || value.length !== organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES.length) {
        throw new Error('organizationCommitmentsStatus.stages must contain every canonical stage exactly once.');
    }
    value.forEach((entry, index) => {
        const field = `organizationCommitmentsStatus.stages[${index}]`;
        const stage = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(entry, field);
        (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(stage, ['id', 'status', 'completedCount', 'totalCount', 'failureCode', 'retryable', 'updatedAt'], field);
        (0, portalPublicArtifactValidationCommon_js_1.assertValue)(stage.id, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES[index], `${field}.id`);
        const status = (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(stage.status, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES, `${field}.status`);
        if ((stage.completedCount === undefined) !== (stage.totalCount === undefined)) {
            throw new Error(`${field}.completedCount and totalCount must be supplied together.`);
        }
        if (stage.completedCount !== undefined) {
            const completed = (0, portalPublicArtifactValidationCommon_js_1.nonNegativeInteger)(stage.completedCount, `${field}.completedCount`);
            const total = (0, portalPublicArtifactValidationCommon_js_1.nonNegativeInteger)(stage.totalCount, `${field}.totalCount`);
            if (completed > total)
                throw new Error(`${field}.completedCount must not exceed totalCount.`);
        }
        if (stage.failureCode !== undefined)
            (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(stage.failureCode, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES, `${field}.failureCode`);
        if (status === 'failed' && stage.failureCode === undefined)
            throw new Error(`${field}.failureCode is required when the stage failed.`);
        if (stage.retryable !== undefined)
            (0, portalPublicArtifactValidationCommon_js_1.requiredBoolean)(stage.retryable, `${field}.retryable`);
        (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(stage.updatedAt, `${field}.updatedAt`);
    });
}
function validateLatestArtifact(value, refreshState) {
    const artifact = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, 'organizationCommitmentsStatus.latestArtifact');
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(artifact, ['state', 'generatedAt', 'artifactGeneration'], 'organizationCommitmentsStatus.latestArtifact');
    const state = (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(artifact.state, ['available', 'stale', 'unavailable'], 'organizationCommitmentsStatus.latestArtifact.state');
    if (state === 'unavailable') {
        if (artifact.generatedAt !== undefined || artifact.artifactGeneration !== undefined) {
            throw new Error('organizationCommitmentsStatus.latestArtifact unavailable state cannot claim generation evidence.');
        }
    }
    else {
        const generatedAt = (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(artifact.generatedAt, 'organizationCommitmentsStatus.latestArtifact.generatedAt');
        const generation = (0, portalPublicArtifactValidationCommon_js_1.validateGeneration)(artifact.artifactGeneration, 'organizationCommitmentsStatus.latestArtifact.artifactGeneration');
        if (Date.parse(generatedAt) > Date.parse(generation.generatedAt)) {
            throw new Error('organizationCommitmentsStatus.latestArtifact.generatedAt must not exceed its generation time.');
        }
    }
    if (refreshState === 'fresh' && state !== 'available') {
        throw new Error('organizationCommitmentsStatus fresh state requires an available latest artifact.');
    }
}
function validateOrganizationApiIdentity(value, expected, field) {
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(value.schemaVersion, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION, `${field}.schemaVersion`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(value.provider, 'AWS', `${field}.provider`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(value.scopeType, 'organization', `${field}.scopeType`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(value.companyId, (0, portalPublicArtifactValidationCommon_js_1.requiredString)(expected.companyId, 'expected.companyId'), `${field}.companyId`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(value.estateId, (0, portalPublicArtifactValidationCommon_js_1.requiredString)(expected.estateId, 'expected.estateId'), `${field}.estateId`);
    const organizationId = requiredOrganizationId(value.organizationId, `${field}.organizationId`);
    const managementAccountId = requiredAccountId(value.managementAccountId, `${field}.managementAccountId`);
    if (expected.organizationId !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.assertValue)(organizationId, expected.organizationId, `${field}.organizationId`);
    if (expected.managementAccountId !== undefined) {
        (0, portalPublicArtifactValidationCommon_js_1.assertValue)(managementAccountId, expected.managementAccountId, `${field}.managementAccountId`);
    }
}
function requiredAccountId(value, field) {
    const accountId = (0, portalPublicArtifactValidationCommon_js_1.requiredString)(value, field);
    (0, pluginPublicArtifactValidationHelpers_js_1.assertAccount)(value, accountId, field);
    return accountId;
}
function requiredOrganizationId(value, field) {
    const organizationId = (0, portalPublicArtifactValidationCommon_js_1.requiredString)(value, field);
    if (!ORGANIZATION_ID.test(organizationId))
        throw new Error(`${field} must be a canonical AWS organization id.`);
    return organizationId;
}
function assertUniqueSorted(values, field) {
    assertUnique(values, field);
    const sorted = [...values].sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(values) !== JSON.stringify(sorted))
        throw new Error(`${field} must be sorted.`);
}
function assertUnique(values, field) {
    if (new Set(values).size !== values.length)
        throw new Error(`${field} must not contain duplicates.`);
}
//# sourceMappingURL=organizationCommitmentsApiValidation.js.map