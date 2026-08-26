/** Exact monthly monetary range represented in a producer-defined minor-unit scale. */
export interface CanonicalMoneyRangeV2 {
  /** ISO 4217 currency code. */
  currency: string;
  /** Number of decimal places represented by the minor-unit integer fields. */
  minorUnitScale: number;
  currentMonthlyMinorUnits: number;
  minSavingsMinorUnits: number;
  maxSavingsMinorUnits: number;
}

export type SavingsCombinationPolicyV2 = 'additive' | 'exclusive' | 'conditional';

/** A recommendation evaluated in isolation. This value is not portfolio-additive. */
export interface ScenarioSavingsPotentialV2 {
  semantics: 'standalone-scenario';
  combinationPolicy: SavingsCombinationPolicyV2;
  combinationGroupId?: string;
  range: CanonicalMoneyRangeV2;
}

/** Customer-facing explanation of one recommendation's exact share of a portfolio contribution. */
export interface PortfolioSavingsAttributionV2 {
  recommendationId: string;
  label: string;
  allocationIds: string[];
  range: CanonicalMoneyRangeV2;
}

/** Savings attributed by the producer from canonical allocations. This value is portfolio-additive. */
export interface PortfolioSavingsContributionV2 {
  semantics: 'portfolio-contribution';
  allocationIds: string[];
  range: CanonicalMoneyRangeV2;
  /** Optional presentation attribution; when present it must partition this contribution exactly. */
  attributions?: PortfolioSavingsAttributionV2[];
}

/** Mutable lifecycle freshness gate applied to an immutable savings artifact. */
export interface SavingsLifecycleFreshnessV1 {
  status: 'current' | 'refresh-required';
  authorityGeneratedAt: string;
  evaluatedAt: string;
  reason?: 'lifecycle-newer' | 'lifecycle-unavailable' | 'lifecycle-conflict';
  staleResourceIds?: string[];
}

export type SavingsScopeKindV2 = 'subscription-full' | 'recommendation-query' | 'resource-query';

/** Identifies the complete result scope represented by a savings aggregate. */
export interface SavingsScopeV2 {
  kind: SavingsScopeKindV2;
  providerName: 'azure';
  providerScopeId: string;
  /** Opaque producer/API fingerprint. It must not expose raw tenant filter values. */
  filterFingerprint: string;
}

/** Authoritative additive total for one currency, producer generation, and complete scope. */
export interface SavingsAggregateV2 {
  contractVersion: 'savings/v2';
  generationId: string;
  scopeKey: string;
  scope: SavingsScopeV2;
  allocationCount: number;
  totals: CanonicalMoneyRangeV2;
}

/** Currency-separated aggregate collection used when a client combines distinct provider scopes. */
export interface SavingsAggregateSetV2 {
  contractVersion: 'savings/v2';
  aggregates: SavingsAggregateV2[];
}

export type CanonicalSavingsAggregationPolicyV2 = 'owner-component' | 'resource';

/** Provenance retained with a canonical allocation so publication can be reproduced or rejected. */
export interface CanonicalSavingsAllocationProvenanceV2 {
  source: string;
  evidenceIds?: string[];
  stableSavingsBasis: boolean;
}

/** One exact canonical owner/component allocation attributed to exactly one recommendation. */
export interface CanonicalSavingsAllocationV2 {
  allocationId: string;
  aggregationPolicy: CanonicalSavingsAggregationPolicyV2;
  ownerResourceId: string;
  billableComponentKey: string;
  attributedRecommendationId: string;
  scenarioRecommendationIds: string[];
  range: CanonicalMoneyRangeV2;
  provenance: CanonicalSavingsAllocationProvenanceV2;
}

/** Producer-owned canonical ledger from which all public savings projections are derived. */
export interface CanonicalSavingsLedgerV2 {
  contractVersion: 'savings/v2';
  generationId: string;
  generatedAt: string;
  providerName: 'azure';
  providerScopeId: string;
  allocations: CanonicalSavingsAllocationV2[];
  aggregate: SavingsAggregateV2;
}
