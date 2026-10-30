"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentAwsArtifactKindV1 = exports.isEnvironmentAwsLogicalEvidenceReferenceV1 = exports.isEnvironmentAwsLogicalResourceReferenceV1 = exports.isEnvironmentAwsLogicalArtifactReferenceV1 = exports.parseEnvironmentAwsLogicalResourceReferenceV1 = exports.parseEnvironmentAwsLogicalArtifactReferenceV1 = exports.buildEnvironmentAwsLogicalResourceReferenceV1 = exports.buildEnvironmentAwsLogicalArtifactReferenceV1 = exports.buildEnvironmentAwsAccountScopeQualifiedSubjectV1 = void 0;
const awsContracts_js_1 = require("./awsContracts.js");
const awsIdentity_js_1 = require("./awsIdentity.js");
const referenceEncoding_js_1 = require("./referenceEncoding.js");
const ARTIFACT_PREFIX = 'spotto://artifact/v1/';
const RESOURCE_PREFIX = 'spotto://resource/v1/aws/';
const ARTIFACT_KINDS = new Set(awsContracts_js_1.ENVIRONMENT_AWS_ARTIFACT_KINDS_V1);
/** Canonical scope-qualified identifier, never a path or authorization grant. */
const buildEnvironmentAwsAccountScopeQualifiedSubjectV1 = (scope) => {
    if (!(0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(scope))
        throw new TypeError('Invalid AWS account environment scope.');
    return JSON.stringify([scope.kind, scope.companyId, scope.accountId]);
};
exports.buildEnvironmentAwsAccountScopeQualifiedSubjectV1 = buildEnvironmentAwsAccountScopeQualifiedSubjectV1;
const buildEnvironmentAwsLogicalArtifactReferenceV1 = (artifactKind, scope) => {
    if (!(0, exports.isEnvironmentAwsArtifactKindV1)(artifactKind))
        throw new TypeError('Unsupported AWS environment artifact kind.');
    return `${ARTIFACT_PREFIX}${artifactKind}/${(0, referenceEncoding_js_1.encodeEnvironmentReferencePayload)((0, exports.buildEnvironmentAwsAccountScopeQualifiedSubjectV1)(scope))}`;
};
exports.buildEnvironmentAwsLogicalArtifactReferenceV1 = buildEnvironmentAwsLogicalArtifactReferenceV1;
const buildEnvironmentAwsLogicalResourceReferenceV1 = (scope, resourceType, resourceId) => {
    if (!(0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(scope) || !(0, awsIdentity_js_1.isEnvironmentAwsResourceTypeV1)(resourceType) || !(0, awsIdentity_js_1.isEnvironmentAwsResourceIdV1)(scope, resourceId))
        throw new TypeError('Invalid or foreign AWS environment resource identity.');
    return `${RESOURCE_PREFIX}${(0, referenceEncoding_js_1.encodeEnvironmentReferencePayload)(JSON.stringify([scope.kind, scope.companyId, scope.accountId, resourceType, resourceId]))}`;
};
exports.buildEnvironmentAwsLogicalResourceReferenceV1 = buildEnvironmentAwsLogicalResourceReferenceV1;
const decodeTuple = (encoded, length) => {
    const decoded = (0, referenceEncoding_js_1.decodeEnvironmentReferencePayload)(encoded);
    if (decoded === null)
        return null;
    try {
        const tuple = JSON.parse(decoded);
        return Array.isArray(tuple) && tuple.length === length && JSON.stringify(tuple) === decoded ? tuple : null;
    }
    catch {
        return null;
    }
};
const tupleScope = (tuple) => {
    const scope = { kind: tuple[0], companyId: tuple[1], accountId: tuple[2] };
    return (0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(scope) ? scope : null;
};
const parseEnvironmentAwsLogicalArtifactReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(ARTIFACT_PREFIX))
        return null;
    const remainder = value.slice(ARTIFACT_PREFIX.length);
    const separator = remainder.indexOf('/');
    const artifactKind = remainder.slice(0, separator);
    if (separator < 1 || !ARTIFACT_KINDS.has(artifactKind))
        return null;
    const tuple = decodeTuple(remainder.slice(separator + 1), 3);
    const scope = tuple && tupleScope(tuple);
    return scope ? { kind: 'artifact', artifactKind: artifactKind, scope } : null;
};
exports.parseEnvironmentAwsLogicalArtifactReferenceV1 = parseEnvironmentAwsLogicalArtifactReferenceV1;
const parseEnvironmentAwsLogicalResourceReferenceV1 = (value) => {
    if (typeof value !== 'string' || !value.startsWith(RESOURCE_PREFIX))
        return null;
    const tuple = decodeTuple(value.slice(RESOURCE_PREFIX.length), 5);
    const scope = tuple && tupleScope(tuple);
    if (!tuple || !scope || !(0, awsIdentity_js_1.isEnvironmentAwsResourceTypeV1)(tuple[3]) || !(0, awsIdentity_js_1.isEnvironmentAwsResourceIdV1)(scope, tuple[4]))
        return null;
    return { kind: 'resource', scope, resourceType: tuple[3], resourceId: tuple[4] };
};
exports.parseEnvironmentAwsLogicalResourceReferenceV1 = parseEnvironmentAwsLogicalResourceReferenceV1;
const isEnvironmentAwsLogicalArtifactReferenceV1 = (value) => (0, exports.parseEnvironmentAwsLogicalArtifactReferenceV1)(value) !== null;
exports.isEnvironmentAwsLogicalArtifactReferenceV1 = isEnvironmentAwsLogicalArtifactReferenceV1;
const isEnvironmentAwsLogicalResourceReferenceV1 = (value) => (0, exports.parseEnvironmentAwsLogicalResourceReferenceV1)(value) !== null;
exports.isEnvironmentAwsLogicalResourceReferenceV1 = isEnvironmentAwsLogicalResourceReferenceV1;
const isEnvironmentAwsLogicalEvidenceReferenceV1 = (value) => (0, exports.isEnvironmentAwsLogicalArtifactReferenceV1)(value) || (0, exports.isEnvironmentAwsLogicalResourceReferenceV1)(value);
exports.isEnvironmentAwsLogicalEvidenceReferenceV1 = isEnvironmentAwsLogicalEvidenceReferenceV1;
/** Non-throwing kind admission for compiler and provider-neutral consumers. */
const isEnvironmentAwsArtifactKindV1 = (value) => typeof value === 'string' && ARTIFACT_KINDS.has(value);
exports.isEnvironmentAwsArtifactKindV1 = isEnvironmentAwsArtifactKindV1;
//# sourceMappingURL=awsReferences.js.map