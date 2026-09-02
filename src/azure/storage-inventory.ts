export type InventorySource = 'manual_upload' | 'sas_url' | 'automatic';

export type BlobKind = 'block' | 'page' | 'append';

export type AccessPattern = 'hot' | 'cool' | 'cold' | 'archive' | 'unknown';

export type AgeBucket = '0-30d' | '30-90d' | '90-180d' | '180-365d' | '365d+';
export type TierName = 'hot' | 'cool' | 'cold' | 'archive';

export type InventoryPricingSource = 'billing' | 'retail' | 'fallback' | 'unknown';

export type InventoryAnalysisErrorCode =
  | 'inventory_analysis_not_found'
  | 'inventory_input_missing'
  | 'inventory_manifest_missing'
  | 'inventory_manifest_invalid'
  | 'inventory_manifest_account_mismatch'
  | 'inventory_manifest_empty'
  | 'inventory_data_file_missing'
  | 'inventory_analysis_failed';

export type InventoryStorageAccountKind = 'Storage' | 'StorageV2' | 'BlobStorage' | 'BlockBlobStorage' | 'FileStorage' | 'unknown';

export type InventoryStorageRedundancy = 'LRS' | 'ZRS' | 'GRS' | 'GZRS' | 'RA-GRS' | 'RA-GZRS' | 'unknown';

export interface InventoryStorageAccountMetadata {
  accountKind?: InventoryStorageAccountKind;
  skuName?: string;
  redundancy?: InventoryStorageRedundancy;
}

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
  storageAccountMetadata?: InventoryStorageAccountMetadata;
  tierTargets?: TierTargets;
  thresholdPresets?: ThresholdPreset[];
  summary: {
    totalBlobs: number;
    totalBytes: number;
    analyzedBlobs?: number;
    lastScanTime?: string;
    tierBreakdown: Record<string, { count: number; bytes: number; percentage?: number }>;
    ageBuckets: Record<
      AgeBucket | string,
      {
        count: number;
        bytes: number;
        percentage?: number;
        perType?: Record<BlobKind, { count: number; bytes: number }>;
      }
    >;
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
    rehydrating?: ScopeStat & { examples?: string[] };
    inProgress?: ScopeStat & { examples?: string[] };
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
  warnings?: string[];
}

export interface InventoryAnalysisProgress {
  totalBlobs: number;
  processedBlobs: number;
  percentage: number;
}

export interface TierTargets {
  hot: ScopeStat;
  cool: ScopeStat;
  cold: ScopeStat;
  archive: ScopeStat;
}

export interface InventoryThresholds {
  coolAfterDays: number;
  coldAfterDays: number;
  archiveAfterDays: number;
  deleteAfterDays?: number;
  allowDelete?: boolean;
}

export interface ThresholdPreset {
  key: string;
  label: string;
  thresholds: InventoryThresholds;
  tierTargets: TierTargets;
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
  error?: { code: string; message: string };
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
  errorCode?: InventoryAnalysisErrorCode;
  errorMessage?: string;
  errorDetails?: string;
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
  endpoint?: string;
  files: InventoryManifestFile[];
}

export interface BlobInventoryUploadResponse {
  jobId: string;
  status?: InventoryAnalysisStatus;
  resultPath?: string;
  uploadId?: string;
  analysisEnqueued?: boolean;
  analysisError?: string;
}

export type InventoryAutomationStatus = 'disabled' | 'enabled' | 'warning' | 'error';

export interface InventoryAutomationWarning {
  code: string;
  message: string;
  at: string;
}

export interface InventoryAutomationError {
  code: string;
  message: string;
  at: string;
}

export interface InventoryAutomationCleanupRequest {
  deleteRule?: boolean;
  deleteContainer?: boolean;
}

export interface InventoryAutomationProvisioning {
  containerName: string;
  policyName: string;
  ruleName: string;
  schedule: 'Daily';
  containerProvisionedAt?: string;
  ruleProvisionedAt?: string;
}

export interface InventoryAutomationConfig {
  subscriptionId: string;
  resourceId: string;
  resourceGroup: string;
  storageAccount: string;
  cloudAccountId?: string;
  enabled: boolean;
  status: InventoryAutomationStatus;
  provisioning: InventoryAutomationProvisioning;
  lastCheckedAt?: string;
  lastSyncedAt?: string;
  lastReportDate?: string;
  lastWarning?: InventoryAutomationWarning;
  lastError?: InventoryAutomationError;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EnableInventoryAutomationRequest {
  resourceId?: string;
}

export interface DisableInventoryAutomationRequest {
  resourceId?: string;
  cleanup?: InventoryAutomationCleanupRequest;
}

export interface InventoryCostSummary {
  currency?: string;
  pricingSource?: InventoryPricingSource;
  isEstimated?: boolean;
  rates?: Partial<Record<TierName, number>>;
  currentMonthly?: number;
  targetMonthly?: number;
  potentialMonthlySavings?: number;
  tierCosts?: {
    current?: Partial<Record<TierName, number>>;
    target?: Partial<Record<TierName, number>>;
  };
}

export type InventoryStatusOrResult =
  | InventoryAnalysisStatus
  | (InventoryAnalysisResult & { jobId?: string; status?: InventoryAnalysisStatus['status']; resultPath?: string });

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
  scope: ScopeStat & { percentOfTotal?: number };
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
