import {
  CI_BUILD_COLLECTION_MODES,
  CI_BUILD_INSIGHT_KINDS,
  CI_BUILD_LATEST_SCHEMA,
  CI_BUILD_MAX_INSIGHTS,
  CI_BUILD_MAX_PULL_REQUESTS,
  CI_BUILD_MAX_ROWS,
  CI_BUILD_REQUEST_ACTION,
  CI_BUILD_REQUEST_ENTITY,
  CI_BUILD_SUMMARY_SCHEMA,
  type CiBuildCollectRequestMessage,
  type CiBuildLatestPointer,
  type CiBuildSummaryArtifact,
} from './ciBuild';

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 512): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const nullableText = (value: unknown, max = 512): boolean => value === null || text(value, max);
const nullableNumber = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value));
const nullableCount = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableRatio = (value: unknown): boolean => value === null || (typeof value === 'number' && value >= 0 && value <= 1);
const timestamp = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const month = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const day = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value);
const safeId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const currency = (value: unknown): boolean => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
const oneOf = <T extends string>(values: readonly T[], value: unknown): value is T => typeof value === 'string' && (values as readonly string[]).includes(value);
const money = (value: Record<string, unknown>): boolean => nullableNumber(value.netAmount) && nullableNumber(value.grossAmount);
const cancelled = (value: unknown): boolean =>
  record(value) && nullableCount(value.afterFailure) && nullableCount(value.superseded) && nullableCount(value.other);
const rows = (value: unknown, max: number, row: (item: unknown) => boolean): boolean => Array.isArray(value) && value.length <= max && value.every(row);

export function isCiBuildCollectRequestMessage(value: unknown): value is CiBuildCollectRequestMessage {
  return (
    record(value) &&
    value.entity === CI_BUILD_REQUEST_ENTITY &&
    value.action === CI_BUILD_REQUEST_ACTION &&
    safeId(value.companyId) &&
    safeId(value.connectionId) &&
    oneOf(CI_BUILD_COLLECTION_MODES, value.mode) &&
    timestamp(value.requestedAt) &&
    text(value.requestId, 128)
  );
}

function insight(value: unknown): boolean {
  if (!record(value)) return false;
  const subject = value.subject;
  return (
    oneOf(CI_BUILD_INSIGHT_KINDS, value.kind) &&
    oneOf(['action', 'review', 'info'] as const, value.severity) &&
    count(value.rank) &&
    nullableNumber(value.amount) &&
    nullableNumber(value.ratio) &&
    (subject === null ||
      (record(subject) &&
        oneOf(['company', 'repository', 'workflow', 'pull_request', 'connection'] as const, subject.type) &&
        text(subject.key, 512) &&
        text(subject.label))) &&
    record(value.facts) &&
    Object.values(value.facts).every(nullableNumber) &&
    !Object.keys(value.facts).some(key => /email|login|actor|person|name/i.test(key))
  );
}

