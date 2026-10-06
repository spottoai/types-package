export const MICROSOFT_365_LICENSE_SOURCES = [
  'subscribedSkus',
  'users',
  'signInActivity',
  'reportSettings',
  'officeActiveUsers',
  'officeAppUsage',
  'copilotUsage',
  'subscriptions',
  'organization',
] as const;
export type Microsoft365SourceName = (typeof MICROSOFT_365_LICENSE_SOURCES)[number];
/** Sources added after the first release. Artifacts and views collected earlier do not have them. */
export const MICROSOFT_365_LATER_LICENSE_SOURCES = ['subscriptions', 'organization'] as const;
export type Microsoft365LaterSourceName = (typeof MICROSOFT_365_LATER_LICENSE_SOURCES)[number];
/** Per-source record in which later sources are optional. */
export type Microsoft365SourceRecord<T> = Record<Exclude<Microsoft365SourceName, Microsoft365LaterSourceName>, T> &
  Partial<Record<Microsoft365LaterSourceName, T>>;
export type Microsoft365CoverageState = 'complete' | 'partial' | 'denied' | 'unavailable' | 'failed';
export type Microsoft365RecoveryAction = 'review_access' | 'retry_collection' | 'none';
export interface Microsoft365LicenseSource {
  endpoint: string;
  requiredPermissions: string[];
  state: Microsoft365CoverageState;
  reason?: string;
  httpStatus?: number;
  attemptedAt: string;
  observedAt: string | null;
  data: Record<string, unknown>[] | null;
  period?: 'D30' | 'D28';
  recovery?: { action: Microsoft365RecoveryAction; optional: boolean };
}
export interface Microsoft365LicenseArtifact {
  schemaVersion: 'microsoft-365-licenses/v1';
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId?: string;
  sources: Microsoft365SourceRecord<Microsoft365LicenseSource>;
  reportIdentity: { concealment: 'concealed' | 'identifiable' | 'unknown'; correlation: 'not_performed' };
}
export interface Microsoft365LicenseCoverage extends Omit<Microsoft365LicenseSource, 'data' | 'endpoint' | 'recovery'> {
  recovery: { action: Microsoft365RecoveryAction; optional: boolean };
  observedRowCount: number | null;
  omittedRowCount: number;
}
export interface Microsoft365LicenseRow {
  skuId: string;
  skuPartNumber: string;
  appliesTo: string | null;
  capabilityStatus: string | null;
  enabledUnits: number | null;
  consumedUnits: number | null;
  unallocatedUnits: number | null;
  warningUnits: number | null;
  suspendedUnits: number | null;
  /**
   * Commercial subscriptions for this product, earliest lifecycle date first; absent when subscription evidence was
   * not collected. `nextLifecycleDateTime` is when the subscription moves to its next state if it is not renewed.
   */
  renewals?: Microsoft365LicenseRenewal[];
}
export interface Microsoft365LicenseRenewal {
  /** Enabled, Warning (expired, in grace), Suspended, LockedOut or Deleted. */
  status: string | null;
  isTrial: boolean | null;
  totalLicenses: number | null;
  nextLifecycleDateTime: string | null;
}
export interface Microsoft365LicensedAccountRow {
  id: string;
  displayName: string | null;
  userPrincipalName: string | null;
  accountEnabled: boolean | null;
  skuIds: string[] | null;
  lastSuccessfulSignInAt: string | null;
  signInOlderThan90Days: boolean | null;
}
export interface Microsoft365UsageRow {
  key: string;
  userPrincipalName: string | null;
  displayName: string | null;
  reportRefreshDate: string | null;
  lastActivityDate: string | null;
  fields: Record<string, string>;
}
export type Microsoft365UsageSource = 'officeActiveUsers' | 'officeAppUsage' | 'copilotUsage';
export interface Microsoft365LicenseView {
  schemaVersion: 'microsoft-365-license-view/v1';
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId?: string;
  coverage: Microsoft365SourceRecord<Microsoft365LicenseCoverage>;
  reportIdentity: Microsoft365LicenseArtifact['reportIdentity'];
  summary: {
    productCount: number | null;
    licensedAccountCount: number | null;
    disabledLicensedAccountCount: number | null;
    accountsWithUnknownAssignments: number | null;
  };
  licenses: Microsoft365LicenseRow[];
  accounts: Microsoft365LicensedAccountRow[];
  reports: Record<Microsoft365UsageSource, Microsoft365UsageRow[]>;
  /**
   * Stored by the engine: one list-price estimate per supported market currency (for example USD, NZD, AUD).
   * The tenant view is shared across companies, so the API returns the viewer's market as `pricing` instead.
   */
  pricingByCurrency?: Record<string, Microsoft365LicensePricing>;
  /** Served by the API for the explicit or inferred estimate currency. Unavailable currencies have no estimate. */
  pricing?: Microsoft365LicensePricing;
  /** Duplicate and downgrade findings from curated rules; absent on older snapshots. */
  insights?: Microsoft365LicenseInsights;
  /** The tenant's Microsoft 365 organization; absent on older snapshots or without organization evidence. */
  organization?: Microsoft365Organization;
}
export interface Microsoft365Organization {
  displayName: string | null;
  /** The organization's default verified domain, for example `contoso.com`. */
  defaultDomain: string | null;
}
/**
 * overlap: the product's capabilities are already included in another product on the same enabled, recently active account.
 * downgrade: the account used no Windows or Mac desktop app in the 30-day Microsoft 365 Apps report.
 */
