"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FINANCIAL_SCOPE_BASELINE_UNAVAILABLE_REASONS_V2 = exports.isCompleteFinancialBaselinePeriodV2 = exports.FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2 = exports.FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2 = void 0;
exports.FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2 = 2;
exports.FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2 = 'financial-scope-baseline/v2';
/**
 * True only when the produced evidence covers the entire requested interval.
 * Partial periods remain valid monetary evidence for display and forecasting,
 * but must not be used as the current side of an optimization projection.
 */
const isCompleteFinancialBaselinePeriodV2 = (period) => period.observed !== undefined &&
    period.observed.startDate === period.requested.startDate &&
    period.observed.endDateExclusive === period.requested.endDateExclusive &&
    period.observed.dateBasis === period.requested.dateBasis &&
    period.observed.timeZone === period.requested.timeZone &&
    period.gaps.length === 0;
exports.isCompleteFinancialBaselinePeriodV2 = isCompleteFinancialBaselinePeriodV2;
exports.FINANCIAL_SCOPE_BASELINE_UNAVAILABLE_REASONS_V2 = [
    'evidence-not-produced',
    'evidence-not-matched',
    'period-unresolved',
    'coverage-incomplete',
    'basis-unavailable',
    'estimate-lens-unavailable',
    'currency-unresolved',
    'currency-conflicting',
    'component-identity-unavailable',
    'ownership-unresolved',
    'ownership-conflict',
    'mixed-generation',
    'member-incompatible',
    'reconciliation-failure',
    'scope-membership-empty',
    'unsupported-scope',
];
//# sourceMappingURL=financialScopeBaseline.js.map