/** Structural guard for the CI build summary artifact. Actors and personal identifiers are never published. */
export function isCiBuildSummaryArtifact(value: unknown): value is CiBuildSummaryArtifact {
  if (!record(value) || value.schema !== CI_BUILD_SUMMARY_SCHEMA) return false;
  if (!safeId(value.companyId) || !month(value.month) || !timestamp(value.generatedAt) || !text(value.runId, 128) || !currency(value.currency)) return false;
  const totals = value.totals;
  if (
    !record(totals) ||
    !money(totals) ||
    !nullableNumber(totals.discountAmount) ||
    !nullableCount(totals.billedMinutes) ||
    !nullableCount(totals.attributedMinutes) ||
    !nullableCount(totals.runs) ||
    !nullableCount(totals.failedRuns) ||
    !nullableCount(totals.failedMinutes) ||
    !cancelled(totals.cancelledMinutes) ||
    !nullableCount(totals.rerunMinutes) ||
    !(totals.allowanceExhaustedOn === null || day(totals.allowanceExhaustedOn)) ||
    !nullableNumber(totals.projectedNetAmount)
  ) {
    return false;
  }
  return (
    rows(value.monthly, 13, row => record(row) && month(row.month) && money(row) && nullableCount(row.billedMinutes) && oneOf(['provisional', 'final'] as const, row.status)) &&
    rows(
      value.byRepository,
      CI_BUILD_MAX_ROWS,
      row =>
        record(row) &&
        text(row.repository, 256) &&
        nullableText(row.organization, 256) &&
        money(row) &&
        nullableCount(row.billedMinutes) &&
        nullableCount(row.attributedMinutes) &&
        nullableCount(row.runs) &&
        nullableCount(row.failedMinutes) &&
        cancelled(row.cancelledMinutes) &&
        nullableCount(row.rerunMinutes) &&
        nullableRatio(row.fullSuiteShare)
    ) &&
    rows(
      value.byWorkflow,
      CI_BUILD_MAX_ROWS,
      row =>
        record(row) &&
        text(row.repository, 256) &&
        text(row.workflowId, 64) &&
        text(row.workflowName) &&
        nullableText(row.path) &&
        nullableCount(row.attributedMinutes) &&
        nullableNumber(row.estimatedAmount) &&
        nullableCount(row.runs) &&
        nullableCount(row.failedRuns) &&
        record(row.minutesByEvent) &&
        Object.values(row.minutesByEvent).every(minutes => typeof minutes === 'number' && minutes >= 0)
    ) &&
    rows(value.byTrigger, CI_BUILD_MAX_ROWS, row => record(row) && text(row.event, 64) && nullableCount(row.attributedMinutes) && nullableNumber(row.estimatedAmount) && nullableCount(row.runs)) &&
    rows(value.byRunner, CI_BUILD_MAX_ROWS, row => record(row) && text(row.sku, 128) && money(row) && nullableCount(row.billedMinutes) && nullableNumber(row.pricePerMinute)) &&
    rows(
      value.topPullRequests,
      CI_BUILD_MAX_PULL_REQUESTS,
      row =>
        record(row) &&
        text(row.repository, 256) &&
        count(row.number) &&
        nullableCount(row.attributedMinutes) &&
        nullableNumber(row.estimatedAmount) &&
        count(row.runs) &&
        count(row.updates) &&
        cancelled(row.cancelledMinutes)
    ) &&
    rows(value.storage, CI_BUILD_MAX_ROWS, row => record(row) && text(row.sku, 128) && money(row) && nullableNumber(row.quantity) && nullableText(row.unitType, 64)) &&
    rows(value.daily, 31, row => record(row) && day(row.day) && (row.day as string).startsWith(value.month as string) && money(row) && nullableCount(row.billedMinutes)) &&
    rows(value.insights, CI_BUILD_MAX_INSIGHTS, insight) &&
    Array.isArray(value.freshness) &&
    value.freshness.every(
      row =>
        record(row) &&
        safeId(row.connectionId) &&
        text(row.displayName) &&
        (row.dataThrough === null || day(row.dataThrough)) &&
        (row.pulledAt === null || timestamp(row.pulledAt)) &&
        oneOf(['provisional', 'final', 'unavailable'] as const, row.status) &&
        Array.isArray(row.reasonCodes) &&
        row.reasonCodes.every(code => text(code, 128))
    )
  );
}

export function isCiBuildLatestPointer(value: unknown): value is CiBuildLatestPointer {
  return (
    record(value) &&
    value.schema === CI_BUILD_LATEST_SCHEMA &&
    safeId(value.companyId) &&
    month(value.month) &&
    text(value.runId, 128) &&
    timestamp(value.generatedAt) &&
    Array.isArray(value.months) &&
    value.months.length <= 13 &&
    value.months.every(month) &&
    value.months.includes(value.month)
  );
}
