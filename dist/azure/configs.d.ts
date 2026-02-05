import { MetricDescription, MetricsDisplay } from './metrics.js';
import { ResourceLink, ResourceTypeReference } from './resources.js';
import { AzureResourceMetric } from './metrics.js';
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
    references: {
        [key: string]: ResourceTypeReference;
    };
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
    label1?: string;
    label2?: string;
    label3?: string;
    sku?: string;
}
export interface AliasConfig {
    properties: string[];
    referenceType: string;
}
//# sourceMappingURL=configs.d.ts.map