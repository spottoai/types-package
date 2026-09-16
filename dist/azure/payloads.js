"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceSchedulerTickRequestMessageV1 = exports.createResourceSchedulerTickRequestMessageV1 = void 0;
const RESOURCE_SCHEDULER_TICK_PREFIX_V1 = 'resource-scheduler:tick:';
const RESOURCE_SCHEDULER_TICK_MAX_ID_LENGTH_V1 = 128;
const RESOURCE_SCHEDULER_TICK_KEYS_V1 = [
    'schemaVersion',
    'entity',
    'action',
    'companyId',
    'cloudAccountId',
    'tenantId',
    'clientId',
    'tickId',
    'scheduledAtUtc',
    'correlationId',
];
const CANONICAL_UTC_TIMESTAMP_MILLISECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const isCanonicalUtcTimestampMilliseconds = (value) => {
    if (typeof value !== 'string' || !CANONICAL_UTC_TIMESTAMP_MILLISECONDS.test(value))
        return false;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
};
const hasExactResourceSchedulerTickKeysV1 = (value) => {
    const keys = Object.keys(value);
    return (keys.length === RESOURCE_SCHEDULER_TICK_KEYS_V1.length &&
        RESOURCE_SCHEDULER_TICK_KEYS_V1.every(key => Object.prototype.hasOwnProperty.call(value, key)));
};
const normalizeResourceSchedulerTickInstantV1 = (scheduledAt) => {
    if (typeof scheduledAt === 'string') {
        if (!isCanonicalUtcTimestampMilliseconds(scheduledAt)) {
            throw new TypeError('Resource scheduler tick time must be a canonical UTC timestamp with milliseconds');
        }
        return scheduledAt;
    }
    const milliseconds = scheduledAt instanceof Date ? scheduledAt.getTime() : scheduledAt;
    if (!Number.isFinite(milliseconds))
        throw new TypeError('Resource scheduler tick time must be finite');
    const normalized = new Date(milliseconds).toISOString();
    if (!isCanonicalUtcTimestampMilliseconds(normalized)) {
        throw new TypeError('Resource scheduler tick time must use a four-digit UTC year');
    }
    return normalized;
};
/** Creates the deterministic internal queue envelope for one cron occurrence. */
const createResourceSchedulerTickRequestMessageV1 = (scheduledAt) => {
    const scheduledAtUtc = normalizeResourceSchedulerTickInstantV1(scheduledAt);
    const tickId = `${RESOURCE_SCHEDULER_TICK_PREFIX_V1}${scheduledAtUtc}`;
    return {
        schemaVersion: 1,
        entity: 'resource-scheduler',
        action: 'tick',
        companyId: '*',
        cloudAccountId: '*',
        tenantId: '*',
        clientId: '*',
        tickId,
        scheduledAtUtc,
        correlationId: tickId,
    };
};
exports.createResourceSchedulerTickRequestMessageV1 = createResourceSchedulerTickRequestMessageV1;
/** Exact validator for the internal resource-scheduler tick queue boundary. */
const isResourceSchedulerTickRequestMessageV1 = (value) => {
    try {
        if (typeof value !== 'object' || value === null || Array.isArray(value))
            return false;
        const candidate = value;
        if (!hasExactResourceSchedulerTickKeysV1(candidate) || !isCanonicalUtcTimestampMilliseconds(candidate['scheduledAtUtc'])) {
            return false;
        }
        const expectedTickId = `${RESOURCE_SCHEDULER_TICK_PREFIX_V1}${candidate['scheduledAtUtc']}`;
        return (candidate['schemaVersion'] === 1 &&
            candidate['entity'] === 'resource-scheduler' &&
            candidate['action'] === 'tick' &&
            candidate['companyId'] === '*' &&
            candidate['cloudAccountId'] === '*' &&
            candidate['tenantId'] === '*' &&
            candidate['clientId'] === '*' &&
            typeof candidate['tickId'] === 'string' &&
            candidate['tickId'].length <= RESOURCE_SCHEDULER_TICK_MAX_ID_LENGTH_V1 &&
            candidate['tickId'] === expectedTickId &&
            candidate['correlationId'] === expectedTickId);
    }
    catch {
        return false;
    }
};
exports.isResourceSchedulerTickRequestMessageV1 = isResourceSchedulerTickRequestMessageV1;
//# sourceMappingURL=payloads.js.map