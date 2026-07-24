import type { AwsPortalBillingScope } from './portalPublicArtifacts';
import {
  asRecord,
  assertExactKeys,
  assertUnique,
  assertValue,
  finiteNumber,
  isoTimestamp,
  nonNegativeInteger,
  requiredBoolean,
  requiredString,
  stringArray,
  validateFreshness,
  validateJsonArray,
  validateJsonObject,
} from './portalPublicArtifactValidationCommon';

export function validateAwsPortalBillingBlock(
  value: unknown,
  field: string,
  outerBilling: AwsPortalBillingScope,
  accountId: string,
  accountBody: boolean
): void {
  const billing = asRecord(value, field);
  const accountFields = [
    'costViewByCurrency',
    'groupedCosts',
    'commitmentSpend',
    'resourceAttribution',
    'calendarSummary',
    'periodSummary',
    'spendTrend',
    'comparison',
  ];
  const resourceFields = ['pricingReferenceEstimation', 'estimatedBillingAuthority'];
  assertExactKeys(billing, ['scope', 'freshness', 'summary', 'totalsByCurrency', ...(accountBody ? accountFields : resourceFields)], field);
  validateBillingEvidenceScope(billing.scope, outerBilling, accountId, `${field}.scope`);
  validateFreshness(billing.freshness, `${field}.freshness`, 'lastSuccessfulImportAt');
  validateBillingSummary(billing.summary, `${field}.summary`);
  validateBillingGroupedResult(billing.totalsByCurrency, `${field}.totalsByCurrency`);
  if (!accountBody) {
    if (billing.pricingReferenceEstimation !== undefined)
      validateJsonObject(billing.pricingReferenceEstimation, `${field}.pricingReferenceEstimation`);
    if (billing.estimatedBillingAuthority !== undefined) validateJsonObject(billing.estimatedBillingAuthority, `${field}.estimatedBillingAuthority`);
    return;
  }
  validateJsonArray(billing.costViewByCurrency, `${field}.costViewByCurrency`);
  const grouped = asRecord(billing.groupedCosts, `${field}.groupedCosts`);
  assertExactKeys(grouped, ['byChargeCategory', 'byServiceCode', 'byServiceCategory'], `${field}.groupedCosts`);
  validateBillingGroupedResult(grouped.byChargeCategory, `${field}.groupedCosts.byChargeCategory`, 'chargeCategory');
  validateBillingGroupedResult(grouped.byServiceCode, `${field}.groupedCosts.byServiceCode`, 'serviceCode');
  if (grouped.byServiceCategory !== undefined)
    validateBillingGroupedResult(grouped.byServiceCategory, `${field}.groupedCosts.byServiceCategory`, 'serviceCategory');
  ['commitmentSpend', 'resourceAttribution', 'calendarSummary', 'periodSummary', 'spendTrend', 'comparison'].forEach(key => {
    if (billing[key] !== undefined) validateJsonObject(billing[key], `${field}.${key}`);
  });
}

export function validateAwsPortalRecommendationCoverage(
  value: unknown,
  accountId: string,
  regions: string[],
  field: string,
  sources: readonly string[],
  includeTrust: boolean
): void {
  const recommendations = asRecord(value, field);
  assertExactKeys(recommendations, ['sources'], field);
  if (!Array.isArray(recommendations.sources)) throw new Error(`${field}.sources must be an array.`);
  const seenSources: string[] = [];
  recommendations.sources.forEach((entry, index) => {
    const itemField = `${field}.sources[${index}]`;
    const source = asRecord(entry, itemField);
    assertExactKeys(
      source,
      includeTrust
        ? ['source', 'scope', 'summary', 'counts', 'savings', 'sourceEvidence', 'actionHealth']
        : ['source', 'scope', 'summary', 'counts', 'savings'],
      itemField
    );
    const sourceName = requiredString(source.source, `${itemField}.source`);
    if (!sources.includes(sourceName)) throw new Error(`${itemField}.source is not declared.`);
    seenSources.push(sourceName);
    const scope = asRecord(source.scope, `${itemField}.scope`);
    assertExactKeys(scope, ['provider', 'source', 'scope', 'accountId', 'resourceRegions'], `${itemField}.scope`);
    assertValue(scope.provider, 'aws', `${itemField}.scope.provider`);
    assertValue(scope.source, sourceName, `${itemField}.scope.source`);
    assertValue(scope.scope, 'account', `${itemField}.scope.scope`);
    assertValue(scope.accountId, accountId, `${itemField}.scope.accountId`);
    const nestedRegions = stringArray(scope.resourceRegions, `${itemField}.scope.resourceRegions`);
    if (JSON.stringify(nestedRegions) !== JSON.stringify(regions))
      throw new Error(`${itemField}.scope.resourceRegions must match artifact scope exactly.`);
    validateRecommendationSummary(source.summary, `${itemField}.summary`);
    validateRecommendationCounts(source.counts, `${itemField}.counts`);
    validateRecommendationSavings(source.savings, `${itemField}.savings`);
    if (source.sourceEvidence !== undefined) validateRecommendationSourceEvidence(source.sourceEvidence, `${itemField}.sourceEvidence`);
    if (source.actionHealth !== undefined) validateRecommendationActionHealth(source.actionHealth, `${itemField}.actionHealth`);
  });
  assertUnique(seenSources, `${field}.sources`);
}

