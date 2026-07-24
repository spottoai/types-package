import {
  asRecord,
  assertExactKeys,
  assertUnique,
  assertValue,
  finiteNumber,
  isoTimestamp,
  nonNegativeInteger,
  requiredBoolean,
  requiredEnum,
  requiredString,
  stringArray,
} from './portalPublicArtifactValidationCommon';
import { validateRecommendationActionHealth, validateRecommendationSourceEvidence } from './portalPublicArtifactEvidenceValidation';

const ACTION_STATUSES = ['accepted', 'completed', 'failed', 'retryable-failure', 'skipped'] as const;
const ACTION_TYPES = ['DeleteDBInstance', 'DeleteNatGateway', 'ModifyVolume', 'ModifyStorage', 'Rightsize'] as const;
const PROVIDER_ACTIONS = [
  'rds-modify-db-cluster-storage-type',
  'autoscaling-update-group-instance-refresh',
  'ec2-modify-volume',
  'ec2-stop-modify-start-instance-type',
  'ecs-register-task-definition-update-service',
  'ec2-delete-nat-gateway',
  'lambda-update-function-configuration',
  'rds-delete-db-instance',
  'rds-modify-db-instance',
] as const;
const SKIP_REASONS = [
  'recommendation-state-not-found',
  'source-recommendation-missing',
  'source-recommendation-not-found',
  'published-version-immutable',
  'provider-preflight-conflict',
  'provider-preflight-unsupported',
  'unsupported-recommendation-shape',
  'no-effective-provider-change',
] as const;
const RECOMMENDATION_SOURCES = [
  'custom',
  'compute-optimizer',
  'cost-optimization-hub',
  'resilience-hub',
  'security-hub',
  'trusted-advisor',
  'well-architected',
] as const;

export function validateResourceBillingEvidence(value: unknown, field: string): void {
  const billing = asRecord(value, field);
  assertExactKeys(
    billing,
    ['costProvenance', 'matchedExpenseCount', 'totalsByCurrency', 'costViewByCurrency', 'commitmentSpend', 'benefitsCoverage', 'coverageWarning'],
    field
  );
  const provenance = asRecord(billing.costProvenance, `${field}.costProvenance`);
  assertExactKeys(provenance, ['costSource', 'costSourceConfidence'], `${field}.costProvenance`);
  assertValue(provenance.costSource, 'billing', `${field}.costProvenance.costSource`);
  assertValue(provenance.costSourceConfidence, 'high', `${field}.costProvenance.costSourceConfidence`);
  nonNegativeInteger(billing.matchedExpenseCount, `${field}.matchedExpenseCount`);
  validateCostTotals(billing.totalsByCurrency, `${field}.totalsByCurrency`);
  validateCostViews(billing.costViewByCurrency, `${field}.costViewByCurrency`);
  validateCommitmentSpend(billing.commitmentSpend, `${field}.commitmentSpend`);
  if (billing.benefitsCoverage !== undefined) validateBenefitCoverage(billing.benefitsCoverage, `${field}.benefitsCoverage`);
  if (billing.coverageWarning !== undefined) validateBenefitWarning(billing.coverageWarning, `${field}.coverageWarning`);
}

export function validateRecommendationActionability(value: unknown, field: string): void {
  const actionability = asRecord(value, field);
  assertExactKeys(actionability, ['latestActionStableMaterializationKey', 'latestActionExecution', 'savingsVerification'], field);
  requiredString(actionability.latestActionStableMaterializationKey, `${field}.latestActionStableMaterializationKey`);
  validateLatestAction(actionability.latestActionExecution, `${field}.latestActionExecution`);
  if (actionability.savingsVerification !== undefined) validateSavingsVerification(actionability.savingsVerification, `${field}.savingsVerification`);
}

