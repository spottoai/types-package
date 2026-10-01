/**
 * Resource size options: the provider-neutral, same-Region menu of priced resize alternatives for one resource,
 * carried as `sizeOptions` on portal and plugin resource items. One shape serves every sized service (AWS EC2, RDS,
 * ElastiCache, ...), where `VmPricePerformanceInsights` is Azure-VM-specific.
 *
 * Prices are public list prices in `currency` (USD for AWS), never billed cost. The single recommended move, with a
 * billed saving, stays on `UtilizationSignal.betterSku` / `OversizedResourceRow.recommendedOption`; this is the menu
 * behind it.
 *
 * Spec: `specs/compute-alternatives/resource-size-options-types-package.md` (parent: cloud-engine-aws
 * `Specs/feature-gaps/22-instance-catalog-and-sku-comparison.md`).
 *
 * Producer: cloud-engine-aws (`InstanceCatalogSizeOptions`). Consumers: api (resource detail pass-through), ui
 * (resource size-options panel).
 *
 * Additive: consumers must tolerate unknown fields and unknown `lostCapabilities` / `priceSource` values.
 */

/** Maximum options per list, matching the engines' resize envelope. */
export const RESOURCE_SIZE_OPTION_LIMITS = {
  alternatives: 5,
  memoryPreservingAlternatives: 5,
  tradeOffAlternatives: 5,
} as const;

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

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isNonNegative = (value: unknown): value is number => isFiniteNumber(value) && value >= 0;
const isPositive = (value: unknown): value is number => isFiniteNumber(value) && value > 0;
const isOptional = (value: unknown, guard: (candidate: unknown) => boolean): boolean => value === undefined || guard(value);

const RESERVED_PRICE_FIELDS = [
  'reserved1yNoUpfrontHourly',
  'reserved1yPartialUpfrontHourly',
  'reserved1yAllUpfrontHourly',
  'reserved3yNoUpfrontHourly',
  'reserved3yPartialUpfrontHourly',
  'reserved3yAllUpfrontHourly',
] as const;

const isPrices = (value: unknown): value is ResourceSizeOptionPrices =>
  isRecord(value) &&
  isNonNegative(value.onDemandHourly) &&
  isNonNegative(value.onDemandMonthly) &&
  RESERVED_PRICE_FIELDS.every(field => isOptional(value[field], isNonNegative));

export const isResourceSizeOption = (value: unknown): value is ResourceSizeOption =>
  isRecord(value) &&
  isText(value.sku) &&
  isText(value.label) &&
  isPositive(value.vcpu) &&
  isPositive(value.memoryGB) &&
  isOptional(value.gpuCount, isNonNegative) &&
  isOptional(value.architecture, isText) &&
  isPrices(value.prices) &&
  isFiniteNumber(value.changePercent) &&
  Array.isArray(value.lostCapabilities) &&
  value.lostCapabilities.every(isText);

const isOptionList = (value: unknown, limit: number, tradeOff: boolean): value is ResourceSizeOption[] =>
  Array.isArray(value) &&
  value.length <= limit &&
  value.every(
    option =>
      isResourceSizeOption(option) &&
      option.changePercent < 0 &&
      (tradeOff ? option.lostCapabilities.length > 0 : option.lostCapabilities.length === 0)
  ) &&
  value.every((option, index) => index === 0 || value[index - 1].prices.onDemandHourly <= option.prices.onDemandHourly);

/**
 * Runtime guard for `ResourceSizeOptions`. Beyond the shape it enforces the menu's meaning: `current` changes
 * nothing, every listed option is cheaper and sorted cheapest first, trade-offs (and only trade-offs) name what they
 * give up, memory-preserving options keep at least the current memory, and each list respects its limit.
 */
export const isResourceSizeOptions = (value: unknown): value is ResourceSizeOptions => {
  if (!isRecord(value)) return false;
  if (!isText(value.service) || !isText(value.region) || !isText(value.currency) || !isText(value.priceSource)) return false;
  if (value.priceBasis !== 'list' || value.comparisonScope !== 'same-region') return false;
  if (value.availability !== 'verified' && value.availability !== 'unverified') return false;
  if (!isRecord(value.pricingDimensions) || !Object.values(value.pricingDimensions).every(entry => typeof entry === 'string')) return false;
  const current = value.current;
  if (!isResourceSizeOption(current) || current.changePercent !== 0 || current.lostCapabilities.length > 0) return false;
  const memoryPreserving = value.memoryPreservingAlternatives;
  return (
    isOptionList(value.alternatives, RESOURCE_SIZE_OPTION_LIMITS.alternatives, false) &&
    isOptionList(memoryPreserving, RESOURCE_SIZE_OPTION_LIMITS.memoryPreservingAlternatives, false) &&
    memoryPreserving.every(option => option.memoryGB >= current.memoryGB) &&
    isOptionList(value.tradeOffAlternatives, RESOURCE_SIZE_OPTION_LIMITS.tradeOffAlternatives, true)
  );
};
