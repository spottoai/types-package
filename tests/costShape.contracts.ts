import type {
  AwsEstimatedBillingAuthorityBlock,
  AzureResourcePortalItem,
  AzureResourcesView,
  BillingCostAnalysisMetadata,
  BillingDailyChartView,
  BillingForecastChartView,
  BillingMonthlyChartView,
  CostDetails,
  CostSummaryDetails,
  DailySummary,
  DataProtectionCostSummary,
  DecompositionTree,
  DecompositionTreeSummary,
  KnownResourceGroupSpend,
  MiscCost,
  MonthSummary,
  ProviderScopeSelectionItem,
  ResourceCostPeriodDetails,
  ResourceSpend,
  ResourcesByType,
  SubscriptionScope,
  SubscriptionStats,
} from '../src/index';

// @ts-expect-error Billing costs no longer expose alternate tax treatments.
import type { BillingTaxTreatment } from '../src/index';
// @ts-expect-error Tax treatment no longer has a public runtime validator.
import { isBillingTaxTreatment } from '../src/index';

type AssertNever<T extends never> = T;
type RemovedBillingTaxFields = AssertNever<
  Extract<
    'taxTreatment' | 'forecastTaxTreatment',
    | keyof AwsEstimatedBillingAuthorityBlock
    | keyof AzureResourcePortalItem
    | keyof AzureResourcesView
    | keyof BillingCostAnalysisMetadata
    | keyof BillingDailyChartView
    | keyof BillingForecastChartView
    | keyof BillingMonthlyChartView
    | keyof CostDetails
    | keyof CostSummaryDetails
    | keyof DailySummary
    | keyof DataProtectionCostSummary
    | keyof DecompositionTree
    | keyof DecompositionTreeSummary
    | keyof KnownResourceGroupSpend
    | keyof MiscCost
    | keyof MonthSummary
    | keyof ProviderScopeSelectionItem
    | keyof ResourceCostPeriodDetails
    | keyof ResourceSpend
    | keyof SubscriptionScope
    | keyof SubscriptionStats
  >
>;

// Signed known subtotals keep currency and independent basis counts.
const knownGroup: KnownResourceGroupSpend = {
  currency: 'USD',
  totalResourceCount: 3,
  billedResourceCount: 1,
  amortizedResourceCount: 0,
  cost: 0,
};
const groupWithKnownSubtotal: ResourcesByType = { type: 'Other', resources: 3, knownSpend30Days: knownGroup };
void groupWithKnownSubtotal;
