import { sha256Utf8 } from '../common/sha256';
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
import {
  FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1,
  type FinancialSavingsSurfaceProjectionIdentityPreimageV1,
  type FinancialSavingsSurfaceProjectionV1,
} from './financialSavingsSurfaceProjection';
import { isFinancialBaselinePeriodV2 } from './financialScopeBaselineValidation';
import { isFinancialChargeInclusionPolicyRefV1 } from './financialChargeCompositionValidation';
import { isCanonicalExactMoney } from './financialValidationPrimitives';

const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const UNAVAILABLE_REASONS = new Set([
  'scenario-coverage-unproven',
  'unmigrated-scenario-producer',
  'projection-unavailable',
  'activation-unavailable',
  'allocation-unavailable',
]);
const CURRENCY = /^[A-Z]{3}$/;
const MAX_COORDINATES = 128;
const MAX_ALLOCATIONS = 20_000;

export const canonicalizeFinancialSavingsSurfaceProjectionIdentityV1 = (value: FinancialSavingsSurfaceProjectionIdentityPreimageV1): string =>
  JSON.stringify(
    canonicalizeFinancialSavingsJsonValue({
      ...value,
      providerAccountRefs: [...value.providerAccountRefs].sort(),
      ...(value.lifecycleBindings === undefined
        ? {}
        : {
            lifecycleBindings: [...value.lifecycleBindings]
              .sort(
                (left, right) =>
                  left.resourceId.localeCompare(right.resourceId) || left.recommendationId.localeCompare(right.recommendationId)
              )
              .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds].sort() })),
          }),
      scope:
        value.scope.kind === 'subscription-full'
          ? value.scope
          : value.scope.kind === 'recommendation-query'
            ? { ...value.scope, recommendationIds: [...value.scope.recommendationIds].sort() }
            : {
                ...value.scope,
                allocationIds: [...value.scope.allocationIds].sort(),
                recommendationIds: [...value.scope.recommendationIds].sort(),
              },
      coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate =>
          coordinate.status === 'unavailable'
            ? coordinate
            : {
                ...coordinate,
                recommendationContributions: [...coordinate.recommendationContributions]
                  .sort((left, right) => left.recommendationId.localeCompare(right.recommendationId))
                  .map(contribution => ({
                    ...contribution,
                    allocationIds: [...contribution.allocationIds].sort(),
                    ...(contribution.allocations === undefined
                      ? {}
                      : {
                          allocations: [...contribution.allocations].sort((left, right) =>
                            left.allocationId.localeCompare(right.allocationId)
                          ),
                        }),
                  })),
                aggregate: { ...coordinate.aggregate, allocationIds: [...coordinate.aggregate.allocationIds].sort() },
              }
        ),
    })
  );

