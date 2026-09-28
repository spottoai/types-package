"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReportJobRequestJson = exports.serializeReportJobSpecV1 = exports.parseReportJobSpecV1 = exports.normalizeReportSubscriptionIds = exports.isReportJobReportType = exports.CURRENT_STATE_SECTION_KEYS = exports.CURRENT_STATE_AUDIENCES = exports.SDM_BACKGROUND_DETAIL_ROW_LIMITS = exports.SDM_BACKGROUND_LAYOUTS = exports.REPORT_JOB_SPEC_MAX_BYTES = exports.REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS = exports.REPORT_JOB_MAX_SERVICE_IDS = exports.REPORT_JOB_MAX_CLOUD_ACCOUNTS = exports.REPORT_JOB_MAX_SUBSCRIPTIONS = exports.REPORT_JOB_REPORT_TYPES = exports.REPORT_JOB_SPEC_SCHEMA_VERSION = void 0;
/**
 * The background report request (`ReportJobSpecV1`), stored as `requestJson` on the `reportjobs` row
 * (core/specs/reporting/reporting-scheduler.md, "Request spec"; types-package/specs/reporting/reporting-scheduler-types.md).
 *
 * Parsing is strict (unknown fields fail) and normalising: subscription IDs are lower-cased, de-duplicated and
 * sorted, so equal requests serialise to the same canonical JSON.
 */
const reportingIds_1 = require("../shared/reportingIds");
exports.REPORT_JOB_SPEC_SCHEMA_VERSION = 1;
exports.REPORT_JOB_REPORT_TYPES = ['sdm', 'architecture-assessment'];
exports.REPORT_JOB_MAX_SUBSCRIPTIONS = 200;
exports.REPORT_JOB_MAX_CLOUD_ACCOUNTS = 20;
exports.REPORT_JOB_MAX_SERVICE_IDS = 20;
exports.REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS = 366;
/** Maximum UTF-8 size of the canonical `requestJson`. */
exports.REPORT_JOB_SPEC_MAX_BYTES = 32 * 1024;
exports.SDM_BACKGROUND_LAYOUTS = ['spotto-layout', 'monthly-insights'];
exports.SDM_BACKGROUND_DETAIL_ROW_LIMITS = [10, 25, 50, 'all'];
exports.CURRENT_STATE_AUDIENCES = ['customer', 'internal'];
exports.CURRENT_STATE_SECTION_KEYS = ['costOpportunities', 'securityPosture', 'reliabilityAvailability', 'quickWins', 'roadmap'];
const SERVICE_ID_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const isReportJobReportType = (value) => typeof value === 'string' && exports.REPORT_JOB_REPORT_TYPES.includes(value);
exports.isReportJobReportType = isReportJobReportType;
/**
 * Lower-cases, de-duplicates and sorts subscription IDs. Lower case is Spotto's canonical subscription ID form: the
 * request and the scope hash use it, and so do the storage keys and paths reportworker builds from it.
 */
