import { isMicrosoft365PricingFacts } from './microsoft365PricingFacts';
import { isMicrosoft365PricingRevision, isMicrosoft365PricingProjection, type Microsoft365PricingProjection } from './microsoft365PricingOverrides';
import {
  MICROSOFT_365_LICENSE_SOURCES,
  isMicrosoft365LicenseInsight,
  isMicrosoft365LicenseInsights,
  isMicrosoft365LicensePricing,
  isMicrosoft365LicensedAccountRow,
  isMicrosoft365LicenseView,
  type Microsoft365LicenseInsight,
  type Microsoft365LicenseInsights,
  type Microsoft365LicensePricing,
  type Microsoft365LicenseView,
  type Microsoft365LicensedAccountRow,
} from './microsoft365Licenses';
import {
  isMicrosoft365CapabilityNotice,
  isMicrosoft365CapabilityProjection,
  type Microsoft365CapabilityNotice,
  type Microsoft365CapabilityProjection,
} from './microsoft365Capabilities';
import { isMicrosoft365UsageDate, isMicrosoft365UsageSummary, type Microsoft365UsageSummary } from './microsoft365Usage';

export const MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT = 5000;

/** Detail counts describe observed licensed accounts, not proof of a complete tenant population. */
export interface Microsoft365LicenseAccountDetails {
  observedRowCount: number;
  returnedRowCount: number;
  omittedRowCount: number;
}

/** Full-population list-price estimates: annual commitment per month, excluding tax, in the declared currency. */
export type Microsoft365LicenseSummaryPricing = Omit<Microsoft365LicensePricing, 'accountMonthlyCosts' | 'paidAccountIds' | 'partialAccountPriceIds'>;

/** Aggregate rule evidence for reporting. Contains no account identity or person-level evidence. */
export interface Microsoft365LicenseInsightPattern {
  kind: Microsoft365LicenseInsight['kind'];
  ruleId: string;
  skuId: string;
  targetSkuId: string | null;
  /** Publisher product reference remains available when a concrete SKU ID cannot be resolved. */
  targetSkuPartNumber: string | null;
  targetProductName?: string | null;
  coveredBySkuIds: string[];
  count: number;
}

export interface Microsoft365LicenseSummaryInsights extends Omit<Microsoft365LicenseInsights, 'findings'> {
  /** All observed findings, including blocked downgrade facts excluded from candidate patterns. */
  observedFindingCount?: number;
  patterns: Microsoft365LicenseInsightPattern[];
}

export type Microsoft365LicenseSummaryCapabilities = Omit<Microsoft365CapabilityProjection, 'notices' | 'omittedNoticeCount'>;

/** Anonymous report-row counts are independent of enabled/licensed account denominators. */
export interface Microsoft365AnonymousWorkloadUsage {
  basis: 'report_rows';
  reportRefreshDate: string | null;
  windowDays: 30;
  observedRowCount: number;
  workloads: Record<
    'exchange' | 'oneDrive' | 'sharePoint' | 'teams' | 'vivaEngage',
    { active: number; inactive: number; noRecordedActivity: number; unknown: number }
  >;
}

export interface Microsoft365LicenseSummaryUsage extends Microsoft365UsageSummary {
  anonymousWorkloads?: Microsoft365AnonymousWorkloadUsage;
}

/** Stored summary and API selected-currency summary. No people or raw Graph report rows. */
export interface Microsoft365LicenseSummaryView
  extends Omit<
    Microsoft365LicenseView,
    'schemaVersion' | 'tenantSyncRunId' | 'accounts' | 'reports' | 'pricingByCurrency' | 'pricing' | 'insights' | 'capabilities' | 'usage'
  > {
  schemaVersion: 'microsoft-365-license-summary/v1';
  /** Both summary and accounts must carry exactly the same scan ID and generatedAt. */
  tenantSyncRunId: string;
  accountDetails: Microsoft365LicenseAccountDetails;
  pricingByCurrency?: Record<string, Microsoft365LicenseSummaryPricing>;
  pricing?: Microsoft365LicenseSummaryPricing;
  insights?: Microsoft365LicenseSummaryInsights;
  capabilities?: Microsoft365LicenseSummaryCapabilities;
  usage?: Microsoft365LicenseSummaryUsage;
}

