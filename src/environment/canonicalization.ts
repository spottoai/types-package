import type { EnvironmentDocumentDescriptorV1, EnvironmentScopeV1 } from './contracts.js';
import { isEnvironmentDocumentDescriptorSetV1, isEnvironmentScopeV1 } from './validation.js';

const compareUnicodeCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, character => character.codePointAt(0) as number);
  const rightPoints = Array.from(right, character => character.codePointAt(0) as number);
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftPoints[index] as number) - (rightPoints[index] as number);
    if (difference !== 0) return difference;
  }
  return leftPoints.length - rightPoints.length;
};

/**
 * Builds the canonical scope-qualified artifact subject used inside opaque
 * logical references. The JSON tuple is an identifier, never a storage path.
 */
export const buildEnvironmentScopeQualifiedSubjectV1 = (scope: EnvironmentScopeV1): string => {
  if (!isEnvironmentScopeV1(scope)) throw new TypeError('Invalid V1 environment scope.');
  return JSON.stringify([scope.kind, scope.tenantId, scope.companyId, scope.subscriptionId]);
};

/**
 * Produces the exact compact UTF-8 tree-digest preimage. Hashing remains the
 * caller's responsibility so this helper stays browser-safe.
 */
export const buildEnvironmentTreeDigestPreimageV1 = (descriptors: readonly EnvironmentDocumentDescriptorV1[]): string => {
  if (!isEnvironmentDocumentDescriptorSetV1(descriptors)) {
    throw new TypeError('V1 environment tree digests require each allowlisted document exactly once.');
  }
  const pairs = descriptors
    .map(descriptor => [descriptor.name, descriptor.contentSha256] as const)
    .sort((left, right) => compareUnicodeCodePoints(left[0], right[0]));
  return JSON.stringify(pairs);
};
