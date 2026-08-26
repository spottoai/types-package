import type { CanonicalExactMoney } from './financialValidationPrimitives';
import type { FinancialDataflowCoordinateV1 } from './financialDataflow';

export const FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1 = 'financial-analytics-input/v1' as const;
export const FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1 = 'financial-analytics-projection/v1' as const;

export type FinancialAnalyticsDailyPointV1 =
  | { date: string; compositionId: string; status: 'available'; amount: string; knownAmount?: never; reasonCodes?: never }
  | {
      date: string;
      compositionId: string;
      status: 'partial';
      knownAmount: string;
      reasonCodes: [string, ...string[]];
      amount?: never;
    };

export interface FinancialAnalyticsGapV1 {
  startDate: string;
  endDateExclusive: string;
  reasonCodes: [string, ...string[]];
}

export interface FinancialAnalyticsCoverageV1 {
  availableDayCount: number;
  partialDayCount: number;
  unavailableDayCount: number;
}

export interface FinancialAnalyticsInputSeriesV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1;
  analyticsInputId: string;
  coordinate: FinancialDataflowCoordinateV1 & { periodRole: 'analytics-input' };
  granularity: 'daily';
  producerGenerationId: string;
  points: FinancialAnalyticsDailyPointV1[];
  gaps: FinancialAnalyticsGapV1[];
  coverage: FinancialAnalyticsCoverageV1;
  algorithmVersion: string;
}

export type FinancialAnalyticsInputIdentityPreimageV1 = Omit<FinancialAnalyticsInputSeriesV1, 'analyticsInputId'>;

export interface FinancialForecastResultV1 {
  kind: 'forecast';
  projectedTotal: CanonicalExactMoney;
  projectedRemaining: CanonicalExactMoney;
}

export interface FinancialTrendResultV1 {
  kind: 'trend';
  comparisonCompositionId: string;
  direction: 'increasing' | 'decreasing' | 'flat';
  /** Signed target/current change in the coordinate currency. */
  change: CanonicalExactMoney;
  percentChange?: string;
}

export interface FinancialAnomalyEventV1 {
  date: string;
  observed: CanonicalExactMoney;
  expected: CanonicalExactMoney;
  delta: CanonicalExactMoney;
  score: string;
}

export interface FinancialAnomalyResultV1 {
  kind: 'anomaly';
  events: [FinancialAnomalyEventV1, ...FinancialAnomalyEventV1[]];
}

export type FinancialAnalyticsResultV1 = FinancialForecastResultV1 | FinancialTrendResultV1 | FinancialAnomalyResultV1;

interface FinancialAnalyticsProjectionCommonV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1;
  analyticsProjectionId: string;
  coordinate: FinancialDataflowCoordinateV1 & { periodRole: 'projection-target' };
  outputGenerationId: string;
  method: string;
  algorithmVersion: string;
  producedAt: string;
}

type FinancialAnalyticsAvailableInputBindingV1 =
  | { analyticsInputId: string; currentSpendCompositionId: string; result: FinancialForecastResultV1 }
  | { analyticsInputId: string; currentSpendCompositionId: string; result: FinancialTrendResultV1 }
  | { analyticsInputId: string; currentSpendCompositionId?: string; result: FinancialAnomalyResultV1 };

export type AvailableFinancialAnalyticsProjectionV1 = FinancialAnalyticsProjectionCommonV1 &
  FinancialAnalyticsAvailableInputBindingV1 & {
    status: 'available';
    reasonCodes?: never;
    resultKind?: never;
  };

export type PartialFinancialAnalyticsProjectionV1 = FinancialAnalyticsProjectionCommonV1 &
  FinancialAnalyticsAvailableInputBindingV1 & {
    status: 'partial';
    reasonCodes: [string, ...string[]];
    resultKind?: never;
  };

export interface UnavailableFinancialAnalyticsProjectionV1 extends FinancialAnalyticsProjectionCommonV1 {
  /** Absent when capability resolution fails before an analytics input can honestly be produced. */
  analyticsInputId?: string;
  status: 'unavailable';
  resultKind: FinancialAnalyticsResultV1['kind'];
  reasonCodes: [string, ...string[]];
  currentSpendCompositionId?: string;
  result?: never;
}

export type FinancialAnalyticsProjectionV1 =
  | AvailableFinancialAnalyticsProjectionV1
  | PartialFinancialAnalyticsProjectionV1
  | UnavailableFinancialAnalyticsProjectionV1;

export type FinancialAnalyticsProjectionIdentityPreimageV1 = FinancialAnalyticsProjectionV1 extends infer Projection
  ? Projection extends FinancialAnalyticsProjectionV1
    ? Omit<Projection, 'analyticsProjectionId'>
    : never
  : never;
