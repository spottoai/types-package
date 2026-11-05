"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceScheduleProviderRequestV1 = isResourceScheduleProviderRequestV1;
exports.isResourceScheduleProviderResultV1 = isResourceScheduleProviderResultV1;
const requests_1 = require("../aws/requests");
const resourceScheduleProviderContracts_1 = require("./resourceScheduleProviderContracts");
const resourceStrategyCapabilityValidation_1 = require("./resourceStrategyCapabilityValidation");
const resourceStrategyScheduleValidation_1 = require("./resourceStrategyScheduleValidation");
const resourceStrategyValidationShared_1 = require("./resourceStrategyValidationShared");
const CREDENTIAL_KEYS = new Set(requests_1.AWS_FORBIDDEN_CREDENTIAL_FIELDS);
const AWS_ACCOUNT_ID = /^\d{12}$/;
const AWS_INSTANCE_ARN = /^arn:aws(?:-[a-z]+)*:ec2:[a-z0-9-]+:(\d{12}):instance\/i-[0-9a-f]{8,17}$/;
function containsCredentialKey(value, depth = 0) {
    if (depth > 8)
        return true;
    if (Array.isArray(value))
        return value.some(item => containsCredentialKey(item, depth + 1));
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value))
        return false;
    return Object.keys(value).some(key => CREDENTIAL_KEYS.has(key) || containsCredentialKey(value[key], depth + 1));
}
function isProvider(value) {
    return typeof value === 'string' && resourceScheduleProviderContracts_1.RESOURCE_SCHEDULE_PROVIDERS.includes(value);
}
function isProviderResource(provider, accountId, resourceId) {
    if (provider !== 'aws')
        return false;
    if (typeof accountId !== 'string' || !AWS_ACCOUNT_ID.test(accountId))
        return false;
    const match = typeof resourceId === 'string' ? AWS_INSTANCE_ARN.exec(resourceId) : null;
    return match !== null && match[1] === accountId;
}
/** Validates a kernel → provider-engine resource-schedule request. */
function isResourceScheduleProviderRequestV1(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceScheduleProviderContracts_1.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.messageBytes))
        return false;
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) || containsCredentialKey(value))
        return false;
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
        'schemaVersion',
        'provider',
        'entity',
        'action',
        'requestId',
        'correlationId',
        'requestedAt',
        'companyId',
        'cloudAccountId',
        'accountId',
        'resourceId',
        'capability',
        'direction',
        'intent',
        'transition',
        'leaseOwnerId',
    ])) {
        return false;
    }
    if (value.schemaVersion !== 1 ||
        !isProvider(value.provider) ||
        value.entity !== 'resource-schedule' ||
        (value.action !== 'check' && value.action !== 'transition') ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.requestId, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.correlationId, 200) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.requestedAt) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.companyId, 200) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(value.cloudAccountId, 200) ||
        !isProviderResource(value.provider, value.accountId, value.resourceId) ||
        !(0, resourceStrategyValidationShared_1.isCapabilityRef)(value.capability) ||
        (value.direction !== 'reduce' && value.direction !== 'restore') ||
        (value.intent !== 'ordinary' && value.intent !== 'owed-restore')) {
        return false;
    }
    if (value.action === 'check')
        return value.transition === undefined && value.leaseOwnerId === undefined;
    const transition = value.transition;
    return ((0, resourceStrategyScheduleValidation_1.isScheduledResourceTransitionV1)(transition) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.leaseOwnerId, 200) &&
        transition.companyId === value.companyId &&
        transition.cloudAccountId === value.cloudAccountId &&
        transition.providerScopeId === value.accountId &&
        transition.resourceId === value.resourceId &&
        transition.transition === value.direction &&
        transition.capability.capabilityId === value.capability.capabilityId &&
        transition.capability.capabilityVersion === value.capability.capabilityVersion);
}
const OUTCOMES = new Set(['succeeded', 'no-op', 'blocked', 'in-progress', 'failed']);
function isFailure(value) {
    return ((0, resourceStrategyValidationShared_1.isRecord)(value) &&
        (0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, ['reasonCode', 'retryable', 'code', 'statusCode', 'retryAfterSeconds']) &&
        (0, resourceStrategyValidationShared_1.isBoundedString)(value.reasonCode, 200) &&
        typeof value.retryable === 'boolean' &&
        (value.code === undefined || (0, resourceStrategyValidationShared_1.isBoundedString)(value.code, 200)) &&
        (value.statusCode === undefined || ((0, resourceStrategyValidationShared_1.isNonNegativeInteger)(value.statusCode) && value.statusCode <= 599)) &&
        (value.retryAfterSeconds === undefined || (0, resourceStrategyValidationShared_1.isNonNegativeInteger)(value.retryAfterSeconds)));
}
/** Validates a provider-engine → kernel resource-schedule result. */
function isResourceScheduleProviderResultV1(value) {
    if (!(0, resourceStrategyValidationShared_1.isWithinJsonByteLimit)(value, resourceScheduleProviderContracts_1.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.messageBytes))
        return false;
    if (!(0, resourceStrategyValidationShared_1.isRecord)(value) || containsCredentialKey(value))
        return false;
    if (!(0, resourceStrategyValidationShared_1.hasOnlyKeys)(value, [
        'schemaVersion',
        'provider',
        'entity',
        'action',
        'request',
        'readiness',
        'outcome',
        'submitted',
        'failure',
        'observed',
        'providerRequestId',
        'completedAtUtc',
    ])) {
        return false;
    }
    if (value.schemaVersion !== 1 ||
        !isProvider(value.provider) ||
        value.entity !== 'scheduler' ||
        value.action !== 'provider-result' ||
        !isResourceScheduleProviderRequestV1(value.request) ||
        value.request.provider !== value.provider ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(value.completedAtUtc) ||
        (value.providerRequestId !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedString)(value.providerRequestId, 200)) ||
        (value.submitted !== undefined && typeof value.submitted !== 'boolean') ||
        (value.failure !== undefined && !isFailure(value.failure))) {
        return false;
    }
    const readiness = value.readiness;
    if (!(0, resourceStrategyValidationShared_1.isRecord)(readiness) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(readiness, ['state', 'reasonCodes', 'missingActions']) ||
        !(0, resourceStrategyCapabilityValidation_1.isResourceSchedulingReadinessState)(readiness.state) ||
        !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(readiness.reasonCodes, resourceScheduleProviderContracts_1.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.reasonCodes) ||
        (readiness.missingActions !== undefined &&
            !(0, resourceStrategyValidationShared_1.isBoundedStringArray)(readiness.missingActions, resourceScheduleProviderContracts_1.RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.missingActions))) {
        return false;
    }
    const observed = value.observed;
    if (!(0, resourceStrategyValidationShared_1.isRecord)(observed) ||
        !(0, resourceStrategyValidationShared_1.hasOnlyKeys)(observed, ['state', 'instanceType', 'availabilityZone', 'observedAtUtc']) ||
        !(0, resourceStrategyValidationShared_1.isBoundedString)(observed.state, 64) ||
        (observed.instanceType !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedString)(observed.instanceType, 64)) ||
        (observed.availabilityZone !== undefined && !(0, resourceStrategyValidationShared_1.isBoundedString)(observed.availabilityZone, 64)) ||
        !(0, resourceStrategyValidationShared_1.isIsoTimestamp)(observed.observedAtUtc)) {
        return false;
    }
    if (value.request.action === 'check') {
        return value.outcome === undefined && value.submitted === undefined;
    }
    return typeof value.outcome === 'string' && OUTCOMES.has(value.outcome) && (value.outcome !== 'failed' || value.failure !== undefined);
}
//# sourceMappingURL=resourceScheduleProviderValidation.js.map