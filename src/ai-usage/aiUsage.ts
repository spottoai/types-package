/**
 * AI usage contracts: customer-registered AI provider connections, the API -> engine collection
 * request, and the engine-published portal artifacts (company summary and people detail).
 *
 * Money is provider-reported. Missing measures are `null` (unavailable), never 0.
 * Core feature: core/specs/billing/analysis/ai-token-usage/ai-token-usage.md
 */

/**
 * Every source of AI spend on the AI Usage page. `openai`, `anthropic` and `github` are connected in the AI Providers
 * tab; `azure` (Azure AI services from Azure billing) and `microsoft-365` (Microsoft 365 Copilot licences) come from the
 * company's existing Azure and Microsoft 365 connections and need no AI provider connection.
 */
export const AI_USAGE_PROVIDERS = ['openai', 'anthropic', 'github', 'azure', 'microsoft-365'] as const;
export type AiUsageProvider = (typeof AI_USAGE_PROVIDERS)[number];

/** Providers connected in the AI Providers tab (each has at least one credential kind). */
export const AI_USAGE_CONNECTABLE_PROVIDERS = ['openai', 'anthropic', 'github'] as const satisfies readonly AiUsageProvider[];
export type AiUsageConnectableProvider = (typeof AI_USAGE_CONNECTABLE_PROVIDERS)[number];

/** Providers whose collectors are enabled. */
export const AI_USAGE_COLLECTED_PROVIDERS: readonly AiUsageProvider[] = ['openai', 'anthropic', 'github', 'azure', 'microsoft-365'] as const;

/**
 * Spend sources shown in the coverage line ("Includes … ; … is not connected"). Each maps to one provider and, for
 * connectable providers, to the credential kind or app that supplies it.
 */
export const AI_USAGE_SPEND_SOURCES = [
  'openai_api',
  'chatgpt_enterprise',
  'anthropic',
  'github_copilot',
  'azure_ai',
  'microsoft_365_copilot',
] as const;
export type AiUsageSpendSource = (typeof AI_USAGE_SPEND_SOURCES)[number];
export const AI_USAGE_SPEND_SOURCE_PROVIDER: Readonly<Record<AiUsageSpendSource, AiUsageProvider>> = {
  openai_api: 'openai',
  chatgpt_enterprise: 'openai',
  anthropic: 'anthropic',
  github_copilot: 'github',
  azure_ai: 'azure',
  microsoft_365_copilot: 'microsoft-365',
};

export const AI_PROVIDER_CREDENTIAL_KINDS = [
  'openai_admin_key',
  'openai_enterprise_key',
  'anthropic_admin_key',
  'anthropic_analytics_key',
  'github_app_installation',
] as const;
export type AiProviderCredentialKind = (typeof AI_PROVIDER_CREDENTIAL_KINDS)[number];

export const AI_PROVIDER_CREDENTIAL_KINDS_BY_PROVIDER: Readonly<Record<AiUsageProvider, readonly AiProviderCredentialKind[]>> = {
  /** API Platform organization Admin key, and the ChatGPT Enterprise workspace Admin key (ChatGPT, Codex, Work). */
  openai: ['openai_admin_key', 'openai_enterprise_key'],
  anthropic: ['anthropic_admin_key', 'anthropic_analytics_key'],
  github: ['github_app_installation'],
  azure: [],
  'microsoft-365': [],
};

export const AI_PROVIDER_CONNECTION_STATUSES = ['pending', 'connected', 'partial', 'failed', 'revoked'] as const;
export type AiProviderConnectionStatus = (typeof AI_PROVIDER_CONNECTION_STATUSES)[number];

export type AiProviderCoverageCheckStatus = 'pass' | 'fail' | 'skipped';

/** One probed endpoint. `reasonCode` uses the provider-access spec codes, e.g. `openai.permission_missing.usage_read`. */
export interface AiProviderCoverageCheck {
  /** Stable check key, e.g. `costs`, `usage`, `users`, `analytics_cost`, `claude_code`. */
  check: string;
  status: AiProviderCoverageCheckStatus;
  reasonCode: string | null;
  checkedAt: string;
}

/** Coverage check keys. Collection sub-steps roll up into these keys; no other keys are stored. */
export const AI_PROVIDER_CHECK_KEYS = [
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
] as const;

export type AiProviderCheckKey = (typeof AI_PROVIDER_CHECK_KEYS)[number];