export type Microsoft365LicenseInsightKind = 'overlap' | 'downgrade';
/** available: report rows matched by exact user principal name. Otherwise downgrade counts are unknown. */
export type Microsoft365DowngradeEvidence = 'available' | 'report_unavailable' | 'identities_concealed';
export interface Microsoft365LicenseInsight {
  accountId: string;
  /** The redundant (overlap) or downgradable product assignment. */
  skuId: string;
  kind: Microsoft365LicenseInsightKind;
  ruleId: string;
  /** Overlap: products on the same account that already include this one. */
  coveredBySkuIds?: string[];
  /** Downgrade: suggested replacement; null means the product could be removed. */
  targetSkuPartNumber?: string | null;
  targetProductName?: string | null;
  /** True when the assignment comes only from group-based licensing, so the change belongs on the group. */
  assignedByGroup?: boolean;
}
export interface Microsoft365LicenseInsights {
  rulesVersion: string;
  /** Totals across every observed account; null when the evidence they need is unavailable. */
  overlapAssignmentCount: number | null;
  overlapAccountCount: number | null;
  /** Accounts with at least one downgrade suggestion. */
  downgradeCandidateCount: number | null;
  downgradeEvidence: Microsoft365DowngradeEvidence;
  /** Findings for the listed account and product rows only. */
  findings: Microsoft365LicenseInsight[];
}
/**
 * paid: known commercially paid per-user product, even when this market has no price. free: no-cost/trial/viral entitlement.
 * capacity: tenant-level capacity, not a human seat. unpriced: product without a reliable commercial classification/reference price.
 */
export type Microsoft365LicenseProductCategory = 'paid' | 'free' | 'capacity' | 'unpriced';
/** Product family for grouping and icons. */
export type Microsoft365LicenseProductFamily =
  | 'microsoft365'
  | 'copilot'
  | 'exchange'
  | 'teams'
  | 'sharepoint'
  | 'powerBi'
  | 'powerPlatform'
  | 'visio'
  | 'project'
  | 'dynamics'
  | 'security'
  | 'windows'
  | 'other';
