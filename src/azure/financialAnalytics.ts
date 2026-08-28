import type { CanonicalExactMoney } from './financialValidationPrimitives';
import type { CurrentSpendCompositionV1, FinancialDataflowCoordinateV1 } from './financialDataflow';

export const FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1 = 'financial-analytics-input/v1' as const;
export const FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1 = 'financial-analytics-projection/v1' as const;

interface FinancialAnalyticsDailyForecastSliceV1 {
  /** Exact recurring and usage-based amount eligible for future-day modeling. */
  forecastEligibleAmount: string;
  /** Exact observed one-time amount retained in history but never repeated into future days. */
  oneTimeAmount: string;
  /** Exact included amount whose recurrence is unresolved. */
  unknownRecurrenceAmount: string;
  forecastStatus: 'available' | 'partial';
  forecastReasonCodes?: [string, ...string[]];
}

export type FinancialAnalyticsDailyPointV1 = FinancialAnalyticsDailyForecastSliceV1 &
  (
  | { date: string; compositionId: string; status: 'available'; amount: string; knownAmount?: never; reasonCodes?: never }
  | {
      date: string;
      compositionId: string;
      status: 'partial';
      knownAmount: string;
      reasonCodes: [string, ...string[]];
      amount?: never;
    }
  );

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

export type FinancialAnalyticsInputCoordinateV1 = FinancialDataflowCoordinateV1 & {
  periodRole: 'analytics-input';
  period: FinancialDataflowCoordinateV1['period'] & { windowKind: 'analytics-history' };
};

export interface FinancialAnalyticsInputSeriesV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1;
  analyticsInputId: string;
  coordinate: FinancialAnalyticsInputCoordinateV1;
  granularity: 'daily';
  producerGenerationId: string;
  /** Content-addressed current/comparison compositions required by requested projections. */
  referenceCompositions: CurrentSpendCompositionV1[];
  points: FinancialAnalyticsDailyPointV1[];
  gaps: FinancialAnalyticsGapV1[];
  coverage: FinancialAnalyticsCoverageV1;
  algorithmVersion: string;
}

export type FinancialAnalyticsInputIdentityPreimageV1 = Omit<FinancialAnalyticsInputSeriesV1, 'analyticsInputId'>;

export type FinancialAnalyticsDisplayPeriodKeyV1 =
  | 'last-7-days'
  | 'rolling-30-days'
  | 'rolling-90-days'
  | 'trailing-12-calendar-months';

export type FinancialAnalyticsDisplayBucketV1 =
  | {
      bucketKey: string;
      startDate: string;
      endDateExclusive: string;
      status: 'available';
      amount: string;
      averageKnownPerDay: string;
      knownAmount?: never;
      reasonCodes?: never;
    }
  | {
      bucketKey: string;
      startDate: string;
      endDateExclusive: string;
      status: 'partial';
      knownAmount: string;
      averageKnownPerDay: string;
      reasonCodes: [string, ...string[]];
      amount?: never;
    }
  | {
      bucketKey: string;
      startDate: string;
      endDateExclusive: string;
      status: 'unavailable';
      reasonCodes: [string, ...string[]];
      amount?: never;
      knownAmount?: never;
    };

interface FinancialAnalyticsDisplayProjectionCommonV1 {
  analyticsInputId: string;
  currentSpendCompositionId: string;
  chargeInclusionPolicyRef: FinancialDataflowCoordinateV1['chargeInclusionPolicyRef'];
  periodKey: FinancialAnalyticsDisplayPeriodKeyV1;
  requested: FinancialDataflowCoordinateV1['period']['requested'];
  bucketGranularity: 'daily' | 'calendar-month';
  currencyCode: string;
  buckets: FinancialAnalyticsDisplayBucketV1[];
}

export type FinancialAnalyticsDisplayProjectionV1 =
  | (FinancialAnalyticsDisplayProjectionCommonV1 & {
      status: 'available';
      amount: string;
      averageKnownPerDay: string;
      knownAmount?: never;
      reasonCodes?: never;
    })
  | (FinancialAnalyticsDisplayProjectionCommonV1 & {
      status: 'partial';
      knownAmount: string;
      averageKnownPerDay: string;
      reasonCodes: [string, ...string[]];
      amount?: never;
    })
  | (FinancialAnalyticsDisplayProjectionCommonV1 & {
      status: 'unavailable';
      reasonCodes: [string, ...string[]];
      amount?: never;
      knownAmount?: never;
    });

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
  events: FinancialAnomalyEventV1[];
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
  | { analyticsInputId: string; currentSpendCompositionId: string; result: FinancialAnomalyResultV1 };

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
