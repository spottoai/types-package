/** Price-independent full-population evidence. No account identifiers or raw reports. */
export interface Microsoft365PricingEdge {
  skuId: string;
  /** Stable target identity, when the reviewed catalogue uniquely resolves it. Older snapshots omit it. */
  targetSkuId?: string | null;
  /** Null means removal without a replacement product. */
  targetSkuPartNumber: string | null;
  count: number;
}

export interface Microsoft365PricingGroupFacts {
  key: string;
  label: string;
  licensedAccountCount: number;
  paidSeatCount: number;
  reviewAccountCount: number;
  /** Allocatable paid assignments, including products with no reference market price. */
  unitsBySku: Record<string, number>;
  /** Full-account reviews take precedence over finding review contributions. */
  fullReviewUnitsBySku: Record<string, number>;
  /** Findings only from accounts without a full-account review. */
  findingReviewEdges: (Microsoft365PricingEdge & { kind: 'overlap' | 'downgrade' })[];
}

export const MICROSOFT_365_PRICING_FACT_GROUP_LIMIT = 10000;
export const MICROSOFT_365_PRICING_FACT_CONTRIBUTION_LIMIT = 100000;

export interface Microsoft365PricingFacts {
  /** Overflow retains reference-ranked named groups and a quantity-complete Other tail. */
  groupRanking?: 'reference_price';
  /** Reviewed catalogue identities allow agreed rates for products not held yet. No grant/pricing eligibility is inferred. */
  targetProducts?: { skuId: string; skuPartNumber: string; productName: string; referencePrices: Record<string, number | null> }[];
  schemaVersion: 'microsoft-365-pricing-facts/v1';
  /** Availability is independent of whether the original market contained a unit price. */
  evidence: {
    inventoryKnown: boolean;
    usersKnown: boolean;
    signInsKnown: boolean;
    overlapKnown: boolean;
    downgradeKnown: boolean;
    ambiguousPaidAllocation: boolean;
    /** Producer captured review and group quantities for products without a reference price. Older snapshots omit this. */
    unpricedQuantitiesKnown?: true;
  };
  products: { skuId: string; noOfficeActivityUnits: number | null }[];
  noOfficeActivityAccountCount: number | null;
  downgradeEdges: Microsoft365PricingEdge[];
  /** Reference monthly annual-commitment rates, excluding tax, for non-inventory targets. */
  targetUnitPrices: Record<string, Record<string, number | null>>;
  /** Absent in history. All groups are retained before monetary top-25 ranking. */
  groups?: Record<'domain' | 'department' | 'country', Microsoft365PricingGroupFacts[]>;
  groupsUnavailableReason?: 'group_limit_exceeded' | 'contribution_limit_exceeded';
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const keys = (value: Record<string, unknown>, allowed: readonly string[]): boolean => Object.keys(value).every(key => allowed.includes(key));
const unique = (values: string[]): boolean => new Set(values).size === values.length;
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 512;
// Match the established SKU-reference contract, including older synthetic identifiers.
const sku = (value: unknown): value is string => text(value) && value.length > 0 && value === value.toLowerCase();
const edge = (value: unknown, finding = false): boolean =>
  record(value) &&
  keys(
    value,
    finding ? ['kind', 'skuId', 'targetSkuId', 'targetSkuPartNumber', 'count'] : ['skuId', 'targetSkuId', 'targetSkuPartNumber', 'count']
  ) &&
  sku(value.skuId) &&
  (value.targetSkuId === undefined || value.targetSkuId === null || sku(value.targetSkuId)) &&
  (value.targetSkuPartNumber === null || text(value.targetSkuPartNumber)) &&
  count(value.count);
const units = (value: unknown): boolean =>
  record(value) && Object.entries(value).length <= 2000 && Object.entries(value).every(([id, quantity]) => sku(id) && count(quantity));
const nullableMoney = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);

