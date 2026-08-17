export type PortfolioDataStatus = 'complete' | 'partial' | 'unavailable';
export type PortfolioSortDirection = 'asc' | 'desc';

export interface PortfolioCustomerReference {
  companyId: string;
  companyName: string;
}

export interface PortfolioDataFailure {
  companyId: string;
  cloudAccountId?: string;
  subscriptionId?: string;
  source:
    | 'accounts'
    | 'budgets'
    | 'commitments'
    | 'cost'
    | 'credentials'
    | 'data-protection'
    | 'governance'
    | 'hierarchy'
    | 'recommendations'
    | 'reporting'
    | 'resource-health'
    | 'perimeter'
    | 'security'
    | 'service-retirements'
    | 'subscriptions';
  code: string;
}

export interface PortfolioDataCoverage {
  status: PortfolioDataStatus;
  requestedCustomers: number;
  loadedCustomers: number;
  requestedSubscriptions: number;
  loadedSubscriptions: number;
  observedAt?: string;
  failures: PortfolioDataFailure[];
}

export interface PortfolioPageResponse<TItem, TSummary> {
  items: TItem[];
  summary: TSummary;
  coverage: PortfolioDataCoverage;
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  /** Rows retained by the bounded projection and available to page through. */
  retainedRows?: number;
  /** True when totalRows is larger than the retained result set. */
  truncated?: boolean;
}

export type PortfolioCustomerSortField =
  | 'customerName'
  | 'subscriptionCount'
  | 'readySubscriptionCount'
  | 'cloudAccountCount'
  | 'averageSecureScore'
  | 'averageAdvisorScore'
  | 'lastUpdated';

export interface PortfolioCustomerRow extends PortfolioCustomerReference {
  subscriptionDataAvailable: boolean;
  subscriptionCount: number;
  readySubscriptionCount: number;
  notReadySubscriptionCount: number;
  cloudAccountCount: number;
  averageSecureScore?: number;
  averageAdvisorScore?: number;
  lastUpdated?: string;
}

export interface PortfolioCustomerSummary {
  availableCompanies: number;
  subscriptions: number;
  readySubscriptions: number;
  cloudAccounts: number;
}

export type PortfolioBudgetStatus = 'healthy' | 'at-risk' | 'over-budget';
export type PortfolioBudgetSortField =
  | 'customerName'
  | 'subscriptionName'
  | 'budgetName'
  | 'status'
  | 'actualPercent'
  | 'forecastPercent'
  | 'endDate';

export interface PortfolioBudgetRow {
  id: string;
  companyId: string;
  customerName: string;
  subscriptionId: string;
  subscriptionName: string;
  budgetName: string;
  currency: string;
  currencySymbol?: string;
  amount: number;
  currentSpend: number;
  forecastedSpend: number;
  actualPercent: number;
  forecastPercent: number;
  status: PortfolioBudgetStatus;
  startDate: string;
  endDate: string;
}

export interface PortfolioBudgetSummary {
  totalBudgets: number;
  overBudget: number;
  atRisk: number;
  forecastOverBudget: number;
}

export type PortfolioSowApprovalStatus = 'approved' | 'unapproved';
export type PortfolioSowSortField = 'customerName' | 'fileName' | 'issuedAt' | 'approvalStatus' | 'approvedAt';

export interface PortfolioSowRow {
  id: string;
  companyId: string;
  customerName: string;
  fileName: string;
  issuedAt: string;
  issuedBy?: string;
  reportPeriod?: string;
  approvalStatus: PortfolioSowApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PortfolioSowSummary {
  totalIssued: number;
  approved: number;
  unapproved: number;
  issuedThisMonth: number;
}

export type PortfolioReportType = 'sdm' | 'sow';
export type PortfolioReportSortField = 'companyName' | 'fileName' | 'reportType' | 'createdAt' | 'reportPeriod';

export interface PortfolioReportRow {
  id: string;
  companyId: string;
  companyName: string;
  reportType: PortfolioReportType;
  fileName: string;
  createdAt: string;
  createdBy?: string;
  templateId?: string;
  templateRevision?: number;
  schemaVersion: number;
  sourceDataTimestamp?: string;
  reportPeriod?: string;
}

export interface PortfolioReportSummary {
  totalReports: number;
  statementsOfWork: number;
  sdmReports: number;
  companiesWithReports: number;
}

export interface UpdatePortfolioSowApprovalRequest {
  approvalStatus: PortfolioSowApprovalStatus;
}

export type PortfolioMonthEndStatus = 'complete' | 'incomplete' | 'unavailable';
export type PortfolioMonthEndSortField = 'customerName' | 'status' | 'issuedAt' | 'reportPeriod';

export interface PortfolioMonthEndRow {
  id: string;
  companyId: string;
  customerName: string;
  reportPeriod: string;
  status: PortfolioMonthEndStatus;
  draftId?: string;
  issuedReportId?: string;
  issuedAt?: string;
  updatedAt?: string;
}

export interface PortfolioMonthEndSummary {
  totalCustomers: number;
  complete: number;
  incomplete: number;
  unavailable: number;
}

export type PortfolioExpiryKind =
  | 'service-principal'
  | 'cloud-account-credential'
  | 'application-secret'
  | 'application-certificate'
  | 'reservation'
  | 'savings-plan'
  | 'service-retirement'
  | 'service-expiry';
export type PortfolioExpiryStatus = 'expired' | 'expiring' | 'active';
export type PortfolioExpirySortField = 'customerName' | 'kind' | 'name' | 'expiryDate' | 'daysToExpiry';

export interface PortfolioExpiryRow {
  id: string;
  companyId: string;
  customerName: string;
  subscriptionId?: string;
  subscriptionName?: string;
  kind: PortfolioExpiryKind;
  name: string;
  expiryDate: string;
  daysToExpiry: number;
  status: PortfolioExpiryStatus;
  sourceUrl?: string;
}

export interface PortfolioExpirySummary {
  total: number;
  expired: number;
  expiringWithin30Days: number;
  expiringWithin90Days: number;
}

export type PortfolioExceptionKind = 'attention' | 'risk' | 'service-opportunity';
export type PortfolioAttentionSortField = 'companyName' | 'severity' | 'title' | 'dueAt';

export interface PortfolioAttentionSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}
