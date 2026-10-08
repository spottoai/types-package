/** Additive, engine-owned capability evidence. Old license snapshots omit these fields. */
export type Microsoft365CapabilityEvidenceState = 'complete' | 'partial' | 'unknown';
export interface Microsoft365CapabilityDefinition {
  id: string;
  name: string;
  group: string;
}
export interface Microsoft365ServicePlanEvidence {
  servicePlanId: string;
  name: string;
  capabilityId: string | null;
  /** Provider provisioning is independent of assignment enablement and deployment. */
  provisioningStatus: string | null;
  appliesTo: string | null;
}
export interface Microsoft365CapabilityComparison {
  priceListVersion?: string;
  priceEvidenceByCurrency?: Record<string, { current: Microsoft365CapabilityPriceEvidence; target: Microsoft365CapabilityPriceEvidence }>;
  targetSkuId: string;
  targetProductName: string;
  source: 'tenant' | 'publisher';
  addedCapabilityIds: string[];
  lostCapabilityIds: string[];
  /** Unmapped plan differences are not proof of equivalent licensing rights. */
  unverifiedPlanCount: number;
  /** Target minus current monthly retail price per user license, annual commitment excluding tax. Standalone/non-additive; not contract savings or a quantity-scaled total. */
  monthlyRetailDifferenceByCurrency: Record<string, number | null>;
}
/** Constituents of a per-user-license retail comparison, never invoice or contract evidence. */
export interface Microsoft365CapabilityPriceEvidence {
  unitPriceMonthly: number | null;
  confidence: 'verified' | 'reference' | null;
  source: string | null;
  checkedAt: string | null;
}
export interface Microsoft365ProductCapabilities {
  state: Microsoft365CapabilityEvidenceState;
  plans: Microsoft365ServicePlanEvidence[];
  omittedPlanCount: number;
  comparison?: Microsoft365CapabilityComparison;
}
export interface Microsoft365AccountCapabilities {
  state: Microsoft365CapabilityEvidenceState;
  enabledIds: string[];
  disabledIds: string[];
  unknownIds: string[];
  errorIds: string[];
  unavailableIds: string[];
}
export type Microsoft365CapabilityNoticeKind = 'assignment_error' | 'retired_service' | 'redundant_addon';
/** Notices never contribute directly to additive unused-license money. */
export interface Microsoft365CapabilityNotice {
  kind: Microsoft365CapabilityNoticeKind;
  skuId: string;
  accountId?: string;
  assignedByGroup?: string | null;
  code?: string;
  title: string;
  detail: string;
  sourceUrl?: string;
  retiredAt?: string;
  coveredBySkuIds?: string[];
}
export interface Microsoft365CapabilityProjection {
  catalogueVersion: string;
  definitions: Microsoft365CapabilityDefinition[];
  accountsComplete: boolean;
  summary: Array<{
    capabilityId: string;
    includedProductCount: number;
    enabledAccountCount: number | null;
    /** Confirmed minimum before portal detail truncation. */
    observedEnabledAccountCount: number;
  }>;
  notices: Microsoft365CapabilityNotice[];
  /** Observed notices before portal detail truncation, not a tenant-wide absence claim. */
  observedNoticeCount: number;
  omittedNoticeCount: number;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 512;
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const ids = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 128 && value.every(text) && new Set(value).size === value.length;
const state = (value: unknown): boolean => typeof value === 'string' && ['complete', 'partial', 'unknown'].includes(value);
const optional = (value: unknown, check: (item: unknown) => boolean): boolean => value === undefined || check(value);
const url = (value: unknown): boolean => {
  return text(value) && /^https:\/\/(?:learn\.microsoft\.com|support\.microsoft\.com|techcommunity\.microsoft\.com)\/[^\s]*$/.test(value);
};
const priceEvidence = (value: unknown): boolean =>
  record(value) &&
  (value.unitPriceMonthly === null ||
    (typeof value.unitPriceMonthly === 'number' && Number.isFinite(value.unitPriceMonthly) && value.unitPriceMonthly >= 0)) &&
  (value.confidence === null || (typeof value.confidence === 'string' && ['verified', 'reference'].includes(value.confidence))) &&
  (value.source === null || (text(value.source) && /^https:\/\/(?:www|learn|support)\.microsoft\.com\/[^\s]*$/.test(value.source))) &&
  (value.checkedAt === null ||
    (text(value.checkedAt) && /^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt) && Number.isFinite(Date.parse(value.checkedAt))));