function validateBillingEvidenceScope(value: unknown, outerBilling: AwsPortalBillingScope, accountId: string, field: string): void {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['provider', 'source', 'scope', 'accountId', 'reportName', 'billingPeriod'], field);
  assertValue(scope.provider, 'aws', `${field}.provider`);
  assertValue(scope.source, outerBilling.source, `${field}.source`);
  assertValue(scope.scope, 'account', `${field}.scope`);
  assertValue(scope.accountId, accountId, `${field}.accountId`);
  assertValue(scope.reportName, outerBilling.source === 'cur' ? outerBilling.reportName : outerBilling.exportName, `${field}.reportName`);
  if (JSON.stringify(scope.billingPeriod) !== JSON.stringify(outerBilling.billingPeriod))
    throw new Error(`${field}.billingPeriod must match artifact scope exactly.`);
}

function validateBillingSummary(value: unknown, field: string): void {
  const summary = asRecord(value, field);
  assertExactKeys(summary, ['totalPersistedExpenseCount', 'emptyScope', 'metadataFound', 'metadataMatchesRequestedBillingPeriod'], field);
  nonNegativeInteger(summary.totalPersistedExpenseCount, `${field}.totalPersistedExpenseCount`);
  requiredBoolean(summary.emptyScope, `${field}.emptyScope`);
  requiredBoolean(summary.metadataFound, `${field}.metadataFound`);
  requiredBoolean(summary.metadataMatchesRequestedBillingPeriod, `${field}.metadataMatchesRequestedBillingPeriod`);
}

