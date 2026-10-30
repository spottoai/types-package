"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentAnyLogicalEvidenceReferenceV1 = exports.parseEnvironmentAnyLogicalEvidenceReferenceV1 = exports.environmentScopesEqualV1 = exports.parseEnvironmentAnyScopeQualifiedSubjectV1 = exports.buildEnvironmentAnyScopeQualifiedSubjectV1 = exports.isEnvironmentAnyScopeV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const tenant_js_1 = require("./tenant.js");
const awsIdentity_js_1 = require("./awsIdentity.js");
const awsReferences_js_1 = require("./awsReferences.js");
const canonicalization_js_1 = require("./canonicalization.js");
const references_js_1 = require("./references.js");
const validation_js_1 = require("./validation.js");
const internal_js_1 = require("./internal.js");
const capabilityIdentifiers_js_1 = require("./capabilityIdentifiers.js");
/** Provider dispatch does not widen the established Azure-specific guards. */
const isEnvironmentAnyScopeV1 = (value) => (0, validation_js_1.isEnvironmentScopeV1)(value) || (0, tenant_js_1.isEnvironmentTenantScopeV1)(value) || (0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(value);
exports.isEnvironmentAnyScopeV1 = isEnvironmentAnyScopeV1;
const buildEnvironmentAnyScopeQualifiedSubjectV1 = (scope) => {
    if (!(0, exports.isEnvironmentAnyScopeV1)(scope))
        throw new TypeError('Invalid environment scope.');
    if (scope.kind === 'aws-account')
        return (0, awsReferences_js_1.buildEnvironmentAwsAccountScopeQualifiedSubjectV1)(scope);
    if (scope.kind === 'azure-tenant')
        return (0, tenant_js_1.buildEnvironmentTenantScopeQualifiedSubjectV1)(scope);
    return (0, canonicalization_js_1.buildEnvironmentScopeQualifiedSubjectV1)(scope);
};
exports.buildEnvironmentAnyScopeQualifiedSubjectV1 = buildEnvironmentAnyScopeQualifiedSubjectV1;
const parseEnvironmentAnyScopeQualifiedSubjectV1 = (value) => {
    if (!(0, internal_js_1.isBoundedString)(value, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.customerStringScalars, { trimmed: true, controls: true }) ||
        (0, internal_js_1.utf8ByteLength)(value) > contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.logicalReferencePayloadBytes)
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
        return (0, exports.isEnvironmentAnyScopeV1)(scope) && (0, exports.buildEnvironmentAnyScopeQualifiedSubjectV1)(scope) === value ? scope : null;
    }
    catch {
        return null;
    }
};
exports.parseEnvironmentAnyScopeQualifiedSubjectV1 = parseEnvironmentAnyScopeQualifiedSubjectV1;
/** Exact identity equality; canonicalization and authorization remain caller responsibilities. */
const environmentScopesEqualV1 = (left, right) => (0, exports.isEnvironmentAnyScopeV1)(left) &&
    (0, exports.isEnvironmentAnyScopeV1)(right) &&
    (0, exports.buildEnvironmentAnyScopeQualifiedSubjectV1)(left) === (0, exports.buildEnvironmentAnyScopeQualifiedSubjectV1)(right);
exports.environmentScopesEqualV1 = environmentScopesEqualV1;
/** One parser for citation registries, API adapters and MCP; malformed input returns null. */
const parseEnvironmentAnyLogicalEvidenceReferenceV1 = (value) => {
    const aws = (0, awsReferences_js_1.parseEnvironmentAwsLogicalArtifactReferenceV1)(value) ?? (0, awsReferences_js_1.parseEnvironmentAwsLogicalResourceReferenceV1)(value);
    if (aws)
        return { provider: 'aws', ...aws };
    const azure = (0, references_js_1.parseEnvironmentLogicalEvidenceReferenceV1)(value);
    if (azure?.kind === 'artifact' && azure.artifactKind === 'environment-capability-evidence') {
        const capability = (0, capabilityIdentifiers_js_1.parseEnvironmentCapabilityEvidenceSubjectV1)(azure.subject);
        if (capability?.scope.kind === 'aws-account')
            return { provider: 'aws', ...azure, artifactKind: 'environment-capability-evidence', scope: capability.scope };
    }
    return azure ? { provider: 'azure', ...azure } : null;
};
exports.parseEnvironmentAnyLogicalEvidenceReferenceV1 = parseEnvironmentAnyLogicalEvidenceReferenceV1;
const isEnvironmentAnyLogicalEvidenceReferenceV1 = (value) => (0, exports.parseEnvironmentAnyLogicalEvidenceReferenceV1)(value) !== null;
exports.isEnvironmentAnyLogicalEvidenceReferenceV1 = isEnvironmentAnyLogicalEvidenceReferenceV1;
//# sourceMappingURL=any.js.map