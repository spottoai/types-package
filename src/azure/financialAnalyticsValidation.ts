import { sha256Utf8 } from '../common/sha256';
import {
  addExactDecimalValues,
  formatExactDecimalValue,
  multiplyExactDecimalValues,
  parseCanonicalDecimal,
  subtractExactDecimalValues,
} from '../common/exactDecimal';
import { isCanonicalExactMoney } from './financialValidationPrimitives';
import {
  FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1,
  FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1,
  type FinancialAnalyticsInputIdentityPreimageV1,
  type FinancialAnalyticsInputSeriesV1,
  type FinancialAnalyticsDailyPointV1,
  type FinancialAnalyticsProjectionIdentityPreimageV1,
  type FinancialAnalyticsProjectionV1,
} from './financialAnalytics';
import {
  FINANCIAL_DATAFLOW_LIMITS_V1,
  canonicalizeFinancialDataflowJsonV1,
  hasFinancialDataflowExactFieldsV1,
  isFinancialDataflowCalendarDateV1,
  canonicalizeFinancialDataflowCoordinateV1,
  isFinancialDataflowCoordinateV1,
  isFinancialDataflowHashV1,
  isFinancialDataflowIdentityV1,
  isFinancialDataflowIsoInstantV1,
  isFinancialDataflowRecordV1,
  isFinancialDataflowValueWithinLimitsV1,
} from './financialDataflowValidation';
import type { CurrentSpendCompositionV1, FinancialDataflowCoordinateV1 } from './financialDataflow';
import { isCurrentSpendCompositionV1 } from './financialDataflowValidation';

const MAX_POINTS = 3660;
const MAX_GAPS = 3660;
const MAX_REFERENCE_COMPOSITIONS = 2;

const isReasonCodes = (value: unknown): value is [string, ...string[]] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= FINANCIAL_DATAFLOW_LIMITS_V1.maximumReasonCodes &&
  value.every(isFinancialDataflowIdentityV1) &&
  new Set(value).size === value.length;

