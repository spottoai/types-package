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
/** Absent means list prices (engine output). The API sets `agreed` or `mixed` after applying customer prices. */
export type Microsoft365StepUpPriceBasis = 'list' | 'agreed' | 'mixed';
/** One currency of a step-up scenario: monthly per-license amounts, annual commitment, excluding tax. Null is unknown, never zero. */
export interface Microsoft365StepUpMoney {
  priceBasis?: Microsoft365StepUpPriceBasis;
  fromUnitPriceMonthly: number | null;
  toUnitPriceMonthly: number | null;
  toPriceConfidence: 'verified' | 'reference' | null;
  /** Target minus source price for one account. */
  perAccountDifference: number | null;
  /** perAccountDifference × accountCount. */
  grossDifference: number | null;
  /** Priced subset of replaced products: unit price × holders in scope. */
  replacedMonthly: number;
  unpricedReplacedProductCount: number;
  /** grossDifference − replacedMonthly. Conditional; never part of savings totals. */
  netDifference: number | null;
}
export interface Microsoft365StepUpReplacedProduct {
  skuId: string;
  skuPartNumber: string;
  productName: string;
  /** In-scope accounts holding this product. */
  accountCount: number;
  /** `rule`: a curated overlap rule lists the target as covering it. `service_plans`: every plan is in the target. */
  basis: 'rule' | 'service_plans';
  /** Unit price per supported currency; null is unknown. */
  unitPriceMonthlyByCurrency: Record<string, number | null>;
}
export interface Microsoft365StepUpCapabilityGain {
  capabilityId: string;
  /** In-scope accounts without this capability enabled through any current license. */
  gainingAccountCount: number;
  /** In-scope accounts that already have it enabled through another license, such as an add-on. */
  alreadyEnabledAccountCount: number;
}
/** Tenant-level upgrade scenario such as Microsoft 365 E3 → E5 → E7. Aggregate only: no account identifiers. */
export interface Microsoft365StepUpComparison {
  /** `${fromSkuId}:${toSkuId}` */
  id: string;
  fromSkuId: string;
  fromProductName: string;
  toSkuId: string;
  toProductName: string;
  /** Target plans come from the tenant when it owns the target, else the reviewed publisher catalogue. */
  targetSource: 'tenant' | 'publisher';
  /** Enabled accounts assigned the source product and not already assigned the target. */
  accountCount: number;
  /** In-scope accounts without a successful sign-in for 90+ days. */
  inactiveAccountCount: number;
  /** False when any account's assignments or capabilities are partial or unknown; counts are then minimums. */
  accountsComplete: boolean;
  addedCapabilityIds: string[];
  lostCapabilityIds: string[];
  unverifiedPlanCount: number;
  capabilityGains: Microsoft365StepUpCapabilityGain[];
  replacedProducts: Microsoft365StepUpReplacedProduct[];
  priceListVersion: string;
  monthlyByCurrency: Record<string, Microsoft365StepUpMoney>;
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
export type Microsoft365CapabilityNoticeKind = 'assignment_error' | 'retired_service' | 'redundant_addon' | 'suspended_subscription';
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
    /** Contributing owned SKU IDs after curated tier expansion; bounded detail, not an entitlement rule for readers. */
    includedSkuIds?: string[];
    enabledAccountCount: number | null;
    /** Confirmed minimum before portal detail truncation. */
    observedEnabledAccountCount: number;
  }>;
  notices: Microsoft365CapabilityNotice[];
  /** Observed notices before portal detail truncation, not a tenant-wide absence claim. */
  observedNoticeCount: number;
  omittedNoticeCount: number;
  /** Curated upgrade scenarios; old snapshots omit them. Conditional, never additive savings. */
  stepUps?: Microsoft365StepUpComparison[];
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

const amount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nullableAmount = (value: unknown): boolean => value === null || amount(value);
const nullablePrice = (value: unknown): boolean => value === null || (amount(value) && value >= 0);
const byCurrency = (value: unknown, check: (item: unknown) => boolean): boolean =>
  record(value) && Object.keys(value).length <= 16 && Object.entries(value).every(([currency, item]) => /^[A-Z]{3}$/.test(currency) && check(item));

