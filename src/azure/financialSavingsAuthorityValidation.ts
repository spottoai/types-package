import { sha256Utf8 } from '../common/sha256';
import type { FinancialAuthorityViewV1 } from './financialAuthorityView';
import {
  FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1,
  FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1,
  type FinancialSavingsAuthorityIdentityPreimageV1,
  type FinancialSavingsAuthorityV1,
} from './financialSavingsAuthority';
import {
  validateFinancialEligibilityAssessmentV1,
  validateFinancialEligibilityBaselineV1,
  type FinancialEligibilityValidationContextV1,
} from './financialEligibilityAssessmentValidation';
import { validateFinancialSavingsCoordinateEnvelopeV1 } from './financialSavingsCoordinateValidation';
import type { FinancialEvidenceReferenceV1 } from './financialScopeEvidence';
import {
  canonicalizeFinancialSavingsJsonValue,
  hasExactFinancialSavingsFields,
  isFinancialSavingsHash,
  isFinancialSavingsRecord,
} from './financialSavingsAuthorityValidationPrimitives';

export {
  canonicalizeFinancialEligibilityAssessmentIdentityV1,
  createFinancialEligibilityAssessmentIdV1,
} from './financialEligibilityAssessmentValidation';
export {
  canonicalizeFinancialSavingsActivationIdentityV1,
  canonicalizeFinancialSavingsAllocationIdentityV1,
  canonicalizeFinancialSavingsDenominatorIdentityV1,
  createFinancialSavingsActivationIdV1,
  createFinancialSavingsAllocationIdV1,
  createFinancialSavingsDenominatorIdV1,
} from './financialSavingsCoordinateValidation';

export const canonicalizeFinancialSavingsAuthorityIdentityV1 = (value: FinancialSavingsAuthorityIdentityPreimageV1): string =>
  JSON.stringify(
    canonicalizeFinancialSavingsJsonValue({
      schemaVersion: value.schemaVersion,
      contractVersion: value.contractVersion,
      financialAuthorityId: value.financialAuthorityId,
      artifactGeneration: value.artifactGeneration,
      eligibilityBaselines: [...value.eligibilityBaselines].sort((left, right) => left.baselineId.localeCompare(right.baselineId)),
      eligibilityAssessments: [...value.eligibilityAssessments].sort((left, right) => left.eligibilityId.localeCompare(right.eligibilityId)),
      coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate =>
          coordinate.status === 'unavailable'
            ? coordinate
            : {
                ...coordinate,
                scenarioCoverage: {
                  ...coordinate.scenarioCoverage,
                  scenarioIds: [...coordinate.scenarioCoverage.scenarioIds].sort(),
                },
                activations: [...coordinate.activations].sort((left, right) => left.activationId.localeCompare(right.activationId)),
                allocations: [...coordinate.allocations]
                  .sort((left, right) => left.allocationId.localeCompare(right.allocationId))
                  .map(allocation => ({
                    ...allocation,
                    billableComponentIds: [...allocation.billableComponentIds].sort(),
                    eligibility:
                      allocation.eligibility.kind === 'not-applicable'
                        ? allocation.eligibility
                        : {
                            ...allocation.eligibility,
                            currentComponentIds: [...allocation.eligibility.currentComponentIds].sort(),
                            eligibilityComponentIds: [...allocation.eligibility.eligibilityComponentIds].sort(),
                          },
                  })),
                resourceContributions: [...coordinate.resourceContributions]
                  .sort((left, right) => left.ownerScopeId.localeCompare(right.ownerScopeId))
                  .map(contribution => ({ ...contribution, allocationIds: [...contribution.allocationIds].sort() })),
                aggregate: { ...coordinate.aggregate, allocationIds: [...coordinate.aggregate.allocationIds].sort() },
              }
        ),
    })
  );