export const createFinancialSavingsSurfaceProjectionIdV1 = (value: FinancialSavingsSurfaceProjectionIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialSavingsSurfaceProjectionIdentityV1(value))}`;

const isCurrency = (value: unknown): value is string => typeof value === 'string' && CURRENCY.test(value);

const isScope = (value: unknown): boolean => {
  if (!isFinancialSavingsRecord(value)) return false;
  if (value.kind === 'subscription-full') return hasExactFinancialSavingsFields(value, ['kind']);
  if (
    value.kind === 'recommendation-query' &&
    hasExactFinancialSavingsFields(value, ['kind', 'filterFingerprint', 'recommendationIds']) &&
    isFinancialSavingsHash(value.filterFingerprint) &&
    Array.isArray(value.recommendationIds) &&
    value.recommendationIds.length <= MAX_ALLOCATIONS &&
    value.recommendationIds.every(isFinancialSavingsIdentity) &&
    new Set(value.recommendationIds).size === value.recommendationIds.length
  ) return true;
  return (
    value.kind === 'resource-query' &&
    hasExactFinancialSavingsFields(value, ['kind', 'filterFingerprint', 'allocationIds', 'recommendationIds']) &&
    isFinancialSavingsHash(value.filterFingerprint) &&
    Array.isArray(value.allocationIds) &&
    value.allocationIds.length <= MAX_ALLOCATIONS &&
    value.allocationIds.every(isFinancialSavingsHash) &&
    new Set(value.allocationIds).size === value.allocationIds.length &&
    Array.isArray(value.recommendationIds) &&
    value.recommendationIds.length <= MAX_ALLOCATIONS &&
    value.recommendationIds.every(isFinancialSavingsIdentity) &&
    new Set(value.recommendationIds).size === value.recommendationIds.length
  );
};

const isCoordinateCommon = (value: Record<string, unknown>): boolean =>
  isFinancialSavingsHash(value.coordinateId) &&
  (value.periodRole === 'current' || value.periodRole === 'previous') &&
  isFinancialBaselinePeriodV2(value.period) &&
  typeof value.costBasis === 'string' &&
  COST_BASES.has(value.costBasis) &&
  typeof value.estimateLens === 'string' &&
  ESTIMATE_LENSES.has(value.estimateLens) &&
  isFinancialChargeInclusionPolicyRefV1(value.chargeInclusionPolicyRef) &&
  (value.requestedCurrencyCode === undefined || isCurrency(value.requestedCurrencyCode)) &&
  (value.currentAggregateBaselineId === undefined || isFinancialSavingsHash(value.currentAggregateBaselineId));

const isLifecycleBinding = (value: unknown): boolean =>
  isFinancialSavingsRecord(value) &&
  hasExactFinancialSavingsFields(value, ['resourceId', 'recommendationId', 'allocationIds']) &&
  isFinancialSavingsIdentity(value.resourceId) &&
  isFinancialSavingsIdentity(value.recommendationId) &&
  Array.isArray(value.allocationIds) &&
  value.allocationIds.length > 0 &&
  value.allocationIds.length <= MAX_ALLOCATIONS &&
  value.allocationIds.every(isFinancialSavingsHash) &&
  new Set(value.allocationIds).size === value.allocationIds.length;

const isComposedCoordinate = (
  value: Record<string, unknown>,
  queryRecommendationIds?: Set<string>,
  queryAllocationIds?: Set<string>
): boolean => {
  const partial = value.status === 'partial';
  if (
    !hasExactFinancialSavingsFields(
      value,
      [
        'status',
        'coordinateId',
        'periodRole',
        'period',
        'costBasis',
        'estimateLens',
        'chargeInclusionPolicyRef',
        'currentAggregateBaselineId',
        'currentAggregate',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'recommendationContributions',
        'aggregate',
        ...(partial ? ['unavailableRecommendationIds'] : []),
      ],
      ['requestedCurrencyCode']
    ) ||
    !isCoordinateCommon(value) ||
    !isFinancialSavingsHash(value.currentAggregateBaselineId) ||
    !isCanonicalExactMoney(value.currentAggregate) ||
    !isCurrency(value.accountingCurrencyCode) ||
    value.currentAggregate.currencyCode !== value.accountingCurrencyCode ||
    !Number.isSafeInteger(value.minorUnitScale) ||
    Number(value.minorUnitScale) < 0 ||
    Number(value.minorUnitScale) > 6 ||
    value.roundingMode !== 'half-away-from-zero' ||
    !Array.isArray(value.recommendationContributions) ||
    value.recommendationContributions.length > MAX_ALLOCATIONS ||
    !isFinancialSavingsRecord(value.aggregate) ||
    !hasExactFinancialSavingsFields(value.aggregate, ['allocationIds', 'savingsMinorUnits']) ||
    !Array.isArray(value.aggregate.allocationIds) ||
    value.aggregate.allocationIds.length > MAX_ALLOCATIONS ||
    !value.aggregate.allocationIds.every(isFinancialSavingsHash) ||
    new Set(value.aggregate.allocationIds).size !== value.aggregate.allocationIds.length ||
    !isFinancialSavingsMinorUnits(value.aggregate.savingsMinorUnits)
  )
    return false;

  if (
    partial &&
    (!Array.isArray(value.unavailableRecommendationIds) ||
      value.unavailableRecommendationIds.length === 0 ||
      value.unavailableRecommendationIds.length > MAX_ALLOCATIONS ||
      !value.unavailableRecommendationIds.every(isFinancialSavingsIdentity) ||
      new Set(value.unavailableRecommendationIds).size !== value.unavailableRecommendationIds.length ||
      (queryRecommendationIds !== undefined && value.unavailableRecommendationIds.some(id => !queryRecommendationIds.has(id))))
  )
    return false;

  const recommendationIds = new Set<string>();
  const allocationIds: string[] = [];
  const contributionAmounts: number[] = [];
  for (const contribution of value.recommendationContributions) {
    if (
      !isFinancialSavingsRecord(contribution) ||
      !hasExactFinancialSavingsFields(
        contribution,
        ['recommendationId', 'allocationIds', 'savingsMinorUnits'],
        ['allocations']
      ) ||
      !isFinancialSavingsIdentity(contribution.recommendationId) ||
      recommendationIds.has(contribution.recommendationId) ||
      (queryRecommendationIds !== undefined && !queryRecommendationIds.has(contribution.recommendationId)) ||
      !Array.isArray(contribution.allocationIds) ||
      contribution.allocationIds.length === 0 ||
      contribution.allocationIds.length > MAX_ALLOCATIONS ||
      !contribution.allocationIds.every(isFinancialSavingsHash) ||
      new Set(contribution.allocationIds).size !== contribution.allocationIds.length ||
      !isFinancialSavingsMinorUnits(contribution.savingsMinorUnits) ||
      (queryAllocationIds !== undefined && !Array.isArray(contribution.allocations)) ||
      (contribution.allocations !== undefined &&
        (!Array.isArray(contribution.allocations) || contribution.allocations.length !== contribution.allocationIds.length))
    )
      return false;
    const exactAllocations = contribution.allocations as unknown[] | undefined;
    if (exactAllocations === undefined) {
      recommendationIds.add(contribution.recommendationId);
      allocationIds.push(...(contribution.allocationIds as string[]));
      contributionAmounts.push(contribution.savingsMinorUnits);
      continue;
    }
    const exactAllocationIds: string[] = [];
    const exactAllocationAmounts: number[] = [];
    for (const allocation of exactAllocations) {
      if (
        !isFinancialSavingsRecord(allocation) ||
        !hasExactFinancialSavingsFields(allocation, ['allocationId', 'savingsMinorUnits']) ||
        !isFinancialSavingsHash(allocation.allocationId) ||
        (queryAllocationIds !== undefined && !queryAllocationIds.has(allocation.allocationId)) ||
        !isFinancialSavingsMinorUnits(allocation.savingsMinorUnits)
      ) return false;
      exactAllocationIds.push(allocation.allocationId);
      exactAllocationAmounts.push(allocation.savingsMinorUnits);
    }
    if (
      new Set(exactAllocationIds).size !== exactAllocationIds.length ||
      !haveSameFinancialSavingsSet(exactAllocationIds, contribution.allocationIds) ||
      sumFinancialSavingsMinorUnits(exactAllocationAmounts) !== contribution.savingsMinorUnits
    ) return false;
    recommendationIds.add(contribution.recommendationId);
    allocationIds.push(...contribution.allocationIds);
    contributionAmounts.push(contribution.savingsMinorUnits);
  }

  return (
    new Set(allocationIds).size === allocationIds.length &&
    haveSameFinancialSavingsSet(allocationIds, value.aggregate.allocationIds) &&
    sumFinancialSavingsMinorUnits(contributionAmounts) === value.aggregate.savingsMinorUnits
  );
};

const isUnavailableCoordinate = (value: Record<string, unknown>): boolean =>
  hasExactFinancialSavingsFields(
    value,
    ['status', 'coordinateId', 'periodRole', 'period', 'costBasis', 'estimateLens', 'chargeInclusionPolicyRef', 'unavailableReason'],
    ['requestedCurrencyCode', 'currentAggregateBaselineId']
  ) &&
  isCoordinateCommon(value) &&
  typeof value.unavailableReason === 'string' &&
  UNAVAILABLE_REASONS.has(value.unavailableReason);

export const isFinancialSavingsSurfaceProjectionV1 = (value: unknown): value is FinancialSavingsSurfaceProjectionV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(value, [
      'schemaVersion',
      'contractVersion',
      'projectionId',
      'surface',
      'scope',
      'provider',
      'providerAccountRefs',
      'artifactGeneration',
      'financialAuthorityId',
      'savingsAuthorityId',
      'coordinates',
    ], ['lifecycleBindings']) ||
    value.schemaVersion !== FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
    value.contractVersion !== FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
    !isFinancialSavingsHash(value.projectionId) ||
    (value.surface !== 'recommendations' && value.surface !== 'resources' && value.surface !== 'dashboard') ||
    !isScope(value.scope) ||
    (value.surface === 'dashboard' && (value.scope as { kind?: unknown }).kind !== 'subscription-full') ||
    (value.surface === 'recommendations' && (value.scope as { kind?: unknown }).kind === 'resource-query') ||
    (value.surface === 'resources' && (value.scope as { kind?: unknown }).kind === 'recommendation-query') ||
    value.provider !== 'azure' ||
    !Array.isArray(value.providerAccountRefs) ||
    value.providerAccountRefs.length === 0 ||
    value.providerAccountRefs.length > 64 ||
    !value.providerAccountRefs.every(isFinancialSavingsIdentity) ||
    new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
    !isFinancialSavingsRecord(value.artifactGeneration) ||
    !hasExactFinancialSavingsFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
    !isFinancialSavingsIdentity(value.artifactGeneration.runId) ||
    !isFinancialSavingsIsoInstant(value.artifactGeneration.generatedAt) ||
    !isFinancialSavingsHash(value.financialAuthorityId) ||
    !isFinancialSavingsHash(value.savingsAuthorityId) ||
    (value.lifecycleBindings !== undefined &&
      (!Array.isArray(value.lifecycleBindings) ||
        value.lifecycleBindings.length === 0 ||
        value.lifecycleBindings.length > MAX_ALLOCATIONS ||
        !value.lifecycleBindings.every(isLifecycleBinding))) ||
    !Array.isArray(value.coordinates) ||
    value.coordinates.length === 0 ||
    value.coordinates.length > MAX_COORDINATES
  )
    return false;

  const projection = value as unknown as FinancialSavingsSurfaceProjectionV1;
  const queryRecommendationIds =
    projection.scope.kind === 'recommendation-query' || projection.scope.kind === 'resource-query'
      ? new Set(projection.scope.recommendationIds)
      : undefined;
  const queryAllocationIds = projection.scope.kind === 'resource-query' ? new Set(projection.scope.allocationIds) : undefined;
  if (
    !projection.coordinates.every(coordinate => {
      if (!isFinancialSavingsRecord(coordinate)) return false;
      return coordinate.status === 'available' || coordinate.status === 'partial'
        ? isComposedCoordinate(coordinate, queryRecommendationIds, queryAllocationIds)
        : coordinate.status === 'unavailable' && isUnavailableCoordinate(coordinate);
    }) ||
    new Set(projection.coordinates.map(coordinate => coordinate.coordinateId)).size !== projection.coordinates.length
  )
    return false;

  if (projection.lifecycleBindings !== undefined) {
    const lifecycleKeys = projection.lifecycleBindings.map(binding => `${binding.resourceId}\u0000${binding.recommendationId}`);
    const boundAllocationIds = projection.lifecycleBindings.flatMap(binding => binding.allocationIds);
    const projectedAllocationOwners = new Map<string, string>();
    for (const coordinate of projection.coordinates) {
      if (coordinate.status === 'unavailable') continue;
      for (const contribution of coordinate.recommendationContributions) {
        for (const allocationId of contribution.allocationIds) {
          if (projectedAllocationOwners.has(allocationId)) return false;
          projectedAllocationOwners.set(allocationId, contribution.recommendationId);
        }
      }
    }
    if (
      new Set(lifecycleKeys).size !== lifecycleKeys.length ||
      new Set(boundAllocationIds).size !== boundAllocationIds.length ||
      boundAllocationIds.length !== projectedAllocationOwners.size ||
      projection.lifecycleBindings.some(binding =>
        binding.allocationIds.some(allocationId => projectedAllocationOwners.get(allocationId) !== binding.recommendationId)
      )
    ) return false;
  }

  const { projectionId: _projectionId, ...identity } = projection;
  return projection.projectionId === createFinancialSavingsSurfaceProjectionIdV1(identity);
};
