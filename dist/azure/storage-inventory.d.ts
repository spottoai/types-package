export type InventorySource = 'manual_upload' | 'sas_url' | 'automatic';
export type BlobKind = 'block' | 'page' | 'append';
export type AccessPattern = 'hot' | 'cool' | 'cold' | 'archive' | 'unknown';
export type AgeBucket = '0-30d' | '30-90d' | '90-180d' | '180-365d' | '365d+';
export type TierName = 'hot' | 'cool' | 'cold' | 'archive';
export interface InventoryUserContext {
    retentionDays?: number;
    canDeleteOld?: boolean;
    allowAutoDelete?: boolean;
    keepVersionsDays?: number;
    fileTypes?: string[];
    highAvailabilityPrefixes?: string[];
    coldArchivePrefixes?: string[];
    accessPattern?: 'constant' | 'burst' | 'rare';
    maxReadLatency?: 'seconds' | 'minutes' | 'hours';
    rehydrationPriority?: 'low' | 'standard' | 'high';
    budgetSensitivity?: 'low' | 'medium' | 'high';
    allowAutoTiering?: boolean;
    compliance?: {
        immutabilityRequired?: boolean;
        legalHoldRequired?: boolean;
        minRetentionDays?: number;
    };
    maintenanceWindow?: string;
    notes?: string;
    tierConstraints?: {
        minHotPercent?: number;
        maxArchivePercent?: number;
        requiredHotPrefixes?: string[];
        allowedArchivePrefixes?: string[];
    };
}
export interface InventoryAnalysisResult {
    subscriptionId?: string;
    resourceId?: string;
    analyzedAt: string;
    inventorySource: InventorySource;
    summary: {
        totalBlobs: number;
        totalBytes: number;
        analyzedBlobs?: number;
        lastScanTime?: string;
        tierBreakdown: Record<string, {
            count: number;
            bytes: number;
            percentage?: number;
        }>;
        ageBuckets: Record<AgeBucket | string, {
            count: number;
            bytes: number;
            percentage?: number;
        }>;
    };
    issues: InventoryIssue[];
    recommendations: InventoryRecommendation[];
    compliance?: {
        immutabilityLocked?: ScopeStat;
        legalHold?: ScopeStat;
        remainingRetentionDays?: Record<string, ScopeStat>;
        deleted?: ScopeStat;
    };
    costs?: InventoryCostSummary;
    metadataQuality?: {
        tagCoverage?: CoverageStat;
        metadataCoverage?: CoverageStat;
        missingTagExamples?: string[];
    };
    copyStatus?: {
        rehydrating?: ScopeStat & {
            examples?: string[];
        };
        inProgress?: ScopeStat & {
            examples?: string[];
        };
    };
    outliers?: {
        topBySize?: InventoryOutlier[];
    };
    inputs?: {
        sourceCsv?: string;
        schemaVersion?: string;
        sampleSize?: number;
    };
    userContext?: InventoryUserContext;
}
export interface InventoryAnalysisProgress {
    totalBlobs: number;
    processedBlobs: number;
    percentage: number;
}
export interface InventoryAnalysisJob {
    jobId: string;
    subscriptionId: string;
    storageAccountId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    source: InventorySource;
    uploadedFileUrl?: string;
    sasUrl?: string;
    progress?: InventoryAnalysisProgress;
    resultPath?: string;
    error?: {
        code: string;
        message: string;
    };
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
export interface InventoryAnalysisStatus {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    resultPath?: string;
    userContext?: InventoryUserContext;
    subscriptionId?: string;
    resourceId?: string;
    storageAccount?: string;
    resourceGroup?: string;
    /** Reference (path or URL) to the uploaded manifest/CSV set */
    inputReference?: string;
}
export interface InventoryManifestFile {
    blob: string;
    size: number;
}
export interface InventoryManifest {
    files: InventoryManifestFile[];
}
export interface BlobInventoryUploadResponse {
    jobId: string;
    status?: InventoryAnalysisStatus;
    resultPath?: string;
}
export interface InventoryCostSummary {
    currency?: string;
    rates?: Partial<Record<TierName, number>>;
    currentMonthly?: number;
    targetMonthly?: number;
    potentialMonthlySavings?: number;
    tierCosts?: {
        current?: Partial<Record<TierName, number>>;
        target?: Partial<Record<TierName, number>>;
    };
}
export type InventoryStatusOrResult = InventoryAnalysisStatus | (InventoryAnalysisResult & {
    jobId?: string;
    status?: InventoryAnalysisStatus['status'];
    resultPath?: string;
});
export interface ScopeStat {
    count: number;
    bytes: number;
    percentage?: number;
}
export interface CoverageStat {
    coverage: number;
    countWith?: number;
    countWithout?: number;
    examplesWithout?: string[];
}
export interface InventoryIssue {
    type: string;
    severity: 'high' | 'medium' | 'low';
    count: number;
    bytes: number;
    description?: string;
    examples?: string[];
    constraints?: string[];
}
export interface InventoryRecommendation {
    action: string;
    targetTier?: string;
    scope: ScopeStat & {
        percentOfTotal?: number;
    };
    estimatedSavings?: {
        monthly?: number;
        currency?: string;
    };
    rationale?: string;
    constraints?: string[];
    examples?: string[];
}
export interface InventoryOutlier {
    name: string;
    bytes: number;
    accessTier?: string;
    lastAccessTime?: string;
    archiveStatus?: string;
}
//# sourceMappingURL=storage-inventory.d.ts.map
