import { AZURE_BILLED_ALL_CHARGES_POLICY_V1 } from './financialChargeComposition';
import type { AzureResourcesView } from './views';
import {
  FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1,
  type FinancialSavingsLifecycleBindingV1,
  type FinancialSavingsRecommendationContributionV1,
  type FinancialSavingsSurfaceCoordinateEnvelopeV1,
  type FinancialSavingsSurfaceProjectionIdentityPreimageV1,
  type FinancialSavingsSurfaceProjectionV1,
  type FinancialSavingsSurfaceScopeV1,
  type FinancialSavingsSurfaceV1,
} from './financialSavingsSurfaceProjection';
import {
  createFinancialSavingsSurfaceProjectionIdV1,
  isFinancialSavingsSurfaceProjectionV1,
} from './financialSavingsSurfaceProjectionValidation';

export class FinancialSavingsSurfaceProjectionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'FinancialSavingsSurfaceProjectionError';
  }
}

const sameGeneration = (
  left: { runId: string; generatedAt: string } | undefined,
  right: { runId: string; generatedAt: string } | undefined
): boolean => Boolean(left && right && left.runId === right.runId && left.generatedAt === right.generatedAt);

const exactMinorUnitSum = (values: readonly number[]): number => {
  const sum = values.reduce((total, value) => total + BigInt(value), 0n);
  if (sum > BigInt(Number.MAX_SAFE_INTEGER) || sum < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings surface contribution exceeds the safe integer boundary');
  }
  return Number(sum);
};

const projectLifecycleBindings = (
  allocations: ReadonlyArray<{ allocationId: string; ownerScopeId: string; recommendationId: string }>
): FinancialSavingsLifecycleBindingV1[] => {
  const byLifecycleIdentity = new Map<string, FinancialSavingsLifecycleBindingV1>();
  for (const allocation of allocations) {
    const key = `${allocation.ownerScopeId}\u0000${allocation.recommendationId}`;
    const existing = byLifecycleIdentity.get(key);
    if (existing) {
      existing.allocationIds.push(allocation.allocationId);
      continue;
    }
    byLifecycleIdentity.set(key, {
      resourceId: allocation.ownerScopeId,
      recommendationId: allocation.recommendationId,
      allocationIds: [allocation.allocationId],
    });
  }
  return [...byLifecycleIdentity.values()]
    .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds].sort() as [string, ...string[]] }))
    .sort(
      (left, right) =>
        left.resourceId.localeCompare(right.resourceId) || left.recommendationId.localeCompare(right.recommendationId)
    );
};

export const projectFinancialSavingsSurfaceQueryV1 = (
  source: FinancialSavingsSurfaceProjectionV1,
  recommendationIds: readonly string[],
  filterFingerprint: string
): FinancialSavingsSurfaceProjectionV1 => {
  if (!isFinancialSavingsSurfaceProjectionV1(source) || source.surface !== 'recommendations') {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings source projection is invalid for recommendation filtering');
  }
  const uniqueRecommendationIds = [...new Set(recommendationIds)];
  if (
    uniqueRecommendationIds.length !== recommendationIds.length ||
    uniqueRecommendationIds.some(id => !id.trim()) ||
    !filterFingerprint.trim()
  ) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings query identity is invalid');
  }
  const scope: FinancialSavingsSurfaceScopeV1 = {
    kind: 'recommendation-query',
    filterFingerprint,
    recommendationIds: uniqueRecommendationIds,
  };
  const includedRecommendationIds = new Set(uniqueRecommendationIds);
  const lifecycleBindings = source.lifecycleBindings
    ?.filter(binding => includedRecommendationIds.has(binding.recommendationId))
    .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds] as [string, ...string[]] }));
  const coordinates = source.coordinates.map((coordinate): FinancialSavingsSurfaceCoordinateEnvelopeV1 => {
    if (coordinate.status === 'unavailable') return coordinate;
    const recommendationContributions = coordinate.recommendationContributions.filter(contribution =>
      includedRecommendationIds.has(contribution.recommendationId)
    );
    const filteredAmounts = {
      recommendationContributions,
      aggregate: {
        allocationIds: recommendationContributions.flatMap(contribution => contribution.allocationIds),
        savingsMinorUnits: exactMinorUnitSum(recommendationContributions.map(contribution => contribution.savingsMinorUnits)),
      },
    };
    if (coordinate.status === 'available') return { ...coordinate, ...filteredAmounts };
    const { unavailableRecommendationIds: _sourceUnavailableRecommendationIds, ...common } = coordinate;
    void _sourceUnavailableRecommendationIds;
    const unavailableRecommendationIds = coordinate.unavailableRecommendationIds.filter(recommendationId =>
      includedRecommendationIds.has(recommendationId)
    );
    return unavailableRecommendationIds.length > 0
      ? {
          ...common,
          ...filteredAmounts,
          status: 'partial',
          unavailableRecommendationIds: unavailableRecommendationIds as [string, ...string[]],
        }
      : { ...common, ...filteredAmounts, status: 'available' };
  }) as [FinancialSavingsSurfaceCoordinateEnvelopeV1, ...FinancialSavingsSurfaceCoordinateEnvelopeV1[]];
  const identity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
    schemaVersion: source.schemaVersion,
    contractVersion: source.contractVersion,
    surface: source.surface,
    scope,
    provider: source.provider,
    providerAccountRefs: source.providerAccountRefs,
    artifactGeneration: source.artifactGeneration,
    financialAuthorityId: source.financialAuthorityId,
    savingsAuthorityId: source.savingsAuthorityId,
    ...(lifecycleBindings?.length ? { lifecycleBindings: lifecycleBindings as [FinancialSavingsLifecycleBindingV1, ...FinancialSavingsLifecycleBindingV1[]] } : {}),
    coordinates,
  };
  const projection: FinancialSavingsSurfaceProjectionV1 = {
    ...identity,
    projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity),
  };
  if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings query projection failed validation');
  }
  return projection;
};

