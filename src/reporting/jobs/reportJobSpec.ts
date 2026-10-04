/**
 * The background report request (`ReportJobSpecV1`), stored as `requestJson` on the `reportjobs` row
 * (core/specs/reporting/reporting-scheduler.md, "Request spec"; types-package/specs/reporting/reporting-scheduler-types.md).
 *
 * Parsing is strict (unknown fields fail) and normalising: subscription IDs are lower-cased, de-duplicated and
 * sorted, so equal requests serialise to the same canonical JSON.
 */
import {
  hasExactlyKeys,
  isBoundedPlainText,
  isCalendarDate,
  isPlainRecord,
  isReportEntityId,
  isReportGuid,
  utf8ByteLength,
} from '../shared/reportingIds';

export const REPORT_JOB_SPEC_SCHEMA_VERSION = 1;
export const REPORT_JOB_REPORT_TYPES = ['sdm', 'architecture-assessment'] as const;
export type ReportJobReportType = (typeof REPORT_JOB_REPORT_TYPES)[number];

export const REPORT_JOB_MAX_SUBSCRIPTIONS = 200;
export const REPORT_JOB_MAX_CLOUD_ACCOUNTS = 20;
export const REPORT_JOB_MAX_SERVICE_IDS = 20;
export const REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS = 366;
/** Maximum UTF-8 size of the canonical `requestJson`. */
export const REPORT_JOB_SPEC_MAX_BYTES = 32 * 1024;

export interface ReportJobScopeV1 {
  /** 1..20 company-owned cloud account IDs, sorted. */
  cloudAccountIds: string[];
  /** 1..200 subscription GUIDs, lower-cased and sorted. */
  subscriptionIds: string[];
}

export type ReportPeriodRuleV1 = { kind: 'previous-calendar-month' } | { kind: 'previous-calendar-quarter' };

/** Explicit dates (API requests only). `YYYY-MM-DD`, start <= end, at most 366 days inclusive. */
export interface ReportExplicitPeriodV1 {
  kind: 'explicit';
  startDate: string;
  endDate: string;
}

export type ReportJobPeriodV1 = ReportPeriodRuleV1 | ReportExplicitPeriodV1;

export const SDM_BACKGROUND_LAYOUTS = ['spotto-layout', 'monthly-insights'] as const;
export type SdmBackgroundLayout = (typeof SDM_BACKGROUND_LAYOUTS)[number];

export const SDM_BACKGROUND_DETAIL_ROW_LIMITS = [10, 25, 50, 'all'] as const;
export type SdmBackgroundDetailRowLimit = (typeof SDM_BACKGROUND_DETAIL_ROW_LIMITS)[number];

export interface SdmBackgroundConfigV1 {
  /** Company Word templates are not supported in background runs. */
  layout: SdmBackgroundLayout;
  cloudIqServiceProfile: {
    /** Service catalogue IDs, validated against the catalogue by reportworker. Order is kept. */
    selectedServiceIds: string[];
    detailRowLimit?: SdmBackgroundDetailRowLimit;
  };
}

export const CURRENT_STATE_AUDIENCES = ['customer', 'internal'] as const;
export type CurrentStateBackgroundAudience = (typeof CURRENT_STATE_AUDIENCES)[number];

export const CURRENT_STATE_SECTION_KEYS = ['costOpportunities', 'securityPosture', 'reliabilityAvailability', 'quickWins', 'roadmap'] as const;
export type CurrentStateBackgroundSections = Record<(typeof CURRENT_STATE_SECTION_KEYS)[number], boolean>;

export interface CurrentStateBackgroundConfigV1 {
  audience: CurrentStateBackgroundAudience;
  sections: CurrentStateBackgroundSections;
  /** ISO 4217, upper case. */
  scopeCurrencyCode: string;
  /** 1..120 characters of plain text. Default: "<provider name> pre-sales team". */
  preparedBy?: string;
}

export interface SdmReportJobSpecV1 {
  schemaVersion: 1;
  reportType: 'sdm';
  scope: ReportJobScopeV1;
  period: ReportJobPeriodV1;
  configuration: SdmBackgroundConfigV1;
}

export interface CurrentStateReportJobSpecV1 {
  schemaVersion: 1;
  reportType: 'architecture-assessment';
  scope: ReportJobScopeV1;
  configuration: CurrentStateBackgroundConfigV1;
}

export type ReportJobSpecV1 = SdmReportJobSpecV1 | CurrentStateReportJobSpecV1;

export type ReportJobSpecParseResult = { ok: true; value: ReportJobSpecV1 } | { ok: false; errors: string[] };

