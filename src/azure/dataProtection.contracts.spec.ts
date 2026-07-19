import type { DataProtectionBackupCostDiagnostics, DataProtectionPostureProjection } from './dataProtection';
import {
  DATA_PROTECTION_BACKUP_COST_DIAGNOSTICS_FILE,
  DATA_PROTECTION_BILLING_SOURCE_FILE,
  DATA_PROTECTION_PORTAL_FILE,
  DATA_PROTECTION_SCHEMA_VERSION,
  DATA_PROTECTION_SOURCE,
} from './dataProtection';

const projection: DataProtectionPostureProjection = {
  schemaVersion: DATA_PROTECTION_SCHEMA_VERSION,
  source: DATA_PROTECTION_SOURCE,
  subscriptionId: 'sub-123',
  tenantId: 'tenant-123',
  generatedAt: '2026-06-24T00:00:00.000Z',
  summary: {
    totalResourcesEvaluated: 2,
    protectedCount: 1,
    notProtectedCount: 1,
    unknownCount: 0,
    failedCount: 1,
    staleCount: 0,
    unresolvedSourceCount: 0,
    actualBackupCostLast30Days: 8.5,
    allocatedBackupCostLast30Days: 0,
    estimatedMonthlyCostForUnprotected: 8.5,
    costCurrencyCode: 'NZD',
    costCurrencySymbol: '$',
  },
  coverage: {
    byProvider: {
      recoveryServicesVault: 1,
      none: 1,
    },
    byWorkloadType: {
      VM: 2,
    },
    byFinding: {
      latest_backup_failed: 1,
      not_protected: 1,
    },
    byCostConfidence: {
      exact: 1,
      estimated: 1,
    },
  },
  costSummary: {
    currencyCode: 'NZD',
    currencySymbol: '$',
    billingWindow: {
      startDate: 20260601,
      endDate: 20260630,
      sourceArtifactPath: DATA_PROTECTION_BILLING_SOURCE_FILE,
    },
    totals: {
      actualCostLast30Days: 8.5,
      actualAmortizedCostLast30Days: 7.25,
      estimatedMonthlyCostForUnprotected: 8.5,
    },
    vaults: [
      {
        vaultId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.RecoveryServices/vaults/vault-1',
        vaultName: 'vault-1',
        vaultType: 'Microsoft.RecoveryServices/vaults',
        currencyCode: 'NZD',
        currencySymbol: '$',
        actualCostLast30Days: 8.5,
        confidence: 'exact',
      },
    ],
    estimationAssumptions: [
      {
        key: 'pricingBasis',
        value: 'observed average 30-day backup cost for protected resources in this subscription',
        source: 'billing',
      },
    ],
  },
  items: [
    {
      protectedResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
      protectedResourceName: 'vm-1',
      protectedResourceType: 'Microsoft.Compute/virtualMachines',
      workloadType: 'VM',
      protectionProvider: 'recoveryServicesVault',
      coverageState: 'protected',
      resourceResolutionStatus: 'resolved',
      vaultId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.RecoveryServices/vaults/vault-1',
      vaultName: 'vault-1',
      vaultType: 'Microsoft.RecoveryServices/vaults',
      providerLastBackupStatus: 'Failed',
      lastBackupTime: '2026-06-24T01:00:00.000Z',
      lastRecoveryPoint: '2026-06-23T01:00:00.000Z',
      latestFailedJob: {
        name: 'job-1',
        operation: 'Backup',
        status: 'Failed',
        startTime: '2026-06-24T01:00:00.000Z',
        errorMessage: 'Snapshot failed',
      },
      failedSince: '2026-06-24T01:00:00.000Z',
      consecutiveFailureCount: 1,
      daysSinceLastSuccess: 1,
      cost: {
        currencyCode: 'NZD',
        currencySymbol: '$',
        actualLast30Days: {
          amount: 8.5,
          amortizedAmount: 7.25,
          scope: 'protectedResource',
          confidence: 'exact',
          sourceArtifactPath: DATA_PROTECTION_BILLING_SOURCE_FILE,
        },
        billingMeters: [
          {
            resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
            meterCategory: 'Backup',
            meterSubCategory: 'Azure Backup',
            serviceName: 'Azure Backup',
            meter: 'Protected Instance',
            serviceTier: 'Standard',
            cost: 8.5,
            costAmortized: 7.25,
            date: 20260620,
          },
        ],
      },
      findings: ['latest_backup_failed'],
      source: {
        collector: 'recoveryServicesVault',
        artifactPaths: ['data-protection/recoveryservices-protected-items.json.gz'],
        observedAt: '2026-06-24T00:00:00.000Z',
      },
    },
    {
      protectedResourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-2',
      protectedResourceName: 'vm-2',
      protectedResourceType: 'Microsoft.Compute/virtualMachines',
      workloadType: 'VM',
      protectionProvider: 'none',
      coverageState: 'not_protected',
      resourceResolutionStatus: 'resolved',
      cost: {
        currencyCode: 'NZD',
        currencySymbol: '$',
        estimatedMonthlyIfEnabled: {
          monthlyAmount: 8.5,
          monthlyLow: 6.38,
          monthlyHigh: 12.75,
          confidence: 'estimated',
          estimateStatus: 'available',
          pricingSource: 'billingObservedAverage',
          workloadPricingModel: 'vm',
          assumptions: [
            {
              key: 'pricingBasis',
              value: 'observed average 30-day backup cost for protected resources in this subscription',
              source: 'billing',
            },
            {
              key: 'vmAttachedDiskSizeGb',
              value: 128,
              source: 'resourceInventory',
            },
            {
              key: 'pricingSourceExample',
              value: 'retail meters are also supported',
              source: 'retail',
            },
          ],
          retailMeters: [
            {
              serviceName: 'Backup',
              productName: 'Azure Backup',
              skuName: 'Standard GRS',
              meterName: 'Standard GRS Data Stored',
              unitOfMeasure: '1 GB/Month',
              unitPrice: 0.1,
              retailPrice: 0.1,
              currencyCode: 'NZD',
              armRegionName: 'australiaeast',
            },
          ],
        },
      },
      findings: ['not_protected'],
      source: {
        collector: 'resourceInventory',
        artifactPaths: ['microsoft.compute-virtualmachines.json'],
        observedAt: '2026-06-24T00:00:00.000Z',
      },
    },
  ],
  issues: [],
  sourceArtifacts: [DATA_PROTECTION_PORTAL_FILE],
};

