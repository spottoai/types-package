import { sha256Utf8 } from '../common/sha256';
import type { CostBasis, EstimateLens } from './costComposition';
import type { FinancialBaselinePeriodV2, FinancialChargeClassificationV2, FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';

export const FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1 = 1 as const;
export const FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1 = 'financial-charge-composition/v1' as const;
export const FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1 = 'financial-charge-inclusion-policy/v1' as const;

export type FinancialChargeSourceV1 = 'azure-native' | 'marketplace' | 'unknown';
export type FinancialChargeRecurrenceV1 = 'one-time' | 'recurring' | 'usage-based' | 'unknown';

export interface FinancialChargeInclusionPolicyV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1;
  policyRef: FinancialChargeInclusionPolicyRefV2;
  includeSources: readonly FinancialChargeSourceV1[];
  excludeSources: readonly FinancialChargeSourceV1[];
  withholdSources: readonly FinancialChargeSourceV1[];
}

type PolicyDefinition = Omit<FinancialChargeInclusionPolicyV1, 'policyRef'> & { policyId: string };

const createRegisteredPolicy = (definition: PolicyDefinition): FinancialChargeInclusionPolicyV1 => {
  const { policyId, ...policy } = definition;
  const registered = {
    ...policy,
    includeSources: Object.freeze([...policy.includeSources]),
    excludeSources: Object.freeze([...policy.excludeSources]),
    withholdSources: Object.freeze([...policy.withholdSources]),
    policyRef: Object.freeze({ policyId, policyDigest: `sha256:${sha256Utf8(JSON.stringify(definition))}` }),
  };
  return Object.freeze(registered);
};

export const AZURE_BILLED_ALL_CHARGES_POLICY_V1 = createRegisteredPolicy({
  schemaVersion: 1,
  contractVersion: FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1,
  policyId: 'azure-billed-all-charges/v1',
  includeSources: ['azure-native', 'marketplace', 'unknown'],
  excludeSources: [],
  withholdSources: [],
});

export const AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1 = createRegisteredPolicy({
  schemaVersion: 1,
  contractVersion: FINANCIAL_CHARGE_INCLUSION_POLICY_CONTRACT_VERSION_V1,
  policyId: 'azure-cloud-services-excluding-marketplace/v1',
  includeSources: ['azure-native'],
  excludeSources: ['marketplace'],
  withholdSources: ['unknown'],
});

export const FINANCIAL_CHARGE_INCLUSION_POLICIES_V1 = Object.freeze([
  AZURE_BILLED_ALL_CHARGES_POLICY_V1,
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_V1,
] as const);

export const resolveFinancialChargeInclusionPolicyV1 = (
  policyRef: FinancialChargeInclusionPolicyRefV2
): FinancialChargeInclusionPolicyV1 | undefined =>
  policyRef !== null && typeof policyRef === 'object' && FINANCIAL_CHARGE_INCLUSION_POLICIES_V1.find(
    policy => policy.policyRef.policyId === policyRef.policyId && policy.policyRef.policyDigest === policyRef.policyDigest
  ) || undefined;

export interface FinancialClassifiedChargeComponentV1 {
  componentId: string;
  chargeSource: FinancialChargeSourceV1;
  chargeRecurrence: FinancialChargeRecurrenceV1;
  chargeClassification: FinancialChargeClassificationV2;
  amount: string;
  evidenceRefIds: [string, ...string[]];
}

export interface FinancialChargeCompositionBucketV1 {
  chargeSource: FinancialChargeSourceV1;
  chargeRecurrence: FinancialChargeRecurrenceV1;
  chargeClassification: FinancialChargeClassificationV2;
  amount: string;
  componentIds: [string, ...string[]];
  evidenceRefIds: [string, ...string[]];
}

export interface FinancialChargeCompositionReconciliationV1 {
  status: 'reconciled';
  bucketTotal: string;
  sourceTotal: string;
  difference: '0';
}

export interface FinancialChargeCompositionV1 {
  schemaVersion: typeof FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1;
  contractVersion: typeof FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1;
  chargeCompositionId: string;
  baselineId: string;
  ownerScopeId: string;
  period: FinancialBaselinePeriodV2;
  costBasis: CostBasis;
  estimateLens: EstimateLens;
  accountingCurrencyCode: string;
  buckets: [FinancialChargeCompositionBucketV1, ...FinancialChargeCompositionBucketV1[]];
  reconciliation: FinancialChargeCompositionReconciliationV1;
  algorithmVersion: string;
}

export type FinancialChargeCompositionIdentityPreimageV1 = Omit<FinancialChargeCompositionV1, 'chargeCompositionId'>;

export interface CreateFinancialChargeCompositionRequestV1 {
  baselineId: string;
  ownerScopeId: string;
  period: FinancialBaselinePeriodV2;
  costBasis: CostBasis;
  estimateLens: EstimateLens;
  accountingCurrencyCode: string;
  sourceTotal: string;
  components: [FinancialClassifiedChargeComponentV1, ...FinancialClassifiedChargeComponentV1[]];
  algorithmVersion: string;
}

export type FinancialChargeSelectionV1 = {
  status: 'available' | 'partial';
  includedAmount: string;
  excludedAmount: string;
  withheldAmount: string;
  forecastEligibleAmount: string;
  oneTimeAmount: string;
  unknownRecurrenceAmount: string;
  forecastStatus: 'available' | 'partial';
  currencyCode: string;
  reasonCodes?: [string, ...string[]];
  forecastReasonCodes?: [string, ...string[]];
};
