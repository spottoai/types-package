"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnvironmentTreeDigestPreimageV1 = exports.buildEnvironmentScopeQualifiedSubjectV1 = void 0;
const validation_js_1 = require("./validation.js");
const compareUnicodeCodePoints = (left, right) => {
    const leftPoints = Array.from(left, character => character.codePointAt(0));
    const rightPoints = Array.from(right, character => character.codePointAt(0));
    const length = Math.min(leftPoints.length, rightPoints.length);
    for (let index = 0; index < length; index += 1) {
        const difference = leftPoints[index] - rightPoints[index];
        if (difference !== 0)
            return difference;
    }
    return leftPoints.length - rightPoints.length;
};
/**
 * Builds the canonical scope-qualified artifact subject used inside opaque
 * logical references. The JSON tuple is an identifier, never a storage path.
 */
const buildEnvironmentScopeQualifiedSubjectV1 = (scope) => {
    if (!(0, validation_js_1.isEnvironmentScopeV1)(scope))
        throw new TypeError('Invalid V1 environment scope.');
    return JSON.stringify([scope.kind, scope.tenantId, scope.companyId, scope.subscriptionId]);
};
exports.buildEnvironmentScopeQualifiedSubjectV1 = buildEnvironmentScopeQualifiedSubjectV1;
/**
 * Produces the exact compact UTF-8 tree-digest preimage. Hashing remains the
 * caller's responsibility so this helper stays browser-safe.
 */
const buildEnvironmentTreeDigestPreimageV1 = (descriptors) => {
    if (!(0, validation_js_1.isEnvironmentDocumentDescriptorSetV1)(descriptors)) {
        throw new TypeError('V1 environment tree digests require each allowlisted document exactly once.');
    }
    const pairs = descriptors
        .map(descriptor => [descriptor.name, descriptor.contentSha256])
        .sort((left, right) => compareUnicodeCodePoints(left[0], right[0]));
    return JSON.stringify(pairs);
};
exports.buildEnvironmentTreeDigestPreimageV1 = buildEnvironmentTreeDigestPreimageV1;
//# sourceMappingURL=canonicalization.js.map