export const createFinancialSavingsAuthorityIdV1 = (value: FinancialSavingsAuthorityIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialSavingsAuthorityIdentityV1(value))}`;

const buildEligibilityContext = (authority: FinancialAuthorityViewV1): FinancialEligibilityValidationContextV1 | undefined => {
  const bundleById = new Map(authority.evidenceBundles.map(bundle => [bundle.bundleId, bundle]));
  const assessmentById = new Map(authority.evidenceAssessments.map(assessment => [assessment.assessmentId, assessment]));
  if (bundleById.size !== authority.evidenceBundles.length || assessmentById.size !== authority.evidenceAssessments.length) return undefined;
  const evidenceById = new Map<string, FinancialEvidenceReferenceV1>();
  for (const reference of authority.evidenceBundles.flatMap(bundle => bundle.references)) {
    const existing = evidenceById.get(reference.evidenceRefId);
    if (
      existing &&
      JSON.stringify(canonicalizeFinancialSavingsJsonValue(existing)) !== JSON.stringify(canonicalizeFinancialSavingsJsonValue(reference))
    )
      return undefined;
    evidenceById.set(reference.evidenceRefId, reference);
  }
  return { authority, bundleById, assessmentById, evidenceById };
};

export const isFinancialSavingsAuthorityBoundToFinancialAuthorityV1 = (
  value: unknown,
  authority: FinancialAuthorityViewV1
): value is FinancialSavingsAuthorityV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(value, [
      'schemaVersion',
      'contractVersion',
      'savingsAuthorityId',
      'financialAuthorityId',
      'artifactGeneration',
      'eligibilityBaselines',
      'eligibilityAssessments',
      'coordinates',
    ]) ||
    value.schemaVersion !== FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1 ||
    value.contractVersion !== FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1 ||
    !isFinancialSavingsHash(value.savingsAuthorityId) ||
    value.financialAuthorityId !== authority.authorityId ||
    !isFinancialSavingsRecord(value.artifactGeneration) ||
    !hasExactFinancialSavingsFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
    value.artifactGeneration.runId !== authority.artifactGeneration.runId ||
    value.artifactGeneration.generatedAt !== authority.artifactGeneration.generatedAt ||
    !Array.isArray(value.eligibilityBaselines) ||
    value.eligibilityBaselines.length > 20_000 ||
    !Array.isArray(value.eligibilityAssessments) ||
    value.eligibilityAssessments.length > 20_000 ||
    !Array.isArray(value.coordinates) ||
    value.coordinates.length !== authority.coordinates.length ||
    value.coordinates.length === 0 ||
    value.coordinates.length > 128
  )
    return false;

  const context = buildEligibilityContext(authority);
  if (!context) return false;
  const savingsAuthority = value as unknown as FinancialSavingsAuthorityV1;
  if (!savingsAuthority.eligibilityBaselines.every(baseline => validateFinancialEligibilityBaselineV1(baseline, context))) return false;
  const eligibilityBaselineById = new Map(savingsAuthority.eligibilityBaselines.map(baseline => [baseline.baselineId, baseline]));
  if (eligibilityBaselineById.size !== savingsAuthority.eligibilityBaselines.length) return false;
  if (
    !savingsAuthority.eligibilityAssessments.every(assessment =>
      validateFinancialEligibilityAssessmentV1(assessment, context, eligibilityBaselineById)
    )
  )
    return false;
  const eligibilityById = new Map(savingsAuthority.eligibilityAssessments.map(assessment => [assessment.eligibilityId, assessment]));
  if (eligibilityById.size !== savingsAuthority.eligibilityAssessments.length) return false;

  const authorityCoordinateById = new Map(authority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
  if (
    new Set(savingsAuthority.coordinates.map(coordinate => coordinate.coordinateId)).size !== savingsAuthority.coordinates.length ||
    !savingsAuthority.coordinates.every(coordinate => {
      const authorityCoordinate = authorityCoordinateById.get(coordinate.coordinateId);
      return (
        authorityCoordinate !== undefined &&
        validateFinancialSavingsCoordinateEnvelopeV1(
          coordinate,
          authorityCoordinate,
          eligibilityById,
          context.evidenceById,
          authority.artifactGeneration.generatedAt,
          authority.artifactGeneration.runId
        )
      );
    })
  )
    return false;
  const { savingsAuthorityId: _savingsAuthorityId, ...identity } = savingsAuthority;
  return savingsAuthority.savingsAuthorityId === createFinancialSavingsAuthorityIdV1(identity);
};
