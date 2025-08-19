import { MetricDescription, MetricsDisplay } from "./metrics.js"
import { ResourceLink, ResourceTypeReference } from "./resources.js"
import { AzureResourceMetric } from "./metrics.js"

export interface ResourceConfig {
    resourceGroups: ResourceConfigItem
    resourcesAll: ResourceConfigItem
    resources: ResourceConfigItem[]
}

export interface ResourceConfigItem {
    url: string
    doc: string
    links?: ResourceLink[]
    overrideParentProperty?: string
    overrideSourceProperty?: string
    isArray?: boolean
    mandatory?: boolean
    supporting?: boolean // if true, then the resource is supported by the platform (e.g. activity logs, scaling plans, billing)
    displayServiceName?: string
    displayServiceNameExpression?: string // an expression to determine the display service name
    icon?: string
    iconExpression?: string // an expression to determine the icon
    description?: string // a description of the service
    descriptionExpression?: string // an expression to determine the description
    product?: string // a link to the product page
    productExpression?: string // an expression to determine the product

    references: { [key: string]: ResourceTypeReference }
    metrics?: AzureResourceMetric[];
    metricsDescription?: MetricDescription[];
    metricsDisplay?: MetricsDisplay[];

    // Loaded during processing
    name: string
    type: string
    parameters: object
    alias: AliasConfig
    resources: ResourceConfigItem[]
    serviceName?: string // e.g. "Virtual Network" used for bill / price matching
    label1?: string
    label2?: string
    label3?: string
    sku?: string
}

export interface AliasConfig {
    properties: string[]
    referenceType: string
}