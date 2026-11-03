import {
  AZURE_BILLING_FACTS_LIMITS_V1 as limits,
  type AzureBillingDailyFactsV1,
  type AzureBillingDriverGroupingV1,
  type AzureBillingDriversV1,
  type AzureBillingFactsCurrencyV1,
  type AzureBillingFactsPeriodV1,
  type AzureBillingFactsSourceV1,
  type AzureBillingFactsSpendAvailabilityV1,
  type AzureBillingFactsSpendV1,
  type AzureBillingOverviewV1,
  type AzureBillingWindowFactsV1,
  type AzureBillingWindowTotalsV1,
} from './billingFacts.js';
import {
  AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
  isAzureFinancialChargeSpendBreakdownV1,
  isAzureNativeDiscountEligibilityV1,
  type AzureFinancialChargeSpendBasisTotalsV1,
  type AzureFinancialChargeSpendSourceTotalsV1,
  type AzureFinancialChargeUnknownMaterialV1,
} from './financialChargePolicy.js';

type RecordValue = Record<string, unknown>;
const bases = ['billed', 'amortized'] as const;
const amounts = ['totalMinorUnits', 'billingBackedMinorUnits', 'estimatedMinorUnits'] as const;
const partitions = ['allCharge', 'azureNative', 'azureNativeDiscountEligible', 'marketplace', 'unknown'] as const;
const materialKeys = ['nonZeroRowCount', 'billedAbsoluteMinorUnits', 'amortizedAbsoluteMinorUnits'] as const;
const rowCountKeys = ['billingBackedRowCount', 'estimatedRowCount'] as const;
const moneyReasons = new Set(['billing-unavailable', 'not-produced', 'currency-unresolved', 'coverage-unproven']);
const driverReasons = new Set(['byte-budget-exceeded', 'group-limit-exceeded', 'source-unavailable', 'currency-unresolved', 'reconciliation-failed']);
const dayMilliseconds = 86400000;
const isRecord = (v: unknown): v is RecordValue =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const fields = (v: RecordValue, names: readonly string[]): boolean =>
  Object.keys(v).length === names.length && names.every(name => Object.prototype.hasOwnProperty.call(v, name));
