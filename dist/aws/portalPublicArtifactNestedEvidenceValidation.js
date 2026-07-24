"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResourceBillingEvidence = validateResourceBillingEvidence;
exports.validateRecommendationActionability = validateRecommendationActionability;
exports.validateTemplateProvenanceSources = validateTemplateProvenanceSources;
exports.validateRecommendationPosture = validateRecommendationPosture;
exports.validateSavingsByCurrency = validateSavingsByCurrency;
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
const portalPublicArtifactEvidenceValidation_1 = require("./portalPublicArtifactEvidenceValidation");
const ACTION_STATUSES = ['accepted', 'completed', 'failed', 'retryable-failure', 'skipped'];
const ACTION_TYPES = ['DeleteDBInstance', 'DeleteNatGateway', 'ModifyVolume', 'ModifyStorage', 'Rightsize'];
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
];
const SKIP_REASONS = [
    'recommendation-state-not-found',
    'source-recommendation-missing',
    'source-recommendation-not-found',
    'published-version-immutable',
    'provider-preflight-conflict',
    'provider-preflight-unsupported',
    'unsupported-recommendation-shape',
    'no-effective-provider-change',
];
const RECOMMENDATION_SOURCES = [
    'custom',
    'compute-optimizer',
    'cost-optimization-hub',
    'resilience-hub',
    'security-hub',
    'trusted-advisor',
    'well-architected',
];
function validateResourceBillingEvidence(value, field) {
    const billing = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(billing, ['costProvenance', 'matchedExpenseCount', 'totalsByCurrency', 'costViewByCurrency', 'commitmentSpend', 'benefitsCoverage', 'coverageWarning'], field);
    const provenance = (0, portalPublicArtifactValidationCommon_1.asRecord)(billing.costProvenance, `${field}.costProvenance`);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(provenance, ['costSource', 'costSourceConfidence'], `${field}.costProvenance`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(provenance.costSource, 'billing', `${field}.costProvenance.costSource`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(provenance.costSourceConfidence, 'high', `${field}.costProvenance.costSourceConfidence`);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(billing.matchedExpenseCount, `${field}.matchedExpenseCount`);
    validateCostTotals(billing.totalsByCurrency, `${field}.totalsByCurrency`);
    validateCostViews(billing.costViewByCurrency, `${field}.costViewByCurrency`);
    validateCommitmentSpend(billing.commitmentSpend, `${field}.commitmentSpend`);
    if (billing.benefitsCoverage !== undefined)
        validateBenefitCoverage(billing.benefitsCoverage, `${field}.benefitsCoverage`);
    if (billing.coverageWarning !== undefined)
        validateBenefitWarning(billing.coverageWarning, `${field}.coverageWarning`);
}
function validateRecommendationActionability(value, field) {
    const actionability = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(actionability, ['latestActionStableMaterializationKey', 'latestActionExecution', 'savingsVerification'], field);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(actionability.latestActionStableMaterializationKey, `${field}.latestActionStableMaterializationKey`);
    validateLatestAction(actionability.latestActionExecution, `${field}.latestActionExecution`);
    if (actionability.savingsVerification !== undefined)
        validateSavingsVerification(actionability.savingsVerification, `${field}.savingsVerification`);
}
function validateTemplateProvenanceSources(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const identities = [];
    value.forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, [
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
        ], itemField);
        const recommendationCode = (0, portalPublicArtifactValidationCommon_1.requiredString)(source.recommendationCode, `${itemField}.recommendationCode`);
        const relativePath = (0, portalPublicArtifactValidationCommon_1.requiredString)(source.relativePath, `${itemField}.relativePath`);
        identities.push(`${recommendationCode}|${relativePath}`);
        (0, portalPublicArtifactValidationCommon_1.requiredString)(source.templateId, `${itemField}.templateId`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(source.source, ['internal', 'external'], `${itemField}.source`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(source.format, ['canonical-v1', 'external-catalog-v1'], `${itemField}.format`);
        if (source.confidencePercentage !== undefined)
            percentage(source.confidencePercentage, `${itemField}.confidencePercentage`);
        if (source.confidenceReason !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(source.confidenceReason, `${itemField}.confidenceReason`);
        if (source.primarySourceUrl !== undefined)
            httpsUrl(source.primarySourceUrl, `${itemField}.primarySourceUrl`);
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(source.firstPartyValidationSourceCount, `${itemField}.firstPartyValidationSourceCount`);
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(source.communitySourceCount, `${itemField}.communitySourceCount`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, field);
}
function validateRecommendationPosture(value, field) {
    const posture = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(posture, ['sourceCount', 'sources'], field);
    const sourceCount = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(posture.sourceCount, `${field}.sourceCount`);
    if (!Array.isArray(posture.sources) || posture.sources.length !== sourceCount)
        throw new Error(`${field}.sources length must equal sourceCount.`);
    const sources = [];
    posture.sources.forEach((entry, index) => {
        const itemField = `${field}.sources[${index}]`;
        const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, ['source', 'sourceEvidence', 'actionHealth'], itemField);
        sources.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(source.source, RECOMMENDATION_SOURCES, `${itemField}.source`));
        if (source.sourceEvidence !== undefined)
            (0, portalPublicArtifactEvidenceValidation_1.validateRecommendationSourceEvidence)(source.sourceEvidence, `${itemField}.sourceEvidence`);
        if (source.actionHealth !== undefined)
            (0, portalPublicArtifactEvidenceValidation_1.validateRecommendationActionHealth)(source.actionHealth, `${itemField}.actionHealth`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(sources, `${field}.sources`);
}
function validateSavingsByCurrency(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const currencies = [];
    value.forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, ['currencyCode', 'recommendationCount', 'totalEstimatedMonthlySavings'], itemField);
        currencies.push((0, portalPublicArtifactValidationCommon_1.requiredString)(item.currencyCode, `${itemField}.currencyCode`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.recommendationCount, `${itemField}.recommendationCount`);
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(item.totalEstimatedMonthlySavings, `${itemField}.totalEstimatedMonthlySavings`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(currencies, field);
}
function validateLatestAction(value, field) {
    const action = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
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
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(action, keys, field);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(action.status, ACTION_STATUSES, `${field}.status`);
    const recordedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(action.recordedAt, `${field}.recordedAt`);
    const requestedAt = (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(action.requestedAt, `${field}.requestedAt`);
    if (Date.parse(requestedAt) > Date.parse(recordedAt))
        throw new Error(`${field}.requestedAt must not exceed recordedAt.`);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(action.requestId, `${field}.requestId`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(action.requestedBy, 'manual', `${field}.requestedBy`);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(action.actionType, ACTION_TYPES, `${field}.actionType`);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(action.providerAction, PROVIDER_ACTIONS, `${field}.providerAction`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(action.completionMode, 'provider-poll', `${field}.completionMode`);
    ['acceptedAt', 'completedAt', 'failedAt'].forEach(key => {
        if (action[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(action[key], `${field}.${key}`);
    });
    ['providerRequestId', 'currentResourceSummary', 'recommendedResourceSummary', 'sourceTitle', 'currencyCode', 'message'].forEach(key => {
        if (action[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(action[key], `${field}.${key}`);
    });
    ['estimatedMonthlySavings', 'estimatedSavingsPercentage'].forEach(key => {
        if (action[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(action[key], `${field}.${key}`);
    });
    if (action.skipReason !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(action.skipReason, SKIP_REASONS, `${field}.skipReason`);
    ['implementationChanged', 'implementationImplemented', 'implementationPreviouslyImplemented'].forEach(key => {
        if (action[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(action[key], `${field}.${key}`);
    });
}
function validateSavingsVerification(value, field) {
    const verification = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
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
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(verification, [...required, ...optional], field);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(verification.verificationStatus, [
        'pending-post-action-refresh',
        'recommendation-absent-after-refresh',
        'recommendation-still-present-after-refresh',
        'post-action-evidence-truncated',
    ], `${field}.verificationStatus`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(verification.artifactType, 'recommendations', `${field}.artifactType`);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(verification.actionRequestId, `${field}.actionRequestId`);
    (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(verification.actionCompletedAt, `${field}.actionCompletedAt`);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(verification.postActionEvidenceStatus, ['qualified', 'refresh-pending', 'missing', 'stale', 'unqualified'], `${field}.postActionEvidenceStatus`);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(verification.postActionEvidenceReason, [
        'qualified-post-action-artifact',
        'canonical-refresh-row-pending',
        'canonical-refresh-row-missing',
        'artifact-generated-before-action-completion',
        'artifact-refresh-request-mismatch',
        'artifact-refresh-trigger-mismatch',
        'artifact-changed-key-missing',
        'artifact-type-mismatch',
    ], `${field}.postActionEvidenceReason`);
    ['postActionArtifactGeneratedAt', 'postActionPendingRefreshRequestedAt', 'postActionPendingRefreshUpdatedAt'].forEach(key => {
        if (verification[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(verification[key], `${field}.${key}`);
    });
    if (verification.postActionRefreshRequestId !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredString)(verification.postActionRefreshRequestId, `${field}.postActionRefreshRequestId`);
    if (verification.postActionPendingRefreshSummary !== undefined)
        validatePendingRefresh(verification.postActionPendingRefreshSummary, `${field}.postActionPendingRefreshSummary`);
    if (verification.postActionRetainedRefreshAttemptSummary !== undefined)
        validateRefreshAttempts(verification.postActionRetainedRefreshAttemptSummary, `${field}.postActionRetainedRefreshAttemptSummary`);
    if (verification.postActionSourcePresence !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(verification.postActionSourcePresence, ['current', 'missing'], `${field}.postActionSourcePresence`);
    optional
        .filter(key => key.includes('Estimated'))
        .forEach(key => {
        if (verification[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(verification[key], `${field}.${key}`);
    });
    ['actionCurrencyCode', 'currentCurrencyCode'].forEach(key => {
        if (verification[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(verification[key], `${field}.${key}`);
    });
    if (verification.currencyCodesMatch !== undefined)
        (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(verification.currencyCodesMatch, `${field}.currencyCodesMatch`);
}
function validatePendingRefresh(value, field) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, ['pendingArtifactCount', 'pendingArtifactTypes', 'oldestPendingRefreshUpdatedAt', 'newestPendingRefreshUpdatedAt', 'executionAttemptSummary'], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary.pendingArtifactCount, `${field}.pendingArtifactCount`);
    (0, portalPublicArtifactValidationCommon_1.stringArray)(summary.pendingArtifactTypes, `${field}.pendingArtifactTypes`).forEach(type => (0, portalPublicArtifactValidationCommon_1.requiredEnum)(type, ['recommendations', 'resource-recommendations', 'resource-type-recommendations'], `${field}.pendingArtifactTypes`));
    ['oldestPendingRefreshUpdatedAt', 'newestPendingRefreshUpdatedAt'].forEach(key => {
        if (summary[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(summary[key], `${field}.${key}`);
    });
    if (summary.executionAttemptSummary !== undefined)
        validateRefreshAttempts(summary.executionAttemptSummary, `${field}.executionAttemptSummary`);
}
function validateRefreshAttempts(value, field) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, ['attemptedArtifactCount', 'failedAttemptCount', 'supersededAttemptCount', 'attemptReasons', 'oldestAttemptedAt', 'newestAttemptedAt'], field);
    ['attemptedArtifactCount', 'failedAttemptCount', 'supersededAttemptCount'].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary[key], `${field}.${key}`));
    (0, portalPublicArtifactValidationCommon_1.stringArray)(summary.attemptReasons, `${field}.attemptReasons`);
    ['oldestAttemptedAt', 'newestAttemptedAt'].forEach(key => {
        if (summary[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(summary[key], `${field}.${key}`);
    });
}
function validateCommitmentSpend(value, field) {
    const spend = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(spend, [
        'expenseCountWithCommitmentEvidence',
        'expenseCountWithoutCommitmentEvidence',
        'totalsByCurrency',
        'costViewByCurrency',
        'groupedByAmortizationSource',
    ], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(spend.expenseCountWithCommitmentEvidence, `${field}.expenseCountWithCommitmentEvidence`);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(spend.expenseCountWithoutCommitmentEvidence, `${field}.expenseCountWithoutCommitmentEvidence`);
    validateCostTotals(spend.totalsByCurrency, `${field}.totalsByCurrency`);
    validateCostViews(spend.costViewByCurrency, `${field}.costViewByCurrency`);
    if (!Array.isArray(spend.groupedByAmortizationSource))
        throw new Error(`${field}.groupedByAmortizationSource must be an array.`);
    const sources = [];
    spend.groupedByAmortizationSource.forEach((entry, index) => {
        const itemField = `${field}.groupedByAmortizationSource[${index}]`;
        const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, ['amortizationSource', 'expenseCount', 'totalsByCurrency', 'costViewByCurrency'], itemField);
        sources.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(source.amortizationSource, ['reservation-effective-cost', 'savings-plan-effective-cost'], `${itemField}.amortizationSource`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(source.expenseCount, `${itemField}.expenseCount`);
        validateCostTotals(source.totalsByCurrency, `${itemField}.totalsByCurrency`);
        validateCostViews(source.costViewByCurrency, `${itemField}.costViewByCurrency`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(sources, `${field}.groupedByAmortizationSource`);
}
function validateBenefitCoverage(value, field) {
    const coverage = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(coverage, ['authority', 'status', 'matchedExpenseCount', 'coveredExpenseCount', 'unclassifiedExpenseCount', 'byBenefitType'], field);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(coverage.authority, 'persisted-billing-expense-amortization', `${field}.authority`);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(coverage.status, ['available', 'partial-persisted-evidence', 'missing-persisted-evidence'], `${field}.status`);
    ['matchedExpenseCount', 'coveredExpenseCount', 'unclassifiedExpenseCount'].forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(coverage[key], `${field}.${key}`));
    if (!Array.isArray(coverage.byBenefitType))
        throw new Error(`${field}.byBenefitType must be an array.`);
    const types = [];
    coverage.byBenefitType.forEach((entry, index) => {
        const itemField = `${field}.byBenefitType[${index}]`;
        const benefit = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(benefit, ['benefitType', 'amortizationSource', 'expenseCount', 'totalsByCurrency', 'costViewByCurrency'], itemField);
        types.push((0, portalPublicArtifactValidationCommon_1.requiredEnum)(benefit.benefitType, ['reserved-instance', 'savings-plan'], `${itemField}.benefitType`));
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(benefit.amortizationSource, ['reservation-effective-cost', 'savings-plan-effective-cost'], `${itemField}.amortizationSource`);
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(benefit.expenseCount, `${itemField}.expenseCount`);
        validateCostTotals(benefit.totalsByCurrency, `${itemField}.totalsByCurrency`);
        validateCostViews(benefit.costViewByCurrency, `${itemField}.costViewByCurrency`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(types, `${field}.byBenefitType`);
}
function validateBenefitWarning(value, field) {
    const warning = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(warning, ['code', 'severity', 'matchedExpenseCount', 'unclassifiedExpenseCount', 'message'], field);
    (0, portalPublicArtifactValidationCommon_1.requiredEnum)(warning.code, ['ri-sp-coverage-evidence-missing', 'ri-sp-coverage-evidence-partial'], `${field}.code`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(warning.severity, 'warning', `${field}.severity`);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(warning.matchedExpenseCount, `${field}.matchedExpenseCount`);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(warning.unclassifiedExpenseCount, `${field}.unclassifiedExpenseCount`);
    (0, portalPublicArtifactValidationCommon_1.requiredString)(warning.message, `${field}.message`);
}
function validateCostTotals(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const currencies = [];
    value.forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const total = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(total, ['currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'], itemField);
        currencies.push((0, portalPublicArtifactValidationCommon_1.requiredString)(total.currency, `${itemField}.currency`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(total.expenseCount, `${itemField}.expenseCount`);
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(total.baseCostAmount, `${itemField}.baseCostAmount`);
        if (total.amortizedCostAmount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(total.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
        if (total.amortizedExpenseCount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(total.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(currencies, field);
}
function validateCostViews(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const currencies = [];
    value.forEach((entry, index) => {
        const itemField = `${field}[${index}]`;
        const view = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(view, [
            'currency',
            'actualCostAmount',
            'amortizedCostAmount',
            'amortizedExpenseCount',
            'amortizationCoverageState',
            'actualVsAmortizedDeltaAmount',
            'commitmentCoverageState',
            'showAmortizedCosts',
        ], itemField);
        currencies.push((0, portalPublicArtifactValidationCommon_1.requiredString)(view.currency, `${itemField}.currency`));
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(view.actualCostAmount, `${itemField}.actualCostAmount`);
        ['amortizedCostAmount', 'actualVsAmortizedDeltaAmount'].forEach(key => {
            if (view[key] !== undefined)
                (0, portalPublicArtifactValidationCommon_1.finiteNumber)(view[key], `${itemField}.${key}`);
        });
        if (view.amortizedExpenseCount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(view.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
        if (view.amortizationCoverageState !== undefined)
            (0, portalPublicArtifactValidationCommon_1.requiredEnum)(view.amortizationCoverageState, ['complete', 'partial', 'none', 'unavailable'], `${itemField}.amortizationCoverageState`);
        (0, portalPublicArtifactValidationCommon_1.requiredEnum)(view.commitmentCoverageState, ['discounted', 'no-amortized-cost', 'no-delta', 'amortized-exceeds-base', 'partial-amortized-cost', 'amortization-coverage-unavailable'], `${itemField}.commitmentCoverageState`);
        (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(view.showAmortizedCosts, `${itemField}.showAmortizedCosts`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(currencies, field);
}
function percentage(value, field) {
    const result = (0, portalPublicArtifactValidationCommon_1.finiteNumber)(value, field);
    if (result < 0 || result > 100)
        throw new Error(`${field} must be between 0 and 100.`);
    return result;
}
function httpsUrl(value, field) {
    const result = (0, portalPublicArtifactValidationCommon_1.requiredString)(value, field);
    if (!result.startsWith('https://'))
        throw new Error(`${field} must be an HTTPS URL.`);
    return result;
}
//# sourceMappingURL=portalPublicArtifactNestedEvidenceValidation.js.map