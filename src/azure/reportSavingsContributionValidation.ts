import type { CanonicalMoneyRangeV2, PortfolioSavingsContributionV2, ScenarioSavingsPotentialV2 } from './savings';
import { isRecord } from './reportEvidenceValidationHelpers';

const isMoneyRange = (value: unknown): value is CanonicalMoneyRangeV2 => {
  if (!isRecord(value) || typeof value.currency !== 'string' || !/^[A-Z]{3}$/.test(value.currency)) return false;
  const fields = ['minorUnitScale', 'currentMonthlyMinorUnits', 'minSavingsMinorUnits', 'maxSavingsMinorUnits'] as const;
  if (!fields.every(key => Number.isSafeInteger(value[key]) && Number(value[key]) >= 0)) return false;
  return (
    Number(value.minorUnitScale) <= 6 &&
    Number(value.minSavingsMinorUnits) <= Number(value.maxSavingsMinorUnits) &&
    Number(value.maxSavingsMinorUnits) <= Number(value.currentMonthlyMinorUnits)
  );
};

export const isReportPortfolioSavingsContribution = (value: unknown): value is PortfolioSavingsContributionV2 =>
  isRecord(value) &&
  value.semantics === 'portfolio-contribution' &&
  isMoneyRange(value.range) &&
  Array.isArray(value.allocationIds) &&
  value.allocationIds.length <= 10000 &&
  value.allocationIds.every(id => typeof id === 'string' && id.trim().length > 0 && id.length <= 16384) &&
  new Set(value.allocationIds).size === value.allocationIds.length &&
  (value.allocationIds.length > 0 || value.range.maxSavingsMinorUnits === 0);

export const isReportScenarioSavings = (value: unknown): value is ScenarioSavingsPotentialV2 =>
  isRecord(value) &&
  value.semantics === 'standalone-scenario' &&
  isMoneyRange(value.range) &&
  (value.combinationPolicy === 'additive' || value.combinationPolicy === 'exclusive' || value.combinationPolicy === 'conditional') &&
  (value.combinationGroupId === undefined || (typeof value.combinationGroupId === 'string' && value.combinationGroupId.length <= 16384));

export const hasValidReportSavingsMetadata = (value: Record<string, unknown>): boolean =>
  ['savingsOwnerResourceId', 'billableComponentKey'].every(
    key => value[key] === undefined || (typeof value[key] === 'string' && value[key].trim().length > 0 && value[key].length <= 16384)
  ) &&
  (value.savingsAggregationPolicy === undefined ||
    value.savingsAggregationPolicy === 'owner-component' ||
    value.savingsAggregationPolicy === 'resource') &&
  (value.portfolioContribution === undefined || isReportPortfolioSavingsContribution(value.portfolioContribution)) &&
  (value.scenarioSavings === undefined || isReportScenarioSavings(value.scenarioSavings));