/** API enrichment in one selected currency; monthly list-price estimates, annual commitment, excluding tax. */
export interface Microsoft365LicenseAccountPricing {
  basis?: Microsoft365LicensePricing['basis'];
  projection?: Microsoft365PricingProjection;
  currency: string;
  accountMonthlyCosts: Record<string, number>;
  paidAccountIds?: string[];
  partialAccountPriceIds?: string[];
}

/** Independently loaded people detail. Readers compare both scan stamps before combining siblings. */
export interface Microsoft365LicenseAccountsView {
  pricingRevision?: string;
  schemaVersion: 'microsoft-365-license-accounts/v1';
  tenantId: string;
  generatedAt: string;
  tenantSyncRunId: string;
  accountDetails: Microsoft365LicenseAccountDetails;
  accounts: Microsoft365LicensedAccountRow[];
  insights?: { rulesVersion: string; findings: Microsoft365LicenseInsight[] };
  capabilities?: {
    catalogueVersion: string;
    notices: Microsoft365CapabilityNotice[];
    observedNoticeCount: number;
    omittedNoticeCount: number;
  };
  pricing?: Microsoft365LicenseAccountPricing;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 512;
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  record(value) && Object.keys(value).every(key => keys.includes(key));
const optional = (value: unknown, check: (item: unknown) => boolean): boolean => value === undefined || check(value);
const list = (value: unknown, limit: number, check: (item: unknown) => boolean): value is unknown[] =>
  Array.isArray(value) && value.length <= limit && value.every(check);
const ids = (value: unknown, limit: number): value is string[] => list(value, limit, text) && new Set(value).size === value.length;
const currency = (value: unknown): value is string => typeof value === 'string' && /^[A-Z]{3}$/.test(value);

function identity(value: Record<string, unknown>): boolean {
  return text(value.tenantId) && text(value.tenantSyncRunId) && text(value.generatedAt) && Number.isFinite(Date.parse(value.generatedAt));
}

function accountDetails(value: unknown): value is Microsoft365LicenseAccountDetails {
  return (
    exact(value, ['observedRowCount', 'returnedRowCount', 'omittedRowCount']) &&
    count(value.observedRowCount) &&
    count(value.returnedRowCount) &&
    count(value.omittedRowCount) &&
    value.returnedRowCount <= MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT &&
    value.observedRowCount === value.returnedRowCount + value.omittedRowCount
  );
}

const COVERAGE_KEYS = [
  'requiredPermissions',
  'state',
  'reason',
  'httpStatus',
  'attemptedAt',
  'observedAt',
  'period',
  'recovery',
  'observedRowCount',
  'omittedRowCount',
  'notes',
];
const SUMMARY_KEYS = [
  'productCount',
  'licensedAccountCount',
  'disabledLicensedAccountCount',
  'observedLicensedAccountCount',
  'observedDisabledLicensedAccountCount',
  'accountsWithUnknownAssignments',
];
const LICENSE_KEYS = [
  'usage',
  'capabilities',
  'skuId',
  'skuPartNumber',
  'productName',
  'appliesTo',
  'capabilityStatus',
  'enabledUnits',
  'consumedUnits',
  'unallocatedUnits',
  'warningUnits',
  'suspendedUnits',
  'renewals',
];
const PRICING_KEYS = [
  'nonSavingDowngradeEdges',
  'projection',
  'breakdownsUnavailableReason',
  'breakdowns',
  'basis',
  'priceListVersion',
  'currency',
  'currencyFallback',
  'term',
  'products',
  'summary',
];
const PRODUCT_PRICE_KEYS = [
  'referenceUnitPriceMonthly',
  'priceOverride',
  'skuId',
  'skuPartNumber',
  'productName',
  'family',
  'category',
  'priceConfidence',
  'priceDerivation',
  'priceCheckedAt',
  'priceSource',
  'unitPriceMonthly',
  'purchasedUnits',
  'assignedUnits',
  'unassignedUnits',
  'disabledAccountUnits',
  'inactiveAccountUnits',
  'monthlyCost',
  'unassignedMonthlyCost',
  'disabledMonthlyCost',
  'inactiveMonthlyCost',
  'noOfficeActivityMonthlyCost',
  'overlapAccountUnits',
  'overlapMonthlyCost',
  'downgradeAccountUnits',
  'downgradeMonthlySaving',
];
const PRICE_SUMMARY_KEYS = [
  'paidProductCount',
  'unpricedProductCount',
  'purchasedPaidUnits',
  'assignedPaidUnits',
  'unassignedPaidUnits',
  'pricedPaidProductCount',
  'pricedPaidUnits',
  'pricesComplete',
  'monthlyCost',
  'unassignedMonthlyCost',
  'disabledAccountCount',
  'disabledMonthlyCost',
  'inactiveAccountCount',
  'inactiveMonthlyCost',
  'noOfficeActivityAccountCount',
  'noOfficeActivityMonthlyCost',
  'overlapMonthlyCost',
  'downgradeMonthlySaving',
  'accountsComplete',
  'disabledAccountsComplete',
];
const INSIGHTS_KEYS = [
  'observedFindingCount',
  'rulesVersion',
  'overlapAssignmentCount',
  'overlapAccountCount',
  'downgradeCandidateCount',
  'downgradeBlockedCount',
  'downgradeEvidence',
  'patterns',
];

function productCapabilitiesPrivacy(value: unknown): boolean {
  if (
    !exact(value, ['state', 'plans', 'omittedPlanCount', 'comparison']) ||
    !list(value.plans, 128, plan => exact(plan, ['servicePlanId', 'name', 'capabilityId', 'provisioningStatus', 'appliesTo']))
  )
    return false;
  return optional(value.comparison, comparison => {
    if (
      !exact(comparison, [
        'priceListVersion',
        'priceEvidenceByCurrency',
        'targetSkuId',
        'targetProductName',
        'source',
        'addedCapabilityIds',
        'lostCapabilityIds',
        'unverifiedPlanCount',
        'monthlyRetailDifferenceByCurrency',
      ])
    )
      return false;
    return optional(
      comparison.priceEvidenceByCurrency,
      evidence =>
        record(evidence) &&
        Object.values(evidence).every(
          pair =>
            exact(pair, ['current', 'target']) &&
            ['current', 'target'].every(key => exact(pair[key], ['unitPriceMonthly', 'confidence', 'source', 'checkedAt']))
        )
    );
  });
}

/** Strict aggregate pricing boundary; omitted person-price properties must be absent even when empty. */
export function isMicrosoft365LicenseSummaryPricing(value: unknown): value is Microsoft365LicenseSummaryPricing {
  return (
    exact(value, PRICING_KEYS) &&
    exact(value.summary, PRICE_SUMMARY_KEYS) &&
    list(value.products, 2000, product => exact(product, PRODUCT_PRICE_KEYS)) &&
    isMicrosoft365LicensePricing({ ...value, accountMonthlyCosts: {} })
  );
}

const STEP_UP_KEYS = [
  'id',
  'fromSkuId',
  'fromProductName',
  'toSkuId',
  'toProductName',
  'targetSource',
  'accountCount',
  'inactiveAccountCount',
  'accountsComplete',
  'addedCapabilityIds',
  'lostCapabilityIds',
  'unverifiedPlanCount',
  'capabilityGains',
  'replacedProducts',
  'priceListVersion',
  'monthlyByCurrency',
];
const STEP_UP_MONEY_KEYS = [
  'priceBasis',
  'fromUnitPriceMonthly',
  'toUnitPriceMonthly',
  'toPriceConfidence',
  'perAccountDifference',
  'grossDifference',
  'replacedMonthly',
  'unpricedReplacedProductCount',
  'netDifference',
];
/** Aggregate privacy boundary: step-ups carry counts and prices, never account identifiers. */
function stepUpPrivacy(value: unknown): boolean {
  return (
    exact(value, STEP_UP_KEYS) &&
    list(value.capabilityGains, 128, gain => exact(gain, ['capabilityId', 'gainingAccountCount', 'alreadyEnabledAccountCount'])) &&
    list(value.replacedProducts, 32, product =>
      exact(product, ['skuId', 'skuPartNumber', 'productName', 'accountCount', 'basis', 'unitPriceMonthlyByCurrency'])
    ) &&
    record(value.monthlyByCurrency) &&
    Object.values(value.monthlyByCurrency).every(money => exact(money, STEP_UP_MONEY_KEYS))
  );
}

function summaryCapabilities(value: unknown): value is Microsoft365LicenseSummaryCapabilities {
  return (
    exact(value, ['catalogueVersion', 'definitions', 'accountsComplete', 'summary', 'observedNoticeCount', 'stepUps']) &&
    optional(value.stepUps, stepUps => list(stepUps, 16, stepUpPrivacy)) &&
    list(value.definitions, 128, definition => exact(definition, ['id', 'name', 'group'])) &&
    list(value.summary, 128, row =>
      exact(row, ['capabilityId', 'includedProductCount', 'includedSkuIds', 'enabledAccountCount', 'observedEnabledAccountCount'])
    ) &&
    isMicrosoft365CapabilityProjection({ ...value, notices: [], omittedNoticeCount: value.observedNoticeCount })
  );
}

function summaryInsights(value: unknown): value is Microsoft365LicenseSummaryInsights {
  if (!exact(value, INSIGHTS_KEYS) || !optional(value.observedFindingCount, count) || !isMicrosoft365LicenseInsights({ ...value, findings: [] }))
    return false;
  if (
    !list(
      value.patterns,
      2000,
      row =>
        exact(row, ['kind', 'ruleId', 'skuId', 'targetSkuId', 'targetSkuPartNumber', 'targetProductName', 'coveredBySkuIds', 'count']) &&
        (row.kind === 'overlap' || row.kind === 'downgrade') &&
        text(row.ruleId) &&
        text(row.skuId) &&
        (row.targetSkuId === null || text(row.targetSkuId)) &&
        (row.targetSkuPartNumber === null || text(row.targetSkuPartNumber)) &&
        optional(row.targetProductName, name => name === null || text(name)) &&
        ids(row.coveredBySkuIds, 16) &&
        count(row.count) &&
        row.count > 0
    )
  )
    return false;
  const keys = value.patterns.map(row => {
    const pattern = row as Microsoft365LicenseInsightPattern;
    return JSON.stringify([
      pattern.kind,
      pattern.ruleId,
      pattern.skuId,
      pattern.targetSkuId,
      pattern.targetSkuPartNumber,
      [...pattern.coveredBySkuIds].sort(),
    ]);
  });
  return new Set(keys).size === keys.length;
}

function anonymousWorkloads(value: unknown): value is Microsoft365AnonymousWorkloadUsage {
  return (
    exact(value, ['basis', 'reportRefreshDate', 'windowDays', 'observedRowCount', 'workloads']) &&
    value.basis === 'report_rows' &&
    value.windowDays === 30 &&
    count(value.observedRowCount) &&
    (value.reportRefreshDate === null || isMicrosoft365UsageDate(value.reportRefreshDate)) &&
    exact(value.workloads, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage']) &&
    ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'].every(key => {
      const row = (value.workloads as Record<string, unknown>)[key];
      return (
        exact(row, ['active', 'inactive', 'noRecordedActivity', 'unknown']) &&
        ['active', 'inactive', 'noRecordedActivity', 'unknown'].every(field => count(row[field])) &&
        Number(row.active) + Number(row.inactive) + Number(row.noRecordedActivity) + Number(row.unknown) === value.observedRowCount
      );
    })
  );
}

