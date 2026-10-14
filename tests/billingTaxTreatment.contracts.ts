import type {
  AzureResourcePortalItem,
  AzureResourcesView,
  BillingCostAnalysisMetadata,
  BillingDailyChartView,
  BillingForecastChartView,
  BillingMonthlyChartView,
  BillingTaxTreatment,
  DailySummary,
  DecompositionTree,
  MiscCost,
  MonthSummary,
  ResourceSpend,
  SubscriptionScope,
  SubscriptionStats,
} from '../src/index';

const treatment: BillingTaxTreatment = 'excluding-tax';
const spend: Pick<SubscriptionStats, 'taxTreatment'> = { taxTreatment: treatment };
const resource: Pick<AzureResourcePortalItem, 'taxTreatment'> = spend;
const resources: Pick<AzureResourcesView, 'taxTreatment'> = spend;
const daily: Pick<DailySummary, 'taxTreatment'> = spend;
const month: Pick<MonthSummary, 'taxTreatment'> = { taxTreatment: 'including-recorded-tax' };
const tree: Pick<DecompositionTree, 'taxTreatment'> = spend;
const row: Pick<ResourceSpend, 'taxTreatment'> = spend;
const misc: Pick<MiscCost, 'taxTreatment'> = spend;
const scope: Pick<SubscriptionScope, 'taxTreatment'> = spend;
const dailyChart: Pick<BillingDailyChartView, 'taxTreatment'> = spend;
const monthlyChart: Pick<BillingMonthlyChartView, 'taxTreatment'> = month;
const forecastChart: Pick<BillingForecastChartView, 'taxTreatment'> = spend;
const forecast: Pick<BillingCostAnalysisMetadata, 'forecastTaxTreatment'> = { forecastTaxTreatment: treatment };
// @ts-expect-error Consumption is a charge subset, not a tax treatment.
const invalid: BillingTaxTreatment = 'consumption-only';
void [resource, resources, daily, month, tree, row, misc, scope, dailyChart, monthlyChart, forecastChart, forecast, invalid];

// Partial group subtotals remain separate from complete spend fields.
import type { KnownResourceGroupSpend, ResourcesByType } from '../src/index';
const knownGroup: KnownResourceGroupSpend = {
  taxTreatment: 'excluding-tax',
  currency: 'USD',
  totalResourceCount: 3,
  billedResourceCount: 1,
  amortizedResourceCount: 0,
  cost: 0,
};
const groupWithKnownSubtotal: ResourcesByType = { type: 'Other', resources: 3, knownSpend30Days: knownGroup };
void groupWithKnownSubtotal;
