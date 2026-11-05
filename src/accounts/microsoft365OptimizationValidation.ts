import type {
  Microsoft365CommercialSubscription,
  Microsoft365OptimizationAccountDetail,
  Microsoft365OptimizationCohortEvidence,
  Microsoft365OptimizationEvidence,
  Microsoft365OptimizationSummary,
} from './microsoft365Optimization';
import { MICROSOFT365_AGREEMENT_CHANNELS } from './microsoft365PricingOverrides';

import {
  Row,
  row,
  keys,
  text,
  token,
  code,
  guid,
  count,
  nullableCount,
  minorUnits,
  amount,
  money,
  unitPrice,
  choice,
  list,
  unique,
  identifiers,
  codes,
  date,
  timestamp,
  month,
  currentHistory,
  coverage,
  byKind,
  consistentCoverage,
} from './microsoft365OptimizationValidationShared';

const qualification = (value: Row): boolean =>
  codes(value.blockedBy) &&
  (value.qualification === 'eligible'
    ? value.blockedBy.length === 0
    : choice(value.qualification, ['conditional', 'blocked']) && value.blockedBy.length > 0);
const snapshotKeys = ['schemaVersion', 'tenantId', 'generatedAt', 'tenantSyncRunId'];
const snapshot = (value: Row): boolean => guid(value.tenantId) && timestamp(value.generatedAt) && token(value.tenantSyncRunId);
const projectionKeys = [
  ...snapshotKeys,
  'companyId',
  'pricingRevision',
  'contextRevision',
  'catalogueVersion',
  'projectedAt',
  'currency',
  'coverage',
];
const projection = (value: Row): boolean =>
  snapshot(value) &&
  token(value.companyId) &&
  text(value.pricingRevision) &&
  value.pricingRevision.length <= 256 &&
  text(value.contextRevision) &&
  value.contextRevision.length <= 256 &&
  token(value.catalogueVersion) &&
  timestamp(value.projectedAt) &&
  Date.parse(value.projectedAt) >= Date.parse(String(value.generatedAt)) &&
  (value.currency === null || (typeof value.currency === 'string' && /^[A-Z]{3}$/.test(value.currency))) &&
  coverage(value.coverage);
const timing = (value: unknown): boolean =>
  row(value) &&
  keys(value, ['date', 'source', 'confirmed']) &&
  (value.date === null || date(value.date)) &&
  choice(value.source, ['recorded', 'billing', 'lifecycle', 'unknown']) &&
  typeof value.confirmed === 'boolean' &&
  (value.date === null ? value.source === 'unknown' && !value.confirmed : value.source !== 'unknown') &&
  (!value.confirmed || choice(value.source, ['recorded', 'billing']));
const term = (value: unknown): boolean => choice(value, ['monthly', 'annual', 'three_year']);
const frequency = (value: unknown): boolean => choice(value, ['monthly', 'annual', 'upfront', 'unknown']);

/** Shape/provenance guard only. Applications prove source identity, authenticity, RBAC, source joins and commercial rules. */
export function isMicrosoft365CommercialSubscription(value: unknown): value is Microsoft365CommercialSubscription {
  if (
    !row(value) ||
    !keys(value, [
      'subscriptionId',
      'skuId',
      'quantity',
      'term',
      'billingFrequency',
      'termSource',
      'observedAt',
      'nextLifecycleAt',
      'reductionTiming',
      'inference',
      'conflicts',
      'autoRenew',
    ]) ||
    !token(value.subscriptionId) ||
    !guid(value.skuId) ||
    !nullableCount(value.quantity) ||
    !(term(value.term) || value.term === 'unknown') ||
    !frequency(value.billingFrequency) ||
    !choice(value.termSource, ['recorded', 'billing', 'inferred', 'unknown']) ||
    (value.term === 'unknown') !== (value.termSource === 'unknown') ||
    !timestamp(value.observedAt) ||
    !(value.nextLifecycleAt === null || timestamp(value.nextLifecycleAt)) ||
    !timing(value.reductionTiming) ||
    !(value.autoRenew === null || typeof value.autoRenew === 'boolean') ||
    (value.term === 'monthly' && value.billingFrequency === 'annual') ||
    !list(
      value.conflicts,
      3,
      item =>
        row(item) &&
        keys(item, ['source', 'term', 'billingFrequency']) &&
        choice(item.source, ['recorded', 'billing', 'inferred']) &&
        term(item.term) &&
        frequency(item.billingFrequency) &&
        !(item.term === 'monthly' && item.billingFrequency === 'annual')
    ) ||
    !unique(value.conflicts, item => (item as Row).source)
  )
    return false;
  if (value.termSource !== 'inferred') return value.inference === null;
  const inference = value.inference;
  return (
    row(inference) &&
    keys(inference, ['method', 'confidence', 'observationMonths']) &&
    inference.method === 'renewal_history' &&
    inference.confidence === 'inferred' &&
    identifiers(inference.observationMonths, 13, month) &&
    inference.observationMonths.length >= 2 &&
    inference.observationMonths.every(
      (item, index) => item <= String(value.observedAt).slice(0, 7) && (index === 0 || item > (inference.observationMonths as string[])[index - 1])
    )
  );
}