export function validateTemplateProvenanceSources(value: unknown, field: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const identities: string[] = [];
  value.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const source = asRecord(entry, itemField);
    assertExactKeys(
      source,
      [
        'recommendationCode',
        'templateId',
        'relativePath',
        'source',
        'format',
        'confidencePercentage',
        'confidenceReason',
        'primarySourceUrl',
        'firstPartyValidationSourceCount',
        'communitySourceCount',
      ],
      itemField
    );
    const recommendationCode = requiredString(source.recommendationCode, `${itemField}.recommendationCode`);
    const relativePath = requiredString(source.relativePath, `${itemField}.relativePath`);
    identities.push(`${recommendationCode}|${relativePath}`);
    requiredString(source.templateId, `${itemField}.templateId`);
    requiredEnum(source.source, ['internal', 'external'], `${itemField}.source`);
    requiredEnum(source.format, ['canonical-v1', 'external-catalog-v1'], `${itemField}.format`);
    if (source.confidencePercentage !== undefined) percentage(source.confidencePercentage, `${itemField}.confidencePercentage`);
    if (source.confidenceReason !== undefined) requiredString(source.confidenceReason, `${itemField}.confidenceReason`);
    if (source.primarySourceUrl !== undefined) httpsUrl(source.primarySourceUrl, `${itemField}.primarySourceUrl`);
    nonNegativeInteger(source.firstPartyValidationSourceCount, `${itemField}.firstPartyValidationSourceCount`);
    nonNegativeInteger(source.communitySourceCount, `${itemField}.communitySourceCount`);
  });
  assertUnique(identities, field);
}

export function validateRecommendationPosture(value: unknown, field: string): void {
  const posture = asRecord(value, field);
  assertExactKeys(posture, ['sourceCount', 'sources'], field);
  const sourceCount = nonNegativeInteger(posture.sourceCount, `${field}.sourceCount`);
  if (!Array.isArray(posture.sources) || posture.sources.length !== sourceCount) throw new Error(`${field}.sources length must equal sourceCount.`);
  const sources: string[] = [];
  posture.sources.forEach((entry, index) => {
    const itemField = `${field}.sources[${index}]`;
    const source = asRecord(entry, itemField);
    assertExactKeys(source, ['source', 'sourceEvidence', 'actionHealth'], itemField);
    sources.push(requiredEnum(source.source, RECOMMENDATION_SOURCES, `${itemField}.source`));
    if (source.sourceEvidence !== undefined) validateRecommendationSourceEvidence(source.sourceEvidence, `${itemField}.sourceEvidence`);
    if (source.actionHealth !== undefined) validateRecommendationActionHealth(source.actionHealth, `${itemField}.actionHealth`);
  });
  assertUnique(sources, `${field}.sources`);
}

export function validateSavingsByCurrency(value: unknown, field: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const currencies: string[] = [];
  value.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const item = asRecord(entry, itemField);
    assertExactKeys(item, ['currencyCode', 'recommendationCount', 'totalEstimatedMonthlySavings'], itemField);
    currencies.push(requiredString(item.currencyCode, `${itemField}.currencyCode`));
    nonNegativeInteger(item.recommendationCount, `${itemField}.recommendationCount`);
    finiteNumber(item.totalEstimatedMonthlySavings, `${itemField}.totalEstimatedMonthlySavings`);
  });
  assertUnique(currencies, field);
}

function validateLatestAction(value: unknown, field: string): void {
  const action = asRecord(value, field);
  const keys = [
    'status',
    'recordedAt',
    'requestId',
    'requestedAt',
    'requestedBy',
    'actionType',
    'providerAction',
    'completionMode',
    'acceptedAt',
    'completedAt',
    'failedAt',
    'providerRequestId',
    'currentResourceSummary',
    'recommendedResourceSummary',
    'sourceTitle',
    'estimatedMonthlySavings',
    'estimatedSavingsPercentage',
    'currencyCode',
    'message',
    'skipReason',
    'implementationChanged',
    'implementationImplemented',
    'implementationPreviouslyImplemented',
  ];
  assertExactKeys(action, keys, field);
  requiredEnum(action.status, ACTION_STATUSES, `${field}.status`);
  const recordedAt = isoTimestamp(action.recordedAt, `${field}.recordedAt`);
  const requestedAt = isoTimestamp(action.requestedAt, `${field}.requestedAt`);
  if (Date.parse(requestedAt) > Date.parse(recordedAt)) throw new Error(`${field}.requestedAt must not exceed recordedAt.`);
  requiredString(action.requestId, `${field}.requestId`);
  assertValue(action.requestedBy, 'manual', `${field}.requestedBy`);
  requiredEnum(action.actionType, ACTION_TYPES, `${field}.actionType`);
  requiredEnum(action.providerAction, PROVIDER_ACTIONS, `${field}.providerAction`);
  assertValue(action.completionMode, 'provider-poll', `${field}.completionMode`);
  ['acceptedAt', 'completedAt', 'failedAt'].forEach(key => {
    if (action[key] !== undefined) isoTimestamp(action[key], `${field}.${key}`);
  });
  ['providerRequestId', 'currentResourceSummary', 'recommendedResourceSummary', 'sourceTitle', 'currencyCode', 'message'].forEach(key => {
    if (action[key] !== undefined) requiredString(action[key], `${field}.${key}`);
  });
  ['estimatedMonthlySavings', 'estimatedSavingsPercentage'].forEach(key => {
    if (action[key] !== undefined) finiteNumber(action[key], `${field}.${key}`);
  });
  if (action.skipReason !== undefined) requiredEnum(action.skipReason, SKIP_REASONS, `${field}.skipReason`);
  ['implementationChanged', 'implementationImplemented', 'implementationPreviouslyImplemented'].forEach(key => {
    if (action[key] !== undefined) requiredBoolean(action[key], `${field}.${key}`);
  });
}

