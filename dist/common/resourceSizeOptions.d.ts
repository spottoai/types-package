/**
 * Resource size options: the provider-neutral, same-Region menu of priced resize alternatives for one resource,
 * proposed as `sizeOptions` on portal and plugin resource items for sized services (RDS, ElastiCache, ...).
 * VM alternatives for both Azure and AWS EC2 use the established `VmPricePerformanceInsights` contract instead.
 *
 * Prices are public list prices in `currency` (USD for AWS), never billed cost. The single recommended move, with a
 * billed saving, stays on `UtilizationSignal.betterSku` / `OversizedResourceRow.recommendedOption`; this is the menu
 * behind it.
 *
 * Spec: `specs/compute-alternatives/resource-size-options-types-package.md` (parent: cloud-engine-aws
 * `Specs/feature-gaps/22-instance-catalog-and-sku-comparison.md`).
 *
 * This unreleased non-VM menu proposal has no active public producer or UI renderer. AWS's internal
 * `InstanceCatalogSizeOptions` is projected into the existing VM and story contracts at publication.
 *
 * Additive: consumers must tolerate unknown fields and unknown `lostCapabilities` / `priceSource` values.
 */
/** Maximum options per list, matching the engines' resize envelope. */
export declare const RESOURCE_SIZE_OPTION_LIMITS: {
    readonly alternatives: 5;
    readonly memoryPreservingAlternatives: 5;
    readonly tradeOffAlternatives: 5;
};
/** Where the list prices come from. */
export type ResourceSizeOptionsPriceSource = 'aws-price-list' | 'azure-retail-prices';
/**
 * What a trade-off option gives up against the current size. Known values:
 * - `architecture`: a different CPU architecture (e.g. x86_64 to Graviton arm64) that needs a new image;
 * - `gpu`: fewer or no GPUs;
 * - `instance-storage`: no local NVMe/SSD instance storage;
 * - `sustained-performance`: a burstable (CPU-credit) family.
 */
export type ResourceSizeLostCapability = 'architecture' | 'gpu' | 'instance-storage' | 'sustained-performance';
/** List prices per hour, plus the On-Demand month (730 hours). Reserved prices are effective hourly, when offered. */
export interface ResourceSizeOptionPrices {
    onDemandHourly: number;
    onDemandMonthly: number;
    reserved1yNoUpfrontHourly?: number;
    reserved1yPartialUpfrontHourly?: number;
    reserved1yAllUpfrontHourly?: number;
    reserved3yNoUpfrontHourly?: number;
    reserved3yPartialUpfrontHourly?: number;
    reserved3yAllUpfrontHourly?: number;
}
export interface ResourceSizeOption {
    /** Provider size name, e.g. "m6a.xlarge", "db.r7g.large", "cache.r7g.large". */
    sku: string;
    /** Display label; equals `sku` when the provider has no shorter name. */
    label: string;
    vcpu: number;
    /** Memory as the provider publishes it (AWS: GiB). */
    memoryGB: number;
    gpuCount?: number;
    /** e.g. "x86_64", "arm64". */
    architecture?: string;
    prices: ResourceSizeOptionPrices;
    /** Signed On-Demand list-price change against the current size, in percent; negative is cheaper, 0 on `current`. */
    changePercent: number;
    /** Capabilities given up against the current size; empty on `current` and on non-trade-off lists. */
    lostCapabilities: (ResourceSizeLostCapability | string)[];
}
export interface ResourceSizeOptions {
    /** Provider service, e.g. "ec2", "rds", "elasticache". */
    service: string;
    region: string;
    /** Currency of every price, e.g. "USD". */
    currency: string;
    priceBasis: 'list';
    priceSource: ResourceSizeOptionsPriceSource | string;
    comparisonScope: 'same-region';
    /**
     * Pricing dimensions the comparison held fixed, so only the size changes (e.g. `operatingSystem`, `licenseModel`,
     * `databaseEngine`, `deploymentOption`, `cacheEngine`).
     */
    pricingDimensions: Record<string, string>;
    /** `verified` when every option is a size the account can launch in the Region; otherwise `unverified`. */
    availability: 'verified' | 'unverified';
    current: ResourceSizeOption;
    /** Cheaper sizes that give up nothing, cheapest first. */
    alternatives: ResourceSizeOption[];
    /** Cheaper sizes that give up nothing and keep at least the current memory, cheapest first. */
    memoryPreservingAlternatives: ResourceSizeOption[];
    /** Cheaper sizes that give up at least one capability, cheapest first. */
    tradeOffAlternatives: ResourceSizeOption[];
}
export declare const isResourceSizeOption: (value: unknown) => value is ResourceSizeOption;
/**
 * Runtime guard for `ResourceSizeOptions`. Beyond the shape it enforces the menu's meaning: `current` changes
 * nothing, every listed option is cheaper and sorted cheapest first, trade-offs (and only trade-offs) name what they
 * give up, memory-preserving options keep at least the current memory, and each list respects its limit.
 */
export declare const isResourceSizeOptions: (value: unknown) => value is ResourceSizeOptions;
//# sourceMappingURL=resourceSizeOptions.d.ts.map