export function isMicrosoft365ObservedCommercialSubscription(
  value: unknown
): value is import('./microsoft365Optimization').Microsoft365ObservedCommercialSubscription {
  return (
    isMicrosoft365CommercialSubscription(value) &&
    value.termSource !== 'recorded' &&
    value.reductionTiming.source !== 'recorded' &&
    value.conflicts.every(conflict => conflict.source !== 'recorded')
  );
}

const action = (value: Row): boolean =>
  choice(value.mode, ['replace', 'add_on']) &&
  identifiers(value.fromSkuIds, 32) &&
  identifiers(value.toSkuIds, 32) &&
  value.toSkuIds.length > 0 &&
  (value.mode === 'add_on' ? value.fromSkuIds.length === 0 : value.fromSkuIds.length > 0) &&
  value.fromSkuIds.every(id => !(value.toSkuIds as string[]).some(target => target.toLowerCase() === id.toLowerCase())) &&
  qualification(value) &&
  codes(value.requiredCapabilityIds) &&
  codes(value.gainedCapabilityIds) &&
  identifiers(value.lostServicePlanIds) &&
  identifiers(value.unverifiedServicePlanIds) &&
  (value.qualification !== 'eligible' || (value.lostServicePlanIds.length === 0 && value.unverifiedServicePlanIds.length === 0));
const candidate = (value: unknown): value is Row =>
  row(value) &&
  keys(value, [
    'id',
    'kind',
    'mode',
    'fromSkuIds',
    'toSkuIds',
    'qualification',
    'blockedBy',
    'requiredCapabilityIds',
    'gainedCapabilityIds',
    'lostServicePlanIds',
    'unverifiedServicePlanIds',
  ]) &&
  token(value.id) &&
  action(value) &&
  (value.kind === 'add_protection' || (value.kind === 'combine_licenses' && value.mode === 'replace' && (value.fromSkuIds as unknown[]).length >= 2));