const normalizeReportSubscriptionIds = (subscriptionIds) => Array.from(new Set(subscriptionIds.map(id => id.trim().toLowerCase()))).sort();
exports.normalizeReportSubscriptionIds = normalizeReportSubscriptionIds;
const parseScope = (value, errors) => {
    if (!(0, reportingIds_1.isPlainRecord)(value) || !(0, reportingIds_1.hasExactlyKeys)(value, ['cloudAccountIds', 'subscriptionIds'])) {
        errors.push('scope: must contain exactly cloudAccountIds and subscriptionIds');
        return undefined;
    }
    const { cloudAccountIds, subscriptionIds } = value;
    let valid = true;
    if (!Array.isArray(cloudAccountIds) || cloudAccountIds.length === 0) {
        errors.push('scope.cloudAccountIds: at least one cloud account is required');
        valid = false;
    }
    else {
        cloudAccountIds.forEach((id, index) => {
            if (!(0, reportingIds_1.isReportEntityId)(id)) {
                errors.push(`scope.cloudAccountIds[${index}]: invalid cloud account ID`);
                valid = false;
            }
        });
    }
    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
        errors.push('scope.subscriptionIds: at least one subscription is required');
        valid = false;
    }
    else {
        subscriptionIds.forEach((id, index) => {
            if (typeof id !== 'string' || !(0, reportingIds_1.isReportGuid)(id.trim())) {
                errors.push(`scope.subscriptionIds[${index}]: invalid subscription ID`);
                valid = false;
            }
        });
    }
    if (!valid)
        return undefined;
    const normalizedAccounts = Array.from(new Set(cloudAccountIds)).sort();
    const normalizedSubscriptions = (0, exports.normalizeReportSubscriptionIds)(subscriptionIds);
    if (normalizedAccounts.length > exports.REPORT_JOB_MAX_CLOUD_ACCOUNTS) {
        errors.push(`scope.cloudAccountIds: at most ${exports.REPORT_JOB_MAX_CLOUD_ACCOUNTS} cloud accounts`);
        return undefined;
    }
    if (normalizedSubscriptions.length > exports.REPORT_JOB_MAX_SUBSCRIPTIONS) {
        errors.push(`scope.subscriptionIds: at most ${exports.REPORT_JOB_MAX_SUBSCRIPTIONS} subscriptions`);
        return undefined;
    }
    return { cloudAccountIds: normalizedAccounts, subscriptionIds: normalizedSubscriptions };
};
const parsePeriod = (value, errors) => {
    if (!(0, reportingIds_1.isPlainRecord)(value)) {
        errors.push('period: must be an object');
        return undefined;
    }
    if (value.kind === 'previous-calendar-month' || value.kind === 'previous-calendar-quarter') {
        if (!(0, reportingIds_1.hasExactlyKeys)(value, ['kind'])) {
            errors.push('period: a period rule has no other fields');
            return undefined;
        }
        return { kind: value.kind };
    }
    if (value.kind === 'explicit') {
        if (!(0, reportingIds_1.hasExactlyKeys)(value, ['kind', 'startDate', 'endDate']) || !(0, reportingIds_1.isCalendarDate)(value.startDate) || !(0, reportingIds_1.isCalendarDate)(value.endDate)) {
            errors.push('period: explicit periods need startDate and endDate as YYYY-MM-DD');
            return undefined;
        }
        const days = (Date.parse(`${value.endDate}T00:00:00.000Z`) - Date.parse(`${value.startDate}T00:00:00.000Z`)) / DAY_MS + 1;
        if (days < 1 || days > exports.REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS) {
            errors.push(`period: startDate must not be after endDate and the period must be at most ${exports.REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS} days`);
            return undefined;
        }
        return { kind: 'explicit', startDate: value.startDate, endDate: value.endDate };
    }
    errors.push('period.kind: must be previous-calendar-month, previous-calendar-quarter or explicit');
    return undefined;
};
const parseSdmConfiguration = (value, errors) => {
    if (!(0, reportingIds_1.isPlainRecord)(value) || !(0, reportingIds_1.hasExactlyKeys)(value, ['layout', 'cloudIqServiceProfile'])) {
        errors.push('configuration: SDM needs exactly layout and cloudIqServiceProfile');
        return undefined;
    }
    const { layout, cloudIqServiceProfile: profile } = value;
    let valid = true;
    if (typeof layout !== 'string' || !exports.SDM_BACKGROUND_LAYOUTS.includes(layout)) {
        errors.push('configuration.layout: must be spotto-layout or monthly-insights');
        valid = false;
    }
    if (!(0, reportingIds_1.isPlainRecord)(profile) || !(0, reportingIds_1.hasExactlyKeys)(profile, ['selectedServiceIds'], ['detailRowLimit'])) {
        errors.push('configuration.cloudIqServiceProfile: needs selectedServiceIds and optionally detailRowLimit');
        return undefined;
    }
    const { selectedServiceIds, detailRowLimit } = profile;
    if (!Array.isArray(selectedServiceIds) ||
        selectedServiceIds.length > exports.REPORT_JOB_MAX_SERVICE_IDS ||
        !selectedServiceIds.every(id => typeof id === 'string' && SERVICE_ID_PATTERN.test(id)) ||
        new Set(selectedServiceIds).size !== selectedServiceIds.length) {
        errors.push(`configuration.cloudIqServiceProfile.selectedServiceIds: up to ${exports.REPORT_JOB_MAX_SERVICE_IDS} unique service IDs`);
        valid = false;
    }
    if (detailRowLimit !== undefined && !exports.SDM_BACKGROUND_DETAIL_ROW_LIMITS.includes(detailRowLimit)) {
        errors.push('configuration.cloudIqServiceProfile.detailRowLimit: must be 10, 25, 50 or all');
        valid = false;
    }
    if (!valid)
        return undefined;
    return {
        layout: layout,
        cloudIqServiceProfile: {
            selectedServiceIds: [...selectedServiceIds],
            ...(detailRowLimit === undefined ? {} : { detailRowLimit: detailRowLimit }),
        },
    };
};
const parseCurrentStateConfiguration = (value, errors) => {
    if (!(0, reportingIds_1.isPlainRecord)(value) || !(0, reportingIds_1.hasExactlyKeys)(value, ['audience', 'sections', 'scopeCurrencyCode'], ['preparedBy'])) {
        errors.push('configuration: Current State needs audience, sections, scopeCurrencyCode and optionally preparedBy');
        return undefined;
    }
    const { audience, sections, scopeCurrencyCode, preparedBy } = value;
    let valid = true;
    if (typeof audience !== 'string' || !exports.CURRENT_STATE_AUDIENCES.includes(audience)) {
        errors.push('configuration.audience: must be customer or internal');
        valid = false;
    }
    if (!(0, reportingIds_1.isPlainRecord)(sections) ||
        !(0, reportingIds_1.hasExactlyKeys)(sections, exports.CURRENT_STATE_SECTION_KEYS) ||
        !exports.CURRENT_STATE_SECTION_KEYS.every(key => typeof sections[key] === 'boolean')) {
        errors.push(`configuration.sections: needs exactly ${exports.CURRENT_STATE_SECTION_KEYS.join(', ')} as booleans`);
        valid = false;
    }
    const currency = typeof scopeCurrencyCode === 'string' ? scopeCurrencyCode.trim().toUpperCase() : '';
    if (!CURRENCY_PATTERN.test(currency)) {
        errors.push('configuration.scopeCurrencyCode: must be a three-letter ISO 4217 code');
        valid = false;
    }
    const preparedByText = typeof preparedBy === 'string' ? preparedBy.trim() : preparedBy;
    if (preparedByText !== undefined && (!(0, reportingIds_1.isBoundedPlainText)(preparedByText, 120) || preparedByText.includes('://'))) {
        errors.push('configuration.preparedBy: 1..120 characters of plain text, no URLs');
        valid = false;
    }
    if (!valid)
        return undefined;
    const sectionRecord = sections;
    return {
        audience: audience,
        sections: {
            costOpportunities: sectionRecord.costOpportunities,
            securityPosture: sectionRecord.securityPosture,
            reliabilityAvailability: sectionRecord.reliabilityAvailability,
            quickWins: sectionRecord.quickWins,
            roadmap: sectionRecord.roadmap,
        },
        scopeCurrencyCode: currency,
        ...(preparedByText === undefined ? {} : { preparedBy: preparedByText }),
    };
};
const parseSpecUnsafe = (input) => {
    const errors = [];
    if (!(0, reportingIds_1.isPlainRecord)(input))
        return { ok: false, errors: ['spec: must be an object'] };
    if (input.schemaVersion !== exports.REPORT_JOB_SPEC_SCHEMA_VERSION)
        return { ok: false, errors: ['schemaVersion: must be 1'] };
    if (input.reportType === 'sdm') {
        if (!(0, reportingIds_1.hasExactlyKeys)(input, ['schemaVersion', 'reportType', 'scope', 'period', 'configuration'])) {
            return { ok: false, errors: ['spec: SDM needs exactly schemaVersion, reportType, scope, period and configuration'] };
        }
        const scope = parseScope(input.scope, errors);
        const period = parsePeriod(input.period, errors);
        const configuration = parseSdmConfiguration(input.configuration, errors);
        if (!scope || !period || !configuration || errors.length > 0)
            return { ok: false, errors };
        return { ok: true, value: { schemaVersion: 1, reportType: 'sdm', scope, period, configuration } };
    }
    if (input.reportType === 'architecture-assessment') {
        if (!(0, reportingIds_1.hasExactlyKeys)(input, ['schemaVersion', 'reportType', 'scope', 'configuration'])) {
            return { ok: false, errors: ['spec: Current State needs exactly schemaVersion, reportType, scope and configuration (no period)'] };
        }
        const scope = parseScope(input.scope, errors);
        const configuration = parseCurrentStateConfiguration(input.configuration, errors);
        if (!scope || !configuration || errors.length > 0)
            return { ok: false, errors };
        return { ok: true, value: { schemaVersion: 1, reportType: 'architecture-assessment', scope, configuration } };
    }
    return { ok: false, errors: ['reportType: must be sdm or architecture-assessment'] };
};
/** Strict, normalising parser. Never throws (hostile getters are reported as an invalid spec). */
const parseReportJobSpecV1 = (input) => {
    try {
        return parseSpecUnsafe(input);
    }
    catch {
        return { ok: false, errors: ['spec: unreadable'] };
    }
};
exports.parseReportJobSpecV1 = parseReportJobSpecV1;
const canonicalSpecObject = (spec) => {
    const scope = { cloudAccountIds: spec.scope.cloudAccountIds, subscriptionIds: spec.scope.subscriptionIds };
    if (spec.reportType === 'sdm') {
        const period = spec.period.kind === 'explicit'
            ? { kind: 'explicit', startDate: spec.period.startDate, endDate: spec.period.endDate }
            : { kind: spec.period.kind };
        const profile = spec.configuration.cloudIqServiceProfile;
        return {
            schemaVersion: 1,
            reportType: 'sdm',
            scope,
            period,
            configuration: {
                layout: spec.configuration.layout,
                cloudIqServiceProfile: {
                    selectedServiceIds: profile.selectedServiceIds,
                    ...(profile.detailRowLimit === undefined ? {} : { detailRowLimit: profile.detailRowLimit }),
                },
            },
        };
    }
    const configuration = spec.configuration;
    return {
        schemaVersion: 1,
        reportType: 'architecture-assessment',
        scope,
        configuration: {
            audience: configuration.audience,
            sections: {
                costOpportunities: configuration.sections.costOpportunities,
                securityPosture: configuration.sections.securityPosture,
                reliabilityAvailability: configuration.sections.reliabilityAvailability,
                quickWins: configuration.sections.quickWins,
                roadmap: configuration.sections.roadmap,
            },
            scopeCurrencyCode: configuration.scopeCurrencyCode,
            ...(configuration.preparedBy === undefined ? {} : { preparedBy: configuration.preparedBy }),
        },
    };
};
/**
 * The canonical `requestJson`: validated, normalised, fixed key order. Producers store exactly this string, and
 * `requestSha256` is the SHA-256 of its UTF-8 bytes. Throws on an invalid spec or one above 32 KiB.
 */
