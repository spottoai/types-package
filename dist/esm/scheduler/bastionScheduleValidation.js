const MAX_ID_LENGTH = 2048;
const MAX_NAME_LENGTH = 120;
const MAX_NOTES_LENGTH = 1000;
const MAX_ACTION_COUNT = 64;
const MAX_WINDOWS = 14;
const MAX_WRITE_REQUEST_BYTES = 32 * 1024;
const MAX_PUBLIC_DTO_BYTES = 16 * 1024;
const MINUTES_PER_WEEK = 7 * 24 * 60;
const readinessStatuses = new Set(['confirmed', 'missing', 'unknown', 'unsupported']);
const readinessReasonCodes = new Set([
    'feature-disabled',
    'resource-not-found',
    'unsupported-profile',
    'unsupported-region',
    'missing-permission',
    'permission-unknown',
    'management-lock',
]);
const availabilityPhases = new Set(['available', 'removing', 'absent', 'restoring']);
const availabilityResults = new Set(['succeeded', 'skipped', 'blocked', 'failed', 'pending']);
const availabilityReasonCodes = new Set([
    ...readinessReasonCodes,
    'active-sessions',
    'session-state-unknown',
    'snapshot-failed',
    'active-snapshot-missing',
    'source-drift',
    'dependency-missing',
    'dependency-drift',
    'stale-run',
    'continuation-overdue',
    'azure-operation-failed',
    'restore-timeout',
]);
function isPlainRecord(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    try {
        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }
    catch {
        return false;
    }
}
function hasExactFields(value, requiredFields, optionalFields = []) {
    if (!isPlainRecord(value)) {
        return false;
    }
    try {
        const allowedFields = new Set([...requiredFields, ...optionalFields]);
        const keys = Object.keys(value);
        return requiredFields.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowedFields.has(field));
    }
    catch {
        return false;
    }
}
function utf8ByteLength(value) {
    let bytes = 0;
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code <= 0x7f) {
            bytes += 1;
        }
        else if (code <= 0x7ff) {
            bytes += 2;
        }
        else if (code >= 0xd800 &&
            code <= 0xdbff &&
            index + 1 < value.length &&
            value.charCodeAt(index + 1) >= 0xdc00 &&
            value.charCodeAt(index + 1) <= 0xdfff) {
            bytes += 4;
            index += 1;
        }
        else {
            bytes += 3;
        }
    }
    return bytes;
}
function isWithinJsonSize(value, maximumBytes) {
    try {
        const json = JSON.stringify(value);
        return typeof json === 'string' && utf8ByteLength(json) <= maximumBytes;
    }
    catch {
        return false;
    }
}
function isBoundedString(value, maximumLength, allowEmpty = false) {
    return typeof value === 'string' && value.length <= maximumLength && (allowEmpty || value.trim().length > 0);
}
function isPositiveSafeInteger(value) {
    return Number.isSafeInteger(value) && typeof value === 'number' && value > 0;
}
function isIsoUtcTimestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
        return false;
    }
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) {
        return false;
    }
    const normalizedInput = value.includes('.')
        ? value.replace(/\.(\d{1,3})Z$/, (_, fraction) => `.${fraction.padEnd(3, '0')}Z`)
        : value.replace('Z', '.000Z');
    return parsed.toISOString() === normalizedInput;
}
function localTimeToMinutes(value) {
    if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
        return undefined;
    }
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}
function isUniqueBoundedStringArray(value, minimumLength, maximumLength) {
    if (!Array.isArray(value) ||
        value.length < minimumLength ||
        value.length > maximumLength ||
        !value.every(item => isBoundedString(item, MAX_ID_LENGTH))) {
        return false;
    }
    return new Set(value).size === value.length;
}
function isAvailabilityConfiguration(value) {
    if (!hasExactFields(value, ['accessWindows'])) {
        return false;
    }
    const windows = value.accessWindows;
    if (!Array.isArray(windows) || windows.length < 1 || windows.length > MAX_WINDOWS) {
        return false;
    }
    const windowIds = new Set();
    const intervals = [];
    for (const window of windows) {
        if (!hasExactFields(window, ['windowId', 'daysOfWeek', 'accessStartTimeLocal', 'accessEndTimeLocal']) ||
            !isBoundedString(window.windowId, MAX_ID_LENGTH) ||
            windowIds.has(window.windowId)) {
            return false;
        }
        windowIds.add(window.windowId);
        if (!Array.isArray(window.daysOfWeek) ||
            window.daysOfWeek.length < 1 ||
            window.daysOfWeek.length > 7 ||
            !window.daysOfWeek.every(day => Number.isInteger(day) && typeof day === 'number' && day >= 0 && day <= 6) ||
            new Set(window.daysOfWeek).size !== window.daysOfWeek.length) {
            return false;
        }
        const startTime = localTimeToMinutes(window.accessStartTimeLocal);
        const endTime = localTimeToMinutes(window.accessEndTimeLocal);
        if (startTime === undefined || endTime === undefined || startTime === endTime) {
            return false;
        }
        for (const day of window.daysOfWeek) {
            const start = day * 24 * 60 + startTime;
            const end = day * 24 * 60 + endTime + (endTime <= startTime ? 24 * 60 : 0);
            intervals.push({ start, end });
        }
    }
    return !intervals.some((left, leftIndex) => intervals.some((right, rightIndex) => {
        if (rightIndex <= leftIndex) {
            return false;
        }
        return [-MINUTES_PER_WEEK, 0, MINUTES_PER_WEEK].some(offset => {
            const shiftedStart = right.start + offset;
            const shiftedEnd = right.end + offset;
            return left.start < shiftedEnd && shiftedStart < left.end;
        });
    }));
}
export function isBastionAvailabilityWeeklyScheduleWriteRequest(value) {
    if (!isWithinJsonSize(value, MAX_WRITE_REQUEST_BYTES) ||
        !hasExactFields(value, [
            'definitionType',
            'name',
            'providerName',
            'providerScopeId',
            'cloudAccountId',
            'resourceId',
            'timezone',
            'acknowledgementVersion',
            'configuration',
        ], ['targetResourceType', 'notes'])) {
        return false;
    }
    return (value.definitionType === 'bastion-availability-weekly' &&
        isBoundedString(value.name, MAX_NAME_LENGTH) &&
        isBoundedString(value.providerName, MAX_ID_LENGTH) &&
        isBoundedString(value.providerScopeId, MAX_ID_LENGTH) &&
        isBoundedString(value.cloudAccountId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isBoundedString(value.timezone, MAX_ID_LENGTH) &&
        (value.targetResourceType === undefined || value.targetResourceType === 'Microsoft.Network/bastionHosts') &&
        (value.notes === undefined || isBoundedString(value.notes, MAX_NOTES_LENGTH, true)) &&
        value.acknowledgementVersion === 'bastion-delete-recreate-v1' &&
        isAvailabilityConfiguration(value.configuration));
}
export function isBastionAvailabilityWeeklyScheduleDefinition(value) {
    if (!isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) ||
        !hasExactFields(value, [
            'definitionId',
            'definitionClass',
            'definitionType',
            'companyId',
            'providerName',
            'providerScopeId',
            'cloudAccountId',
            'resourceId',
            'targetResourceType',
            'name',
            'timezone',
            'status',
            'definitionRevision',
            'acknowledgementVersion',
            'configuration',
            'createdAtUtc',
            'updatedAtUtc',
        ], ['notes', 'compiledScheduleIds', 'nextRunUtc', 'lastRunAtUtc', 'lastSuccessfulRunAtUtc', 'lastRunStatus', 'createdByUserId', 'updatedByUserId'])) {
        return false;
    }
    return (value.definitionId !== undefined &&
        isBoundedString(value.definitionId, MAX_ID_LENGTH) &&
        value.definitionClass === 'composite' &&
        value.definitionType === 'bastion-availability-weekly' &&
        isBoundedString(value.companyId, MAX_ID_LENGTH) &&
        isBoundedString(value.providerName, MAX_ID_LENGTH) &&
        isBoundedString(value.providerScopeId, MAX_ID_LENGTH) &&
        isBoundedString(value.cloudAccountId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        value.targetResourceType === 'Microsoft.Network/bastionHosts' &&
        isBoundedString(value.name, MAX_NAME_LENGTH) &&
        isBoundedString(value.timezone, MAX_ID_LENGTH) &&
        (value.status === 'active' || value.status === 'paused') &&
        isPositiveSafeInteger(value.definitionRevision) &&
        value.acknowledgementVersion === 'bastion-delete-recreate-v1' &&
        isAvailabilityConfiguration(value.configuration) &&
        (value.notes === undefined || isBoundedString(value.notes, MAX_NOTES_LENGTH, true)) &&
        (value.compiledScheduleIds === undefined || isUniqueBoundedStringArray(value.compiledScheduleIds, 0, 28)) &&
        (value.nextRunUtc === undefined || isIsoUtcTimestamp(value.nextRunUtc)) &&
        (value.lastRunAtUtc === undefined || isIsoUtcTimestamp(value.lastRunAtUtc)) &&
        (value.lastSuccessfulRunAtUtc === undefined || isIsoUtcTimestamp(value.lastSuccessfulRunAtUtc)) &&
        (value.lastRunStatus === undefined ||
            value.lastRunStatus === 'success' ||
            value.lastRunStatus === 'dispatch-failed' ||
            value.lastRunStatus === 'dispatching') &&
        isIsoUtcTimestamp(value.createdAtUtc) &&
        isIsoUtcTimestamp(value.updatedAtUtc) &&
        (value.createdByUserId === undefined || isBoundedString(value.createdByUserId, MAX_ID_LENGTH)) &&
        (value.updatedByUserId === undefined || isBoundedString(value.updatedByUserId, MAX_ID_LENGTH)));
}
export function isBastionScheduleRun(value) {
    if (!isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) ||
        !isPlainRecord(value) ||
        (value.compiledOperation !== 'remove' && value.compiledOperation !== 'restore')) {
        return false;
    }
    const requiredFields = [
        'scheduleId',
        'scheduleRunId',
        'targetType',
        'selectorType',
        'scheduleType',
        'providerScopeId',
        'cloudAccountId',
        'resourceId',
        'definitionId',
        'definitionClass',
        'definitionType',
        'compiledRuleId',
        'compiledOperation',
        'definitionRevision',
        'scheduledForUtc',
        ...(value.compiledOperation === 'remove' ? ['controlGeneration'] : []),
    ];
    if (!hasExactFields(value, requiredFields, [
        'scheduleName',
        'scheduleGroupId',
        'scheduleGroupType',
        'targetCount',
        'createdByUserId',
        'updatedByUserId',
    ])) {
        return false;
    }
    return (isBoundedString(value.scheduleId, MAX_ID_LENGTH) &&
        isBoundedString(value.scheduleRunId, MAX_ID_LENGTH) &&
        (value.scheduleName === undefined || isBoundedString(value.scheduleName, MAX_NAME_LENGTH)) &&
        value.targetType === 'resource-operation' &&
        value.selectorType === 'single-resource' &&
        value.scheduleType === 'recurring' &&
        isBoundedString(value.providerScopeId, MAX_ID_LENGTH) &&
        isBoundedString(value.cloudAccountId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isBoundedString(value.definitionId, MAX_ID_LENGTH) &&
        value.definitionClass === 'composite' &&
        value.definitionType === 'bastion-availability-weekly' &&
        isBoundedString(value.compiledRuleId, MAX_ID_LENGTH) &&
        isPositiveSafeInteger(value.definitionRevision) &&
        isIsoUtcTimestamp(value.scheduledForUtc) &&
        (value.scheduleGroupId === undefined || isBoundedString(value.scheduleGroupId, MAX_ID_LENGTH)) &&
        (value.scheduleGroupType === undefined || value.scheduleGroupType === 'resource-schedule-definition') &&
        (value.targetCount === undefined || value.targetCount === 1) &&
        (value.createdByUserId === undefined || isBoundedString(value.createdByUserId, MAX_ID_LENGTH)) &&
        (value.updatedByUserId === undefined || isBoundedString(value.updatedByUserId, MAX_ID_LENGTH)) &&
        (value.compiledOperation === 'restore' || isPositiveSafeInteger(value.controlGeneration)));
}
export function isBastionScheduleControlV1(value) {
    return (isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) &&
        hasExactFields(value, [
            'schemaVersion',
            'companyId',
            'resourceId',
            'definitionId',
            'definitionRevision',
            'controlGeneration',
            'desiredStatus',
            'updatedAtUtc',
        ]) &&
        value.schemaVersion === 1 &&
        isBoundedString(value.companyId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isBoundedString(value.definitionId, MAX_ID_LENGTH) &&
        isPositiveSafeInteger(value.definitionRevision) &&
        isPositiveSafeInteger(value.controlGeneration) &&
        (value.desiredStatus === 'active' || value.desiredStatus === 'paused') &&
        isIsoUtcTimestamp(value.updatedAtUtc));
}
export function isBastionScheduleReadinessV1(value) {
    if (!isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) ||
        !hasExactFields(value, ['schemaVersion', 'status', 'companyId', 'cloudAccountId', 'subscriptionId', 'resourceId', 'requiredActions', 'missingActions', 'checkedAtUtc'], ['reasonCode'])) {
        return false;
    }
    const requiredActions = value.requiredActions;
    const missingActions = value.missingActions;
    if (value.schemaVersion !== 1 ||
        typeof value.status !== 'string' ||
        !readinessStatuses.has(value.status) ||
        !isBoundedString(value.companyId, MAX_ID_LENGTH) ||
        !isBoundedString(value.cloudAccountId, MAX_ID_LENGTH) ||
        !isBoundedString(value.subscriptionId, MAX_ID_LENGTH) ||
        !isBoundedString(value.resourceId, MAX_ID_LENGTH) ||
        !isUniqueBoundedStringArray(requiredActions, 1, MAX_ACTION_COUNT) ||
        !isUniqueBoundedStringArray(missingActions, 0, MAX_ACTION_COUNT) ||
        !missingActions.every(action => requiredActions.includes(action)) ||
        (value.status === 'confirmed' && missingActions.length !== 0) ||
        (value.status === 'missing' && missingActions.length === 0) ||
        !isIsoUtcTimestamp(value.checkedAtUtc)) {
        return false;
    }
    return value.reasonCode === undefined || (typeof value.reasonCode === 'string' && readinessReasonCodes.has(value.reasonCode));
}
export function isBastionAvailabilityStatusV1(value) {
    return (isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) &&
        hasExactFields(value, [
            'schemaVersion',
            'companyId',
            'resourceId',
            'definitionId',
            'definitionRevision',
            'phase',
            'lastOperation',
            'lastResult',
            'restoreAvailable',
            'updatedAtUtc',
        ], ['reasonCode', 'snapshotCapturedAtUtc']) &&
        value.schemaVersion === 1 &&
        isBoundedString(value.companyId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isBoundedString(value.definitionId, MAX_ID_LENGTH) &&
        isPositiveSafeInteger(value.definitionRevision) &&
        typeof value.phase === 'string' &&
        availabilityPhases.has(value.phase) &&
        (value.lastOperation === 'remove' || value.lastOperation === 'restore') &&
        typeof value.lastResult === 'string' &&
        availabilityResults.has(value.lastResult) &&
        (value.reasonCode === undefined || (typeof value.reasonCode === 'string' && availabilityReasonCodes.has(value.reasonCode))) &&
        (value.snapshotCapturedAtUtc === undefined || isIsoUtcTimestamp(value.snapshotCapturedAtUtc)) &&
        typeof value.restoreAvailable === 'boolean' &&
        isIsoUtcTimestamp(value.updatedAtUtc));
}
export function isBastionPauseResponse(value) {
    return (isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) &&
        hasExactFields(value, ['status', 'resourceId', 'controlGeneration', 'requestedAtUtc']) &&
        (value.status === 'paused' || value.status === 'pause-pending') &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isPositiveSafeInteger(value.controlGeneration) &&
        isIsoUtcTimestamp(value.requestedAtUtc));
}
export function isBastionRestoreNowResponse(value) {
    return (isWithinJsonSize(value, MAX_PUBLIC_DTO_BYTES) &&
        hasExactFields(value, ['accepted', 'scheduleRunId', 'resourceId', 'requestedAtUtc']) &&
        typeof value.accepted === 'boolean' &&
        isBoundedString(value.scheduleRunId, MAX_ID_LENGTH) &&
        isBoundedString(value.resourceId, MAX_ID_LENGTH) &&
        isIsoUtcTimestamp(value.requestedAtUtc));
}