const subjectEvidence = (value: unknown, identity: 'account' | 'cohort'): value is Row => {
  if (
    !row(value) ||
    !keys(value, [
      ...(identity === 'account' ? ['accountId', 'cohortId'] : ['id', 'accountCount']),
      'heldSkuIds',
      'reviewDisposition',
      'privilege',
      'mfaRegistration',
      'coverage',
      'protection',
      'candidates',
      'omittedCandidateCount',
    ]) ||
    (identity === 'account'
      ? !guid(value.accountId) || !token(value.cohortId)
      : !token(value.id) || !count(value.accountCount) || value.accountCount === 0) ||
    !identifiers(value.heldSkuIds) ||
    !choice(value.reviewDisposition, ['retained', 'review_first']) ||
    !choice(value.privilege, ['observed', 'not_observed', 'unknown']) ||
    !choice(value.mfaRegistration, ['capable', 'not_capable', 'unknown']) ||
    !coverage(value.coverage) ||
    !count(value.omittedCandidateCount) ||
    !list(
      value.protection,
      128,
      item =>
        row(item) &&
        keys(item, ['capabilityId', 'rights', 'deployment']) &&
        code(item.capabilityId) &&
        choice(item.rights, ['included', 'missing', 'unknown']) &&
        choice(item.deployment, ['observed', 'not_observed', 'unknown'])
    ) ||
    !unique(value.protection, item => (item as Row).capabilityId) ||
    !list(value.candidates, 16, candidate) ||
    !unique(value.candidates, item => (item as Row).id)
  )
    return false;
  if (value.omittedCandidateCount > 0 && value.coverage.state === 'complete') return false;
  const held = new Set(value.heldSkuIds.map(id => id.toLowerCase()));
  return value.candidates.every(item => {
    const current = item as Row;
    return (
      (current.fromSkuIds as string[]).every(id => held.has(id.toLowerCase())) &&
      (current.toSkuIds as string[]).every(id => !held.has(id.toLowerCase())) &&
      (value.reviewDisposition === 'retained' || current.qualification !== 'eligible')
    );
  });
};
const demand = (value: unknown, generatedAt: string): value is Row => {
  if (
    !row(value) ||
    !keys(value, ['skuId', 'basis', 'coverage', 'currentAssignedSeats', 'observations']) ||
    !guid(value.skuId) ||
    value.basis !== 'monthly_observations' ||
    !coverage(value.coverage) ||
    !nullableCount(value.currentAssignedSeats) ||
    !list(
      value.observations,
      6,
      item =>
        row(item) &&
        keys(item, ['month', 'assignedSeats', 'complete']) &&
        month(item.month) &&
        item.month < generatedAt.slice(0, 7) &&
        nullableCount(item.assignedSeats) &&
        typeof item.complete === 'boolean' &&
        (!item.complete || count(item.assignedSeats))
    ) ||
    !unique(value.observations, item => (item as Row).month)
  )
    return false;
  const observations = value.observations as Row[];
  return (
    observations.every((item, index) => index === 0 || String(observations[index - 1].month) < String(item.month)) &&
    (value.coverage.state !== 'complete' ||
      (count(value.currentAssignedSeats) &&
        currentHistory(
          observations.map(item => item.month),
          generatedAt
        ) &&
        observations.every(item => item.complete)))
  );
};
/** Private page guard. Other published pages are not omissions; byte limits and cross-page authorization remain application duties. */
export function isMicrosoft365OptimizationEvidence(value: unknown): value is Microsoft365OptimizationEvidence {
  if (
    !row(value) ||
    !keys(value, [
      ...snapshotKeys,
      'catalogueVersion',
      'coverage',
      'coverageByKind',
      'pageIndex',
      'pageCount',
      'pageAccountCounts',
      'observedAccountCount',
      'accounts',
      'omittedAccountCount',
      'subscriptions',
      'omittedSubscriptionCount',
      'demandBySku',
    ]) ||
    value.schemaVersion !== 'microsoft-365-optimization-evidence/v1' ||
    !snapshot(value) ||
    !token(value.catalogueVersion) ||
    !coverage(value.coverage) ||
    !byKind(value.coverageByKind) ||
    !count(value.pageIndex) ||
    !count(value.pageCount) ||
    !list(value.pageAccountCounts, 2000, item => count(item) && item <= 5000) ||
    !count(value.observedAccountCount) ||
    !list(value.accounts, 5000, item => subjectEvidence(item, 'account')) ||
    !unique(value.accounts, item => String((item as Row).accountId).toLowerCase()) ||
    !count(value.omittedAccountCount) ||
    !count(value.omittedSubscriptionCount) ||
    value.omittedAccountCount > value.observedAccountCount ||
    !list(value.subscriptions, 1000, isMicrosoft365ObservedCommercialSubscription) ||
    !unique(value.subscriptions, item => String((item as Row).subscriptionId).toLowerCase()) ||
    !list(value.demandBySku, 1000, item => demand(item, String(value.generatedAt))) ||
    !unique(value.demandBySku, item => String((item as Row).skuId).toLowerCase())
  )
    return false;
  const published = value.observedAccountCount - value.omittedAccountCount;
  if (
    value.pageCount < 1 ||
    value.pageCount !== value.pageAccountCounts.length ||
    (value.pageAccountCounts as number[]).reduce((sum, item) => sum + item, 0) !== published ||
    (published > 0 && (value.pageAccountCounts as number[]).some(item => item === 0)) ||
    (published === 0 && value.pageCount !== 1) ||
    value.pageIndex >= value.pageCount ||
    value.accounts.length !== value.pageAccountCounts[value.pageIndex]
  )
    return false;
  return consistentCoverage(value.coverage, value.coverageByKind, value.omittedAccountCount > 0 || value.omittedSubscriptionCount > 0);
}

