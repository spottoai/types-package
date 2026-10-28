import type { EnvironmentCapabilityScopeV1 } from './optionalDocuments.js';
import { isBoundedString } from './internal.js';
import { ENVIRONMENT_CONTRACT_LIMITS_V1 } from './contracts.js';
/** Bounded identifiers are policy-neutral: API owns registered-feature authorization. */
export const isEnvironmentCapabilityIdentifierV1 = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 80 &&
  /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value) &&
  !['constructor', 'prototype', '__proto__'].includes(value);

export interface ParsedEnvironmentCapabilityEvidenceReferenceV1 {
  scope: EnvironmentCapabilityScopeV1;
  capabilityId: string;
  documentId: string;
  evidenceId: string;
}
/** Canonical tuple parsing is independent of pointer/projection validators to keep ESM initialization acyclic. */
export function parseEnvironmentCapabilityEvidenceSubjectV1(value: string): ParsedEnvironmentCapabilityEvidenceReferenceV1 | null {
  try {
    const tuple: unknown = JSON.parse(value);
    if (!Array.isArray(tuple) || tuple[0] !== 'capability' || JSON.stringify(tuple) !== value) return null;
    const offset = tuple.length === 8 && tuple[1] === 'azure-subscription' ? 5 : tuple.length === 6 && tuple[1] === 'azure-tenant' ? 3 : 0;
    if (
      !offset ||
      !tuple
        .slice(2, offset)
        .every(item => isBoundedString(item, ENVIRONMENT_CONTRACT_LIMITS_V1.scopeIdentifierScalars, { trimmed: true, controls: true })) ||
      !tuple.slice(offset).every(isEnvironmentCapabilityIdentifierV1)
    )
      return null;
    const scope: EnvironmentCapabilityScopeV1 =
      offset === 5
        ? { kind: 'azure-subscription', tenantId: tuple[2], companyId: tuple[3], subscriptionId: tuple[4] }
        : { kind: 'azure-tenant', tenantId: tuple[2] };
    return { scope, capabilityId: tuple[offset], documentId: tuple[offset + 1], evidenceId: tuple[offset + 2] };
  } catch {
    return null;
  }
}
