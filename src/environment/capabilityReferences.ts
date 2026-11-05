import type { EnvironmentCapabilityScopeV1 } from './optionalDocuments.js';
import { isEnvironmentCapabilityScopeV1, isEnvironmentCapabilityIdentifierV1 } from './optionalDocuments.js';
import { buildEnvironmentLogicalArtifactReferenceV1, parseEnvironmentLogicalArtifactReferenceV1 } from './references.js';

import { parseEnvironmentCapabilityEvidenceSubjectV1, type ParsedEnvironmentCapabilityEvidenceReferenceV1 } from './capabilityIdentifiers.js';
export type { ParsedEnvironmentCapabilityEvidenceReferenceV1 } from './capabilityIdentifiers.js';
export function buildEnvironmentCapabilityEvidenceReferenceV1(
  scope: EnvironmentCapabilityScopeV1,
  capabilityId: string,
  documentId: string,
  evidenceId: string
) {
  if (!isEnvironmentCapabilityScopeV1(scope) || ![capabilityId, documentId, evidenceId].every(isEnvironmentCapabilityIdentifierV1))
    throw new TypeError('Invalid capability evidence identity.');
  const tuple =
    scope.kind === 'azure-subscription'
      ? ['capability', scope.kind, scope.tenantId, scope.companyId, scope.subscriptionId, capabilityId, documentId, evidenceId]
      : scope.kind === 'aws-account'
        ? ['capability', scope.kind, scope.companyId, scope.accountId, capabilityId, documentId, evidenceId]
        : ['capability', scope.kind, scope.tenantId, capabilityId, documentId, evidenceId];
  return buildEnvironmentLogicalArtifactReferenceV1('environment-capability-evidence', JSON.stringify(tuple));
}
export function parseEnvironmentCapabilityEvidenceReferenceV1(value: unknown): ParsedEnvironmentCapabilityEvidenceReferenceV1 | null {
  const parsed = parseEnvironmentLogicalArtifactReferenceV1(value);
  return parsed?.artifactKind === 'environment-capability-evidence' ? parseEnvironmentCapabilityEvidenceSubjectV1(parsed.subject) : null;
}
