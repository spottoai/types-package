export declare const DATA_PROTECTION_SCHEMA_VERSION: "2026-06-24";
export declare const DATA_PROTECTION_SOURCE: "Spotto.DataProtectionPosture";
export declare const DATA_PROTECTION_PORTAL_FILE: "data-protection.json.gz";
export declare const DATA_PROTECTION_BACKUP_COST_DIAGNOSTICS_FILE: "data-protection/backup-costs.json.gz";
export declare const DATA_PROTECTION_BILLING_SOURCE_FILE: "history/billing/cost-last-30-days.json";
export type DataProtectionProvider = 'recoveryServicesVault' | 'backupVault' | 'platformNative' | 'none' | 'unknown';
export type DataProtectionCoverageState = 'protected' | 'not_protected' | 'unknown' | 'not_applicable';
export type DataProtectionResourceResolutionStatus = 'resolved' | 'parent_resolved' | 'unresolved';
export type DataProtectionVaultType = 'Microsoft.RecoveryServices/vaults' | 'Microsoft.DataProtection/backupVaults';
export type DataProtectionIssueSeverity = 'info' | 'warning' | 'error';
export type DataProtectionCollectionProvider = 'recoveryServicesVault' | 'backupVault' | 'platformNative' | 'arg' | 'billing';
export type DataProtectionCostConfidence = 'exact' | 'allocated' | 'estimated' | 'unavailable';
export type DataProtectionCostAllocationMethod = 'direct' | 'protectedDataSizeWeighted' | 'backupStorageWeighted' | 'resourceSizeWeighted' | 'evenSplit';
export type DataProtectionBackupCostScope = 'protectedResource' | 'parentResource' | 'vault' | 'allocatedFromVault' | 'platformNativeMeter';
export type DataProtectionBackupCostEstimateStatus = 'available' | 'partial' | 'unavailable';
export type DataProtectionBackupCostEstimatePricingSource = 'billingObservedAverage' | 'retail' | 'unavailable';
export type DataProtectionWorkloadPricingModel = 'vm' | 'azureFiles' | 'blobVaulted' | 'disk' | 'aks' | 'sqlDatabase' | 'sqlManagedInstance' | 'mysqlFlexibleServer' | 'postgresqlFlexibleServer' | 'unknown';
export type DataProtectionFinding = 'not_protected' | 'protection_unknown' | 'latest_backup_failed' | 'latest_backup_warning' | 'recovery_point_stale' | 'no_recovery_points' | 'protection_paused' | 'protection_stopped' | 'protection_error' | 'policy_inconsistent' | 'native_backup_retention_gap' | 'backup_job_alerts_disabled' | 'backup_cost_unavailable' | 'backup_cost_allocated' | 'backup_estimate_unavailable' | 'source_resource_unresolved' | 'collection_partial';
export interface DataProtectionCostAllocationRule {
    method: DataProtectionCostAllocationMethod;
    sourceVaultId?: string;
    allocatedItemCount?: number;
    weight?: number;
    totalWeight?: number;
}
export interface DataProtectionCostEstimationAssumption {
    key: string;
    value: string | number | boolean;
    source: 'observed' | 'billing' | 'retail' | 'resourceInventory' | 'default' | 'policy' | 'unknown';
}
export interface DataProtectionBillingMeterEvidence {
    resourceId?: string;
    meterCategory?: string;
    meterSubCategory?: string;
    serviceName?: string;
    meter?: string;
    serviceTier?: string;
    resourceGuid?: string;
    cost?: number;
    costAmortized?: number;
    date?: number;
}
export interface DataProtectionCostAmount {
    amount?: number;
    amortizedAmount?: number;
    scope: DataProtectionBackupCostScope;
    confidence: DataProtectionCostConfidence;
    sourceArtifactPath: typeof DATA_PROTECTION_BILLING_SOURCE_FILE;
    allocationRule?: DataProtectionCostAllocationRule;
    unavailableReason?: string;
}
export interface DataProtectionBackupCostEstimate {
    monthlyAmount?: number;
    monthlyLow?: number;
    monthlyHigh?: number;
    confidence: DataProtectionCostConfidence;
    estimateStatus: DataProtectionBackupCostEstimateStatus;
    pricingSource?: DataProtectionBackupCostEstimatePricingSource;
    workloadPricingModel: DataProtectionWorkloadPricingModel;
    assumptions: DataProtectionCostEstimationAssumption[];
    retailMeters?: DataProtectionRetailMeterEvidence[];
    unavailableReason?: string;
}
export interface DataProtectionRetailMeterEvidence {
    serviceName?: string;
    productName?: string;
    skuName?: string;
    meterName?: string;
    unitOfMeasure?: string;
    unitPrice?: number;
    retailPrice?: number;
    currencyCode?: string;
    armRegionName?: string;
}
export interface DataProtectionBackupCost {
    currencyCode?: string;
    currencySymbol?: string;
    actualLast30Days?: DataProtectionCostAmount;
    estimatedMonthlyIfEnabled?: DataProtectionBackupCostEstimate;
    billingMeters?: DataProtectionBillingMeterEvidence[];
}
export interface DataProtectionVaultCostSummary {
    vaultId: string;
    vaultName?: string;
    vaultType?: DataProtectionVaultType;
    currencyCode?: string;
    currencySymbol?: string;
    actualCostLast30Days?: number;
    actualAmortizedCostLast30Days?: number;
    allocatedCostLast30Days?: number;
    allocationRule?: DataProtectionCostAllocationRule;
    confidence: DataProtectionCostConfidence;
}
export interface DataProtectionCostSummary {
    currencyCode?: string;
    currencySymbol?: string;
    billingWindow?: {
        startDate?: number;
        endDate?: number;
        sourceArtifactPath: typeof DATA_PROTECTION_BILLING_SOURCE_FILE;
    };
    totals: {
        actualCostLast30Days?: number;
        actualAmortizedCostLast30Days?: number;
        allocatedCostLast30Days?: number;
        estimatedMonthlyCostForUnprotected?: number;
    };
    vaults: DataProtectionVaultCostSummary[];
    estimationAssumptions: DataProtectionCostEstimationAssumption[];
}
export interface DataProtectionJobError {
    code?: string;
    message?: string;
    title?: string;
    recommendations?: string[];
}
export interface DataProtectionJobSummary {
    id?: string;
    name?: string;
    vaultId?: string;
    entityFriendlyName?: string;
    protectedResourceId?: string;
    operation?: string;
    status?: string;
    backupManagementType?: string;
    workloadType?: string;
    jobType?: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
    errorCode?: string;
    errorMessage?: string;
    errors?: DataProtectionJobError[];
    sourceArtifactPath?: string;
}
export interface DataProtectionSourceProvenance {
    collector: string;
    artifactPaths: string[];
    observedAt: string;
}
export interface DataProtectionPostureItem {
    protectedResourceId: string;
    protectedResourceName: string;
    protectedResourceType: string;
    parentResourceId?: string;
    workloadType: string;
    protectionProvider: DataProtectionProvider;
    coverageState: DataProtectionCoverageState;
    providerProtectionState?: string;
    providerHealthStatus?: string;
    resourceResolutionStatus: DataProtectionResourceResolutionStatus;
    vaultId?: string;
    vaultName?: string;
    vaultResourceGroup?: string;
    vaultType?: DataProtectionVaultType;
    policyId?: string;
    policyName?: string;
    providerLastBackupStatus?: string;
    lastBackupTime?: string;
    lastRecoveryPoint?: string;
    recoveryPointAgeDays?: number;
    recoveryPointCount?: number;
    latestJob?: DataProtectionJobSummary;
    latestFailedJob?: DataProtectionJobSummary;
    failedSince?: string;
    consecutiveFailureCount?: number;
    daysSinceLastSuccess?: number;
    cost?: DataProtectionBackupCost;
    findings: DataProtectionFinding[];
    source: DataProtectionSourceProvenance;
}
export interface DataProtectionCollectionIssue {
    severity: DataProtectionIssueSeverity;
    provider?: DataProtectionCollectionProvider;
    resourceId?: string;
    code: string;
    message: string;
    sourceArtifactPath?: string;
}
export interface DataProtectionPostureSummary {
    totalResourcesEvaluated: number;
    protectedCount: number;
    notProtectedCount: number;
    unknownCount: number;
    failedCount: number;
    staleCount: number;
    unresolvedSourceCount: number;
    actualBackupCostLast30Days?: number;
    allocatedBackupCostLast30Days?: number;
    estimatedMonthlyCostForUnprotected?: number;
    costCurrencyCode?: string;
    costCurrencySymbol?: string;
}
export interface DataProtectionPostureCoverage {
    byProvider: Record<string, number>;
    byWorkloadType: Record<string, number>;
    byFinding: Record<string, number>;
    byCostConfidence: Record<string, number>;
}
export interface DataProtectionPostureProjection {
    schemaVersion: typeof DATA_PROTECTION_SCHEMA_VERSION;
    source: typeof DATA_PROTECTION_SOURCE;
    subscriptionId: string;
    tenantId?: string;
    generatedAt: string;
    scanId?: string;
    summary: DataProtectionPostureSummary;
    coverage: DataProtectionPostureCoverage;
    costSummary: DataProtectionCostSummary;
    items: DataProtectionPostureItem[];
    issues: DataProtectionCollectionIssue[];
    sourceArtifacts: string[];
}
export interface DataProtectionBackupCostDiagnostics {
    schemaVersion: 1;
    source: `${typeof DATA_PROTECTION_SOURCE}.BackupCost`;
    subscriptionId: string;
    generatedAt: string;
    billingSourceArtifactPath: typeof DATA_PROTECTION_BILLING_SOURCE_FILE;
    billingRowCount: number;
    classifiedBackupRowCount: number;
    directMatchedRowCount: number;
    vaultMatchedRowCount: number;
    estimatedItemCount: number;
    unavailableEstimateItemCount: number;
    costSummary: DataProtectionCostSummary;
    issues: DataProtectionCollectionIssue[];
}
//# sourceMappingURL=dataProtection.d.ts.map