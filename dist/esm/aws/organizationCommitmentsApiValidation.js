import { AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES, AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION, AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS, } from './organizationCommitments.js';
import { asRecord, assertExactKeys, assertPublicJson, assertValue, isoTimestamp, nonNegativeInteger, requiredBoolean, requiredEnum, requiredString, validateGeneration, } from './portalPublicArtifactValidationCommon.js';
import { assertAccount } from './pluginPublicArtifactValidationHelpers.js';
const ORGANIZATION_ID = /^o-[a-z0-9]{10,32}$/u;
/** Validates one API-authored organization commitments refresh receipt. */
export function validateAwsOrganizationCommitmentsRefreshAcceptedResponse(value, expected) {
    const response = asRecord(value, 'organizationCommitmentsAdmission');
    const disposition = requiredEnum(response.disposition, ['accepted', 'already-running', 'cooldown'], 'organizationCommitmentsAdmission.disposition');
    assertExactKeys(response, [
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
    assertValue(response.manifestRevision, expected.manifestRevision, 'organizationCommitmentsAdmission.manifestRevision');
    requiredString(response.requestId, 'organizationCommitmentsAdmission.requestId');
    requiredString(response.correlationId, 'organizationCommitmentsAdmission.correlationId');
    const acceptedAt = isoTimestamp(response.acceptedAt, 'organizationCommitmentsAdmission.acceptedAt');
    if (disposition === 'cooldown') {
        const nextEligibleAt = isoTimestamp(response.nextEligibleAt, 'organizationCommitmentsAdmission.nextEligibleAt');
        if (Date.parse(nextEligibleAt) <= Date.parse(acceptedAt)) {
            throw new Error('organizationCommitmentsAdmission.nextEligibleAt must be later than acceptedAt.');
        }
    }
    assertPublicJson(response, 'organizationCommitmentsAdmission');
    return value;
}
/** Validates the safe organization scope selector response for one company. */
export function validateAwsOrganizationCommitmentsScopeListResponse(value, expectedCompanyId) {
    const response = asRecord(value, 'organizationCommitmentsScopes');
    assertExactKeys(response, ['schemaVersion', 'provider', 'companyId', 'organizations'], 'organizationCommitmentsScopes');
    assertValue(response.schemaVersion, AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION, 'organizationCommitmentsScopes.schemaVersion');
    assertValue(response.provider, 'AWS', 'organizationCommitmentsScopes.provider');
    assertValue(response.companyId, requiredString(expectedCompanyId, 'expectedCompanyId'), 'organizationCommitmentsScopes.companyId');
    if (!Array.isArray(response.organizations))
        throw new Error('organizationCommitmentsScopes.organizations must be an array.');
    const estateIds = [];
    const organizationIds = [];
    response.organizations.forEach((entry, index) => {
        const field = `organizationCommitmentsScopes.organizations[${index}]`;
        const scope = asRecord(entry, field);
        assertExactKeys(scope, ['scopeType', 'estateId', 'name', 'organizationId', 'managementAccountId', 'accountCount', 'availability', 'canView', 'canRefresh', 'reason'], field);
        assertValue(scope.scopeType, 'organization', `${field}.scopeType`);
        estateIds.push(requiredString(scope.estateId, `${field}.estateId`));
        requiredString(scope.name, `${field}.name`);
        organizationIds.push(requiredOrganizationId(scope.organizationId, `${field}.organizationId`));
        requiredAccountId(scope.managementAccountId, `${field}.managementAccountId`);
        const accountCount = nonNegativeInteger(scope.accountCount, `${field}.accountCount`);
        if (accountCount < 1)
            throw new Error(`${field}.accountCount must include the management account.`);
        const availability = requiredEnum(scope.availability, ['available', 'unavailable'], `${field}.availability`);
        requiredBoolean(scope.canView, `${field}.canView`);
        const canRefresh = requiredBoolean(scope.canRefresh, `${field}.canRefresh`);
        if (availability === 'available') {
            if (scope.reason !== undefined)
                throw new Error(`${field}.reason is not allowed when the scope is available.`);
        }
        else {
            requiredEnum(scope.reason, AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS, `${field}.reason`);
            if (canRefresh)
                throw new Error(`${field}.canRefresh must be false when the scope is unavailable.`);
        }
    });
    assertUniqueSorted(estateIds, 'organizationCommitmentsScopes.organizations estateId');
    assertUnique(organizationIds, 'organizationCommitmentsScopes.organizations organizationId');
    assertPublicJson(response, 'organizationCommitmentsScopes');
    return value;
}
/** Validates one sanitized Blob-backed organization commitments status projection. */
export function validateAwsOrganizationCommitmentsRefreshStatusResponse(value, expected) {
    const response = asRecord(value, 'organizationCommitmentsStatus');
    assertExactKeys(response, [
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
    assertValue(response.targetManifestRevision, requiredString(expected.targetManifestRevision, 'expected.targetManifestRevision'), 'organizationCommitmentsStatus.targetManifestRevision');
    const state = requiredEnum(response.state, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES, 'organizationCommitmentsStatus.state');
    isoTimestamp(response.updatedAt, 'organizationCommitmentsStatus.updatedAt');
    if (state === 'not-started') {
        for (const key of ['requestId', 'correlationId', 'requestedAt', 'failureCode', 'retryable']) {
            if (response[key] !== undefined)
                throw new Error(`organizationCommitmentsStatus.${key} is not allowed before a refresh starts.`);
        }
    }
    else {
        const requestId = requiredString(response.requestId, 'organizationCommitmentsStatus.requestId');
        if (expected.requestId !== undefined)
            assertValue(requestId, expected.requestId, 'organizationCommitmentsStatus.requestId');
        requiredString(response.correlationId, 'organizationCommitmentsStatus.correlationId');
        isoTimestamp(response.requestedAt, 'organizationCommitmentsStatus.requestedAt');
    }
    if (response.failureCode !== undefined) {
        requiredEnum(response.failureCode, AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES, 'organizationCommitmentsStatus.failureCode');
    }
    if (state === 'failed' && response.failureCode === undefined) {
        throw new Error('organizationCommitmentsStatus.failureCode is required when the refresh failed.');
    }
    if (response.retryable !== undefined)
        requiredBoolean(response.retryable, 'organizationCommitmentsStatus.retryable');
    if (response.nextEligibleAt !== undefined)
        isoTimestamp(response.nextEligibleAt, 'organizationCommitmentsStatus.nextEligibleAt');
    validateStages(response.stages);
    if (response.latestArtifact !== undefined)
        validateLatestArtifact(response.latestArtifact, state);
    if (state === 'fresh' && response.latestArtifact === undefined) {
        throw new Error('organizationCommitmentsStatus.latestArtifact is required when the refresh is fresh.');
    }
    assertPublicJson(response, 'organizationCommitmentsStatus');
    return value;
}
function validateStages(value) {
    if (!Array.isArray(value) || value.length !== AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES.length) {
        throw new Error('organizationCommitmentsStatus.stages must contain every canonical stage exactly once.');
    }
    value.forEach((entry, index) => {
        const field = `organizationCommitmentsStatus.stages[${index}]`;
        const stage = asRecord(entry, field);
        assertExactKeys(stage, ['id', 'status', 'completedCount', 'totalCount', 'failureCode', 'retryable', 'updatedAt'], field);
        assertValue(stage.id, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES[index], `${field}.id`);
        const status = requiredEnum(stage.status, AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES, `${field}.status`);
        if ((stage.completedCount === undefined) !== (stage.totalCount === undefined)) {
            throw new Error(`${field}.completedCount and totalCount must be supplied together.`);
        }
        if (stage.completedCount !== undefined) {
            const completed = nonNegativeInteger(stage.completedCount, `${field}.completedCount`);
            const total = nonNegativeInteger(stage.totalCount, `${field}.totalCount`);
            if (completed > total)
                throw new Error(`${field}.completedCount must not exceed totalCount.`);
        }
        if (stage.failureCode !== undefined)
            requiredEnum(stage.failureCode, AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES, `${field}.failureCode`);
        if (status === 'failed' && stage.failureCode === undefined)
            throw new Error(`${field}.failureCode is required when the stage failed.`);
        if (stage.retryable !== undefined)
            requiredBoolean(stage.retryable, `${field}.retryable`);
        isoTimestamp(stage.updatedAt, `${field}.updatedAt`);
    });
}
function validateLatestArtifact(value, refreshState) {
    const artifact = asRecord(value, 'organizationCommitmentsStatus.latestArtifact');
    assertExactKeys(artifact, ['state', 'generatedAt', 'artifactGeneration'], 'organizationCommitmentsStatus.latestArtifact');
    const state = requiredEnum(artifact.state, ['available', 'stale', 'unavailable'], 'organizationCommitmentsStatus.latestArtifact.state');
    if (state === 'unavailable') {
        if (artifact.generatedAt !== undefined || artifact.artifactGeneration !== undefined) {
            throw new Error('organizationCommitmentsStatus.latestArtifact unavailable state cannot claim generation evidence.');
        }
    }
    else {
        const generatedAt = isoTimestamp(artifact.generatedAt, 'organizationCommitmentsStatus.latestArtifact.generatedAt');
        const generation = validateGeneration(artifact.artifactGeneration, 'organizationCommitmentsStatus.latestArtifact.artifactGeneration');
        if (Date.parse(generatedAt) > Date.parse(generation.generatedAt)) {
            throw new Error('organizationCommitmentsStatus.latestArtifact.generatedAt must not exceed its generation time.');
        }
    }
    if (refreshState === 'fresh' && state !== 'available') {
        throw new Error('organizationCommitmentsStatus fresh state requires an available latest artifact.');
    }
}
function validateOrganizationApiIdentity(value, expected, field) {
    assertValue(value.schemaVersion, AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION, `${field}.schemaVersion`);
    assertValue(value.provider, 'AWS', `${field}.provider`);
    assertValue(value.scopeType, 'organization', `${field}.scopeType`);
    assertValue(value.companyId, requiredString(expected.companyId, 'expected.companyId'), `${field}.companyId`);
    assertValue(value.estateId, requiredString(expected.estateId, 'expected.estateId'), `${field}.estateId`);
    const organizationId = requiredOrganizationId(value.organizationId, `${field}.organizationId`);
    const managementAccountId = requiredAccountId(value.managementAccountId, `${field}.managementAccountId`);
    if (expected.organizationId !== undefined)
        assertValue(organizationId, expected.organizationId, `${field}.organizationId`);
    if (expected.managementAccountId !== undefined) {
        assertValue(managementAccountId, expected.managementAccountId, `${field}.managementAccountId`);
    }
}
function requiredAccountId(value, field) {
    const accountId = requiredString(value, field);
    assertAccount(value, accountId, field);
    return accountId;
}
function requiredOrganizationId(value, field) {
    const organizationId = requiredString(value, field);
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
