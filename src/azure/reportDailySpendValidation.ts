import { REPORT_DAILY_SPEND_MAX_DAYS, type ReportDailySpend } from './reportDailySpend';
import { isCount, isFiniteNumber, isRecord } from './reportEvidenceValidationHelpers';
import { hasReportSpendValue, isReportSpendAmounts } from './reportSpendValidation';
import { isReportCalendarDate as isCalendarDate, isReportUtcTimestamp as isUtcTimestamp } from './reportSpendValidationHelpers';

const DAY_MS = 86_400_000;

const isCoverage = (value: unknown, covered: number, expected: number): boolean => {
  const status = covered === expected ? 'complete' : covered === 0 ? 'unavailable' : 'partial';
  return isRecord(value) && isCount(value.coveredDayCount) && value.coveredDayCount === covered && value.status === status;
};

export const isReportDailySpend = (value: unknown): value is ReportDailySpend => {
  if (
    !isRecord(value) ||
    !isCalendarDate(value.startDate) ||
    !isCalendarDate(value.endDate) ||
    value.dateBasis !== 'billing-calendar' ||
    typeof value.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(value.currency) ||
    !isUtcTimestamp(value.generatedAt) ||
    !['current', 'stale', 'unavailable'].includes(value.freshness as string) ||
    !isRecord(value.coverage) ||
    !Array.isArray(value.entries) ||
    value.entries.length > REPORT_DAILY_SPEND_MAX_DAYS
  )
    return false;

  const expected = (Date.parse(value.endDate) - Date.parse(value.startDate)) / DAY_MS + 1;
  if (expected < 1 || expected > REPORT_DAILY_SPEND_MAX_DAYS) return false;
  if (
    (value.sourceObservedAt !== undefined &&
      (!isUtcTimestamp(value.sourceObservedAt) || Date.parse(value.sourceObservedAt) > Date.parse(value.generatedAt))) ||
    (value.entries.length > 0 && (value.sourceObservedAt === undefined || value.freshness === 'unavailable'))
  )
    return false;

  let previousDate = '';
  let billedDays = 0;
  let amortizedDays = 0;
  for (const entry of value.entries) {
    if (
      !isRecord(entry) ||
      !isCalendarDate(entry.date) ||
      entry.date <= previousDate ||
      entry.date < value.startDate ||
      entry.date > value.endDate ||
      (entry.cost === undefined && entry.costAmortized === undefined && entry.financials === undefined) ||
      (entry.cost !== undefined && !isFiniteNumber(entry.cost)) ||
      (entry.costAmortized !== undefined && !isFiniteNumber(entry.costAmortized))
    )
      return false;
    if (entry.financials !== undefined) {
      if (!isReportSpendAmounts(entry.financials, value.currency, value.generatedAt) || !hasReportSpendValue(entry.financials)) return false;
      for (const [basis, field] of [
        ['billed', 'cost'],
        ['amortized', 'costAmortized'],
      ] as const) {
        const actual = entry.financials.composition[basis].actual.availability;
        const complete = entry.financials.coverage[basis].actual === 'complete';
        if (actual.status === 'available' && complete) {
          if (entry[field] !== Number(actual.component.amount)) return false;
        } else if (entry[field] !== undefined) return false;
      }
    }
    previousDate = entry.date;
    if (entry.cost !== undefined) billedDays++;
    if (entry.costAmortized !== undefined) amortizedDays++;
  }
  return isCoverage(value.coverage.billed, billedDays, expected) && isCoverage(value.coverage.amortized, amortizedDays, expected);
};
