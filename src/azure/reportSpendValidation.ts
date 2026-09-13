import { isPublicCostComposition, type PublicComponentAvailability, type PublicCostBasisComposition } from './costComposition';
import { isBoundedRows, isRecord } from './reportEvidenceValidationHelpers';
import {
  REPORT_SPEND_LIMITS,
  type ReportSavingsBasis,
  type ReportSpendAmounts,
  type ReportSpendProjection,
  type ReportSpendService,
} from './reportSpend';
import { isReportCalendarDate, isReportCurrency, isReportText, isReportUtcTimestamp, reportMoneyUnits } from './reportSpendValidationHelpers';

const bases = ['billed', 'amortized'] as const;
const coverageStates = new Set(['complete', 'partial', 'unavailable']);
const exactFields = (value: Record<string, unknown>, required: string[], optional: string[] = []): boolean =>
  required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
  Object.keys(value).every(key => [...required, ...optional].includes(key));

export const isReportSavingsBasis = (value: unknown): value is ReportSavingsBasis =>
  typeof value === 'string' && ['billed', 'amortized', 'retail', 'mixed', 'unknown'].includes(value);

const amountOf = (value: PublicComponentAvailability): bigint | undefined =>
  value.status === 'available' ? reportMoneyUnits(value.component.amount) : undefined;

function isBasisConsistent(basis: PublicCostBasisComposition, coverage: unknown, lens: string): boolean {
  if (!isRecord(coverage) || !exactFields(coverage, ['actual', 'estimated', 'combined'])) return false;
  const components = { actual: basis.actual.availability, estimated: basis.estimated.availability, combined: basis.combined };
  for (const key of ['actual', 'estimated', 'combined'] as const) {
    if (!coverageStates.has(coverage[key] as string)) return false;
    const available = components[key].status === 'available';
    if (available !== (coverage[key] !== 'unavailable')) return false;
    if (available && amountOf(components[key]) === undefined) return false;
    if (key !== 'combined' && available && basis[key].support !== 'supported') return false;
  }
  const actual = amountOf(components.actual);
  const estimated = amountOf(components.estimated);
  const expectedStatus =
    actual !== undefined
      ? estimated !== undefined
        ? 'actual-plus-estimated'
        : 'actual-only'
      : estimated !== undefined
        ? 'estimated-only'
        : 'unavailable';
  if (basis.status !== expectedStatus) return false;
  const combined = amountOf(basis.combined);
  // Reconciliation may withhold the combined amount even when individual components are available.
  if (combined === undefined) return true;
  if (lens === 'actual-only') return actual === combined && coverage.combined === coverage.actual;
  if (lens === 'estimates-only') return estimated === combined && coverage.combined === coverage.estimated;
  if (actual === undefined && estimated === undefined) return false;
  if (combined !== (actual ?? 0n) + (estimated ?? 0n)) return false;
  // A single partial component cannot become a complete combined total. Two components require producer coverage proof.
  if (actual === undefined) return coverage.combined === coverage.estimated;
  if (estimated === undefined) return coverage.combined === coverage.actual;
  return true;
}

export function isReportSpendAmounts(value: unknown, currency?: string, generatedAt?: string): value is ReportSpendAmounts {
  if (!isRecord(value) || !exactFields(value, ['composition', 'coverage', 'retail'], ['estimates']) || !isPublicCostComposition(value.composition))
    return false;
  if (!isRecord(value.coverage) || !exactFields(value.coverage, [...bases])) return false;
  if (currency !== undefined && !isReportCurrency(currency)) return false;
  if (generatedAt !== undefined && !isReportUtcTimestamp(generatedAt)) return false;
  if (value.estimates !== undefined && (!isRecord(value.estimates) || !exactFields(value.estimates, [], [...bases]))) return false;
  const currencies = new Set<string>();
  if (currency) currencies.add(currency);
  for (const key of bases) {
    const basis = value.composition[key];
    if (!isBasisConsistent(basis, value.coverage[key], value.composition.selectedLens)) return false;
    for (const item of [basis.actual.availability, basis.estimated.availability, basis.combined]) {
      if (item.status === 'available') {
        if (!isReportCurrency(item.component.currencyCode)) return false;
        currencies.add(item.component.currencyCode);
      }
    }
    const estimate = isRecord(value.estimates) ? value.estimates[key] : undefined;
    if (basis.estimated.availability.status === 'available') {
      if (
        !isRecord(estimate) ||
        !exactFields(estimate, ['reason', 'method', 'observedAt']) ||
        !['billing-lag', 'billing-unavailable-sponsorship', 'other'].includes(estimate.reason as string) ||
        !isReportText(estimate.method) ||
        !isReportUtcTimestamp(estimate.observedAt) ||
        (generatedAt !== undefined && Date.parse(estimate.observedAt) > Date.parse(generatedAt))
      )
        return false;
    } else if (estimate !== undefined) return false;
  }
  const retail = value.retail;
  if (!isRecord(retail)) return false;
  if (retail.status === 'unavailable') {
    if (!exactFields(retail, ['status'])) return false;
  } else {
    if (
      retail.status !== 'available' ||
      !exactFields(retail, ['status', 'component', 'coverage', 'scopeDescription', 'pricingSource', 'pricedAt', 'assumptions']) ||
      !isRecord(retail.component) ||
      !exactFields(retail.component, ['amount', 'currencyCode']) ||
      !isReportCurrency(retail.component.currencyCode) ||
      !['complete', 'partial'].includes(retail.coverage as string) ||
      !isReportText(retail.scopeDescription) ||
      !isReportText(retail.pricingSource) ||
      !isReportUtcTimestamp(retail.pricedAt) ||
      (generatedAt !== undefined && Date.parse(retail.pricedAt) > Date.parse(generatedAt)) ||
      !Array.isArray(retail.assumptions) ||
      retail.assumptions.length > REPORT_SPEND_LIMITS.assumptions ||
      !retail.assumptions.every(isReportText)
    )
      return false;
    const amount = reportMoneyUnits(retail.component.amount);
    if (amount === undefined || amount < 0n) return false;
    currencies.add(retail.component.currencyCode);
  }
  return currencies.size <= 1;
}

