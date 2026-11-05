import type {
  Microsoft365OptimizationAccountListRequest,
  Microsoft365OptimizationAccountListResponse,
  Microsoft365OptimizationAccountReadRequest,
  Microsoft365OptimizationAccountResponse,
  Microsoft365OptimizationCatalogue,
  Microsoft365OptimizationConfigurationInput,
  Microsoft365OptimizationConfigurationPreview,
  Microsoft365OptimizationConfigurationWriteRequest,
  Microsoft365OptimizationHistorySnapshot,
  Microsoft365OptimizationManagementResponse,
  Microsoft365OptimizationProjectionBinding,
  Microsoft365OptimizationSummaryResponse,
  Microsoft365PricingConfigurationDocument,
} from './microsoft365OptimizationManagement';
import { MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS as limits } from './microsoft365OptimizationManagement';
import {
  isMicrosoft365AgreementTerms,
  isMicrosoft365PricingOverride,
  isMicrosoft365PricingOverrides,
  isMicrosoft365PricingOverridesConfiguration,
  MICROSOFT365_AGREEMENT_CHANNELS,
} from './microsoft365PricingOverrides';
import {
  isMicrosoft365ObservedCommercialSubscription,
  isMicrosoft365OptimizationAccountDetail,
  isMicrosoft365OptimizationSummary,
} from './microsoft365OptimizationValidation';
import {
  type Row,
  row,
  keys,
  text,
  token,
  code,
  guid,
  count,
  nullableCount,
  choice,
  list,
  unique,
  identifiers,
  codes,
  date,
  timestamp,
  month,
  coverage,
  unitPrice,
} from './microsoft365OptimizationValidationShared';

const currency = (value: unknown): value is string => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
const scope = (value: Row): boolean => token(value.companyId) && guid(value.tenantId);
const snap = (value: Row): boolean => guid(value.tenantId) && token(value.tenantSyncRunId) && timestamp(value.generatedAt);
const frequencies = ['monthly', 'annual', 'upfront', 'unknown'];
const terms = ['monthly', 'annual', 'three_year', 'unknown'];
const frequencyPair = (value: Row): boolean =>
  choice(value.term, terms) && choice(value.billingFrequency, frequencies) && !(value.term === 'monthly' && value.billingFrequency === 'annual');
const revision = (value: unknown): boolean => text(value) && value.length <= 256;
const boundedBytes = (value: unknown, limit: number = limits.configurationBytes): boolean => {
  try {
    let bytes = 0;
    for (const character of JSON.stringify(value)) {
      const point = character.codePointAt(0)!;
      bytes += point < 0x80 ? 1 : point < 0x800 ? 2 : point < 0x10000 ? 3 : 4;
      if (bytes > limit) return false;
    }
    return true;
  } catch {
    return false;
  }
};
const recordedTerms = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['subscriptionId', 'skuId', 'term', 'billingFrequency', 'reductionOn', 'autoRenew']) &&
  token(value.subscriptionId) &&
  guid(value.skuId) &&
  frequencyPair(value) &&
  (value.reductionOn === null || date(value.reductionOn)) &&
  (value.autoRenew === null || typeof value.autoRenew === 'boolean');
const legacyPrice = (value: Row): Row => ({
  skuId: value.skuId,
  currency: value.currency,
  unitPriceMonthly: value.unitPriceMonthly,
  effectiveFrom: value.effectiveFrom,
  effectiveTo: value.effectiveTo,
  source: value.source,
});
const termPrice = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['skuId', 'currency', 'unitPriceMonthly', 'effectiveFrom', 'effectiveTo', 'source', 'subscriptionId', 'term', 'billingFrequency']) &&
  guid(value.skuId) &&
  (value.subscriptionId === null || token(value.subscriptionId)) &&
  frequencyPair(value) &&
  value.term !== 'unknown' &&
  value.billingFrequency !== 'unknown' &&
  (value.source === '' || text(value.source)) &&
  isMicrosoft365PricingOverride(legacyPrice(value));