const projectRecommendationContributions = (
  allocations: ReadonlyArray<{ allocationId: string; recommendationId: string; savingsMinorUnits: number }>
): FinancialSavingsRecommendationContributionV1[] => {
  const byRecommendation = new Map<
    string,
    { allocationIds: string[]; savingsMinorUnits: number[]; allocations: Array<{ allocationId: string; savingsMinorUnits: number }> }
  >();
  for (const allocation of allocations) {
    const existing = byRecommendation.get(allocation.recommendationId) ?? {
      allocationIds: [],
      savingsMinorUnits: [],
      allocations: [],
    };
    existing.allocationIds.push(allocation.allocationId);
    existing.savingsMinorUnits.push(allocation.savingsMinorUnits);
    existing.allocations.push({ allocationId: allocation.allocationId, savingsMinorUnits: allocation.savingsMinorUnits });
    byRecommendation.set(allocation.recommendationId, existing);
  }
  return Array.from(byRecommendation.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([recommendationId, contribution]) => ({
      recommendationId,
      allocationIds: [...contribution.allocationIds].sort() as [string, ...string[]],
      savingsMinorUnits: exactMinorUnitSum(contribution.savingsMinorUnits),
      allocations: contribution.allocations
        .sort((left, right) => left.allocationId.localeCompare(right.allocationId)) as [
        { allocationId: string; savingsMinorUnits: number },
        ...Array<{ allocationId: string; savingsMinorUnits: number }>,
      ],
    }));
};

