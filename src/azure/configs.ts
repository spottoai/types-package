import { AzureResourceMetric, MetricDescription, MetricsDisplay } from './metrics.js';
import { ResourceLink, ResourceTypeReference } from './resources.js';

export type BillingProfileSupport = 'ready' | 'partial' | 'manual_review';

export type BillingScope = 'none' | 'self' | 'parent' | 'derived';

export type BillingModel =
  | 'non_billable'
  | 'base_only'
  | 'usage_only'
  | 'base_plus_usage'
  | 'tiered_usage'
  | 'conditional'
  | 'variant_priced'
  | 'unknown';

export type BillingComponentKind = 'base' | 'usage' | 'supporting' | 'linked' | 'parent_rollup';

export type BillingQuantitySource = 'none' | 'fixed_time' | 'resource_property' | 'billing_row' | 'metric' | 'linked_resource';

export type PricingLookupLocationPolicy = 'local_only' | 'local_then_global';

export type PricingLookupMatchCondition = 'vm_license_charge' | 'public_ip_base_charge';

export interface BillingVariantSignal {
  expression: string;
  notes?: string;
}

export interface BillingCandidatePolicy {
  policy: string;
  when?: string;
  value?: string | boolean | number;
  notes?: string;
}

export interface BillingComponentProfile {
  key: string;
  kind: BillingComponentKind;
  enabledWhen?: string;
  quantitySource: BillingQuantitySource;
  pricingServiceNames?: string[];
  lookupMeterHints?: string[];
  lookupUnitFamily?: string;
  metricKeys?: string[];
  resourcePropertyExpression?: string;
  parentResourceExpression?: string;
  notes?: string;
}

export interface BillingProfile {
  support: BillingProfileSupport;
  billingScope: BillingScope;
  billingModel: BillingModel;
  pricingServiceNames?: string[];
  billableExpression?: string;
  variantSignals?: Record<string, BillingVariantSignal>;
  candidatePolicies?: BillingCandidatePolicy[];
  parentBillingResourceExpression?: string;
  notes?: string;
  components?: BillingComponentProfile[];
}

export interface PricingLookupVariant {
  when: PricingLookupMatchCondition;
  locationPolicy?: PricingLookupLocationPolicy;
  preferredBaseServiceNames?: string[];
  contextualAliases?: string[];
}

export interface PricingLookup {
  locationPolicy?: PricingLookupLocationPolicy;
  preferredBaseServiceNames?: string[];
  contextualAliases?: string[];
  variants?: PricingLookupVariant[];
}

export interface ResourceConfig {
  resourceGroups: ResourceConfigItem;
  resourcesAll: ResourceConfigItem;
  resources: ResourceConfigItem[];
}

export interface ResourceConfigItem {
  url: string;
  doc: string;
  links?: ResourceLink[];
  overrideParentProperty?: string;
  overrideSourceProperty?: string;
  isArray?: boolean;
  mandatory?: boolean;
  /** if true, then the resource is supported by the platform (e.g. activity logs, scaling plans, billing) */
  supporting?: boolean;
  displayServiceName?: string;
  /** an expression to determine the display service name */
  displayServiceNameExpression?: string;
  icon?: string;
  /** an expression to determine the icon */
  iconExpression?: string;
  /** a description of the service */
  description?: string;
  /** an expression to determine the description */
  descriptionExpression?: string;
  /** a link to the product page */
  product?: string;
  /** an expression to determine the product */
  productExpression?: string;

  /** jsonata expression evaluated against parent resource to decide if a child should run */
  when?: string;

  ttlHours?: number;
  references: { [key: string]: ResourceTypeReference };
  metricsBatchSupport?: boolean;
  metrics?: AzureResourceMetric[];
  metricsDescription?: MetricDescription[];
  metricsDisplay?: MetricsDisplay[];

  /** Loaded during processing */
  name: string;
  type: string;
  parameters: object;
  alias: AliasConfig;
  resources: ResourceConfigItem[];
  /** e.g. "Virtual Network" used for bill / price matching */
  serviceName?: string;
  pricingServiceName?: string;
  pricingServiceNames?: string[];
  aliases?: string[];
  pricingLookup?: PricingLookup;
  billingProfile?: BillingProfile;
  label1?: string;
  label2?: string;
  label3?: string;
  meter?: string;
  meterSubCategory?: string;
  sku?: string;
}

export interface AliasConfig {
  properties: string[];
  referenceType: string;
}
