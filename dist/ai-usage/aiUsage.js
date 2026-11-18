"use strict";
/**
 * AI usage contracts: customer-registered AI provider connections, the API -> engine collection
 * request, and the engine-published portal artifacts (company summary and people detail).
 *
 * Money is provider-reported. Missing measures are `null` (unavailable), never 0.
 * Core feature: core/specs/billing/analysis/ai-token-usage/ai-token-usage.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_USAGE_FEATURE_KEY = exports.buildAiUsageLatestPath = exports.buildAiUsagePeoplePath = exports.buildAiUsageSummaryPath = exports.buildAiUsageFactsPath = exports.buildAiUsageRawPath = exports.isAiUsageSafeId = exports.isAiUsageDay = exports.isAiUsageMonth = exports.AI_USAGE_DEPARTMENT_MAX_LENGTH = exports.AI_USAGE_TAG_VALUE_PATTERN = exports.AI_USAGE_TAG_KEY_PATTERN = exports.AI_USAGE_MAX_TAGS = exports.AI_USAGE_ALLOCATION_TARGET_TYPES = exports.AI_USAGE_ALLOCATIONS_TABLE = exports.AI_PROVIDER_CONNECTIONS_TABLE = exports.AI_USAGE_STORAGE_CONTAINER = exports.AI_USAGE_AZURE_OPERATION_METRICS = exports.AI_USAGE_INSIGHT_MONEY_FACTS = exports.AI_USAGE_SEAT_ACTIVITY_WINDOW_DAYS = exports.AI_USAGE_SEAT_PRODUCTS = exports.AI_USAGE_IDLE_SEAT_DAYS = exports.AI_USAGE_MAX_INSIGHTS = exports.AI_USAGE_INSIGHT_KINDS = exports.AI_USAGE_NO_DEPARTMENT_KEY = exports.AI_USAGE_MAX_BREAKDOWN_ROWS = exports.AI_USAGE_MAX_PEOPLE = exports.AI_USAGE_LATEST_SCHEMA = exports.AI_USAGE_PEOPLE_SCHEMA = exports.AI_USAGE_SUMMARY_SCHEMA = exports.AI_USAGE_MEASURES = exports.AI_USAGE_COMPANY_REBUILD_CONNECTION_ID = exports.AI_USAGE_COLLECTION_MODES = exports.AI_USAGE_REQUEST_ACTION = exports.AI_USAGE_REQUEST_ENTITY = exports.AI_PROVIDER_SYNC_ACCEPTED_STATUS = exports.parseAiProviderReasonCode = exports.buildAiProviderReasonCode = exports.AI_PROVIDER_REASON_KINDS = exports.OPENAI_WORKSPACE_ID_PATTERN = exports.OPENAI_ENTERPRISE_API_ORIGIN = exports.AI_PROVIDER_CHECK_KEYS = exports.AI_PROVIDER_CONNECTION_STATUSES = exports.AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER = exports.AI_PROVIDER_CREDENTIAL_KINDS = exports.AI_USAGE_SPEND_SOURCE_PROVIDER = exports.AI_USAGE_SPEND_SOURCES = exports.AI_USAGE_COLLECTED_PROVIDERS = exports.AI_USAGE_CONNECTABLE_PROVIDERS = exports.AI_USAGE_PROVIDERS = void 0;
exports.AI_USAGE_ALLOCATION_PERMISSION = exports.AI_USAGE_PEOPLE_FEATURE_KEY = void 0;
/**
 * Every source of AI spend on the AI Usage page. `openai`, `anthropic` and `github` are connected in the AI Providers
 * tab; `azure` (Azure AI services from Azure billing) and `microsoft-365` (Microsoft 365 Copilot licences) come from the
 * company's existing Azure and Microsoft 365 connections and need no AI provider connection.
 */
exports.AI_USAGE_PROVIDERS = ['openai', 'anthropic', 'github', 'azure', 'microsoft-365'];
/** Providers connected in the AI Providers tab (each has at least one credential kind). */
exports.AI_USAGE_CONNECTABLE_PROVIDERS = ['openai', 'anthropic', 'github'];
/** Providers whose collectors are enabled. */
exports.AI_USAGE_COLLECTED_PROVIDERS = ['openai', 'anthropic', 'github', 'azure', 'microsoft-365'];
/**
 * Spend sources shown in the coverage line ("Includes … ; … is not connected"). Each maps to one provider and, for
 * connectable providers, to the credential kind or app that supplies it.
 */