/** verified: taken from the publisher's current price list. reference: long-standing list price that has not been re-verified this cycle. */
export type Microsoft365LicensePriceConfidence = 'verified' | 'reference';
export type Microsoft365LicensePriceDerivation = 'usd_list' | 'observed_local' | 'market_factor';
export interface Microsoft365LicenseProductPricing {
  skuId: string;
  skuPartNumber: string;
  productName: string;
  family: Microsoft365LicenseProductFamily;
  category: Microsoft365LicenseProductCategory;
  priceConfidence: Microsoft365LicensePriceConfidence | null;
  /**
   * How the unit price in this currency was obtained: the USD list price itself, a local price observed on the
   * publisher's site, or a legacy USD conversion. `priceConfidence` describes the selected unit price.
   */
  priceDerivation?: Microsoft365LicensePriceDerivation | null;
  /** Review date and publisher source for the selected price; absent on legacy snapshots. */
  priceCheckedAt?: string | null;
  priceSource?: string | null;
  /** Per user per month in `Microsoft365LicensePricing.currency`, annual commitment, excluding tax. */
  unitPriceMonthly: number | null;
  purchasedUnits: number | null;
  assignedUnits: number | null;
  unassignedUnits: number | null;
  /** Assignments on disabled accounts in the listed account rows; null when user evidence is unavailable. */
  disabledAccountUnits: number | null;
  /** Assignments on enabled accounts whose last successful sign-in is older than 90 days; null when sign-in evidence is unavailable. */
  inactiveAccountUnits: number | null;
  monthlyCost: number | null;
  unassignedMonthlyCost: number | null;
  disabledMonthlyCost: number | null;
  inactiveMonthlyCost: number | null;
  /** Redundant assignments on enabled, recently active accounts (disjoint from disabled and inactive); absent on older snapshots. */
  overlapAccountUnits?: number | null;
  overlapMonthlyCost?: number | null;
  /** Downgrade candidates holding this product and the monthly saving of the suggested change. */
  downgradeAccountUnits?: number | null;
  downgradeMonthlySaving?: number | null;
}
export interface Microsoft365LicensePricing {
  basis: 'list_price_estimate';
  /** Price list identifier, for example `microsoft-2026-07`. */
  priceListVersion: string;
  /** ISO currency of every amount. */
  currency: string;
  /** Legacy USD substitution flag. Current producers return false and never substitute another currency. */
  currencyFallback: boolean;
  term: 'annual_commitment';
  /** Product rows sorted by unused monthly value, highest first. */
  products: Microsoft365LicenseProductPricing[];
  /**
   * Estimated list price per month for each listed account id with at least one priced license. The engine stores
   * this empty (and omits the two id lists below) in `pricingByCurrency`, because one copy per currency would crowd
   * accounts out of the bounded snapshot; the API adds all three for the served currency with
   * `withMicrosoft365AccountPricing`.
   */
  accountMonthlyCosts: Record<string, number>;
  /** Accounts holding commercially paid licenses, including paid products without a market price. */
  paidAccountIds?: string[];
  /** Accounts whose assigned products include a missing or unknown price; their monetary values are partial. */
  partialAccountPriceIds?: string[];
  /**
   * Totals are null when the evidence they need is unavailable (denied, failed or partial sources, or unknown
   * quantities), never a zero. Money is a subtotal of priced products; pricesComplete and pricedPaidUnits disclose gaps.
   * Seat totals include paid products without a market price. Account-based counts are minimums when their completeness flag is false.
   */
  summary: {
    paidProductCount: number | null;
    unpricedProductCount: number | null;
    purchasedPaidUnits: number | null;
    assignedPaidUnits: number | null;
    unassignedPaidUnits: number | null;
    /** Priced subset of all paid products/seats; absent on legacy snapshots. */
    pricedPaidProductCount?: number | null;
    pricedPaidUnits?: number | null;
    /** False for incomplete inventory, unknown classifications or any paid product without a price. */
    pricesComplete?: boolean;
    monthlyCost: number | null;
    unassignedMonthlyCost: number | null;
    disabledAccountCount: number | null;
    disabledMonthlyCost: number | null;
    inactiveAccountCount: number | null;
    inactiveMonthlyCost: number | null;
    /** Value of duplicate assignments; adds to the other reclaim values. Absent on older snapshots. */
    overlapMonthlyCost?: number | null;
    /** Saving if every priced downgrade candidate moved to its suggested product; not part of the reclaim total. */
    downgradeMonthlySaving?: number | null;
    /** True only when user and sign-in sources are complete, every listed account is known and no rows were omitted. */
    accountsComplete: boolean;
    /** True when every disabled licensed account is known and listed, even if other rows were omitted. */
    disabledAccountsComplete: boolean;
  };
}
export interface Microsoft365LicenseTenant {
  cloudAccountId: string;
  name: string;
  tenantId: string;
  supportsAccessUpdate: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 512;
const nullableText = (value: unknown): boolean => value === null || text(value);
const count = (value: unknown): boolean => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value: unknown): boolean => value === null || count(value);
const nullableBoolean = (value: unknown): boolean => value === null || typeof value === 'boolean';
const date = (value: unknown): boolean => text(value) && Number.isFinite(Date.parse(value));
const rows = (value: unknown, predicate: (row: unknown) => boolean): boolean =>
  Array.isArray(value) && value.length <= 2000 && value.every(predicate);