const coverageScope = (value: unknown): boolean => {
  if (!row(value)) return false;
  if (value.kind === 'tenant') return keys(value, ['kind', 'unit']) && choice(value.unit, ['accounts', 'devices']);
  if (value.kind === 'accounts')
    return keys(value, ['kind', 'accountIds']) && identifiers(value.accountIds, limits.scopeIdentities) && value.accountIds.length > 0;
  return (
    value.kind === 'devices' &&
    keys(value, ['kind', 'identitySource', 'deviceIds']) &&
    choice(value.identitySource, ['entra', 'intune', 'customer']) &&
    identifiers(value.deviceIds, limits.scopeIdentities, value.identitySource === 'customer' ? token : guid) &&
    value.deviceIds.length > 0
  );
};
const protection = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['id', 'providerId', 'capabilityIds', 'scope', 'basis', 'observedAt', 'validUntil', 'sourceReference']) &&
  guid(value.id) &&
  code(value.providerId) &&
  codes(value.capabilityIds) &&
  value.capabilityIds.length > 0 &&
  coverageScope(value.scope) &&
  value.basis === 'customer_confirmed' &&
  timestamp(value.observedAt) &&
  (value.validUntil === null || (timestamp(value.validUntil) && Date.parse(value.validUntil) > Date.parse(value.observedAt))) &&
  (value.sourceReference === null || token(value.sourceReference));

/** Authenticated API validates inventory membership, source ownership and activation dates; this guard checks bounded authored input. */
export function isMicrosoft365OptimizationConfigurationInput(value: unknown): value is Microsoft365OptimizationConfigurationInput {
  if (
    !row(value) ||
    !keys(value, ['subscriptionTerms', 'termPrices', 'protectionCoverage']) ||
    !list(value.subscriptionTerms, limits.subscriptionTerms, recordedTerms) ||
    !unique(value.subscriptionTerms, item => String((item as Row).subscriptionId).toLowerCase()) ||
    !list(value.termPrices, limits.termPrices, termPrice) ||
    !list(value.protectionCoverage, limits.protectionCoverage, protection) ||
    !unique(value.protectionCoverage, item => String((item as Row).id).toLowerCase())
  )
    return false;
  const groups = new Map<string, Row[]>();
  const subscriptionSkus = new Map(
    (value.subscriptionTerms as Row[]).map(item => [String(item.subscriptionId).toLowerCase(), String(item.skuId).toLowerCase()])
  );
  for (const item of value.termPrices as Row[]) {
    const key = `${String(item.subscriptionId ?? '').toLowerCase()}|${item.term}|${item.billingFrequency}`;
    const group = groups.get(key) ?? [];
    group.push(legacyPrice(item));
    groups.set(key, group);
    if (item.subscriptionId !== null) {
      const id = String(item.subscriptionId).toLowerCase(),
        sku = String(item.skuId).toLowerCase();
      if (subscriptionSkus.has(id) && subscriptionSkus.get(id) !== sku) return false;
      subscriptionSkus.set(id, sku);
    }
  }
  return [...groups.values()].every(isMicrosoft365PricingOverrides) && boundedBytes(value);
}

/** Both versions are readable; existing v1 guard/allowlist stays unchanged. Reader adoption must precede the first v2 write. */
export function isMicrosoft365PricingConfigurationDocument(value: unknown): value is Microsoft365PricingConfigurationDocument {
  if (!row(value)) return false;
  if (value.schemaVersion === 'microsoft-365-pricing-overrides/v1') return isMicrosoft365PricingOverridesConfiguration(value) && boundedBytes(value);
  if (
    !keys(value, ['schemaVersion', 'companyId', 'tenantId', 'revision', 'overrides', 'updatedAt', 'updatedBy', 'agreementTerms', 'optimization']) ||
    value.schemaVersion !== 'microsoft-365-pricing-overrides/v2' ||
    !scope(value) ||
    !isMicrosoft365OptimizationConfigurationInput(value.optimization) ||
    !(value.updatedAt === null || timestamp(value.updatedAt)) ||
    !list(value.overrides, 1000, row)
  )
    return false;
  const legacy = {
    schemaVersion: 'microsoft-365-pricing-overrides/v1',
    tenantId: value.tenantId,
    revision: value.revision,
    overrides: value.overrides,
    updatedAt: value.updatedAt,
    ...(value.updatedBy === undefined ? {} : { updatedBy: value.updatedBy }),
    ...(value.agreementTerms === undefined ? {} : { agreementTerms: value.agreementTerms }),
  };
  return isMicrosoft365PricingOverridesConfiguration(legacy) && boundedBytes(value);
}