const intervalDayCount = (startDate: string, endDateExclusive: string): number | undefined => {
  const days = (Date.parse(`${endDateExclusive}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / 86_400_000;
  return Number.isSafeInteger(days) && days > 0 ? days : undefined;
};

const coordinateCurrency = (value: unknown): string | undefined => {
  if (!isFinancialDataflowCoordinateV1(value) || value.accountingCurrency.status !== 'resolved') return undefined;
  return value.accountingCurrency.currencyCode;
};

const comparableCoordinate = (value: FinancialDataflowCoordinateV1): unknown => ({
  companyId: value.companyId,
  provider: value.provider,
  providerAccountRefs: [...value.providerAccountRefs].sort(),
  scope: value.scope,
  costBasis: value.costBasis,
  estimateLens: value.estimateLens,
  requestedCurrencyCode: value.requestedCurrencyCode,
  accountingCurrency: value.accountingCurrency,
  chargeInclusionPolicyRef: value.chargeInclusionPolicyRef,
});

const hasSameFinancialDimensions = (left: FinancialDataflowCoordinateV1, right: FinancialDataflowCoordinateV1): boolean =>
  canonicalizeFinancialDataflowJsonV1(comparableCoordinate(left)) === canonicalizeFinancialDataflowJsonV1(comparableCoordinate(right));

const hasComparableTrendPeriods = (current: FinancialDataflowCoordinateV1, comparison: FinancialDataflowCoordinateV1): boolean => {
  if (
    current.period.windowKind !== comparison.period.windowKind ||
    current.period.requested.dateBasis !== comparison.period.requested.dateBasis ||
    current.period.requested.timeZone !== comparison.period.requested.timeZone
  ) {
    return false;
  }
  if (current.period.windowKind === 'calendar-month' || current.period.windowKind === 'provider-billing-period') return true;
  return (
    intervalDayCount(current.period.requested.startDate, current.period.requested.endDateExclusive) ===
    intervalDayCount(comparison.period.requested.startDate, comparison.period.requested.endDateExclusive)
  );
};

const periodContains = (container: FinancialDataflowCoordinateV1, target: FinancialDataflowCoordinateV1): boolean =>
  container.period.requested.dateBasis === target.period.requested.dateBasis &&
  container.period.requested.timeZone === target.period.requested.timeZone &&
  container.period.requested.startDate <= target.period.requested.startDate &&
  container.period.requested.endDateExclusive >= target.period.requested.endDateExclusive;

const isInputIdentity = (value: unknown): value is FinancialAnalyticsInputIdentityPreimageV1 => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
      'schemaVersion',
      'contractVersion',
      'coordinate',
      'granularity',
      'producerGenerationId',
      'referenceCompositions',
      'points',
      'gaps',
      'coverage',
      'algorithmVersion',
    ]) ||
    value.schemaVersion !== 1 ||
    value.contractVersion !== FINANCIAL_ANALYTICS_INPUT_CONTRACT_VERSION_V1 ||
    !isFinancialDataflowCoordinateV1(value.coordinate) ||
    value.coordinate.periodRole !== 'analytics-input' ||
    value.coordinate.period.windowKind !== 'analytics-history' ||
    value.coordinate.accountingCurrency.status !== 'resolved' ||
    value.granularity !== 'daily' ||
    !isFinancialDataflowIdentityV1(value.producerGenerationId) ||
    !Array.isArray(value.referenceCompositions) ||
    value.referenceCompositions.length > MAX_REFERENCE_COMPOSITIONS ||
    !Array.isArray(value.points) ||
    value.points.length > MAX_POINTS ||
    !Array.isArray(value.gaps) ||
    value.gaps.length > MAX_GAPS ||
    !isFinancialDataflowRecordV1(value.coverage) ||
    !hasFinancialDataflowExactFieldsV1(value.coverage, ['availableDayCount', 'partialDayCount', 'unavailableDayCount']) ||
    !isFinancialDataflowIdentityV1(value.algorithmVersion)
  ) {
    return false;
  }
  const coordinate = value.coordinate;
  const referenceCompositions = value.referenceCompositions;
  if (!referenceCompositions.every(isCurrentSpendCompositionV1)) return false;
  const referenceRoles = referenceCompositions.map(composition => composition.coordinate.periodRole);
  if (
    new Set(referenceCompositions.map(composition => composition.compositionId)).size !== referenceCompositions.length ||
    new Set(referenceRoles).size !== referenceRoles.length ||
    referenceCompositions.some(composition => !hasSameFinancialDimensions(coordinate, composition.coordinate))
  ) {
    return false;
  }
  const gaps = value.gaps;
  const requested = value.coordinate.period.requested;
  const dates = new Set<string>();
  let availableDayCount = 0;
  let partialDayCount = 0;
  for (const point of value.points) {
    if (
      !isFinancialDataflowRecordV1(point) ||
      !isFinancialDataflowCalendarDateV1(point.date) ||
      point.date < requested.startDate ||
      point.date >= requested.endDateExclusive ||
      dates.has(point.date) ||
      !isFinancialDataflowHashV1(point.compositionId)
    ) {
      return false;
    }
    dates.add(point.date);
    const pointForecastFields = [
      point.forecastEligibleAmount,
      point.oneTimeAmount,
      point.unknownRecurrenceAmount,
    ];
    if (
      !pointForecastFields.every(amount => isCanonicalExactMoney({ amount, currencyCode: coordinate.accountingCurrency.currencyCode })) ||
      (point.forecastStatus !== 'available' && point.forecastStatus !== 'partial') ||
      (point.forecastStatus === 'available'
        ? point.forecastReasonCodes !== undefined || point.unknownRecurrenceAmount !== '0'
        : !isReasonCodes(point.forecastReasonCodes))
    ) {
      return false;
    }
    if (point.status === 'available') {
      if (
        !hasFinancialDataflowExactFieldsV1(
          point,
          [
            'date',
            'compositionId',
            'status',
            'amount',
            'forecastEligibleAmount',
            'oneTimeAmount',
            'unknownRecurrenceAmount',
            'forecastStatus',
          ],
          ['forecastReasonCodes']
        ) ||
        !isCanonicalExactMoney({ amount: point.amount, currencyCode: coordinate.accountingCurrency.currencyCode })
      )
        return false;
      availableDayCount += 1;
    } else {
      if (
        point.status !== 'partial' ||
        !hasFinancialDataflowExactFieldsV1(
          point,
          [
            'date',
            'compositionId',
            'status',
            'knownAmount',
            'reasonCodes',
            'forecastEligibleAmount',
            'oneTimeAmount',
            'unknownRecurrenceAmount',
            'forecastStatus',
          ],
          ['forecastReasonCodes']
        ) ||
        !isCanonicalExactMoney({ amount: point.knownAmount, currencyCode: coordinate.accountingCurrency.currencyCode }) ||
        !isReasonCodes(point.reasonCodes)
      )
        return false;
      partialDayCount += 1;
    }
  }
  let unavailableDayCount = 0;
  const gapKeys = new Set<string>();
  const segments = value.points.map(point => ({
    startDate: String(point.date),
    endDateExclusive: new Date(Date.parse(`${String(point.date)}T00:00:00.000Z`) + 86_400_000).toISOString().slice(0, 10),
  }));
  for (const gap of gaps) {
    if (
      !isFinancialDataflowRecordV1(gap) ||
      !hasFinancialDataflowExactFieldsV1(gap, ['startDate', 'endDateExclusive', 'reasonCodes']) ||
      !isFinancialDataflowCalendarDateV1(gap.startDate) ||
      !isFinancialDataflowCalendarDateV1(gap.endDateExclusive) ||
      gap.startDate < requested.startDate ||
      gap.endDateExclusive > requested.endDateExclusive ||
      gap.startDate >= gap.endDateExclusive ||
      !isReasonCodes(gap.reasonCodes)
    )
      return false;
    const key = `${gap.startDate}\u0000${gap.endDateExclusive}`;
    if (gapKeys.has(key)) return false;
    gapKeys.add(key);
    const days = intervalDayCount(gap.startDate, gap.endDateExclusive);
    if (days === undefined) return false;
    segments.push({ startDate: gap.startDate, endDateExclusive: gap.endDateExclusive });
    unavailableDayCount += days;
  }
  const expectedDays = intervalDayCount(requested.startDate, requested.endDateExclusive);
  const sortedSegments = segments.sort((left, right) =>
    `${left.startDate}\u0000${left.endDateExclusive}`.localeCompare(`${right.startDate}\u0000${right.endDateExclusive}`)
  );
  let cursor = requested.startDate;
  for (const segment of sortedSegments) {
    if (segment.startDate !== cursor || segment.endDateExclusive <= segment.startDate) return false;
    cursor = segment.endDateExclusive;
  }
  return (
    expectedDays !== undefined &&
    Number.isSafeInteger(value.coverage.availableDayCount) &&
    Number.isSafeInteger(value.coverage.partialDayCount) &&
    Number.isSafeInteger(value.coverage.unavailableDayCount) &&
    value.coverage.availableDayCount === availableDayCount &&
    value.coverage.partialDayCount === partialDayCount &&
    value.coverage.unavailableDayCount === unavailableDayCount &&
    availableDayCount + partialDayCount + unavailableDayCount === expectedDays &&
    cursor === requested.endDateExclusive
  );
};

export const canonicalizeFinancialAnalyticsInputIdentityV1 = (value: FinancialAnalyticsInputIdentityPreimageV1): string => {
  if (!isFinancialDataflowValueWithinLimitsV1(value) || !isInputIdentity(value)) {
    throw new TypeError('Invalid FinancialAnalyticsInputIdentityPreimageV1.');
  }
  return canonicalizeFinancialDataflowJsonV1({
    ...value,
    coordinate: { ...value.coordinate, providerAccountRefs: [...value.coordinate.providerAccountRefs].sort() },
    referenceCompositions: [...value.referenceCompositions].sort((left, right) => left.compositionId.localeCompare(right.compositionId)),
    points: [...value.points]
      .sort((left, right) => left.date.localeCompare(right.date))
      .map(point => ({
        ...point,
        ...(point.status === 'partial' ? { reasonCodes: [...point.reasonCodes].sort() } : {}),
        ...(point.forecastReasonCodes === undefined
          ? {}
          : { forecastReasonCodes: [...point.forecastReasonCodes].sort() }),
      })),
    gaps: [...value.gaps]
      .sort((left, right) => `${left.startDate}\u0000${left.endDateExclusive}`.localeCompare(`${right.startDate}\u0000${right.endDateExclusive}`))
      .map(gap => ({ ...gap, reasonCodes: [...gap.reasonCodes].sort() })),
  });
};

export const createFinancialAnalyticsInputIdV1 = (value: FinancialAnalyticsInputIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsInputIdentityV1(value))}`;

export const isFinancialAnalyticsInputSeriesV1 = (value: unknown): value is FinancialAnalyticsInputSeriesV1 => {
  if (
    !isFinancialDataflowValueWithinLimitsV1(value) ||
    !isFinancialDataflowRecordV1(value) ||
    !Object.prototype.hasOwnProperty.call(value, 'analyticsInputId')
  )
    return false;
  const { analyticsInputId, ...identity } = value;
  return isFinancialDataflowHashV1(analyticsInputId) && isInputIdentity(identity) && analyticsInputId === createFinancialAnalyticsInputIdV1(identity);
};

const nextCalendarDate = (value: string): string => new Date(Date.parse(`${value}T00:00:00.000Z`) + 86_400_000).toISOString().slice(0, 10);

const hasSameReasonCodes = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every(reasonCode => right.includes(reasonCode));

const hasSameForecastSlice = (
  point: FinancialAnalyticsDailyPointV1,
  composition: CurrentSpendCompositionV1
): boolean => {
  const selection = composition.chargeSelection;
  return selection !== undefined &&
  point.forecastEligibleAmount === selection.forecastEligibleAmount &&
  point.oneTimeAmount === selection.oneTimeAmount &&
  point.unknownRecurrenceAmount === selection.unknownRecurrenceAmount &&
  point.forecastStatus === selection.forecastStatus &&
  (point.forecastReasonCodes === undefined
    ? selection.forecastReasonCodes === undefined
    : selection.forecastReasonCodes !== undefined &&
      hasSameReasonCodes(point.forecastReasonCodes, selection.forecastReasonCodes));
};

/** Proves that every analytics point is an exact projection of its referenced daily composition. */
export const isFinancialAnalyticsInputSeriesCompatibleV1 = (input: unknown, dailyCompositions: unknown): boolean => {
  if (
    !isFinancialAnalyticsInputSeriesV1(input) ||
    !Array.isArray(dailyCompositions) ||
    dailyCompositions.length !== input.points.length ||
    !dailyCompositions.every(isCurrentSpendCompositionV1)
  ) {
    return false;
  }
  const compositions = dailyCompositions as CurrentSpendCompositionV1[];
  const compositionById = new Map(compositions.map(composition => [composition.compositionId, composition]));
  if (compositionById.size !== compositions.length) return false;
  return input.points.every(point => {
    const composition = compositionById.get(point.compositionId);
    if (
      composition === undefined ||
      composition.amount.status === 'unavailable' ||
      composition.coordinate.periodRole !== 'current-spend' ||
      composition.coordinate.period.windowKind !== 'daily' ||
      composition.coordinate.period.requested.startDate !== point.date ||
      composition.coordinate.period.requested.endDateExclusive !== nextCalendarDate(point.date) ||
      !hasSameFinancialDimensions(input.coordinate, composition.coordinate)
    ) {
      return false;
    }
    if (point.status === 'available') {
      return (
        composition.amount.status === 'available' &&
        point.amount === composition.amount.amount &&
        hasSameForecastSlice(point, composition)
      );
    }
    return (
      composition.amount.status === 'partial' &&
      point.knownAmount === composition.amount.knownAmount &&
      hasSameReasonCodes(point.reasonCodes, composition.amount.reasonCodes) &&
      hasSameForecastSlice(point, composition)
    );
  });
};

const isResult = (value: unknown, currency: string): boolean => {
  if (!isFinancialDataflowRecordV1(value)) return false;
  if (value.kind === 'forecast') {
    return (
      hasFinancialDataflowExactFieldsV1(value, ['kind', 'projectedTotal', 'projectedRemaining']) &&
      isCanonicalExactMoney(value.projectedTotal) &&
      isCanonicalExactMoney(value.projectedRemaining) &&
      value.projectedTotal.currencyCode === currency &&
      value.projectedRemaining.currencyCode === currency
    );
  }
  if (value.kind === 'trend') {
    if (
      !(
        hasFinancialDataflowExactFieldsV1(value, ['kind', 'comparisonCompositionId', 'direction', 'change'], ['percentChange']) &&
        isFinancialDataflowHashV1(value.comparisonCompositionId) &&
        ['increasing', 'decreasing', 'flat'].includes(String(value.direction)) &&
        isCanonicalExactMoney(value.change) &&
        value.change.currencyCode === currency &&
        (value.percentChange === undefined || isCanonicalExactMoney({ amount: value.percentChange, currencyCode: currency }))
      )
    )
      return false;
    try {
      const coefficient = parseCanonicalDecimal(value.change.amount).coefficient;
      return (
        (value.direction === 'flat' && coefficient === 0n) ||
        (value.direction === 'increasing' && coefficient > 0n) ||
        (value.direction === 'decreasing' && coefficient < 0n)
      );
    } catch {
      return false;
    }
  }
  return (
    value.kind === 'anomaly' &&
    hasFinancialDataflowExactFieldsV1(value, ['kind', 'events']) &&
    Array.isArray(value.events) &&
    value.events.length <= MAX_POINTS &&
    value.events.every(event => {
      if (
        !isFinancialDataflowRecordV1(event) ||
        !hasFinancialDataflowExactFieldsV1(event, ['date', 'observed', 'expected', 'delta', 'score']) ||
        !isFinancialDataflowCalendarDateV1(event.date) ||
        !isCanonicalExactMoney(event.observed) ||
        event.observed.currencyCode !== currency ||
        !isCanonicalExactMoney(event.expected) ||
        event.expected.currencyCode !== currency ||
        !isCanonicalExactMoney(event.delta) ||
        event.delta.currencyCode !== currency ||
        !isCanonicalExactMoney({ amount: event.score, currencyCode: currency })
      )
        return false;
      try {
        return (
          parseCanonicalDecimal(String(event.score)).coefficient >= 0n &&
          formatExactDecimalValue(
            subtractExactDecimalValues(parseCanonicalDecimal(event.observed.amount), parseCanonicalDecimal(event.expected.amount))
          ) === event.delta.amount
        );
      } catch {
        return false;
      }
    })
  );
};

const isProjectionIdentity = (value: unknown): value is FinancialAnalyticsProjectionIdentityPreimageV1 => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(
      value,
      ['schemaVersion', 'contractVersion', 'coordinate', 'outputGenerationId', 'method', 'algorithmVersion', 'producedAt', 'status'],
      ['analyticsInputId', 'currentSpendCompositionId', 'result', 'resultKind', 'reasonCodes']
    ) ||
    value.schemaVersion !== 1 ||
    value.contractVersion !== FINANCIAL_ANALYTICS_PROJECTION_CONTRACT_VERSION_V1 ||
    (value.analyticsInputId !== undefined && !isFinancialDataflowHashV1(value.analyticsInputId)) ||
    !isFinancialDataflowCoordinateV1(value.coordinate) ||
    value.coordinate.periodRole !== 'projection-target' ||
    !isFinancialDataflowIdentityV1(value.outputGenerationId) ||
    !isFinancialDataflowIdentityV1(value.method) ||
    !isFinancialDataflowIdentityV1(value.algorithmVersion) ||
    !isFinancialDataflowIsoInstantV1(value.producedAt) ||
    (value.currentSpendCompositionId !== undefined && !isFinancialDataflowHashV1(value.currentSpendCompositionId))
  ) {
    return false;
  }
  if (value.status === 'unavailable') {
    return value.result === undefined && ['forecast', 'trend', 'anomaly'].includes(String(value.resultKind)) && isReasonCodes(value.reasonCodes);
  }
  if (value.status !== 'available' && value.status !== 'partial') return false;
  if (value.resultKind !== undefined || !isFinancialDataflowRecordV1(value.result)) return false;
  if (value.status === 'available' ? value.reasonCodes !== undefined : !isReasonCodes(value.reasonCodes)) return false;
  const currency = coordinateCurrency(value.coordinate);
  return (
    isFinancialDataflowHashV1(value.analyticsInputId) &&
    isFinancialDataflowHashV1(value.currentSpendCompositionId) &&
    currency !== undefined &&
    isResult(value.result, currency)
  );
};

export const canonicalizeFinancialAnalyticsProjectionIdentityV1 = (value: FinancialAnalyticsProjectionIdentityPreimageV1): string => {
  if (!isFinancialDataflowValueWithinLimitsV1(value) || !isProjectionIdentity(value)) {
    throw new TypeError('Invalid FinancialAnalyticsProjectionIdentityPreimageV1.');
  }
  const canonical = {
    ...value,
    coordinate: { ...value.coordinate, providerAccountRefs: [...value.coordinate.providerAccountRefs].sort() },
    ...(value.reasonCodes === undefined ? {} : { reasonCodes: [...value.reasonCodes].sort() }),
    ...(value.result?.kind === 'anomaly'
      ? { result: { ...value.result, events: [...value.result.events].sort((left, right) => left.date.localeCompare(right.date)) } }
      : {}),
  };
  return canonicalizeFinancialDataflowJsonV1(canonical);
};

export const createFinancialAnalyticsProjectionIdV1 = (value: FinancialAnalyticsProjectionIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialAnalyticsProjectionIdentityV1(value))}`;

export const isFinancialAnalyticsProjectionV1 = (value: unknown): value is FinancialAnalyticsProjectionV1 => {
  if (
    !isFinancialDataflowValueWithinLimitsV1(value) ||
    !isFinancialDataflowRecordV1(value) ||
    !Object.prototype.hasOwnProperty.call(value, 'analyticsProjectionId')
  )
    return false;
  const { analyticsProjectionId, ...identity } = value;
  return (
    isFinancialDataflowHashV1(analyticsProjectionId) &&
    isProjectionIdentity(identity) &&
    analyticsProjectionId === createFinancialAnalyticsProjectionIdV1(identity)
  );
};

/** Validates the immutable cross-artifact links that structural validators cannot prove alone. */
export const isFinancialAnalyticsProjectionCompatibleV1 = (
  projection: unknown,
  input?: unknown,
  currentSpendComposition?: unknown,
  comparisonSpendComposition?: unknown
): boolean => {
  if (!isFinancialAnalyticsProjectionV1(projection)) return false;
  if (projection.status === 'unavailable' && projection.analyticsInputId === undefined) {
    return (
      input === undefined &&
      (projection.currentSpendCompositionId === undefined ||
        (isCurrentSpendCompositionV1(currentSpendComposition) &&
          projection.currentSpendCompositionId === currentSpendComposition.compositionId &&
          hasSameFinancialDimensions(projection.coordinate, currentSpendComposition.coordinate)))
    );
  }
  if (!isFinancialAnalyticsInputSeriesV1(input)) return false;
  if (projection.analyticsInputId !== input.analyticsInputId || !hasSameFinancialDimensions(projection.coordinate, input.coordinate)) return false;
  if (projection.status === 'unavailable') {
    return (
      projection.currentSpendCompositionId === undefined ||
      (isCurrentSpendCompositionV1(currentSpendComposition) &&
        projection.currentSpendCompositionId === currentSpendComposition.compositionId &&
        hasSameFinancialDimensions(projection.coordinate, currentSpendComposition.coordinate))
    );
  }
  if (projection.result.kind === 'anomaly') {
    if (
      !isCurrentSpendCompositionV1(currentSpendComposition) ||
      projection.currentSpendCompositionId !== currentSpendComposition.compositionId ||
      !hasSameFinancialDimensions(projection.coordinate, currentSpendComposition.coordinate) ||
      canonicalizeFinancialDataflowCoordinateV1({ ...projection.coordinate, periodRole: 'current-spend' }) !==
        canonicalizeFinancialDataflowCoordinateV1(currentSpendComposition.coordinate) ||
      !periodContains(input.coordinate, projection.coordinate)
    ) {
      return false;
    }
    const pointsByDate = new Map(input.points.map(point => [point.date, point]));
    const eventDates = new Set<string>();
    const targetPeriod = projection.coordinate.period.requested;
    return projection.result.events.every(event => {
      const point = pointsByDate.get(event.date);
      if (
        event.date < targetPeriod.startDate ||
        event.date >= targetPeriod.endDateExclusive ||
        point === undefined ||
        eventDates.has(event.date) ||
        (projection.status === 'available' && point.status !== 'available')
      )
        return false;
      eventDates.add(event.date);
      const observedAmount = point.status === 'available' ? point.amount : point.knownAmount;
      return event.observed.amount === observedAmount;
    });
  }
  if (projection.result.kind === 'trend') {
    if (
      !isCurrentSpendCompositionV1(currentSpendComposition) ||
      !isCurrentSpendCompositionV1(comparisonSpendComposition) ||
      projection.currentSpendCompositionId !== currentSpendComposition.compositionId ||
      projection.result.comparisonCompositionId !== comparisonSpendComposition.compositionId ||
      currentSpendComposition.coordinate.periodRole !== 'current-spend' ||
      comparisonSpendComposition.coordinate.periodRole !== 'comparison' ||
      !hasSameFinancialDimensions(projection.coordinate, currentSpendComposition.coordinate) ||
      !hasSameFinancialDimensions(projection.coordinate, comparisonSpendComposition.coordinate) ||
      !hasComparableTrendPeriods(currentSpendComposition.coordinate, comparisonSpendComposition.coordinate) ||
      currentSpendComposition.amount.status === 'unavailable' ||
      comparisonSpendComposition.amount.status === 'unavailable' ||
      (projection.status === 'available' &&
        (currentSpendComposition.amount.status !== 'available' || comparisonSpendComposition.amount.status !== 'available'))
    ) {
      return false;
    }
    const currentAmount =
      currentSpendComposition.amount.status === 'available' ? currentSpendComposition.amount.amount : currentSpendComposition.amount.knownAmount;
    const comparisonAmount =
      comparisonSpendComposition.amount.status === 'available'
        ? comparisonSpendComposition.amount.amount
        : comparisonSpendComposition.amount.knownAmount;
    try {
      const change = subtractExactDecimalValues(parseCanonicalDecimal(currentAmount), parseCanonicalDecimal(comparisonAmount));
      if (formatExactDecimalValue(change) !== projection.result.change.amount) return false;
      if (projection.result.percentChange === undefined) return true;
      const comparison = parseCanonicalDecimal(comparisonAmount);
      if (comparison.coefficient === 0n) return false;
      return (
        formatExactDecimalValue(multiplyExactDecimalValues(change, parseCanonicalDecimal('100'))) ===
        formatExactDecimalValue(multiplyExactDecimalValues(comparison, parseCanonicalDecimal(projection.result.percentChange)))
      );
    } catch {
      return false;
    }
  }
  if (
    !isCurrentSpendCompositionV1(currentSpendComposition) ||
    projection.currentSpendCompositionId !== currentSpendComposition.compositionId ||
    !hasSameFinancialDimensions(projection.coordinate, currentSpendComposition.coordinate) ||
    canonicalizeFinancialDataflowCoordinateV1({ ...projection.coordinate, periodRole: 'current-spend' }) !==
      canonicalizeFinancialDataflowCoordinateV1(currentSpendComposition.coordinate)
  ) {
    return false;
  }
  if (
    projection.status === 'available' &&
    currentSpendComposition.amount.status !== 'available' &&
    !(
      currentSpendComposition.amount.status === 'partial' &&
      currentSpendComposition.amount.reasonCodes.length === 1 &&
      currentSpendComposition.amount.reasonCodes[0] === 'coverage-incomplete'
    )
  )
    return false;
  if (currentSpendComposition.amount.status === 'unavailable') return false;
  const currentAmount =
    currentSpendComposition.amount.status === 'available' ? currentSpendComposition.amount.amount : currentSpendComposition.amount.knownAmount;
  try {
    return (
      formatExactDecimalValue(
        addExactDecimalValues(parseCanonicalDecimal(currentAmount), parseCanonicalDecimal(projection.result.projectedRemaining.amount))
      ) === projection.result.projectedTotal.amount
    );
  } catch {
    return false;
  }
};
