"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceSchedulingCapabilityProjection = isResourceSchedulingCapabilityProjection;
exports.isResourceSchedulingReadinessProjection = isResourceSchedulingReadinessProjection;
const resourceStrategyContracts_1 = require("./resourceStrategyContracts");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
const isPresentationLabel = (value) => (0, resourceStrategyValidationShared_1.isBoundedString)(value, 80) &&
    value === value.trim() &&
    !/[<>]/.test(value) &&
    Array.from(value).every(character => {
        const codePoint = character.codePointAt(0);
        return codePoint !== undefined && codePoint >= 0x20 && codePoint !== 0x7f;
    }) &&
    !/https?:\/\//i.test(value);
function isResourceSchedulingCapabilityProjection(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !(0, resourceStrategyValidationShared_1.isRecord)(value))
        return false;
    const allowed = [
        'capability',
        'contentHash',
        'publishedAtUtc',
        'provider',
        'resourceTypes',
        'strategy',
        'displayName',
        'description',
        'presentation',
        'configurationSchemaKind',
        'configurationSchema',
        'recommendationMaturity',
        'lifecycleStatus',
        'executionPolicy',
        'baseline',
        'cost',
        'cadence',
        'disruption',
        'restore',
        'automation',
        'dependencies',
        'acknowledgement',
    ];
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, allowed))
        return false;
    const executionPolicy = value.executionPolicy;
    const presentation = value.presentation;
    const baseline = value.baseline;
    const cost = value.cost;
    const cadence = value.cadence;
    const disruption = value.disruption;
    const restore = value.restore;
    const automation = value.automation;
    const dependencies = value.dependencies;
    if (!(0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.contentHash, 200) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.publishedAtUtc) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.provider, 100) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.resourceTypes, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.resourceTypes) ||
        value.resourceTypes.length === 0 ||
        !['on-off', 'sku-change', 'dial', 'recreate'].includes(String(value.strategy)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.displayName) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.description, 2000) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(presentation) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(presentation, ['resourceKindLabel', 'reduceTransitionLabel', 'restoreTransitionLabel', 'reducedStateLabel', 'restoredStateLabel']) ||
        !isPresentationLabel(presentation.resourceKindLabel) ||
        !isPresentationLabel(presentation.reduceTransitionLabel) ||
        !isPresentationLabel(presentation.restoreTransitionLabel) ||
        !isPresentationLabel(presentation.reducedStateLabel) ||
        !isPresentationLabel(presentation.restoredStateLabel) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.configurationSchemaKind, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedParameters)(value.configurationSchema) ||
        !['unsupported', 'candidate', 'supported'].includes(String(value.recommendationMaturity)) ||
        !['published', 'deprecated', 'withdrawn'].includes(String(value.lifecycleStatus)) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(executionPolicy) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(baseline) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(cost) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(cadence) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(disruption) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(restore) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(automation) ||
        !(0, resourceStrategyValidationShared_1.isRecord)(dependencies) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(executionPolicy, ['authoring', 'reduce', 'restore', 'disableReason', 'supersededBy']) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(baseline, ['policy', 'mutationDomains', 'coupledValueLabels', 'driftPolicy']) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(cost, [
            'billingClass',
            'reducedMeters',
            'retainedMeters',
            'billingGranularityMinutes',
            'minimumUsefulReducedMinutes',
            'commitmentInteraction',
        ]) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(cadence, [
            'minimumTransitionIntervalMinutes',
            'minimumAvailableWindowMinutes',
            'minimumReducedWindowMinutes',
            'maximumChangesPerRollingWindow',
            'maximumReducedDurationMinutes',
            'preferredBillingBoundary',
            'reduceFlexMinutes',
        ]) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(disruption, ['reversibility', 'risk', 'affectedScopeLabel', 'expectedDowntimeMinutes', 'supportedBusyPolicies']) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(restore, [
            'restoreLeadMinutes',
            'dispatchSafetyIntervalMinutes',
            'capacityReturnRisk',
            'retryPolicyLabel',
            'escalationClass',
        ]) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(automation, ['ownership', 'conflictingControllerLabels']) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(dependencies, ['hasDependencies', 'summary', 'mutableIdentityRisk'])) {
        return false;
    }
    if (!['allowed', 'blocked'].includes(String(executionPolicy.authoring)) ||
        !['allowed', 'blocked'].includes(String(executionPolicy.reduce)) ||
        !['allowed', 'blocked'].includes(String(executionPolicy.restore)) ||
        (executionPolicy.disableReason !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedString)(executionPolicy.disableReason, 500)) ||
        (executionPolicy.supersededBy !== undefined && !(0, resourceStrategyValidationShared_1.isCapabilityRef)(executionPolicy.supersededBy))) {
        return false;
    }
    if (!['none', 'capture-selected-state', 'capture-resource-snapshot'].includes(String(baseline.policy)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(baseline.mutationDomains) ||
        (baseline.coupledValueLabels !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(baseline.coupledValueLabels)) ||
        !['block', 'adopt-before-reduce', 'restore-captured', 'capability-defined'].includes(String(baseline.driftPolicy))) {
        return false;
    }
    if (!['A-meter-stops', 'B-meter-reduces', 'C-no-material-saving'].includes(String(cost.billingClass)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(cost.reducedMeters) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(cost.retainedMeters) ||
        (cost.billingGranularityMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isPositiveInteger)(cost.billingGranularityMinutes)) ||
        (cost.minimumUsefulReducedMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isPositiveInteger)(cost.minimumUsefulReducedMinutes)) ||
        !['none', 'may-reduce-invoice-saving', 'unknown'].includes(String(cost.commitmentInteraction))) {
        return false;
    }
    if (!(0, resourceStrategyValidationShared_1.isPositiveInteger)(cadence.minimumTransitionIntervalMinutes) ||
        (cadence.minimumAvailableWindowMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isPositiveInteger)(cadence.minimumAvailableWindowMinutes)) ||
        (cadence.minimumReducedWindowMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isPositiveInteger)(cadence.minimumReducedWindowMinutes)) ||
        (cadence.maximumReducedDurationMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isPositiveInteger)(cadence.maximumReducedDurationMinutes)) ||
        (cadence.reduceFlexMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(cadence.reduceFlexMinutes)) ||
        (cadence.preferredBillingBoundary !== undefined && !['none', 'start-of-hour'].includes(String(cadence.preferredBillingBoundary)))) {
        return false;
    }
    if (cadence.maximumChangesPerRollingWindow !== undefined) {
        const window = cadence.maximumChangesPerRollingWindow;
        if (!(0, resourceStrategyValidationShared_1.isRecord)(window) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(window, ['changes', 'windowMinutes']) ||
            !(0, resourceStrategyValidationShared_1.isPositiveInteger)(window.changes) ||
            !(0, resourceStrategyValidationShared_1.isPositiveInteger)(window.windowMinutes)) {
            return false;
        }
    }
    if (!['reversible', 'conditional', 'destructive'].includes(String(disruption.reversibility)) ||
        !['low', 'medium', 'high'].includes(String(disruption.risk)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(disruption.affectedScopeLabel) ||
        !Array.isArray(disruption.supportedBusyPolicies) ||
        disruption.supportedBusyPolicies.length > 3 ||
        new Set(disruption.supportedBusyPolicies).size !== disruption.supportedBusyPolicies.length ||
        !disruption.supportedBusyPolicies.every(mode => ['skip', 'wait-until-deadline', 'force'].includes(String(mode)))) {
        return false;
    }
    if (disruption.expectedDowntimeMinutes !== undefined) {
        const downtime = disruption.expectedDowntimeMinutes;
        if (!(0, resourceStrategyValidationShared_1.isRecord)(downtime) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(downtime, ['minimum', 'maximum']) ||
            !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(downtime.minimum) ||
            !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(downtime.maximum) ||
            Number(downtime.minimum) > Number(downtime.maximum)) {
            return false;
        }
    }
    if (!(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(restore.restoreLeadMinutes) ||
        (restore.dispatchSafetyIntervalMinutes !== undefined && !(0, resourceStrategyValidationShared_1.isNonNegativeInteger)(restore.dispatchSafetyIntervalMinutes)) ||
        !['none-known', 'possible', 'high', 'unknown'].includes(String(restore.capacityReturnRisk)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(restore.retryPolicyLabel) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(restore.escalationClass) ||
        !['spotto', 'native', 'coexistence-proven', 'unsupported-conflict'].includes(String(automation.ownership)) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(automation.conflictingControllerLabels) ||
        typeof dependencies.hasDependencies !== 'boolean' ||
        (dependencies.summary !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedString)(dependencies.summary, 2000)) ||
        (dependencies.mutableIdentityRisk !== undefined && typeof dependencies.mutableIdentityRisk !== 'boolean')) {
        return false;
    }
    const minimumReducedWindowMinutes = cadence.minimumReducedWindowMinutes;
    const dispatchSafetyIntervalMinutes = restore.dispatchSafetyIntervalMinutes;
    if (minimumReducedWindowMinutes !== undefined &&
        dispatchSafetyIntervalMinutes !== undefined &&
        minimumReducedWindowMinutes < restore.restoreLeadMinutes + dispatchSafetyIntervalMinutes) {
        return false;
    }
    if (minimumReducedWindowMinutes !== undefined &&
        cost.minimumUsefulReducedMinutes !== undefined &&
        cost.minimumUsefulReducedMinutes < minimumReducedWindowMinutes) {
        return false;
    }
    if (value.acknowledgement !== undefined) {
        const acknowledgement = value.acknowledgement;
        if (!(0, resourceStrategyValidationShared_1.isRecord)(acknowledgement) ||
            !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(acknowledgement, ['version', 'severity', 'message']) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(acknowledgement.version, 200) ||
            !['info', 'warning', 'destructive'].includes(String(acknowledgement.severity)) ||
            !(0, resourceStrategyValidationShared_1.isBoundedString)(acknowledgement.message, 2000)) {
            return false;
        }
    }
    const requiresDisableReason = value.lifecycleStatus === 'withdrawn' ||
        executionPolicy.authoring === 'blocked' ||
        executionPolicy.reduce === 'blocked' ||
        executionPolicy.restore === 'blocked';
    if (requiresDisableReason && !(0, resourceStrategyValidationShared_1.isBoundedString)(executionPolicy.disableReason, 500))
        return false;
    if (executionPolicy.reduce === 'allowed' && executionPolicy.restore !== 'allowed')
        return false;
    if (cost.billingClass === 'C-no-material-saving' && (executionPolicy.authoring !== 'blocked' || executionPolicy.reduce !== 'blocked'))
        return false;
    if (value.strategy === 'recreate') {
        if (!(0, resourceStrategyValidationShared_1.isRecord)(value.acknowledgement) || value.acknowledgement.severity !== 'destructive')
            return false;
    }
    return true;
}
const readinessStates = new Set([
    'ready',
    'blocked',
    'pending-permission-propagation',
    'missing-permission',
    'scope-mismatch',
    'manifest-outdated',
    'credential-unavailable',
    'permission-check-unavailable',
    'blocked-by-lock',
    'blocked-by-deny-assignment',
    'blocked-by-policy',
    'target-missing',
    'dependency-unready',
    'conflicting-automation',
    'unsupported-resource-state',
]);
function isResourceSchedulingReadinessProjection(value) {
    return ((0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceStrategyContracts_1.RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        (0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
            'companyId',
            'cloudAccountId',
            'providerScopeId',
            'resourceId',
            'capability',
            'state',
            'checkedAtUtc',
            'expiresAtUtc',
            'reasonCodes',
            'missingActions',
            'requiredScopes',
            'offendingScopes',
            'repairLink',
        ]) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.cloudAccountId, 200) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.providerScopeId, 300) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.resourceId, 2000) &&
        (0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) &&
        typeof value.state === 'string' &&
        readinessStates.has(value.state) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.checkedAtUtc) &&
        (0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.expiresAtUtc) &&
        Date.parse(value.expiresAtUtc) >= Date.parse(value.checkedAtUtc) &&
        (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.reasonCodes) &&
        (value.missingActions === undefined || (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.missingActions)) &&
        (value.requiredScopes === undefined || (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.requiredScopes)) &&
        (value.offendingScopes === undefined || (0, resourceStrategyValidationShared_1.isBoundedStringArray)(value.offendingScopes)) &&
        (0, resourceStrategyValidationShared_1.isOptionalBoundedString)(value.repairLink, 2000));
}
//# sourceMappingURL=resourceStrategyCapabilityValidation.js.map