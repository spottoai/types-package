import { ENVIRONMENT_CONTRACT_LIMITS_V1 } from './contracts.js';
import { buildEnvironmentTenantScopeQualifiedSubjectV1, isEnvironmentTenantScopeV1 } from './tenant.js';
import { isEnvironmentAwsAccountScopeV1 } from './awsIdentity.js';
import { buildEnvironmentAwsAccountScopeQualifiedSubjectV1, parseEnvironmentAwsLogicalArtifactReferenceV1, parseEnvironmentAwsLogicalResourceReferenceV1, } from './awsReferences.js';
import { buildEnvironmentScopeQualifiedSubjectV1 } from './canonicalization.js';
import { parseEnvironmentLogicalEvidenceReferenceV1 } from './references.js';
import { isEnvironmentScopeV1 } from './validation.js';
import { isBoundedString, utf8ByteLength } from './internal.js';
import { parseEnvironmentCapabilityEvidenceSubjectV1 } from './capabilityIdentifiers.js';
/** Provider dispatch does not widen the established Azure-specific guards. */
export const isEnvironmentAnyScopeV1 = (value) => isEnvironmentScopeV1(value) || isEnvironmentTenantScopeV1(value) || isEnvironmentAwsAccountScopeV1(value);
export const buildEnvironmentAnyScopeQualifiedSubjectV1 = (scope) => {
    if (!isEnvironmentAnyScopeV1(scope))
        throw new TypeError('Invalid environment scope.');
    if (scope.kind === 'aws-account')
        return buildEnvironmentAwsAccountScopeQualifiedSubjectV1(scope);
    if (scope.kind === 'azure-tenant')
        return buildEnvironmentTenantScopeQualifiedSubjectV1(scope);
    return buildEnvironmentScopeQualifiedSubjectV1(scope);
};
export const parseEnvironmentAnyScopeQualifiedSubjectV1 = (value) => {
    if (!isBoundedString(value, ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) ||
        utf8ByteLength(value) > ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes)
        return null;
    try {
        const tuple = JSON.parse(value);
        if (!Array.isArray(tuple))
            return null;
        const scope = tuple[0] === 'aws-account' && tuple.length === 3
            ? { kind: tuple[0], companyId: tuple[1], accountId: tuple[2] }
            : tuple[0] === 'azure-tenant' && tuple.length === 2
                ? { kind: tuple[0], tenantId: tuple[1] }
                : tuple[0] === 'azure-subscription' && tuple.length === 4
                    ? { kind: tuple[0], tenantId: tuple[1], companyId: tuple[2], subscriptionId: tuple[3] }
                    : null;
        return isEnvironmentAnyScopeV1(scope) && buildEnvironmentAnyScopeQualifiedSubjectV1(scope) === value ? scope : null;
    }
    catch {
        return null;
    }
};
/** Exact identity equality; canonicalization and authorization remain caller responsibilities. */
export const environmentScopesEqualV1 = (left, right) => isEnvironmentAnyScopeV1(left) &&
    isEnvironmentAnyScopeV1(right) &&
    buildEnvironmentAnyScopeQualifiedSubjectV1(left) === buildEnvironmentAnyScopeQualifiedSubjectV1(right);
/** One parser for citation registries, API adapters and MCP; malformed input returns null. */
export const parseEnvironmentAnyLogicalEvidenceReferenceV1 = (value) => {
    const aws = parseEnvironmentAwsLogicalArtifactReferenceV1(value) ?? parseEnvironmentAwsLogicalResourceReferenceV1(value);
    if (aws)
        return { provider: 'aws', ...aws };
    const azure = parseEnvironmentLogicalEvidenceReferenceV1(value);
    if (azure?.kind === 'artifact' && azure.artifactKind === 'environment-capability-evidence') {
        const capability = parseEnvironmentCapabilityEvidenceSubjectV1(azure.subject);
        if (capability?.scope.kind === 'aws-account')
            return { provider: 'aws', ...azure, artifactKind: 'environment-capability-evidence', scope: capability.scope };
    }
    return azure ? { provider: 'azure', ...azure } : null;
};
export const isEnvironmentAnyLogicalEvidenceReferenceV1 = (value) => parseEnvironmentAnyLogicalEvidenceReferenceV1(value) !== null;