const SERVICE_ID_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isReportJobReportType = (value: unknown): value is ReportJobReportType =>
  typeof value === 'string' && (REPORT_JOB_REPORT_TYPES as readonly string[]).includes(value);

/**
 * Lower-cases, de-duplicates and sorts subscription IDs. Lower case is Spotto's canonical subscription ID form: the
 * request and the scope hash use it, and so do the storage keys and paths reportworker builds from it.
 */
export const normalizeReportSubscriptionIds = (subscriptionIds: readonly string[]): string[] =>
  Array.from(new Set(subscriptionIds.map(id => id.trim().toLowerCase()))).sort();

const parseScope = (value: unknown, errors: string[]): ReportJobScopeV1 | undefined => {
  if (!isPlainRecord(value) || !hasExactlyKeys(value, ['cloudAccountIds', 'subscriptionIds'])) {
    errors.push('scope: must contain exactly cloudAccountIds and subscriptionIds');
    return undefined;
  }
  const { cloudAccountIds, subscriptionIds } = value;
  let valid = true;
  if (!Array.isArray(cloudAccountIds) || cloudAccountIds.length === 0) {
    errors.push('scope.cloudAccountIds: at least one cloud account is required');
    valid = false;
  } else {
    cloudAccountIds.forEach((id, index) => {
      if (!isReportEntityId(id)) {
        errors.push(`scope.cloudAccountIds[${index}]: invalid cloud account ID`);
        valid = false;
      }
    });
  }
  if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
    errors.push('scope.subscriptionIds: at least one subscription is required');
    valid = false;
  } else {
    subscriptionIds.forEach((id, index) => {
      if (typeof id !== 'string' || !isReportGuid(id.trim())) {
        errors.push(`scope.subscriptionIds[${index}]: invalid subscription ID`);
        valid = false;
      }
    });
  }
  if (!valid) return undefined;
  const normalizedAccounts = Array.from(new Set(cloudAccountIds as string[])).sort();
  const normalizedSubscriptions = normalizeReportSubscriptionIds(subscriptionIds as string[]);
  if (normalizedAccounts.length > REPORT_JOB_MAX_CLOUD_ACCOUNTS) {
    errors.push(`scope.cloudAccountIds: at most ${REPORT_JOB_MAX_CLOUD_ACCOUNTS} cloud accounts`);
    return undefined;
  }
  if (normalizedSubscriptions.length > REPORT_JOB_MAX_SUBSCRIPTIONS) {
    errors.push(`scope.subscriptionIds: at most ${REPORT_JOB_MAX_SUBSCRIPTIONS} subscriptions`);
    return undefined;
  }
  return { cloudAccountIds: normalizedAccounts, subscriptionIds: normalizedSubscriptions };
};

const parsePeriod = (value: unknown, errors: string[]): ReportJobPeriodV1 | undefined => {
  if (!isPlainRecord(value)) {
    errors.push('period: must be an object');
    return undefined;
  }
  if (value.kind === 'previous-calendar-month' || value.kind === 'previous-calendar-quarter') {
    if (!hasExactlyKeys(value, ['kind'])) {
      errors.push('period: a period rule has no other fields');
      return undefined;
    }
    return { kind: value.kind };
  }
  if (value.kind === 'explicit') {
    if (!hasExactlyKeys(value, ['kind', 'startDate', 'endDate']) || !isCalendarDate(value.startDate) || !isCalendarDate(value.endDate)) {
      errors.push('period: explicit periods need startDate and endDate as YYYY-MM-DD');
      return undefined;
    }
    const days = (Date.parse(`${value.endDate}T00:00:00.000Z`) - Date.parse(`${value.startDate}T00:00:00.000Z`)) / DAY_MS + 1;
    if (days < 1 || days > REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS) {
      errors.push(`period: startDate must not be after endDate and the period must be at most ${REPORT_JOB_MAX_EXPLICIT_PERIOD_DAYS} days`);
      return undefined;
    }
    return { kind: 'explicit', startDate: value.startDate, endDate: value.endDate };
  }
  errors.push('period.kind: must be previous-calendar-month, previous-calendar-quarter or explicit');
  return undefined;
};