export function isMicrosoft365OptimizationConfigurationWriteRequest(value: unknown): value is Microsoft365OptimizationConfigurationWriteRequest {
  return (
    row(value) &&
    keys(value, ['schemaVersion', 'overrides', 'agreementTerms', 'optimization']) &&
    value.schemaVersion === 'microsoft-365-pricing-write/v2' &&
    list(value.overrides, 1000, row) &&
    isMicrosoft365PricingOverrides(value.overrides) &&
    (value.agreementTerms === undefined ||
      value.agreementTerms === null ||
      (row(value.agreementTerms) && isMicrosoft365AgreementTerms(value.agreementTerms))) &&
    isMicrosoft365OptimizationConfigurationInput(value.optimization) &&
    boundedBytes(value)
  );
}

const publisherUrl = (value: unknown): boolean => {
  if (!text(value)) return false;
  return /^https:\/\/(?:[a-z0-9-]+\.)*microsoft\.com(?:\/[^\s]*)?$/i.test(value);
};
const referenceOffer = (value: unknown): value is Row =>
  row(value) &&
  keys(value, [
    'id',
    'skuId',
    'countryCode',
    'currency',
    'term',
    'billingFrequency',
    'channel',
    'effectiveFrom',
    'effectiveTo',
    'monthlyPremiumAssumptionAllowed',
    'unitPriceMonthly',
    'confidence',
    'sourceUrl',
    'checkedAt',
  ]) &&
  token(value.id) &&
  guid(value.skuId) &&
  typeof value.countryCode === 'string' &&
  /^[A-Z]{2}$/.test(value.countryCode) &&
  currency(value.currency) &&
  frequencyPair(value) &&
  choice(value.channel, MICROSOFT365_AGREEMENT_CHANNELS) &&
  (value.effectiveFrom === null || date(value.effectiveFrom)) &&
  (value.effectiveTo === null || (date(value.effectiveTo) && (value.effectiveFrom === null || value.effectiveTo > value.effectiveFrom))) &&
  typeof value.monthlyPremiumAssumptionAllowed === 'boolean' &&
  (!value.monthlyPremiumAssumptionAllowed || (value.term === 'annual' && value.confidence === 'verified' && choice(value.channel, ['mca', 'csp']))) &&
  unitPrice(value.unitPriceMonthly) &&
  choice(value.confidence, ['verified', 'reference', 'unknown']) &&
  (value.checkedAt === null || timestamp(value.checkedAt)) &&
  (value.sourceUrl === null || publisherUrl(value.sourceUrl)) &&
  (value.unitPriceMonthly === null
    ? value.confidence === 'unknown'
    : value.confidence !== 'unknown' && value.sourceUrl !== null && value.checkedAt !== null);
