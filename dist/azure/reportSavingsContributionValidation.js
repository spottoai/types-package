"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidReportSavingsMetadata = exports.isReportScenarioSavings = exports.isReportPortfolioSavingsContribution = void 0;
const reportEvidenceValidationHelpers_1 = require("./reportEvidenceValidationHelpers");
const isMoneyRange = (value) => {
    if (!(0, reportEvidenceValidationHelpers_1.isRecord)(value) || typeof value.currency !== 'string' || !/^[A-Z]{3}$/.test(value.currency))
        return false;
    const fields = ['minorUnitScale', 'currentMonthlyMinorUnits', 'minSavingsMinorUnits', 'maxSavingsMinorUnits'];
    if (!fields.every(key => Number.isSafeInteger(value[key]) && Number(value[key]) >= 0))
        return false;
    return (Number(value.minorUnitScale) <= 6 &&
        Number(value.minSavingsMinorUnits) <= Number(value.maxSavingsMinorUnits) &&
        Number(value.maxSavingsMinorUnits) <= Number(value.currentMonthlyMinorUnits));
};
const isReportPortfolioSavingsContribution = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    value.semantics === 'portfolio-contribution' &&
    isMoneyRange(value.range) &&
    Array.isArray(value.allocationIds) &&
    value.allocationIds.length <= 10000 &&
    value.allocationIds.every(id => typeof id === 'string' && id.trim().length > 0 && id.length <= 16384) &&
    new Set(value.allocationIds).size === value.allocationIds.length &&
    (value.allocationIds.length > 0 || value.range.maxSavingsMinorUnits === 0);
exports.isReportPortfolioSavingsContribution = isReportPortfolioSavingsContribution;
const isReportScenarioSavings = (value) => (0, reportEvidenceValidationHelpers_1.isRecord)(value) &&
    value.semantics === 'standalone-scenario' &&
    isMoneyRange(value.range) &&
    (value.combinationPolicy === 'additive' || value.combinationPolicy === 'exclusive' || value.combinationPolicy === 'conditional') &&
    (value.combinationGroupId === undefined || (typeof value.combinationGroupId === 'string' && value.combinationGroupId.length <= 16384));
exports.isReportScenarioSavings = isReportScenarioSavings;
const hasValidReportSavingsMetadata = (value) => ['savingsOwnerResourceId', 'billableComponentKey'].every(key => value[key] === undefined || (typeof value[key] === 'string' && value[key].trim().length > 0 && value[key].length <= 16384)) &&
    (value.savingsAggregationPolicy === undefined ||
        value.savingsAggregationPolicy === 'owner-component' ||
        value.savingsAggregationPolicy === 'resource') &&
    (value.portfolioContribution === undefined || (0, exports.isReportPortfolioSavingsContribution)(value.portfolioContribution)) &&
    (value.scenarioSavings === undefined || (0, exports.isReportScenarioSavings)(value.scenarioSavings));
exports.hasValidReportSavingsMetadata = hasValidReportSavingsMetadata;
//# sourceMappingURL=reportSavingsContributionValidation.js.map