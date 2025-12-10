export type InventorySource = 'manual_upload' | 'sas_url' | 'automatic';
export type BlobKind = 'block' | 'page' | 'append';
export type AccessPattern = 'hot' | 'cool' | 'cold' | 'archive' | 'unknown';
export type AgeBucket = '0-30d' | '30-90d' | '90-180d' | '180-365d' | '365d+';
export interface InventoryUserContext {
    retentionDays?: number;
    canDeleteOld?: boolean;
    fileTypes?: string[];
}
export interface InventoryIssue {
    type: 'page_blob_backups' | 'stale_append_blobs' | 'data_beyond_retention';
    severity: 'high' | 'medium' | 'low';
    affectedCount: number;
    affectedSizeGB: number;
    currentMonthlyCost: number;
    potentialSavings: number;
    recommendation: string;
    migrationSteps: string[];
    sampleBlobs?: string[];
}
export interface PrefixAnalysis {
    prefix: string;
    blobCount: number;
    sizeGB: number;
    dominantBlobType: BlobKind;
    dominantAccessPattern: Exclude<AccessPattern, 'unknown'>;
}
export interface ContainerAnalysis {
    containerName: string;
    totalBlobs: number;
    totalSizeGB: number;
    blobTypeDistribution: {
        block: {
            count: number;
            sizeGB: number;
        };
        page: {
            count: number;
            sizeGB: number;
        };
        append: {
            count: number;
            sizeGB: number;
        };
    };
    accessPatternDistribution: Record<Exclude<AccessPattern, 'unknown'>, {
        count: number;
        sizeGB: number;
    }>;
    topPrefixes: PrefixAnalysis[];
}
export interface InventoryAnalysisResult {
    subscriptionId?: string;
    resourceId?: string;
    analyzedAt: string;
    inventorySource: InventorySource;
    summary: {
        totalBlobs: number;
        totalSizeGB: number;
        analyzedBlobs: number;
        containerCount: number;
    };
    blobTypeDistribution: {
        block: {
            count: number;
            sizeGB: number;
            canLifecycle: true;
        };
        page: {
            count: number;
            sizeGB: number;
            canLifecycle: false;
        };
        append: {
            count: number;
            sizeGB: number;
            staleCount: number;
            staleSizeGB: number;
        };
    };
    accessPatternDistribution: Record<AccessPattern, {
        count: number;
        sizeGB: number;
        percentage?: number;
    }>;
    ageDistribution: Record<AgeBucket, {
        count: number;
        sizeGB: number;
        /** Per-blob-type breakdown, always emitted by the analyzer */
        distributions: Record<BlobKind, {
            count: number;
            sizeGB: number;
        }>;
    }>;
    containers: ContainerAnalysis[];
    issues: InventoryIssue[];
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
export type InventoryStatusOrResult = InventoryAnalysisStatus | (InventoryAnalysisResult & {
    jobId?: string;
    status?: InventoryAnalysisStatus['status'];
    resultPath?: string;
});
//# sourceMappingURL=storage-inventory.d.ts.map