export const projectFinancialSavingsSurfaceResourceQueryV1 = (
  source: FinancialSavingsSurfaceProjectionV1,
  allocationIds: readonly string[],
  recommendationIds: readonly string[],
  filterFingerprint: string
): FinancialSavingsSurfaceProjectionV1 => {
  if (!isFinancialSavingsSurfaceProjectionV1(source) || source.surface !== 'resources') {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings source projection is invalid for resource filtering');
  }
  const uniqueAllocationIds = [...new Set(allocationIds)];
  const uniqueRecommendationIds = [...new Set(recommendationIds)];
  if (
    uniqueAllocationIds.length !== allocationIds.length ||
    uniqueRecommendationIds.length !== recommendationIds.length ||
    uniqueAllocationIds.some(id => !id.trim()) ||
    uniqueRecommendationIds.some(id => !id.trim()) ||
    !filterFingerprint.trim()
  ) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings resource query identity is invalid');
  }
  const includedAllocationIds = new Set(uniqueAllocationIds);
  const includedRecommendationIds = new Set(uniqueRecommendationIds);
  const lifecycleBindings = source.lifecycleBindings
    ?.map(binding => {
      const filteredAllocationIds = binding.allocationIds.filter(allocationId => includedAllocationIds.has(allocationId));
      return filteredAllocationIds.length
        ? {
            ...binding,
            allocationIds: filteredAllocationIds as [string, ...string[]],
          }
        : undefined;
    })
    .filter((binding): binding is FinancialSavingsLifecycleBindingV1 => binding !== undefined);
  const scope: FinancialSavingsSurfaceScopeV1 = {
    kind: 'resource-query',
    filterFingerprint,
    allocationIds: uniqueAllocationIds,
    recommendationIds: uniqueRecommendationIds,
  };
  const coordinates = source.coordinates.map((coordinate): FinancialSavingsSurfaceCoordinateEnvelopeV1 => {
    if (coordinate.status === 'unavailable') return coordinate;
    const recommendationContributions = coordinate.recommendationContributions
      .map(contribution => {
        if (contribution.allocations === undefined) {
          throw new FinancialSavingsSurfaceProjectionError(
            'Financial savings resource query requires exact allocation contribution evidence'
          );
        }
        const allocations = contribution.allocations.filter(allocation => includedAllocationIds.has(allocation.allocationId));
        if (allocations.length === 0) return undefined;
        return {
          recommendationId: contribution.recommendationId,
          allocationIds: allocations.map(allocation => allocation.allocationId) as [string, ...string[]],
          allocations: allocations as [
            { allocationId: string; savingsMinorUnits: number },
            ...Array<{ allocationId: string; savingsMinorUnits: number }>,
          ],
          savingsMinorUnits: exactMinorUnitSum(allocations.map(allocation => allocation.savingsMinorUnits)),
        };
      })
      .filter((contribution): contribution is NonNullable<typeof contribution> => contribution !== undefined);
    const filteredAmounts = {
      recommendationContributions,
      aggregate: {
        allocationIds: recommendationContributions.flatMap(contribution => contribution.allocationIds),
        savingsMinorUnits: exactMinorUnitSum(recommendationContributions.map(contribution => contribution.savingsMinorUnits)),
      },
    };
    if (coordinate.status === 'available') return { ...coordinate, ...filteredAmounts };
    const { unavailableRecommendationIds: _sourceUnavailableRecommendationIds, ...common } = coordinate;
    void _sourceUnavailableRecommendationIds;
    const unavailableRecommendationIds = coordinate.unavailableRecommendationIds.filter(id => includedRecommendationIds.has(id));
    return unavailableRecommendationIds.length > 0
      ? {
          ...common,
          ...filteredAmounts,
          status: 'partial',
          unavailableRecommendationIds: unavailableRecommendationIds as [string, ...string[]],
        }
      : { ...common, ...filteredAmounts, status: 'available' };
  }) as [FinancialSavingsSurfaceCoordinateEnvelopeV1, ...FinancialSavingsSurfaceCoordinateEnvelopeV1[]];
  const identity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
    schemaVersion: source.schemaVersion,
    contractVersion: source.contractVersion,
    surface: source.surface,
    scope,
    provider: source.provider,
    providerAccountRefs: source.providerAccountRefs,
    artifactGeneration: source.artifactGeneration,
    financialAuthorityId: source.financialAuthorityId,
    savingsAuthorityId: source.savingsAuthorityId,
    ...(lifecycleBindings?.length ? { lifecycleBindings: lifecycleBindings as [FinancialSavingsLifecycleBindingV1, ...FinancialSavingsLifecycleBindingV1[]] } : {}),
    coordinates,
  };
  const projection = { ...identity, projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity) };
  if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings resource query projection failed validation');
  }
  return projection;
};

/**
 * Projects a validated Resources authority into a compact, immutable surface.
 * It partitions canonical allocation amounts for display and never recalculates
 * scenario economics from legacy recommendation or resource fields.
 */