/** Bounds sparse contributions independently from the bounded people artifact. */
export function isMicrosoft365PricingFacts(value: unknown): value is Microsoft365PricingFacts {
  if (
    !record(value) ||
    !keys(value, [
      'schemaVersion',
      'evidence',
      'products',
      'noOfficeActivityAccountCount',
      'downgradeEdges',
      'targetUnitPrices',
      'groups',
      'groupsUnavailableReason',
      'groupRanking',
      'targetProducts',
    ]) ||
    value.schemaVersion !== 'microsoft-365-pricing-facts/v1' ||
    !record(value.evidence) ||
    !keys(value.evidence, [
      'inventoryKnown',
      'usersKnown',
      'signInsKnown',
      'overlapKnown',
      'downgradeKnown',
      'ambiguousPaidAllocation',
      'unpricedQuantitiesKnown',
    ])
  )
    return false;
  for (const key of ['inventoryKnown', 'usersKnown', 'signInsKnown', 'overlapKnown', 'downgradeKnown', 'ambiguousPaidAllocation']) {
    if (typeof value.evidence[key] !== 'boolean') return false;
  }
  if (value.groupRanking !== undefined && value.groupRanking !== 'reference_price') return false;
  if (value.evidence.unpricedQuantitiesKnown !== undefined && value.evidence.unpricedQuantitiesKnown !== true) return false;
  if (
    value.targetProducts !== undefined &&
    (!Array.isArray(value.targetProducts) ||
      value.targetProducts.length > 2000 ||
      !value.targetProducts.every(
        row =>
          record(row) &&
          keys(row, ['skuId', 'skuPartNumber', 'productName', 'referencePrices']) &&
          sku(row.skuId) &&
          text(row.skuPartNumber) &&
          !!row.skuPartNumber &&
          text(row.productName) &&
          record(row.referencePrices) &&
          Object.keys(row.referencePrices).length <= 32 &&
          Object.entries(row.referencePrices).every(([currency, rate]) => /^[A-Z]{3}$/.test(currency) && nullableMoney(rate))
      ) ||
      !unique(value.targetProducts.map(row => row.skuId)))
  )
    return false;
  if (
    !Array.isArray(value.products) ||
    value.products.length > 2000 ||
    !value.products.every(
      row =>
        record(row) &&
        keys(row, ['skuId', 'noOfficeActivityUnits']) &&
        sku(row.skuId) &&
        (row.noOfficeActivityUnits === null || count(row.noOfficeActivityUnits))
    ) ||
    !unique(value.products.map(row => row.skuId))
  )
    return false;
  const productIds = new Set<string>(value.products.map(row => row.skuId));
  if (value.noOfficeActivityAccountCount !== null && !count(value.noOfficeActivityAccountCount)) return false;
  if (
    !Array.isArray(value.downgradeEdges) ||
    value.downgradeEdges.length > MICROSOFT_365_PRICING_FACT_CONTRIBUTION_LIMIT ||
    !value.downgradeEdges.every(row => edge(row) && productIds.has(row.skuId)) ||
    !unique(value.downgradeEdges.map(row => JSON.stringify([row.skuId, row.targetSkuPartNumber])))
  )
    return false;
  const targetParts = new Set<string>(value.downgradeEdges.flatMap(row => (row.targetSkuPartNumber === null ? [] : [row.targetSkuPartNumber])));
  for (const row of (value.targetProducts ?? []) as NonNullable<Microsoft365PricingFacts['targetProducts']>) targetParts.add(row.skuPartNumber);
  if (
    !record(value.targetUnitPrices) ||
    Object.keys(value.targetUnitPrices).length > 32 ||
    !Object.entries(value.targetUnitPrices).every(
      ([currency, prices]) =>
        /^[A-Z]{3}$/.test(currency) &&
        record(prices) &&
        Object.entries(prices).length <= 2000 &&
        Object.entries(prices).every(([part, price]) => text(part) && targetParts.has(part) && nullableMoney(price))
    )
  )
    return false;
  if (
    value.groupsUnavailableReason !== undefined &&
    (typeof value.groupsUnavailableReason !== 'string' ||
      !['group_limit_exceeded', 'contribution_limit_exceeded'].includes(value.groupsUnavailableReason))
  )
    return false;
  if (value.groups === undefined) return true;
  if (value.groupsUnavailableReason !== undefined || !record(value.groups) || !keys(value.groups, ['domain', 'department', 'country'])) return false;
  let groupCount = 0;
  let contributions = 0;
  for (const dimension of ['domain', 'department', 'country']) {
    const groups = value.groups[dimension];
    if (!Array.isArray(groups)) return false;
    const seen = new Set<string>();
    groupCount += groups.length;
    if (groupCount > MICROSOFT_365_PRICING_FACT_GROUP_LIMIT) return false;
    for (const group of groups) {
      if (
        !record(group) ||
        !keys(group, [
          'key',
          'label',
          'licensedAccountCount',
          'paidSeatCount',
          'reviewAccountCount',
          'unitsBySku',
          'fullReviewUnitsBySku',
          'findingReviewEdges',
        ]) ||
        !text(group.key) ||
        !text(group.label) ||
        !count(group.licensedAccountCount) ||
        !count(group.paidSeatCount) ||
        !count(group.reviewAccountCount) ||
        !units(group.unitsBySku) ||
        !units(group.fullReviewUnitsBySku) ||
        !Array.isArray(group.findingReviewEdges) ||
        !group.findingReviewEdges.every(
          row => record(row) && typeof row.kind === 'string' && ['overlap', 'downgrade'].includes(row.kind) && edge(row, true)
        ) ||
        !unique(group.findingReviewEdges.map(row => JSON.stringify([row.kind, row.skuId, row.targetSkuPartNumber])))
      )
        return false;
      if (seen.has(group.key)) return false;
      seen.add(group.key);
      const allUnits = group.unitsBySku as Record<string, number>;
      const reviewUnits = group.fullReviewUnitsBySku as Record<string, number>;
      if (
        !Object.keys(allUnits).every(id => productIds.has(id)) ||
        !Object.entries(reviewUnits).every(([id, quantity]) => Object.prototype.hasOwnProperty.call(allUnits, id) && quantity <= allUnits[id]) ||
        !group.findingReviewEdges.every(row => productIds.has(row.skuId)) ||
        group.reviewAccountCount > group.licensedAccountCount
      )
        return false;
      contributions +=
        Object.keys(group.unitsBySku as object).length + Object.keys(group.fullReviewUnitsBySku as object).length + group.findingReviewEdges.length;
      if (contributions > MICROSOFT_365_PRICING_FACT_CONTRIBUTION_LIMIT) return false;
    }
  }
  return true;
}
