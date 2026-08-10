import type {
  AzureResourceMetricsDocument as ExportedAzureResourceMetricsDocument,
  MetricCollectionCoverageV2 as ExportedMetricCollectionCoverageV2,
} from '../index';
import type { AzureResourceMetricsDocument, MetricCollectionCoverageV2, MetricCollectionFailure, MetricDiagnosticsSummary } from './metrics';

const legacyDocument: AzureResourceMetricsDocument = {
  id: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  metrics: [],
};

const coverage: MetricCollectionCoverageV2 = {
  schemaVersion: 2,
  status: 'partial',
  lastAttemptedAt: '2026-08-10T00:05:00.000Z',
  lastSuccessfulAt: '2026-08-09T00:05:00.000Z',
  availableMetricNames: ['Percentage CPU'],
  collections: [
    {
      name: 'VirtualMachinePerformance',
      status: 'unavailable',
      metricNames: ['Percentage CPU'],
      lastAttemptedAt: '2026-08-10T00:05:00.000Z',
      lastSuccessfulAt: '2026-08-09T00:05:00.000Z',
      failure: {
        category: 'permission',
        statusCode: 403,
        errorCode: 'AuthorizationFailed',
        retryable: false,
      },
    },
  ],
};

const currentDocument: AzureResourceMetricsDocument = {
  ...legacyDocument,
  schemaVersion: 3,
  coverage,
};

const legacyNestedAlias: AzureResourceMetricsDocument = {
  resourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Sql/servers/sql-1/databases/db-1',
  metrics: [],
};

const diagnostics: MetricDiagnosticsSummary = {
  groups: [
    {
      resourceType: 'microsoft.compute/virtualmachines',
      collection: 'VirtualMachinePerformance',
      category: 'permission',
      statusCode: 403,
      errorCode: 'AuthorizationFailed',
      retryable: false,
      count: 2,
    },
  ],
  omittedGroupCount: 0,
};

const invalidStatus: MetricCollectionCoverageV2 = {
  ...coverage,
  // @ts-expect-error legacy producer status is adapted at runtime, not part of coverage v2
  status: 'disabled-by-expression',
};

const unsafeFailure: MetricCollectionFailure = {
  category: 'provider',
  retryable: false,
  // @ts-expect-error raw provider messages are deliberately excluded
  message: 'request to a tenant-specific Azure URL failed',
};

const rootCoverage: ExportedMetricCollectionCoverageV2 = coverage;
const rootDocument: ExportedAzureResourceMetricsDocument = currentDocument;

void legacyDocument;
void currentDocument;
void legacyNestedAlias;
void diagnostics;
void invalidStatus;
void unsafeFailure;
void rootCoverage;
void rootDocument;
