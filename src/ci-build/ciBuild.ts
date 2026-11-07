/**
 * CI build cost contracts: engine-published monthly build-cost artifacts and their API responses.
 *
 * Provider billing is the monetary authority. Run and job minutes are attribution estimates (each job's elapsed time
 * rounded up per job, priced at the billed unit price of its runner SKU). Missing values are null, never 0.
 * Core feature: core/specs/optimization/strategies/ci-build-optimization/ci-build-optimization.md
 * The collector uses the GitHub provider connection registered in the AI Providers tab (`aiproviderconnections`).
 */

export const CI_BUILD_PROVIDERS = ['github'] as const;
export type CiBuildProvider = (typeof CI_BUILD_PROVIDERS)[number];

export const CI_BUILD_SUMMARY_SCHEMA = 'ci-build-summary/v1' as const;
export const CI_BUILD_LATEST_SCHEMA = 'ci-build-latest/v1' as const;
export const CI_BUILD_MAX_ROWS = 50;
export const CI_BUILD_MAX_PULL_REQUESTS = 20;
export const CI_BUILD_MAX_INSIGHTS = 12;
export const CI_BUILD_FEATURE_KEY = 'ci_build_cost' as const;

export const CI_BUILD_REQUEST_ENTITY = 'ci-build' as const;
export const CI_BUILD_REQUEST_ACTION = 'collect' as const;

/** API/timer -> engine collection request on the existing request queue. */
export const CI_BUILD_COLLECTION_MODES = ['backfill', 'daily'] as const;
export type CiBuildCollectionMode = (typeof CI_BUILD_COLLECTION_MODES)[number];

/**
 * Collection reason codes specific to build cost (provider codes use the AI provider vocabulary):
 * `ci_build.runs_truncated` — the run budget was reached, so attributed minutes are partial (billing stays exact);
 * `ci_build.repository_unreadable` — one repository's runs could not be read; its stored runs are kept.
 */
export const CI_BUILD_REASON_CODES = ['ci_build.runs_truncated', 'ci_build.repository_unreadable'] as const;
export type CiBuildReasonCode = (typeof CI_BUILD_REASON_CODES)[number];

/** Insight facts that are money (converted with the artifact currency); `amount` on every insight is money too. */
export const CI_BUILD_INSIGHT_MONEY_FACTS = ['previousAmount', 'trailingAverage'] as const;

export interface CiBuildCollectRequestMessage {
  entity: typeof CI_BUILD_REQUEST_ENTITY;
  action: typeof CI_BUILD_REQUEST_ACTION;
  companyId: string;
  /** The GitHub connection in `aiproviderconnections`. */
  connectionId: string;
  mode: CiBuildCollectionMode;
  requestedAt: string;
  requestId: string;
}

export interface CiBuildMoney {
  /** Billed net amount (after included usage/discounts). */
  netAmount: number | null;
  grossAmount: number | null;
}

/** Cancelled minutes by cause. A cancelled run is not waste until classified. */
export interface CiBuildCancelledMinutes {
  afterFailure: number | null;
  superseded: number | null;
  other: number | null;
}

export interface CiBuildTotals extends CiBuildMoney {
  discountAmount: number | null;
  /** Billed minutes (all runner SKUs). */
  billedMinutes: number | null;
  /** Minutes attributed from run/job evidence (rounded up per job). */
  attributedMinutes: number | null;
  runs: number | null;
  failedRuns: number | null;
  /** Attributed minutes of jobs that concluded `failure`, `timed_out` or `startup_failure` (excludes cancelled). */
  failedMinutes: number | null;
  cancelledMinutes: CiBuildCancelledMinutes;
  /**
   * Minutes spent in run attempts > 1. Overlaps failed/cancelled/successful buckets (a rerun is also one of those),
   * so it is reported separately and never added to them.
   */
  rerunMinutes: number | null;
  /**
   * First UTC day in the month on which net amount for allowance-covered Actions minute SKUs became > 0 (included
   * allowance exhausted). Storage and runners never covered by the allowance are excluded. Null if not exhausted or unknown.
   */
  allowanceExhaustedOn: string | null;
  /** Month-end projection of net amount for a provisional month; null when final or not projectable. */
  projectedNetAmount: number | null;
}

