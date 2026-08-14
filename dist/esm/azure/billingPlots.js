/**
 * Billing cost analysis types for Azure cost visualization.
 */
import { isArtifactOwnershipBinding, } from '../common/artifactEvidence.js';
import { containsForbiddenArtifactControlData } from '../common/artifactControlData.js';
import { isArtifactRevisionVector } from '../common/artifactEvidenceValidation.js';
import { isBillingCompletedArtifactPublicationDecision, isBillingPartialArtifactPublicationDecision, } from './billingArtifactEvidence.js';
const BILLING_DOCUMENT_STATES = new Set(['current', 'stale', 'partial', 'fallback', 'complete-empty']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isOptionalFiniteNumber = (value) => value === undefined || isFiniteNumber(value);
const isNullableFiniteNumber = (value) => value === null || isFiniteNumber(value);
const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
const isPositiveInteger = (value) => Number.isSafeInteger(value) && Number(value) > 0;
const isStringArray = (value) => Array.isArray(value) && value.every(isNonEmptyString);
const hasControlCharacters = (value) => Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const isPathSegment = (value) => isNonEmptyString(value) && !/[\\/?#%]/.test(value) && !hasControlCharacters(value) && value !== '.' && value !== '..';
const publicationDecisionReferencesDigest = (value, digest) => isRecord(value) && Array.isArray(value.dependencies) && value.dependencies.some(dependency => isRecord(dependency) && dependency.digest === digest);
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
        return isBillingPartialArtifactPublicationDecision(evidence, billingGenerationId, inputManifestDigest);
    if (!isBillingCompletedArtifactPublicationDecision(evidence, billingGenerationId, inputManifestDigest))
        return false;
    if (state !== 'complete-empty')
        return true;
    const billingHistory = evidence.dependencies.find(dependency => dependency.name === 'billing-history');
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
/** Dependency-free validator for customer-readable V2 billing metadata. */
export const isBillingCostAnalysisMetadataV2 = (value) => {
    if (!isRecord(value) || containsForbiddenArtifactControlData(value) || value.schemaVersion !== 2)
        return false;
    if (Object.prototype.hasOwnProperty.call(value, 'outputManifestDigest'))
        return false;
    if (!isPathSegment(value.subscriptionId) || !isPathSegment(value.billingGenerationId))
        return false;
    if (!isArtifactOwnershipBinding(value.ownership) || value.ownership.provider !== 'azure' || value.ownership.accountId !== value.subscriptionId)
        return false;
    if (!isArtifactRevisionVector(value.revision) || value.ownership.ownershipEpochRevision !== value.revision.ownershipEpochRevision) {
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
    if (!isChartData(value.chartData) || !Array.isArray(value.anomalies) || !value.anomalies.every(isAnomaly))
        return false;
    if (!hasValidMetadataEvidenceState(value.artifactState, value.artifactEvidence, value.billingGenerationId, value.inputManifestDigest, value.chartData, value.anomalies)) {
        return false;
    }
    if (!isNonEmptyString(value.currencyCode) || !isNonEmptyString(value.currencySymbol))
        return false;
    if (value.forecastMethod !== undefined && !isNonEmptyString(value.forecastMethod))
        return false;
    return [value.forecastMonthTotal, value.forecastRemaining, value.forecastPeriodEnd].every(isOptionalFiniteNumber);
};