function validateSavingsVerification(value: unknown, field: string): void {
  const verification = asRecord(value, field);
  const required = [
    'verificationStatus',
    'artifactType',
    'actionRequestId',
    'actionCompletedAt',
    'postActionEvidenceStatus',
    'postActionEvidenceReason',
  ];
  const optional = [
    'postActionArtifactGeneratedAt',
    'postActionRefreshRequestId',
    'postActionPendingRefreshRequestedAt',
    'postActionPendingRefreshUpdatedAt',
    'postActionPendingRefreshSummary',
    'postActionRetainedRefreshAttemptSummary',
    'postActionSourcePresence',
    'actionEstimatedMonthlySavings',
    'actionEstimatedSavingsPercentage',
    'actionCurrencyCode',
    'currentEstimatedMonthlySavings',
    'currentEstimatedSavingsPercentage',
    'currentCurrencyCode',
    'currencyCodesMatch',
  ];
  assertExactKeys(verification, [...required, ...optional], field);
  requiredEnum(
    verification.verificationStatus,
    [
      'pending-post-action-refresh',
      'recommendation-absent-after-refresh',
      'recommendation-still-present-after-refresh',
      'post-action-evidence-truncated',
    ],
    `${field}.verificationStatus`
  );
  assertValue(verification.artifactType, 'recommendations', `${field}.artifactType`);
  requiredString(verification.actionRequestId, `${field}.actionRequestId`);
  isoTimestamp(verification.actionCompletedAt, `${field}.actionCompletedAt`);
  requiredEnum(
    verification.postActionEvidenceStatus,
    ['qualified', 'refresh-pending', 'missing', 'stale', 'unqualified'],
    `${field}.postActionEvidenceStatus`
  );
  requiredEnum(
    verification.postActionEvidenceReason,
    [
      'qualified-post-action-artifact',
      'canonical-refresh-row-pending',
      'canonical-refresh-row-missing',
      'artifact-generated-before-action-completion',
      'artifact-refresh-request-mismatch',
      'artifact-refresh-trigger-mismatch',
      'artifact-changed-key-missing',
      'artifact-type-mismatch',
    ],
    `${field}.postActionEvidenceReason`
  );
  ['postActionArtifactGeneratedAt', 'postActionPendingRefreshRequestedAt', 'postActionPendingRefreshUpdatedAt'].forEach(key => {
    if (verification[key] !== undefined) isoTimestamp(verification[key], `${field}.${key}`);
  });
  if (verification.postActionRefreshRequestId !== undefined)
    requiredString(verification.postActionRefreshRequestId, `${field}.postActionRefreshRequestId`);
  if (verification.postActionPendingRefreshSummary !== undefined)
    validatePendingRefresh(verification.postActionPendingRefreshSummary, `${field}.postActionPendingRefreshSummary`);
  if (verification.postActionRetainedRefreshAttemptSummary !== undefined)
    validateRefreshAttempts(verification.postActionRetainedRefreshAttemptSummary, `${field}.postActionRetainedRefreshAttemptSummary`);
  if (verification.postActionSourcePresence !== undefined)
    requiredEnum(verification.postActionSourcePresence, ['current', 'missing'], `${field}.postActionSourcePresence`);
  optional
    .filter(key => key.includes('Estimated'))
    .forEach(key => {
      if (verification[key] !== undefined) finiteNumber(verification[key], `${field}.${key}`);
    });
  ['actionCurrencyCode', 'currentCurrencyCode'].forEach(key => {
    if (verification[key] !== undefined) requiredString(verification[key], `${field}.${key}`);
  });
  if (verification.currencyCodesMatch !== undefined) requiredBoolean(verification.currencyCodesMatch, `${field}.currencyCodesMatch`);
}