/** Anonymous internal weights let API project full populations without reading every private person page. */
export function isMicrosoft365OptimizationCohortEvidence(value: unknown): value is Microsoft365OptimizationCohortEvidence {
  if (
    !row(value) ||
    !keys(value, [...snapshotKeys, 'catalogueVersion', 'coverage', 'coverageByKind', 'observedAccountCount', 'omittedAccountCount', 'cohorts']) ||
    value.schemaVersion !== 'microsoft-365-optimization-cohorts/v1' ||
    !snapshot(value) ||
    !token(value.catalogueVersion) ||
    !coverage(value.coverage) ||
    !byKind(value.coverageByKind) ||
    !count(value.observedAccountCount) ||
    !count(value.omittedAccountCount) ||
    !list(value.cohorts, 1000, item => subjectEvidence(item, 'cohort')) ||
    !unique(value.cohorts, item => (item as Row).id)
  )
    return false;
  const population = (value.cohorts as Row[]).reduce((total, item) => total + Number(item.accountCount), value.omittedAccountCount);
  return (
    Number.isSafeInteger(population) &&
    population === value.observedAccountCount &&
    consistentCoverage(value.coverage, value.coverageByKind, value.omittedAccountCount > 0)
  );
}

const priceReceipt = (value: unknown, source: unknown): boolean => {
  if (
    !row(value) ||
    !keys(value, ['offerId', 'countryCode', 'confidence', 'channel', 'monthlyPremiumAssumptionAllowed']) ||
    typeof value.monthlyPremiumAssumptionAllowed !== 'boolean' ||
    !(value.countryCode === null || (typeof value.countryCode === 'string' && /^[A-Z]{2}$/.test(value.countryCode))) ||
    !(value.channel === null || choice(value.channel, MICROSOFT365_AGREEMENT_CHANNELS))
  )
    return false;
  if (source === 'unavailable')
    return (
      value.offerId === null &&
      value.countryCode === null &&
      value.confidence === 'unknown' &&
      value.channel === null &&
      !value.monthlyPremiumAssumptionAllowed
    );
  if (source === 'agreed') return value.offerId === null && value.confidence === 'customer' && !value.monthlyPremiumAssumptionAllowed;
  return (
    source === 'list' &&
    token(value.offerId) &&
    value.countryCode !== null &&
    value.channel !== null &&
    choice(value.confidence, ['verified', 'reference']) &&
    (!value.monthlyPremiumAssumptionAllowed || (value.confidence === 'verified' && choice(value.channel, ['mca', 'csp'])))
  );
};
const pricedOption = (value: unknown): value is Row => {
  if (
    !row(value) ||
    !keys(value, [
      'id',
      'mode',
      'fromSkuIds',
      'toSkuIds',
      'qualification',
      'blockedBy',
      'requiredCapabilityIds',
      'gainedCapabilityIds',
      'lostServicePlanIds',
      'unverifiedServicePlanIds',
      'priceBasis',
      'monthlyCostChange',
      'unitPrices',
    ]) ||
    !token(value.id) ||
    !action(value) ||
    !(value.monthlyCostChange === null || amount(value.monthlyCostChange)) ||
    !list(
      value.unitPrices,
      64,
      item =>
        row(item) &&
        keys(item, ['skuId', 'unitPriceMonthly', 'source', 'receipt']) &&
        guid(item.skuId) &&
        unitPrice(item.unitPriceMonthly) &&
        choice(item.source, ['list', 'agreed', 'unavailable']) &&
        priceReceipt(item.receipt, item.source) &&
        (item.unitPriceMonthly === null) === (item.source === 'unavailable')
    ) ||
    !unique(value.unitPrices, item => String((item as Row).skuId).toLowerCase())
  )
    return false;
  const prices = value.unitPrices as Row[],
    skus = new Set([...(value.fromSkuIds as string[]), ...(value.toSkuIds as string[])].map(id => id.toLowerCase()));
  if (prices.length !== skus.size || !prices.every(item => skus.has(String(item.skuId).toLowerCase()))) return false;
  if (prices.some(item => item.unitPriceMonthly === null)) return value.priceBasis === 'unavailable' && value.monthlyCostChange === null;
  const sources = new Set(prices.map(item => item.source));
  return value.priceBasis === (sources.size === 2 ? 'mixed' : sources.has('agreed') ? 'agreed' : 'list');
};
const findingKeys = ['id', 'kind', 'population', 'qualification', 'blockedBy', 'timing'];
const findingBase = (value: Row): boolean =>
  token(value.id) &&
  qualification(value) &&
  timing(value.timing) &&
  row(value.population) &&
  keys(value.population, ['unit', 'exactCount', 'observedCount']) &&
  choice(value.population.unit, ['accounts', 'seats']) &&
  nullableCount(value.population.exactCount) &&
  count(value.population.observedCount) &&
  (value.population.exactCount === null || value.population.exactCount === value.population.observedCount);