const parseSdmConfiguration = (value: unknown, errors: string[]): SdmBackgroundConfigV1 | undefined => {
  if (!isPlainRecord(value) || !hasExactlyKeys(value, ['layout', 'cloudIqServiceProfile'])) {
    errors.push('configuration: SDM needs exactly layout and cloudIqServiceProfile');
    return undefined;
  }
  const { layout, cloudIqServiceProfile: profile } = value;
  let valid = true;
  if (typeof layout !== 'string' || !(SDM_BACKGROUND_LAYOUTS as readonly string[]).includes(layout)) {
    errors.push('configuration.layout: must be spotto-layout or monthly-insights');
    valid = false;
  }
  if (!isPlainRecord(profile) || !hasExactlyKeys(profile, ['selectedServiceIds'], ['detailRowLimit'])) {
    errors.push('configuration.cloudIqServiceProfile: needs selectedServiceIds and optionally detailRowLimit');
    return undefined;
  }
  const { selectedServiceIds, detailRowLimit } = profile;
  if (
    !Array.isArray(selectedServiceIds) ||
    selectedServiceIds.length > REPORT_JOB_MAX_SERVICE_IDS ||
    !selectedServiceIds.every(id => typeof id === 'string' && SERVICE_ID_PATTERN.test(id)) ||
    new Set(selectedServiceIds).size !== selectedServiceIds.length
  ) {
    errors.push(`configuration.cloudIqServiceProfile.selectedServiceIds: up to ${REPORT_JOB_MAX_SERVICE_IDS} unique service IDs`);
    valid = false;
  }
  if (detailRowLimit !== undefined && !(SDM_BACKGROUND_DETAIL_ROW_LIMITS as readonly unknown[]).includes(detailRowLimit)) {
    errors.push('configuration.cloudIqServiceProfile.detailRowLimit: must be 10, 25, 50 or all');
    valid = false;
  }
  if (!valid) return undefined;
  return {
    layout: layout as SdmBackgroundLayout,
    cloudIqServiceProfile: {
      selectedServiceIds: [...(selectedServiceIds as string[])],
      ...(detailRowLimit === undefined ? {} : { detailRowLimit: detailRowLimit as SdmBackgroundDetailRowLimit }),
    },
  };
};

/** Scope/period boundaries shared by public projections; no fabricated report configuration is needed. */
export const isReportJobScopeV1 = (value: unknown): value is ReportJobScopeV1 => {
  try {
    if (
      !isPlainRecord(value) ||
      !Array.isArray(value.cloudAccountIds) ||
      value.cloudAccountIds.length > REPORT_JOB_MAX_CLOUD_ACCOUNTS ||
      !Array.isArray(value.subscriptionIds) ||
      value.subscriptionIds.length > REPORT_JOB_MAX_SUBSCRIPTIONS
    )
      return false;
    const errors: string[] = [];
    return parseScope(value, errors) !== undefined && errors.length === 0;
  } catch {
    return false;
  }
};

export const isReportJobPeriodV1 = (value: unknown): value is ReportJobPeriodV1 => {
  try {
    const errors: string[] = [];
    return parsePeriod(value, errors) !== undefined && errors.length === 0;
  } catch {
    return false;
  }
};

const parseCurrentStateConfiguration = (value: unknown, errors: string[]): CurrentStateBackgroundConfigV1 | undefined => {
  if (!isPlainRecord(value) || !hasExactlyKeys(value, ['audience', 'sections', 'scopeCurrencyCode'], ['preparedBy'])) {
    errors.push('configuration: Current State needs audience, sections, scopeCurrencyCode and optionally preparedBy');
    return undefined;
  }
  const { audience, sections, scopeCurrencyCode, preparedBy } = value;
  let valid = true;
  if (typeof audience !== 'string' || !(CURRENT_STATE_AUDIENCES as readonly string[]).includes(audience)) {
    errors.push('configuration.audience: must be customer or internal');
    valid = false;
  }
  if (
    !isPlainRecord(sections) ||
    !hasExactlyKeys(sections, CURRENT_STATE_SECTION_KEYS) ||
    !CURRENT_STATE_SECTION_KEYS.every(key => typeof sections[key] === 'boolean')
  ) {
    errors.push(`configuration.sections: needs exactly ${CURRENT_STATE_SECTION_KEYS.join(', ')} as booleans`);
    valid = false;
  }
  const currency = typeof scopeCurrencyCode === 'string' ? scopeCurrencyCode.trim().toUpperCase() : '';
  if (!CURRENCY_PATTERN.test(currency)) {
    errors.push('configuration.scopeCurrencyCode: must be a three-letter ISO 4217 code');
    valid = false;
  }
  const preparedByText = typeof preparedBy === 'string' ? preparedBy.trim() : preparedBy;
  if (preparedByText !== undefined && (!isBoundedPlainText(preparedByText, 120) || (preparedByText as string).includes('://'))) {
    errors.push('configuration.preparedBy: 1..120 characters of plain text, no URLs');
    valid = false;
  }
  if (!valid) return undefined;
  const sectionRecord = sections as Record<string, boolean>;
  return {
    audience: audience as CurrentStateBackgroundAudience,
    sections: {
      costOpportunities: sectionRecord.costOpportunities,
      securityPosture: sectionRecord.securityPosture,
      reliabilityAvailability: sectionRecord.reliabilityAvailability,
      quickWins: sectionRecord.quickWins,
      roadmap: sectionRecord.roadmap,
    },
    scopeCurrencyCode: currency,
    ...(preparedByText === undefined ? {} : { preparedBy: preparedByText as string }),
  };
};

