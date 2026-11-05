import { isBoundedString } from './internal.js';
import { ENVIRONMENT_CONTRACT_LIMITS_V1 } from './contracts.js';
import { isEnvironmentAwsAccountScopeV1 } from './awsIdentity.js';
/** Bounded identifiers are policy-neutral: API owns registered-feature authorization. */
export const isEnvironmentCapabilityIdentifierV1 = (value) => typeof value === 'string' &&
    value.length <= 80 &&
    /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value) &&
    !['constructor', 'prototype', '__proto__'].includes(value);
/** Canonical tuple parsing is independent of pointer/projection validators to keep ESM initialization acyclic. */
export function parseEnvironmentCapabilityEvidenceSubjectV1(value) {
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
                .every(item => isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) ||
            !tuple.slice(offset).every(isEnvironmentCapabilityIdentifierV1))
            return null;
        const scope = offset === 5
            ? { kind: 'azure-subscription', tenantId: tuple[2], companyId: tuple[3], subscriptionId: tuple[4] }
            : offset === 4
                ? { kind: 'aws-account', companyId: tuple[2], accountId: tuple[3] }
                : { kind: 'azure-tenant', tenantId: tuple[2] };
        if (offset === 4 && !isEnvironmentAwsAccountScopeV1(scope))
            return null;
        return { scope, capabilityId: tuple[offset], documentId: tuple[offset + 1], evidenceId: tuple[offset + 2] };
    }
    catch {
        return null;
    }
}
