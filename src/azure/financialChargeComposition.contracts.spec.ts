import {
  AZURE_BILLED_ALL_CHARGES_POLICY_V1,
  createFinancialChargeCompositionV1,
  isFinancialChargeCompositionV1,
  selectFinancialChargesV1,
  type CreateFinancialChargeCompositionRequestV1,
  type FinancialChargeCompositionV1,
  type FinancialChargeSelectionV1,
} from '../index.js';

const request: CreateFinancialChargeCompositionRequestV1 = {
  baselineId: `sha256:${'1'.repeat(64)}`,
  ownerScopeId: 'azure-resource:vm-1',
  period: {
    windowKind: 'daily',
    requested: { startDate: '2026-08-26', endDateExclusive: '2026-08-27', dateBasis: 'utc' },
    observed: { startDate: '2026-08-26', endDateExclusive: '2026-08-27', dateBasis: 'utc' },
    coverage: [
      {
        coverageId: `sha256:${'2'.repeat(64)}`,
        interval: { startDate: '2026-08-26', endDateExclusive: '2026-08-27', dateBasis: 'utc' },
        settlementState: 'settled',
        evidenceRefIds: [`sha256:${'3'.repeat(64)}`],
      },
    ],
    gaps: [],
  },
  costBasis: 'billed',
  estimateLens: 'actual-only',
  accountingCurrencyCode: 'AUD',
  sourceTotal: '12',
  components: [
    {
      componentId: `sha256:${'4'.repeat(64)}`,
      chargeSource: 'azure-native',
      chargeRecurrence: 'usage-based',
      chargeClassification: 'usage',
      amount: '12',
      evidenceRefIds: [`sha256:${'3'.repeat(64)}`],
    },
  ],
  algorithmVersion: 'financial-charge-composition/cloud-v1',
};

const composition: FinancialChargeCompositionV1 = createFinancialChargeCompositionV1(request);
const selection: FinancialChargeSelectionV1 = selectFinancialChargesV1(
  composition,
  AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef
);

void isFinancialChargeCompositionV1(composition);
void selection;
