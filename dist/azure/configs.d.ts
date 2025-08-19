import { MetricDescription, MetricsDisplay } from "./metrics.js";
import { ResourceLink, ResourceTypeReference } from "./resources.js";
import { AzureResourceMetric } from "./metrics.js";
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
    supporting?: boolean;
    displayServiceName?: string;
    displayServiceNameExpression?: string;
    icon?: string;
    iconExpression?: string;
    description?: string;
    descriptionExpression?: string;
    product?: string;
    productExpression?: string;
    references: {
        [key: string]: ResourceTypeReference;
    };
    metrics?: AzureResourceMetric[];
    metricsDescription?: MetricDescription[];
    metricsDisplay?: MetricsDisplay[];
    name: string;
    type: string;
    parameters: object;
    alias: AliasConfig;
    resources: ResourceConfigItem[];
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