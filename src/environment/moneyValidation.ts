import {
  ENVIRONMENT_CONTRACT_LIMITS_V1,
  type EnvironmentMoneyCompositionV1,
  type EnvironmentMoneyValueV1,
  type EnvironmentSavingsBasisV1,
} from './contracts.js';
import { CURRENCY_PATTERN, DECIMAL_PATTERN, hasExactKeys, isBoundedString, isNonNegativeInteger, isRecord, isSafeLabel } from './internal.js';

const MONEY_BASES = new Set<string>(['billed', 'amortized', 'unknown']);
const SAVINGS_ADDITIVITY = new Set<string>(['additive', 'scenario-non-additive']);
const SPEND_SOURCES = new Set<string>(['billing', 'estimated', 'blended']);
const SPEND_SOURCE_CONFIDENCES = new Set<string>(['high', 'medium', 'low', 'unknown']);
const SAVINGS_PROJECTIONS = new Set<string>(['projected-monthly', 'observed-period', 'unknown']);
const DATE_WINDOW_PATTERN = /^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/u;

const isMoneyComposition = (value: unknown, currencyCode: unknown): value is EnvironmentMoneyCompositionV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['billingBacked', 'estimated', 'minorUnitScale', 'currencyCode']) &&
  isNonNegativeInteger(value.billingBacked) &&
  isNonNegativeInteger(value.estimated) &&
  isNonNegativeInteger(value.minorUnitScale) &&
  (value.minorUnitScale as number) <= 6 &&
  typeof value.currencyCode === 'string' &&
  (value.currencyCode === 'unknown' || CURRENCY_PATTERN.test(value.currencyCode)) &&
  value.currencyCode === currencyCode;

/** Validates the producer projection rule and window behind a savings amount. */
export const isEnvironmentSavingsBasisV1 = (value: unknown): value is EnvironmentSavingsBasisV1 =>
  isRecord(value) &&
  hasExactKeys(value, ['projection'], ['observedPeriod', 'stableWindow', 'containsLegacySavings']) &&
  typeof value.projection === 'string' &&
  SAVINGS_PROJECTIONS.has(value.projection) &&
  (value.observedPeriod === undefined || isSafeLabel(value.observedPeriod)) &&
  (value.stableWindow === undefined || (typeof value.stableWindow === 'string' && DATE_WINDOW_PATTERN.test(value.stableWindow))) &&
  (value.containsLegacySavings === undefined || typeof value.containsLegacySavings === 'boolean');

/** Validates canonical decimal money with explicit currency, basis, period, and provenance. */
export const isEnvironmentMoneyValueWithProvenanceV1 = <Provenance extends string>(
  value: unknown,
  provenances: ReadonlySet<Provenance>
): value is EnvironmentMoneyValueV1<Provenance> =>
  isRecord(value) &&
  hasExactKeys(
    value,
    ['amount', 'currencyCode', 'basis', 'period', 'provenance'],
    ['savingsAdditivity', 'spendSource', 'spendSourceConfidence', 'composition', 'savingsBasis']
  ) &&
  (value.spendSource === undefined || (typeof value.spendSource === 'string' && SPEND_SOURCES.has(value.spendSource))) &&
  (value.spendSourceConfidence === undefined ||
    (typeof value.spendSourceConfidence === 'string' && SPEND_SOURCE_CONFIDENCES.has(value.spendSourceConfidence))) &&
  (value.composition === undefined || isMoneyComposition(value.composition, value.currencyCode)) &&
  (value.savingsBasis === undefined || isEnvironmentSavingsBasisV1(value.savingsBasis)) &&
  typeof value.amount === 'string' &&
  DECIMAL_PATTERN.test(value.amount) &&
  typeof value.currencyCode === 'string' &&
  (value.currencyCode === 'unknown' || CURRENCY_PATTERN.test(value.currencyCode)) &&
  typeof value.basis === 'string' &&
  MONEY_BASES.has(value.basis) &&
  isBoundedString(value.period, ENVIRONMENT_CONTRACT_LIMITS_V1.safeLabelScalars, { trimmed: true, controls: true }) &&
  typeof value.provenance === 'string' &&
  provenances.has(value.provenance as Provenance) &&
  (value.savingsAdditivity === undefined || (typeof value.savingsAdditivity === 'string' && SAVINGS_ADDITIVITY.has(value.savingsAdditivity)));