const selected = (value: Row): Row | undefined => (value.options as Row[]).find(item => item.id === value.selectedOptionId);
const options = (value: Row): boolean => {
  if (!list(value.options, 16, pricedOption) || !unique(value.options, item => (item as Row).id) || !count(value.omittedOptionCount)) return false;
  if (value.selectedOptionId === null) return true;
  if (!token(value.selectedOptionId) || value.qualification !== 'eligible' || value.omittedOptionCount > 0) return false;
  const chosen = selected(value),
    eligible = (value.options as Row[]).filter(item => item.qualification === 'eligible');
  return (
    !!chosen &&
    chosen.qualification === 'eligible' &&
    amount(chosen.monthlyCostChange) &&
    eligible.every(item => amount(item.monthlyCostChange) && Number(chosen.monthlyCostChange) <= item.monthlyCostChange)
  );
};
const contribution = (value: Row): boolean =>
  money(value.scenarioMonthlySaving) &&
  money(value.portfolioMonthlySaving) &&
  (value.portfolioMonthlySaving === null ||
    (amount(value.scenarioMonthlySaving) && Number(value.portfolioMonthlySaving) <= value.scenarioMonthlySaving)) &&
  (value.qualification === 'eligible' || (value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null));
const skuSet = (value: unknown): string =>
  (value as string[])
    .map(id => id.toLowerCase())
    .sort()
    .join('|');
const knownNonSavingCohort = (value: Row): boolean => {
  const eligible = (value.options as Row[]).filter(item => item.qualification === 'eligible');
  return (
    value.qualification === 'eligible' &&
    value.omittedOptionCount === 0 &&
    eligible.length > 0 &&
    eligible.every(item => amount(item.monthlyCostChange) && item.monthlyCostChange >= 0)
  );
};
const combineFinding = (value: Row): boolean =>
  keys(value, [...findingKeys, 'options', 'omittedOptionCount', 'selectedOptionId', 'scenarioMonthlySaving', 'portfolioMonthlySaving']) &&
  options(value) &&
  !knownNonSavingCohort(value) &&
  contribution(value) &&
  (value.options as Row[]).every(
    (item, index, all) =>
      item.mode === 'replace' && (item.fromSkuIds as unknown[]).length >= 2 && (index === 0 || skuSet(item.fromSkuIds) === skuSet(all[0].fromSkuIds))
  ) &&
  (value.selectedOptionId === null
    ? value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null
    : Number(selected(value)?.monthlyCostChange) < 0 && minorUnits(value.scenarioMonthlySaving) === -minorUnits(selected(value)?.monthlyCostChange)!);