export function isMicrosoft365OptimizationCatalogue(value: unknown): value is Microsoft365OptimizationCatalogue {
  if (
    !row(value) ||
    !keys(value, [
      'schemaVersion',
      'catalogueVersion',
      'coverage',
      'products',
      'capabilities',
      'servicePlans',
      'providers',
      'referenceOffers',
      'omittedProductCount',
      'omittedOfferCount',
    ]) ||
    value.schemaVersion !== 'microsoft-365-optimization-catalogue/v1' ||
    !token(value.catalogueVersion) ||
    !coverage(value.coverage) ||
    !count(value.omittedProductCount) ||
    !count(value.omittedOfferCount) ||
    !list(
      value.products,
      limits.catalogueProducts,
      item =>
        row(item) && keys(item, ['skuId', 'skuPartNumber', 'productName']) && guid(item.skuId) && text(item.skuPartNumber) && text(item.productName)
    ) ||
    !unique(value.products, item => String((item as Row).skuId).toLowerCase()) ||
    !list(
      value.capabilities,
      128,
      item => row(item) && keys(item, ['id', 'name', 'group']) && code(item.id) && text(item.name) && text(item.group)
    ) ||
    !unique(value.capabilities, item => (item as Row).id) ||
    !list(
      value.servicePlans,
      limits.catalogueServicePlans,
      item => row(item) && keys(item, ['servicePlanId', 'name']) && guid(item.servicePlanId) && text(item.name)
    ) ||
    !unique(value.servicePlans, item => String((item as Row).servicePlanId).toLowerCase()) ||
    !list(
      value.providers,
      128,
      item => row(item) && keys(item, ['id', 'name', 'capabilityIds']) && code(item.id) && text(item.name) && codes(item.capabilityIds)
    ) ||
    !unique(value.providers, item => (item as Row).id) ||
    !list(value.referenceOffers, limits.catalogueOffers, referenceOffer) ||
    !unique(value.referenceOffers, item => (item as Row).id)
  )
    return false;
  const products = new Set((value.products as Row[]).map(item => String(item.skuId).toLowerCase()));
  const capabilities = new Set((value.capabilities as Row[]).map(item => item.id));
  const intervals = new Map<string, Row[]>();
  for (const offer of value.referenceOffers as Row[]) {
    const key = [String(offer.skuId).toLowerCase(), offer.countryCode, offer.currency, offer.term, offer.billingFrequency, offer.channel].join('|');
    const group = intervals.get(key) ?? [];
    group.push(offer);
    intervals.set(key, group);
  }
  for (const group of intervals.values()) {
    group.sort((a, b) => String(a.effectiveFrom ?? '').localeCompare(String(b.effectiveFrom ?? '')));
    if (
      group.some(
        (offer, index) =>
          index > 0 &&
          (group[index - 1].effectiveTo === null ||
            offer.effectiveFrom === null ||
            String(group[index - 1].effectiveTo) > String(offer.effectiveFrom))
      )
    )
      return false;
  }
  return (
    boundedBytes(value, limits.catalogueBytes) &&
    (value.referenceOffers as Row[]).every(item => products.has(String(item.skuId).toLowerCase())) &&
    (value.providers as Row[]).every(item => (item.capabilityIds as string[]).every(id => capabilities.has(id))) &&
    (value.coverage.state !== 'complete' || (value.omittedProductCount === 0 && value.omittedOfferCount === 0))
  );
}

export function isMicrosoft365OptimizationManagementResponse(value: unknown): value is Microsoft365OptimizationManagementResponse {
  return (
    row(value) &&
    keys(value, [
      'schemaVersion',
      'companyId',
      'tenantId',
      'configuration',
      'catalogue',
      'subscriptions',
      'coverage',
      'omittedSubscriptionCount',
      'unavailableReason',
    ]) &&
    value.schemaVersion === 'microsoft-365-optimization-management/v1' &&
    scope(value) &&
    (value.unavailableReason === undefined || value.unavailableReason === 'invalid_configuration') &&
    isMicrosoft365PricingConfigurationDocument(value.configuration) &&
    value.configuration.tenantId === value.tenantId &&
    (!('companyId' in value.configuration) || value.configuration.companyId === value.companyId) &&
    isMicrosoft365OptimizationCatalogue(value.catalogue) &&
    list(value.subscriptions, 1000, isMicrosoft365ObservedCommercialSubscription) &&
    unique(value.subscriptions, item => String((item as Row).subscriptionId).toLowerCase()) &&
    coverage(value.coverage) &&
    count(value.omittedSubscriptionCount) &&
    boundedBytes(value, limits.managementResponseBytes) &&
    (value.coverage.state !== 'complete' || value.omittedSubscriptionCount === 0) &&
    (value.unavailableReason === undefined ||
      (value.configuration.schemaVersion === 'microsoft-365-pricing-overrides/v1' &&
        value.configuration.overrides.length === 0 &&
        value.configuration.updatedAt === null &&
        value.configuration.agreementTerms === undefined &&
        value.configuration.updatedBy == null))
  );
}

export function isMicrosoft365OptimizationConfigurationPreview(value: unknown): value is Microsoft365OptimizationConfigurationPreview {
  if (
    !row(value) ||
    !keys(value, ['schemaVersion', 'companyId', 'tenantId', 'revision', 'canSave', 'normalized', 'errors', 'warnings', 'summary']) ||
    value.schemaVersion !== 'microsoft-365-optimization-preview/v1' ||
    !scope(value) ||
    !revision(value.revision) ||
    !boundedBytes(value, limits.previewBytes) ||
    typeof value.canSave !== 'boolean' ||
    !(value.normalized === null || isMicrosoft365OptimizationConfigurationWriteRequest(value.normalized)) ||
    !list(
      value.errors,
      1000,
      item => row(item) && keys(item, ['path', 'code', 'message']) && text(item.path) && code(item.code) && text(item.message)
    ) ||
    !codes(value.warnings) ||
    !(
      value.summary === null ||
      (isMicrosoft365OptimizationSummary(value.summary) && value.summary.companyId === value.companyId && value.summary.tenantId === value.tenantId)
    )
  )
    return false;
  return value.canSave ? value.errors.length === 0 && value.normalized !== null : value.errors.length > 0 && value.summary === null;
}

