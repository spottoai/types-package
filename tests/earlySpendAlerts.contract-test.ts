import type { AlertLifecycleEvent } from '../src/events/baseAlert';
import type { CostAlertSummary } from '../src/events/cost';
import type { EarlySpendAlertCriteria, EarlySpendAlertSummary } from '../src/events/earlySpend';
import type {
  AlertDefinitionCreateInput,
  AlertDefinitionUpdateInput,
  AlertInstanceRecord,
  QuickAlertCriteria,
  QuickAlertInstanceFor,
  QuickAlertSummary,
} from '../src/events/quickAlerts';

const earlySpendCriteria = {
  kind: 'earlySpend',
  source: 'costSignals',
  templateId: 'early-spend-default',
  signals: ['costImpact', 'createBurst', 'telemetryRunRate'],
  minEstimatedDailyCost: 25,
  minPercentOfBaseline: 5,
  telemetryMinIncreasePercent: 50,
  burst: { minCount: 20, windowMinutes: 60, minCount24h: 100 },
  minConfidence: 0.5,
  includeCallerInExternalNotifications: false,
} satisfies QuickAlertCriteria;

const earlySpendDefinition = {
  name: 'Early spend',
  enabled: true,
  category: 'cost',
  type: 'earlySpend',
  scope: { subscriptionIds: ['sub-1'] },
  criteria: earlySpendCriteria,
} satisfies AlertDefinitionCreateInput;

// @ts-expect-error Early spend alerts are cost alerts.
const earlySpendDefinitionWrongCategory: AlertDefinitionCreateInput = { ...earlySpendDefinition, category: 'other' };

// @ts-expect-error Existing quick alerts stay in the other category.
const backupDefinitionWrongCategory: AlertDefinitionCreateInput = {
  name: 'Backup failures detected',
  enabled: true,
  category: 'cost',
  type: 'backupFailure',
  scope: { subscriptionIds: ['sub-1'] },
  criteria: { kind: 'backupFailure', source: 'dataProtection', templateId: 'backup-failure', minimumConsecutiveFailures: 2 },
};

const earlySpendUpdate = {
  name: 'Early spend (bursts only)',
  enabled: true,
  scope: { subscriptionIds: ['sub-1'] },
  criteria: {
    signals: ['createBurst'],
    burst: { minCount: 10, windowMinutes: 30 },
  },
} satisfies AlertDefinitionUpdateInput;

const invalidEarlySpendCriteria: EarlySpendAlertCriteria = {
  kind: 'earlySpend',
  source: 'costSignals',
  // @ts-expect-error Unknown signal kinds are rejected.
  signals: ['billingAnomaly'],
};

const burstSummary = {
  summaryText: '27 disk snapshots created in 60 minutes by deploy-bot',
  subscriptionId: 'sub-1',
  signalKind: 'createBurst',
  resourceType: 'microsoft.compute/snapshots',
  currency: 'NZD',
  estimatedDailyCost: 0,
  estimatedDailyCostRange: { low: 0, high: 18400 },
  estimateBasis: 'count_only',
  confidence: 0.4,
  firstSignalAt: '2026-10-01T02:00:00.000Z',
  detectedAt: '2026-10-01T03:10:00.000Z',
  burst: {
    count: 27,
    windowStart: '2026-10-01T02:00:00.000Z',
    windowEnd: '2026-10-01T03:00:00.000Z',
    caller: 'deploy-bot',
    sampleResourceIds: ['/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/snapshots/snap-1'],
  },
  reconciliation: { state: 'pending' },
} satisfies EarlySpendAlertSummary;

const reconciledSummary = {
  ...burstSummary,
  signalKind: 'costImpact',
  resourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
  estimatedDailyCost: 412.5,
  estimateBasis: 'sku_pricing',
  activity: { operationName: 'Microsoft.Compute/virtualMachines/write', eventTimestamp: '2026-10-01T01:55:00.000Z' },
  reconciliation: { state: 'confirmed', billedDailyCost: 398.2, billedThroughDate: '2026-10-02', variancePercent: -3.5 },
} satisfies EarlySpendAlertSummary;

// Early spend summaries remain readable as quick-alert summaries.
const asQuickSummary: QuickAlertSummary = reconciledSummary;

declare const earlySpendInstance: QuickAlertInstanceFor<'earlySpend'>;
const earlySpendState: EarlySpendAlertSummary['reconciliation']['state'] | undefined = earlySpendInstance.summary?.reconciliation.state;
const earlySpendCategory: 'cost' = earlySpendInstance.category;

declare const anyInstance: AlertInstanceRecord;
// Fields shared by every quick-alert summary stay accessible without narrowing.
const sharedSummaryText: string | undefined = anyInstance.type === 'backupFailure' ? anyInstance.summary?.summaryText : undefined;

const escalated: AlertLifecycleEvent = 'escalated';
const blendedSummary = { dataSource: 'blended', estimatedShare: 0.2 } satisfies CostAlertSummary;

void [
  earlySpendCriteria,
  earlySpendDefinition,
  earlySpendDefinitionWrongCategory,
  backupDefinitionWrongCategory,
  earlySpendUpdate,
  invalidEarlySpendCriteria,
  burstSummary,
  reconciledSummary,
  asQuickSummary,
  earlySpendState,
  earlySpendCategory,
  sharedSummaryText,
  escalated,
  blendedSummary,
];