function validatePendingRefresh(value: unknown, field: string): void {
  const summary = asRecord(value, field);
  assertExactKeys(
    summary,
    ['pendingArtifactCount', 'pendingArtifactTypes', 'oldestPendingRefreshUpdatedAt', 'newestPendingRefreshUpdatedAt', 'executionAttemptSummary'],
    field
  );
  nonNegativeInteger(summary.pendingArtifactCount, `${field}.pendingArtifactCount`);
  stringArray(summary.pendingArtifactTypes, `${field}.pendingArtifactTypes`).forEach(type =>
    requiredEnum(type, ['recommendations', 'resource-recommendations', 'resource-type-recommendations'], `${field}.pendingArtifactTypes`)
  );
  ['oldestPendingRefreshUpdatedAt', 'newestPendingRefreshUpdatedAt'].forEach(key => {
    if (summary[key] !== undefined) isoTimestamp(summary[key], `${field}.${key}`);
  });
  if (summary.executionAttemptSummary !== undefined) validateRefreshAttempts(summary.executionAttemptSummary, `${field}.executionAttemptSummary`);
}

function validateRefreshAttempts(value: unknown, field: string): void {
  const summary = asRecord(value, field);
  assertExactKeys(
    summary,
    ['attemptedArtifactCount', 'failedAttemptCount', 'supersededAttemptCount', 'attemptReasons', 'oldestAttemptedAt', 'newestAttemptedAt'],
    field
  );
  ['attemptedArtifactCount', 'failedAttemptCount', 'supersededAttemptCount'].forEach(key => nonNegativeInteger(summary[key], `${field}.${key}`));
  stringArray(summary.attemptReasons, `${field}.attemptReasons`);
  ['oldestAttemptedAt', 'newestAttemptedAt'].forEach(key => {
    if (summary[key] !== undefined) isoTimestamp(summary[key], `${field}.${key}`);
  });
}

function validateCommitmentSpend(value: unknown, field: string): void {
  const spend = asRecord(value, field);
  assertExactKeys(
    spend,
    [
      'expenseCountWithCommitmentEvidence',
      'expenseCountWithoutCommitmentEvidence',
      'totalsByCurrency',
      'costViewByCurrency',
      'groupedByAmortizationSource',
    ],
    field
  );
  nonNegativeInteger(spend.expenseCountWithCommitmentEvidence, `${field}.expenseCountWithCommitmentEvidence`);
  nonNegativeInteger(spend.expenseCountWithoutCommitmentEvidence, `${field}.expenseCountWithoutCommitmentEvidence`);
  validateCostTotals(spend.totalsByCurrency, `${field}.totalsByCurrency`);
  validateCostViews(spend.costViewByCurrency, `${field}.costViewByCurrency`);
  if (!Array.isArray(spend.groupedByAmortizationSource)) throw new Error(`${field}.groupedByAmortizationSource must be an array.`);
  const sources: string[] = [];
  spend.groupedByAmortizationSource.forEach((entry, index) => {
    const itemField = `${field}.groupedByAmortizationSource[${index}]`;
    const source = asRecord(entry, itemField);
    assertExactKeys(source, ['amortizationSource', 'expenseCount', 'totalsByCurrency', 'costViewByCurrency'], itemField);
    sources.push(
      requiredEnum(source.amortizationSource, ['reservation-effective-cost', 'savings-plan-effective-cost'], `${itemField}.amortizationSource`)
    );
    nonNegativeInteger(source.expenseCount, `${itemField}.expenseCount`);
    validateCostTotals(source.totalsByCurrency, `${itemField}.totalsByCurrency`);
    validateCostViews(source.costViewByCurrency, `${itemField}.costViewByCurrency`);
  });
  assertUnique(sources, `${field}.groupedByAmortizationSource`);
}