const money = (value: unknown): boolean => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableMoney = (value: unknown): boolean => value === null || money(value);
const PRICING_SUMMARY_COUNTS = [
  'paidProductCount',
  'unpricedProductCount',
  'purchasedPaidUnits',
  'assignedPaidUnits',
  'unassignedPaidUnits',
  'disabledAccountCount',
  'inactiveAccountCount',
] as const;
const PRICING_SUMMARY_MONEY = ['monthlyCost', 'unassignedMonthlyCost', 'disabledMonthlyCost', 'inactiveMonthlyCost'] as const;
const OPTIONAL_SUMMARY_MONEY = ['overlapMonthlyCost', 'downgradeMonthlySaving'] as const;
const OPTIONAL_PRODUCT_COUNTS = ['overlapAccountUnits', 'downgradeAccountUnits'] as const;
const OPTIONAL_PRODUCT_MONEY = ['overlapMonthlyCost', 'downgradeMonthlySaving'] as const;
const optional = (value: unknown, predicate: (value: unknown) => boolean): boolean => value === undefined || predicate(value);
const PRODUCT_COUNTS = ['purchasedUnits', 'assignedUnits', 'unassignedUnits'] as const;
const PRODUCT_MONEY = ['unitPriceMonthly', 'monthlyCost', 'unassignedMonthlyCost', 'disabledMonthlyCost', 'inactiveMonthlyCost'] as const;
const PRODUCT_FAMILIES: readonly Microsoft365LicenseProductFamily[] = [
  'microsoft365',
  'copilot',
  'exchange',
  'teams',
  'sharepoint',
  'powerBi',
  'powerPlatform',
  'visio',
  'project',
  'dynamics',
  'security',
  'windows',
  'other',
];

/** Validates one bounded list-price estimate (engine `pricingByCurrency` entry or API `pricing`). */
export function isMicrosoft365LicensePricing(value: unknown): value is Microsoft365LicensePricing {
  if (
    !isRecord(value) ||
    value.basis !== 'list_price_estimate' ||
    value.term !== 'annual_commitment' ||
    !text(value.priceListVersion) ||
    typeof value.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(value.currency) ||
    typeof value.currencyFallback !== 'boolean' ||
    !isRecord(value.summary) ||
    !isRecord(value.accountMonthlyCosts)
  )
    return false;
  const summary = value.summary;
  if (
    !PRICING_SUMMARY_COUNTS.every(key => nullableCount(summary[key])) ||
    !PRICING_SUMMARY_MONEY.every(key => nullableMoney(summary[key])) ||
    !OPTIONAL_SUMMARY_MONEY.every(key => optional(summary[key], nullableMoney)) ||
    typeof summary.accountsComplete !== 'boolean' ||
    typeof summary.disabledAccountsComplete !== 'boolean'
  )
    return false;
  if (
    (summary.pricedPaidProductCount !== undefined && !nullableCount(summary.pricedPaidProductCount)) ||
    (summary.pricedPaidUnits !== undefined && !nullableCount(summary.pricedPaidUnits)) ||
    (summary.pricesComplete !== undefined && typeof summary.pricesComplete !== 'boolean') ||
    (typeof summary.pricedPaidProductCount === 'number' &&
      typeof summary.paidProductCount === 'number' &&
      summary.pricedPaidProductCount > summary.paidProductCount) ||
    (typeof summary.pricedPaidUnits === 'number' &&
      typeof summary.purchasedPaidUnits === 'number' &&
      summary.pricedPaidUnits > summary.purchasedPaidUnits) ||
    ![value.paidAccountIds, value.partialAccountPriceIds].every(ids => ids === undefined || rows(ids, id => text(id) && !!id))
  )
    return false;
  const costs = Object.entries(value.accountMonthlyCosts);
  if (costs.length > 2000 || !costs.every(([key, cost]) => text(key) && !!key && money(cost))) return false;
  return rows(
    value.products,
    row =>
      isRecord(row) &&
      text(row.skuId) &&
      !!row.skuId &&
      text(row.skuPartNumber) &&
      text(row.productName) &&
      PRODUCT_FAMILIES.includes(row.family as Microsoft365LicenseProductFamily) &&
      ['paid', 'free', 'capacity', 'unpriced'].includes(String(row.category)) &&
      (row.priceConfidence === null || row.priceConfidence === 'verified' || row.priceConfidence === 'reference') &&
      (row.priceCheckedAt === undefined || row.priceCheckedAt === null || date(row.priceCheckedAt)) &&
      (row.priceSource === undefined || nullableText(row.priceSource)) &&
      (row.priceDerivation === undefined ||
        row.priceDerivation === null ||
        ['usd_list', 'observed_local', 'market_factor'].includes(String(row.priceDerivation))) &&
      PRODUCT_COUNTS.every(key => nullableCount(row[key])) &&
      nullableCount(row.disabledAccountUnits) &&
      nullableCount(row.inactiveAccountUnits) &&
      PRODUCT_MONEY.every(key => nullableMoney(row[key])) &&
      OPTIONAL_PRODUCT_COUNTS.every(key => optional(row[key], nullableCount)) &&
      OPTIONAL_PRODUCT_MONEY.every(key => optional(row[key], nullableMoney))
  );
}

