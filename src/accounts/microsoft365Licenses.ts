export const MICROSOFT_365_LICENSE_SOURCES = [
  'subscribedSkus',
  'users',
  'signInActivity',
  'reportSettings',
  'officeActiveUsers',
  'officeAppUsage',
  'copilotUsage',
] as const;
export type Microsoft365SourceName = (typeof MICROSOFT_365_LICENSE_SOURCES)[number];
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
  sources: Record<Microsoft365SourceName, Microsoft365LicenseSource>;
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
  coverage: Record<Microsoft365SourceName, Microsoft365LicenseCoverage>;
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
  /** Served by the API: the estimate for the requested currency, or USD with `currencyFallback` set. */
  pricing?: Microsoft365LicensePricing;
}
/**
 * paid: per-user product with a reference list price. free: no-cost/trial/viral entitlement.
 * capacity: tenant-level capacity (storage, devices, orders), not a human seat. unpriced: paid or unknown product without a reference price.
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
export interface Microsoft365LicenseProductPricing {
  skuId: string;
  skuPartNumber: string;
  productName: string;
  family: Microsoft365LicenseProductFamily;
  category: Microsoft365LicenseProductCategory;
  priceConfidence: Microsoft365LicensePriceConfidence | null;
  /** Per user per month in `Microsoft365LicensePricing.currency`, annual commitment, excluding tax. */
  unitPriceMonthly: number | null;
  purchasedUnits: number | null;
  assignedUnits: number | null;
  unassignedUnits: number | null;
  /** Assignments on disabled accounts in the listed account rows. */
  disabledAccountUnits: number;
  /** Assignments on enabled accounts whose last successful sign-in is older than 90 days. */
  inactiveAccountUnits: number;
  monthlyCost: number | null;
  unassignedMonthlyCost: number | null;
  disabledMonthlyCost: number | null;
  inactiveMonthlyCost: number | null;
}
export interface Microsoft365LicensePricing {
  basis: 'list_price_estimate';
  /** Price list identifier, for example `microsoft-2026-07`. */
  priceListVersion: string;
  /** ISO currency of every amount. */
  currency: string;
  /** True when the requested currency had no market price list and the USD estimate was served. */
  currencyFallback: boolean;
  term: 'annual_commitment';
  /** Product rows sorted by unused monthly value, highest first. */
  products: Microsoft365LicenseProductPricing[];
  /** Estimated list price per month for each listed account id with at least one priced license. */
  accountMonthlyCosts: Record<string, number>;
  summary: {
    paidProductCount: number;
    unpricedProductCount: number;
    purchasedPaidUnits: number;
    assignedPaidUnits: number;
    unassignedPaidUnits: number;
    monthlyCost: number;
    unassignedMonthlyCost: number;
    disabledAccountCount: number;
    disabledMonthlyCost: number;
    inactiveAccountCount: number;
    inactiveMonthlyCost: number;
    /** False when account rows were omitted from the view, so disabled/inactive totals are minimums. */
    accountsComplete: boolean;
    /** True when every disabled licensed account is in the listed rows, even if other rows were omitted. */
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
    !PRICING_SUMMARY_COUNTS.every(key => count(summary[key])) ||
    !PRICING_SUMMARY_MONEY.every(key => money(summary[key])) ||
    typeof summary.accountsComplete !== 'boolean' ||
    typeof summary.disabledAccountsComplete !== 'boolean'
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
      PRODUCT_COUNTS.every(key => nullableCount(row[key])) &&
      count(row.disabledAccountUnits) &&
      count(row.inactiveAccountUnits) &&
      PRODUCT_MONEY.every(key => nullableMoney(row[key]))
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
        ['enabledUnits', 'consumedUnits', 'unallocatedUnits', 'warningUnits', 'suspendedUnits'].every(key => nullableCount(row[key]))
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
  if (value.pricingByCurrency !== undefined) {
    if (!isRecord(value.pricingByCurrency)) return false;
    const estimates = Object.entries(value.pricingByCurrency);
    if (estimates.length > 16 || !estimates.every(([currency, estimate]) => isMicrosoft365LicensePricing(estimate) && estimate.currency === currency))
      return false;
  }
  return true;
}
