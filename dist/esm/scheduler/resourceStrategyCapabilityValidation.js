import { RESOURCE_STRATEGY_CONTRACT_LIMITS, } from './resourceStrategyContracts.js';
import { hasOnlyKeys, isBoundedParameters, isBoundedString, isBoundedStringArray, isCapabilityRef, isIsoTimestamp, isNonNegativeInteger, isOptionalBoundedString, isPositiveInteger, isRecord, isWithinJsonByteLimit, } from './resourceStrategyValidationShared.js';
const isPresentationLabel = (value) => isBoundedString(value, 80) &&
    value === value.trim() &&
    !/[<>]/.test(value) &&
    Array.from(value).every(character => {
        const codePoint = character.codePointAt(0);
        return codePoint !== undefined && codePoint >= 0x20 && codePoint !== 0x7f;
    }) &&
    !/https?:\/\//i.test(value);
export function isResourceSchedulingCapabilityProjection(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) || !isRecord(value))
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
    if (!hasOnlyKeys(value, allowed))
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
    if (!isCapabilityRef(value.capability) ||
        !isBoundedString(value.contentHash, 200) ||
        !isIsoTimestamp(value.publishedAtUtc) ||
        !isBoundedString(value.provider, 100) ||
        !isBoundedStringArray(value.resourceTypes, RESOURCE_STRATEGY_CONTRACT_LIMITS.resourceTypes) ||
        value.resourceTypes.length === 0 ||
        !['on-off', 'sku-change', 'dial', 'recreate'].includes(String(value.strategy)) ||
        !isBoundedString(value.displayName) ||
        !isBoundedString(value.description, 2000) ||
        !isRecord(presentation) ||
        !hasOnlyKeys(presentation, ['resourceKindLabel', 'reduceTransitionLabel', 'restoreTransitionLabel', 'reducedStateLabel', 'restoredStateLabel']) ||
        !isPresentationLabel(presentation.resourceKindLabel) ||
        !isPresentationLabel(presentation.reduceTransitionLabel) ||
        !isPresentationLabel(presentation.restoreTransitionLabel) ||
        !isPresentationLabel(presentation.reducedStateLabel) ||
        !isPresentationLabel(presentation.restoredStateLabel) ||
        !isBoundedString(value.configurationSchemaKind, 200) ||
        !isBoundedParameters(value.configurationSchema) ||
        !['unsupported', 'candidate', 'supported'].includes(String(value.recommendationMaturity)) ||
        !['published', 'deprecated', 'withdrawn'].includes(String(value.lifecycleStatus)) ||
        !isRecord(executionPolicy) ||
        !isRecord(baseline) ||
        !isRecord(cost) ||
        !isRecord(cadence) ||
        !isRecord(disruption) ||
        !isRecord(restore) ||
        !isRecord(automation) ||
        !isRecord(dependencies) ||
        !hasOnlyKeys(executionPolicy, ['authoring', 'reduce', 'restore', 'disableReason', 'supersededBy']) ||
        !hasOnlyKeys(baseline, ['policy', 'mutationDomains', 'coupledValueLabels', 'driftPolicy']) ||
        !hasOnlyKeys(cost, [
            'billingClass',
            'reducedMeters',
            'retainedMeters',
            'billingGranularityMinutes',
            'minimumUsefulReducedMinutes',
            'commitmentInteraction',
        ]) ||
        !hasOnlyKeys(cadence, [
            'minimumTransitionIntervalMinutes',
            'maximumChangesPerRollingWindow',
            'maximumReducedDurationMinutes',
            'preferredBillingBoundary',
            'reduceFlexMinutes',
        ]) ||
        !hasOnlyKeys(disruption, ['reversibility', 'risk', 'affectedScopeLabel', 'expectedDowntimeMinutes', 'supportedBusyPolicies']) ||
        !hasOnlyKeys(restore, ['restoreLeadMinutes', 'capacityReturnRisk', 'retryPolicyLabel', 'escalationClass']) ||
        !hasOnlyKeys(automation, ['ownership', 'conflictingControllerLabels']) ||
        !hasOnlyKeys(dependencies, ['hasDependencies', 'summary', 'mutableIdentityRisk'])) {
        return false;
    }
    if (!['allowed', 'blocked'].includes(String(executionPolicy.authoring)) ||
        !['allowed', 'blocked'].includes(String(executionPolicy.reduce)) ||
        !['allowed', 'blocked'].includes(String(executionPolicy.restore)) ||
        (executionPolicy.disableReason !== undefined && !isBoundedString(executionPolicy.disableReason, 500)) ||
        (executionPolicy.supersededBy !== undefined && !isCapabilityRef(executionPolicy.supersededBy))) {
        return false;
    }
    if (!['none', 'capture-selected-state', 'capture-resource-snapshot'].includes(String(baseline.policy)) ||
        !isBoundedStringArray(baseline.mutationDomains) ||
        (baseline.coupledValueLabels !== undefined && !isBoundedStringArray(baseline.coupledValueLabels)) ||
        !['block', 'adopt-before-reduce', 'restore-captured', 'capability-defined'].includes(String(baseline.driftPolicy))) {
        return false;
    }
    if (!['A-meter-stops', 'B-meter-reduces', 'C-no-material-saving'].includes(String(cost.billingClass)) ||
        !isBoundedStringArray(cost.reducedMeters) ||
        !isBoundedStringArray(cost.retainedMeters) ||
        (cost.billingGranularityMinutes !== undefined && !isPositiveInteger(cost.billingGranularityMinutes)) ||
        (cost.minimumUsefulReducedMinutes !== undefined && !isPositiveInteger(cost.minimumUsefulReducedMinutes)) ||
        !['none', 'may-reduce-invoice-saving', 'unknown'].includes(String(cost.commitmentInteraction))) {
        return false;
    }
    if (!isPositiveInteger(cadence.minimumTransitionIntervalMinutes) ||
        (cadence.maximumReducedDurationMinutes !== undefined && !isPositiveInteger(cadence.maximumReducedDurationMinutes)) ||
        (cadence.reduceFlexMinutes !== undefined && !isNonNegativeInteger(cadence.reduceFlexMinutes)) ||
        (cadence.preferredBillingBoundary !== undefined && !['none', 'start-of-hour'].includes(String(cadence.preferredBillingBoundary)))) {
        return false;
    }
    if (cadence.maximumChangesPerRollingWindow !== undefined) {
        const window = cadence.maximumChangesPerRollingWindow;
        if (!isRecord(window) ||
            !hasOnlyKeys(window, ['changes', 'windowMinutes']) ||
            !isPositiveInteger(window.changes) ||
            !isPositiveInteger(window.windowMinutes)) {
            return false;
        }
    }
    if (!['reversible', 'conditional', 'destructive'].includes(String(disruption.reversibility)) ||
        !['low', 'medium', 'high'].includes(String(disruption.risk)) ||
        !isBoundedString(disruption.affectedScopeLabel) ||
        !Array.isArray(disruption.supportedBusyPolicies) ||
        disruption.supportedBusyPolicies.length > 3 ||
        new Set(disruption.supportedBusyPolicies).size !== disruption.supportedBusyPolicies.length ||
        !disruption.supportedBusyPolicies.every(mode => ['skip', 'wait-until-deadline', 'force'].includes(String(mode)))) {
        return false;
    }
    if (disruption.expectedDowntimeMinutes !== undefined) {
        const downtime = disruption.expectedDowntimeMinutes;
        if (!isRecord(downtime) ||
            !hasOnlyKeys(downtime, ['minimum', 'maximum']) ||
            !isNonNegativeInteger(downtime.minimum) ||
            !isNonNegativeInteger(downtime.maximum) ||
            Number(downtime.minimum) > Number(downtime.maximum)) {
            return false;
        }
    }
    if (!isNonNegativeInteger(restore.restoreLeadMinutes) ||
        !['none-known', 'possible', 'high', 'unknown'].includes(String(restore.capacityReturnRisk)) ||
        !isBoundedString(restore.retryPolicyLabel) ||
        !isBoundedString(restore.escalationClass) ||
        !['spotto', 'native', 'coexistence-proven', 'unsupported-conflict'].includes(String(automation.ownership)) ||
        !isBoundedStringArray(automation.conflictingControllerLabels) ||
        typeof dependencies.hasDependencies !== 'boolean' ||
        (dependencies.summary !== undefined && !isBoundedString(dependencies.summary, 2000)) ||
        (dependencies.mutableIdentityRisk !== undefined && typeof dependencies.mutableIdentityRisk !== 'boolean')) {
        return false;
    }
    if (value.acknowledgement !== undefined) {
        const acknowledgement = value.acknowledgement;
        if (!isRecord(acknowledgement) ||
            !hasOnlyKeys(acknowledgement, ['version', 'severity', 'message']) ||
            !isBoundedString(acknowledgement.version, 200) ||
            !['info', 'warning', 'destructive'].includes(String(acknowledgement.severity)) ||
            !isBoundedString(acknowledgement.message, 2000)) {
            return false;
        }
    }
    const requiresDisableReason = value.lifecycleStatus === 'withdrawn' ||
        executionPolicy.authoring === 'blocked' ||
        executionPolicy.reduce === 'blocked' ||
        executionPolicy.restore === 'blocked';
    if (requiresDisableReason && !isBoundedString(executionPolicy.disableReason, 500))
        return false;
    if (executionPolicy.reduce === 'allowed' && executionPolicy.restore !== 'allowed')
        return false;
    if (cost.billingClass === 'C-no-material-saving' && (executionPolicy.authoring !== 'blocked' || executionPolicy.reduce !== 'blocked'))
        return false;
    if (value.strategy === 'recreate') {
        if (!isRecord(value.acknowledgement) || value.acknowledgement.severity !== 'destructive')
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
export function isResourceSchedulingReadinessProjection(value) {
    return (isWithinJsonByteLimit(value, RESOURCE_STRATEGY_CONTRACT_LIMITS.publicDtoBytes) &&
        isRecord(value) &&
        hasOnlyKeys(value, [
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
        isBoundedString(value.companyId, 200) &&
        isBoundedString(value.cloudAccountId, 200) &&
        isBoundedString(value.providerScopeId, 300) &&
        isBoundedString(value.resourceId, 2000) &&
        isCapabilityRef(value.capability) &&
        typeof value.state === 'string' &&
        readinessStates.has(value.state) &&
        isIsoTimestamp(value.checkedAtUtc) &&
        isIsoTimestamp(value.expiresAtUtc) &&
        Date.parse(value.expiresAtUtc) >= Date.parse(value.checkedAtUtc) &&
        isBoundedStringArray(value.reasonCodes) &&
        (value.missingActions === undefined || isBoundedStringArray(value.missingActions)) &&
        (value.requiredScopes === undefined || isBoundedStringArray(value.requiredScopes)) &&
        (value.offendingScopes === undefined || isBoundedStringArray(value.offendingScopes)) &&
        isOptionalBoundedString(value.repairLink, 2000));
}