exports.AI_USAGE_SPEND_SOURCES = [
    'openai_api',
    'chatgpt_enterprise',
    'anthropic',
    'github_copilot',
    'azure_ai',
    'microsoft_365_copilot',
];
exports.AI_USAGE_SPEND_SOURCE_PROVIDER = {
    openai_api: 'openai',
    chatgpt_enterprise: 'openai',
    anthropic: 'anthropic',
    github_copilot: 'github',
    azure_ai: 'azure',
    microsoft_365_copilot: 'microsoft-365',
};
exports.AI_PROVIDER_CREDENTIAL_KINDS = [
    'openai_admin_key',
    'openai_enterprise_key',
    'anthropic_admin_key',
    'anthropic_analytics_key',
    'github_app_installation',
];
exports.AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER = {
    /** API Platform organization Admin key, and the ChatGPT Enterprise workspace Admin key (ChatGPT, Codex, Work). */
    openai: ['openai_admin_key', 'openai_enterprise_key'],
    anthropic: ['anthropic_admin_key', 'anthropic_analytics_key'],
    github: ['github_app_installation'],
    azure: [],
    'microsoft-365': [],
};
exports.AI_PROVIDER_CONNECTION_STATUSES = ['pending', 'connected', 'partial', 'failed', 'revoked'];
/** Coverage check keys. Collection sub-steps roll up into these keys; no other keys are stored. */
exports.AI_PROVIDER_CHECK_KEYS = [
    'costs',
    'usage',
    'users',
    'projects',
    'analytics_cost',
    'analytics_usage',
    'cost_report',
    'claude_code',
    'installation',
    /** ChatGPT Enterprise daily usage per person (ChatGPT, Codex, Work): cost, credits and tokens. */
    'enterprise_usage',
    /** ChatGPT Enterprise workspace members: emails and seat types. */
    'enterprise_members',
];
/** ChatGPT Enterprise / Codex API origin used with `openai_enterprise_key`. */
exports.OPENAI_ENTERPRISE_API_ORIGIN = 'https://api.chatgpt.com';
/** ChatGPT workspace ID (UUID), required with `openai_enterprise_key`. */
exports.OPENAI_WORKSPACE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Reason kinds. Codes are `<provider>.<kind>` or `<provider>.<kind>.<checkKey>` (e.g. `openai.permission_missing.costs`). */
exports.AI_PROVIDER_REASON_KINDS = [
    'invalid_key',
    'permission_missing',
    'request_rejected',
    'unavailable',
    'analytics_unavailable',
    'secret_unreadable',
    'not_installed',
    'not_configured',
    'collection_failed',
    /** The provider organization or workspace is already connected (to this or another company). */
    'already_connected',
];
const buildAiProviderReasonCode = (provider, kind, check) => check ? `${provider}.${kind}.${check}` : `${provider}.${kind}`;
exports.buildAiProviderReasonCode = buildAiProviderReasonCode;
/** Parses a reason code; returns null for codes outside the contract vocabulary. */
const parseAiProviderReasonCode = (code) => {
    const [provider, kind, check, ...rest] = code.split('.');
    if (rest.length > 0)
        return null;
    if (!exports.AI_USAGE_PROVIDERS.includes(provider))
        return null;
    if (!exports.AI_PROVIDER_REASON_KINDS.includes(kind))
        return null;
    if (check !== undefined && !exports.AI_PROVIDER_CHECK_KEYS.includes(check))
        return null;
    return { provider: provider, kind: kind, check: check ?? null };
};
exports.parseAiProviderReasonCode = parseAiProviderReasonCode;
/** `POST /companies/{companyId}/ai-providers/connections/{connectionId}/sync` returns 202 Accepted with no body. */
exports.AI_PROVIDER_SYNC_ACCEPTED_STATUS = 202;
// ---------------------------------------------------------------------------
// API -> engine collection request (existing request queue)
// ---------------------------------------------------------------------------
exports.AI_USAGE_REQUEST_ENTITY = 'ai-usage';
exports.AI_USAGE_REQUEST_ACTION = 'collect';
/** `rebuild` re-publishes artifacts from stored facts without calling the provider (e.g. after an allocation change). */
exports.AI_USAGE_COLLECTION_MODES = ['probe', 'backfill', 'daily', 'rebuild'];
/**
 * `connectionId` of a company-scoped `rebuild` message when the company has no AI provider connection (only Azure AI or
 * Microsoft 365 Copilot spend). The engine never looks up the connection for `rebuild`.
 */