const protectionFinding = (value: Row, projectedAt: string): boolean => {
  if (
    !keys(value, [
      ...findingKeys,
      'options',
      'omittedOptionCount',
      'selectedOptionId',
      'missingCapabilityIds',
      'configurationReviewCapabilityIds',
      'thirdPartyCoverage',
      'privilegedAccountCount',
      'mfaGapAccountCount',
      'monthlyInvestment',
    ]) ||
    !options(value) ||
    !codes(value.missingCapabilityIds) ||
    !codes(value.configurationReviewCapabilityIds) ||
    value.missingCapabilityIds.some(id => (value.configurationReviewCapabilityIds as string[]).includes(id)) ||
    (value.missingCapabilityIds.length === 0 && value.configurationReviewCapabilityIds.length === 0) ||
    !money(value.monthlyInvestment) ||
    !nullableCount(value.privilegedAccountCount) ||
    !nullableCount(value.mfaGapAccountCount) ||
    !list(
      value.thirdPartyCoverage,
      128,
      item =>
        row(item) &&
        keys(item, ['capabilityId', 'providerId', 'scopeReference', 'unit', 'coveredCount', 'observedAt', 'validUntil']) &&
        code(item.capabilityId) &&
        code(item.providerId) &&
        token(item.scopeReference) &&
        choice(item.unit, ['accounts', 'devices']) &&
        count(item.coveredCount) &&
        timestamp(item.observedAt) &&
        Date.parse(item.observedAt) <= Date.parse(projectedAt) &&
        (item.validUntil === null ||
          (timestamp(item.validUntil) &&
            Date.parse(item.validUntil) > Date.parse(projectedAt) &&
            Date.parse(item.validUntil) > Date.parse(item.observedAt))) &&
        !(value.missingCapabilityIds as string[]).includes(String(item.capabilityId)) &&
        !(value.configurationReviewCapabilityIds as string[]).includes(String(item.capabilityId))
    ) ||
    !unique(value.thirdPartyCoverage, item => `${(item as Row).capabilityId}|${(item as Row).providerId}|${(item as Row).scopeReference}`)
  )
    return false;
  const observed = Number((value.population as Row).observedCount);
  if (
    [
      value.privilegedAccountCount,
      value.mfaGapAccountCount,
      ...(value.thirdPartyCoverage as Row[]).filter(item => item.unit === 'accounts').map(item => item.coveredCount),
    ].some(item => count(item) && item > observed)
  )
    return false;
  return value.selectedOptionId === null
    ? value.monthlyInvestment === null || (value.monthlyInvestment === 0 && value.missingCapabilityIds.length === 0)
    : (value.missingCapabilityIds as string[]).every(id => (selected(value)!.gainedCapabilityIds as string[]).includes(id)) &&
        minorUnits(value.monthlyInvestment) === Math.max(0, minorUnits(selected(value)?.monthlyCostChange)!);
};
const termPrice = (value: unknown): value is Row =>
  row(value) &&
  keys(value, ['term', 'billingFrequency', 'unitPriceMonthly', 'source', 'receipt']) &&
  term(value.term) &&
  frequency(value.billingFrequency) &&
  !(value.term === 'monthly' && value.billingFrequency === 'annual') &&
  unitPrice(value.unitPriceMonthly) &&
  choice(value.source, ['list', 'agreed', 'unavailable']) &&
  priceReceipt(value.receipt, value.source) &&
  (value.unitPriceMonthly === null) === (value.source === 'unavailable') &&
  (value.unitPriceMonthly === null || value.billingFrequency !== 'unknown');
