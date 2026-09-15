import { RESOURCE_STRATEGY_CONTRACT_LIMITS, } from './resourceStrategyContracts.js';
import { isResourceStrategyWeeklyScheduleWriteRequest } from './resourceStrategyScheduleValidation.js';
import { hasOnlyKeys, isBoundedString, isBoundedStringArray, isCapabilityRef, isCurrency, isDate, isIsoTimestamp, isNonNegativeDecimal, isOptionalBoundedString, isPositiveInteger, isRecord, isWithinJsonByteLimit, } from './resourceStrategyValidationShared.js';
function isMoneyProjection(value) {
    if (!isRecord(value) ||
        !hasOnlyKeys(value, [
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
        !isNonNegativeDecimal(value.amount) ||
        !Array.isArray(value.components) ||
        value.components.length === 0 ||
        value.components.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.metadataItems) {
        return false;
    }
    const componentIds = new Set();
    const validComponents = value.components.every(component => {
        if (!isRecord(component) ||
            !hasOnlyKeys(component, ['componentId', 'amount', 'unit', 'tier']) ||
            !isBoundedString(component.componentId, 200) ||
            !isNonNegativeDecimal(component.amount) ||
            !isBoundedString(component.unit, 200) ||
            !isOptionalBoundedString(component.tier, 200) ||
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
        isRecord(value.period) &&
        hasOnlyKeys(value.period, ['startDate', 'endDate']) &&
        isDate(value.period.startDate) &&
        isDate(value.period.endDate) &&
        value.period.startDate <= value.period.endDate &&
        isCurrency(value.currency) &&
        (value.additivity === 'scenario' || value.additivity === 'portfolio') &&
        isIsoTimestamp(value.evidenceObservedAtUtc) &&
        (value.coverage === 'complete' || value.coverage === 'partial'));
}
function isScenarioMoneyProjection(value) {
    return isMoneyProjection(value) && value.additivity === 'scenario';
}
export function isResourceSchedulePreviewRequest(value) {
    return (isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        isRecord(value) &&
        hasOnlyKeys(value, ['draft', 'draftHash', 'evidenceReferences', 'concurrency', 'draftPeriodKeys']) &&
        isResourceStrategyWeeklyScheduleWriteRequest(value.draft) &&
        isBoundedString(value.draftHash, 200) &&
        isBoundedStringArray(value.evidenceReferences, RESOURCE_STRATEGY_CONTRACT_LIMITS.evidenceReferences) &&
        isRecord(value.concurrency) &&
        hasOnlyKeys(value.concurrency, ['requestVersion', 'evidenceVersion']) &&
        isPositiveInteger(value.concurrency.requestVersion) &&
        isOptionalBoundedString(value.concurrency.evidenceVersion, 200) &&
        (value.draftPeriodKeys === undefined || isBoundedStringArray(value.draftPeriodKeys, RESOURCE_STRATEGY_CONTRACT_LIMITS.draftPeriodKeys)));
}
export function isResourceSchedulePreviewResponse(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) ||
        !isRecord(value) ||
        !hasOnlyKeys(value, ['draftHash', 'requestVersion', 'availability', 'aggregate', 'windows', 'unavailableReason']) ||
        !isBoundedString(value.draftHash, 200) ||
        !isPositiveInteger(value.requestVersion) ||
        !['available', 'unavailable'].includes(String(value.availability)) ||
        !Array.isArray(value.windows) ||
        value.windows.length > RESOURCE_STRATEGY_CONTRACT_LIMITS.draftPeriodKeys) {
        return false;
    }
    const validWindows = value.windows.every(window => isRecord(window) &&
        isBoundedString(window.draftPeriodKey, 200) &&
        (window.availability === 'available'
            ? hasOnlyKeys(window, ['draftPeriodKey', 'availability', 'projection']) && isScenarioMoneyProjection(window.projection)
            : window.availability === 'unavailable' &&
                hasOnlyKeys(window, ['draftPeriodKey', 'availability', 'unavailableReason']) &&
                isPreviewUnavailableReason(window.unavailableReason)));
    if (!validWindows)
        return false;
    if (value.availability === 'available') {
        return hasOnlyKeys(value, ['draftHash', 'requestVersion', 'availability', 'aggregate', 'windows']) && isScenarioMoneyProjection(value.aggregate);
    }
    return (hasOnlyKeys(value, ['draftHash', 'requestVersion', 'availability', 'windows', 'unavailableReason']) &&
        value.aggregate === undefined &&
        isPreviewUnavailableReason(value.unavailableReason));
}
function isPreviewUnavailableReason(value) {
    return ['missing-evidence', 'stale-evidence', 'mixed-currency', 'unsupported', 'calculation-failed'].includes(String(value));
}
export function isResourceSchedulingOpportunity(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value))
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
    if (!hasOnlyKeys(value, commonKeys) ||
        !isBoundedString(value.opportunityId, 200) ||
        !isBoundedString(value.provider, 100) ||
        !isBoundedString(value.providerScopeId, 300) ||
        !isOptionalBoundedString(value.cloudAccountId, 200) ||
        !isBoundedString(value.resourceId, 2000) ||
        !isCapabilityRef(value.capability) ||
        (value.suggestedDefinition !== undefined && !isResourceStrategyWeeklyScheduleWriteRequest(value.suggestedDefinition)) ||
        !isIsoTimestamp(value.observedAtUtc)) {
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
