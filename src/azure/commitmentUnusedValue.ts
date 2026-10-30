import { isFiniteNumber, isRecord, isString, isStringArray } from '../common/validationHelpers';

/** Unused commitment exposure is nonadditive evidence, never achievable or portfolio savings. */
export interface CommitmentUnusedValueContext {
  benefitId: string;
  additive: false;
  coverage: 'complete' | 'partial';
  assumptions: string[];
  limitations: string[];
  sources: Array<{
    kind: 'billing' | 'inventory' | 'utilization';
    source: string;
    generatedAt?: string;
    observedAt?: string;
    generationId?: string;
    fingerprint?: string;
  }>;
  utilizationWindow?: {
    start: string;
    end: string;
    percentage: number;
    observedDays: number;
    reportedHoursPerUnit?: number;
    finality: 'provider-reported-hours-unverified';
  };
}

/** Period dates are inclusive billing dates. Missing service endpoints must not be inferred from cadence. */
export type CommitmentUnusedValueEvidence = CommitmentUnusedValueContext &
  (
    | ({
        status: 'available';
        amount: number;
        currency: string;
        sourceCharge: {
          amount: number;
          dates: string[];
          cadence?: 'monthly';
          periodStart?: string;
          periodEnd?: string;
        };
        reason?: never;
      } & (
        | { method: 'native-unused-amortized'; basis: 'amortized'; provenance: 'billing-backed-native' }
        | {
            method: 'recurring-charge-utilization-approximation';
            basis: 'billed';
            provenance: 'billing-backed-approximation';
            utilizationWindow: NonNullable<CommitmentUnusedValueContext['utilizationWindow']>;
          }
      ))
    | {
        status: 'unavailable';
        reason: string;
        amount?: never;
        currency?: never;
        method?: never;
        basis?: never;
        provenance?: never;
        sourceCharge?: never;
      }
  );

const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

/** Source ISO timestamps may retain offsets and provider fractional-second precision. */
const isSourceTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  return (
    parts !== null &&
    isCalendarDate(parts[1]) &&
    Number(parts[2]) < 24 &&
    Number(parts[3]) < 60 &&
    Number(parts[4]) < 60 &&
    (parts[5] === undefined || (Number(parts[6]) < 24 && Number(parts[7]) < 60)) &&
    Number.isFinite(Date.parse(value))
  );
};
const isWindowDate = (value: unknown): value is string => isCalendarDate(value) || isSourceTimestamp(value);
const isNonNegativeNumber = (value: unknown): value is number => isFiniteNumber(value) && value >= 0;

const isUtilizationWindow = (value: unknown): boolean =>
  isRecord(value) &&
  isWindowDate(value.start) &&
  isWindowDate(value.end) &&
  Date.parse(value.start) <= Date.parse(value.end) &&
  isNonNegativeNumber(value.percentage) &&
  value.percentage <= 100 &&
  Number.isSafeInteger(value.observedDays) &&
  (value.observedDays as number) >= 0 &&
  (value.reportedHoursPerUnit === undefined || isNonNegativeNumber(value.reportedHoursPerUnit)) &&
  value.finality === 'provider-reported-hours-unverified';

/** Checks wire consistency only; producers/readers still prove billing authenticity and current authorization. */
export function isCommitmentUnusedValueEvidence(value: unknown): value is CommitmentUnusedValueEvidence {
  if (
    !isRecord(value) ||
    !isString(value.benefitId) ||
    value.additive !== false ||
    (value.coverage !== 'complete' && value.coverage !== 'partial') ||
    !isStringArray(value.assumptions) ||
    !isStringArray(value.limitations) ||
    !Array.isArray(value.sources) ||
    !value.sources.every(
      source =>
        isRecord(source) &&
        ['billing', 'inventory', 'utilization'].includes(source.kind as string) &&
        isString(source.source) &&
        ['generatedAt', 'observedAt'].every(key => source[key] === undefined || isSourceTimestamp(source[key])) &&
        ['generationId', 'fingerprint'].every(key => source[key] === undefined || isString(source[key]))
    ) ||
    (value.utilizationWindow !== undefined && !isUtilizationWindow(value.utilizationWindow))
  )
    return false;
  if (value.status === 'unavailable') {
    return isString(value.reason) && ['amount', 'currency', 'method', 'basis', 'provenance', 'sourceCharge'].every(key => !(key in value));
  }
  if (
    value.status !== 'available' ||
    'reason' in value ||
    !isNonNegativeNumber(value.amount) ||
    typeof value.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(value.currency) ||
    !isRecord(value.sourceCharge) ||
    !isNonNegativeNumber(value.sourceCharge.amount) ||
    !Array.isArray(value.sourceCharge.dates) ||
    value.sourceCharge.dates.length === 0 ||
    !value.sourceCharge.dates.every(isCalendarDate) ||
    (value.sourceCharge.cadence !== undefined && value.sourceCharge.cadence !== 'monthly') ||
    (value.sourceCharge.periodStart !== undefined && !isCalendarDate(value.sourceCharge.periodStart)) ||
    (value.sourceCharge.periodEnd !== undefined && !isCalendarDate(value.sourceCharge.periodEnd)) ||
    (typeof value.sourceCharge.periodStart === 'string' &&
      typeof value.sourceCharge.periodEnd === 'string' &&
      Date.parse(value.sourceCharge.periodStart) > Date.parse(value.sourceCharge.periodEnd))
  )
    return false;
  return (
    (value.method === 'native-unused-amortized' && value.basis === 'amortized' && value.provenance === 'billing-backed-native') ||
    (value.method === 'recurring-charge-utilization-approximation' &&
      value.basis === 'billed' &&
      value.provenance === 'billing-backed-approximation' &&
      isUtilizationWindow(value.utilizationWindow))
  );
}
