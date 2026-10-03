import { isCount, isDateTime, isRecord, isString, isOptionalString, type JsonRecord } from '../common/validationHelpers';
import {
  REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION,
  REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION,
  REGULATORY_CONTROL_OUTCOMES,
  REGULATORY_NOT_ASSESSED_REASONS,
  REGULATORY_SCORE_SOURCES,
  REGULATORY_SCOREBOARD_LIMITS,
  type RegulatoryComplianceScoreboardSubscription,
  type RegulatoryComplianceScoreboardHistory,
  type RegulatoryScoreboardControl,
} from './regulatoryComplianceScoreboard';
import { deriveControlOutcomeCounts, isRegulatoryScoreboardDate } from './regulatoryComplianceScoreboardMerge';

const guid = (value: unknown): value is string => isString(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const key = (value: unknown): value is string => isString(value) && value.length <= 512 && /^\S+$/u.test(value);
const uniqueKeys = (value: unknown, limit: number = REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard): value is string[] =>
  Array.isArray(value) && value.length <= limit && value.every(key) && new Set(value).size === value.length;
const basis = (value: unknown): boolean => isString(value) && /^[a-f0-9]{64}$/u.test(value);
const source = (value: unknown): boolean => REGULATORY_SCORE_SOURCES.includes(value as never);
const outcome = (value: unknown): boolean => REGULATORY_CONTROL_OUTCOMES.includes(value as never);
const counts = (value: unknown): value is JsonRecord => isRecord(value) && ['passed', 'failed', 'notAssessed', 'assessed', 'total'].every(field => isCount(value[field])) && value.assessed === Number(value.passed) + Number(value.failed) && value.total === Number(value.assessed) + Number(value.notAssessed);
function resourceCounts(value: JsonRecord): boolean {
  return ['failingResourceCount', 'exemptResourceCount', 'activeExemptionCount'].every(field =>
    (value[field] === undefined || isCount(value[field])) &&
    (value[`${field}IsMinimum`] === undefined || (value[`${field}IsMinimum`] === true && isCount(value[field])))
  );
}
function coverage(value: unknown): boolean {
  return isRecord(value) && ['complete', 'partial', 'unavailable', 'stale', 'notCollected'].includes(String(value.state)) &&
    Array.isArray(value.sources) && value.sources.every(item => ['resourceGraph', 'arm', 'policyInsights', 'derived'].includes(String(item))) &&
    (value.observedAt === undefined || isDateTime(value.observedAt)) && isOptionalString(value.message) &&
    (value.requiredPermissions === undefined || (Array.isArray(value.requiredPermissions) && value.requiredPermissions.every(isString))) &&
    (value.diagnostics === undefined || (Array.isArray(value.diagnostics) && value.diagnostics.every(item => isRecord(item) && isString(item.code) && isString(item.message))));
}
function control(value: unknown, assignments: Set<string>): value is RegulatoryScoreboardControl {
  if (!isRecord(value) || !key(value.controlKey) || !isString(value.displayName) || !isOptionalString(value.domain) || !outcome(value.outcome) || !resourceCounts(value)) return false;
  if (value.notAssessedReason !== undefined && (value.outcome !== 'notAssessed' || !REGULATORY_NOT_ASSESSED_REASONS.includes(value.notAssessedReason as never))) return false;
  if (!Array.isArray(value.policyEvidence) || value.policyEvidence.length > 2000) return false;
  const seen = new Set<string>();
  return value.policyEvidence.every(row => {
    if (!isRecord(row) || !key(row.assignmentKey) || !assignments.has(row.assignmentKey) || !isString(row.policyControlKey) || row.policyControlKey.trim().length === 0 || row.policyControlKey.length > 512 || !outcome(row.outcome) || !resourceCounts(row)) return false;
    const identity = JSON.stringify([row.assignmentKey, row.policyControlKey]);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
function standard(value: unknown): boolean {
  if (!isRecord(value) || !key(value.standardKey) || !key(value.standardFamilyKey) || !isString(value.displayName) || !isOptionalString(value.definitionId) || !source(value.source) || !basis(value.assessmentBasisKey) || !resourceCounts(value)) return false;
  if (!Array.isArray(value.assignments) || value.assignments.length > 2000) return false;
  const assignments = new Set<string>();
  for (const row of value.assignments) {
    if (!isRecord(row) || !key(row.assignmentKey) || assignments.has(row.assignmentKey) || !isString(row.assignmentId) || !isString(row.assignmentScope) || typeof row.inherited !== 'boolean') return false;
    assignments.add(row.assignmentKey);
  }
  if (!Array.isArray(value.controls) || !value.controls.length || value.controls.length > REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard || !value.controls.every(row => control(row, assignments))) return false;
  if (new Set(value.controls.map(row => (row as RegulatoryScoreboardControl).controlKey)).size !== value.controls.length || !counts(value.counts)) return false;
  const expected = deriveControlOutcomeCounts(value.controls as RegulatoryScoreboardControl[]);
  return Object.entries(expected).every(([field, count]) => (value.counts as JsonRecord)[field] === count) && (value.policyCounts === undefined || counts(value.policyCounts));
}

export function isRegulatoryComplianceScoreboardSubscription(value: unknown): value is RegulatoryComplianceScoreboardSubscription {
  if (!isRecord(value) || value.schemaVersion !== REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION || !guid(value.subscriptionId) || !isOptionalString(value.tenantId) || !isDateTime(value.generatedAt) || !isDateTime(value.observedAt)) return false;
  if (!Array.isArray(value.managementGroupPath) || value.managementGroupPath.length > REGULATORY_SCOREBOARD_LIMITS.managementGroupPathEntries || !value.managementGroupPath.every(row => isRecord(row) && isString(row.id) && isString(row.displayName))) return false;
  if (!isRecord(value.coverage) || !coverage(value.coverage.policy) || !coverage(value.coverage.defender)) return false;
  if (!uniqueKeys(value.omittedStandardKeys, REGULATORY_SCOREBOARD_LIMITS.standards) || !Array.isArray(value.standards) || value.standards.length > REGULATORY_SCOREBOARD_LIMITS.standards || !value.standards.every(standard)) return false;
  const keys = value.standards.map(row => (row as JsonRecord).standardKey);
  return new Set(keys).size === keys.length && !value.omittedStandardKeys.some(item => keys.includes(item)) &&
    (!value.omittedStandardKeys.length || (value.coverage.policy as JsonRecord).state !== 'complete' || (value.coverage.defender as JsonRecord).state !== 'complete');
}

export function isRegulatoryComplianceScoreboardHistory(value: unknown): value is RegulatoryComplianceScoreboardHistory {
  if (!isRecord(value) || value.schemaVersion !== REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION || !guid(value.subscriptionId) || !isString(value.month) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) || !Array.isArray(value.days) || value.days.length > 31) return false;
  let previous = '';
  for (const day of value.days) {
    if (!isRecord(day) || !isString(day.date) || !isRegulatoryScoreboardDate(day.date) || !day.date.startsWith(value.month) || day.date <= previous || !isDateTime(day.observedAt) || !['complete', 'partial', 'unavailable'].includes(String(day.evidenceState))) return false;
    if (!uniqueKeys(day.omittedStandardKeys, REGULATORY_SCOREBOARD_LIMITS.standards) || !Array.isArray(day.standards) || day.standards.length > REGULATORY_SCOREBOARD_LIMITS.standards || (day.evidenceState === 'unavailable' && day.standards.length > 0) || (day.evidenceState === 'complete' && day.omittedStandardKeys.length > 0)) return false;
    const seen = new Set<string>();
    for (const row of day.standards) {
      if (!isRecord(row) || !key(row.standardKey) || seen.has(row.standardKey) || day.omittedStandardKeys.includes(row.standardKey) || !source(row.source) || !basis(row.assessmentBasisKey) || !uniqueKeys(row.passedControlKeys) || !uniqueKeys(row.failedControlKeys) || !uniqueKeys(row.notAssessedControlKeys)) return false;
      const all = [...row.passedControlKeys, ...row.failedControlKeys, ...row.notAssessedControlKeys];
      if (all.length > REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard || new Set(all).size !== all.length) return false;
      seen.add(row.standardKey);
    }
    previous = day.date;
  }
  return true;
}

/** New report history fields are atomic: capped/incomplete baselines must be absent. */
export function isRegulatoryReportComparisonIdentities(value: JsonRecord): boolean {
  const identities = value.regulatoryFailingControlKeys;
  const comparison = value.regulatoryComparisonBasis;
  if (identities === undefined && comparison === undefined) return true;
  if (!isRecord(identities) || !uniqueKeys(identities.rows) || !identities.rows.every(item => /^\S+:\S+$/u.test(item)) || identities.omittedCount !== 0 || identities.totalCount !== identities.rows.length) return false;
  if (!isRecord(comparison) || comparison.evidenceComplete !== true || !Array.isArray(comparison.standards) || comparison.standards.length > REGULATORY_SCOREBOARD_LIMITS.standards) return false;
  const seen = new Set<string>();
  const standards = comparison.standards;
  return standards.every(row => {
    if (!isRecord(row) || !key(row.standardKey) || seen.has(row.standardKey) || !source(row.source) || !basis(row.assessmentBasisKey)) return false;
    seen.add(row.standardKey);
    return true;
  }) && identities.rows.every(identity => standards.some(row => identity.startsWith(`${(row as JsonRecord).standardKey}:`)));
}