exports.AI_USAGE_COMPANY_REBUILD_CONNECTION_ID = 'company';
// ---------------------------------------------------------------------------
// Normalized facts (engine-internal persistence, shared for tests and tooling)
// ---------------------------------------------------------------------------
exports.AI_USAGE_MEASURES = [
    'input_tokens',
    'cache_read_tokens',
    'cache_write_tokens',
    'output_tokens',
    'requests',
    'ai_credits',
    'premium_requests',
    'seats',
    /** Money with no token or request quantity (e.g. tool-call line items, project or key cost rows). */
    'spend',
];
// ---------------------------------------------------------------------------
// Portal artifacts (engine -> API -> UI)
// ---------------------------------------------------------------------------
exports.AI_USAGE_SUMMARY_SCHEMA = 'ai-usage-summary/v1';
exports.AI_USAGE_PEOPLE_SCHEMA = 'ai-usage-people/v1';
exports.AI_USAGE_LATEST_SCHEMA = 'ai-usage-latest/v1';
/** People artifacts hold at most this many person rows; the remainder is aggregated into `omitted`. */
exports.AI_USAGE_MAX_PEOPLE = 5000;
exports.AI_USAGE_MAX_BREAKDOWN_ROWS = 50;
/** Breakdown key for people without a department. */
exports.AI_USAGE_NO_DEPARTMENT_KEY = 'not-set';
// ---------------------------------------------------------------------------
// Story: engine-computed narrative facts. The UI renders text from `kind` + facts; no person identifiers.
// ---------------------------------------------------------------------------
/**
 * Insight facts by kind (the UI words the story from these exact names):
 * - idle_seats: one per seat product with idle seats; subject `provider` (key = provider, label = product name);
 *   amount = idle seats' monthly cost (null when unpriced); ratio = idle / paid for that product;
 *   facts { seats (idle), paid, pricedSeats (idle seats with a price), activityWindowDays }.
 * - collection_issue: facts { reasonCodes (a count of blocking reason codes), daysSinceData }.
 */
exports.AI_USAGE_INSIGHT_KINDS = [
    'spend_change',
    'spend_concentration',
    'low_cache_hit',
    'unmapped_spend',
    'applications_share',
    'ownerless_applications',
    'collection_issue',
    'idle_seats',
];
exports.AI_USAGE_MAX_INSIGHTS = 12;
/** Default idle window: a seat with no activity for this many days (and available activity telemetry) is idle. */
exports.AI_USAGE_IDLE_SEAT_DAYS = 30;
/** Seat product keys. Each product's idle window is its seat summary's `activityWindowDays`. */
exports.AI_USAGE_SEAT_PRODUCTS = ['copilot', 'chatgpt', 'microsoft-365-copilot'];
/** Activity window per seat product, in days. */
exports.AI_USAGE_SEAT_ACTIVITY_WINDOW_DAYS = {
    copilot: exports.AI_USAGE_IDLE_SEAT_DAYS,
    chatgpt: 28,
    'microsoft-365-copilot': 28,
};
/**
 * Insight facts that are money (converted with the artifact currency); every other fact is a count, ratio, day or
 * minutes value. `amount` on every insight is money too.
 */
exports.AI_USAGE_INSIGHT_MONEY_FACTS = ['previousAmount', 'projectedAmount'];
exports.AI_USAGE_AZURE_OPERATION_METRICS = [
    'availability', 'firstToken', 'responseTime', 'cacheMatch', 'tokenRate', 'capacity'
];
// ---------------------------------------------------------------------------
// Storage (accounts-data `companies` container, URL_ACCOUNTS_DATA). Paths are container-relative.
// ---------------------------------------------------------------------------
exports.AI_USAGE_STORAGE_CONTAINER = 'companies';
/** Azure Table in accounts storage. PartitionKey = companyId, RowKey = connectionId. */
exports.AI_PROVIDER_CONNECTIONS_TABLE = 'aiproviderconnections';
// ---------------------------------------------------------------------------
// Allocations: administrator-assigned department and tags
// ---------------------------------------------------------------------------
/**
 * Allocations assign a department and tags to AI spend that has none, or override it.
 * - `connection`: all spend collected from a connection (an individual account or a dedicated organization).
 * - `principal`: one application, API key, service account, workspace, resource or unmapped identity.
 * - `person`: one person (overrides the Microsoft 365 department).
 * Precedence for a spend row: principal > connection > person (allocation, then Microsoft 365) > none. Tags merge in the
 * same order, a more specific allocation's value winning per key. Allocations apply when artifacts are next built.
 */
