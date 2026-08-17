/**
 * Billing cost analysis types for Azure cost visualization.
 */

import { isArtifactOwnershipBinding, type ArtifactOwnershipBinding, type ArtifactRevisionVector } from '../common/artifactEvidence.js';
import { containsForbiddenArtifactControlData, type AllowedArtifactReferenceField } from '../common/artifactControlData.js';
import { isArtifactRevisionVector } from '../common/artifactEvidenceValidation.js';
import {
  isBillingCompletedArtifactPublicationDecision,
  isBillingPartialArtifactPublicationDecision,
  type BillingCompletedArtifactPublicationDecision,
  type BillingPartialArtifactPublicationDecision,
} from './billingArtifactEvidence.js';

export type {
  BillingArtifactPublicationDecision,
  BillingCompletedArtifactPublicationDecision,
  BillingPartialArtifactPublicationDecision,
} from './billingArtifactEvidence.js';

/** Named cost chart windows emitted by the Azure billing analyzer. */
export type BillingChartViewKey = '7_days' | '30_days' | '90_days' | '12_months' | 'forecast_90_days' | (string & {});

/** Supported billing chart aggregation categories. */
export type BillingChartAggregation = 'daily' | 'monthly' | (string & {});

/** Linear trend metadata used to render trend overlays. */
export interface BillingChartTrend {
  method: 'linear' | (string & {});
  slope: number;
  intercept: number;
}

/** Full date range covered by the chart data payload. */
export interface BillingChartDataWindow {
  /** Start date of the available chart data (Unix timestamp). */
  startDate: number;
  /** End date of the available chart data (Unix timestamp). */
  endDate: number;
  /** Number of source daily points included in the data window. */
  pointCount: number;
}

/** Detector method metadata used to explain anomaly markers. */
export interface BillingChartDetectorMethod {
  name: string;
  status?: string;
  error?: string | null;
  /** Dates triggered by this detector (Unix timestamps). */
  triggeredDates: number[];
}

/** Metadata for the anomaly detector ensemble behind the chart payload. */
export interface BillingChartDetectorMetadata {
  threshold: number;
  methods: BillingChartDetectorMethod[];
}

/** Daily cost point used by historical cost chart views. */
export interface BillingDailyChartPoint {
  /** ISO date string for the point. */
  date: string;
  /** UTC date for the point (Unix timestamp). */
  timestamp: number;
  /** Cost for the point. */
  cost: number;
  /** Whether this point is considered an anomaly by quorum detection. */
  isAnomaly: boolean;
  /** Number of detector votes for this point. */
  anomalyVotes: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
  /** Detector methods that triggered for anomalous points. */
  anomalyMethods?: string[];
}

/** Monthly cost point used by the 12-month cost chart view. */
export interface BillingMonthlyChartPoint {
  /** Month key in YYYY-MM format. */
  month: string;
  /** Start date of the monthly point window (Unix timestamp). */
  startDate: number;
  /** End date of the monthly point window (Unix timestamp). */
  endDate: number;
  /** Total cost for the month. */
  cost: number;
  /** Average daily cost inside the month window. */
  averageDailyCost: number;
  /** Count of anomaly dates inside the month window. */
  anomalyCount: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
  /** Anomaly dates inside the month window (Unix timestamps). */
  anomalyDates?: number[];
}

/** Forecast or fitted cost point used by forecast chart overlays. */
export interface BillingForecastChartPoint {
  /** ISO date string for the point. */
  date: string;
  /** UTC date for the point (Unix timestamp). */
  timestamp: number;
  /** Cost for the point. */
  cost: number;
  /** Optional rendered trend value for this point. */
  trendCost?: number;
}

/** Historical daily chart view. */
export interface BillingDailyChartView {
  aggregation: 'daily';
  /** Start date of the view window (Unix timestamp). */
  startDate: number;
  /** End date of the view window (Unix timestamp). */
  endDate: number;
  averageDailyCost: number;
  totalCost: number;
  points: BillingDailyChartPoint[];
  trend?: BillingChartTrend;
}