/** Validates the summary privacy boundary independently of the legacy view's 2,000-row limit. */
export function isMicrosoft365LicenseSummaryView(value: unknown): value is Microsoft365LicenseSummaryView {
  if (
    !exact(value, [
      'schemaVersion',
      'marketCurrency',
      'tenantId',
      'generatedAt',
      'tenantSyncRunId',
      'coverage',
      'reportIdentity',
      'summary',
      'licenses',
      'pricingByCurrency',
      'pricing',
      'insights',
      'organization',
      'capabilities',
      'usage',
      'accountDetails',
      'pricingFacts',
      'pricingRevision',
    ]) ||
    value.schemaVersion !== 'microsoft-365-license-summary/v1' ||
    !identity(value) ||
    !accountDetails(value.accountDetails) ||
    !exact(value.reportIdentity, ['concealment', 'correlation']) ||
    !exact(value.summary, SUMMARY_KEYS) ||
    !exact(value.coverage, MICROSOFT_365_LICENSE_SOURCES) ||
    !Object.values(value.coverage).every(source => exact(source, COVERAGE_KEYS) && exact(source.recovery, ['action', 'optional'])) ||
    !list(
      value.licenses,
      2000,
      row =>
        exact(row, LICENSE_KEYS) &&
        optional(row.capabilities, productCapabilitiesPrivacy) &&
        optional(row.renewals, renewals =>
          list(renewals, 32, renewal => exact(renewal, ['status', 'isTrial', 'totalLicenses', 'nextLifecycleDateTime']))
        )
    ) ||
    !optional(value.organization, organization => exact(organization, ['displayName', 'defaultDomain'])) ||
    !optional(value.pricingFacts, isMicrosoft365PricingFacts) ||
    !optional(value.pricingRevision, isMicrosoft365PricingRevision) ||
    !optional(value.pricing, isMicrosoft365LicenseSummaryPricing) ||
    !optional(value.insights, summaryInsights) ||
    !optional(value.capabilities, summaryCapabilities)
  )
    return false;
  if (
    value.pricingByCurrency !== undefined &&
    (!record(value.pricingByCurrency) ||
      Object.keys(value.pricingByCurrency).length > 16 ||
      !Object.entries(value.pricingByCurrency).every(
        ([code, pricing]) => currency(code) && isMicrosoft365LicenseSummaryPricing(pricing) && pricing.currency === code
      ))
  )
    return false;
  let usage: Record<string, unknown> | undefined;
  if (value.usage !== undefined) {
    if (!record(value.usage)) return false;
    const { anonymousWorkloads: anonymous, ...aggregate } = value.usage;
    if (
      !isMicrosoft365UsageSummary(aggregate) ||
      !optional(anonymous, anonymousWorkloads) ||
      (anonymous !== undefined && aggregate.evidence !== 'identities_concealed')
    )
      return false;
    usage = aggregate;
  }
  // Reuse the existing aggregate validators without changing the legacy envelope or its limits.
  if (
    !isMicrosoft365LicenseView({
      ...value,
      schemaVersion: 'microsoft-365-license-view/v1',
      accounts: [],
      reports: { officeActiveUsers: [], officeAppUsage: [], copilotUsage: [] },
      pricing: undefined,
      pricingByCurrency: undefined,
      insights: undefined,
      capabilities: undefined,
      usage,
    })
  )
    return false;
  if (value.capabilities !== undefined) {
    const capabilities = value.capabilities as unknown as Microsoft365LicenseSummaryCapabilities;
    const skuIds = new Set((value.licenses as Microsoft365LicenseView['licenses']).map(row => row.skuId));
    const definitions = new Set(capabilities.definitions.map(row => row.id));
    if (
      !capabilities.summary.every(row => (row.includedSkuIds ?? []).every(id => skuIds.has(id))) ||
      !(value.licenses as Microsoft365LicenseView['licenses']).every(
        row =>
          (row.capabilities?.plans ?? []).every(plan => plan.capabilityId === null || definitions.has(plan.capabilityId)) &&
          (!row.capabilities?.comparison ||
            [...row.capabilities.comparison.addedCapabilityIds, ...row.capabilities.comparison.lostCapabilityIds].every(id => definitions.has(id)))
      ) ||
      // A step-up compares a held source product and replaces only held products; the target may come from the publisher catalogue.
      !(capabilities.stepUps ?? []).every(
        stepUp => skuIds.has(stepUp.fromSkuId) && stepUp.replacedProducts.every(product => skuIds.has(product.skuId))
      )
    )
      return false;
  }
  return true;
}