/** Captures one scan's monthly observation. Only later completed months can become stable-demand history. */
export function isMicrosoft365OptimizationHistorySnapshot(value: unknown): value is Microsoft365OptimizationHistorySnapshot {
  return (
    row(value) &&
    keys(value, [
      'schemaVersion',
      'tenantId',
      'generatedAt',
      'tenantSyncRunId',
      'month',
      'catalogueVersion',
      'ruleVersion',
      'coverage',
      'subscriptions',
      'omittedSubscriptionCount',
      'quantities',
      'omittedProductCount',
    ]) &&
    value.schemaVersion === 'microsoft-365-optimization-history/v1' &&
    snap(value) &&
    month(value.month) &&
    token(value.catalogueVersion) &&
    token(value.ruleVersion) &&
    value.month === String(value.generatedAt).slice(0, 7) &&
    coverage(value.coverage) &&
    count(value.omittedSubscriptionCount) &&
    count(value.omittedProductCount) &&
    list(value.subscriptions, 1000, isMicrosoft365ObservedCommercialSubscription) &&
    (value.subscriptions as Row[]).every(
      item => String(item.observedAt).slice(0, 7) === value.month && Date.parse(String(item.observedAt)) <= Date.parse(String(value.generatedAt))
    ) &&
    unique(value.subscriptions, item => String((item as Row).subscriptionId).toLowerCase()) &&
    list(
      value.quantities,
      1000,
      item =>
        row(item) &&
        keys(item, ['skuId', 'assignedSeats', 'coverage']) &&
        guid(item.skuId) &&
        nullableCount(item.assignedSeats) &&
        coverage(item.coverage) &&
        (item.coverage.state !== 'complete' || count(item.assignedSeats))
    ) &&
    unique(value.quantities, item => String((item as Row).skuId).toLowerCase()) &&
    boundedBytes(value, limits.historyBytes) &&
    (value.coverage.state !== 'complete' ||
      (value.omittedSubscriptionCount === 0 &&
        value.omittedProductCount === 0 &&
        (value.quantities as Row[]).every(item => (item.coverage as Row).state === 'complete')))
  );
}

