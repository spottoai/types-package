import type {
  Microsoft365AccountDisableEvidence,
  Microsoft365AccountLifecycle,
  Microsoft365ContentAvailability,
  Microsoft365LicensingContent,
  Microsoft365OneDriveStorage,
  Microsoft365RelatedSpendAmount,
  Microsoft365RelatedSpendCoverage,
  Microsoft365RelatedSpendMeter,
  Microsoft365RelatedSpendProduct,
  Microsoft365RelatedSpendView,
  Microsoft365SharePointStorage,
} from './microsoft365LicensingContent';
import { isMicrosoft365UsageDate } from './microsoft365Usage';

type Row = Record<string, unknown>;
type Check = (value: unknown) => boolean;
const record = (value: unknown): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const exact = (value: unknown, keys: readonly string[]): value is Row => record(value) && Object.keys(value).every(key => keys.includes(key));
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nullable = (value: unknown, check: Check): boolean => value === null || check(value);
const optional = (value: unknown, check: Check): boolean => value === undefined || check(value);
const list = (value: unknown, limit: number, check: Check): value is unknown[] => Array.isArray(value) && value.length <= limit && value.every(check);
const strings = (value: unknown): value is string[] => list(value, 128, text);
const unique = (values: readonly unknown[]): boolean => new Set(values).size === values.length;
const fields = (value: Row, keys: readonly string[], check: Check): boolean => keys.every(key => check(value[key]));
const nullableCount = (value: unknown): boolean => nullable(value, count);
const nullableText = (value: unknown): boolean => nullable(value, text);
const timestamp = (value: unknown): value is string => text(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const nullableTimestamp = (value: unknown): boolean => nullable(value, timestamp);
const nullableDay = (value: unknown): boolean => nullable(value, isMicrosoft365UsageDate);
const boolean = (value: unknown): value is boolean => typeof value === 'boolean';
const https = (value: unknown): boolean => typeof value === 'string' && value.length <= 2048 && /^https:\/\/[^\s]+$/i.test(value);
const orderedWindow = (from: string, to: string): boolean => Date.parse(from) <= Date.parse(to);
const oneOf = (value: unknown, values: readonly string[]): value is string => typeof value === 'string' && values.includes(value);
const billingText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 2048;

/** Source availability is not a claim that every account or every date has evidence. */
export function isMicrosoft365ContentAvailability(value: unknown): value is Microsoft365ContentAvailability {
  return (
    exact(value, ['state', 'reasonCodes', 'requiredPermissions', 'observedAt']) &&
    oneOf(value.state, ['available', 'partial', 'unavailable']) &&
    strings(value.reasonCodes) &&
    strings(value.requiredPermissions) &&
    nullableTimestamp(value.observedAt)
  );
}

function storageContribution(value: unknown): boolean {
  return (
    exact(value, ['skuPartNumber', 'purchasedUnits', 'assignedUnits', 'bytesPerUnit', 'contributionBytes', 'unassignedContributionBytes', 'unit']) &&
    text(value.skuPartNumber) &&
    fields(value, ['purchasedUnits', 'bytesPerUnit', 'contributionBytes'], count) &&
    fields(value, ['assignedUnits', 'unassignedContributionBytes'], nullableCount) &&
    (value.unit === 'seat' || value.unit === 'gb')
  );
}

function storageSite(value: unknown): boolean {
  return (
    exact(value, ['siteId', 'siteUrl', 'usedBytes', 'allocatedBytes', 'isDeleted', 'lastActivityDate']) &&
    nullableText(value.siteId) &&
    nullable(value.siteUrl, https) &&
    count(value.usedBytes) &&
    nullableCount(value.allocatedBytes) &&
    nullable(value.isDeleted, boolean) &&
    nullableDay(value.lastActivityDate)
  );
}

export function isMicrosoft365SharePointStorage(value: unknown): value is Microsoft365SharePointStorage {
  if (!exact(value, ['usage', 'sites', 'entitlement'])) return false;
  const { usage, sites, entitlement } = value;
  if (
    !exact(usage, ['availability', 'reportRefreshDate', 'latestReportDate', 'totalUsedBytes', 'trend', 'omittedTrendCount']) ||
    !isMicrosoft365ContentAvailability(usage.availability) ||
    !fields(usage, ['reportRefreshDate', 'latestReportDate'], nullableDay) ||
    !nullableCount(usage.totalUsedBytes) ||
    !count(usage.omittedTrendCount) ||
    !list(usage.trend, 180, point => exact(point, ['date', 'usedBytes']) && isMicrosoft365UsageDate(point.date) && count(point.usedBytes))
  )
    return false;
  const dates = usage.trend.map(point => (point as Row).date);
  if (
    usage.totalUsedBytes !== null &&
    (usage.availability.state === 'unavailable' || usage.availability.reasonCodes.some(reason => reason !== 'trend_detail_limit'))
  )
    return false;
  if (!unique(dates) || dates.some((day, index) => index > 0 && String(day) <= String(dates[index - 1]))) return false;
  if (
    !exact(sites, [
      'availability',
      'rows',
      'observedSiteCount',
      'activeSiteCount',
      'deletedSiteCount',
      'unknownDeletedSiteCount',
      'activeUsedBytes',
      'omittedSiteCount',
      'identitiesVisible',
    ]) ||
    !isMicrosoft365ContentAvailability(sites.availability) ||
    !list(sites.rows, 100, storageSite) ||
    !fields(sites, ['observedSiteCount', 'activeSiteCount', 'deletedSiteCount', 'unknownDeletedSiteCount', 'activeUsedBytes'], nullableCount) ||
    !count(sites.omittedSiteCount) ||
    !boolean(sites.identitiesVisible)
  )
    return false;
  if (!sites.identitiesVisible && sites.rows.some(site => (site as Row).siteId !== null || (site as Row).siteUrl !== null)) return false;
  const validEntitlement =
    exact(entitlement, [
      'availability',
      'ruleVersion',
      'ruleSource',
      'baseBytes',
      'seatContributionBytes',
      'additionalStorageBytes',
      'knownEntitlementBytes',
      'calculatedEntitlementBytes',
      'authoritativeQuotaBytes',
      'unknownSkuPartNumbers',
      'omittedUnknownSkuCount',
      'contributions',
      'omittedContributionCount',
    ]) &&
    isMicrosoft365ContentAvailability(entitlement.availability) &&
    text(entitlement.ruleVersion) &&
    https(entitlement.ruleSource) &&
    fields(
      entitlement,
      ['baseBytes', 'seatContributionBytes', 'additionalStorageBytes', 'knownEntitlementBytes', 'calculatedEntitlementBytes'],
      nullableCount
    ) &&
    entitlement.authoritativeQuotaBytes === null &&
    list(entitlement.unknownSkuPartNumbers, 200, text) &&
    count(entitlement.omittedUnknownSkuCount) &&
    list(entitlement.contributions, 200, storageContribution) &&
    count(entitlement.omittedContributionCount);
  if (!validEntitlement) return false;
  const result = entitlement as unknown as Microsoft365SharePointStorage['entitlement'];
  if (
    result.knownEntitlementBytes !== null &&
    (result.seatContributionBytes === null ||
      result.additionalStorageBytes === null ||
      result.knownEntitlementBytes !== (result.baseBytes ?? 0) + result.seatContributionBytes + result.additionalStorageBytes)
  )
    return false;
  return (
    result.calculatedEntitlementBytes === null ||
    (result.calculatedEntitlementBytes === result.knownEntitlementBytes &&
      result.availability.state !== 'unavailable' &&
      result.availability.reasonCodes.every(reason => reason === 'sku_detail_limit') &&
      result.unknownSkuPartNumbers.length === 0 &&
      result.omittedUnknownSkuCount === 0)
  );
}

export function isMicrosoft365OneDriveStorage(value: unknown): value is Microsoft365OneDriveStorage {
  if (!exact(value, ['aggregate', 'detail', 'reconciliation'])) return false;
  const { aggregate, detail, reconciliation } = value;
  if (
    !exact(aggregate, ['availability', 'reportRefreshDate', 'latestReportDate', 'series', 'totalUsedBytes', 'observedLatestUsedBytes']) ||
    !isMicrosoft365ContentAvailability(aggregate.availability) ||
    !fields(aggregate, ['reportRefreshDate', 'latestReportDate'], nullableDay) ||
    !(aggregate.series === null || aggregate.series === 'All' || aggregate.series === 'OneDrive') ||
    !fields(aggregate, ['totalUsedBytes', 'observedLatestUsedBytes'], nullableCount)
  )
    return false;
  if (
    !exact(detail, [
      'availability',
      'reportRefreshDate',
      'observedAccountCount',
      'activeAccountCount',
      'deletedAccountCount',
      'unknownDeletedAccountCount',
      'duplicateSiteIdCount',
      'invalidRowCount',
      'activeUsedBytes',
      'observedActiveUsedBytes',
    ]) ||
    !isMicrosoft365ContentAvailability(detail.availability) ||
    !nullableDay(detail.reportRefreshDate) ||
    !fields(
      detail,
      [
        'observedAccountCount',
        'activeAccountCount',
        'deletedAccountCount',
        'unknownDeletedAccountCount',
        'duplicateSiteIdCount',
        'invalidRowCount',
        'activeUsedBytes',
        'observedActiveUsedBytes',
      ],
      nullableCount
    )
  )
    return false;
  if (
    !exact(reconciliation, ['availability', 'state', 'reasonCodes', 'deltaBytes']) ||
    !isMicrosoft365ContentAvailability(reconciliation.availability) ||
    !strings(reconciliation.reasonCodes)
  )
    return false;
  if (reconciliation.state === 'not_comparable') return reconciliation.deltaBytes === null && reconciliation.availability.state === 'unavailable';
  if (
    !oneOf(reconciliation.state, ['matched', 'mismatch']) ||
    !finite(reconciliation.deltaBytes) ||
    !Number.isSafeInteger(reconciliation.deltaBytes) ||
    !count(aggregate.totalUsedBytes) ||
    !count(detail.activeUsedBytes) ||
    aggregate.availability.state !== 'available' ||
    detail.availability.state !== 'available' ||
    aggregate.reportRefreshDate === null ||
    aggregate.reportRefreshDate !== detail.reportRefreshDate ||
    aggregate.latestReportDate !== detail.reportRefreshDate ||
    reconciliation.deltaBytes !== detail.activeUsedBytes - aggregate.totalUsedBytes
  )
    return false;
  return reconciliation.state === 'matched'
    ? reconciliation.deltaBytes === 0 && reconciliation.availability.state === 'available'
    : reconciliation.deltaBytes !== 0 && reconciliation.availability.state === 'partial';
}

/** Known dates prove an observed Entra disable transition, not departure or license-removal safety. */
export function isMicrosoft365AccountDisableEvidence(value: unknown): value is Microsoft365AccountDisableEvidence {
  if (
    !exact(value, ['accountId', 'accountEnabled', 'disabledAt', 'disabledAtStatus', 'reasonCodes', 'evidence']) ||
    !text(value.accountId) ||
    !nullable(value.accountEnabled, boolean) ||
    !strings(value.reasonCodes)
  )
    return false;
  if (value.disabledAtStatus === 'known')
    return (
      value.accountEnabled === false &&
      timestamp(value.disabledAt) &&
      exact(value.evidence, ['source', 'auditEventId', 'observedAt']) &&
      value.evidence.source === 'entra_directory_audit' &&
      text(value.evidence.auditEventId) &&
      nullableTimestamp(value.evidence.observedAt)
    );
  return (
    value.disabledAt === null &&
    value.evidence === null &&
    (value.disabledAtStatus === 'not_disabled'
      ? value.accountEnabled === true
      : value.disabledAtStatus === 'unknown' && value.accountEnabled !== true)
  );
}

export function isMicrosoft365AccountLifecycle(value: unknown): value is Microsoft365AccountLifecycle {
  if (
    !exact(value, ['scope', 'availability', 'auditHistory', 'accounts']) ||
    value.scope !== 'observed_directory_users' ||
    !isMicrosoft365ContentAvailability(value.availability) ||
    !exact(value.auditHistory, ['availability', 'requestedFrom', 'requestedTo', 'retentionLimited']) ||
    !isMicrosoft365ContentAvailability(value.auditHistory.availability) ||
    !timestamp(value.auditHistory.requestedFrom) ||
    !timestamp(value.auditHistory.requestedTo) ||
    !orderedWindow(value.auditHistory.requestedFrom, value.auditHistory.requestedTo) ||
    value.auditHistory.retentionLimited !== true ||
    !Array.isArray(value.accounts) ||
    !value.accounts.every(isMicrosoft365AccountDisableEvidence)
  )
    return false;
  const accounts = value.accounts as Microsoft365AccountDisableEvidence[];
  const auditAvailability = value.auditHistory.availability;
  const requestedFrom = value.auditHistory.requestedFrom;
  const requestedTo = value.auditHistory.requestedTo;
  return (
    unique(accounts.map(account => account.accountId.trim().toLowerCase())) &&
    accounts.every(
      account =>
        account.disabledAtStatus !== 'known' ||
        (account.disabledAt !== null &&
          auditAvailability.state === 'available' &&
          orderedWindow(requestedFrom, account.disabledAt) &&
          orderedWindow(account.disabledAt, requestedTo))
    )
  );
}

/** Billing corrections may be negative. Unknown amounts stay null, independently for each basis. */
export function isMicrosoft365RelatedSpendAmount(value: unknown): value is Microsoft365RelatedSpendAmount {
  if (!exact(value, ['amount', 'state', 'reasonCodes']) || !strings(value.reasonCodes)) return false;
  if (value.state === 'unavailable') return value.amount === null;
  return (value.state === 'complete' || value.state === 'partial') && finite(value.amount);
}

export function isMicrosoft365RelatedSpendMeter(value: unknown): value is Microsoft365RelatedSpendMeter {
  return (
    exact(value, ['meterId', 'meterName', 'unit', 'quantity', 'quantityState', 'firstDate', 'lastDate', 'rowCount']) &&
    nullable(value.meterId, billingText) &&
    typeof value.meterName === 'string' &&
    value.meterName.length <= 2048 &&
    nullable(value.unit, billingText) &&
    isMicrosoft365UsageDate(value.firstDate) &&
    isMicrosoft365UsageDate(value.lastDate) &&
    value.firstDate <= value.lastDate &&
    count(value.rowCount) &&
    (value.quantityState === 'unavailable'
      ? value.quantity === null
      : (value.quantityState === 'complete' || value.quantityState === 'partial') && value.unit !== null && finite(value.quantity))
  );
}

export function isMicrosoft365RelatedSpendProduct(value: unknown): value is Microsoft365RelatedSpendProduct {
  return (
    exact(value, ['category', 'billed', 'amortized', 'matchedRowCount', 'meters']) &&
    oneOf(value.category, ['github-copilot-seats', 'github-copilot-consumption', 'github-other', 'copilot-studio', 'fabric-ai']) &&
    isMicrosoft365RelatedSpendAmount(value.billed) &&
    isMicrosoft365RelatedSpendAmount(value.amortized) &&
    count(value.matchedRowCount) &&
    list(value.meters, 100000, isMicrosoft365RelatedSpendMeter)
  );
}

export function isMicrosoft365RelatedSpendCoverage(value: unknown): value is Microsoft365RelatedSpendCoverage {
  const valid =
    exact(value, [
      'subscriptionId',
      'state',
      'recordsState',
      'observedAt',
      'sourceEtag',
      'sourceFile',
      'billingGenerationId',
      'sourceRunId',
      'reasonCodes',
      'sourceRowCount',
      'retainedRowCount',
      'matchedRowCount',
      'inWindowRowCount',
      'invalidRowCount',
      'outsideWindowRowCount',
      'excludedEstimatedRowCount',
    ]) &&
    text(value.subscriptionId) &&
    oneOf(value.state, ['complete', 'partial', 'unavailable', 'failed']) &&
    oneOf(value.recordsState, ['loaded', 'missing']) &&
    nullableTimestamp(value.observedAt) &&
    fields(value, ['sourceEtag', 'sourceFile', 'billingGenerationId', 'sourceRunId'], item => optional(item, text)) &&
    strings(value.reasonCodes) &&
    fields(value, ['sourceRowCount', 'retainedRowCount'], nullableCount) &&
    fields(value, ['matchedRowCount', 'inWindowRowCount', 'invalidRowCount', 'outsideWindowRowCount', 'excludedEstimatedRowCount'], count);
  if (!valid) return false;
  const source = value as unknown as Microsoft365RelatedSpendCoverage;
  return (
    (source.sourceRowCount === null || source.retainedRowCount === null || source.retainedRowCount <= source.sourceRowCount) &&
    (source.retainedRowCount === null || source.matchedRowCount <= source.retainedRowCount) &&
    source.inWindowRowCount <= source.matchedRowCount &&
    source.outsideWindowRowCount <= source.matchedRowCount &&
    source.excludedEstimatedRowCount <= source.matchedRowCount
  );
}

export function isMicrosoft365RelatedSpendView(value: unknown): value is Microsoft365RelatedSpendView {
  if (
    !exact(value, ['generatedAt', 'window', 'availability', 'currencies', 'subscriptions']) ||
    !timestamp(value.generatedAt) ||
    !exact(value.window, ['startDate', 'endDate']) ||
    !isMicrosoft365UsageDate(value.window.startDate) ||
    !isMicrosoft365UsageDate(value.window.endDate) ||
    value.window.startDate > value.window.endDate ||
    !isMicrosoft365ContentAvailability(value.availability) ||
    !list(value.subscriptions, 100, isMicrosoft365RelatedSpendCoverage) ||
    !unique(
      value.subscriptions.map(source =>
        String((source as Row).subscriptionId)
          .trim()
          .toLowerCase()
      )
    ) ||
    !Array.isArray(value.currencies) ||
    value.currencies.length > 17576
  )
    return false;
  let meters = 0;
  const startDate = value.window.startDate;
  const endDate = value.window.endDate;
  const subscriptions = value.subscriptions as Microsoft365RelatedSpendCoverage[];
  const loaded = subscriptions.filter(source => source.recordsState === 'loaded' && (source.state === 'complete' || source.state === 'partial'));
  if (!loaded.length && (value.availability.state !== 'unavailable' || value.currencies.length > 0)) return false;
  if (loaded.length && value.availability.state === 'unavailable') return false;
  const incompleteScopes = subscriptions.some(
    source =>
      source.state !== 'complete' ||
      source.recordsState !== 'loaded' ||
      source.reasonCodes.some(reason => !['missing_billed_amount', 'missing_amortized_amount'].includes(reason))
  );
  if (value.availability.state === 'available' && (incompleteScopes || value.availability.reasonCodes.length > 0)) return false;
  const currencies = new Set<string>();
  for (const group of value.currencies) {
    if (
      !exact(group, ['currency', 'products']) ||
      typeof group.currency !== 'string' ||
      !/^[A-Z]{3}$/.test(group.currency) ||
      currencies.has(group.currency) ||
      !list(group.products, 5, isMicrosoft365RelatedSpendProduct) ||
      !unique(group.products.map(product => (product as Row).category))
    )
      return false;
    currencies.add(group.currency);
    for (const product of group.products as Microsoft365RelatedSpendProduct[]) {
      meters += product.meters.length;
      if (
        incompleteScopes &&
        (product.billed.state === 'complete' ||
          product.amortized.state === 'complete' ||
          product.meters.some(meter => meter.quantityState === 'complete'))
      )
        return false;
      if (meters > 100000 || product.meters.some(meter => meter.firstDate < startDate || meter.lastDate > endDate)) return false;
    }
  }
  return true;
}

/** This artifact includes person-level rows and subscription spend: consumers must authorize both scopes. */
export function isMicrosoft365LicensingContent(value: unknown): value is Microsoft365LicensingContent {
  if (
    !exact(value, [
      'schemaVersion',
      'tenantId',
      'tenantSyncRunId',
      'generatedAt',
      'graphCollection',
      'licenseEvidence',
      'measures',
      'sharePoint',
      'oneDrive',
      'accountLifecycle',
      'relatedSpend',
      'expectedSubscriptionCount',
      'omittedSubscriptionCount',
      'billingScope',
    ]) ||
    value.schemaVersion !== 'microsoft-365-licensing-content/v1' ||
    !text(value.tenantId) ||
    !text(value.tenantSyncRunId) ||
    !timestamp(value.generatedAt) ||
    !oneOf(value.graphCollection, ['attempted', 'disabled']) ||
    !exact(value.licenseEvidence, ['generatedAt', 'tenantSyncRunId']) ||
    !nullableTimestamp(value.licenseEvidence.generatedAt) ||
    !nullableText(value.licenseEvidence.tenantSyncRunId) ||
    (value.licenseEvidence.tenantSyncRunId !== null && value.licenseEvidence.tenantSyncRunId !== value.tenantSyncRunId) ||
    !record(value.measures) ||
    Object.keys(value.measures).length > 64 ||
    !Object.entries(value.measures).every(
      ([name, availability]) => /^[a-z][a-zA-Z0-9]{0,95}$/.test(name) && isMicrosoft365ContentAvailability(availability)
    ) ||
    !isMicrosoft365SharePointStorage(value.sharePoint) ||
    !isMicrosoft365OneDriveStorage(value.oneDrive) ||
    !isMicrosoft365AccountLifecycle(value.accountLifecycle) ||
    !isMicrosoft365RelatedSpendView(value.relatedSpend) ||
    value.relatedSpend.generatedAt !== value.generatedAt ||
    !count(value.expectedSubscriptionCount) ||
    !count(value.omittedSubscriptionCount) ||
    value.expectedSubscriptionCount !== value.relatedSpend.subscriptions.length + value.omittedSubscriptionCount ||
    value.billingScope !== 'scan_subscription_set'
  )
    return false;
  if (
    value.omittedSubscriptionCount > 0 &&
    (value.relatedSpend.availability.state === 'available' ||
      !value.relatedSpend.availability.reasonCodes.includes('subscription_limit') ||
      value.relatedSpend.currencies.some(group =>
        group.products.some(
          product =>
            product.billed.state === 'complete' ||
            product.amortized.state === 'complete' ||
            product.meters.some(meter => meter.quantityState === 'complete')
        )
      ))
  )
    return false;
  return orderedWindow(value.accountLifecycle.auditHistory.requestedTo, value.generatedAt);
}
