"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentCapabilityIdentifierV1 = void 0;
exports.parseEnvironmentCapabilityEvidenceSubjectV1 = parseEnvironmentCapabilityEvidenceSubjectV1;
const internal_js_1 = require("./internal.js");
const contracts_js_1 = require("./contracts.js");
const awsIdentity_js_1 = require("./awsIdentity.js");
/** Bounded identifiers are policy-neutral: API owns registered-feature authorization. */
const isEnvironmentCapabilityIdentifierV1 = (value) => typeof value === 'string' &&
    value.length <= 80 &&
    /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value) &&
    !['constructor', 'prototype', '__proto__'].includes(value);
exports.isEnvironmentCapabilityIdentifierV1 = isEnvironmentCapabilityIdentifierV1;
/** Canonical tuple parsing is independent of pointer/projection validators to keep ESM initialization acyclic. */
function parseEnvironmentCapabilityEvidenceSubjectV1(value) {
    try {
        const tuple = JSON.parse(value);
        if (!Array.isArray(tuple) || tuple[0] !== 'capability' || JSON.stringify(tuple) !== value)
            return null;
        const offset = tuple.length === 8 && tuple[1] === 'azure-subscription'
            ? 5
            : tuple.length === 6 && tuple[1] === 'azure-tenant'
                ? 3
                : tuple.length === 7 && tuple[1] === 'aws-account'
                    ? 4
                    : 0;
        if (!offset ||
            !tuple
                .slice(2, offset)
                .every(item => (0, internal_js_1.isBoundedString)(item, contracts_js_1.ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) ||
            !tuple.slice(offset).every(exports.isEnvironmentCapabilityIdentifierV1))
            return null;
        const scope = offset === 5
            ? { kind: 'azure-subscription', tenantId: tuple[2], companyId: tuple[3], subscriptionId: tuple[4] }
            : offset === 4
                ? { kind: 'aws-account', companyId: tuple[2], accountId: tuple[3] }
                : { kind: 'azure-tenant', tenantId: tuple[2] };
        if (offset === 4 && !(0, awsIdentity_js_1.isEnvironmentAwsAccountScopeV1)(scope))
            return null;
        return { scope, capabilityId: tuple[offset], documentId: tuple[offset + 1], evidenceId: tuple[offset + 2] };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=capabilityIdentifiers.js.map