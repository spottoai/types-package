/** Additional tenant licensing evidence. Separate from license summary/people/history; v1 preserves null and per-measure coverage. */
export type Microsoft365RelatedSpendSourceState = 'complete' | 'partial' | 'unavailable' | 'failed';

export interface Microsoft365ContentAvailability {
  state: 'available' | 'partial' | 'unavailable';
  reasonCodes: string[];
  requiredPermissions: string[];
  observedAt: string | null;
}

export interface Microsoft365StorageContribution {
  skuPartNumber: string;
  purchasedUnits: number;
  assignedUnits: number | null;
  bytesPerUnit: number;
  contributionBytes: number;
  unassignedContributionBytes: number | null;
  unit: 'seat' | 'gb';
}

export interface Microsoft365StorageSite {
  siteId: string | null;
  siteUrl: string | null;
  usedBytes: number;
  allocatedBytes: number | null;
  isDeleted: boolean | null;
  lastActivityDate: string | null;
}

export interface Microsoft365SharePointStorage {
  usage: {
    availability: Microsoft365ContentAvailability;
    reportRefreshDate: string | null;
    latestReportDate: string | null;
    totalUsedBytes: number | null;
    trend: { date: string; usedBytes: number }[];
    omittedTrendCount: number;
  };
  sites: {
    availability: Microsoft365ContentAvailability;
    rows: Microsoft365StorageSite[];
    observedSiteCount: number | null;
    activeSiteCount: number | null;
    deletedSiteCount: number | null;
    unknownDeletedSiteCount: number | null;
    activeUsedBytes: number | null;
    omittedSiteCount: number;
    identitiesVisible: boolean;
  };
  entitlement: {
    availability: Microsoft365ContentAvailability;
    ruleVersion: string;
    ruleSource: string;
    baseBytes: number | null;
    seatContributionBytes: number | null;
    additionalStorageBytes: number | null;
    knownEntitlementBytes: number | null;
    calculatedEntitlementBytes: number | null;
    authoritativeQuotaBytes: null;
    unknownSkuPartNumbers: string[];
    omittedUnknownSkuCount: number;
    contributions: Microsoft365StorageContribution[];
    omittedContributionCount: number;
  };
}

export type Microsoft365OneDriveStorageSeries = 'All' | 'OneDrive';

export interface Microsoft365OneDriveStorage {
  aggregate: {
    availability: Microsoft365ContentAvailability;
    reportRefreshDate: string | null;
    latestReportDate: string | null;
    series: Microsoft365OneDriveStorageSeries | null;
    totalUsedBytes: number | null;
    observedLatestUsedBytes: number | null;
  };
  detail: {
    availability: Microsoft365ContentAvailability;
    reportRefreshDate: string | null;
    observedAccountCount: number | null;
    activeAccountCount: number | null;
    deletedAccountCount: number | null;
    unknownDeletedAccountCount: number | null;
    duplicateSiteIdCount: number | null;
    invalidRowCount: number | null;
    activeUsedBytes: number | null;
    observedActiveUsedBytes: number | null;
  };
  reconciliation: {
    availability: Microsoft365ContentAvailability;
    state: 'matched' | 'mismatch' | 'not_comparable';
    reasonCodes: string[];
    /** Account-detail active bytes minus the independently reported aggregate bytes. */
    deltaBytes: number | null;
  };
}

export interface Microsoft365AccountDisableEvidence {
  accountId: string;
  accountEnabled: boolean | null;
  disabledAt: string | null;
  disabledAtStatus: 'known' | 'unknown' | 'not_disabled';
  reasonCodes: string[];
  evidence: { source: 'entra_directory_audit'; auditEventId: string; observedAt: string | null } | null;
}

export interface Microsoft365AccountLifecycle {
  scope: 'observed_directory_users';
  availability: Microsoft365ContentAvailability;
  auditHistory: {
    availability: Microsoft365ContentAvailability;
    requestedFrom: string;
    requestedTo: string;
    retentionLimited: true;
  };
  accounts: Microsoft365AccountDisableEvidence[];
}

export type Microsoft365RelatedSpendCategory =
  | 'github-copilot-seats'
  | 'github-copilot-consumption'
  | 'github-other'
  | 'copilot-studio'
  /** Provisioned Security Copilot capacity and overage retain their separate meter evidence. */
  | 'security-copilot'
  | 'fabric-ai';

export interface Microsoft365RelatedSpendAmount {
  amount: number | null;
  state: 'complete' | 'partial' | 'unavailable';
  reasonCodes: string[];
}

export interface Microsoft365RelatedSpendMeter {
  meterId: string | null;
  meterName: string;
  unit: string | null;
  quantity: number | null;
  quantityState: 'complete' | 'partial' | 'unavailable';
  firstDate: string;
  lastDate: string;
  rowCount: number;
}

export interface Microsoft365RelatedSpendProduct {
  category: Microsoft365RelatedSpendCategory;
  billed: Microsoft365RelatedSpendAmount;
  amortized: Microsoft365RelatedSpendAmount;
  matchedRowCount: number;
  meters: Microsoft365RelatedSpendMeter[];
}

export interface Microsoft365RelatedSpendCoverage {
  subscriptionId: string;
  state: Microsoft365RelatedSpendSourceState;
  recordsState: 'loaded' | 'missing';
  observedAt: string | null;
  sourceEtag?: string;
  sourceFile?: string;
  billingGenerationId?: string;
  sourceRunId?: string;
  reasonCodes: string[];
  sourceRowCount: number | null;
  retainedRowCount: number | null;
  matchedRowCount: number;
  inWindowRowCount: number;
  invalidRowCount: number;
  outsideWindowRowCount: number;
  excludedEstimatedRowCount: number;
}

export interface Microsoft365RelatedSpendView {
  generatedAt: string;
  window: { startDate: string; endDate: string };
  availability: Microsoft365ContentAvailability;
  currencies: { currency: string; products: Microsoft365RelatedSpendProduct[] }[];
  subscriptions: Microsoft365RelatedSpendCoverage[];
}

export interface Microsoft365LicensingContent {
  schemaVersion: 'microsoft-365-licensing-content/v1';
  tenantId: string;
  tenantSyncRunId: string;
  generatedAt: string;
  graphCollection: 'attempted' | 'disabled';
  licenseEvidence: { generatedAt: string | null; tenantSyncRunId: string | null };
  measures: Record<string, Microsoft365ContentAvailability>;
  sharePoint: Microsoft365SharePointStorage;
  oneDrive: Microsoft365OneDriveStorage;
  accountLifecycle: Microsoft365AccountLifecycle;
  relatedSpend: Microsoft365RelatedSpendView;
  expectedSubscriptionCount: number;
  omittedSubscriptionCount: number;
  billingScope: 'scan_subscription_set';
}
