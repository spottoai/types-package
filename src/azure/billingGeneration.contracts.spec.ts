import type { BillingAnalyzerRequest, BillingGenerationOutput, BillingGenerationState } from './billingGeneration';
import type { BillingCostAnalysisMetadata } from './billingPlots';

const generationState: BillingGenerationState = {
  subscriptionId: 'subscription-123',
  billingGenerationId: 'generation-123',
  sourceRunId: 'source-run-123',
  sourcePublishedAt: '2026-08-05T00:00:00.000Z',
};

const analyzerRequest: BillingAnalyzerRequest = {
  subscriptionId: generationState.subscriptionId,
  billingGenerationId: generationState.billingGenerationId,
  correlationId: 'correlation-123',
  currencyCode: 'NZD',
  currencySymbol: '$',
  detectDataGaps: true,
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  metadata: {
    integrityIssueDays: 1,
    suppressGapRecoveryRequest: false,
  },
  filesWithGaps: [
    {
      file: 'history/billing/calendar/month_2026-07.json',
      missingDays: ['2026-07-15'],
      issueReasons: ['record_day_gap'],
    },
  ],
};

const generationOutput: BillingGenerationOutput = {
  subscriptionId: generationState.subscriptionId,
  billingGenerationId: generationState.billingGenerationId,
  status: 'completed',
  completedAt: '2026-08-05T00:05:00.000Z',
};

const costAnalysisMetadata: BillingCostAnalysisMetadata = {
  subscriptionId: generationState.subscriptionId,
  billingGenerationId: generationState.billingGenerationId,
  chartData: {
    schemaVersion: 1,
    source: 'aggregated',
    dataWindow: {
      startDate: 1754006400,
      endDate: 1754352000,
      pointCount: 0,
    },
    views: {},
    detectors: {
      threshold: 2,
      methods: [],
    },
  },
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
};

void analyzerRequest;
void generationOutput;
void costAnalysisMetadata;

// @ts-expect-error generation state must identify the reserved billing generation.
const stateWithoutGeneration: BillingGenerationState = {
  subscriptionId: 'subscription-123',
  sourceRunId: 'source-run-123',
  sourcePublishedAt: '2026-08-05T00:00:00.000Z',
};

// @ts-expect-error analyzer requests must identify the expected billing generation.
const requestWithoutGeneration: BillingAnalyzerRequest = {
  subscriptionId: 'subscription-123',
  correlationId: 'correlation-123',
  currencyCode: 'NZD',
  currencySymbol: '$',
  detectDataGaps: true,
  companyId: 'company-123',
  cloudAccountId: 'cloud-account-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
};

// @ts-expect-error completed output must identify the billing generation it belongs to.
const outputWithoutGeneration: BillingGenerationOutput = {
  subscriptionId: 'subscription-123',
  status: 'completed',
  completedAt: '2026-08-05T00:05:00.000Z',
};

const outputWithInvalidStatus: BillingGenerationOutput = {
  subscriptionId: 'subscription-123',
  billingGenerationId: 'generation-123',
  // @ts-expect-error a published billing generation manifest is complete or absent.
  status: 'processing',
  completedAt: '2026-08-05T00:05:00.000Z',
};

// @ts-expect-error latest cost-analysis metadata must identify its billing generation.
const metadataWithoutGeneration: BillingCostAnalysisMetadata = {
  subscriptionId: costAnalysisMetadata.subscriptionId,
  chartData: costAnalysisMetadata.chartData,
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
};

void stateWithoutGeneration;
void requestWithoutGeneration;
void outputWithoutGeneration;
void outputWithInvalidStatus;
void metadataWithoutGeneration;
