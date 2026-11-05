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
export const RESOURCE_SIZE_OPTION_LIMITS = {
    alternatives: 5,
    memoryPreservingAlternatives: 5,
    tradeOffAlternatives: 5,
};
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isNonNegative = (value) => isFiniteNumber(value) && value >= 0;
const isPositive = (value) => isFiniteNumber(value) && value > 0;
const isOptional = (value, guard) => value === undefined || guard(value);
const RESERVED_PRICE_FIELDS = [
    'reserved1yNoUpfrontHourly',
    'reserved1yPartialUpfrontHourly',
    'reserved1yAllUpfrontHourly',
    'reserved3yNoUpfrontHourly',
    'reserved3yPartialUpfrontHourly',
    'reserved3yAllUpfrontHourly',
];
const isPrices = (value) => isRecord(value) &&
    isNonNegative(value.onDemandHourly) &&
    isNonNegative(value.onDemandMonthly) &&
    RESERVED_PRICE_FIELDS.every(field => isOptional(value[field], isNonNegative));
export const isResourceSizeOption = (value) => isRecord(value) &&
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
const isOptionList = (value, limit, tradeOff) => Array.isArray(value) &&
    value.length <= limit &&
    value.every(option => isResourceSizeOption(option) &&
        option.changePercent < 0 &&
        (tradeOff ? option.lostCapabilities.length > 0 : option.lostCapabilities.length === 0)) &&
    value.every((option, index) => index === 0 || value[index - 1].prices.onDemandHourly <= option.prices.onDemandHourly);
/**
 * Runtime guard for `ResourceSizeOptions`. Beyond the shape it enforces the menu's meaning: `current` changes
 * nothing, every listed option is cheaper and sorted cheapest first, trade-offs (and only trade-offs) name what they
 * give up, memory-preserving options keep at least the current memory, and each list respects its limit.
 */
export const isResourceSizeOptions = (value) => {
    if (!isRecord(value))
        return false;
    if (!isText(value.service) || !isText(value.region) || !isText(value.currency) || !isText(value.priceSource))
        return false;
    if (value.priceBasis !== 'list' || value.comparisonScope !== 'same-region')
        return false;
    if (value.availability !== 'verified' && value.availability !== 'unverified')
        return false;
    if (!isRecord(value.pricingDimensions) || !Object.values(value.pricingDimensions).every(entry => typeof entry === 'string'))
        return false;
    const current = value.current;
    if (!isResourceSizeOption(current) || current.changePercent !== 0 || current.lostCapabilities.length > 0)
        return false;
    const memoryPreserving = value.memoryPreservingAlternatives;
    return (isOptionList(value.alternatives, RESOURCE_SIZE_OPTION_LIMITS.alternatives, false) &&
        isOptionList(memoryPreserving, RESOURCE_SIZE_OPTION_LIMITS.memoryPreservingAlternatives, false) &&
        memoryPreserving.every(option => option.memoryGB >= current.memoryGB) &&
        isOptionList(value.tradeOffAlternatives, RESOURCE_SIZE_OPTION_LIMITS.tradeOffAlternatives, true));
};