const parseSpecUnsafe = (input: unknown): ReportJobSpecParseResult => {
  const errors: string[] = [];
  if (!isPlainRecord(input)) return { ok: false, errors: ['spec: must be an object'] };
  if (input.schemaVersion !== REPORT_JOB_SPEC_SCHEMA_VERSION) return { ok: false, errors: ['schemaVersion: must be 1'] };
  if (input.reportType === 'sdm') {
    if (!hasExactlyKeys(input, ['schemaVersion', 'reportType', 'scope', 'period', 'configuration'])) {
      return { ok: false, errors: ['spec: SDM needs exactly schemaVersion, reportType, scope, period and configuration'] };
    }
    const scope = parseScope(input.scope, errors);
    const period = parsePeriod(input.period, errors);
    const configuration = parseSdmConfiguration(input.configuration, errors);
    if (!scope || !period || !configuration || errors.length > 0) return { ok: false, errors };
    return { ok: true, value: { schemaVersion: 1, reportType: 'sdm', scope, period, configuration } };
  }
  if (input.reportType === 'architecture-assessment') {
    if (!hasExactlyKeys(input, ['schemaVersion', 'reportType', 'scope', 'configuration'])) {
      return { ok: false, errors: ['spec: Current State needs exactly schemaVersion, reportType, scope and configuration (no period)'] };
    }
    const scope = parseScope(input.scope, errors);
    const configuration = parseCurrentStateConfiguration(input.configuration, errors);
    if (!scope || !configuration || errors.length > 0) return { ok: false, errors };
    return { ok: true, value: { schemaVersion: 1, reportType: 'architecture-assessment', scope, configuration } };
  }
  return { ok: false, errors: ['reportType: must be sdm or architecture-assessment'] };
};

/** Strict, normalising parser. Never throws (hostile getters are reported as an invalid spec). */
export const parseReportJobSpecV1 = (input: unknown): ReportJobSpecParseResult => {
  try {
    return parseSpecUnsafe(input);
  } catch {
    return { ok: false, errors: ['spec: unreadable'] };
  }
};

const canonicalSpecObject = (spec: ReportJobSpecV1): unknown => {
  const scope = { cloudAccountIds: spec.scope.cloudAccountIds, subscriptionIds: spec.scope.subscriptionIds };
  if (spec.reportType === 'sdm') {
    const period =
      spec.period.kind === 'explicit'
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
export const serializeReportJobSpecV1 = (spec: unknown): string => {
  const parsed = parseReportJobSpecV1(spec);
  if (!parsed.ok) throw new Error(`Invalid report job spec: ${parsed.errors.join('; ')}`);
  const json = JSON.stringify(canonicalSpecObject(parsed.value));
  if (utf8ByteLength(json) > REPORT_JOB_SPEC_MAX_BYTES) throw new RangeError(`Report job spec exceeds ${REPORT_JOB_SPEC_MAX_BYTES} bytes.`);
  return json;
};

/**
 * Parses stored `requestJson`. It must be valid JSON, a valid spec and already canonical (byte-equal to
 * `serializeReportJobSpecV1` of itself), so a hash over the stored string identifies the request exactly.
 */
export const parseReportJobRequestJson = (requestJson: unknown): ReportJobSpecParseResult => {
  if (typeof requestJson !== 'string' || requestJson.length === 0) return { ok: false, errors: ['requestJson: must be a non-empty string'] };
  if (utf8ByteLength(requestJson) > REPORT_JOB_SPEC_MAX_BYTES) return { ok: false, errors: ['requestJson: exceeds 32 KiB'] };
  let raw: unknown;
  try {
    raw = JSON.parse(requestJson);
  } catch {
    return { ok: false, errors: ['requestJson: not valid JSON'] };
  }
  const parsed = parseReportJobSpecV1(raw);
  if (!parsed.ok) return parsed;
  if (JSON.stringify(canonicalSpecObject(parsed.value)) !== requestJson) return { ok: false, errors: ['requestJson: not in canonical form'] };
  return parsed;
};
