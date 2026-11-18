"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAiProviderConnectionStatus = exports.isAiProviderCredentialKindFor = exports.isAiUsageTags = exports.isAiUsageProvider = void 0;
exports.isPutAiUsageAllocationRequest = isPutAiUsageAllocationRequest;
exports.isAiUsageAllocation = isAiUsageAllocation;
exports.isAiUsageCollectRequestMessage = isAiUsageCollectRequestMessage;
exports.isAiUsageSummaryArtifact = isAiUsageSummaryArtifact;
exports.isAiUsagePeopleArtifact = isAiUsagePeopleArtifact;
exports.isAiUsageLatestPointer = isAiUsageLatestPointer;
const aiUsage_1 = require("./aiUsage");
const record = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value, max = 512) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const nullableText = (value, max = 512) => value === null || text(value, max);
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableNumber = (value) => value === null || (typeof value === 'number' && Number.isFinite(value));
const nullableCount = (value) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
const timestamp = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const nullableTimestamp = (value) => value === null || timestamp(value);
const currencyCode = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
const oneOf = (values, value) => typeof value === 'string' && values.includes(value);
const isAiUsageProvider = (value) => oneOf(aiUsage_1.AI_USAGE_PROVIDERS, value);
exports.isAiUsageProvider = isAiUsageProvider;
const PRINCIPAL_KINDS = ['user', 'service_account', 'api_key', 'github_login', 'workspace', 'resource', 'unknown'];
/** True for a value shaped like an email address; such values never appear in aggregate artifacts. */
const EMAIL_SHAPE = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/;
const looksLikeEmail = (value) => typeof value === 'string' && EMAIL_SHAPE.test(value);
/** Allocation tags: at most AI_USAGE_MAX_TAGS, keys and values matching the contract patterns. */
const isAiUsageTags = (value) => record(value) &&
    Object.keys(value).length <= aiUsage_1.AI_USAGE_MAX_TAGS &&
    Object.entries(value).every(([key, tag]) => aiUsage_1.AI_USAGE_TAG_KEY_PATTERN.test(key) && !looksLikeEmail(key) && typeof tag === 'string' && aiUsage_1.AI_USAGE_TAG_VALUE_PATTERN.test(tag) && !looksLikeEmail(tag));
exports.isAiUsageTags = isAiUsageTags;
const department = (value) => value === null ||
    (typeof value === 'string' &&
        value.trim().length > 0 &&
        value === value.trim() &&
        value.length <= aiUsage_1.AI_USAGE_DEPARTMENT_MAX_LENGTH &&
        aiUsage_1.AI_USAGE_TAG_VALUE_PATTERN.test(value) &&
        !looksLikeEmail(value));
