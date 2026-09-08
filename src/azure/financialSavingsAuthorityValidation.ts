import { sha256Utf8 } from '../common/sha256';
import type { FinancialAuthorityResourceProjectionV1, FinancialAuthorityViewV1 } from './financialAuthorityView';
import {
  FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1,
  FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1,
  type FinancialSavingsAuthorityIdentityPreimageV1,
  type FinancialSavingsAuthorityV1,
  type FinancialSavingsResourceProjectionV1,
} from './financialSavingsAuthority';
import {
  validateFinancialEligibilityAssessmentV1,
  validateFinancialEligibilityBaselineV1,
  type FinancialEligibilityValidationContextV1,
} from './financialEligibilityAssessmentValidation';
import { validateFinancialSavingsCoordinateEnvelopeV1 } from './financialSavingsCoordinateValidation';
import { isFinancialChargeInclusionPolicyRefV1 } from './financialChargeCompositionValidation';
import type { FinancialEvidenceReferenceV1 } from './financialScopeEvidence';
import {
  canonicalizeFinancialSavingsJsonValue,
  hasExactFinancialSavingsFields,
  haveSameFinancialSavingsSet,
  isFinancialSavingsHash,
  isFinancialSavingsIdentity,
  isFinancialSavingsIsoInstant,
  isFinancialSavingsMinorUnits,
  isFinancialSavingsRecord,
  sumFinancialSavingsMinorUnits,
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
                      allocation.eligibility.kind !== 'mapped'
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
                recommendationContributions: [...coordinate.recommendationContributions]
                  .sort((left, right) =>
                    `${left.ownerScopeId}\u0000${left.recommendationId}`.localeCompare(
                      `${right.ownerScopeId}\u0000${right.recommendationId}`
                    )
                  )
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

const RESOURCE_PROJECTION_UNAVAILABLE_REASONS = new Set([
  'scenario-coverage-unproven',
  'unmigrated-scenario-producer',
  'projection-unavailable',
  'activation-unavailable',
  'allocation-unavailable',
]);
const RESOURCE_PROJECTION_CURRENCY = /^[A-Z]{3}$/;
const normalizeResourceScope = (value: string): string => value.trim().toLowerCase().replace(/\/+$/, '');

const isResourceContribution = (value: unknown, scopeId: string): value is {
  ownerScopeId: string;
  allocationIds: [string, ...string[]];
  savingsMinorUnits: number;
} =>
  isFinancialSavingsRecord(value) &&
  hasExactFinancialSavingsFields(value, ['ownerScopeId', 'allocationIds', 'savingsMinorUnits']) &&
  isFinancialSavingsIdentity(value.ownerScopeId) &&
  normalizeResourceScope(value.ownerScopeId) === scopeId &&
  Array.isArray(value.allocationIds) &&
  value.allocationIds.length > 0 &&
  value.allocationIds.length <= 20_000 &&
  value.allocationIds.every(isFinancialSavingsHash) &&
  new Set(value.allocationIds).size === value.allocationIds.length &&
  isFinancialSavingsMinorUnits(value.savingsMinorUnits);

const isRecommendationContribution = (value: unknown, scopeId: string): value is {
  ownerScopeId: string;
  recommendationId: string;
  allocationIds: [string, ...string[]];
  savingsMinorUnits: number;
} =>
  isFinancialSavingsRecord(value) &&
  hasExactFinancialSavingsFields(value, ['ownerScopeId', 'recommendationId', 'allocationIds', 'savingsMinorUnits']) &&
  isFinancialSavingsIdentity(value.ownerScopeId) &&
  normalizeResourceScope(value.ownerScopeId) === scopeId &&
  isFinancialSavingsIdentity(value.recommendationId) &&
  Array.isArray(value.allocationIds) &&
  value.allocationIds.length > 0 &&
  value.allocationIds.length <= 20_000 &&
  value.allocationIds.every(isFinancialSavingsHash) &&
  new Set(value.allocationIds).size === value.allocationIds.length &&
  isFinancialSavingsMinorUnits(value.savingsMinorUnits);

const isSavingsResourceCoordinate = (value: unknown, scopeId: string): boolean => {
  if (!isFinancialSavingsRecord(value) || !isFinancialSavingsHash(value.coordinateId)) return false;
  if (value.status === 'unavailable') {
    return (
      hasExactFinancialSavingsFields(
        value,
        ['status', 'coordinateId', 'unavailableReason'],
        ['currentAggregateBaselineId', 'chargeInclusionPolicyRef']
      ) &&
      (value.currentAggregateBaselineId === undefined || isFinancialSavingsHash(value.currentAggregateBaselineId)) &&
      (value.chargeInclusionPolicyRef === undefined || isFinancialChargeInclusionPolicyRefV1(value.chargeInclusionPolicyRef)) &&
      typeof value.unavailableReason === 'string' &&
      RESOURCE_PROJECTION_UNAVAILABLE_REASONS.has(value.unavailableReason)
    );
  }
  const partial = value.status === 'partial';
  if (
    value.status !== 'available' &&
    !partial
  ) return false;
  if (
    !hasExactFinancialSavingsFields(
      value,
      [
        'status',
        'coordinateId',
        'currentAggregateBaselineId',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'recommendationContributions',
        ...(partial ? ['unavailableScenarioIds'] : []),
      ],
      [
        'resourceContribution',
        'chargeInclusionPolicyRef',
        'displayMemberResourceContributions',
        'displayMemberRecommendationContributions',
      ]
    ) ||
    !isFinancialSavingsHash(value.currentAggregateBaselineId) ||
    (value.chargeInclusionPolicyRef !== undefined && !isFinancialChargeInclusionPolicyRefV1(value.chargeInclusionPolicyRef)) ||
    typeof value.accountingCurrencyCode !== 'string' ||
    !RESOURCE_PROJECTION_CURRENCY.test(value.accountingCurrencyCode) ||
    !Number.isSafeInteger(value.minorUnitScale) ||
    Number(value.minorUnitScale) < 0 ||
    Number(value.minorUnitScale) > 6 ||
    value.roundingMode !== 'half-away-from-zero' ||
    (value.resourceContribution !== undefined && !isResourceContribution(value.resourceContribution, scopeId)) ||
    !Array.isArray(value.recommendationContributions) ||
    value.recommendationContributions.length > 20_000 ||
    !value.recommendationContributions.every(contribution => isRecommendationContribution(contribution, scopeId)) ||
    (value.displayMemberResourceContributions !== undefined &&
      (!Array.isArray(value.displayMemberResourceContributions) ||
        value.displayMemberResourceContributions.length === 0 ||
        value.displayMemberResourceContributions.length > 20_000 ||
        !value.displayMemberResourceContributions.every(
          contribution =>
            isFinancialSavingsRecord(contribution) &&
            isResourceContribution(contribution, normalizeResourceScope(String(contribution.ownerScopeId))) &&
            normalizeResourceScope(String(contribution.ownerScopeId)) !== scopeId
        ))) ||
    (value.displayMemberRecommendationContributions !== undefined &&
      (!Array.isArray(value.displayMemberRecommendationContributions) ||
        value.displayMemberRecommendationContributions.length === 0 ||
        value.displayMemberRecommendationContributions.length > 20_000 ||
        !value.displayMemberRecommendationContributions.every(
          contribution =>
            isFinancialSavingsRecord(contribution) &&
            isRecommendationContribution(contribution, normalizeResourceScope(String(contribution.ownerScopeId))) &&
            normalizeResourceScope(String(contribution.ownerScopeId)) !== scopeId
        ))) ||
    (partial &&
      (!Array.isArray(value.unavailableScenarioIds) ||
        value.unavailableScenarioIds.length === 0 ||
        value.unavailableScenarioIds.length > 20_000 ||
        !value.unavailableScenarioIds.every(isFinancialSavingsIdentity) ||
        new Set(value.unavailableScenarioIds).size !== value.unavailableScenarioIds.length))
  )
    return false;

  const recommendationIds = value.recommendationContributions.map(contribution => contribution.recommendationId);
  const allocationIds = value.recommendationContributions.flatMap(contribution => contribution.allocationIds);
  const contributionSum = sumFinancialSavingsMinorUnits(
    value.recommendationContributions.map(contribution => contribution.savingsMinorUnits)
  );
  const resourceContribution = value.resourceContribution;
  const primaryValid =
    new Set(recommendationIds).size === recommendationIds.length &&
    new Set(allocationIds).size === allocationIds.length &&
    contributionSum !== undefined &&
    (resourceContribution === undefined
      ? allocationIds.length === 0 && contributionSum === 0
      : haveSameFinancialSavingsSet(allocationIds, resourceContribution.allocationIds) &&
        contributionSum === resourceContribution.savingsMinorUnits);
  if (!primaryValid) return false;

  const displayResourceContributions = (value.displayMemberResourceContributions ?? []) as Array<{
    ownerScopeId: string;
    allocationIds: [string, ...string[]];
    savingsMinorUnits: number;
  }>;
  const displayRecommendationContributions = (value.displayMemberRecommendationContributions ?? []) as Array<{
    ownerScopeId: string;
    recommendationId: string;
    allocationIds: [string, ...string[]];
    savingsMinorUnits: number;
  }>;
  const displayResourceByOwner = new Map(
    displayResourceContributions.map(contribution => [normalizeResourceScope(contribution.ownerScopeId), contribution])
  );
  if (displayResourceByOwner.size !== displayResourceContributions.length) return false;
  const displayRecommendationKeys = displayRecommendationContributions.map(
    contribution => `${normalizeResourceScope(contribution.ownerScopeId)}\u0000${contribution.recommendationId}`
  );
  if (new Set(displayRecommendationKeys).size !== displayRecommendationKeys.length) return false;
  const displayAllocationIds = displayRecommendationContributions.flatMap(contribution => contribution.allocationIds);
  if (
    new Set(displayAllocationIds).size !== displayAllocationIds.length ||
    displayAllocationIds.some(allocationId => allocationIds.includes(allocationId))
  )
    return false;
  for (const [ownerScopeId, contribution] of displayResourceByOwner) {
    const recommendations = displayRecommendationContributions.filter(
      candidate => normalizeResourceScope(candidate.ownerScopeId) === ownerScopeId
    );
    const recommendationAllocationIds = recommendations.flatMap(candidate => candidate.allocationIds);
    const recommendationSavings = sumFinancialSavingsMinorUnits(recommendations.map(candidate => candidate.savingsMinorUnits));
    if (
      recommendationSavings === undefined ||
      recommendationSavings !== contribution.savingsMinorUnits ||
      !haveSameFinancialSavingsSet(recommendationAllocationIds, contribution.allocationIds)
    )
      return false;
  }
  return displayRecommendationContributions.every(contribution =>
    displayResourceByOwner.has(normalizeResourceScope(contribution.ownerScopeId))
  );
};

/** Strict structural and arithmetic validation for one bounded resource savings projection. */
export const isFinancialSavingsResourceProjectionV1 = (value: unknown): value is FinancialSavingsResourceProjectionV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(value, [
      'contractVersion',
      'savingsAuthorityId',
      'financialAuthorityId',
      'artifactGeneration',
      'scopeId',
      'coordinates',
    ]) ||
    value.contractVersion !== 'financial-savings-resource-projection/v1' ||
    !isFinancialSavingsHash(value.savingsAuthorityId) ||
    !isFinancialSavingsHash(value.financialAuthorityId) ||
    !isFinancialSavingsRecord(value.artifactGeneration) ||
    !hasExactFinancialSavingsFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
    !isFinancialSavingsIdentity(value.artifactGeneration.runId) ||
    !isFinancialSavingsIsoInstant(value.artifactGeneration.generatedAt) ||
    !isFinancialSavingsIdentity(value.scopeId) ||
    value.scopeId !== normalizeResourceScope(value.scopeId) ||
    !Array.isArray(value.coordinates) ||
    value.coordinates.length === 0 ||
    value.coordinates.length > 128
  )
    return false;
  const projection = value as unknown as FinancialSavingsResourceProjectionV1;
  return (
    projection.coordinates.every(coordinate => isSavingsResourceCoordinate(coordinate, projection.scopeId)) &&
    new Set(projection.coordinates.map(coordinate => coordinate.coordinateId)).size === projection.coordinates.length
  );
};