const serializeReportJobSpecV1 = (spec) => {
    const parsed = (0, exports.parseReportJobSpecV1)(spec);
    if (!parsed.ok)
        throw new Error(`Invalid report job spec: ${parsed.errors.join('; ')}`);
    const json = JSON.stringify(canonicalSpecObject(parsed.value));
    if ((0, reportingIds_1.utf8ByteLength)(json) > exports.REPORT_JOB_SPEC_MAX_BYTES)
        throw new RangeError(`Report job spec exceeds ${exports.REPORT_JOB_SPEC_MAX_BYTES} bytes.`);
    return json;
};
exports.serializeReportJobSpecV1 = serializeReportJobSpecV1;
/**
 * Parses stored `requestJson`. It must be valid JSON, a valid spec and already canonical (byte-equal to
 * `serializeReportJobSpecV1` of itself), so a hash over the stored string identifies the request exactly.
 */
const parseReportJobRequestJson = (requestJson) => {
    if (typeof requestJson !== 'string' || requestJson.length === 0)
        return { ok: false, errors: ['requestJson: must be a non-empty string'] };
    if ((0, reportingIds_1.utf8ByteLength)(requestJson) > exports.REPORT_JOB_SPEC_MAX_BYTES)
        return { ok: false, errors: ['requestJson: exceeds 32 KiB'] };
    let raw;
    try {
        raw = JSON.parse(requestJson);
    }
    catch {
        return { ok: false, errors: ['requestJson: not valid JSON'] };
    }
    const parsed = (0, exports.parseReportJobSpecV1)(raw);
    if (!parsed.ok)
        return parsed;
    if (JSON.stringify(canonicalSpecObject(parsed.value)) !== requestJson)
        return { ok: false, errors: ['requestJson: not in canonical form'] };
    return parsed;
};
exports.parseReportJobRequestJson = parseReportJobRequestJson;
//# sourceMappingURL=reportJobSpec.js.map