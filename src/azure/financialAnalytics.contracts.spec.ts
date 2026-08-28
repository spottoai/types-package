import {
  FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  canonicalizeFinancialAnalyticsInputIdentityV1,
  canonicalizeFinancialAnalyticsProjectionIdentityV1,
  createFinancialAnalyticsInputIdV1,
  createFinancialAnalyticsProjectionIdV1,
  isFinancialAnalyticsInputSeriesV1,
  isFinancialAnalyticsProjectionV1,
  type FinancialAnalyticsInputSeriesV1,
  type FinancialAnalyticsInputIdentityPreimageV1,
  type FinancialAnalyticsProjectionV1,
  type FinancialAnalyticsProjectionIdentityPreimageV1,
  type FinancialDataflowCoordinateV1,
} from '../index.js';

declare const historyCoordinate: FinancialDataflowCoordinateV1 & {
  periodRole: 'analytics-input';
  period: FinancialDataflowCoordinateV1['period'] & { windowKind: 'analytics-history' };
};
declare const targetCoordinate: FinancialDataflowCoordinateV1 & { periodRole: 'projection-target' };

const inputWithoutId = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  coordinate: historyCoordinate,
  granularity: 'daily',
  producerGenerationId: 'analytics-input-generation-1',
  referenceCompositions: [],
  points: [
    {
      date: '2026-08-09',
      compositionId: `sha256:${'1'.repeat(64)}`,
      status: 'available',
      amount: '10',
      forecastEligibleAmount: '10',
      oneTimeAmount: '0',
      unknownRecurrenceAmount: '0',
      forecastStatus: 'available',
    },
    {
      date: '2026-08-10',
      compositionId: `sha256:${'2'.repeat(64)}`,
      status: 'partial',
      knownAmount: '-5',
      reasonCodes: ['evidence-not-produced'],
      forecastEligibleAmount: '-5',
      oneTimeAmount: '0',
      unknownRecurrenceAmount: '0',
      forecastStatus: 'available',
    },
  ],
  gaps: [
    {
      startDate: '2026-08-01',
      endDateExclusive: '2026-08-09',
      reasonCodes: ['evidence-not-produced'],
    },
  ],
  coverage: { availableDayCount: 1, partialDayCount: 1, unavailableDayCount: 8 },
  algorithmVersion: 'financial-analytics-input/v1',
} satisfies FinancialAnalyticsInputIdentityPreimageV1;

const input: FinancialAnalyticsInputSeriesV1 = {
  ...inputWithoutId,
  analyticsInputId: createFinancialAnalyticsInputIdV1(inputWithoutId),
};

const forecastWithoutId = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  analyticsInputId: input.analyticsInputId,
  currentSpendCompositionId: `sha256:${'3'.repeat(64)}`,
  coordinate: targetCoordinate,
  outputGenerationId: 'analytics-output-generation-1',
  method: 'ets',
  algorithmVersion: 'forecast-ets/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'available',
  result: {
    kind: 'forecast',
    projectedTotal: { amount: '420', currencyCode: 'AUD' },
    projectedRemaining: { amount: '72', currencyCode: 'AUD' },
  },
} satisfies FinancialAnalyticsProjectionIdentityPreimageV1;

const forecast: FinancialAnalyticsProjectionV1 = {
  ...forecastWithoutId,
  analyticsProjectionId: createFinancialAnalyticsProjectionIdV1(forecastWithoutId),
};

const trend: FinancialAnalyticsProjectionV1 = {
  ...forecast,
  analyticsProjectionId: `sha256:${'4'.repeat(64)}`,
  result: {
    kind: 'trend',
    comparisonCompositionId: `sha256:${'5'.repeat(64)}`,
    direction: 'increasing',
    change: { amount: '15', currencyCode: 'AUD' },
    percentChange: '20',
  },
};

const anomaly: FinancialAnalyticsProjectionV1 = {
  ...forecast,
  analyticsProjectionId: `sha256:${'6'.repeat(64)}`,
  result: {
    kind: 'anomaly',
    events: [
      {
        date: '2026-08-10',
        observed: { amount: '30', currencyCode: 'AUD' },
        expected: { amount: '10', currencyCode: 'AUD' },
        delta: { amount: '20', currencyCode: 'AUD' },
        score: '0.95',
      },
    ],
  },
};

const unavailable: FinancialAnalyticsProjectionV1 = {
  schemaVersion: 1,
  contractVersion: FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  analyticsProjectionId: `sha256:${'7'.repeat(64)}`,
  analyticsInputId: input.analyticsInputId,
  coordinate: targetCoordinate,
  outputGenerationId: 'analytics-output-generation-2',
  method: 'ets',
  algorithmVersion: 'forecast-ets/v1',
  producedAt: '2026-08-10T00:00:00.000Z',
  status: 'unavailable',
  resultKind: 'forecast',
  reasonCodes: ['insufficient-history'],
};

void canonicalizeFinancialAnalyticsInputIdentityV1(inputWithoutId);
void canonicalizeFinancialAnalyticsProjectionIdentityV1(forecastWithoutId);
void isFinancialAnalyticsInputSeriesV1(input);
void isFinancialAnalyticsProjectionV1(forecast);
void trend;
void anomaly;
void unavailable;
