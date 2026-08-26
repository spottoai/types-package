import {
  FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  canonicalizeCurrentSpendCompositionIdentityV1,
  createCurrentSpendCompositionIdV1,
  isCurrentSpendCompositionV1,
  toCanonicalEstimateLensV1,
  toLegacyEstimateLensV1,
  type CurrentSpendCompositionV1,
  type CurrentSpendCompositionIdentityPreimageV1,
  type FinancialBaselinePeriodV2,
  type FinancialDataflowCoordinateV1,
} from '../index.js';

const period: FinancialBaselinePeriodV2 = {
  windowKind: 'rolling-30-days',
  requested: { startDate: '2026-07-12', endDateExclusive: '2026-08-11', dateBasis: 'utc' },
  observed: { startDate: '2026-07-12', endDateExclusive: '2026-08-11', dateBasis: 'utc' },
  coverage: [
    {
      coverageId: `sha256:${'1'.repeat(64)}`,
      interval: { startDate: '2026-07-12', endDateExclusive: '2026-08-11', dateBasis: 'utc' },
      settlementState: 'mixed',
      evidenceRefIds: [`sha256:${'2'.repeat(64)}`],
    },
  ],
  gaps: [],
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
};

const compositionWithoutId = {
  schemaVersion: FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1,
  contractVersion: FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1,
  coordinate,
  members: [
    {
      memberScopeId: 'azure-resource:vm-1',
      baselineId: `sha256:${'4'.repeat(64)}`,
      status: 'included',
    },
  ],
  amount: { status: 'available', amount: '0', currencyCode: 'AUD' },
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
  ...composition,
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
