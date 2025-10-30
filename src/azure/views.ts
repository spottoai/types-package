import { ActivityLog, DailySummary, MonthSummary } from './common.js';
import { DisplayMetric, MetricPlot } from './metrics.js';
import { CostSummaryDetails } from './prices.js';
import { AzureRecommendationLite, Recommendation } from './recommendations.js';
import { SubscriptionSummary, SubscriptionSummaryLite } from './subscriptions.js';
import { ResourceCostEstimationSummary, ResourceSimpleCostEstimationSummary } from './costEstimation';

export interface AzureDashboardView {
  subscription: SubscriptionSummary;
  timestamp: string;
  costStartDate?: number;
  costEndDate?: number;
  calendarSummary?: MonthSummary;
  billingPeriodSummary?: MonthSummary;
  summary?: ExecutiveSummary;
  dailySummary?: DailySummary;
}

export interface ExecutiveSummary {
  summary: string;
  details: string;
}

export interface AzureResourcesView {
  subscription: SubscriptionSummaryLite;
  timestamp: string;
  resources: AzureResourcePortalItem[];
  tags?: Record<string, string[]>; // e.g. { "environment": ["production", "staging"], "team": ["devops", "frontend"] }
}

// Note that many properties will not exist and is only specified here if it's custom, the rest of the properties will be looked up
// such as icon, description, product, serviceName
export interface AzureResourcePortalItem {
  id: string; // e.g. "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/my-resource-group/providers/Microsoft.Web/sites/my-app-service"
  name: string; // e.g. "my-app-service"
  label1?: string; // e.g. Linux or Windows
  label2?: string; // e.g. 2 Cores, 4 GB RAM
  label3?: string;
  sku?: string; // e.g. "F1" or "P1"
  serviceName?: string; // e.g. "App Service" or "Function App"
  icon?: string; // e.g. "appservice" or "functionapp"
  description?: string; // e.g. "Azure App Service is an HTTP-based service for hosting web applications, REST APIs, and mobile back ends. You can develop in your favorite language, be it .NET, .NET Core, Java, Ruby, Node.js, PHP, or Python. Applications run and scale with ease on both Windows and Linux-based environments."
  product?: string; // e.g. "https://azure.microsoft.com/en-us/products/app-service/"
  type: string; // e.g. "Microsoft.Web/sites"
  location: string; // e.g. "West US"
  spend: number; // Total spend over the last 30 days
  spendAmortized: number; // Total spend over the last 30 days, taking into account reserved instances and savings plans
  savings?: SavingsPotential;
  recommendations: AzureRecommendationLite[];
  customRecommendations: AzureRecommendationLite[]; // Spotto recommendations
  tags?: Record<string, string>; // e.g. { "environment": "production", "team": "devops" }
  createdTime?: number; // e.g. 1715769600000 (Unix timestamp in milliseconds)
  costEstimation?: ResourceSimpleCostEstimationSummary; // This is simplfied
}

export interface SavingsPotential {
  minAmount: number;
  minPercentage: number;
  maxAmount: number;
  maxPercentage: number;
}

export interface AzureResourcePluginView {
  currency: string;
  currencySymbol: string;
  timestamp: string;
  resources: AzureResourcePluginItem[];
  costStartDate?: number;
  costEndDate?: number;
}

export interface AzureResourcePluginItem {
  id: string;
  name: string;
  type: string;
  location: string;
  recommendations?: Recommendation[];
  cost?: CostSummaryDetails;
  metrics?: DisplayMetric[];
  activityLogs?: ActivityLog[];
  costEstimation?: ResourceCostEstimationSummary;
}

export interface AzureResourcePluginItemDetailed {
  currency: string;
  currencySymbol: string;
  location: string;
  costStartDate?: number;
  costEndDate?: number;
  timestamp: string;
  id: string;
  companyId?: string; // Added to help identify the company
  type: string;
  name: string;
  recommendations?: Recommendation[];
  cost?: CostSummaryDetails;
  metrics?: DisplayMetric[];
  activityLogs?: ActivityLog[];
  properties?: Record<string, string>;
  plots?: MetricPlot[];
  subscription: string;
  resourceGroup: string;
  tags?: Record<string, string>;
  costEstimation?: ResourceCostEstimationSummary;
}

// This is used by the plugin summaryu (e.g. A list of all the VMs on the VMs page)
export interface AzurePluginResourcesLite {
  currency: string;
  currencySymbol: string;
  resources: AzurePluginResourceLite[];
}

export interface AzurePluginResourceLite {
  resourceId: string;
  spend: number; // Total spend over the last 30 days
  amortizedSpend: number; // Total amortized spend over the last 30 days
  recommendations: AzureRecommendationLite[];
  customRecommendations: AzureRecommendationLite[]; // Spotto recommendations
}