/** Validates up to 5,000 people and keeps findings/notices/prices within the returned account set. */
export function isMicrosoft365LicenseAccountsView(value: unknown): value is Microsoft365LicenseAccountsView {
  if (record(value) && !optional(value.pricingRevision, isMicrosoft365PricingRevision)) return false;
  if (
    !exact(value, [
      'schemaVersion',
      'tenantId',
      'generatedAt',
      'tenantSyncRunId',
      'accountDetails',
      'pricingRevision',
      'accounts',
      'insights',
      'capabilities',
      'pricing',
    ]) ||
    value.schemaVersion !== 'microsoft-365-license-accounts/v1' ||
    !identity(value) ||
    !accountDetails(value.accountDetails) ||
    !list(value.accounts, MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT, isMicrosoft365LicensedAccountRow) ||
    value.accounts.length !== value.accountDetails.returnedRowCount
  )
    return false;
  const accountIds = new Set((value.accounts as Microsoft365LicensedAccountRow[]).map(row => row.id));
  if (accountIds.size !== value.accounts.length) return false;
  if (
    !optional(
      value.insights,
      insights =>
        exact(insights, ['rulesVersion', 'findings']) &&
        text(insights.rulesVersion) &&
        list(insights.findings, 50000, finding => isMicrosoft365LicenseInsight(finding) && accountIds.has(finding.accountId))
    )
  )
    return false;
  if (
    !optional(
      value.capabilities,
      capabilities =>
        exact(capabilities, ['catalogueVersion', 'notices', 'observedNoticeCount', 'omittedNoticeCount']) &&
        text(capabilities.catalogueVersion) &&
        count(capabilities.observedNoticeCount) &&
        count(capabilities.omittedNoticeCount) &&
        list(
          capabilities.notices,
          50000,
          notice => isMicrosoft365CapabilityNotice(notice) && (notice.accountId === undefined || accountIds.has(notice.accountId))
        ) &&
        capabilities.observedNoticeCount === capabilities.notices.length + capabilities.omittedNoticeCount
    )
  )
    return false;
  return optional(
    value.pricing,
    pricing =>
      exact(pricing, ['currency', 'accountMonthlyCosts', 'paidAccountIds', 'partialAccountPriceIds', 'basis', 'projection']) &&
      optional(
        pricing.basis,
        basis => typeof basis === 'string' && ['list_price_estimate', 'customer_price_estimate', 'mixed_price_estimate'].includes(basis)
      ) &&
      optional(pricing.projection, isMicrosoft365PricingProjection) &&
      currency(pricing.currency) &&
      record(pricing.accountMonthlyCosts) &&
      Object.keys(pricing.accountMonthlyCosts).length <= MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT &&
      Object.entries(pricing.accountMonthlyCosts).every(
        ([id, amount]) => accountIds.has(id) && typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
      ) &&
      ['paidAccountIds', 'partialAccountPriceIds'].every(key =>
        optional(pricing[key], rows => ids(rows, MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT) && rows.every(id => accountIds.has(id)))
      )
  );
}