function validateBillingGroupedResult(value: unknown, field: string, label?: string): void {
  const result = asRecord(value, field);
  assertExactKeys(result, ['totalGroupCount', 'returnedGroupCount', 'truncated', 'items'], field);
  const total = nonNegativeInteger(result.totalGroupCount, `${field}.totalGroupCount`);
  const returned = nonNegativeInteger(result.returnedGroupCount, `${field}.returnedGroupCount`);
  requiredBoolean(result.truncated, `${field}.truncated`);
  if (returned > total) throw new Error(`${field}.returnedGroupCount must not exceed totalGroupCount.`);
  if (!Array.isArray(result.items) || result.items.length !== returned) throw new Error(`${field}.items length must equal returnedGroupCount.`);
  const identities: string[] = [];
  result.items.forEach((entry, index) => {
    const itemField = `${field}.items[${index}]`;
    const item = asRecord(entry, itemField);
    assertExactKeys(
      item,
      [...(label ? [label] : []), 'currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'],
      itemField
    );
    if (label) requiredString(item[label], `${itemField}.${label}`);
    const currency = requiredString(item.currency, `${itemField}.currency`);
    nonNegativeInteger(item.expenseCount, `${itemField}.expenseCount`);
    finiteNumber(item.baseCostAmount, `${itemField}.baseCostAmount`);
    if (item.amortizedCostAmount !== undefined) finiteNumber(item.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
    if (item.amortizedExpenseCount !== undefined) nonNegativeInteger(item.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
    identities.push(`${label ? String(item[label]) : ''}|${currency}`);
  });
  assertUnique(identities, `${field}.items`);
}

function validateRecommendationSummary(value: unknown, field: string): void {
  const summary = asRecord(value, field);
  const counts = [
    'totalStateCount',
    'currentStateCount',
    'missingStateCount',
    'snapshotBackedCount',
    'orphanSnapshotCount',
    'matchedStateCount',
    'filteredOutStateCount',
  ];
  assertExactKeys(summary, [...counts, 'emptyScope', 'emptyResult'], field);
  counts.forEach(key => nonNegativeInteger(summary[key], `${field}.${key}`));
  requiredBoolean(summary.emptyScope, `${field}.emptyScope`);
  requiredBoolean(summary.emptyResult, `${field}.emptyResult`);
}

function validateRecommendationCounts(value: unknown, field: string): void {
  const counts = asRecord(value, field);
  const groups = [
    ['byLifecycleStatus', 'lifecycleStatus'],
    ['bySourcePresence', 'sourcePresence'],
    ['byCategory', 'category'],
    ['byRegion', 'region'],
    ['bySourceService', 'sourceService'],
    ['byResourceType', 'resourceType'],
    ['byActionType', 'actionType'],
    ['byImplementationEffort', 'implementationEffort'],
  ] as const;
  assertExactKeys(
    counts,
    groups.map(([group]) => group),
    field
  );
  groups.forEach(([group, label]) => validateCountGroup(counts[group], `${field}.${group}`, label));
}

function validateCountGroup(value: unknown, field: string, label: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const identities: string[] = [];
  value.forEach((entry, index) => {
    const item = asRecord(entry, `${field}[${index}]`);
    assertExactKeys(item, [label, 'count'], `${field}[${index}]`);
    identities.push(requiredString(item[label], `${field}[${index}].${label}`));
    nonNegativeInteger(item.count, `${field}[${index}].count`);
  });
  assertUnique(identities, field);
}

function validateRecommendationSavings(value: unknown, field: string): void {
  const savings = asRecord(value, field);
  const counts = [
    'snapshotBackedMatchedCount',
    'positiveEstimatedSavingsRecommendationCount',
    'nonPositiveEstimatedSavingsCount',
    'missingEstimatedSavingsCount',
    'missingCurrencyCodeCount',
  ];
  assertExactKeys(savings, [...counts, 'emptySavings', 'mixedCurrencies', 'byCurrency'], field);
  counts.forEach(key => nonNegativeInteger(savings[key], `${field}.${key}`));
  requiredBoolean(savings.emptySavings, `${field}.emptySavings`);
  requiredBoolean(savings.mixedCurrencies, `${field}.mixedCurrencies`);
  if (!Array.isArray(savings.byCurrency)) throw new Error(`${field}.byCurrency must be an array.`);
  const currencies: string[] = [];
  savings.byCurrency.forEach((entry, index) => {
    const itemField = `${field}.byCurrency[${index}]`;
    const item = asRecord(entry, itemField);
    assertExactKeys(item, ['currencyCode', 'recommendationCount', 'totalEstimatedMonthlySavings'], itemField);
    currencies.push(requiredString(item.currencyCode, `${itemField}.currencyCode`));
    nonNegativeInteger(item.recommendationCount, `${itemField}.recommendationCount`);
    finiteNumber(item.totalEstimatedMonthlySavings, `${itemField}.totalEstimatedMonthlySavings`);
  });
  assertUnique(currencies, `${field}.byCurrency`);
}

export function validateRecommendationSourceEvidence(value: unknown, field: string): void {
  const evidence = asRecord(value, field);
  const baseKeys = [
    'totalStateCount',
    'currentStateCount',
    'missingStateCount',
    'snapshotBackedCount',
    'orphanSnapshotCount',
    'matchedStateCount',
    'filteredOutStateCount',
    'emptyScope',
    'emptyResult',
  ];
  assertExactKeys(
    evidence,
    [...baseKeys, 'partialSourceEvidence', 'oldestRecommendationSynchronizedAt', 'latestRecommendationSynchronizedAt', 'exactScopeCoverage'],
    field
  );
  baseKeys.filter(key => !['emptyScope', 'emptyResult'].includes(key)).forEach(key => nonNegativeInteger(evidence[key], `${field}.${key}`));
  requiredBoolean(evidence.emptyScope, `${field}.emptyScope`);
  requiredBoolean(evidence.emptyResult, `${field}.emptyResult`);
  requiredBoolean(evidence.partialSourceEvidence, `${field}.partialSourceEvidence`);
  if (evidence.oldestRecommendationSynchronizedAt !== undefined)
    isoTimestamp(evidence.oldestRecommendationSynchronizedAt, `${field}.oldestRecommendationSynchronizedAt`);
  if (evidence.latestRecommendationSynchronizedAt !== undefined)
    isoTimestamp(evidence.latestRecommendationSynchronizedAt, `${field}.latestRecommendationSynchronizedAt`);
  if (evidence.exactScopeCoverage !== undefined) validateJsonObject(evidence.exactScopeCoverage, `${field}.exactScopeCoverage`);
}

export function validateRecommendationActionHealth(value: unknown, field: string): void {
  const health = asRecord(value, field);
  assertExactKeys(health, ['latestActionCount', 'byLatestActionStatus'], field);
  nonNegativeInteger(health.latestActionCount, `${field}.latestActionCount`);
  validateCountGroup(health.byLatestActionStatus, `${field}.byLatestActionStatus`, 'status');
}