export function isMicrosoft365ProductCapabilities(value: unknown): value is Microsoft365ProductCapabilities {
  if (
    !record(value) ||
    !state(value.state) ||
    !count(value.omittedPlanCount) ||
    !Array.isArray(value.plans) ||
    value.plans.length > 128 ||
    !value.plans.every(
      plan =>
        record(plan) &&
        text(plan.servicePlanId) &&
        text(plan.name) &&
        (plan.capabilityId === null || text(plan.capabilityId)) &&
        (plan.provisioningStatus === null || text(plan.provisioningStatus)) &&
        (plan.appliesTo === null || text(plan.appliesTo))
    ) ||
    new Set(value.plans.map(plan => plan.servicePlanId)).size !== value.plans.length
  )
    return false;
  const comparison = value.comparison;
  return (
    comparison === undefined ||
    (record(comparison) &&
      text(comparison.targetSkuId) &&
      text(comparison.targetProductName) &&
      typeof comparison.source === 'string' &&
      ['tenant', 'publisher'].includes(comparison.source) &&
      ids(comparison.addedCapabilityIds) &&
      ids(comparison.lostCapabilityIds) &&
      count(comparison.unverifiedPlanCount) &&
      record(comparison.monthlyRetailDifferenceByCurrency) &&
      optional(comparison.priceListVersion, text) &&
      optional(
        comparison.priceEvidenceByCurrency,
        evidence =>
          record(evidence) &&
          Object.keys(evidence).length <= 16 &&
          Object.entries(evidence).every(
            ([currency, constituents]) =>
              /^[A-Z]{3}$/.test(currency) && record(constituents) && priceEvidence(constituents.current) && priceEvidence(constituents.target)
          )
      ) &&
      Object.keys(comparison.monthlyRetailDifferenceByCurrency).length <= 16 &&
      Object.entries(comparison.monthlyRetailDifferenceByCurrency).every(
        ([currency, amount]) => /^[A-Z]{3}$/.test(currency) && (amount === null || (typeof amount === 'number' && Number.isFinite(amount)))
      ))
  );
}

export function isMicrosoft365AccountCapabilities(value: unknown): value is Microsoft365AccountCapabilities {
  if (!record(value) || !state(value.state)) return false;
  const fields = ['enabledIds', 'disabledIds', 'unknownIds', 'errorIds', 'unavailableIds'];
  if (!fields.every(field => ids(value[field]))) return false;
  const flattened = fields.flatMap(field => value[field] as string[]);
  return new Set(flattened).size === flattened.length;
}

export function isMicrosoft365CapabilityProjection(value: unknown): value is Microsoft365CapabilityProjection {
  if (
    !record(value) ||
    !text(value.catalogueVersion) ||
    typeof value.accountsComplete !== 'boolean' ||
    !Array.isArray(value.definitions) ||
    value.definitions.length > 128 ||
    !value.definitions.every(definition => record(definition) && text(definition.id) && text(definition.name) && text(definition.group)) ||
    !Array.isArray(value.summary) ||
    value.summary.length > 128 ||
    !count(value.observedNoticeCount) ||
    !count(value.omittedNoticeCount) ||
    !Array.isArray(value.notices) ||
    value.notices.length > 2000
  )
    return false;
  const definitions = new Set(value.definitions.map(definition => definition.id));
  if (
    definitions.size !== value.definitions.length ||
    new Set(value.summary.map(row => (record(row) ? row.capabilityId : null))).size !== value.summary.length
  )
    return false;
  if (
    !value.summary.every(
      row =>
        record(row) &&
        definitions.has(row.capabilityId) &&
        count(row.includedProductCount) &&
        count(row.observedEnabledAccountCount) &&
        (row.enabledAccountCount === null || (count(row.enabledAccountCount) && row.enabledAccountCount === row.observedEnabledAccountCount)) &&
        (value.accountsComplete || row.enabledAccountCount === null)
    )
  )
    return false;
  if (value.observedNoticeCount !== value.notices.length + value.omittedNoticeCount) return false;
  return value.notices.every(
    notice =>
      record(notice) &&
      typeof notice.kind === 'string' &&
      ['assignment_error', 'retired_service', 'redundant_addon'].includes(notice.kind) &&
      text(notice.skuId) &&
      text(notice.title) &&
      text(notice.detail) &&
      optional(notice.accountId, text) &&
      optional(notice.assignedByGroup, group => group === null || text(group)) &&
      optional(notice.code, text) &&
      optional(notice.sourceUrl, url) &&
      optional(notice.retiredAt, date => text(date) && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))) &&
      optional(notice.coveredBySkuIds, ids) &&
      (notice.kind === 'retired_service' || text(notice.accountId)) &&
      (notice.kind !== 'retired_service' || (url(notice.sourceUrl) && text(notice.retiredAt))) &&
      (notice.kind !== 'redundant_addon' || (ids(notice.coveredBySkuIds) && notice.coveredBySkuIds.length > 0))
  );
}
