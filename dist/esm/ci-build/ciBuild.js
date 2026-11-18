/**
 * CI build cost contracts: engine-published monthly build-cost artifacts and their API responses.
 *
 * Provider billing is the monetary authority. Run and job minutes are attribution estimates (each job's elapsed time
 * rounded up per job, priced at the billed unit price of its runner SKU). Missing values are null, never 0.
 * Core feature: core/specs/optimization/strategies/ci-build-optimization/ci-build-optimization.md
 * The collector uses the GitHub provider connection registered in the AI Providers tab (`aiproviderconnections`).
 */
export const CI_BUILD_PROVIDERS = ['github'];
export const CI_BUILD_SUMMARY_SCHEMA = 'ci-build-summary/v1';
export const CI_BUILD_LATEST_SCHEMA = 'ci-build-latest/v1';
export const CI_BUILD_MAX_ROWS = 50;
export const CI_BUILD_MAX_PULL_REQUESTS = 20;
export const CI_BUILD_MAX_INSIGHTS = 12;
export const CI_BUILD_RANGES = ['last-7-days', 'last-30-days', 'last-6-months', 'last-year'];
/** Inclusive start of a rolling preset ending on a UTC date. */
export function getCiBuildRangeStart(preset, end) {
    const date = new Date(`${end}T00:00:00Z`);
    if (preset === 'last-7-days' || preset === 'last-30-days') {
        date.setUTCDate(date.getUTCDate() - (preset === 'last-7-days' ? 6 : 29));
    }
    else {
        const day = date.getUTCDate();
        date.setUTCDate(1);
        date.setUTCMonth(date.getUTCMonth() - (preset === 'last-6-months' ? 6 : 12));
        const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
        date.setUTCDate(Math.min(day, lastDay) + 1);
    }
    return date.toISOString().slice(0, 10);
}
export const CI_BUILD_FEATURE_KEY = 'ci_build_cost';
export const CI_BUILD_REQUEST_ENTITY = 'ci-build';
export const CI_BUILD_REQUEST_ACTION = 'collect';
/** API/timer -> engine collection request on the existing request queue. */
export const CI_BUILD_COLLECTION_MODES = ['backfill', 'daily'];
/**
 * Collection reason codes specific to build cost (provider codes use the AI provider vocabulary):
 * `ci_build.runs_truncated` — the run budget was reached, so attributed minutes are partial (billing stays exact);
 * `ci_build.repository_unreadable` — one repository's runs could not be read; its stored runs are kept.
 */
export const CI_BUILD_REASON_CODES = ['ci_build.runs_truncated', 'ci_build.repository_unreadable'];
/** Insight facts that are money (converted with the artifact currency); `amount` on every insight is money too. */
export const CI_BUILD_INSIGHT_MONEY_FACTS = ['previousAmount', 'trailingAverage'];
export const CI_BUILD_INSIGHT_KINDS = [
    'full_suite_on_updates',
    'late_cheap_failures',
    'superseded_runs',
    'overlapping_pr_runs',
    'duplicate_pr_triggers',
    'cancelled_after_new_commit',
    'repeated_schedule_revision',
    'retry_recovery',
    'variable_pr_runtime',
    'reruns',
    'allowance_exhausted_no_budget',
    'idle_scheduled_workflows',
    'storage_growth',
    'spend_spike',
    'collection_issue',
];
export const getCiBuildPickerMetrics = (summary) => ({
    netAmount: summary.totals.netAmount,
    recommendationCount: [...summary.insights, ...(summary.runRecommendations ?? []), ...(summary.syncRecommendations ?? [])]
        .filter(({ kind, severity }) => kind !== 'collection_issue' && (severity === 'action' || severity === 'review')).length,
});
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const requireSafe = (value, name) => {
    if (!SAFE_ID.test(value))
        throw new Error(`Invalid ${name} for CI build storage path.`);
    return value;
};
const requireMonth = (value) => {
    if (!MONTH.test(value))
        throw new Error('Invalid month for CI build storage path.');
    return value;
};
const requireDay = (value) => {
    if (!DAY.test(value))
        throw new Error('Invalid day for CI build storage path.');
    return value;
};
/** Accounts-data `companies` container paths (container-relative). */
export const buildCiBuildRawPath = (companyId, connectionId, day, part) => `${requireSafe(companyId, 'companyId')}/ci-build/raw/github/${requireSafe(connectionId, 'connectionId')}/${requireDay(day)}/${requireSafe(part, 'part')}.json.gz`;
export const buildCiBuildFactsPath = (companyId, month) => `${requireSafe(companyId, 'companyId')}/ci-build/facts/${requireMonth(month)}.json.gz`;
export const buildCiBuildSummaryPath = (companyId, month) => `${requireSafe(companyId, 'companyId')}/ci-build/portal/${requireMonth(month)}/summary.json.gz`;
export const buildCiBuildLatestPath = (companyId) => `${requireSafe(companyId, 'companyId')}/ci-build/portal/latest.json`;
export const buildCiBuildAccountLatestPath = (companyId, connectionId) => `${requireSafe(companyId, 'companyId')}/ci-build/portal/accounts/${requireSafe(connectionId, 'connectionId')}/latest.json`;
export const buildCiBuildAccountSummaryPath = (companyId, connectionId, month) => `${requireSafe(companyId, 'companyId')}/ci-build/portal/accounts/${requireSafe(connectionId, 'connectionId')}/${requireMonth(month)}/summary.json.gz`;
export function buildCiBuildRangeSummaryPath(companyId, range, connectionId, slot) {
    if (!CI_BUILD_RANGES.includes(range))
        throw new Error('Invalid CI build date range.');
    const account = connectionId ? `/accounts/${requireSafe(connectionId, 'connectionId')}` : '';
    const directory = slot === undefined ? '' : `/slot-${slot}`;
    return `${requireSafe(companyId, 'companyId')}/ci-build/portal${account}/ranges/${range}${directory}/summary.json.gz`;
}