/** Verifies that the bounded savings projection is the exact companion of one bounded Financial Authority projection. */
export const isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1 = (
  value: unknown,
  financialProjection: FinancialAuthorityResourceProjectionV1
): value is FinancialSavingsResourceProjectionV1 => {
  if (!isFinancialSavingsResourceProjectionV1(value)) return false;
  const financialCoordinateIds = financialProjection.coordinates.map(coordinate => coordinate.coordinateId);
  const displayOwnerScopeIdsByCoordinate = new Map(
    financialProjection.coordinates.map(coordinate => [
      coordinate.coordinateId,
      new Set((coordinate.displayMemberBaselines ?? []).map(baseline => normalizeResourceScope(baseline.scopeId))),
    ])
  );
  return (
    value.financialAuthorityId === financialProjection.authorityId &&
    normalizeResourceScope(value.scopeId) === normalizeResourceScope(financialProjection.scopeId) &&
    value.artifactGeneration.runId === financialProjection.artifactGeneration.runId &&
    value.artifactGeneration.generatedAt === financialProjection.artifactGeneration.generatedAt &&
    haveSameFinancialSavingsSet(
      value.coordinates.map(coordinate => coordinate.coordinateId),
      financialCoordinateIds
    ) &&
    value.coordinates.every(coordinate => {
      if (coordinate.status === 'unavailable') return true;
      const allowedDisplayOwners = displayOwnerScopeIdsByCoordinate.get(coordinate.coordinateId);
      if (!allowedDisplayOwners) return false;
      return (
        (coordinate.displayMemberResourceContributions ?? []).every(contribution =>
          allowedDisplayOwners.has(normalizeResourceScope(contribution.ownerScopeId))
        ) &&
        (coordinate.displayMemberRecommendationContributions ?? []).every(contribution =>
          allowedDisplayOwners.has(normalizeResourceScope(contribution.ownerScopeId))
        )
      );
    })
  );
};