exports.AI_USAGE_ALLOCATIONS_TABLE = 'aiusageallocations';
exports.AI_USAGE_ALLOCATION_TARGET_TYPES = ['connection', 'principal', 'person'];
exports.AI_USAGE_MAX_TAGS = 10;
/**
 * Tag keys: 1–64 characters with no leading or trailing space, no control characters (incl. DEL) and none of
 * `< > % & \ ? /` (as Azure tags). Values: 1–128 characters with no leading or trailing space, no control characters
 * and no `< >`.
 */
// eslint-disable-next-line no-control-regex -- Control characters are deliberately excluded from tag keys.
exports.AI_USAGE_TAG_KEY_PATTERN = /^(?=\S)(?=.*\S$)[^<>%&\\?/\u0000-\u001f\u007f]{1,64}$/;
// eslint-disable-next-line no-control-regex -- Control characters are deliberately excluded from tag values.
exports.AI_USAGE_TAG_VALUE_PATTERN = /^(?=\S)(?=.*\S$)[^<>\u0000-\u001f\u007f]{1,128}$/;
/** Departments: 1–128 characters, trimmed, no control characters or `< >` (the tag value rules). */
exports.AI_USAGE_DEPARTMENT_MAX_LENGTH = 128;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const requireSafeId = (value, name) => {
    if (!SAFE_ID_PATTERN.test(value))
        throw new Error(`Invalid ${name} for AI usage storage path.`);
    return value;
};
const requireMonth = (value) => {
    if (!MONTH_PATTERN.test(value))
        throw new Error('Invalid month for AI usage storage path.');
    return value;
};
const requireDay = (value) => {
    if (!DAY_PATTERN.test(value))
        throw new Error('Invalid day for AI usage storage path.');
    return value;
};
const requireProvider = (value) => {
    if (!exports.AI_USAGE_PROVIDERS.includes(value))
        throw new Error('Invalid provider for AI usage storage path.');
    return value;
};
const isAiUsageMonth = (value) => typeof value === 'string' && MONTH_PATTERN.test(value);
exports.isAiUsageMonth = isAiUsageMonth;
const isAiUsageDay = (value) => typeof value === 'string' && DAY_PATTERN.test(value);
exports.isAiUsageDay = isAiUsageDay;
const isAiUsageSafeId = (value) => typeof value === 'string' && SAFE_ID_PATTERN.test(value);
exports.isAiUsageSafeId = isAiUsageSafeId;
const buildAiUsageRawPath = (companyId, provider, connectionId, day) => `${requireSafeId(companyId, 'companyId')}/ai-usage/raw/${requireProvider(provider)}/${requireSafeId(connectionId, 'connectionId')}/${requireDay(day)}.json.gz`;
exports.buildAiUsageRawPath = buildAiUsageRawPath;
const buildAiUsageFactsPath = (companyId, month) => `${requireSafeId(companyId, 'companyId')}/ai-usage/facts/${requireMonth(month)}.json.gz`;
exports.buildAiUsageFactsPath = buildAiUsageFactsPath;
const reportFolder = (companyId, month, scope) => `${requireSafeId(companyId, 'companyId')}/ai-usage/portal/${requireMonth(month)}${scope ? `/scopes/${requireSafeId(scope, 'scope')}` : ''}`;
const buildAiUsageSummaryPath = (companyId, month, scope) => `${reportFolder(companyId, month, scope)}/summary.json.gz`;
exports.buildAiUsageSummaryPath = buildAiUsageSummaryPath;
const buildAiUsagePeoplePath = (companyId, month, scope) => `${reportFolder(companyId, month, scope)}/people.json.gz`;
exports.buildAiUsagePeoplePath = buildAiUsagePeoplePath;
const buildAiUsageLatestPath = (companyId) => `${requireSafeId(companyId, 'companyId')}/ai-usage/portal/latest.json`;
exports.buildAiUsageLatestPath = buildAiUsageLatestPath;
// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------
/** Feature key gating AI usage reads. Connection management uses the existing `cloud_accounts` manage permission. */
exports.AI_USAGE_FEATURE_KEY = 'ai_usage';
/** Feature key gating person-level AI usage (people artifact, person drawer, people export). */
exports.AI_USAGE_PEOPLE_FEATURE_KEY = 'ai_usage_people';
/** Editing allocations needs `ai_usage` manage; allocating a person also needs AI_USAGE_PEOPLE_FEATURE_KEY view. */
exports.AI_USAGE_ALLOCATION_PERMISSION = { featureKey: exports.AI_USAGE_FEATURE_KEY, action: 'manage' };
//# sourceMappingURL=aiUsage.js.map