export interface CiBuildMonthlyTotal extends CiBuildMoney {
  month: string;
  billedMinutes: number | null;
  status: 'provisional' | 'final';
}

export interface CiBuildRepositoryRow extends CiBuildMoney {
  /** `owner/name`. */
  repository: string;
  organization: string | null;
  billedMinutes: number | null;
  attributedMinutes: number | null;
  runs: number | null;
  failedMinutes: number | null;
  cancelledMinutes: CiBuildCancelledMinutes;
  rerunMinutes: number | null;
  /** Share of pull-request runs that launched the workflow's widest observed job matrix (0..1). */
  fullSuiteShare: number | null;
}

export interface CiBuildWorkflowRow {
  repository: string;
  workflowId: string;
  workflowName: string;
  path: string | null;
  attributedMinutes: number | null;
  /** Attributed estimate in the artifact currency. */
  estimatedAmount: number | null;
  runs: number | null;
  failedRuns: number | null;
  /** Minutes by trigger event, e.g. pull_request, push, schedule, workflow_dispatch. */
  minutesByEvent: Record<string, number>;
}

export interface CiBuildTriggerRow {
  event: string;
  attributedMinutes: number | null;
  estimatedAmount: number | null;
  runs: number | null;
}

export interface CiBuildRunnerRow extends CiBuildMoney {
  /** Billing SKU, e.g. `actions_linux`, `actions_windows`, `actions_macos`. */
  sku: string;
  billedMinutes: number | null;
  pricePerMinute: number | null;
}

export interface CiBuildPullRequestRow {
  repository: string;
  number: number;
  attributedMinutes: number | null;
  estimatedAmount: number | null;
  runs: number;
  /** Distinct head SHAs that triggered runs (pushes/updates). */
  updates: number;
  cancelledMinutes: CiBuildCancelledMinutes;
}

export interface CiBuildStorageRow extends CiBuildMoney {
  /** e.g. `actions_storage`, `packages_storage`, `git_lfs_storage`, `codespaces_storage`. */
  sku: string;
  /** GB-months (or the provider unit). */
  quantity: number | null;
  unitType: string | null;
}

export const CI_BUILD_INSIGHT_KINDS = [
  'full_suite_on_updates',
  'late_cheap_failures',
  'superseded_runs',
  'reruns',
  'allowance_exhausted_no_budget',
  'idle_scheduled_workflows',
  'storage_growth',
  'spend_spike',
  'collection_issue',
] as const;
export type CiBuildInsightKind = (typeof CI_BUILD_INSIGHT_KINDS)[number];

/**
 * Pinned subject and facts per insight kind (UI wording depends on these exact names):
 * - full_suite_on_updates: subject repository; ratio = full-suite share of PR runs; amount = estimated cost of full-suite PR runs;
 *   facts { fullSuiteRuns, pullRequestRuns, minutes }.
 * - late_cheap_failures: subject repository; amount = estimated cost of the other jobs' minutes in those runs;
 *   facts { runs, wastedMinutes }.
 * - superseded_runs: subject repository; ratio = superseded share of attributed minutes; amount; facts { runs, minutes }.
 * - reruns: subject repository; ratio = rerun share of attributed minutes; amount; facts { runs, minutes }.
 * - allowance_exhausted_no_budget: subject company; amount = projected net (or net when final); facts { exhaustedDay } (day of month).
 * - idle_scheduled_workflows: subject workflow (key `owner/repo#workflowId`, label workflow name); amount = estimated monthly cost;
 *   facts { minutes, runs, daysSinceActivity }.
 * - storage_growth: subject company; ratio = month-on-month growth; amount = storage net (gross when net is 0);
 *   facts { previousAmount, quantity, previousQuantity }.
 * - spend_spike: subject company or repository; ratio = spike day / trailing 7-day average; amount = spike-day gross;
 *   facts { dayOfMonth, trailingAverage }.
 * - collection_issue: subject connection; facts { reasonCodes (a count of blocking reason codes), daysSinceData } (same rules as AI usage).
 */
