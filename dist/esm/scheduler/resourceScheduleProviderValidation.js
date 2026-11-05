import { AWS_FORBIDDEN_CREDENTIAL_FIELDS } from '../aws/requests.js';
import { RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS, RESOURCE_SCHEDULE_PROVIDERS, } from './resourceScheduleProviderContracts.js';
import { isResourceSchedulingReadinessState } from './resourceStrategyCapabilityValidation.js';
import { isScheduledResourceTransitionV1 } from './resourceStrategyScheduleValidation.js';
import { hasOnlyKeys, isBoundedString, isBoundedStringArray, isCapabilityRef, isIsoTimestamp, isNonNegativeInteger, isRecord, isWithinJsonByteLimit, } from './resourceStrategyValidationShared.js';
const CREDENTIAL_KEYS = new Set(AWS_FORBIDDEN_CREDENTIAL_FIELDS);
const AWS_ACCOUNT_ID = /^\d{12}$/;
const AWS_INSTANCE_ARN = /^arn:aws(?:-[a-z]+)*:ec2:[a-z0-9-]+:(\d{12}):instance\/i-[0-9a-f]{8,17}$/;
function containsCredentialKey(value, depth = 0) {
    if (depth > 8)
        return true;
    if (Array.isArray(value))
        return value.some(item => containsCredentialKey(item, depth + 1));
    if (!isRecord(value))
        return false;
    return Object.keys(value).some(key => CREDENTIAL_KEYS.has(key) || containsCredentialKey(value[key], depth + 1));
}
function isProvider(value) {
    return typeof value === 'string' && RESOURCE_SCHEDULE_PROVIDERS.includes(value);
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
export function isResourceScheduleProviderRequestV1(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.messageBytes))
        return false;
    if (!isRecord(value) || containsCredentialKey(value))
        return false;
    if (!hasOnlyKeys(value, [
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
        !isBoundedString(value.requestId, 200) ||
        !isBoundedString(value.correlationId, 200) ||
        !isIsoTimestamp(value.requestedAt) ||
        !isBoundedString(value.companyId, 200) ||
        !isBoundedString(value.cloudAccountId, 200) ||
        !isProviderResource(value.provider, value.accountId, value.resourceId) ||
        !isCapabilityRef(value.capability) ||
        (value.direction !== 'reduce' && value.direction !== 'restore') ||
        (value.intent !== 'ordinary' && value.intent !== 'owed-restore')) {
        return false;
    }
    if (value.action === 'check')
        return value.transition === undefined && value.leaseOwnerId === undefined;
    const transition = value.transition;
    return (isScheduledResourceTransitionV1(transition) &&
        isBoundedString(value.leaseOwnerId, 200) &&
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
    return (isRecord(value) &&
        hasOnlyKeys(value, ['reasonCode', 'retryable', 'code', 'statusCode', 'retryAfterSeconds']) &&
        isBoundedString(value.reasonCode, 200) &&
        typeof value.retryable === 'boolean' &&
        (value.code === undefined || isBoundedString(value.code, 200)) &&
        (value.statusCode === undefined || (isNonNegativeInteger(value.statusCode) && value.statusCode <= 599)) &&
        (value.retryAfterSeconds === undefined || isNonNegativeInteger(value.retryAfterSeconds)));
}
/** Validates a provider-engine → kernel resource-schedule result. */
export function isResourceScheduleProviderResultV1(value) {
    if (!isWithinJsonByteLimit(value, RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.messageBytes))
        return false;
    if (!isRecord(value) || containsCredentialKey(value))
        return false;
    if (!hasOnlyKeys(value, [
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
        !isIsoTimestamp(value.completedAtUtc) ||
        (value.providerRequestId !== undefined && !isBoundedString(value.providerRequestId, 200)) ||
        (value.submitted !== undefined && typeof value.submitted !== 'boolean') ||
        (value.failure !== undefined && !isFailure(value.failure))) {
        return false;
    }
    const readiness = value.readiness;
    if (!isRecord(readiness) ||
        !hasOnlyKeys(readiness, ['state', 'reasonCodes', 'missingActions']) ||
        !isResourceSchedulingReadinessState(readiness.state) ||
        !isBoundedStringArray(readiness.reasonCodes, RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.reasonCodes) ||
        (readiness.missingActions !== undefined &&
            !isBoundedStringArray(readiness.missingActions, RESOURCE_SCHEDULE_PROVIDER_CONTRACT_LIMITS.missingActions))) {
        return false;
    }
    const observed = value.observed;
    if (!isRecord(observed) ||
        !hasOnlyKeys(observed, ['state', 'instanceType', 'availabilityZone', 'observedAtUtc']) ||
        !isBoundedString(observed.state, 64) ||
        (observed.instanceType !== undefined && !isBoundedString(observed.instanceType, 64)) ||
        (observed.availabilityZone !== undefined && !isBoundedString(observed.availabilityZone, 64)) ||
        !isIsoTimestamp(observed.observedAtUtc)) {
        return false;
    }
    if (value.request.action === 'check') {
        return value.outcome === undefined && value.submitted === undefined;
    }
    return typeof value.outcome === 'string' && OUTCOMES.has(value.outcome) && (value.outcome !== 'failed' || value.failure !== undefined);
}
