import type { IEffectiveSavingsRateSummary } from './benefits.js';
import type { DailySummaryEntry, MonthSummaryEntry, ResourceCostType } from './common.js';
import type { DataProtectionCostAmount, DataProtectionCostSummary } from './dataProtection.js';
import type { DailyMetrics } from './metrics.js';
import type {
  CostDetails,
  CostSummaryDetails,
  ResourceCostPeriodDetails,
  ResourceCostSummary,
  ResourceSpend,
} from './prices.js';
import type { RecommendationResource } from './recommendations.js';
import type { DecompositionTree, DecompositionTreeNode, MeterDetail } from './reports.js';
import type { ResourceByLocation, ResourcesByType } from './resources.js';
import type { SubscriptionStats } from './subscriptions.js';
import type {
  AzurePluginResourceLite,
  AzureRecommendationResourceEvidenceResource,
  AzureResourcePluginItem,
  AzureResourcePluginItemDetailed,
  AzureResourcePortalItem,
} from './views.js';

const unavailableAmortizedValues = [
  { totalSpend30DaysAmortized: null } satisfies Pick<CostDetails, 'totalSpend30DaysAmortized'>,
  { amortizedTotal: null } satisfies Pick<CostSummaryDetails, 'amortizedTotal'>,
  { amortizedTotal: null } satisfies Pick<ResourceCostPeriodDetails, 'amortizedTotal'>,
  { spendAmortized: null } satisfies Pick<ResourceCostSummary, 'spendAmortized'>,
  { costAmortized: null } satisfies Pick<ResourceSpend, 'costAmortized'>,
  { costAmortized: null } satisfies Pick<MonthSummaryEntry, 'costAmortized'>,
  { costAmortized: null } satisfies Pick<DailySummaryEntry, 'costAmortized'>,
  { costAmortized: null } satisfies Pick<ResourceCostType, 'costAmortized'>,
  { costAmortized: null } satisfies Pick<DailyMetrics, 'costAmortized'>,
  { spend30DaysAmortized: null } satisfies Pick<SubscriptionStats, 'spend30DaysAmortized'>,
  { spend30DaysAmortized: null } satisfies Pick<ResourcesByType, 'spend30DaysAmortized'>,
  { spend30DaysAmortized: null } satisfies Pick<ResourceByLocation, 'spend30DaysAmortized'>,
  { spendAmortized: null } satisfies Pick<AzureResourcePortalItem, 'spendAmortized'>,
  { spendAmortizedActual: null } satisfies Pick<AzureResourcePluginItem, 'spendAmortizedActual'>,
  { spendAmortizedActual: null } satisfies Pick<AzureResourcePluginItemDetailed, 'spendAmortizedActual'>,
  { amortizedSpend: null } satisfies Pick<AzurePluginResourceLite, 'amortizedSpend'>,
  { spendAmortized: null } satisfies Pick<RecommendationResource, 'spendAmortized'>,
  { spendAmortized: null } satisfies Pick<AzureRecommendationResourceEvidenceResource, 'spendAmortized'>,
  { costAmortized: null } satisfies Pick<DecompositionTreeNode, 'costAmortized'>,
  { totalSpendAmortized: null } satisfies Pick<DecompositionTree, 'totalSpendAmortized'>,
  { costAmortized: null } satisfies Pick<MeterDetail, 'costAmortized'>,
  { amortizedCost: null } satisfies Pick<IEffectiveSavingsRateSummary, 'amortizedCost'>,
  { amortizedAmount: null } satisfies Pick<DataProtectionCostAmount, 'amortizedAmount'>,
  {
    totals: { actualAmortizedCostLast30Days: null },
  } satisfies Pick<DataProtectionCostSummary, 'totals'>,
] as const;

void unavailableAmortizedValues;