/** Validates one aggregate step-up money row; gross and net are unknown together with the per-account difference. */
export function isMicrosoft365StepUpMoney(value: unknown): value is Microsoft365StepUpMoney {
  return (
    record(value) &&
    optional(value.priceBasis, basis => typeof basis === 'string' && ['list', 'agreed', 'mixed'].includes(basis)) &&
    nullablePrice(value.fromUnitPriceMonthly) &&
    nullablePrice(value.toUnitPriceMonthly) &&
    (value.toPriceConfidence === null ||
      (typeof value.toPriceConfidence === 'string' && ['verified', 'reference'].includes(value.toPriceConfidence))) &&
    nullableAmount(value.perAccountDifference) &&
    nullableAmount(value.grossDifference) &&
    nullableAmount(value.netDifference) &&
    (value.perAccountDifference === null) === (value.grossDifference === null) &&
    (value.grossDifference === null) === (value.netDifference === null) &&
    amount(value.replacedMonthly) &&
    value.replacedMonthly >= 0 &&
    count(value.unpricedReplacedProductCount)
  );
}

/** Validates one step-up and its internal arithmetic counts. Capability IDs are checked against definitions by the projection. */
export function isMicrosoft365StepUpComparison(value: unknown): value is Microsoft365StepUpComparison {
  if (
    !record(value) ||
    !text(value.fromSkuId) ||
    !text(value.toSkuId) ||
    value.id !== `${value.fromSkuId}:${value.toSkuId}` ||
    value.fromSkuId === value.toSkuId ||
    !text(value.fromProductName) ||
    !text(value.toProductName) ||
    typeof value.targetSource !== 'string' ||
    !['tenant', 'publisher'].includes(value.targetSource) ||
    !count(value.accountCount) ||
    !count(value.inactiveAccountCount) ||
    value.inactiveAccountCount > value.accountCount ||
    typeof value.accountsComplete !== 'boolean' ||
    !ids(value.addedCapabilityIds) ||
    !ids(value.lostCapabilityIds) ||
    !count(value.unverifiedPlanCount) ||
    !text(value.priceListVersion) ||
    !byCurrency(value.monthlyByCurrency, isMicrosoft365StepUpMoney)
  )
    return false;
  const accounts = value.accountCount;
  const added = new Set(value.addedCapabilityIds);
  return (
    Array.isArray(value.capabilityGains) &&
    value.capabilityGains.length <= 128 &&
    new Set(value.capabilityGains.map(gain => (record(gain) ? gain.capabilityId : null))).size === value.capabilityGains.length &&
    value.capabilityGains.every(
      gain =>
        record(gain) &&
        text(gain.capabilityId) &&
        added.has(gain.capabilityId) &&
        count(gain.gainingAccountCount) &&
        count(gain.alreadyEnabledAccountCount) &&
        gain.gainingAccountCount + gain.alreadyEnabledAccountCount === accounts
    ) &&
    Array.isArray(value.replacedProducts) &&
    value.replacedProducts.length <= 32 &&
    new Set(value.replacedProducts.map(product => (record(product) ? product.skuId : null))).size === value.replacedProducts.length &&
    value.replacedProducts.every(
      product =>
        record(product) &&
        text(product.skuId) &&
        product.skuId !== value.fromSkuId &&
        product.skuId !== value.toSkuId &&
        text(product.skuPartNumber) &&
        text(product.productName) &&
        count(product.accountCount) &&
        product.accountCount > 0 &&
        product.accountCount <= accounts &&
        typeof product.basis === 'string' &&
        ['rule', 'service_plans'].includes(product.basis) &&
        byCurrency(product.unitPriceMonthlyByCurrency, nullablePrice)
    )
  );
}

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
        optional(row.includedSkuIds, ids) &&
        (!Array.isArray(row.includedSkuIds) || row.includedSkuIds.length <= Number(row.includedProductCount)) &&
        count(row.observedEnabledAccountCount) &&
        (row.enabledAccountCount === null || (count(row.enabledAccountCount) && row.enabledAccountCount === row.observedEnabledAccountCount)) &&
        (value.accountsComplete || row.enabledAccountCount === null)
    )
  )
    return false;
  if (value.observedNoticeCount !== value.notices.length + value.omittedNoticeCount) return false;
  if (
    !optional(
      value.stepUps,
      stepUps =>
        Array.isArray(stepUps) &&
        stepUps.length <= 16 &&
        stepUps.every(isMicrosoft365StepUpComparison) &&
        new Set(stepUps.map(stepUp => stepUp.id)).size === stepUps.length &&
        stepUps.every(stepUp => [...stepUp.addedCapabilityIds, ...stepUp.lostCapabilityIds].every(id => definitions.has(id)))
    )
  )
    return false;
  return value.notices.every(isMicrosoft365CapabilityNotice);
}

/** Validates one informational capability notice independently of an account-detail cap. */
export function isMicrosoft365CapabilityNotice(notice: unknown): notice is Microsoft365CapabilityNotice {
  return (
    record(notice) &&
    typeof notice.kind === 'string' &&
    ['assignment_error', 'retired_service', 'redundant_addon', 'suspended_subscription'].includes(notice.kind) &&
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