/** Validates bounded duplicate and downgrade findings. */
export function isMicrosoft365LicenseInsights(value: unknown): value is Microsoft365LicenseInsights {
  return (
    isRecord(value) &&
    text(value.rulesVersion) &&
    !!value.rulesVersion &&
    nullableCount(value.overlapAssignmentCount) &&
    nullableCount(value.overlapAccountCount) &&
    nullableCount(value.downgradeCandidateCount) &&
    ['available', 'report_unavailable', 'identities_concealed'].includes(String(value.downgradeEvidence)) &&
    rows(
      value.findings,
      row =>
        isRecord(row) &&
        text(row.accountId) &&
        !!row.accountId &&
        text(row.skuId) &&
        !!row.skuId &&
        (row.kind === 'overlap' || row.kind === 'downgrade') &&
        text(row.ruleId) &&
        !!row.ruleId &&
        optional(row.coveredBySkuIds, ids => Array.isArray(ids) && ids.length <= 16 && ids.every(id => text(id) && !!id)) &&
        optional(row.targetSkuPartNumber, nullableText) &&
        optional(row.targetProductName, nullableText) &&
        optional(row.assignedByGroup, flag => typeof flag === 'boolean')
    )
  );
}

/** Validates the bounded engine projection at API/storage boundaries. */
export function isMicrosoft365LicenseView(value: unknown): value is Microsoft365LicenseView {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 'microsoft-365-license-view/v1' ||
    !text(value.tenantId) ||
    !value.tenantId ||
    !date(value.generatedAt) ||
    (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId))
  )
    return false;
  if (
    !isRecord(value.reportIdentity) ||
    !['concealed', 'identifiable', 'unknown'].includes(String(value.reportIdentity.concealment)) ||
    value.reportIdentity.correlation !== 'not_performed'
  )
    return false;
  if (
    !isRecord(value.coverage) ||
    !MICROSOFT_365_LICENSE_SOURCES.every(name => {
      const source = (value.coverage as Record<string, unknown>)[name];
      if (source === undefined && (MICROSOFT_365_LATER_LICENSE_SOURCES as readonly string[]).includes(name)) return true;
      return (
        isRecord(source) &&
        ['complete', 'partial', 'denied', 'unavailable', 'failed'].includes(String(source.state)) &&
        date(source.attemptedAt) &&
        (source.observedAt === null || date(source.observedAt)) &&
        Array.isArray(source.requiredPermissions) &&
        source.requiredPermissions.length <= 8 &&
        source.requiredPermissions.every(text) &&
        isRecord(source.recovery) &&
        ['none', 'review_access', 'retry_collection'].includes(String(source.recovery.action)) &&
        typeof source.recovery.optional === 'boolean' &&
        nullableCount(source.observedRowCount) &&
        count(source.omittedRowCount) &&
        (source.reason === undefined || text(source.reason)) &&
        (source.httpStatus === undefined ||
          (typeof source.httpStatus === 'number' && Number.isInteger(source.httpStatus) && source.httpStatus >= 100 && source.httpStatus <= 599)) &&
        (source.period === undefined || source.period === 'D30' || source.period === 'D28')
      );
    })
  )
    return false;
  if (
    !isRecord(value.summary) ||
    !['productCount', 'licensedAccountCount', 'disabledLicensedAccountCount', 'accountsWithUnknownAssignments'].every(key =>
      nullableCount((value.summary as Record<string, unknown>)[key])
    )
  )
    return false;
  if (
    !rows(
      value.licenses,
      row =>
        isRecord(row) &&
        text(row.skuId) &&
        !!row.skuId &&
        text(row.skuPartNumber) &&
        nullableText(row.appliesTo) &&
        nullableText(row.capabilityStatus) &&
        ['enabledUnits', 'consumedUnits', 'unallocatedUnits', 'warningUnits', 'suspendedUnits'].every(key => nullableCount(row[key])) &&
        optional(
          row.renewals,
          renewals =>
            Array.isArray(renewals) &&
            renewals.length <= 32 &&
            renewals.every(
              renewal =>
                isRecord(renewal) &&
                nullableText(renewal.status) &&
                nullableBoolean(renewal.isTrial) &&
                nullableCount(renewal.totalLicenses) &&
                (renewal.nextLifecycleDateTime === null || date(renewal.nextLifecycleDateTime))
            )
        )
    )
  )
    return false;
  if (
    !rows(
      value.accounts,
      row =>
        isRecord(row) &&
        text(row.id) &&
        !!row.id &&
        nullableText(row.displayName) &&
        nullableText(row.userPrincipalName) &&
        nullableBoolean(row.accountEnabled) &&
        (row.lastSuccessfulSignInAt === null || date(row.lastSuccessfulSignInAt)) &&
        nullableBoolean(row.signInOlderThan90Days) &&
        (row.skuIds === null || (Array.isArray(row.skuIds) && row.skuIds.length <= 128 && row.skuIds.every(text)))
    )
  )
    return false;
  if (
    !isRecord(value.reports) ||
    !['officeActiveUsers', 'officeAppUsage', 'copilotUsage'].every(name =>
      rows(
        (value.reports as Record<string, unknown>)[name],
        row =>
          isRecord(row) &&
          text(row.key) &&
          nullableText(row.userPrincipalName) &&
          nullableText(row.displayName) &&
          nullableText(row.reportRefreshDate) &&
          nullableText(row.lastActivityDate) &&
          isRecord(row.fields) &&
          Object.keys(row.fields).length <= 100 &&
          Object.entries(row.fields).every(([key, field]) => text(key) && text(field))
      )
    )
  )
    return false;
  if (value.pricing !== undefined && !isMicrosoft365LicensePricing(value.pricing)) return false;
  if (value.insights !== undefined && !isMicrosoft365LicenseInsights(value.insights)) return false;
  if (
    value.organization !== undefined &&
    (!isRecord(value.organization) || !nullableText(value.organization.displayName) || !nullableText(value.organization.defaultDomain))
  )
    return false;
  if (value.pricingByCurrency !== undefined) {
    if (!isRecord(value.pricingByCurrency)) return false;
    const estimates = Object.entries(value.pricingByCurrency);
    if (estimates.length > 16 || !estimates.every(([currency, estimate]) => isMicrosoft365LicensePricing(estimate) && estimate.currency === currency))
      return false;
  }
  return true;
}