const termFinding = (value: Row, generatedAt: string): boolean => {
  if (
    !keys(value, [
      ...findingKeys,
      'skuId',
      'subscriptions',
      'omittedSubscriptionCount',
      'monthlySeats',
      'committedSeats',
      'stableSeats',
      'convertibleSeats',
      'historyMonths',
      'priceMethod',
      'sourcePrice',
      'targetPrice',
      'scenarioMonthlySaving',
      'portfolioMonthlySaving',
    ]) ||
    !guid(value.skuId) ||
    !list(
      value.subscriptions,
      1000,
      item =>
        row(item) &&
        keys(item, ['subscriptionId', 'termSource', 'term', 'quantity', 'hasConflict']) &&
        token(item.subscriptionId) &&
        choice(item.termSource, ['recorded', 'billing', 'inferred', 'unknown']) &&
        (term(item.term) || item.term === 'unknown') &&
        (item.term === 'unknown') === (item.termSource === 'unknown') &&
        nullableCount(item.quantity) &&
        typeof item.hasConflict === 'boolean'
    ) ||
    !unique(value.subscriptions, item => String((item as Row).subscriptionId).toLowerCase()) ||
    !count(value.omittedSubscriptionCount) ||
    ![value.monthlySeats, value.committedSeats, value.stableSeats, value.convertibleSeats].every(nullableCount) ||
    !identifiers(value.historyMonths, 6, month) ||
    !(value.historyMonths as string[]).every(item => item < generatedAt.slice(0, 7)) ||
    !choice(value.priceMethod, ['matched_offers', 'assumed_20_percent', 'unavailable']) ||
    !termPrice(value.sourcePrice) ||
    !termPrice(value.targetPrice) ||
    value.sourcePrice.term !== 'monthly' ||
    !choice(value.targetPrice.term, ['annual', 'three_year']) ||
    !contribution(value)
  )
    return false;
  if (value.priceMethod === 'matched_offers' && (value.sourcePrice.unitPriceMonthly === null || value.targetPrice.unitPriceMonthly === null))
    return false;
  if (
    value.priceMethod === 'assumed_20_percent' &&
    (value.sourcePrice.unitPriceMonthly !== null ||
      value.targetPrice.unitPriceMonthly === null ||
      value.targetPrice.term !== 'annual' ||
      (value.targetPrice.receipt as Row).confidence !== 'verified' ||
      !(value.targetPrice.receipt as Row).monthlyPremiumAssumptionAllowed)
  )
    return false;
  if (value.priceMethod === 'unavailable' && (value.scenarioMonthlySaving !== null || value.portfolioMonthlySaving !== null)) return false;
  if (value.qualification !== 'eligible') return true;
  if (value.omittedSubscriptionCount > 0) return false;
  if (value.scenarioMonthlySaving !== null && Number(value.scenarioMonthlySaving) <= 0) return false;
  if (value.priceMethod === 'matched_offers' && Number(value.targetPrice.unitPriceMonthly) >= Number(value.sourcePrice.unitPriceMonthly))
    return false;
  if (value.priceMethod === 'assumed_20_percent' && Number(value.targetPrice.unitPriceMonthly) <= 0) return false;
  // Six monthly observations qualify the annual-target model only; longer commitments remain conditional.
  if (value.targetPrice.term !== 'annual') return false;
  const subscriptions = value.subscriptions as Row[];
  if (
    !subscriptions.length ||
    !subscriptions.every(item => choice(item.termSource, ['recorded', 'billing']) && !item.hasConflict && count(item.quantity)) ||
    !currentHistory(value.historyMonths, generatedAt) ||
    ![value.monthlySeats, value.committedSeats, value.stableSeats, value.convertibleSeats].every(count)
  )
    return false;
  const monthly = subscriptions.filter(item => item.term === 'monthly').reduce((total, item) => total + Number(item.quantity), 0);
  const committed = subscriptions
    .filter(item => item.term === 'annual' || item.term === 'three_year')
    .reduce((total, item) => total + Number(item.quantity), 0);
  return (
    value.monthlySeats === monthly &&
    value.committedSeats === committed &&
    Number(value.convertibleSeats) > 0 &&
    Number(value.convertibleSeats) <= monthly &&
    Number(value.convertibleSeats) <= Math.max(0, Number(value.stableSeats) - committed) &&
    (value.population as Row).exactCount === value.convertibleSeats
  );
};
const finding = (value: unknown, generatedAt: string, projectedAt: string): value is Row => {
  if (!row(value) || !findingBase(value) || (value.population as Row).unit !== (value.kind === 'change_term' ? 'seats' : 'accounts')) return false;
  const valid =
    value.kind === 'combine_licenses'
      ? combineFinding(value)
      : value.kind === 'add_protection'
        ? protectionFinding(value, projectedAt)
        : value.kind === 'change_term' && termFinding(value, generatedAt);
  return (
    !!valid &&
    ((value.population as Row).exactCount !== null ||
      (value.kind === 'add_protection'
        ? value.monthlyInvestment === null
        : value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null))
  );
};
const moneyFreeFinding = (value: Row): boolean =>
  (value.kind === 'add_protection'
    ? value.monthlyInvestment === null
    : value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null) &&
  (value.kind === 'change_term'
    ? (value.sourcePrice as Row).unitPriceMonthly === null && (value.targetPrice as Row).unitPriceMonthly === null
    : (value.options as Row[]).every(
        item => item.monthlyCostChange === null && (item.unitPrices as Row[]).every(price => price.unitPriceMonthly === null)
      ));