/** Monthly chart view. */
export interface BillingMonthlyChartView {
  aggregation: 'monthly';
  /** Start date of the view window (Unix timestamp). */
  startDate: number;
  /** End date of the view window (Unix timestamp). */
  endDate: number;
  averageDailyCost: number;
  totalCost: number;
  points: BillingMonthlyChartPoint[];
  trend?: BillingChartTrend;
}

/** Forecast chart view containing actual, fitted, and future forecast series. */
export interface BillingForecastChartView {
  aggregation: 'daily';
  forecastMethod: string;
  /** Start date of the forecast view window (Unix timestamp). */
  startDate: number;
  /** End date of the forecast view window (Unix timestamp). */
  endDate: number;
  actualTotalCost: number;
  forecastRemaining: number;
  forecastMonthTotal: number;
  actualPoints: BillingDailyChartPoint[];
  forecastPoints: BillingForecastChartPoint[];
  fittedPoints: BillingForecastChartPoint[];
  trend?: BillingChartTrend;
}

export type BillingChartView = BillingDailyChartView | BillingMonthlyChartView | BillingForecastChartView;

/** Named chart views emitted by the billing analyzer. */
export interface BillingChartViews {
  '7_days'?: BillingDailyChartView;
  '30_days'?: BillingDailyChartView;
  '90_days'?: BillingDailyChartView;
  '12_months'?: BillingMonthlyChartView;
  forecast_90_days?: BillingForecastChartView;
  [key: string]: BillingChartView | undefined;
}

/** Interactive chart data for cost analysis. */
export interface BillingChartData {
  schemaVersion: number;
  source: 'aggregated' | (string & {});
  dataWindow: BillingChartDataWindow;
  views: BillingChartViews;
  detectors: BillingChartDetectorMetadata;
}

/** Impact metrics associated with a billing anomaly */
export interface BillingAnomalyImpact {
  /** Total cost for the anomaly window */
  cost: number;
  /** Difference from baseline for the anomaly window */
  delta: number;
  /** 7-day baseline cost when available */
  baseline7Day: number | null;
  /** 30-day baseline cost when available */
  baseline30Day: number | null;
  /** Percent change against the baseline cost */
  percentChange: number | null;
  /** Cost recorded for the previous day */
  previousDayCost: number | null;
  /** Delta recorded for the previous day */
  previousDayDelta: number | null;
  /** Month-to-date cost at the anomaly occurrence */
  monthToDateCost: number;
  /** Month-to-date baseline cost */
  monthToDateBaseline: number | null;
  /** Month-to-date delta compared to baseline */
  monthToDateDelta: number | null;
  /** Month-to-date percent change compared to baseline */
  monthToDatePercentChange: number | null;
}

/** Resource contributing to a billing anomaly driver */
export interface BillingAnomalyDriverResource {
  /** Resource identifier */
  name: string;
  /** Scope/category used by the analyzer for the resource row */
  resourceScope?: string;
  /** Full cloud resource ID when the anomaly can be tied to a resource */
  resourceId?: string;
  /** Whether the driver row represents subscription-level spend */
  isSubscriptionLevel?: boolean;
  /** Total cost attributed to the resource */
  cost: number;
  /** Baseline cost for the resource */
  baseline: number | null;
  /** Delta between current cost and baseline */
  delta: number;
  /** Percent change from baseline */
  percentChange: number | null;
  /** Whether the resource is new or previously idle */
  isNew: boolean;
  /** Human-readable summary for the resource impact */
  summary: string;
}

/** Driver contributing to a billing anomaly */
export interface BillingAnomalyDriver {
  /** Classification for the driver (e.g., service) */
  type: 'service' | (string & {});
  /** Name of the driver */
  name: string;
  /** Summary of the driver's impact */
  summary: string;
  /** Total cost attributed to the driver */
  cost: number;
  /** Delta between current cost and baseline */
  delta: number;
  /** Baseline cost for the driver */
  baseline: number | null;
  /** Percent change from baseline */
  percentChange: number | null;
  /** Percentage contribution of the driver to the anomaly */
  shareOfImpactPercent: number;
  /** Whether the driver represents new or returning spend */
  isNew: boolean;
  /** Resources that contributed to the driver's anomaly */
  resources: BillingAnomalyDriverResource[];
}

