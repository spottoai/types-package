import {
  AZURE_BILLED_ALL_CHARGES_POLICY_V1,
  FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  canonicalizeCurrentSpendCompositionIdentityV1,
  createCurrentSpendCompositionIdV1,
  isCurrentSpendCompositionV1,
  toCanonicalEstimateLensV1,
  toLegacyEstimateLensV1,
  type CurrentSpendCompositionV1,
  type CurrentSpendCompositionIdentityPreimageV1,
  type FinancialDataflowCoordinateV1,
  type FinancialDataflowPeriodV1,
} from '../index.js';

const period: FinancialDataflowPeriodV1 = {
  windowKind: 'rolling-30-days',
  requested: { startDate: '2026-07-12', endDateExclusive: '2026-08-11', dateBasis: 'utc' },
};

const coordinate: FinancialDataflowCoordinateV1 = {
  companyId: 'company-1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scope: {
    kind: 'subscription',
    scopeId: 'azure-subscription:sub-1',
    scopeFingerprint: `sha256:${'3'.repeat(64)}`,
  },
  periodRole: 'current-spend',
  period,
  costBasis: 'billed',
  estimateLens: 'include-estimates',
  requestedCurrencyCode: 'AUD',
  accountingCurrency: { status: 'resolved', currencyCode: 'AUD' },
  chargeInclusionPolicyRef: AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
};

const compositionWithoutId = {
  schemaVersion: FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  coordinate,
  members: [
    {
      memberScopeId: 'azure-resource:vm-1',
      baselineId: `sha256:${'4'.repeat(64)}`,
      chargeCompositionId: `sha256:${'7'.repeat(64)}`,
      status: 'included',
    },
  ],
  amount: { status: 'available', amount: '0', currencyCode: 'AUD' },
  chargeSelection: {
    status: 'available',
    includedAmount: '0',
    excludedAmount: '0',
    withheldAmount: '0',
    forecastEligibleAmount: '0',
    oneTimeAmount: '0',
    unknownRecurrenceAmount: '0',
    forecastStatus: 'available',
    currencyCode: 'AUD',
  },
  membershipDigest: `sha256:${'5'.repeat(64)}`,
  algorithmVersion: 'current-spend-composition/v1',
} satisfies CurrentSpendCompositionIdentityPreimageV1;

const composition: CurrentSpendCompositionV1 = {
  ...compositionWithoutId,
  compositionId: createCurrentSpendCompositionIdV1(compositionWithoutId),
};

const unresolvedCoordinate: FinancialDataflowCoordinateV1 = {
  ...coordinate,
  accountingCurrency: { status: 'unresolved', reasonCode: 'currency-conflicting' },
};

const unavailable: CurrentSpendCompositionV1 = {
  schemaVersion: FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  coordinate: unresolvedCoordinate,
  compositionId: `sha256:${'6'.repeat(64)}`,
  members: [
    {
      memberScopeId: 'azure-subscription:sub-1',
      status: 'unavailable',
      reasonCode: 'currency-conflicting',
    },
  ],
  amount: { status: 'unavailable', reasonCodes: ['currency-conflicting'] },
  membershipDigest: `sha256:${'5'.repeat(64)}`,
  algorithmVersion: 'current-spend-composition/v1',
};

const unavailableWithMoney: CurrentSpendCompositionV1 = {
  ...unavailable,
  // @ts-expect-error unavailable composition cannot carry money.
  amount: {
    status: 'unavailable',
    reasonCodes: ['currency-conflicting'],
    amount: '0',
  },
};

const canonicalLens: 'billing-only' = toCanonicalEstimateLensV1('actual-only');
const legacyLens: 'actual-plus-estimated' = toLegacyEstimateLensV1('include-estimates');

void canonicalizeCurrentSpendCompositionIdentityV1(compositionWithoutId);
void isCurrentSpendCompositionV1(composition);
void canonicalLens;
void legacyLens;
void unavailableWithMoney;