const aggregate = (value: unknown, contributions: unknown[], complete: boolean): boolean => {
  if (value === null) return true;
  if (!complete || contributions.some(item => item === null)) return false;
  const sum = contributions.reduce<number>((total, item) => total + minorUnits(item)!, 0);
  return Number.isSafeInteger(sum) && minorUnits(value) === sum;
};
/** Anonymous wire guard. Price multiplication, compatible portfolio allocation, catalogue and provider authenticity remain consumer duties. */
export function isMicrosoft365OptimizationSummary(value: unknown): value is Microsoft365OptimizationSummary {
  if (
    !row(value) ||
    !keys(value, [...projectionKeys, 'coverageByKind', 'groups', 'omittedGroupCount', 'portfolioMonthlySaving', 'protectionMonthlyInvestment']) ||
    value.schemaVersion !== 'microsoft-365-optimization-summary/v1' ||
    !projection(value) ||
    !byKind(value.coverageByKind) ||
    !list(value.groups, 256, item => finding(item, String(value.generatedAt), String(value.projectedAt))) ||
    !unique(value.groups, item => (item as Row).id) ||
    !count(value.omittedGroupCount) ||
    !money(value.portfolioMonthlySaving) ||
    !money(value.protectionMonthlyInvestment)
  )
    return false;
  if (!consistentCoverage(value.coverage as Row, value.coverageByKind, value.omittedGroupCount > 0)) return false;
  const groups = value.groups as Row[],
    kinds = value.coverageByKind;
  const sourceComplete = (name: string): boolean => (kinds[name] as Row).state === 'complete';
  const publishing = value.omittedGroupCount === 0 && (value.coverage as Row).state !== 'unavailable';
  if (
    !aggregate(
      value.portfolioMonthlySaving,
      groups.filter(item => item.kind !== 'add_protection' && item.qualification === 'eligible').map(item => item.portfolioMonthlySaving),
      publishing && sourceComplete('combineLicenses') && sourceComplete('changeTerm')
    ) ||
    !aggregate(
      value.protectionMonthlyInvestment,
      groups.filter(item => item.kind === 'add_protection').map(item => item.monthlyInvestment),
      publishing && sourceComplete('addProtection')
    )
  )
    return false;
  if (
    !groups.every(
      item =>
        (kinds[item.kind === 'combine_licenses' ? 'combineLicenses' : item.kind === 'add_protection' ? 'addProtection' : 'changeTerm'] as Row)
          .state !== 'unavailable' || item.qualification !== 'eligible'
    )
  )
    return false;
  return (
    value.currency !== null || (value.portfolioMonthlySaving === null && value.protectionMonthlyInvestment === null && groups.every(moneyFreeFinding))
  );
}
/** One-account detail with finding-local option identities and disjoint selected products across financial and protection actions. */
export function isMicrosoft365OptimizationAccountDetail(value: unknown): value is Microsoft365OptimizationAccountDetail {
  if (
    !row(value) ||
    !keys(value, [...projectionKeys, 'accountId', 'reviewDisposition', 'privilege', 'mfaRegistration', 'findings']) ||
    value.schemaVersion !== 'microsoft-365-optimization-account/v1' ||
    !projection(value) ||
    !guid(value.accountId) ||
    !choice(value.reviewDisposition, ['retained', 'review_first', 'kept']) ||
    !choice(value.privilege, ['observed', 'not_observed', 'unknown']) ||
    !choice(value.mfaRegistration, ['capable', 'not_capable', 'unknown']) ||
    !list(
      value.findings,
      128,
      item =>
        finding(item, String(value.generatedAt), String(value.projectedAt)) &&
        (item as Row).kind !== 'change_term' &&
        ((item as Row).population as Row).exactCount === 1
    ) ||
    !unique(value.findings, item => (item as Row).id)
  )
    return false;
  const findings = value.findings as Row[],
    removed = new Set<string>(),
    acquired = new Set<string>();
  if (
    (value.coverage as Row).state === 'unavailable' &&
    findings.some(item => item.qualification === 'eligible' || item.selectedOptionId !== null || !moneyFreeFinding(item))
  )
    return false;
  for (const current of findings) {
    if (value.reviewDisposition !== 'retained' && (current.selectedOptionId !== null || current.qualification === 'eligible')) return false;
    if (current.selectedOptionId === null) continue;
    const chosen = selected(current)!;
    for (const id of chosen.fromSkuIds as string[]) {
      const normalized = id.toLowerCase();
      if (removed.has(normalized) || acquired.has(normalized)) return false;
      removed.add(normalized);
    }
    for (const id of chosen.toSkuIds as string[]) {
      const normalized = id.toLowerCase();
      if (acquired.has(normalized) || removed.has(normalized)) return false;
      acquired.add(normalized);
    }
  }
  return value.currency !== null || findings.every(moneyFreeFinding);
}
