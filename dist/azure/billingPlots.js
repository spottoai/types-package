"use strict";
/**
 * Billing cost analysis types for Azure cost visualization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBillingCostAnalysisReadResponse = exports.isBillingCostAnalysisVerifiedReadResponse = exports.isBillingCostAnalysisLegacyFallbackResponse = exports.isBillingCostAnalysisMetadataV2 = exports.isBillingCostAnalysisBusinessPayloadV1 = void 0;
const artifactEvidence_js_1 = require("../common/artifactEvidence.js");
const artifactControlData_js_1 = require("../common/artifactControlData.js");
const artifactEvidenceValidation_js_1 = require("../common/artifactEvidenceValidation.js");
const billingArtifactEvidence_js_1 = require("./billingArtifactEvidence.js");
const LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS = [
    'schemaVersion',
    'ownership',
    'revision',
    'authority',
    'documentType',
    'publicationMode',
    'status',
    'generationId',
    'inputManifestDigest',
    'outputBindingDigest',
    'outputManifestDigest',
    'manifestDigest',
    'observationDigest',
    'sha256',
    'artifactEvidence',
    'publicationDecision',
    'artifacts',
    'manifestPath',
    'inputManifestPath',
    'outputManifestPath',
    'byteLength',
    'byteCount',
    'rowCount',
    'contentEncoding',
    'mediaType',
    'etag',
    'versionId',
    'publicationKey',
    'coveragePlanDigest',
    'messageId',
    'eventId',
    'correlationId',
    'idempotencyKey',
    'inputState',
    'processingState',
    'evaluation',
    'dependencies',
    'claims',
    'issues',
    'completedAt',
    'observedAt',
    'enqueuedAt',
];
const BILLING_FORBIDDEN_CONTROL_FIELDS = new Set([
    ...LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS,
    'artifactState',
    'artifactSource',
    'digest',
    'fingerprint',
    'checksum',
    'hash',
    'subscriptionId',
    'provider',
    'tenantId',
    'companyId',
    'cloudAccountId',
    'accountId',
    'ownershipEpochRevision',
    'sourceRevision',
    'policyRevision',
    'processing',
    'evidence',
    'publication',
    'required',
    'support',
    'applicability',
    'attempt',
    'coverage',
    'emptyEvidence',
    'freshness',
    'reasonCode',
    'acceptedRowCount',
    'emptyProofRef',
    'claimId',
    'sectionPaths',
    'requiredDependencies',
    'code',
    'blocking',
    'dependency',
].map(field => field.toLowerCase()));
const BILLING_DOCUMENT_STATES = new Set(['current', 'stale', 'partial', 'complete-empty']);
const BILLING_VERIFIED_READ_STATES = new Set(['current', 'stale', 'complete-empty']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isOptionalFiniteNumber = (value) => value === undefined || isFiniteNumber(value);
const isNullableFiniteNumber = (value) => value === null || isFiniteNumber(value);
const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const isPositiveInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
const isStringArray = (value) => Array.isArray(value) && value.every(isNonEmptyString);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const isPathSegment = (value) => isNonEmptyString(value) && !/[\\/?#%]/.test(value) && !hasControlCharacters(value) && value !== '.' && value !== '..';
const publicationDecisionReferencesDigest = (value, digest) => isRecord(value) && Array.isArray(value.dependencies) && value.dependencies.some(dependency => isRecord(dependency) && dependency.digest === digest);
const allowedBillingCostAnalysisFields = (value, validationBranch) => {
    const fields = [];
    const allowText = (object, ...keys) => {
        if (!isRecord(object))
            return;
        for (const key of keys)
            fields.push({ object, key, allowUriScheme: true, allowDigestLike: true, allowControlField: true });
    };
    const allowTextArray = (object, key) => {
        if (isRecord(object)) {
            fields.push({ object, key, allowUriSchemeInStringArray: true, allowDigestLike: true, allowControlField: true });
        }
    };
    const allowControl = (object, ...keys) => {
        if (!isRecord(object))
            return;
        for (const key of keys)
            fields.push({ object, key, allowControlField: true });
    };
    const allowDigest = (object, key) => {
        if (isRecord(object))
            fields.push({ object, key, allowDigestLike: true, allowControlField: true });
    };
    const allowChildren = (object, ...keys) => {
        if (!isRecord(object))
            return;
        for (const key of keys)
            fields.push({ object, key, allowChildArtifactFields: true });
    };
    allowText(value, 'subscriptionId', 'billingGenerationId', 'currencyCode', 'currencySymbol', 'forecastMethod');
    allowControl(value, 'schemaVersion', 'ownership', 'revision', 'artifactEvidence');
    allowChildren(value, 'ownership', 'revision', 'artifactEvidence', 'chartData', 'anomalies');
    if (validationBranch !== 'business-v1')
        allowControl(value, 'artifactState');
    if (validationBranch === 'legacy-fallback')
        allowControl(value, 'artifactSource');
    allowDigest(value, 'inputManifestDigest');
    allowDigest(value, 'outputBindingDigest');
    if (isRecord(value.ownership)) {
        allowControl(value.ownership, 'provider', 'ownershipEpochRevision');
        allowText(value.ownership, 'tenantId', 'companyId', 'cloudAccountId', 'accountId');
    }
    if (isRecord(value.revision))
        allowControl(value.revision, 'ownershipEpochRevision', 'sourceRevision', 'policyRevision');
    if (isRecord(value.artifactEvidence)) {
        const evidence = value.artifactEvidence;
        allowControl(evidence, 'processing', 'evidence', 'publication', 'dependencies', 'claims', 'issues');
        allowChildren(evidence, 'dependencies', 'claims', 'issues');
        if (Array.isArray(evidence.dependencies)) {
            for (const dependency of evidence.dependencies) {
                allowControl(dependency, 'required', 'support', 'applicability', 'attempt', 'coverage', 'emptyEvidence', 'freshness', 'evidence', 'publication', 'sourceRevision', 'policyRevision', 'acceptedRowCount', 'emptyProofRef');
                allowText(dependency, 'name', 'reasonCode', 'generationId');
                allowDigest(dependency, 'digest');
                if (isRecord(dependency) && isRecord(dependency.observedRange)) {
                    allowChildren(dependency, 'observedRange');
                    allowText(dependency.observedRange, 'timeZone');
                }
            }
        }
        if (Array.isArray(evidence.claims)) {
            for (const claim of evidence.claims) {
                allowControl(claim, 'evidence', 'publication', 'issues');
                allowText(claim, 'claimId');
                allowTextArray(claim, 'sectionPaths');
                allowTextArray(claim, 'requiredDependencies');
                if (!isRecord(claim) || !Array.isArray(claim.issues))
                    continue;
                allowChildren(claim, 'issues');
                for (const issue of claim.issues) {
                    allowControl(issue, 'blocking');
                    allowText(issue, 'code', 'dependency');
                }
            }
        }
        if (Array.isArray(evidence.issues)) {
            for (const issue of evidence.issues) {
                allowControl(issue, 'blocking');
                allowText(issue, 'code', 'dependency');
            }
        }
    }
    if (isRecord(value.chartData)) {
        allowControl(value.chartData, 'schemaVersion');
        allowText(value.chartData, 'source');
        allowChildren(value.chartData, 'dataWindow', 'views', 'detectors');
        if (isRecord(value.chartData.views)) {
            for (const [viewKey, view] of Object.entries(value.chartData.views)) {
                allowChildren(value.chartData.views, viewKey);
                allowText(view, 'aggregation', 'forecastMethod');
                if (!isRecord(view))
                    continue;
                allowChildren(view, 'trend', 'points', 'actualPoints', 'forecastPoints', 'fittedPoints');
                allowText(view.trend, 'method');
                for (const pointsKey of ['points', 'actualPoints', 'forecastPoints', 'fittedPoints']) {
                    const points = view[pointsKey];
                    if (!Array.isArray(points))
                        continue;
                    for (const point of points) {
                        allowText(point, 'date', 'month');
                        allowTextArray(point, 'anomalyMethods');
                    }
                }
            }
        }
        if (isRecord(value.chartData.detectors) && Array.isArray(value.chartData.detectors.methods)) {
            allowChildren(value.chartData.detectors, 'methods');
            for (const method of value.chartData.detectors.methods)
                allowText(method, 'name', 'status', 'error');
        }
    }
    if (!Array.isArray(value.anomalies))
        return fields;
    for (const anomaly of value.anomalies) {
        allowText(anomaly, 'summary', 'confidence');
        allowTextArray(anomaly, 'notes');
        if (!isRecord(anomaly) || !Array.isArray(anomaly.drivers))
            continue;
        allowChildren(anomaly, 'impact', 'drivers');
        for (const driver of anomaly.drivers) {
            allowText(driver, 'type', 'name', 'summary');
            if (!isRecord(driver) || !Array.isArray(driver.resources))
                continue;
            allowChildren(driver, 'resources');
            for (const resource of driver.resources)
                allowText(resource, 'name', 'resourceScope', 'summary');
        }
    }
    return fields;
};
const containsForbiddenBillingCostAnalysisControlData = (value, validationBranch) => (0, artifactControlData_js_1.containsForbiddenArtifactControlData)(value, allowedBillingCostAnalysisFields(value, validationBranch), {
    rejectDigestLikeValues: true,
    requireSafeAzureResourceIds: true,
    forbiddenControlFields: BILLING_FORBIDDEN_CONTROL_FIELDS,
    requireAllowedFieldTraversalContext: true,
});
const isTrend = (value) => isRecord(value) && isNonEmptyString(value.method) && isFiniteNumber(value.slope) && isFiniteNumber(value.intercept);
const isDailyPoint = (value) => isRecord(value) &&
    isNonEmptyString(value.date) &&
    isFiniteNumber(value.timestamp) &&
    isFiniteNumber(value.cost) &&
    typeof value.isAnomaly === 'boolean' &&
    isNonNegativeInteger(value.anomalyVotes) &&
    isOptionalFiniteNumber(value.trendCost) &&
    (value.anomalyMethods === undefined || isStringArray(value.anomalyMethods));
const isForecastPoint = (value) => isRecord(value) &&
    isNonEmptyString(value.date) &&
    isFiniteNumber(value.timestamp) &&
    isFiniteNumber(value.cost) &&
    isOptionalFiniteNumber(value.trendCost);
const isMonthlyPoint = (value) => isRecord(value) &&
    /^\d{4}-\d{2}$/.test(String(value.month)) &&
    isFiniteNumber(value.startDate) &&
    isFiniteNumber(value.endDate) &&
    isFiniteNumber(value.cost) &&
    isFiniteNumber(value.averageDailyCost) &&
    isNonNegativeInteger(value.anomalyCount) &&
    isOptionalFiniteNumber(value.trendCost) &&
    (value.anomalyDates === undefined || (Array.isArray(value.anomalyDates) && value.anomalyDates.every(isFiniteNumber)));
const hasCommonChartViewFields = (value) => isFiniteNumber(value.startDate) &&
    isFiniteNumber(value.endDate) &&
    isFiniteNumber(value.averageDailyCost) &&
    isFiniteNumber(value.totalCost) &&
    (value.trend === undefined || isTrend(value.trend));
const isChartView = (value) => {
    if (!isRecord(value) || (value.trend !== undefined && !isTrend(value.trend)))
        return false;
    if (value.forecastMethod !== undefined) {
        return (value.aggregation === 'daily' &&
            isNonEmptyString(value.forecastMethod) &&
            [value.startDate, value.endDate, value.actualTotalCost, value.forecastRemaining, value.forecastMonthTotal].every(isFiniteNumber) &&
            Array.isArray(value.actualPoints) &&
            value.actualPoints.every(isDailyPoint) &&
            Array.isArray(value.forecastPoints) &&
            value.forecastPoints.every(isForecastPoint) &&
            Array.isArray(value.fittedPoints) &&
            value.fittedPoints.every(isForecastPoint));
    }
    if (!hasCommonChartViewFields(value) || !Array.isArray(value.points))
        return false;
    if (value.aggregation === 'daily')
        return value.points.every(isDailyPoint);
    if (value.aggregation === 'monthly')
        return value.points.every(isMonthlyPoint);
    return false;
};
const isChartData = (value) => {
    if (!isRecord(value) || !isPositiveInteger(value.schemaVersion) || !isNonEmptyString(value.source))
        return false;
    if (!isRecord(value.dataWindow) ||
        !isFiniteNumber(value.dataWindow.startDate) ||
        !isFiniteNumber(value.dataWindow.endDate) ||
        !isNonNegativeInteger(value.dataWindow.pointCount)) {
        return false;
    }
    if (!isRecord(value.views) || !Object.values(value.views).every(view => view === undefined || isChartView(view)))
        return false;
    if (!isRecord(value.detectors) || !isFiniteNumber(value.detectors.threshold) || !Array.isArray(value.detectors.methods))
        return false;
    return value.detectors.methods.every(method => isRecord(method) &&
        isNonEmptyString(method.name) &&
        (method.status === undefined || isNonEmptyString(method.status)) &&
        (method.error === undefined || method.error === null || typeof method.error === 'string') &&
        Array.isArray(method.triggeredDates) &&
        method.triggeredDates.every(isFiniteNumber));
};
const isDriverResource = (value) => isRecord(value) &&
    isNonEmptyString(value.name) &&
    (value.resourceScope === undefined || isNonEmptyString(value.resourceScope)) &&
    (value.resourceId === undefined || isNonEmptyString(value.resourceId)) &&
    (value.isSubscriptionLevel === undefined || typeof value.isSubscriptionLevel === 'boolean') &&
    isFiniteNumber(value.cost) &&
    isNullableFiniteNumber(value.baseline) &&
    isFiniteNumber(value.delta) &&
    isNullableFiniteNumber(value.percentChange) &&
    typeof value.isNew === 'boolean' &&
    isNonEmptyString(value.summary);
const isAnomaly = (value) => {
    if (!isRecord(value) || !isFiniteNumber(value.date) || !isNonEmptyString(value.summary) || !isNonEmptyString(value.confidence))
        return false;
    if (!isStringArray(value.notes) || !isRecord(value.impact) || !Array.isArray(value.drivers))
        return false;
    const impact = value.impact;
    const impactRequired = ['cost', 'delta', 'monthToDateCost'];
    const impactNullable = [
        'baseline7Day',
        'baseline30Day',
        'percentChange',
        'previousDayCost',
        'previousDayDelta',
        'monthToDateBaseline',
        'monthToDateDelta',
        'monthToDatePercentChange',
    ];
    if (!impactRequired.every(field => isFiniteNumber(impact[field])) || !impactNullable.every(field => isNullableFiniteNumber(impact[field]))) {
        return false;
    }
    return value.drivers.every(driver => isRecord(driver) &&
        isNonEmptyString(driver.type) &&
        isNonEmptyString(driver.name) &&
        isNonEmptyString(driver.summary) &&
        isFiniteNumber(driver.cost) &&
        isFiniteNumber(driver.delta) &&
        isNullableFiniteNumber(driver.baseline) &&
        isNullableFiniteNumber(driver.percentChange) &&
        isFiniteNumber(driver.shareOfImpactPercent) &&
        typeof driver.isNew === 'boolean' &&
        Array.isArray(driver.resources) &&
        driver.resources.every(isDriverResource));
};
const hasValidMetadataEvidenceState = (state, evidence, billingGenerationId, inputManifestDigest, chartData, anomalies) => {
    if (state === 'partial')
        return (0, billingArtifactEvidence_js_1.isBillingPartialArtifactPublicationDecision)(evidence, billingGenerationId, inputManifestDigest);
    if (!(0, billingArtifactEvidence_js_1.isBillingCompletedArtifactPublicationDecision)(evidence, billingGenerationId, inputManifestDigest))
        return false;
    if (state !== 'complete-empty')
        return true;
    if (!Array.isArray(anomalies))
        return false;
    const billingHistory = evidence.dependencies.find(dependency => dependency.name === 'billing-history');
    if (!isRecord(chartData))
        return false;
    const dataWindow = chartData.dataWindow;
    const views = chartData.views;
    return (billingHistory?.emptyEvidence === 'complete-empty' &&
        billingHistory.acceptedRowCount === 0 &&
        isNonEmptyString(billingHistory.emptyProofRef) &&
        isRecord(dataWindow) &&
        dataWindow.pointCount === 0 &&
        isRecord(views) &&
        Object.values(views).every(view => view === undefined) &&
        anomalies.length === 0);
};
const hasValidBillingCostAnalysisBusinessFields = (value) => {
    if (!isPathSegment(value.subscriptionId) || !isPathSegment(value.billingGenerationId))
        return false;
    if (!isChartData(value.chartData) || !Array.isArray(value.anomalies) || !value.anomalies.every(isAnomaly))
        return false;
    if (!isNonEmptyString(value.currencyCode) || !isNonEmptyString(value.currencySymbol))
        return false;
    if (value.forecastMethod !== undefined && !isNonEmptyString(value.forecastMethod))
        return false;
    return [value.forecastMonthTotal, value.forecastRemaining, value.forecastPeriodEnd].every(isOptionalFiniteNumber);
};
const isBillingCostAnalysisBusinessPayloadForBranch = (value, validationBranch) => !containsForbiddenBillingCostAnalysisControlData(value, validationBranch) &&
    !LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS.some(field => hasOwn(value, field)) &&
    hasValidBillingCostAnalysisBusinessFields(value);
/** Dependency-free validator for the complete legacy V1 business payload. */
const isBillingCostAnalysisBusinessPayloadV1 = (value) => isRecord(value) && isBillingCostAnalysisBusinessPayloadForBranch(value, 'business-v1');
exports.isBillingCostAnalysisBusinessPayloadV1 = isBillingCostAnalysisBusinessPayloadV1;
/** Dependency-free validator for customer-readable V2 billing metadata. */
const isBillingCostAnalysisMetadataV2 = (value) => {
    if (!isRecord(value) || containsForbiddenBillingCostAnalysisControlData(value, 'metadata-v2') || value.schemaVersion !== 2)
        return false;
    if (hasOwn(value, 'outputManifestDigest'))
        return false;
    if (!isPathSegment(value.subscriptionId) || !isPathSegment(value.billingGenerationId))
        return false;
    if (!(0, artifactEvidence_js_1.isArtifactOwnershipBinding)(value.ownership) || value.ownership.provider !== 'azure' || value.ownership.accountId !== value.subscriptionId)
        return false;
    if (!(0, artifactEvidenceValidation_js_1.isArtifactRevisionVector)(value.revision) || value.ownership.ownershipEpochRevision !== value.revision.ownershipEpochRevision) {
        return false;
    }
    if (typeof value.artifactState !== 'string' || !BILLING_DOCUMENT_STATES.has(value.artifactState))
        return false;
    if (typeof value.inputManifestDigest !== 'string' || !SHA256_PATTERN.test(value.inputManifestDigest))
        return false;
    if (typeof value.outputBindingDigest !== 'string' || !SHA256_PATTERN.test(value.outputBindingDigest))
        return false;
    if (value.outputBindingDigest === value.inputManifestDigest ||
        publicationDecisionReferencesDigest(value.artifactEvidence, value.outputBindingDigest)) {
        return false;
    }
    if (!hasValidBillingCostAnalysisBusinessFields(value))
        return false;
    if (!hasValidMetadataEvidenceState(value.artifactState, value.artifactEvidence, value.billingGenerationId, value.inputManifestDigest, value.chartData, value.anomalies)) {
        return false;
    }
    return true;
};
exports.isBillingCostAnalysisMetadataV2 = isBillingCostAnalysisMetadataV2;
/** Dependency-free validator for an explicit legacy-transition fallback response. */
const isBillingCostAnalysisLegacyFallbackResponse = (value) => isRecord(value) &&
    value.artifactState === 'fallback' &&
    value.artifactSource === 'legacy-transition' &&
    isBillingCostAnalysisBusinessPayloadForBranch(value, 'legacy-fallback');
exports.isBillingCostAnalysisLegacyFallbackResponse = isBillingCostAnalysisLegacyFallbackResponse;
/** Dependency-free validator for an evidence-verified endpoint response. */
const isBillingCostAnalysisVerifiedReadResponse = (value) => (0, exports.isBillingCostAnalysisMetadataV2)(value) && BILLING_VERIFIED_READ_STATES.has(value.artifactState);
exports.isBillingCostAnalysisVerifiedReadResponse = isBillingCostAnalysisVerifiedReadResponse;
/** Dependency-free validator for the successful billing read-response union. */
const isBillingCostAnalysisReadResponse = (value) => (0, exports.isBillingCostAnalysisVerifiedReadResponse)(value) || (0, exports.isBillingCostAnalysisLegacyFallbackResponse)(value);
exports.isBillingCostAnalysisReadResponse = isBillingCostAnalysisReadResponse;
//# sourceMappingURL=billingPlots.js.map