export interface CiBuildInsight {
  kind: CiBuildInsightKind;
  severity: 'action' | 'review' | 'info';
  rank: number;
  amount: number | null;
  ratio: number | null;
  subject: { type: 'company' | 'repository' | 'workflow' | 'pull_request' | 'connection'; key: string; label: string } | null;
  /** Kind-specific numbers, e.g. `runs`, `minutes`, `fullSuiteRuns`, `pullRequestRuns`, `previousAmount`. No personal identifiers. */
  facts: Record<string, number | null>;
}

export interface CiBuildFreshness {
  connectionId: string;
  displayName: string;
  dataThrough: string | null;
  pulledAt: string | null;
  status: 'provisional' | 'final' | 'unavailable';
  reasonCodes: string[];
}

/** Company-level build cost for one UTC month. No person identifiers (actors are not published). */
export interface CiBuildSummaryArtifact {
  schema: typeof CI_BUILD_SUMMARY_SCHEMA;
  companyId: string;
  month: string;
  generatedAt: string;
  runId: string;
  /** ISO 4217; engine writes the billing currency (USD), the API sets the converted code. */
  currency: string;
  totals: CiBuildTotals;
  /** Up to 13 months ending at `month`, oldest first. */
  monthly: CiBuildMonthlyTotal[];
  byRepository: CiBuildRepositoryRow[];
  byWorkflow: CiBuildWorkflowRow[];
  byTrigger: CiBuildTriggerRow[];
  byRunner: CiBuildRunnerRow[];
  topPullRequests: CiBuildPullRequestRow[];
  storage: CiBuildStorageRow[];
  /** Company net spend per UTC day of `month`, oldest first. */
  daily: Array<CiBuildMoney & { day: string; billedMinutes: number | null }>;
  insights: CiBuildInsight[];
  freshness: CiBuildFreshness[];
}

export interface CiBuildLatestPointer {
  schema: typeof CI_BUILD_LATEST_SCHEMA;
  companyId: string;
  month: string;
  runId: string;
  generatedAt: string;
  months: string[];
}

/** Response of `GET /companies/{companyId}/build-cost/summary?month=&currency=`. */
export interface CiBuildSummaryResponse {
  state: 'ready' | 'not_collected' | 'stale';
  month: string | null;
  months: string[];
  currency: string;
  summary: CiBuildSummaryArtifact | null;
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const requireSafe = (value: string, name: string): string => {
  if (!SAFE_ID.test(value)) throw new Error(`Invalid ${name} for CI build storage path.`);
  return value;
};
const requireMonth = (value: string): string => {
  if (!MONTH.test(value)) throw new Error('Invalid month for CI build storage path.');
  return value;
};
const requireDay = (value: string): string => {
  if (!DAY.test(value)) throw new Error('Invalid day for CI build storage path.');
  return value;
};

/** Accounts-data `companies` container paths (container-relative). */
export const buildCiBuildRawPath = (companyId: string, connectionId: string, day: string, part: string): string =>
  `${requireSafe(companyId, 'companyId')}/ci-build/raw/github/${requireSafe(connectionId, 'connectionId')}/${requireDay(day)}/${requireSafe(part, 'part')}.json.gz`;
export const buildCiBuildFactsPath = (companyId: string, month: string): string =>
  `${requireSafe(companyId, 'companyId')}/ci-build/facts/${requireMonth(month)}.json.gz`;
export const buildCiBuildSummaryPath = (companyId: string, month: string): string =>
  `${requireSafe(companyId, 'companyId')}/ci-build/portal/${requireMonth(month)}/summary.json.gz`;
export const buildCiBuildLatestPath = (companyId: string): string => `${requireSafe(companyId, 'companyId')}/ci-build/portal/latest.json`;