/** ChatGPT Enterprise / Codex API origin used with `openai_enterprise_key`. */
export const OPENAI_ENTERPRISE_API_ORIGIN = 'https://api.chatgpt.com' as const;
/** ChatGPT workspace ID (UUID), required with `openai_enterprise_key`. */
export const OPENAI_WORKSPACE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reason kinds. Codes are `<provider>.<kind>` or `<provider>.<kind>.<checkKey>` (e.g. `openai.permission_missing.costs`). */
export const AI_PROVIDER_REASON_KINDS = [
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
] as const;
export type AiProviderReasonKind = (typeof AI_PROVIDER_REASON_KINDS)[number];

export const buildAiProviderReasonCode = (provider: AiUsageProvider, kind: AiProviderReasonKind, check?: AiProviderCheckKey): string =>
  check ? `${provider}.${kind}.${check}` : `${provider}.${kind}`;

/** Parses a reason code; returns null for codes outside the contract vocabulary. */
export const parseAiProviderReasonCode = (
  code: string
): { provider: AiUsageProvider; kind: AiProviderReasonKind; check: AiProviderCheckKey | null } | null => {
  const [provider, kind, check, ...rest] = code.split('.');
  if (rest.length > 0) return null;
  if (!(AI_USAGE_PROVIDERS as readonly string[]).includes(provider)) return null;
  if (!(AI_PROVIDER_REASON_KINDS as readonly string[]).includes(kind)) return null;
  if (check !== undefined && !(AI_PROVIDER_CHECK_KEYS as readonly string[]).includes(check)) return null;
  return { provider: provider as AiUsageProvider, kind: kind as AiProviderReasonKind, check: (check as AiProviderCheckKey | undefined) ?? null };
};

/**
 * Secret-free connection view returned by the API and rendered by the portal.
 * The encrypted secret never leaves the API/engine storage boundary.
 */