export const buildFinancialSavingsSurfaceProjectionV1 = (
  resourcesView: AzureResourcesView,
  surface: FinancialSavingsSurfaceV1
): FinancialSavingsSurfaceProjectionV1 => {
  const authority = resourcesView.financialAuthority;
  const savingsAuthority = resourcesView.financialSavingsAuthority;
  if (!authority || !savingsAuthority) throw new FinancialSavingsSurfaceProjectionError('Financial savings authority is unavailable');
  if (
    authority.authorityId !== savingsAuthority.financialAuthorityId ||
    !sameGeneration(resourcesView.artifactGeneration, authority.artifactGeneration) ||
    !sameGeneration(authority.artifactGeneration, savingsAuthority.artifactGeneration)
  ) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings authority generation or identity binding is invalid');
  }

  const financialCoordinateById = new Map(authority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
  const savingsCoordinateById = new Map(savingsAuthority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
  if (
    financialCoordinateById.size !== authority.coordinates.length ||
    savingsCoordinateById.size !== savingsAuthority.coordinates.length ||
    financialCoordinateById.size !== savingsCoordinateById.size ||
    Array.from(financialCoordinateById.keys()).some(coordinateId => !savingsCoordinateById.has(coordinateId))
  ) {
    throw new FinancialSavingsSurfaceProjectionError(
      'Financial savings coordinates are not one-to-one with financial authority coordinates'
    );
  }

  const coordinates = authority.coordinates.map((financialCoordinate): FinancialSavingsSurfaceCoordinateEnvelopeV1 => {
    const savingsCoordinate = savingsCoordinateById.get(financialCoordinate.coordinateId);
    if (!savingsCoordinate) {
      throw new FinancialSavingsSurfaceProjectionError(`Financial savings coordinate ${financialCoordinate.coordinateId} is missing`);
    }
    const common = {
      coordinateId: financialCoordinate.coordinateId,
      periodRole: financialCoordinate.periodRole,
      period: financialCoordinate.period,
      costBasis: financialCoordinate.costBasis,
      estimateLens: financialCoordinate.estimateLens,
      chargeInclusionPolicyRef: AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
      ...(financialCoordinate.requestedCurrencyCode === undefined
        ? {}
        : { requestedCurrencyCode: financialCoordinate.requestedCurrencyCode }),
      ...(savingsCoordinate.currentAggregateBaselineId === undefined
        ? {}
        : { currentAggregateBaselineId: savingsCoordinate.currentAggregateBaselineId }),
    };
    if (savingsCoordinate.status === 'unavailable') {
      return { ...common, status: 'unavailable', unavailableReason: savingsCoordinate.unavailableReason };
    }
    const currentAggregate = financialCoordinate.aggregateBaseline;
    if (
      currentAggregate.status !== 'available' ||
      currentAggregate.baselineId !== savingsCoordinate.currentAggregateBaselineId ||
      currentAggregate.total.currencyCode !== savingsCoordinate.accountingCurrencyCode
    ) {
      throw new FinancialSavingsSurfaceProjectionError(
        `Financial savings coordinate ${financialCoordinate.coordinateId} has no matching available current aggregate baseline`
      );
    }
    const unavailableRecommendationIds =
      savingsCoordinate.status === 'partial'
        ? Array.from(
            new Set(
              savingsCoordinate.activations
                .filter(activation => activation.result === 'unavailable')
                .map(activation => activation.recommendationId)
            )
          ).sort()
        : [];
    const composed = {
      ...common,
      currentAggregateBaselineId: savingsCoordinate.currentAggregateBaselineId,
      currentAggregate: { ...currentAggregate.total },
      accountingCurrencyCode: savingsCoordinate.accountingCurrencyCode,
      minorUnitScale: savingsCoordinate.minorUnitScale,
      roundingMode: savingsCoordinate.roundingMode,
      recommendationContributions: projectRecommendationContributions(savingsCoordinate.allocations),
      aggregate: {
        allocationIds: [...savingsCoordinate.aggregate.allocationIds],
        savingsMinorUnits: savingsCoordinate.aggregate.savingsMinorUnits,
      },
    };
    return savingsCoordinate.status === 'partial'
      ? {
          ...composed,
          status: 'partial',
          unavailableRecommendationIds: unavailableRecommendationIds as [string, ...string[]],
        }
      : { ...composed, status: 'available' };
  }) as [FinancialSavingsSurfaceCoordinateEnvelopeV1, ...FinancialSavingsSurfaceCoordinateEnvelopeV1[]];

  const lifecycleBindings = projectLifecycleBindings(
    savingsAuthority.coordinates.flatMap(coordinate => (coordinate.status === 'unavailable' ? [] : coordinate.allocations))
  );

  const identity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
    schemaVersion: FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1,
    contractVersion: FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1,
    surface,
    scope: { kind: 'subscription-full' },
    provider: 'azure',
    providerAccountRefs: [...authority.providerAccountRefs],
    artifactGeneration: { ...authority.artifactGeneration },
    financialAuthorityId: authority.authorityId,
    savingsAuthorityId: savingsAuthority.savingsAuthorityId,
    ...(lifecycleBindings.length
      ? { lifecycleBindings: lifecycleBindings as [FinancialSavingsLifecycleBindingV1, ...FinancialSavingsLifecycleBindingV1[]] }
      : {}),
    coordinates,
  };
  const projection: FinancialSavingsSurfaceProjectionV1 = {
    ...identity,
    projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity),
  };
  if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
    throw new FinancialSavingsSurfaceProjectionError('Financial savings surface projection failed validation');
  }
  return projection;
};