function validateBenefitCoverage(value: unknown, field: string): void {
  const coverage = asRecord(value, field);
  assertExactKeys(
    coverage,
    ['authority', 'status', 'matchedExpenseCount', 'coveredExpenseCount', 'unclassifiedExpenseCount', 'byBenefitType'],
    field
  );
  assertValue(coverage.authority, 'persisted-billing-expense-amortization', `${field}.authority`);
  requiredEnum(coverage.status, ['available', 'partial-persisted-evidence', 'missing-persisted-evidence'], `${field}.status`);
  ['matchedExpenseCount', 'coveredExpenseCount', 'unclassifiedExpenseCount'].forEach(key => nonNegativeInteger(coverage[key], `${field}.${key}`));
  if (!Array.isArray(coverage.byBenefitType)) throw new Error(`${field}.byBenefitType must be an array.`);
  const types: string[] = [];
  coverage.byBenefitType.forEach((entry, index) => {
    const itemField = `${field}.byBenefitType[${index}]`;
    const benefit = asRecord(entry, itemField);
    assertExactKeys(benefit, ['benefitType', 'amortizationSource', 'expenseCount', 'totalsByCurrency', 'costViewByCurrency'], itemField);
    types.push(requiredEnum(benefit.benefitType, ['reserved-instance', 'savings-plan'], `${itemField}.benefitType`));
    requiredEnum(benefit.amortizationSource, ['reservation-effective-cost', 'savings-plan-effective-cost'], `${itemField}.amortizationSource`);
    nonNegativeInteger(benefit.expenseCount, `${itemField}.expenseCount`);
    validateCostTotals(benefit.totalsByCurrency, `${itemField}.totalsByCurrency`);
    validateCostViews(benefit.costViewByCurrency, `${itemField}.costViewByCurrency`);
  });
  assertUnique(types, `${field}.byBenefitType`);
}

function validateBenefitWarning(value: unknown, field: string): void {
  const warning = asRecord(value, field);
  assertExactKeys(warning, ['code', 'severity', 'matchedExpenseCount', 'unclassifiedExpenseCount', 'message'], field);
  requiredEnum(warning.code, ['ri-sp-coverage-evidence-missing', 'ri-sp-coverage-evidence-partial'], `${field}.code`);
  assertValue(warning.severity, 'warning', `${field}.severity`);
  nonNegativeInteger(warning.matchedExpenseCount, `${field}.matchedExpenseCount`);
  nonNegativeInteger(warning.unclassifiedExpenseCount, `${field}.unclassifiedExpenseCount`);
  requiredString(warning.message, `${field}.message`);
}

function validateCostTotals(value: unknown, field: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const currencies: string[] = [];
  value.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const total = asRecord(entry, itemField);
    assertExactKeys(total, ['currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'], itemField);
    currencies.push(requiredString(total.currency, `${itemField}.currency`));
    nonNegativeInteger(total.expenseCount, `${itemField}.expenseCount`);
    finiteNumber(total.baseCostAmount, `${itemField}.baseCostAmount`);
    if (total.amortizedCostAmount !== undefined) finiteNumber(total.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
    if (total.amortizedExpenseCount !== undefined) nonNegativeInteger(total.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
  });
  assertUnique(currencies, field);
}

function validateCostViews(value: unknown, field: string): void {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  const currencies: string[] = [];
  value.forEach((entry, index) => {
    const itemField = `${field}[${index}]`;
    const view = asRecord(entry, itemField);
    assertExactKeys(
      view,
      [
        'currency',
        'actualCostAmount',
        'amortizedCostAmount',
        'amortizedExpenseCount',
        'amortizationCoverageState',
        'actualVsAmortizedDeltaAmount',
        'commitmentCoverageState',
        'showAmortizedCosts',
      ],
      itemField
    );
    currencies.push(requiredString(view.currency, `${itemField}.currency`));
    finiteNumber(view.actualCostAmount, `${itemField}.actualCostAmount`);
    ['amortizedCostAmount', 'actualVsAmortizedDeltaAmount'].forEach(key => {
      if (view[key] !== undefined) finiteNumber(view[key], `${itemField}.${key}`);
    });
    if (view.amortizedExpenseCount !== undefined) nonNegativeInteger(view.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
    if (view.amortizationCoverageState !== undefined)
      requiredEnum(view.amortizationCoverageState, ['complete', 'partial', 'none', 'unavailable'], `${itemField}.amortizationCoverageState`);
    requiredEnum(
      view.commitmentCoverageState,
      ['discounted', 'no-amortized-cost', 'no-delta', 'amortized-exceeds-base', 'partial-amortized-cost', 'amortization-coverage-unavailable'],
      `${itemField}.commitmentCoverageState`
    );
    requiredBoolean(view.showAmortizedCosts, `${itemField}.showAmortizedCosts`);
  });
  assertUnique(currencies, field);
}

function percentage(value: unknown, field: string): number {
  const result = finiteNumber(value, field);
  if (result < 0 || result > 100) throw new Error(`${field} must be between 0 and 100.`);
  return result;
}

function httpsUrl(value: unknown, field: string): string {
  const result = requiredString(value, field);
  if (!result.startsWith('https://')) throw new Error(`${field} must be an HTTPS URL.`);
  return result;
}
