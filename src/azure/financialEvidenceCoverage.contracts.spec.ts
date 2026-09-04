import {
  FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1,
  isFinancialEvidenceCoverageProjectionV1,
  type FinancialEvidenceCoverageProjectionV1,
} from './financialEvidenceCoverage';
import type { AzureResourcePluginItemDetailed } from './views';

const projection: FinancialEvidenceCoverageProjectionV1 = {
  contractVersion: FINANCIAL_EVIDENCE_COVERAGE_CONTRACT_VERSION_V1,
  provider: 'azure',
  subscriptionId: 'subscription-1',
  publicationId: 'publication-1',
  artifactGeneration: { runId: 'run-1', generatedAt: '2026-09-04T00:00:00.000Z' },
  scope: { kind: 'subscription', subscriptionId: 'subscription-1' },
  state: 'partial',
  reasons: ['billing-capability-partial'],
  sources: {
    capabilityPassport: {
      state: 'partial',
      reasons: ['billing-capability-partial'],
      generationId: 'run-1',
      completeThrough: '2026-09-03T00:00:00.000Z',
    },
    billingDependency: {
      state: 'complete',
      reasons: ['coverage-complete'],
      generationId: 'billing-1',
    },
  },
};

if (!isFinancialEvidenceCoverageProjectionV1(projection)) throw new Error('Valid financial evidence coverage projection rejected.');
if (isFinancialEvidenceCoverageProjectionV1({ ...projection, subscriptionId: 'other-subscription' })) {
  throw new Error('Mismatched financial evidence coverage scope accepted.');
}
if (isFinancialEvidenceCoverageProjectionV1({ ...projection, reasons: [] })) {
  throw new Error('Financial evidence coverage without a reason accepted.');
}
if (isFinancialEvidenceCoverageProjectionV1({ ...projection, state: 'complete', reasons: ['coverage-complete'] })) {
  throw new Error('Financial evidence coverage accepted a state that contradicts its sources.');
}
if (
  isFinancialEvidenceCoverageProjectionV1({
    ...projection,
    sources: { ...projection.sources, billingDependency: { state: 'complete', reasons: ['invented-reason'] } },
  })
) {
  throw new Error('Unknown financial evidence coverage reason accepted.');
}

const resourceDetailCoverage: Pick<AzureResourcePluginItemDetailed, 'financialEvidenceCoverage'> = {
  financialEvidenceCoverage: projection,
};
if (resourceDetailCoverage.financialEvidenceCoverage !== projection) {
  throw new Error('Resource detail financial evidence coverage contract was not preserved.');
}