/** Confidence level classifications for anomalies */
export type BillingAnomalyConfidence = 'Low' | 'Medium' | 'High' | (string & {});

/** Representation of a detected billing anomaly */
export interface BillingAnomaly {
  /** Unix timestamp for the anomaly date */
  date: number;
  /** Summary describing the anomaly */
  summary: string;
  /** Impact metrics captured for the anomaly */
  impact: BillingAnomalyImpact;
  /** Drivers that explain the anomaly */
  drivers: BillingAnomalyDriver[];
  /** Heuristic confidence of the anomaly classification */
  confidence: BillingAnomalyConfidence;
  /** Additional contextual notes for the anomaly */
  notes: string[];
}

export interface BillingCostAnalysisMetadata {
  /** Azure subscription ID */
  subscriptionId: string;
  /** Opaque billing generation that produced this analysis. */
  billingGenerationId: string;
  /** Interactive chart data for cost analysis. */
  chartData: BillingChartData;
  /** Detected anomalies for the subscription */
  anomalies: BillingAnomaly[];
  currencyCode: string;
  currencySymbol: string;
  /** Forecast method used for top-level forecast summaries. */
  forecastMethod?: string;
  /** Forecast month total used for top-level forecast summaries. */
  forecastMonthTotal?: number;
  /** Forecast amount remaining in the current period. */
  forecastRemaining?: number;
  /** Forecast amount at the end of the current period. */
  forecastPeriodEnd?: number;
}

type BillingCompletedCostAnalysisDocumentState = 'current' | 'stale' | 'complete-empty';

/** Immutable billing metadata with an explicit evidence and read-state binding. */
interface BillingCostAnalysisMetadataV2Base extends BillingCostAnalysisMetadata {
  schemaVersion: 2;
  ownership: ArtifactOwnershipBinding<'azure'>;
  revision: ArtifactRevisionVector;
  inputManifestDigest: string;
  outputBindingDigest: string;
}

export type BillingCostAnalysisMetadataV2 = BillingCostAnalysisMetadataV2Base &
  (
    | {
        artifactState: BillingCompletedCostAnalysisDocumentState;
        artifactEvidence: BillingCompletedArtifactPublicationDecision;
      }
    | {
        artifactState: 'partial';
        artifactEvidence: BillingPartialArtifactPublicationDecision;
      }
  );

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
] as const;

type BillingCostAnalysisLegacyForbiddenFields = {
  [Field in (typeof LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS)[number]]?: never;
};

/** Explicit transition response for a validated legacy V1 business payload. */
export type BillingCostAnalysisLegacyFallbackResponse = BillingCostAnalysisMetadata &
  BillingCostAnalysisLegacyForbiddenFields & {
    artifactState: 'fallback';
    artifactSource: 'legacy-transition';
  };

/** Evidence-verified endpoint response; partial metadata is never returned as verified. */
export type BillingCostAnalysisVerifiedReadResponse = BillingCostAnalysisMetadataV2Base & {
  artifactState: BillingCompletedCostAnalysisDocumentState;
  artifactEvidence: BillingCompletedArtifactPublicationDecision;
};

/** Successful billing cost-analysis endpoint response. */
export type BillingCostAnalysisReadResponse = BillingCostAnalysisVerifiedReadResponse | BillingCostAnalysisLegacyFallbackResponse;