const bindingKeys = ['companyId', 'tenantId', 'generatedAt', 'tenantSyncRunId', 'currency', 'pricingRevision', 'contextRevision', 'catalogueVersion'];
export function isMicrosoft365OptimizationProjectionBinding(value: unknown): value is Microsoft365OptimizationProjectionBinding {
  return (
    row(value) &&
    keys(value, bindingKeys) &&
    scope(value) &&
    snap(value) &&
    (value.currency === null || currency(value.currency)) &&
    revision(value.pricingRevision) &&
    revision(value.contextRevision) &&
    token(value.catalogueVersion)
  );
}
export function isMicrosoft365OptimizationAccountReadRequest(value: unknown): value is Microsoft365OptimizationAccountReadRequest {
  return row(value) && keys(value, ['accountId', 'expected']) && guid(value.accountId) && isMicrosoft365OptimizationProjectionBinding(value.expected);
}
export function isMicrosoft365OptimizationAccountListRequest(value: unknown): value is Microsoft365OptimizationAccountListRequest {
  return (
    row(value) &&
    keys(value, ['findingId', 'pageIndex', 'expected']) &&
    (value.findingId === null || token(value.findingId)) &&
    count(value.pageIndex) &&
    value.pageIndex < limits.accountPages &&
    isMicrosoft365OptimizationProjectionBinding(value.expected)
  );
}
const listPage = (value: unknown): boolean => {
  if (
    !row(value) ||
    !keys(value, [
      ...bindingKeys,
      'schemaVersion',
      'coverage',
      'pageIndex',
      'pageCount',
      'pageAccountCounts',
      'observedAccountCount',
      'exactAccountCount',
      'findingId',
      'accounts',
    ]) ||
    value.schemaVersion !== 'microsoft-365-optimization-account-list/v1' ||
    !isMicrosoft365OptimizationProjectionBinding(Object.fromEntries(bindingKeys.map(key => [key, value[key]]))) ||
    !coverage(value.coverage) ||
    !count(value.pageIndex) ||
    !count(value.pageCount) ||
    !list(value.pageAccountCounts, limits.accountPages, item => count(item) && item <= limits.accountPageSize) ||
    !count(value.observedAccountCount) ||
    !nullableCount(value.exactAccountCount) ||
    (value.findingId !== null && !token(value.findingId)) ||
    !list(
      value.accounts,
      limits.accountPageSize,
      item =>
        row(item) &&
        keys(item, ['accountId', 'findings']) &&
        guid(item.accountId) &&
        list(
          item.findings,
          128,
          ref =>
            row(ref) &&
            keys(ref, ['findingId', 'kind', 'qualification']) &&
            token(ref.findingId) &&
            choice(ref.kind, ['combine_licenses', 'add_protection']) &&
            choice(ref.qualification, ['eligible', 'conditional', 'blocked'])
        ) &&
        (item.findings as unknown[]).length > 0 &&
        unique(item.findings as unknown[], ref => (ref as Row).findingId) &&
        (value.findingId === null || (item.findings as Row[]).some(ref => ref.findingId === value.findingId))
    ) ||
    !unique(value.accounts, item => String((item as Row).accountId).toLowerCase())
  )
    return false;
  return (
    boundedBytes(value, limits.accountListBytes) &&
    value.pageCount > 0 &&
    value.pageCount === value.pageAccountCounts.length &&
    value.pageIndex < value.pageCount &&
    value.accounts.length === value.pageAccountCounts[value.pageIndex] &&
    (value.pageAccountCounts as number[]).reduce((sum, count) => sum + count, 0) === value.observedAccountCount &&
    (value.exactAccountCount === null || value.exactAccountCount === value.observedAccountCount) &&
    (value.coverage.state !== 'complete' || value.exactAccountCount !== null) &&
    (value.observedAccountCount > 0 ? (value.pageAccountCounts as number[]).every(count => count > 0) : value.pageCount === 1)
  );
};
const notReady = (value: Row, version: string): boolean =>
  keys(value, ['schemaVersion', 'state', 'companyId', 'tenantId', 'reasonCodes', 'current']) &&
  value.schemaVersion === version &&
  choice(value.state, ['not_collected', 'stale', 'unavailable']) &&
  scope(value) &&
  codes(value.reasonCodes) &&
  value.reasonCodes.length > 0 &&
  (value.current === null ||
    (isMicrosoft365OptimizationProjectionBinding(value.current) &&
      value.current.companyId === value.companyId &&
      value.current.tenantId === value.tenantId));
export function isMicrosoft365OptimizationSummaryResponse(value: unknown): value is Microsoft365OptimizationSummaryResponse {
  if (!row(value)) return false;
  if (value.state !== 'ready') return notReady(value, 'microsoft-365-optimization-summary-response/v1');
  return (
    keys(value, ['schemaVersion', 'state', 'summary', 'catalogue']) &&
    value.schemaVersion === 'microsoft-365-optimization-summary-response/v1' &&
    isMicrosoft365OptimizationSummary(value.summary) &&
    isMicrosoft365OptimizationCatalogue(value.catalogue) &&
    value.summary.catalogueVersion === value.catalogue.catalogueVersion &&
    boundedBytes(value, limits.summaryResponseBytes)
  );
}
export function isMicrosoft365OptimizationAccountResponse(value: unknown): value is Microsoft365OptimizationAccountResponse {
  return (
    row(value) &&
    (value.state === 'ready'
      ? keys(value, ['schemaVersion', 'state', 'account']) &&
        value.schemaVersion === 'microsoft-365-optimization-account-response/v1' &&
        boundedBytes(value, limits.accountResponseBytes) &&
        isMicrosoft365OptimizationAccountDetail(value.account)
      : notReady(value, 'microsoft-365-optimization-account-response/v1'))
  );
}
export function isMicrosoft365OptimizationAccountListResponse(value: unknown): value is Microsoft365OptimizationAccountListResponse {
  return (
    row(value) &&
    (value.state === 'ready'
      ? keys(value, ['schemaVersion', 'state', 'page']) &&
        value.schemaVersion === 'microsoft-365-optimization-account-list-response/v1' &&
        listPage(value.page)
      : notReady(value, 'microsoft-365-optimization-account-list-response/v1'))
  );
}
