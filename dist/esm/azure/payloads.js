const SCHEDULER_TICK_PREFIX_V1 = 'scheduler:tick:';
const SCHEDULER_TICK_MAX_ID_LENGTH_V1 = 128;
const SCHEDULER_TICK_KEYS_V1 = [
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
const hasExactSchedulerTickKeysV1 = (value) => {
    const keys = Object.keys(value);
    return keys.length === SCHEDULER_TICK_KEYS_V1.length && SCHEDULER_TICK_KEYS_V1.every(key => Object.prototype.hasOwnProperty.call(value, key));
};
const normalizeSchedulerTickInstantV1 = (scheduledAt) => {
    if (typeof scheduledAt === 'string') {
        if (!isCanonicalUtcTimestampMilliseconds(scheduledAt)) {
            throw new TypeError('Scheduler tick time must be a canonical UTC timestamp with milliseconds');
        }
        return scheduledAt;
    }
    const milliseconds = scheduledAt instanceof Date ? scheduledAt.getTime() : scheduledAt;
    if (!Number.isFinite(milliseconds))
        throw new TypeError('Scheduler tick time must be finite');
    const normalized = new Date(milliseconds).toISOString();
    if (!isCanonicalUtcTimestampMilliseconds(normalized)) {
        throw new TypeError('Scheduler tick time must use a four-digit UTC year');
    }
    return normalized;
};
/** Creates the deterministic internal queue envelope for one cron occurrence. */
export const createSchedulerTickRequestMessageV1 = (scheduledAt) => {
    const scheduledAtUtc = normalizeSchedulerTickInstantV1(scheduledAt);
    const tickId = `${SCHEDULER_TICK_PREFIX_V1}${scheduledAtUtc}`;
    return {
        schemaVersion: 1,
        entity: 'scheduler',
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
/** Exact validator for the internal scheduler tick queue boundary. */
export const isSchedulerTickRequestMessageV1 = (value) => {
    try {
        if (typeof value !== 'object' || value === null || Array.isArray(value))
            return false;
        const candidate = value;
        if (!hasExactSchedulerTickKeysV1(candidate) || !isCanonicalUtcTimestampMilliseconds(candidate['scheduledAtUtc'])) {
            return false;
        }
        const expectedTickId = `${SCHEDULER_TICK_PREFIX_V1}${candidate['scheduledAtUtc']}`;
        return (candidate['schemaVersion'] === 1 &&
            candidate['entity'] === 'scheduler' &&
            candidate['action'] === 'tick' &&
            candidate['companyId'] === '*' &&
            candidate['cloudAccountId'] === '*' &&
            candidate['tenantId'] === '*' &&
            candidate['clientId'] === '*' &&
            typeof candidate['tickId'] === 'string' &&
            candidate['tickId'].length <= SCHEDULER_TICK_MAX_ID_LENGTH_V1 &&
            candidate['tickId'] === expectedTickId &&
            candidate['correlationId'] === expectedTickId);
    }
    catch {
        return false;
    }
};