const BILLING_DOCUMENT_STATES = new Set<string>(['current', 'stale', 'partial', 'complete-empty']);
const BILLING_VERIFIED_READ_STATES = new Set<string>(['current', 'stale', 'complete-empty']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() === value && value.length > 0;
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isOptionalFiniteNumber = (value: unknown): boolean => value === undefined || isFiniteNumber(value);
const isNullableFiniteNumber = (value: unknown): boolean => value === null || isFiniteNumber(value);
const isNonNegativeInteger = (value: unknown): boolean => Number.isSafeInteger(value) && Number(value) >= 0;
const isPositiveInteger = (value: unknown): boolean => Number.isSafeInteger(value) && Number(value) > 0;
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isNonEmptyString);
const hasOwn = (value: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(value, key);
const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
const isPathSegment = (value: unknown): value is string =>
  isNonEmptyString(value) && !/[\\/?#%]/.test(value) && !hasControlCharacters(value) && value !== '.' && value !== '..';
const publicationDecisionReferencesDigest = (value: unknown, digest: string): boolean =>
  isRecord(value) && Array.isArray(value.dependencies) && value.dependencies.some(dependency => isRecord(dependency) && dependency.digest === digest);

const allowedBillingBusinessTextFields = (value: Record<string, unknown>): AllowedArtifactReferenceField[] => {
  const fields: AllowedArtifactReferenceField[] = [];
  const allowText = (object: unknown, ...keys: string[]): void => {
    if (!isRecord(object)) return;
    for (const key of keys) fields.push({ object, key, allowUriScheme: true });
  };
  const allowTextArray = (object: unknown, key: string): void => {
    if (isRecord(object)) fields.push({ object, key, allowUriSchemeInStringArray: true });
  };

  allowText(value, 'forecastMethod');
  if (isRecord(value.chartData) && isRecord(value.chartData.detectors) && Array.isArray(value.chartData.detectors.methods)) {
    for (const method of value.chartData.detectors.methods) allowText(method, 'name', 'status', 'error');
  }
  if (!Array.isArray(value.anomalies)) return fields;
  for (const anomaly of value.anomalies) {
    allowText(anomaly, 'summary', 'confidence');
    allowTextArray(anomaly, 'notes');
    if (!isRecord(anomaly) || !Array.isArray(anomaly.drivers)) continue;
    for (const driver of anomaly.drivers) {
      allowText(driver, 'type', 'name', 'summary');
      if (!isRecord(driver) || !Array.isArray(driver.resources)) continue;
      for (const resource of driver.resources) allowText(resource, 'name', 'resourceScope', 'summary');
    }
  }
  return fields;
};

const containsForbiddenBillingCostAnalysisControlData = (value: Record<string, unknown>): boolean =>
  containsForbiddenArtifactControlData(value, allowedBillingBusinessTextFields(value));

const isTrend = (value: unknown): boolean =>
  isRecord(value) && isNonEmptyString(value.method) && isFiniteNumber(value.slope) && isFiniteNumber(value.intercept);

const isDailyPoint = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.date) &&
  isFiniteNumber(value.timestamp) &&
  isFiniteNumber(value.cost) &&
  typeof value.isAnomaly === 'boolean' &&
  isNonNegativeInteger(value.anomalyVotes) &&
  isOptionalFiniteNumber(value.trendCost) &&
  (value.anomalyMethods === undefined || isStringArray(value.anomalyMethods));

const isForecastPoint = (value: unknown): boolean =>
  isRecord(value) &&
  isNonEmptyString(value.date) &&
  isFiniteNumber(value.timestamp) &&
  isFiniteNumber(value.cost) &&
  isOptionalFiniteNumber(value.trendCost);

const isMonthlyPoint = (value: unknown): boolean =>
  isRecord(value) &&
  /^\d{4}-\d{2}$/.test(String(value.month)) &&
  isFiniteNumber(value.startDate) &&
  isFiniteNumber(value.endDate) &&
  isFiniteNumber(value.cost) &&
  isFiniteNumber(value.averageDailyCost) &&
  isNonNegativeInteger(value.anomalyCount) &&
  isOptionalFiniteNumber(value.trendCost) &&
  (value.anomalyDates === undefined || (Array.isArray(value.anomalyDates) && value.anomalyDates.every(isFiniteNumber)));

const hasCommonChartViewFields = (value: Record<string, unknown>): boolean =>
  isFiniteNumber(value.startDate) &&
  isFiniteNumber(value.endDate) &&
  isFiniteNumber(value.averageDailyCost) &&
  isFiniteNumber(value.totalCost) &&
  (value.trend === undefined || isTrend(value.trend));

const isChartView = (value: unknown): boolean => {
  if (!isRecord(value) || (value.trend !== undefined && !isTrend(value.trend))) return false;
  if (value.forecastMethod !== undefined) {
    return (
      value.aggregation === 'daily' &&
      isNonEmptyString(value.forecastMethod) &&
      [value.startDate, value.endDate, value.actualTotalCost, value.forecastRemaining, value.forecastMonthTotal].every(isFiniteNumber) &&
      Array.isArray(value.actualPoints) &&
      value.actualPoints.every(isDailyPoint) &&
      Array.isArray(value.forecastPoints) &&
      value.forecastPoints.every(isForecastPoint) &&
      Array.isArray(value.fittedPoints) &&
      value.fittedPoints.every(isForecastPoint)
    );
  }
  if (!hasCommonChartViewFields(value) || !Array.isArray(value.points)) return false;
  if (value.aggregation === 'daily') return value.points.every(isDailyPoint);
  if (value.aggregation === 'monthly') return value.points.every(isMonthlyPoint);
  return false;
};

const isChartData = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value) || !isPositiveInteger(value.schemaVersion) || !isNonEmptyString(value.source)) return false;
  if (
    !isRecord(value.dataWindow) ||
    !isFiniteNumber(value.dataWindow.startDate) ||
    !isFiniteNumber(value.dataWindow.endDate) ||
    !isNonNegativeInteger(value.dataWindow.pointCount)
  ) {
    return false;
  }
  if (!isRecord(value.views) || !Object.values(value.views).every(view => view === undefined || isChartView(view))) return false;
  if (!isRecord(value.detectors) || !isFiniteNumber(value.detectors.threshold) || !Array.isArray(value.detectors.methods)) return false;
  return value.detectors.methods.every(
    method =>
      isRecord(method) &&
      isNonEmptyString(method.name) &&
      (method.status === undefined || isNonEmptyString(method.status)) &&
      (method.error === undefined || method.error === null || typeof method.error === 'string') &&
      Array.isArray(method.triggeredDates) &&
      method.triggeredDates.every(isFiniteNumber)
  );
};