export const hasReportSpendValue = (value: ReportSpendAmounts): boolean =>
  value.retail.status === 'available' ||
  bases.some(
    key => value.composition[key].actual.availability.status === 'available' || value.composition[key].estimated.availability.status === 'available'
  );

/** Dates, population completeness and actual/estimated selection remain independent checks. */
export const isReportSpendProjection = (value: unknown): value is ReportSpendProjection => {
  if (
    !isRecord(value) ||
    !exactFields(value, ['currency', 'dateBasis', 'generatedAt', 'freshness', 'periods'], ['sourceObservedAt']) ||
    !isReportCurrency(value.currency) ||
    value.dateBasis !== 'billing-calendar' ||
    !isReportUtcTimestamp(value.generatedAt) ||
    !['current', 'stale', 'unavailable'].includes(value.freshness as string) ||
    !Array.isArray(value.periods) ||
    value.periods.length > REPORT_SPEND_LIMITS.periods
  )
    return false;
  if (
    value.sourceObservedAt !== undefined &&
    (!isReportUtcTimestamp(value.sourceObservedAt) || Date.parse(value.sourceObservedAt) > Date.parse(value.generatedAt))
  )
    return false;
  const seen = new Set<string>();
  let rollingCount = 0;
  let historicalCount = 0;
  let available = false;
  for (const period of value.periods) {
    if (
      !isRecord(period) ||
      !exactFields(period, ['kind', 'startDate', 'endDate', 'amounts'], ['services']) ||
      !['calendar-month', 'billing-period', 'rolling-30-days'].includes(period.kind as string) ||
      !isReportCalendarDate(period.startDate) ||
      !isReportCalendarDate(period.endDate)
    )
      return false;
    const days = (Date.parse(period.endDate) - Date.parse(period.startDate)) / 86400000 + 1;
    if (days < 1 || days > REPORT_SPEND_LIMITS.periodDays) return false;
    if (period.kind === 'calendar-month') {
      const following = new Date(Date.parse(period.endDate) + 86400000).toISOString().slice(0, 10);
      if (!period.startDate.endsWith('-01') || period.startDate.slice(0, 7) !== period.endDate.slice(0, 7) || !following.endsWith('-01'))
        return false;
    }
    if (period.kind === 'rolling-30-days') {
      if (days !== 30 || ++rollingCount > 1) return false;
    } else if (++historicalCount > 13) return false;
    const key = `${period.kind}:${period.startDate}:${period.endDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (!isReportSpendAmounts(period.amounts, value.currency, value.generatedAt)) return false;
    available ||= hasReportSpendValue(period.amounts);
    if (period.services !== undefined) {
      const serviceKeys = new Set<string>();
      if (
        !isBoundedRows(period.services, REPORT_SPEND_LIMITS.servicesPerPeriod, (row): row is ReportSpendService => {
          if (
            !isRecord(row) ||
            !exactFields(row, ['serviceKey', 'name', 'amounts']) ||
            !isReportText(row.serviceKey) ||
            !isReportText(row.name) ||
            serviceKeys.has(row.serviceKey) ||
            !isReportSpendAmounts(row.amounts, value.currency as string, value.generatedAt as string)
          )
            return false;
          serviceKeys.add(row.serviceKey);
          available ||= hasReportSpendValue(row.amounts);
          return true;
        })
      )
        return false;
    }
  }
  return available ? value.sourceObservedAt !== undefined && value.freshness !== 'unavailable' : value.freshness === 'unavailable';
};
