import {
  PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION,
  PORTFOLIO_PROJECTION_SCHEMA_VERSION,
  PORTFOLIO_PROJECTION_DETAIL_SHARD_COUNT,
  type PortfolioCloudAccountSummary,
  type PortfolioCloudAccountSummaryManifest,
  type PortfolioCloudProjectionDetailShard,
  type PortfolioInsightsCompanyContribution,
  type PortfolioOverviewResponse,
  type PortfolioProjectionManifest,
  type PortfolioProjectionSchemaVersion,
} from './portfolioProjections';
import type { PortfolioAttentionSummary, PortfolioPageResponse } from './portfolioOperations';

const manifest = {
  schemaVersion: '2026-08-13',
  group: 'cloud-account',
  companyId: 'company-1',
  cloudAccountId: 'account-1',
  provider: 'azure',
  providerAccountId: 'tenant-1',
  tenantRunId: 'tenant-run-1',
  generationId: 'generation-1',
  generatedAt: '2026-07-27T00:00:00.000Z',
  inputDigest: 'digest-1',
  inputSubscriptionIds: ['subscription-1'],
  buildStatus: 'complete',
  freshness: 'current',
  failures: [],
  artifact: {
    kind: 'summary',
    path: 'company-1/portfolio/cloud-accounts/account-1/runs/generation-1/summary.json.gz',
    contentHash: 'hash-1',
    byteSize: 100,
    rowCount: 1,
  },
  warnings: [],
} satisfies PortfolioCloudAccountSummaryManifest;

declare const summary: PortfolioCloudAccountSummary;

const manifestGeneration: string = manifest.generationId;
const summaryGeneration: string = summary.metadata.generationId;
const accountRows = summary.estate.accounts;
const accountBudgets = summary.operations.budgets;
declare const companyInsights: PortfolioInsightsCompanyContribution;
declare const overview: PortfolioOverviewResponse;
declare const projectionManifest: PortfolioProjectionManifest;
declare const page: PortfolioPageResponse<unknown, PortfolioAttentionSummary>;

const currentProjectionVersion: '2026-08-02' = PORTFOLIO_PROJECTION_SCHEMA_VERSION;
const currentCloudAccountSummaryVersion: '2026-08-13' = PORTFOLIO_CLOUD_ACCOUNT_SUMMARY_SCHEMA_VERSION;
const previousProjectionVersion: PortfolioProjectionSchemaVersion = '2026-07-26';
const resourceHealthCoverage = companyInsights.operationalPosture.coverage?.resourceHealth;
const retainedAttentionTotal = companyInsights.attentionRetention?.totalCount;
const anomalyCoverage = summary.operations.finops.coverage?.costAnomalies;
const companyHealthRows = overview.companies?.items;
const retainedRows = page.retainedRows;
const pageIsTruncated = page.truncated;
const companiesWithRisks = overview.management.companiesWithRisks;
const companiesWithHighRisks = overview.management.companiesWithHighRisks;
const sourceMembershipDigest: string | undefined = projectionManifest.sourceMembershipDigest;
const detailShard = {
  schemaVersion: PORTFOLIO_PROJECTION_SCHEMA_VERSION,
  group: 'cloud',
  scopeCompanyId: 'root',
  generationId: 'generation-1',
  shardIndex: 0,
  shardCount: 1,
  companyIds: ['root'],
  estate: [],
  insights: [],
  operations: [],
} satisfies PortfolioCloudProjectionDetailShard;

void manifestGeneration;
void summaryGeneration;
void accountRows;
void accountBudgets;
void currentProjectionVersion;
void currentCloudAccountSummaryVersion;
void previousProjectionVersion;
void resourceHealthCoverage;
void retainedAttentionTotal;
void anomalyCoverage;
void companyHealthRows;
void retainedRows;
void pageIsTruncated;
void companiesWithRisks;
void companiesWithHighRisks;
void sourceMembershipDigest;
void detailShard;