const isDriverResource = (value: unknown): boolean =>
  isRecord(value) &&
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

const isAnomaly = (value: unknown): boolean => {
  if (!isRecord(value) || !isFiniteNumber(value.date) || !isNonEmptyString(value.summary) || !isNonEmptyString(value.confidence)) return false;
  if (!isStringArray(value.notes) || !isRecord(value.impact) || !Array.isArray(value.drivers)) return false;
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
  return value.drivers.every(
    driver =>
      isRecord(driver) &&
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
      driver.resources.every(isDriverResource)
  );
};

const hasValidMetadataEvidenceState = (
  state: unknown,
  evidence: unknown,
  billingGenerationId: string,
  inputManifestDigest: string,
  chartData: unknown,
  anomalies: unknown
): boolean => {
  if (state === 'partial') return isBillingPartialArtifactPublicationDecision(evidence, billingGenerationId, inputManifestDigest);
  if (!isBillingCompletedArtifactPublicationDecision(evidence, billingGenerationId, inputManifestDigest)) return false;
  if (state !== 'complete-empty') return true;
  if (!Array.isArray(anomalies)) return false;
  const billingHistory = evidence.dependencies.find(dependency => dependency.name === 'billing-history');
  if (!isRecord(chartData)) return false;
  const dataWindow = chartData.dataWindow;
  const views = chartData.views;
  return (
    billingHistory?.emptyEvidence === 'complete-empty' &&
    billingHistory.acceptedRowCount === 0 &&
    isNonEmptyString(billingHistory.emptyProofRef) &&
    isRecord(dataWindow) &&
    dataWindow.pointCount === 0 &&
    isRecord(views) &&
    Object.values(views).every(view => view === undefined) &&
    anomalies.length === 0
  );
};