const text = (v: unknown, max = 256): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= max && v === v.trim() && !/[\p{Cc}\p{Cf}\u2028\u2029]/u.test(v);
const identity = (v: unknown): v is string => text(v, 128) && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/u.test(v) && !v.includes('..');
const safeInteger = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v);
const count = (v: unknown): v is number => safeInteger(v) && v >= 0;
const sum = (values: readonly number[]): number | undefined => {
  let result = 0;
  for (const value of values) {
    result += value;
    if (!Number.isSafeInteger(result)) return undefined;
  }
  return result;
};
const isDate = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(v)) return false;
  const date = new Date(`${v}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === v;
};
const isPeriod = (v: unknown): v is AzureBillingFactsPeriodV1 =>
  isRecord(v) &&
  fields(v, ['startDate', 'endDateExclusive']) &&
  isDate(v.startDate) &&
  isDate(v.endDateExclusive) &&
  Date.parse(v.endDateExclusive) - Date.parse(v.startDate) === limits.maxDaysPerWindow * dayMilliseconds;
const samePeriod = (a: AzureBillingFactsPeriodV1, b: AzureBillingFactsPeriodV1): boolean =>
  a.startDate === b.startDate && a.endDateExclusive === b.endDateExclusive;
const inPeriod = (date: string, period: AzureBillingFactsPeriodV1): boolean => date >= period.startDate && date < period.endDateExclusive;
const unavailable = (v: unknown, reasons = moneyReasons): boolean =>
  isRecord(v) && fields(v, ['status', 'reasonCode']) && v.status === 'unavailable' && typeof v.reasonCode === 'string' && reasons.has(v.reasonCode);
const isBasis = (v: unknown): v is AzureFinancialChargeSpendBasisTotalsV1 =>
  unavailable(v) ||
  (isRecord(v) &&
    fields(v, ['status', ...amounts]) &&
    v.status === 'available' &&
    amounts.every(key => safeInteger(v[key])) &&
    sum([v.billingBackedMinorUnits as number, v.estimatedMinorUnits as number]) === v.totalMinorUnits);
const isSourceTotals = (v: unknown): v is AzureFinancialChargeSpendSourceTotalsV1 =>
  isRecord(v) && fields(v, bases) && bases.every(basis => isBasis(v[basis]));
const isMaterial = (v: unknown): v is AzureFinancialChargeUnknownMaterialV1 =>
  isRecord(v) &&
  fields(v, materialKeys) &&
  materialKeys.every(key => count(v[key])) &&
  (v.nonZeroRowCount === 0
    ? v.billedAbsoluteMinorUnits === 0 && v.amortizedAbsoluteMinorUnits === 0
    : (v.billedAbsoluteMinorUnits as number) > 0 || (v.amortizedAbsoluteMinorUnits as number) > 0);

const isSource = (v: unknown): v is AzureBillingFactsSourceV1 => {
  if (
    !isRecord(v) ||
    !fields(v, ['companyId', 'subscriptionId', 'portalGenerationId', 'billingInputGenerationId', 'current', 'previous']) ||
    !identity(v.companyId) ||
    !identity(v.portalGenerationId) ||
    !identity(v.billingInputGenerationId) ||
    typeof v.subscriptionId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(v.subscriptionId)
  )
    return false;
  for (const key of ['current', 'previous'] as const) {
    const receipt = v[key];
    const available = isRecord(receipt) && receipt.status === 'available';
    if (
      !isRecord(receipt) ||
      !fields(receipt, ['kind', 'period', 'fingerprint', 'status', ...(available ? ['sourcePath', 'etag'] : ['reasonCode'])]) ||
      receipt.kind !== `${key}30Days` ||
      !isPeriod(receipt.period) ||
      !text(receipt.fingerprint)
    )
      return false;
    if (available) {
      if (
        receipt.sourcePath !== (key === 'current' ? 'history/billing/cost-last-30-days.json' : 'history/billing/cost-last-30-days-previous.json') ||
        !text(receipt.etag)
      )
        return false;
    } else if (receipt.status !== 'unavailable' || typeof receipt.reasonCode !== 'string' || !moneyReasons.has(receipt.reasonCode)) return false;
  }
  const source = v as unknown as AzureBillingFactsSourceV1;
  return source.previous.period.endDateExclusive === source.current.period.startDate;
};

const isCurrency = (v: unknown): v is AzureBillingFactsCurrencyV1 =>
  unavailable(v, new Set(['currency-unresolved'])) ||
  (isRecord(v) &&
    fields(v, ['status', 'currencyCode', 'minorUnitScale', 'resolutionRef']) &&
    v.status === 'verified' &&
    typeof v.currencyCode === 'string' &&
    /^[A-Z]{3}$/u.test(v.currencyCode) &&
    count(v.minorUnitScale) &&
    v.minorUnitScale <= 6 &&
    text(v.resolutionRef));

const isSpend = (
  v: unknown,
  source: AzureBillingFactsSourceV1,
  period: AzureBillingFactsPeriodV1,
  currency: AzureBillingFactsCurrencyV1,
  sourceAvailable: boolean
): v is AzureBillingFactsSpendAvailabilityV1 => {
  if (unavailable(v, new Set([...moneyReasons, 'reconciliation-failed']))) return true;
  if (
    !sourceAvailable ||
    currency.status !== 'verified' ||
    !isRecord(v) ||
    !fields(v, ['status', ...partitions, ...rowCountKeys, 'discountEligibility', 'unknownMaterial']) ||
    !isRecord(v.discountEligibility) ||
    !rowCountKeys.every(key => count(v[key]))
  )
    return false;
  const rowCount = sum(rowCountKeys.map(key => v[key] as number));
  if (rowCount === undefined) return false;
  const eligibility = v.discountEligibility;
  if (eligibility.status === 'available') {
    if (!fields(eligibility, ['status', 'value']) || !isAzureNativeDiscountEligibilityV1(eligibility.value)) return false;
  } else if (!unavailable(eligibility)) return false;
  if (!isSourceTotals(v.azureNativeDiscountEligible)) return false;
  const eligibleTotals = v.azureNativeDiscountEligible;
  if (eligibility.status === 'unavailable' && bases.some(basis => eligibleTotals[basis].status !== 'unavailable')) return false;
  if (
    !isAzureFinancialChargeSpendBreakdownV1({
      contractVersion: 'financial-charge-spend/v1',
      policyRef: AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1,
      generationId: source.portalGenerationId,
      subject: { kind: 'provider-scope', providerScopeId: source.subscriptionId },
      period,
      currencyCode: currency.currencyCode,
      minorUnitScale: currency.minorUnitScale,
      status: v.status,
      allCharge: v.allCharge,
      azureNative: v.azureNative,
      marketplace: v.marketplace,
      unknown: v.unknown,
      unknownMaterial: v.unknownMaterial,
      azureNativeDiscountEligible: v.azureNativeDiscountEligible,
      ...(eligibility.status === 'available' ? { azureNativeDiscountEligibility: eligibility.value } : {}),
    })
  )
    return false;
  const spend = v as unknown as AzureBillingFactsSpendV1;
  if (spend.unknownMaterial.nonZeroRowCount > rowCount) return false;
  return partitions.every(partition =>
    bases.every(basis => {
      const amount = spend[partition][basis];
      return (
        amount.status === 'unavailable' ||
        ((spend.billingBackedRowCount !== 0 || amount.billingBackedMinorUnits === 0) &&
          (spend.estimatedRowCount !== 0 || amount.estimatedMinorUnits === 0))
      );
    })
  );
};

const isCoverage = (v: unknown, period: AzureBillingFactsPeriodV1, sourceAvailable: boolean): boolean => {
  if (
    !isRecord(v) ||
    !fields(v, ['status', 'rowCount', 'rowsWithoutDate', 'provenDates', 'observedDateRange']) ||
    !['complete', 'partial', 'unavailable'].includes(v.status as string) ||
    !count(v.rowCount) ||
    !count(v.rowsWithoutDate) ||
    v.rowsWithoutDate > v.rowCount ||
    !Array.isArray(v.provenDates) ||
    v.provenDates.length > limits.maxDaysPerWindow
  )
    return false;
  if (![...v.provenDates].every((date, i, dates) => isDate(date) && inPeriod(date, period) && (i === 0 || date > dates[i - 1]))) return false;
  if (v.observedDateRange !== null) {
    const range = v.observedDateRange;
    if (
      !isRecord(range) ||
      !fields(range, ['startDate', 'endDateInclusive']) ||
      !isDate(range.startDate) ||
      !isDate(range.endDateInclusive) ||
      !inPeriod(range.startDate, period) ||
      !inPeriod(range.endDateInclusive, period) ||
      range.startDate > range.endDateInclusive ||
      v.rowCount === v.rowsWithoutDate
    )
      return false;
  } else if (v.rowCount > v.rowsWithoutDate) return false;
  if (!sourceAvailable || v.status === 'unavailable')
    return !sourceAvailable && v.status === 'unavailable' && v.rowCount === 0 && v.provenDates.length === 0 && v.observedDateRange === null;
  return v.status !== 'complete' || (v.provenDates.length === limits.maxDaysPerWindow && v.rowsWithoutDate === 0);
};

const isDaily = (
  v: unknown,
  window: AzureBillingWindowFactsV1,
  currency: AzureBillingFactsCurrencyV1,
  sourceAvailable: boolean
): v is AzureBillingDailyFactsV1 => {
  if (!isRecord(v) || !isDate(v.date) || !inPeriod(v.date, window.period)) return false;
  if (v.status === 'unknown')
    return fields(v, ['date', 'status', 'reasonCode']) && typeof v.reasonCode === 'string' && moneyReasons.has(v.reasonCode);
  if (
    !sourceAvailable ||
    currency.status !== 'verified' ||
    window.spend.status === 'unavailable' ||
    !fields(v, ['date', 'status', ...rowCountKeys, 'allCharge', 'azureNativeDiscountEligible', 'unknownMaterial']) ||
    !rowCountKeys.every(key => count(v[key])) ||
    (v.status !== 'observed' && v.status !== 'verified-zero') ||
    !isSourceTotals(v.allCharge) ||
    !isSourceTotals(v.azureNativeDiscountEligible) ||
    !isMaterial(v.unknownMaterial)
  )
    return false;
  const rowCount = sum(rowCountKeys.map(key => v[key] as number));
  if (rowCount === undefined || v.unknownMaterial.nonZeroRowCount > rowCount || (v.status === 'observed' && rowCount === 0)) return false;
  for (const partition of [v.allCharge, v.azureNativeDiscountEligible]) {
    if (
      bases.some(basis => {
        const amount = partition[basis];
        return (
          amount.status === 'available' &&
          ((v.billingBackedRowCount === 0 && amount.billingBackedMinorUnits !== 0) || (v.estimatedRowCount === 0 && amount.estimatedMinorUnits !== 0))
        );
      })
    )
      return false;
  }
  if (
    v.status === 'observed' &&
    (window.coverage.observedDateRange === null ||
      v.date < window.coverage.observedDateRange.startDate ||
      v.date > window.coverage.observedDateRange.endDateInclusive)
  )
    return false;
  for (const basis of bases) {
    if (v.azureNativeDiscountEligible[basis].status === 'available' && v.allCharge[basis].status !== 'available') return false;
    if (window.spend.discountEligibility.status === 'unavailable' && v.azureNativeDiscountEligible[basis].status !== 'unavailable') return false;
  }
  if (v.status !== 'verified-zero') return true;
  const material = v.unknownMaterial;
  const allCharge = v.allCharge;
  return (
    window.coverage.provenDates.includes(v.date) &&
    materialKeys.every(key => material[key] === 0) &&
    bases.some(basis => allCharge[basis].status === 'available') &&
    [v.allCharge, v.azureNativeDiscountEligible].every(partition =>
      bases.every(basis => {
        const value = partition[basis];
        return value.status === 'unavailable' || amounts.every(key => value[key] === 0);
      })
    )
  );
};

/**
 * Validation only. Each of width independently rounded coordinates contributes
 * at most half a minor unit at the parent and each child. BigInt subtraction
 * preserves an exact comparison even for opposite signed safe-integer totals.
 */
const reconcilesInteger = (total: number, children: number[], width = 0): boolean => {
  const childTotal = sum(children);
  if (childTotal === undefined) return false;
  const difference = BigInt(total) - BigInt(childTotal);
  const bound = BigInt(children.length === 0 ? 0 : Math.floor(((children.length + 1) * width) / 2));
  return difference >= -bound && difference <= bound;
};

/** Sum already-produced canonical integers; never round, redistribute or project money. */
const reconcilesBasis = (
  total: AzureFinancialChargeSpendBasisTotalsV1,
  rows: AzureFinancialChargeSpendBasisTotalsV1[],
  independentRounding = false,
  allCharge = false
): boolean => {
  if (total.status === 'unavailable') return rows.length === 0 || rows.some(row => row.status === 'unavailable');
  if (rows.some(row => row.status !== 'available')) return false;
  return amounts.every(key =>
    reconcilesInteger(
      total[key],
      rows.map(row => (row.status === 'available' ? row[key] : 0)),
      independentRounding ? (key === 'totalMinorUnits' ? (allCharge ? 6 : 2) : allCharge ? 3 : 1) : 0
    )
  );
};
const reconcilesMaterial = (
  total: AzureFinancialChargeUnknownMaterialV1,
  rows: AzureFinancialChargeUnknownMaterialV1[],
  independentRounding = false
): boolean =>
  materialKeys.every(key => {
    const values = rows.map(row => row[key]);
    if (independentRounding && key === 'nonZeroRowCount') {
      // Materiality is thresholded at each scope. A child gross amount can round
      // to zero while contributing rows remain material at the parent scope.
      const childCount = sum(values);
      return childCount !== undefined && childCount <= total[key];
    }
    return reconcilesInteger(total[key], values, independentRounding ? 1 : 0);
  });

const isWindow = (
  v: unknown,
  key: 'current' | 'previous',
  source: AzureBillingFactsSourceV1,
  currency: AzureBillingFactsCurrencyV1,
  daily: boolean
): boolean => {
  const receipt = source[key];
  const hasRoundingMode = isRecord(v) && Object.prototype.hasOwnProperty.call(v, 'roundingMode');
  if (
    !isRecord(v) ||
    !fields(v, ['period', 'spend', ...(daily ? ['coverage', 'daily'] : []), ...(hasRoundingMode ? ['roundingMode'] : [])]) ||
    (hasRoundingMode && (!daily || v.roundingMode !== 'independent-minor-units')) ||
    !isPeriod(v.period) ||
    !samePeriod(v.period, receipt.period) ||
    !isSpend(v.spend, source, receipt.period, currency, receipt.status === 'available')
  )
    return false;
  if (!daily) return true;
  if (!isCoverage(v.coverage, receipt.period, receipt.status === 'available') || !Array.isArray(v.daily) || v.daily.length > limits.maxDaysPerWindow)
    return false;
  const window = v as unknown as AzureBillingWindowFactsV1;
  if (window.spend.status !== 'unavailable') {
    if (sum(rowCountKeys.map(key => (window.spend.status !== 'unavailable' ? window.spend[key] : 0))) !== window.coverage.rowCount) return false;
    if (window.spend.unknownMaterial.nonZeroRowCount > window.coverage.rowCount) return false;
    if (
      window.coverage.rowCount === 0 &&
      partitions.some(partition =>
        bases.some(basis => {
          const amount = window.spend.status !== 'unavailable' ? window.spend[partition][basis] : undefined;
          return amount?.status === 'available' && amounts.some(key => amount[key] !== 0);
        })
      )
    )
      return false;
  }
  if (
    ![...window.daily].every(
      (point, i, points) => isDaily(point, window, currency, receipt.status === 'available') && (i === 0 || point.date > points[i - 1].date)
    )
  )
    return false;
  if (window.coverage.status === 'complete' && window.daily.length !== limits.maxDaysPerWindow) return false;
  const known = window.daily.filter((point): point is Exclude<AzureBillingDailyFactsV1, { status: 'unknown' }> => point.status !== 'unknown');
  const independentRounding =
    window.roundingMode === 'independent-minor-units' && window.coverage.rowsWithoutDate === 0 && known.length === limits.maxDaysPerWindow;
  const knownRowCount = sum(known.map(point => sum(rowCountKeys.map(key => point[key])) as number));
  if (knownRowCount === undefined || knownRowCount > window.coverage.rowCount - window.coverage.rowsWithoutDate) return false;
  if (
    window.spend.status !== 'unavailable' &&
    rowCountKeys.some(key => {
      const observedCount = sum(known.map(point => point[key]));
      return observedCount === undefined || observedCount > (window.spend.status !== 'unavailable' ? window.spend[key] : 0);
    })
  )
    return false;
  if (
    window.spend.status !== 'unavailable' &&
    materialKeys.some(key => {
      const observedMaterial = sum(known.map(point => point.unknownMaterial[key]));
      if (observedMaterial === undefined) return true;
      const parentMaterial = window.spend.status !== 'unavailable' ? window.spend.unknownMaterial[key] : 0;
      if (window.roundingMode === 'independent-minor-units' && key !== 'nonZeroRowCount') {
        // Gross raw subset <= gross raw parent. Nearest rounding can make k
        // separately rounded known days exceed that parent by floor((k+1)/2).
        const bound = BigInt(Math.floor((known.length + 1) / 2));
        return BigInt(observedMaterial) - BigInt(parentMaterial) > bound;
      }
      return observedMaterial > parentMaterial;
    })
  )
    return false;
  if (window.spend.status !== 'unavailable' && window.coverage.rowsWithoutDate === 0 && known.length === limits.maxDaysPerWindow) {
    for (const partition of ['allCharge', 'azureNativeDiscountEligible'] as const) {
      if (
        !bases.every(basis =>
          reconcilesBasis(
            window.spend.status !== 'unavailable' ? window.spend[partition][basis] : { status: 'unavailable', reasonCode: 'not-produced' },
            known.map(point => point[partition][basis]),
            independentRounding,
            partition === 'allCharge'
          )
        )
      )
        return false;
    }
    if (
      !reconcilesMaterial(
        window.spend.unknownMaterial,
        known.map(point => point.unknownMaterial),
        independentRounding
      )
    )
      return false;
    if (!rowCountKeys.every(key => sum(known.map(point => point[key])) === (window.spend.status !== 'unavailable' ? window.spend[key] : undefined)))
      return false;
  }
  return true;
};

const reconcilesSpends = (
  total: AzureBillingFactsSpendAvailabilityV1,
  rows: AzureBillingFactsSpendAvailabilityV1[],
  independentRounding = false
): boolean => {
  if (total.status === 'unavailable') return rows.every(row => row.status === 'unavailable');
  if (rows.some(row => row.status === 'unavailable')) return false;
  const present = rows as AzureBillingFactsSpendV1[];
  if (!rowCountKeys.every(key => sum(present.map(row => row[key])) === total[key])) return false;
  if (
    !partitions.every(partition =>
      bases.every(basis =>
        reconcilesBasis(
          total[partition][basis],
          present.map(row => row[partition][basis]),
          independentRounding,
          partition === 'allCharge'
        )
      )
    ) ||
    !reconcilesMaterial(
      total.unknownMaterial,
      present.map(row => row.unknownMaterial),
      independentRounding
    )
  )
    return false;
  // Membership is gross row evidence. An empty native group can be all-eligible;
  // neither zero amounts nor group membership labels prove aggregate membership.
  return true;
};

const isGrouping = (
  v: unknown,
  source: AzureBillingFactsSourceV1,
  currency: AzureBillingFactsCurrencyV1,
  current: AzureBillingWindowTotalsV1,
  previous: AzureBillingWindowTotalsV1
): v is AzureBillingDriverGroupingV1 => {
  if (unavailable(v, driverReasons)) return true;
  const hasRoundingMode = isRecord(v) && Object.prototype.hasOwnProperty.call(v, 'roundingMode');
  if (
    !isRecord(v) ||
    !fields(v, ['status', 'rows', ...(hasRoundingMode ? ['roundingMode'] : [])]) ||
    (hasRoundingMode && v.roundingMode !== 'independent-minor-units') ||
    v.status !== 'complete' ||
    !Array.isArray(v.rows) ||
    v.rows.length > limits.maxDriverRowsPerGrouping
  )
    return false;
  const seen = new Set<string>();
  for (const row of v.rows) {
    if (
      !isRecord(row) ||
      !fields(row, ['id', 'label', 'current', 'previous']) ||
      !text(row.id) ||
      !text(row.label, limits.maxLabelLength) ||
      /(?:^|\/)\.\.?(?:\/|$)|[\\?#%]/u.test(row.id) ||
      seen.has(row.id)
    )
      return false;
    seen.add(row.id);
    if (
      !isSpend(row.current, source, source.current.period, currency, source.current.status === 'available') ||
      !isSpend(row.previous, source, source.previous.period, currency, source.previous.status === 'available')
    )
      return false;
  }
  const grouping = v as unknown as Extract<AzureBillingDriverGroupingV1, { status: 'complete' }>;
  return (
    reconcilesSpends(
      current.spend,
      grouping.rows.map(row => row.current),
      grouping.roundingMode === 'independent-minor-units'
    ) &&
    reconcilesSpends(
      previous.spend,
      grouping.rows.map(row => row.previous),
      grouping.roundingMode === 'independent-minor-units'
    )
  );
};

const isHeader = (v: RecordValue, kind: string): boolean => {
  if (
    v.schemaVersion !== 1 ||
    v.artifactKind !== kind ||
    typeof v.generatedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(v.generatedAt)
  )
    return false;
  const date = new Date(v.generatedAt);
  return Number.isFinite(date.getTime()) && date.toISOString() === v.generatedAt && isSource(v.source) && isCurrency(v.currency);
};

/** UTF-8 size without a platform/DOM dependency. Structural validation bounds nesting and strings first. */
const withinBudget = (v: unknown, maximum: number): boolean => {
  const json = JSON.stringify(v);
  let bytes = 0;
  for (const character of json) {
    const code = character.codePointAt(0) as number;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes > maximum) return false;
  }
  return true;
};

/** Structural/internal reconciliation guard; readers must additionally match the authorized owning manifest. */
export const isAzureBillingOverviewV1 = (v: unknown): v is AzureBillingOverviewV1 => {
  try {
    if (
      !isRecord(v) ||
      !fields(v, ['schemaVersion', 'artifactKind', 'generatedAt', 'source', 'currency', 'current', 'previous', 'drivers']) ||
      !isHeader(v, 'billing-overview')
    )
      return false;
    const overview = v as unknown as AzureBillingOverviewV1;
    if (
      !isWindow(overview.current, 'current', overview.source, overview.currency, true) ||
      !isWindow(overview.previous, 'previous', overview.source, overview.currency, true)
    )
      return false;
    if (
      !unavailable(v.drivers, driverReasons) &&
      !(
        isRecord(v.drivers) &&
        fields(v.drivers, ['status', 'relativePath']) &&
        v.drivers.status === 'available' &&
        v.drivers.relativePath === 'billing-drivers.json'
      )
    )
      return false;
    return withinBudget(v, limits.overviewMaxDecodedBytes);
  } catch {
    return false;
  }
};

/** Complete group populations only; global ranking happens after the current company projection. */
export const isAzureBillingDriversV1 = (v: unknown): v is AzureBillingDriversV1 => {
  try {
    if (
      !isRecord(v) ||
      !fields(v, ['schemaVersion', 'artifactKind', 'generatedAt', 'source', 'currency', 'current', 'previous', 'service', 'resourceType']) ||
      !isHeader(v, 'billing-drivers')
    )
      return false;
    const drivers = v as unknown as AzureBillingDriversV1;
    return (
      isWindow(drivers.current, 'current', drivers.source, drivers.currency, false) &&
      isWindow(drivers.previous, 'previous', drivers.source, drivers.currency, false) &&
      isGrouping(drivers.service, drivers.source, drivers.currency, drivers.current, drivers.previous) &&
      isGrouping(drivers.resourceType, drivers.source, drivers.currency, drivers.current, drivers.previous) &&
      withinBudget(v, limits.driversMaxDecodedBytes)
    );
  } catch {
    return false;
  }
};