export interface AiProviderConnection {
  connectionId: string;
  companyId: string;
  provider: AiUsageProvider;
  credentialKind: AiProviderCredentialKind;
  displayName: string;
  /** Provider organization / enterprise identifier observed by a probe (OpenAI org ID, Anthropic org ID, GitHub login). */
  providerAccountId: string | null;
  providerAccountName: string | null;
  /**
   * Members of the provider organization or workspace at the last probe or collection; null when unknown. A value of 1
   * is an individual account (an organization of one): all of its spend belongs to that member.
   */
  providerAccountMemberCount: number | null;
  /** GitHub App installation binding; null for key-based providers. */
  githubInstallationId: string | null;
  githubAccountType: 'enterprise' | 'organization' | null;
  /** Organization login or enterprise slug of the installation. */
  githubAccountLogin: string | null;
  /** ChatGPT workspace of an `openai_enterprise_key` connection; null for other kinds. */
  openaiWorkspaceId: string | null;
  /** Last four characters of the stored key, for recognition only. Null for GitHub installations. */
  secretLast4: string | null;
  /** Optional expiry the administrator recorded for the key; drives credential-expiry alerts. */
  secretExpiresAt: string | null;
  status: AiProviderConnectionStatus;
  coverage: AiProviderCoverageCheck[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  /** Engine-owned collection fields. */
  lastCollectedAt: string | null;
  lastCollectionStatus: 'succeeded' | 'partial' | 'failed' | null;
  lastErrorCode: string | null;
  /** Inclusive UTC date of the newest collected usage day. */
  dataThrough: string | null;
}

export interface CreateAiProviderConnectionRequest {
  provider: AiUsageProvider;
  credentialKind: AiProviderCredentialKind;
  displayName?: string;
  /** Admin / analytics key. Required for key-based providers; never echoed back. */
  secret?: string;
  secretExpiresAt?: string | null;
  /** Required for `github_app_installation`. */
  githubInstallationId?: string;
  /** Required for `openai_enterprise_key` (OPENAI_WORKSPACE_ID_PATTERN); rejected for other kinds. */
  openaiWorkspaceId?: string;
}

export interface UpdateAiProviderConnectionRequest {
  displayName?: string;
  /** Replaces the stored key when present. */
  secret?: string;
  secretExpiresAt?: string | null;
}

/** Response of `GET /companies/{companyId}/ai-providers/connections`. */
export type ListAiProviderConnectionsResponse = AiProviderConnection[];

/** `POST /companies/{companyId}/ai-providers/connections/{connectionId}/sync` returns 202 Accepted with no body. */
export const AI_PROVIDER_SYNC_ACCEPTED_STATUS = 202 as const;

/** Whether a provider can be connected in this environment (e.g. the GitHub App is configured). */
export interface AiProviderAvailability {
  provider: AiUsageProvider;
  available: boolean;
  /** e.g. `github.not_configured` when the platform app credentials are absent. */
  reasonCode: string | null;
}

/** Response of `GET /companies/{companyId}/ai-providers/availability`. */
export type AiProviderAvailabilityResponse = AiProviderAvailability[];

/** Response of `POST /companies/{companyId}/ai-providers/github/install`. The portal navigates to `installUrl`. */
export interface GitHubInstallStartResponse {
  installUrl: string;
  /** Opaque, signed, user- and company-bound; expires after `expiresAt`. */
  state: string;
  expiresAt: string;
}

/**
 * Body of `POST /ai-providers/github/complete`, sent by the portal's GitHub callback page with the parameters GitHub
 * appended to the app's Callback URL. The API verifies `state`, exchanges `code` for a user token and only binds an
 * installation the user can access (`GET /user/installations`). An installation binds to one company only.
 */
export interface GitHubInstallCompleteRequest {
  state: string;
  /** OAuth code from the callback. Single-use: send it on the first call only. */
  code?: string;
  /**
   * Opaque, server-encrypted, short-lived token returned with a 409 `github.installation_ambiguous`. It carries the
   * already-exchanged user authorization, so the re-submission sends `selectionToken` + `installationId` instead of `code`.
   */
  selectionToken?: string;
  /**
   * From the callback when GitHub supplies it. When absent, the API resolves the caller's accessible, unbound
   * installations of this app; more than one returns 409 `github.installation_ambiguous` whose error properties carry
   * `candidates` (GitHubInstallCandidate[]) and `selectionToken`, and the portal re-submits with the chosen id.
   */
  installationId?: string;
}

export interface GitHubInstallCandidate {
  installationId: string;
  accountLogin: string;
  accountType: 'enterprise' | 'organization';
}

export interface GitHubInstallCompleteResponse {
  companyId: string;
  connection: AiProviderConnection;
}

/** Validates credentials without storing them. */
export type TestAiProviderConnectionRequest = CreateAiProviderConnectionRequest;

export interface TestAiProviderConnectionResponse {
  ok: boolean;
  status: AiProviderConnectionStatus;
  providerAccountId: string | null;
  providerAccountName: string | null;
  coverage: AiProviderCoverageCheck[];
}

// ---------------------------------------------------------------------------
// API -> engine collection request (existing request queue)
// ---------------------------------------------------------------------------

export const AI_USAGE_REQUEST_ENTITY = 'ai-usage' as const;
export const AI_USAGE_REQUEST_ACTION = 'collect' as const;
/** `rebuild` re-publishes artifacts from stored facts without calling the provider (e.g. after an allocation change). */
export const AI_USAGE_COLLECTION_MODES = ['probe', 'backfill', 'daily', 'rebuild'] as const;
/**
 * `connectionId` of a company-scoped `rebuild` message when the company has no AI provider connection (only Azure AI or
 * Microsoft 365 Copilot spend). The engine never looks up the connection for `rebuild`.
 */
export const AI_USAGE_COMPANY_REBUILD_CONNECTION_ID = 'company' as const;
export type AiUsageCollectionMode = (typeof AI_USAGE_COLLECTION_MODES)[number];

export interface AiUsageCollectRequestMessage {
  entity: typeof AI_USAGE_REQUEST_ENTITY;
  action: typeof AI_USAGE_REQUEST_ACTION;
  companyId: string;
  connectionId: string;
  mode: AiUsageCollectionMode;
  requestedAt: string;
  requestId: string;
}

// ---------------------------------------------------------------------------
// Normalized facts (engine-internal persistence, shared for tests and tooling)
// ---------------------------------------------------------------------------

export const AI_USAGE_MEASURES = [
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
] as const;
export type AiUsageMeasure = (typeof AI_USAGE_MEASURES)[number];

export type AiUsageCostBasis = 'billed' | 'allocated' | 'estimated' | 'list';
export type AiUsageFactStatus = 'provisional' | 'final';
/** `resource`: an Azure AI resource or deployment (Azure billing has no person). */
export type AiPrincipalKind = 'user' | 'service_account' | 'api_key' | 'github_login' | 'workspace' | 'resource' | 'unknown';
/**
 * `sole_member`: the principal (an API key, service account or workspace) belongs to an organization or workspace with
 * exactly one member, so its spend is that member's.
 */
export type AiPrincipalMapping = 'exact' | 'admin' | 'sole_member' | 'none';

export interface AiUsageFact {
  companyId: string;
  connectionId: string;
  provider: AiUsageProvider;
  /** e.g. `api`, `chatgpt`, `codex`, `work`, `claude-code`, `claude-enterprise`, `copilot`. */
  product: string;
  /** Provider billing entity: OpenAI org/project, Anthropic org/workspace, GitHub enterprise/org. */
  billingEntity: string;
  /** UTC YYYY-MM-DD. */
  day: string;
  principalId: string;
  /**
   * Person key in facts (engine-internal): the trimmed lower-case email, or `github:<login>` for a GitHub login with no
   * SAML/SCIM email. Published artifacts never carry it; they carry the company-salted opaque `personId` instead.
   * Null when the principal is an application or is unmapped.
   */
  personId: string | null;
  model: string | null;
  measure: AiUsageMeasure;
  quantity: number | null;
  /** Money in `currency` (USD for all current providers). */
  amount: number | null;
  listAmount: number | null;
  currency: 'USD';
  costBasis: AiUsageCostBasis;
  status: AiUsageFactStatus;
  providerRefreshedAt: string | null;
  pulledAt: string;
  /** Raw evidence path relative to the AI usage storage root. */
  sourceRef: string;
}

export interface AiPrincipal {
  principalId: string;
  provider: AiUsageProvider;
  kind: AiPrincipalKind;
  /** Provider-native identifier (user ID, service account ID, API key ID, GitHub login). */
  nativeId: string;
  label: string;
  personId: string | null;
  mapping: AiPrincipalMapping;
  /** Owning project / workspace for applications. */
  owner: string | null;
}

// ---------------------------------------------------------------------------
// Portal artifacts (engine -> API -> UI)
// ---------------------------------------------------------------------------

export const AI_USAGE_SUMMARY_SCHEMA = 'ai-usage-summary/v1' as const;
export const AI_USAGE_PEOPLE_SCHEMA = 'ai-usage-people/v1' as const;
export const AI_USAGE_LATEST_SCHEMA = 'ai-usage-latest/v1' as const;
/** People artifacts hold at most this many person rows; the remainder is aggregated into `omitted`. */
export const AI_USAGE_MAX_PEOPLE = 5000;
export const AI_USAGE_MAX_BREAKDOWN_ROWS = 50;
/** Breakdown key for people without a department. */
export const AI_USAGE_NO_DEPARTMENT_KEY = 'not-set' as const;

/** Disjoint token buckets; each is null when the provider did not report it. */
export interface AiUsageTokenTotals {
  input: number | null;
  cacheRead: number | null;
  cacheWrite: number | null;
  output: number | null;
}

export interface AiUsageMoney {
  /** Provider-reported cost after discounts. Null when cost is unavailable. */
  amount: number | null;
  /** Cost at list prices where the provider reports it. */
  listAmount: number | null;
}

export interface AiUsageMonthlyProviderTotal extends AiUsageMoney {
  /** YYYY-MM. */
  month: string;
  provider: AiUsageProvider;
  status: AiUsageFactStatus;
  /** Components of amount, classified by the original cost basis. Older artifacts may omit this. */
  costByBasis?: Partial<Record<AiUsageCostBasis, number>>;
}

export interface AiUsageBreakdownRow extends AiUsageMoney {
  key: string;
  label: string;
  tokens: AiUsageTokenTotals;
  requests: number | null;
  /** Distinct people contributing; null where person attribution does not apply. */
  people: number | null;
  /** amount / total tokens x 1,000,000; null when either is unavailable. */
  costPerMillionTokens: number | null;
  /** cacheRead / (cacheRead + input); null when unavailable. */
  cacheHitRatio: number | null;
  /** Provider of the row; set on `byModel` and `byProvider` rows, null on department rows. */
  provider: AiUsageProvider | null;
  /** The same row's amount in the previous month; null when there is no previous-month data for it. */
  previousAmount: number | null;
}

export interface AiUsageProviderFreshness {
  provider: AiUsageProvider;
  connectionId: string;
  displayName: string;
  /** Inclusive UTC date of the newest usage day collected. */
  dataThrough: string | null;
  providerRefreshedAt: string | null;
  pulledAt: string | null;
  status: AiUsageFactStatus | 'unavailable';
  reasonCodes: string[];
}

export interface AiUsageSummaryTotals extends AiUsageMoney {
  peopleAmount: number | null;
  applicationsAmount: number | null;
  unmappedAmount: number | null;
  activePeople: number;
  costPerActivePerson: number | null;
  tokens: AiUsageTokenTotals;
  requests: number | null;
  /** cacheRead / (cacheRead + input); null when either bucket is unavailable or both are 0. */
  cacheHitRatio: number | null;
  /** amount / total tokens x 1,000,000; null when either is unavailable. */
  costPerMillionTokens: number | null;
}

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
export const AI_USAGE_INSIGHT_KINDS = [
  'spend_change',
  'spend_concentration',
  'low_cache_hit',
  'unmapped_spend',
  'applications_share',
  'ownerless_applications',
  'collection_issue',
  'idle_seats',
] as const;
export type AiUsageInsightKind = (typeof AI_USAGE_INSIGHT_KINDS)[number];

/** `action` and `review` appear in the needs-attention list; `info` only feeds the story text. */
export type AiUsageInsightSeverity = 'action' | 'review' | 'info';

export interface AiUsageInsight {
  kind: AiUsageInsightKind;
  severity: AiUsageInsightSeverity;
  /** 1 = most important. Unique within the artifact. */
  rank: number;
  /** Money involved, in the artifact currency; null when not applicable. */
  amount: number | null;
  /** Kind-specific ratio: share 0..1, or change ratio (0.23 = +23%, -0.1 = -10%). */
  ratio: number | null;
  subject: { type: 'company' | 'provider' | 'model' | 'application' | 'connection'; key: string; label: string } | null;
  /** Kind-specific numbers, e.g. `previousAmount`, `projectedAmount`, `topCount`, `people`, `uncachedInputTokens`, `applications`. */
  facts: Record<string, number | null>;
}

export const AI_USAGE_MAX_INSIGHTS = 12;
/** Default idle window: a seat with no activity for this many days (and available activity telemetry) is idle. */
export const AI_USAGE_IDLE_SEAT_DAYS = 30;
/** Seat product keys. Each product's idle window is its seat summary's `activityWindowDays`. */
export const AI_USAGE_SEAT_PRODUCTS = ['copilot', 'chatgpt', 'microsoft-365-copilot'] as const;
export type AiUsageSeatProduct = (typeof AI_USAGE_SEAT_PRODUCTS)[number];
/** Activity window per seat product, in days. */
export const AI_USAGE_SEAT_ACTIVITY_WINDOW_DAYS: Readonly<Record<AiUsageSeatProduct, number>> = {
  copilot: AI_USAGE_IDLE_SEAT_DAYS,
  chatgpt: 28,
  'microsoft-365-copilot': 28,
};
/**
 * Insight facts that are money (converted with the artifact currency); every other fact is a count, ratio, day or
 * minutes value. `amount` on every insight is money too.
 */
export const AI_USAGE_INSIGHT_MONEY_FACTS = ['previousAmount', 'projectedAmount'] as const;

export interface AiUsageDay extends AiUsageMoney {
  day: string;
  tokens: AiUsageTokenTotals;
  requests: number | null;
}

export interface AiUsagePreviousMonth extends AiUsageMoney {
  month: string;
  activePeople: number;
  tokens: AiUsageTokenTotals;
  costPerMillionTokens: number | null;
  cacheHitRatio: number | null;
}

/** Whether a spend source contributes to the month's total. */
export interface AiUsageSourceCoverage {
  source: AiUsageSpendSource;
  provider: AiUsageProvider;
  /**
   * `included`: connected and contributing (amount may be 0). `not_connected`: no connection or integration exists.
   * `unavailable`: connected but no usable data for the month (see freshness reason codes).
   */
  state: 'included' | 'not_connected' | 'unavailable';
  amount: number | null;
  /** Credits in this product's own units, when its usage report supplies them. */
  aiCredits?: number | null;
}

/** Paid seats against active seats for one seat-based product, company-wide. */
export interface AiUsageSeatSummary {
  source: AiUsageSpendSource;
  provider: AiUsageProvider;
  /** Product key, e.g. `copilot`, `chatgpt`, `microsoft-365-copilot`. */
  product: string;
  /** Seats paid for (assigned licences); null when unknown. */
  paid: number | null;
  /** Seats with activity in the last `activityWindowDays`; null when activity telemetry is unavailable. */
  active: number | null;
  /** Paid seats with no activity in the window; null when `active` is null. */
  idle: number | null;
  activityWindowDays: number;
  /** Monthly cost of all paid seats in the artifact currency; null when no price is known. */
  monthlyCost: number | null;
  /** Monthly cost of the idle seats; null when `idle` or the price is unknown. */
  idleMonthlyCost: number | null;
}

/** Company-wide adoption for one month: distinct people with AI activity across every source. */
export interface AiUsageMonthlyActivity {
  month: string;
  activePeople: number | null;
}

/** Company-level aggregates for one UTC month. Contains no person identifiers. */
export interface AiUsageReportScope {
  id: string;
  label: string;
  provider: AiUsageProvider;
  source: AiUsageSpendSource;
}

export const AI_USAGE_AZURE_OPERATION_METRICS = [
  'availability', 'firstToken', 'responseTime', 'cacheMatch', 'tokenRate', 'capacity'
] as const;
export type AiUsageAzureOperationMetric = (typeof AI_USAGE_AZURE_OPERATION_METRICS)[number];

export interface AiUsageAzureOperationPoint {
  metric: AiUsageAzureOperationMetric;
  average: number;
  samples: number;
}

export interface AiUsageAzureOperations {
  daily: (AiUsageAzureOperationPoint & { day: string })[];
  deployments: (AiUsageAzureOperationPoint & { subscription: string; resource: string; deployment: string | null; model: string | null })[];
}

export interface AiUsageSummaryArtifact {
  schema: typeof AI_USAGE_SUMMARY_SCHEMA;
  companyId: string;
  /** YYYY-MM. */
  month: string;
  generatedAt: string;
  runId: string;
  /** ISO 4217 code of every money value. Engine-published artifacts are USD; API responses carry the converted code. */
  currency: string;
  totals: AiUsageSummaryTotals;
  /** Up to 13 months ending at `month`, oldest first, one row per provider and month with data. */
  monthly: AiUsageMonthlyProviderTotal[];
  byProvider: AiUsageBreakdownRow[];
  byModel: AiUsageBreakdownRow[];
  byDepartment: AiUsageBreakdownRow[];
  freshness: AiUsageProviderFreshness[];
  /** Company spend per UTC day of `month`, oldest first. */
  daily: AiUsageDay[];
  /** The month before `month`; null when there is no data for it. */
  previousMonth: AiUsagePreviousMonth | null;
  /** Month-end projection for a provisional month; null when final or not projectable. */
  projectedAmount: number | null;
  /** Ordered by rank; at most AI_USAGE_MAX_INSIGHTS. */
  insights: AiUsageInsight[];
  /** One row per spend source, in AI_USAGE_SPEND_SOURCES order. */
  coverage: AiUsageSourceCoverage[];
  /** One row per seat-based product with paid or active seats. */
  seats: AiUsageSeatSummary[];
  /** Up to 13 months ending at `month`, oldest first. */
  activity: AiUsageMonthlyActivity[];
  /** Spend by allocation tag, at most AI_USAGE_MAX_BREAKDOWN_ROWS rows, largest first. */
  byTag: AiUsageTagRow[];
  /** Account and subscription reports published alongside this company report. */
  scopes?: AiUsageReportScope[];
  azureOperations?: AiUsageAzureOperations;
}

export interface AiUsagePersonDay extends AiUsageMoney {
  day: string;
  provider: AiUsageProvider;
  tokens: AiUsageTokenTotals;
  requests: number | null;
}

export interface AiUsagePersonModel extends AiUsageMoney {
  provider: AiUsageProvider;
  model: string;
  tokens: AiUsageTokenTotals;
  requests: number | null;
}

export interface AiUsagePersonIdentity {
  provider: AiUsageProvider;
  kind: AiPrincipalKind;
  label: string;
  mapping: AiPrincipalMapping;
}

export interface AiUsagePersonSeat {
  provider: AiUsageProvider;
  /** e.g. `copilot`. */
  product: string;
  /** Provider plan, e.g. `business`, `enterprise`. */
  plan: string | null;
  lastActivityAt: string | null;
  /** List price per month in the artifact currency; basis is estimated until contract prices exist. */
  monthlyListPrice: number | null;
  /** True when the seat shows no activity within its product's activity window and activity telemetry is available. */
  idle: boolean;
}

export interface AiUsagePersonRow extends AiUsageMoney {
  /** Opaque stable identifier, safe for URLs. Company-salted SHA-256 prefix of the person key (email, or `github:<login>` when no email is known). */
  personId: string;
  /** Lower-case email; null for a provider identity whose email is not known (e.g. a GitHub login without SAML/SCIM evidence). */
  email: string | null;
  displayName: string | null;
  department: string | null;
  /** Where `department` came from: an administrator's allocation, or Microsoft 365 (Entra) evidence. */
  departmentSource: AiUsageDepartmentSource | null;
  /** Allocation tags that apply to this person. */
  tags: AiUsageTags;
  country: string | null;
  /** Entra account enabled state from M365 evidence; null when unknown. */
  accountEnabled: boolean | null;
  providers: AiUsageProvider[];
  tokens: AiUsageTokenTotals;
  requests: number | null;
  activeDays: number;
  cacheHitRatio: number | null;
  topModel: string | null;
  identities: AiUsagePersonIdentity[];
  /** Daily rows for the artifact month, oldest first. */
  daily: AiUsagePersonDay[];
  models: AiUsagePersonModel[];
  /** Licensed seats (e.g. GitHub Copilot). Empty when no seat source is connected. */
  seats: AiUsagePersonSeat[];
}

/** Spend not attributable to a person: service accounts, API keys, workspaces, or unresolved principals. */
export interface AiUsageNonPersonRow extends AiUsageMoney {
  principalId: string;
  provider: AiUsageProvider;
  /** Connection the principal was collected from; null for sources without a connection (Azure, Microsoft 365). */
  connectionId: string | null;
  kind: AiPrincipalKind;
  label: string;
  owner: string | null;
  /** Department from an allocation (principal or connection); null when unallocated. */
  department: string | null;
  tags: AiUsageTags;
  tokens: AiUsageTokenTotals;
  requests: number | null;
}

/** Person-level detail for one UTC month. Served only to callers who may view people. */
export interface AiUsagePeopleArtifact {
  schema: typeof AI_USAGE_PEOPLE_SCHEMA;
  companyId: string;
  month: string;
  generatedAt: string;
  /** Must equal the summary `runId` for the same month. */
  runId: string;
  /** ISO 4217 code of every money value; see AiUsageSummaryArtifact.currency. */
  currency: string;
  people: AiUsagePersonRow[];
  applications: AiUsageNonPersonRow[];
  unmapped: AiUsageNonPersonRow[];
  /** People beyond AI_USAGE_MAX_PEOPLE, aggregated. */
  omitted: { people: number; amount: number | null } | null;
}

/** Pointer to the newest published month and the months available. */
export interface AiUsageLatestPointer {
  schema: typeof AI_USAGE_LATEST_SCHEMA;
  companyId: string;
  month: string;
  runId: string;
  generatedAt: string;
  /** Available months, newest first, at most 13. */
  months: string[];
}

// ---------------------------------------------------------------------------
// API responses
// ---------------------------------------------------------------------------

export type AiUsageReadState = 'ready' | 'not_collected' | 'stale';

export interface AiUsageSummaryResponse {
  state: AiUsageReadState;
  /** Requested or latest month; null when nothing is collected. */
  month: string | null;
  months: string[];
  /** Currency of every money value in `summary` after conversion. */
  currency: string;
  /** False when the caller lacks people-level permission; the UI hides person detail. */
  canViewPeople: boolean;
  summary: AiUsageSummaryArtifact | null;
  connections: AiProviderConnection[];
  scopes?: AiUsageReportScope[];
}

export interface AiUsagePeopleResponse {
  state: AiUsageReadState;
  month: string | null;
  currency: string;
  people: AiUsagePeopleArtifact | null;
}

// ---------------------------------------------------------------------------
// Storage (accounts-data `companies` container, URL_ACCOUNTS_DATA). Paths are container-relative.
// ---------------------------------------------------------------------------

export const AI_USAGE_STORAGE_CONTAINER = 'companies' as const;
/** Azure Table in accounts storage. PartitionKey = companyId, RowKey = connectionId. */
export const AI_PROVIDER_CONNECTIONS_TABLE = 'aiproviderconnections' as const;

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
export const AI_USAGE_ALLOCATIONS_TABLE = 'aiusageallocations' as const;
export const AI_USAGE_ALLOCATION_TARGET_TYPES = ['connection', 'principal', 'person'] as const;
export type AiUsageAllocationTargetType = (typeof AI_USAGE_ALLOCATION_TARGET_TYPES)[number];
export const AI_USAGE_MAX_TAGS = 10;
/**
 * Tag keys: 1–64 characters with no leading or trailing space, no control characters (incl. DEL) and none of
 * `< > % & \ ? /` (as Azure tags). Values: 1–128 characters with no leading or trailing space, no control characters
 * and no `< >`.
 */
// eslint-disable-next-line no-control-regex -- Control characters are deliberately excluded from tag keys.
export const AI_USAGE_TAG_KEY_PATTERN = /^(?=\S)(?=.*\S$)[^<>%&\\?/\u0000-\u001f\u007f]{1,64}$/;
// eslint-disable-next-line no-control-regex -- Control characters are deliberately excluded from tag values.
export const AI_USAGE_TAG_VALUE_PATTERN = /^(?=\S)(?=.*\S$)[^<>\u0000-\u001f\u007f]{1,128}$/;
/** Departments: 1–128 characters, trimmed, no control characters or `< >` (the tag value rules). */
export const AI_USAGE_DEPARTMENT_MAX_LENGTH = 128;
export type AiUsageTags = Record<string, string>;
export type AiUsageDepartmentSource = 'allocation' | 'microsoft-365';

export interface AiUsageAllocationTarget {
  type: AiUsageAllocationTargetType;
  /** `connectionId` for `connection`, `principalId` for `principal`, `personId` for `person`. */
  id: string;
}

export interface AiUsageAllocation {
  allocationId: string;
  companyId: string;
  target: AiUsageAllocationTarget;
  /** Null leaves the department to the next rule in precedence; tags still apply. */
  department: string | null;
  tags: AiUsageTags;
  /** Display label of the target when it was saved (e.g. the API key or connection name). */
  targetLabel: string;
  updatedAt: string;
  updatedBy: string | null;
}

/** `PUT /companies/{companyId}/ai-usage/allocations` (upsert by target). An empty department and no tags deletes it. */
export interface PutAiUsageAllocationRequest {
  target: AiUsageAllocationTarget;
  department: string | null;
  tags: AiUsageTags;
}

/** Response of `GET /companies/{companyId}/ai-usage/allocations`. */
export type ListAiUsageAllocationsResponse = AiUsageAllocation[];

/** Tag breakdown row: spend carrying `tagKey` = `tagValue` this month. */
export interface AiUsageTagRow extends AiUsageMoney {
  tagKey: string;
  tagValue: string;
  previousAmount: number | null;
  people: number | null;
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const requireSafeId = (value: string, name: string): string => {
  if (!SAFE_ID_PATTERN.test(value)) throw new Error(`Invalid ${name} for AI usage storage path.`);
  return value;
};
const requireMonth = (value: string): string => {
  if (!MONTH_PATTERN.test(value)) throw new Error('Invalid month for AI usage storage path.');
  return value;
};
const requireDay = (value: string): string => {
  if (!DAY_PATTERN.test(value)) throw new Error('Invalid day for AI usage storage path.');
  return value;
};
const requireProvider = (value: string): AiUsageProvider => {
  if (!(AI_USAGE_PROVIDERS as readonly string[]).includes(value)) throw new Error('Invalid provider for AI usage storage path.');
  return value as AiUsageProvider;
};

export const isAiUsageMonth = (value: unknown): value is string => typeof value === 'string' && MONTH_PATTERN.test(value);
export const isAiUsageDay = (value: unknown): value is string => typeof value === 'string' && DAY_PATTERN.test(value);
export const isAiUsageSafeId = (value: unknown): value is string => typeof value === 'string' && SAFE_ID_PATTERN.test(value);

export const buildAiUsageRawPath = (companyId: string, provider: AiUsageProvider, connectionId: string, day: string): string =>
  `${requireSafeId(companyId, 'companyId')}/ai-usage/raw/${requireProvider(provider)}/${requireSafeId(connectionId, 'connectionId')}/${requireDay(day)}.json.gz`;

export const buildAiUsageFactsPath = (companyId: string, month: string): string =>
  `${requireSafeId(companyId, 'companyId')}/ai-usage/facts/${requireMonth(month)}.json.gz`;

const reportFolder = (companyId: string, month: string, scope?: string): string =>
  `${requireSafeId(companyId, 'companyId')}/ai-usage/portal/${requireMonth(month)}${scope ? `/scopes/${requireSafeId(scope, 'scope')}` : ''}`;

export const buildAiUsageSummaryPath = (companyId: string, month: string, scope?: string): string =>
  `${reportFolder(companyId, month, scope)}/summary.json.gz`;

export const buildAiUsagePeoplePath = (companyId: string, month: string, scope?: string): string =>
  `${reportFolder(companyId, month, scope)}/people.json.gz`;

export const buildAiUsageLatestPath = (companyId: string): string => `${requireSafeId(companyId, 'companyId')}/ai-usage/portal/latest.json`;

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/** Feature key gating AI usage reads. Connection management uses the existing `cloud_accounts` manage permission. */
export const AI_USAGE_FEATURE_KEY = 'ai_usage' as const;
/** Feature key gating person-level AI usage (people artifact, person drawer, people export). */
export const AI_USAGE_PEOPLE_FEATURE_KEY = 'ai_usage_people' as const;
/** Editing allocations needs `ai_usage` manage; allocating a person also needs AI_USAGE_PEOPLE_FEATURE_KEY view. */
export const AI_USAGE_ALLOCATION_PERMISSION = { featureKey: AI_USAGE_FEATURE_KEY, action: 'manage' } as const;
