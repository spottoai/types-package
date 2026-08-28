import type { FinancialAnalyticsResultV1 } from './financialAnalytics';
import type { FinancialDataflowCoordinateV1, FinancialDataflowJsonGzipArtifactDescriptorV1 } from './financialDataflow';

export const FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1 = 'financial-analytics-job-request/v1' as const;
export const FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1 = 'financial-analytics-current-pointer/v1' as const;
export const FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1 = 'financial-analytics-input.json.gz' as const;
export const FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1 = 'financial-analytics/inputs-by-id' as const;
export const FINANCIAL_ANALYTICS_PROJECTION_LOGICAL_NAME_V1 = 'financial-analytics-projection.json.gz' as const;
export const FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1 = 'financial-analytics-batch-query/v1' as const;
export const FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1 = 'financial-analytics-batch-response/v1' as const;
export const FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1 = 'financial-analytics-output-manifest/v1' as const;

export const financialAnalyticsInputByIdPathV1 = (analyticsInputId: string): string =>
  `${FINANCIAL_ANALYTICS_INPUT_BY_ID_ROOT_V1}/${analyticsInputId}/${FINANCIAL_ANALYTICS_INPUT_LOGICAL_NAME_V1}`;

export type FinancialAnalyticsRequestedOutputV1 =
  | {
      resultKind: 'forecast';
      targetCoordinate: FinancialDataflowCoordinateV1 & { periodRole: 'projection-target' };
      currentSpendCompositionId: string;
      comparisonSpendCompositionId?: never;
    }
  | {
      resultKind: 'trend';
      targetCoordinate: FinancialDataflowCoordinateV1 & { periodRole: 'projection-target' };
      currentSpendCompositionId: string;
      comparisonSpendCompositionId: string;
    }
  | {
      resultKind: 'anomaly';
      targetCoordinate: FinancialDataflowCoordinateV1 & { periodRole: 'projection-target' };
      currentSpendCompositionId: string;
      comparisonSpendCompositionId?: never;
    };

export interface FinancialAnalyticsJobRequestV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_JOB_REQUEST_CONTRACT_VERSION_V1;
  requestId: string;
  companyId: string;
  coordinateId: string;
  analyticsInputId: string;
  inputGenerationId: string;
  inputArtifactDigest: string;
  /** Identity-only queue request. Customer money and billing rows must never be embedded here. */
  requestedOutputs: FinancialAnalyticsRequestedOutputV1[];
  requestedAt: string;
}

/** Stable across delivery retries because the fixed evaluation instant is part of the queued payload identity. */
export type FinancialAnalyticsJobRequestIdentityPreimageV1 = Omit<FinancialAnalyticsJobRequestV1, 'requestId'>;

/** CAS-friendly current pointer; immutable output generations remain the source of truth. */
export interface FinancialAnalyticsCurrentPointerV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_CURRENT_POINTER_CONTRACT_VERSION_V1;
  pointerDigest: string;
  coordinateId: string;
  resultKind: FinancialAnalyticsResultV1['kind'];
  sourceRequestId: string;
  sourceRequestedAt: string;
  analyticsInputId: string;
  pointerRevision: number;
  outputGenerationId: string;
  analyticsProjectionId: string;
  projectionArtifactDigest: string;
  promotedAt: string;
}

export type FinancialAnalyticsCurrentPointerIdentityPreimageV1 = Omit<FinancialAnalyticsCurrentPointerV1, 'pointerDigest'>;

export interface FinancialAnalyticsOutputManifestV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_OUTPUT_MANIFEST_CONTRACT_VERSION_V1;
  coordinateId: string;
  resultKind: FinancialAnalyticsResultV1['kind'];
  outputGenerationId: string;
  analyticsProjectionId: string;
  sourceRequestId: string;
  analyticsInputId: string;
  inputArtifactDigest: string;
  projection: FinancialDataflowJsonGzipArtifactDescriptorV1;
  publishedAt: string;
  manifestDigest: string;
}

export type FinancialAnalyticsOutputManifestIdentityPreimageV1 = Omit<FinancialAnalyticsOutputManifestV1, 'manifestDigest'>;

export interface FinancialAnalyticsBatchQueryItemV1 {
  coordinateId: string;
  resultKind: FinancialAnalyticsResultV1['kind'];
}

/** Bounded read-only transport query. It contains no customer money or calculation inputs. */
export interface FinancialAnalyticsBatchQueryV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_BATCH_QUERY_CONTRACT_VERSION_V1;
  items: FinancialAnalyticsBatchQueryItemV1[];
}

export type FinancialAnalyticsBatchResultV1 =
  | (FinancialAnalyticsBatchQueryItemV1 & {
      status: 'available';
      projection: import('./financialAnalytics').FinancialAnalyticsProjectionV1;
    })
  | (FinancialAnalyticsBatchQueryItemV1 & {
      status: 'unavailable';
      reasonCode: 'not-produced';
    });

export interface FinancialAnalyticsBatchResponseV1 {
  schemaVersion: 1;
  contractVersion: typeof FINANCIAL_ANALYTICS_BATCH_RESPONSE_CONTRACT_VERSION_V1;
  results: FinancialAnalyticsBatchResultV1[];
}
