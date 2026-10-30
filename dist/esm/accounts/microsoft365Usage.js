export const MICROSOFT365_USAGE_WORKLOADS = ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'];
const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length <= 512;
const nullableText = (value) => value === null || text(value);
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value) => value === null || count(value);
const nullableBoolean = (value) => value === null || typeof value === 'boolean';
const nullableMoney = (value) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
const onlyKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key));
const block = (value, keys, predicate) => isRecord(value) && onlyKeys(value, keys) && keys.every(key => predicate(value[key]));
const nullableBlock = (value, keys, predicate = count) => value === null || block(value, keys, predicate);
const nullableDate = (value) => value === null || isMicrosoft365UsageDate(value);
/** Strict calendar date for report fields (timestamps and rolled-over invalid dates are rejected). */
export function isMicrosoft365UsageDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}
export function isMicrosoft365AccountProfile(value) {
    return (block(value, ['department', 'jobTitle', 'officeLocation', 'city', 'country', 'usageLocation', 'companyName', 'domain'], nullableText) &&
        isRecord(value) &&
        (value.usageLocation === null || (typeof value.usageLocation === 'string' && /^[A-Za-z]{2}$/.test(value.usageLocation))));
}
export function isMicrosoft365WorkloadLicense(value) {
    return (isRecord(value) &&
        onlyKeys(value, ['licensed', 'assignedOn']) &&
        nullableBoolean(value.licensed) &&
        nullableDate(value.assignedOn));
}
export function isMicrosoft365AccountUsage(value) {
    return (isRecord(value) &&
        onlyKeys(value, ['status', 'lastActivityDate', 'workloads', 'workloadLicenses', 'platforms', 'mailbox', 'oneDrive', 'copilotLastActivityDate']) &&
        typeof value.status === 'string' &&
        ['active', 'inactive', 'no_recorded_activity', 'unknown'].includes(value.status) &&
        nullableDate(value.lastActivityDate) &&
        (value.workloads === undefined || nullableBlock(value.workloads, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'], nullableDate)) &&
        (value.workloadLicenses === undefined ||
            nullableBlock(value.workloadLicenses, MICROSOFT365_USAGE_WORKLOADS, isMicrosoft365WorkloadLicense)) &&
        nullableBlock(value.platforms, ['windows', 'mac', 'web', 'mobile'], nullableBoolean) &&
        (value.mailbox === null ||
            (isRecord(value.mailbox) &&
                onlyKeys(value.mailbox, ['usedBytes', 'quotaBytes', 'hasArchive']) &&
                nullableCount(value.mailbox.usedBytes) &&
                nullableCount(value.mailbox.quotaBytes) &&
                nullableBoolean(value.mailbox.hasArchive))) &&
        nullableBlock(value.oneDrive, ['usedBytes', 'allocatedBytes'], nullableCount) &&
        nullableDate(value.copilotLastActivityDate));
}
export function isMicrosoft365LicenseProductUsage(value) {
    return block(value, ['active', 'inactive', 'noRecordedActivity', 'unknown', 'signedInButNoOfficeActivity'], count);
}
const HISTORY_USAGE_KEYS = [
    'evidence',
    'reportRefreshDate',
    'enabledLicensedAccountCount',
    'status',
    'signedInButNoOfficeActivityCount',
    'platforms',
    'copilot',
];
const isUsageSummaryCore = (value) => typeof value.evidence === 'string' &&
    ['available', 'report_unavailable', 'identities_concealed'].includes(value.evidence) &&
    nullableDate(value.reportRefreshDate) &&
    nullableCount(value.enabledLicensedAccountCount) &&
    nullableCount(value.signedInButNoOfficeActivityCount) &&
    nullableBlock(value.status, ['active', 'inactive', 'noRecordedActivity', 'unknown']) &&
    nullableBlock(value.platforms, ['windows', 'mac', 'web', 'mobile', 'webOrMobileOnly', 'noApps']) &&
    nullableBlock(value.copilot, ['licensedAccountCount', 'activeAccountCount', 'idleAccountCount']);
export function isMicrosoft365LicenseHistoryUsage(value) {
    return isRecord(value) && onlyKeys(value, HISTORY_USAGE_KEYS) && isUsageSummaryCore(value);
}
export function isMicrosoft365UsageSummary(value) {
    if (!isRecord(value) ||
        !onlyKeys(value, [
            ...HISTORY_USAGE_KEYS,
            'windowDays',
            'matchedAccountCount',
            'workloadActive',
            'mailbox',
            'oneDrive',
            'signIn',
            'dailyActive',
        ]) ||
        !isUsageSummaryCore(value) ||
        value.windowDays !== 30 ||
        !nullableCount(value.matchedAccountCount) ||
        !nullableBlock(value.workloadActive, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage']) ||
        !nullableBlock(value.mailbox, ['measuredCount', 'totalUsedBytes', 'overF3LimitCount']) ||
        !nullableBlock(value.oneDrive, ['measuredCount', 'totalUsedBytes', 'overF3LimitCount']) ||
        !(value.signIn === null ||
            (isRecord(value.signIn) &&
                onlyKeys(value.signIn, ['neverSignedInCount', 'newAccountCount', 'guestWithPaidLicenseCount', 'basis', 'observedLicensedAccountCount']) &&
                ['neverSignedInCount', 'newAccountCount', 'guestWithPaidLicenseCount'].every(key => count(value.signIn[key])) &&
                (value.signIn.basis === undefined || value.signIn.basis === 'licensed_accounts' || value.signIn.basis === 'observed_licensed_accounts') &&
                (value.signIn.observedLicensedAccountCount === undefined || count(value.signIn.observedLicensedAccountCount)))))
        return false;
    if (value.dailyActive === undefined)
        return true;
    if (!Array.isArray(value.dailyActive) || value.dailyActive.length > 180)
        return false;
    let previous = '';
    return value.dailyActive.every(row => {
        if (!isRecord(row) ||
            !onlyKeys(row, ['date', 'office365', 'exchange', 'oneDrive', 'sharePoint', 'teams']) ||
            !isMicrosoft365UsageDate(row.date) ||
            row.date <= previous ||
            !['office365', 'exchange', 'oneDrive', 'sharePoint', 'teams'].every(key => nullableCount(row[key])))
            return false;
        previous = row.date;
        return true;
    });
}
export function isMicrosoft365LicenseBreakdownRow(value) {
    return (isRecord(value) &&
        onlyKeys(value, ['key', 'label', 'licensedAccountCount', 'paidSeatCount', 'monthlyCost', 'reviewAccountCount', 'reviewMonthlyCost']) &&
        text(value.key) &&
        value.key === value.key.toLowerCase() &&
        text(value.label) &&
        count(value.licensedAccountCount) &&
        count(value.paidSeatCount) &&
        count(value.reviewAccountCount) &&
        nullableMoney(value.monthlyCost) &&
        nullableMoney(value.reviewMonthlyCost));
}