const diagnostics: DataProtectionBackupCostDiagnostics = {
  schemaVersion: 1,
  source: `${DATA_PROTECTION_SOURCE}.BackupCost`,
  subscriptionId: projection.subscriptionId,
  generatedAt: projection.generatedAt,
  billingSourceArtifactPath: DATA_PROTECTION_BILLING_SOURCE_FILE,
  billingRowCount: 1,
  classifiedBackupRowCount: 1,
  directMatchedRowCount: 1,
  vaultMatchedRowCount: 0,
  estimatedItemCount: 1,
  unavailableEstimateItemCount: 0,
  costSummary: projection.costSummary,
  issues: [],
};

void projection;
void diagnostics;
void DATA_PROTECTION_BACKUP_COST_DIAGNOSTICS_FILE;

const invalidDataProtectionSchemaVersion: DataProtectionPostureProjection = {
  ...projection,
  // @ts-expect-error data protection schema version must match the published projection contract.
  schemaVersion: '2026-06-25',
};

const invalidDataProtectionFinding: DataProtectionPostureProjection = {
  ...projection,
  items: [
    {
      ...projection.items[0],
      // @ts-expect-error findings use the data protection finding vocabulary.
      findings: ['backup_missing'],
    },
  ],
};

const invalidDataProtectionCostConfidence: DataProtectionPostureProjection = {
  ...projection,
  items: [
    {
      ...projection.items[0],
      cost: {
        actualLast30Days: {
          ...projection.items[0].cost!.actualLast30Days!,
          // @ts-expect-error cost confidence must be exact, allocated, estimated, or unavailable.
          confidence: 'low',
        },
      },
    },
  ],
};

const invalidDataProtectionBillingSource: DataProtectionBackupCostDiagnostics = {
  ...diagnostics,
  // @ts-expect-error billing diagnostics must point to the rolling 30-day billing source artifact.
  billingSourceArtifactPath: 'history/billing/cost-last-7-days.json',
};

void invalidDataProtectionSchemaVersion;
void invalidDataProtectionFinding;
void invalidDataProtectionCostConfidence;
void invalidDataProtectionBillingSource;