const allocationTarget = (value) => record(value) && oneOf(aiUsage_1.AI_USAGE_ALLOCATION_TARGET_TYPES, value.type) && text(value.id, 256);
/** Body of `PUT …/ai-usage/allocations`. */
function isPutAiUsageAllocationRequest(value) {
    return record(value) && allocationTarget(value.target) && department(value.department) && (0, exports.isAiUsageTags)(value.tags);
}
function isAiUsageAllocation(value) {
    return (record(value) &&
        text(value.allocationId, 256) &&
        (0, aiUsage_1.isAiUsageSafeId)(value.companyId) &&
        allocationTarget(value.target) &&
        department(value.department) &&
        (0, exports.isAiUsageTags)(value.tags) &&
        text(value.targetLabel) &&
        timestamp(value.updatedAt) &&
        nullableText(value.updatedBy, 320));
}
const isAiProviderCredentialKindFor = (provider, kind) => oneOf(aiUsage_1.AI_PROVIDER_CREDENTIAL_KINDS, kind) && aiUsage_1.AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER[provider].includes(kind);
exports.isAiProviderCredentialKindFor = isAiProviderCredentialKindFor;
const isAiProviderConnectionStatus = (value) => oneOf(aiUsage_1.AI_PROVIDER_CONNECTION_STATUSES, value);
exports.isAiProviderConnectionStatus = isAiProviderConnectionStatus;
function isAiUsageCollectRequestMessage(value) {
    return (record(value) &&
        value.entity === aiUsage_1.AI_USAGE_REQUEST_ENTITY &&
        value.action === aiUsage_1.AI_USAGE_REQUEST_ACTION &&
        (0, aiUsage_1.isAiUsageSafeId)(value.companyId) &&
        (0, aiUsage_1.isAiUsageSafeId)(value.connectionId) &&
        oneOf(aiUsage_1.AI_USAGE_COLLECTION_MODES, value.mode) &&
        timestamp(value.requestedAt) &&
        text(value.requestId, 128));
}
function tokens(value) {
    return record(value) && nullableCount(value.input) && nullableCount(value.cacheRead) && nullableCount(value.cacheWrite) && nullableCount(value.output);
}
function money(value) {
    return nullableNumber(value.amount) && nullableNumber(value.listAmount);
}
const nullableRatio = (value) => value === null || (typeof value === 'number' && value >= 0 && value <= 1);
function insight(value) {
    if (!record(value))
        return false;
    const subject = value.subject;
    return (oneOf(aiUsage_1.AI_USAGE_INSIGHT_KINDS, value.kind) &&
        oneOf(['action', 'review', 'info'], value.severity) &&
        count(value.rank) &&
        value.rank >= 1 &&
        nullableNumber(value.amount) &&
        nullableNumber(value.ratio) &&
        (subject === null || (record(subject) && oneOf(['company', 'provider', 'model', 'application', 'connection'], subject.type) && text(subject.key, 256) && text(subject.label))) &&
        record(value.facts) &&
        Object.values(value.facts).every(nullableNumber) &&
        !Object.keys(value.facts).some(key => /email|person|name/i.test(key)));
}
function breakdownRow(value) {
    return (record(value) &&
        nullableNumber(value.costPerMillionTokens) &&
        nullableRatio(value.cacheHitRatio) &&
        (value.provider === null || (0, exports.isAiUsageProvider)(value.provider)) &&
        nullableNumber(value.previousAmount) &&
        text(value.key) &&
        text(value.label) &&
        money(value) &&
        tokens(value.tokens) &&
        nullableCount(value.requests) &&
        (value.people === null || count(value.people)));
}
function breakdown(value) {
    return Array.isArray(value) && value.length <= aiUsage_1.AI_USAGE_MAX_BREAKDOWN_ROWS && value.every(breakdownRow);
}
function freshness(value) {
    return (record(value) &&
        (0, exports.isAiUsageProvider)(value.provider) &&
        text(value.connectionId, 128) &&
        text(value.displayName) &&
        (value.dataThrough === null || (0, aiUsage_1.isAiUsageDay)(value.dataThrough)) &&
        nullableTimestamp(value.providerRefreshedAt) &&
        nullableTimestamp(value.pulledAt) &&
        oneOf(['provisional', 'final', 'unavailable'], value.status) &&
        Array.isArray(value.reasonCodes) &&
        value.reasonCodes.every(code => text(code, 128)));
}
/** Structural guard for the company summary artifact. It must carry no person identifiers. */
function azureOperationPoint(value) {
    return record(value) && oneOf(aiUsage_1.AI_USAGE_AZURE_OPERATION_METRICS, value.metric) &&
        typeof value.average === 'number' && Number.isFinite(value.average) && value.average >= 0 &&
        typeof value.samples === 'number' && Number.isSafeInteger(value.samples) && value.samples > 0;
}
function isAiUsageSummaryArtifact(value) {
    if (!record(value) || value.schema !== aiUsage_1.AI_USAGE_SUMMARY_SCHEMA)
        return false;
    if (!(0, aiUsage_1.isAiUsageSafeId)(value.companyId) || !(0, aiUsage_1.isAiUsageMonth)(value.month) || !timestamp(value.generatedAt) || !text(value.runId, 128))
        return false;
    if (!currencyCode(value.currency))
        return false;
    if ('people' in value)
        return false;
    const totals = value.totals;
    if (!record(totals) ||
        !money(totals) ||
        !nullableNumber(totals.peopleAmount) ||
        !nullableNumber(totals.applicationsAmount) ||
        !nullableNumber(totals.unmappedAmount) ||
        !count(totals.activePeople) ||
        !nullableNumber(totals.costPerActivePerson) ||
        !tokens(totals.tokens) ||
        !nullableCount(totals.requests) ||
        !(totals.cacheHitRatio === null || (typeof totals.cacheHitRatio === 'number' && totals.cacheHitRatio >= 0 && totals.cacheHitRatio <= 1))) {
        return false;
    }
    const monthlyOk = Array.isArray(value.monthly) &&
        value.monthly.length <= 13 * aiUsage_1.AI_USAGE_PROVIDERS.length &&
        value.monthly.every(row => record(row) && (0, aiUsage_1.isAiUsageMonth)(row.month) && (0, exports.isAiUsageProvider)(row.provider) && money(row) && oneOf(['provisional', 'final'], row.status) &&
            (row.costByBasis === undefined || (record(row.costByBasis) &&
                Object.entries(row.costByBasis).every(([basis, amount]) => oneOf(['billed', 'allocated', 'estimated', 'list'], basis) && typeof amount === 'number' && Number.isFinite(amount)))));
    if (!(Array.isArray(value.daily) && value.daily.length <= 31 && value.daily.every(day => record(day) && (0, aiUsage_1.isAiUsageDay)(day.day) && day.day.startsWith(value.month) && money(day) && tokens(day.tokens) && nullableCount(day.requests))))
        return false;
    if (value.previousMonth !== null) {
        const previous = value.previousMonth;
        if (!record(previous) || !(0, aiUsage_1.isAiUsageMonth)(previous.month) || !money(previous) || !count(previous.activePeople) || !tokens(previous.tokens) || !nullableNumber(previous.costPerMillionTokens) || !nullableRatio(previous.cacheHitRatio))
            return false;
    }
    if (!nullableNumber(value.projectedAmount))
        return false;
    if (!(Array.isArray(value.insights) && value.insights.length <= aiUsage_1.AI_USAGE_MAX_INSIGHTS && value.insights.every(insight)))
        return false;
    if (new Set(value.insights.map(item => item.rank)).size !== value.insights.length)
        return false;
    const labelled = [
        ...[value.byProvider, value.byModel, value.byDepartment].flatMap(rows => (Array.isArray(rows) ? rows : [])),
        ...value.insights.map(item => item.subject).filter(record),
    ];
    if (labelled.some(row => record(row) && (looksLikeEmail(row.key) || looksLikeEmail(row.label))))
        return false;
    if (Array.isArray(value.byTag) && value.byTag.some(row => record(row) && (looksLikeEmail(row.tagKey) || looksLikeEmail(row.tagValue))))
        return false;
    if (!nullableNumber(totals.costPerMillionTokens))
        return false;
    const coverageOk = Array.isArray(value.coverage) &&
        value.coverage.length <= aiUsage_1.AI_USAGE_SPEND_SOURCES.length &&
        value.coverage.every((row, index) => record(row) &&
            row.source === aiUsage_1.AI_USAGE_SPEND_SOURCES[index] &&
            row.provider === aiUsage_1.AI_USAGE_SPEND_SOURCE_PROVIDER[row.source] &&
            oneOf(['included', 'not_connected', 'unavailable'], row.state) &&
            nullableNumber(row.amount) &&
            (row.aiCredits === undefined || nullableNumber(row.aiCredits))) &&
        value.coverage.length === aiUsage_1.AI_USAGE_SPEND_SOURCES.length;
    const seatsOk = Array.isArray(value.seats) &&
        value.seats.every(row => record(row) &&
            oneOf(aiUsage_1.AI_USAGE_SPEND_SOURCES, row.source) &&
            row.provider === aiUsage_1.AI_USAGE_SPEND_SOURCE_PROVIDER[row.source] &&
            text(row.product, 64) &&
            nullableCount(row.paid) &&
            nullableCount(row.active) &&
            nullableCount(row.idle) &&
            (row.idle === null || row.paid === null || row.idle <= row.paid) &&
            count(row.activityWindowDays) &&
            nullableNumber(row.monthlyCost) &&
            nullableNumber(row.idleMonthlyCost));
    const activityOk = Array.isArray(value.activity) && value.activity.length <= 13 && value.activity.every(row => record(row) && (0, aiUsage_1.isAiUsageMonth)(row.month) && nullableCount(row.activePeople));
    const tagsOk = Array.isArray(value.byTag) &&
        value.byTag.length <= aiUsage_1.AI_USAGE_MAX_BREAKDOWN_ROWS &&
        value.byTag.every(row => record(row) &&
            typeof row.tagKey === 'string' && aiUsage_1.AI_USAGE_TAG_KEY_PATTERN.test(row.tagKey) &&
            typeof row.tagValue === 'string' && aiUsage_1.AI_USAGE_TAG_VALUE_PATTERN.test(row.tagValue) &&
            money(row) &&
            nullableNumber(row.previousAmount) &&
            (row.people === null || count(row.people)));
    return (monthlyOk &&
        coverageOk &&
        (value.azureOperations === undefined ||
            (record(value.azureOperations) &&
                Array.isArray(value.azureOperations.daily) &&
                value.azureOperations.daily.length <= 31 * aiUsage_1.AI_USAGE_AZURE_OPERATION_METRICS.length &&
                value.azureOperations.daily.every(row => azureOperationPoint(row) && (0, aiUsage_1.isAiUsageDay)(row.day) && row.day.startsWith(value.month)) &&
                Array.isArray(value.azureOperations.deployments) &&
                value.azureOperations.deployments.every(row => azureOperationPoint(row) && text(row.subscription) &&
                    text(row.resource) && (row.deployment === null || text(row.deployment)) && (row.model === null || text(row.model))))) &&
        (value.scopes === undefined ||
            (Array.isArray(value.scopes) && value.scopes.every(scope => record(scope) && (0, aiUsage_1.isAiUsageSafeId)(scope.id) && typeof scope.label === 'string' &&
                oneOf(aiUsage_1.AI_USAGE_SPEND_SOURCES, scope.source) && scope.provider === aiUsage_1.AI_USAGE_SPEND_SOURCE_PROVIDER[scope.source]))) &&
        seatsOk &&
        activityOk &&
        tagsOk &&
        breakdown(value.byProvider) &&
        breakdown(value.byModel) &&
        breakdown(value.byDepartment) &&
        Array.isArray(value.freshness) &&
        value.freshness.every(freshness));
}
function nonPersonRow(value) {
    return (record(value) &&
        text(value.principalId, 256) &&
        (0, exports.isAiUsageProvider)(value.provider) &&
        nullableText(value.connectionId, 128) &&
        oneOf(PRINCIPAL_KINDS, value.kind) &&
        text(value.label) &&
        nullableText(value.owner) &&
        department(value.department) &&
        (0, exports.isAiUsageTags)(value.tags) &&
        money(value) &&
        tokens(value.tokens) &&
        nullableCount(value.requests));
}
function personRow(value, month) {
    if (!record(value))
        return false;
    return (text(value.personId, 256) &&
        (value.email === null ||
            (typeof value.email === 'string' && value.email === value.email.trim().toLowerCase() && value.email.includes('@') && value.email.length <= 320)) &&
        Array.isArray(value.seats) &&
        value.seats.every(seat => record(seat) &&
            (0, exports.isAiUsageProvider)(seat.provider) &&
            text(seat.product, 64) &&
            nullableText(seat.plan, 64) &&
            nullableTimestamp(seat.lastActivityAt) &&
            nullableNumber(seat.monthlyListPrice) &&
            typeof seat.idle === 'boolean') &&
        nullableText(value.displayName) &&
        department(value.department) &&
        (value.departmentSource === null || oneOf(['allocation', 'microsoft-365'], value.departmentSource)) &&
        (value.department === null) === (value.departmentSource === null) &&
        (0, exports.isAiUsageTags)(value.tags) &&
        nullableText(value.country, 64) &&
        (value.accountEnabled === null || typeof value.accountEnabled === 'boolean') &&
        Array.isArray(value.providers) &&
        value.providers.every(exports.isAiUsageProvider) &&
        money(value) &&
        tokens(value.tokens) &&
        nullableCount(value.requests) &&
        count(value.activeDays) &&
        value.activeDays <= 31 &&
        (value.cacheHitRatio === null || (typeof value.cacheHitRatio === 'number' && value.cacheHitRatio >= 0 && value.cacheHitRatio <= 1)) &&
        nullableText(value.topModel) &&
        Array.isArray(value.identities) &&
        value.identities.every(identity => record(identity) &&
            (0, exports.isAiUsageProvider)(identity.provider) &&
            text(identity.label) &&
            oneOf(PRINCIPAL_KINDS, identity.kind) &&
            oneOf(['exact', 'admin', 'sole_member', 'none'], identity.mapping)) &&
        Array.isArray(value.daily) &&
        value.daily.length <= 31 * aiUsage_1.AI_USAGE_PROVIDERS.length &&
        value.daily.every(day => record(day) && (0, aiUsage_1.isAiUsageDay)(day.day) && day.day.startsWith(month) && (0, exports.isAiUsageProvider)(day.provider) && money(day) && tokens(day.tokens) && nullableCount(day.requests)) &&
        Array.isArray(value.models) &&
        value.models.every(model => record(model) && (0, exports.isAiUsageProvider)(model.provider) && text(model.model) && money(model) && tokens(model.tokens) && nullableCount(model.requests)));
}
/** Structural guard for the people artifact of one month. */
function isAiUsagePeopleArtifact(value) {
    if (!record(value) || value.schema !== aiUsage_1.AI_USAGE_PEOPLE_SCHEMA)
        return false;
    if (!(0, aiUsage_1.isAiUsageSafeId)(value.companyId) || !(0, aiUsage_1.isAiUsageMonth)(value.month) || !timestamp(value.generatedAt) || !text(value.runId, 128))
        return false;
    if (!currencyCode(value.currency))
        return false;
    const month = value.month;
    if (!Array.isArray(value.people) || value.people.length > aiUsage_1.AI_USAGE_MAX_PEOPLE || !value.people.every(person => personRow(person, month)))
        return false;
    if (!Array.isArray(value.applications) || !value.applications.every(nonPersonRow))
        return false;
    if (!Array.isArray(value.unmapped) || !value.unmapped.every(nonPersonRow))
        return false;
    return value.omitted === null || (record(value.omitted) && count(value.omitted.people) && nullableNumber(value.omitted.amount));
}
function isAiUsageLatestPointer(value) {
    return (record(value) &&
        value.schema === aiUsage_1.AI_USAGE_LATEST_SCHEMA &&
        (0, aiUsage_1.isAiUsageSafeId)(value.companyId) &&
        (0, aiUsage_1.isAiUsageMonth)(value.month) &&
        text(value.runId, 128) &&
        timestamp(value.generatedAt) &&
        Array.isArray(value.months) &&
        value.months.length <= 13 &&
        value.months.every(aiUsage_1.isAiUsageMonth) &&
        value.months.includes(value.month));
}
//# sourceMappingURL=aiUsageValidation.js.map