const hasValidBillingCostAnalysisBusinessFields = (value: Record<string, unknown>): boolean => {
  if (!isPathSegment(value.subscriptionId) || !isPathSegment(value.billingGenerationId)) return false;
  if (!isChartData(value.chartData) || !Array.isArray(value.anomalies) || !value.anomalies.every(isAnomaly)) return false;
  if (!isNonEmptyString(value.currencyCode) || !isNonEmptyString(value.currencySymbol)) return false;
  if (value.forecastMethod !== undefined && !isNonEmptyString(value.forecastMethod)) return false;
  return [value.forecastMonthTotal, value.forecastRemaining, value.forecastPeriodEnd].every(isOptionalFiniteNumber);
};

/** Dependency-free validator for the complete legacy V1 business payload. */
export const isBillingCostAnalysisBusinessPayloadV1 = (value: unknown): value is BillingCostAnalysisMetadata =>
  isRecord(value) &&
  !containsForbiddenBillingCostAnalysisControlData(value) &&
  !LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS.some(field => hasOwn(value, field)) &&
  hasValidBillingCostAnalysisBusinessFields(value);

/** Dependency-free validator for customer-readable V2 billing metadata. */
export const isBillingCostAnalysisMetadataV2 = (value: unknown): value is BillingCostAnalysisMetadataV2 => {
  if (!isRecord(value) || containsForbiddenBillingCostAnalysisControlData(value) || value.schemaVersion !== 2) return false;
  if (hasOwn(value, 'outputManifestDigest')) return false;
  if (!isPathSegment(value.subscriptionId) || !isPathSegment(value.billingGenerationId)) return false;
  if (!isArtifactOwnershipBinding(value.ownership) || value.ownership.provider !== 'azure' || value.ownership.accountId !== value.subscriptionId)
    return false;
  if (!isArtifactRevisionVector(value.revision) || value.ownership.ownershipEpochRevision !== value.revision.ownershipEpochRevision) {
    return false;
  }
  if (typeof value.artifactState !== 'string' || !BILLING_DOCUMENT_STATES.has(value.artifactState)) return false;
  if (typeof value.inputManifestDigest !== 'string' || !SHA256_PATTERN.test(value.inputManifestDigest)) return false;
  if (typeof value.outputBindingDigest !== 'string' || !SHA256_PATTERN.test(value.outputBindingDigest)) return false;
  if (
    value.outputBindingDigest === value.inputManifestDigest ||
    publicationDecisionReferencesDigest(value.artifactEvidence, value.outputBindingDigest)
  ) {
    return false;
  }
  if (!hasValidBillingCostAnalysisBusinessFields(value)) return false;
  if (
    !hasValidMetadataEvidenceState(
      value.artifactState,
      value.artifactEvidence,
      value.billingGenerationId,
      value.inputManifestDigest,
      value.chartData,
      value.anomalies
    )
  ) {
    return false;
  }
  return true;
};

/** Dependency-free validator for an explicit legacy-transition fallback response. */
export const isBillingCostAnalysisLegacyFallbackResponse = (value: unknown): value is BillingCostAnalysisLegacyFallbackResponse =>
  isRecord(value) &&
  value.artifactState === 'fallback' &&
  value.artifactSource === 'legacy-transition' &&
  !LEGACY_FALLBACK_FORBIDDEN_OWN_FIELDS.some(field => hasOwn(value, field)) &&
  isBillingCostAnalysisBusinessPayloadV1(value);

/** Dependency-free validator for an evidence-verified endpoint response. */
export const isBillingCostAnalysisVerifiedReadResponse = (value: unknown): value is BillingCostAnalysisVerifiedReadResponse =>
  isBillingCostAnalysisMetadataV2(value) && BILLING_VERIFIED_READ_STATES.has(value.artifactState);

/** Dependency-free validator for the successful billing read-response union. */
export const isBillingCostAnalysisReadResponse = (value: unknown): value is BillingCostAnalysisReadResponse =>
  isBillingCostAnalysisVerifiedReadResponse(value) || isBillingCostAnalysisLegacyFallbackResponse(value);

/** @deprecated Use BillingCostAnalysisMetadata. */
export type BillingPlotsMetadata = BillingCostAnalysisMetadata;
