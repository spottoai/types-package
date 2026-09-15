"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceSchedulePreviewRequest = isResourceSchedulePreviewRequest;
exports.isResourceSchedulePreviewResponse = isResourceSchedulePreviewResponse;
exports.isResourceSchedulingOpportunity = isResourceSchedulingOpportunity;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const resourceStrategyScheduleValidation_1 = require("./resourceStrategyScheduleValidation");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
function isMoneyProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'measure',
            'amount',
            'basis',
            'provenance',
            'period',
            'currency',
            'additivity',
            'evidenceObservedAtUtc',
            'coverage',
            'components',
        ]) ||
        value.measure !== 'savings' ||
        !(0, resourceStrategyValidationShared_1.isNonNegativeDecimal)(value.amount) ||
        !Array.isArray(value.components) ||
        value.components.length === 0 ||
        value.components.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems) {
        return false;
    }
    const componentIds = new Set();
    const validComponents = value.components.every(component => {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(component) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(component, ['componentId', 'amount', 'unit', 'tier']) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(component.componentId, 200) ||
            !(0, resourceStrategyValidationShared_1.isNonNegativeDecimal)(component.amount) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(component.unit, 200) ||
            !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(component.tier, 200) ||
            componentIds.has(component.componentId)) {
            return false;
        }
        componentIds.add(component.componentId);
        return true;
    });
    if (!validComponents)
        return false;
    const decimalScale = 100000000n;
    const toScaledInteger = (amount) => {
        const [whole, fraction = ''] = amount.split('.');
        return BigInt(whole) * decimalScale + BigInt(fraction.padEnd(8, '0'));
    };
    const componentTotal = value.components.reduce((total, component) => total + toScaledInteger(component.amount), 0n);
    if (componentTotal !== toScaledInteger(value.amount))
        return false;
    return ((value.basis === 'billed' || value.basis === 'amortized') &&
        ['billing-backed', 'estimated', 'blended'].includes(String(value.provenance)) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value.period) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.period, ['startDate', 'endDate']) &&
        (0, resourceStrategyValidationShared_1.isDate)(value.period.startDate) &&
        (0, resourceStrategyValidationShared_1.isDate)(value.period.endDate) &&
        value.period.startDate <= value.period.endDate &&
        (0, resourceStrategyValidationShared_1.isCurrency)(value.currency) &&
        (value.additivity === 'scenario' || value.additivity === 'portfolio') &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.evidenceObservedAtUtc) &&
        (value.coverage === 'complete' || value.coverage === 'partial'));
}
function isScenarioMoneyProjection(value) {
    return isMoneyProjection(value) && value.additivity === 'scenario';
}
function isResourceSchedulePreviewRequest(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['draft', 'draftHash', 'evidenceReferences', 'concurrency', 'draftPeriodKeys']) &&
        (0, resourceStrategyScheduleValidation_1.isResourceStrategyWeeklyScheduleWriteRequest)(value.draft) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.draftHash, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.evidenceReferences, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.evidenceReferences) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value.concurrency) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value.concurrency, ['requestVersion', 'evidenceVersion']) &&
        (0, resourceStrategyValidationShared_1.isPositiveInteger)(value.concurrency.requestVersion) &&
        (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.concurrency.evidenceVersion, 200) &&
        (value.draftPeriodKeys === undefined || (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.draftPeriodKeys, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.draftPeriodKeys)));
}
function isResourceSchedulePreviewResponse(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(value) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['draftHash', 'requestVersion', 'availability', 'aggregate', 'windows', 'unavailableReason']) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.draftHash, 200) ||
        !(0, resourceStrategyValidationShared_1.isPositiveInteger)(value.requestVersion) ||
        !['available', 'unavailable'].includes(String(value.availability)) ||
        !Array.isArray(value.windows) ||
        value.windows.length > resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.draftPeriodKeys) {
        return false;
    }
    const validWindows = value.windows.every(window => (0, resourceStrategyValidationShared_1.isRecord)(window) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(window.draftPeriodKey, 200) &&
        (window.availability === 'available'
            ? (0, resourceStrategyValidationShared_1.hasOnlyKeys)(window, ['draftPeriodKey', 'availability', 'projection']) && isScenarioMoneyProjection(window.projection)
            : window.availability === 'unavailable' &&
                (0, resourceStrategyValidationShared_1.hasOnlyKeys)(window, ['draftPeriodKey', 'availability', 'unavailableReason']) &&
                isPreviewUnavailableReason(window.unavailableReason)));
    if (!validWindows)
        return false;
    if (value.availability === 'available') {
        return (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['draftHash', 'requestVersion', 'availability', 'aggregate', 'windows']) && isScenarioMoneyProjection(value.aggregate);
    }
    return ((0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['draftHash', 'requestVersion', 'availability', 'windows', 'unavailableReason']) &&
        value.aggregate === undefined &&
        isPreviewUnavailableReason(value.unavailableReason));
}
function isPreviewUnavailableReason(value) {
    return ['missing-evidence', 'stale-evidence', 'mixed-currency', 'unsupported', 'calculation-failed'].includes(String(value));
}
function isResourceSchedulingOpportunity(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value))
        return false;
    const commonKeys = [
        'opportunityId',
        'provider',
        'providerScopeId',
        'cloudAccountId',
        'resourceId',
        'capability',
        'suggestedDefinition',
        'projectionAvailability',
        'projection',
        'projectionUnavailableReason',
        'observedAtUtc',
    ];
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, commonKeys) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.opportunityId, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.provider, 100) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 300) ||
        !(0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.cloudAccountId, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) ||
        !(0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) ||
        (value.suggestedDefinition !== undefined && !(0, resourceStrategyScheduleValidation_1.isResourceStrategyWeeklyScheduleWriteRequest)(value.suggestedDefinition)) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.observedAtUtc)) {
        return false;
    }
    if (value.suggestedDefinition !== undefined) {
        const suggestion = value.suggestedDefinition;
        if (suggestion.providerScopeId !== value.providerScopeId ||
            suggestion.cloudAccountId !== value.cloudAccountId ||
            suggestion.resourceId !== value.resourceId ||
            suggestion.capability.capabilityId !== value.capability.capabilityId ||
            suggestion.capability.capabilityVersion !== value.capability.capabilityVersion) {
            return false;
        }
    }
    if (value.projectionAvailability === 'available') {
        return isScenarioMoneyProjection(value.projection) && value.projectionUnavailableReason === undefined;
    }
    return (value.projectionAvailability === 'unavailable' && value.projection === undefined && isPreviewUnavailableReason(value.projectionUnavailableReason));
}
//# sourceMappingURL=resourceStrategyFinancialValidation.js.map