/**
 * Adds the per-account list-price fields to one estimate, from the listed accounts and that estimate's product
 * prices. An account's cost is the sum of its priced paid products; any product without a known price (or an
 * unknown assignment list) makes its value partial. Paid account ids need complete inventory evidence.
 */
export function withMicrosoft365AccountPricing(
  pricing: Microsoft365LicensePricing,
  view: Pick<Microsoft365LicenseView, 'accounts' | 'coverage'>
): Microsoft365LicensePricing {
  const products = new Map(pricing.products.map(product => [product.skuId, product]));
  const inventoryKnown = view.coverage.subscribedSkus.state === 'complete' && view.coverage.subscribedSkus.omittedRowCount === 0;
  const accountMonthlyCosts: Record<string, number> = {};
  const paidAccountIds: string[] = [];
  const partialAccountPriceIds: string[] = [];
  for (const account of view.accounts) {
    let cost = 0;
    let paid = false;
    let partial = account.skuIds === null;
    for (const skuId of account.skuIds ?? []) {
      const product = products.get(skuId);
      if (!product || product.category === 'unpriced') partial = true;
      if (product?.category !== 'paid') continue;
      paid = true;
      if (product.unitPriceMonthly === null) partial = true;
      else cost += product.unitPriceMonthly;
    }
    if (cost > 0) accountMonthlyCosts[account.id] = Math.round(cost * 100) / 100;
    if (paid) paidAccountIds.push(account.id);
    if (partial) partialAccountPriceIds.push(account.id);
  }
  return { ...pricing, accountMonthlyCosts, paidAccountIds: inventoryKnown ? paidAccountIds : undefined, partialAccountPriceIds };
}
