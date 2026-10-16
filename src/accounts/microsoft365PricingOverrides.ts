/** Customer-supplied monthly rates; these are estimates, never evidence of invoiced charges or grant eligibility. */
export interface Microsoft365PricingOverride {
  skuId: string;
  currency: string;
  unitPriceMonthly: number;
  /** Inclusive calendar-month boundary; null applies to every earlier month. Legacy day dates remain readable. */
  effectiveFrom: string | null;
  /** Exclusive calendar-month boundary; null means no configured end. */
  effectiveTo: string | null;
  source: string;
}

export interface Microsoft365PricingOverridesConfiguration {
  schemaVersion: 'microsoft-365-pricing-overrides/v1';
  tenantId: string;
  /** Opaque conditional-write revision; none denotes an absent document. */
  revision: string;
  overrides: Microsoft365PricingOverride[];
  updatedAt: string | null;
  updatedBy?: string | null;
}

export interface Microsoft365PricingConfigurationResponse {
  /** Saved content is unreadable; managers may reset it using configuration.revision (the raw storage ETag). */
  unavailableReason?: 'invalid_configuration';
  configuration: Microsoft365PricingOverridesConfiguration;
  products: Array<{
    skuId: string;
    skuPartNumber: string;
    productName: string;
    category: 'paid' | 'free' | 'capacity' | 'unpriced';
    held?: boolean;
    purchasedUnits?: number | null;
    /** Only these supported markets allow a new or changed agreed rate for this product. */
    priceableCurrencies?: string[];
    referencePrices: Record<string, number | null>;
  }>;
  currencies: string[];
}

export interface Microsoft365PricingValidationError {
  /** One-based source row; CSV data starts at 2, manual entries at 1. */
  row: number;
  column?: string;
  message: string;
}

export interface Microsoft365PricingPreviewResponse {
  /** Current quantities valued by the portable projector; an estimate correction, never a claimed saving. */
  impact?: {
    currency: string;
    referenceMonthlyCost: number | null;
    agreedMonthlyCost: number | null;
    products: { skuId: string; referenceMonthlyCost: number | null; agreedMonthlyCost: number | null }[];
  };
  revision: string;
  overrides: Microsoft365PricingOverride[];
  rows: Array<Microsoft365PricingOverride & { row: number }>;
  errors: Microsoft365PricingValidationError[];
  canSave: boolean;
}

export interface Microsoft365PricingProjection {
  status: 'applied' | 'partial' | 'unavailable';
  revision: string;
  /** UTC date on which the effective rates were selected. */
  asOf: string;
  reason?: string;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const only = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every(key => keys.includes(key));
const text = (value: unknown, max = 256): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export const isMicrosoft365PricingDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
};
export const isMicrosoft365PricingRevision = (value: unknown): value is string => text(value);

export function isMicrosoft365PricingOverride(value: unknown): value is Microsoft365PricingOverride {
  return (
    record(value) &&
    only(value, ['skuId', 'currency', 'unitPriceMonthly', 'effectiveFrom', 'effectiveTo', 'source']) &&
    text(value.skuId, 128) &&
    typeof value.currency === 'string' &&
    /^[A-Z]{3}$/.test(value.currency) &&
    typeof value.unitPriceMonthly === 'number' &&
    Number.isFinite(value.unitPriceMonthly) &&
    value.unitPriceMonthly >= 0 &&
    value.unitPriceMonthly <= 1_000_000 &&
    Math.abs(value.unitPriceMonthly * 10000 - Math.round(value.unitPriceMonthly * 10000)) < 0.000001 &&
    (value.effectiveFrom === null || isMicrosoft365PricingDate(value.effectiveFrom)) &&
    (value.effectiveTo === null ||
      (isMicrosoft365PricingDate(value.effectiveTo) && (value.effectiveFrom === null || value.effectiveTo > value.effectiveFrom))) &&
    typeof value.source === 'string' &&
    value.source.length <= 256
  );
}

/** Shape and interval validation only. Company authorization and inventory matching remain API policy. */
export function isMicrosoft365PricingOverridesConfiguration(value: unknown): value is Microsoft365PricingOverridesConfiguration {
  if (
    !record(value) ||
    !only(value, ['schemaVersion', 'tenantId', 'revision', 'overrides', 'updatedAt', 'updatedBy']) ||
    value.schemaVersion !== 'microsoft-365-pricing-overrides/v1' ||
    !text(value.tenantId, 128) ||
    !isMicrosoft365PricingRevision(value.revision) ||
    !Array.isArray(value.overrides) ||
    value.overrides.length > 1000 ||
    !value.overrides.every(isMicrosoft365PricingOverride) ||
    !(value.updatedAt === null || (text(value.updatedAt) && Number.isFinite(Date.parse(value.updatedAt)))) ||
    !(value.updatedBy === undefined || value.updatedBy === null || text(value.updatedBy, 512))
  )
    return false;
  const intervals = new Map<string, Microsoft365PricingOverride[]>();
  for (const entry of value.overrides) {
    const key = `${entry.skuId.toLowerCase()}|${entry.currency}`;
    const group = intervals.get(key) ?? [];
    group.push(entry);
    intervals.set(key, group);
  }
  for (const entries of intervals.values()) {
    const ordered = [...entries].sort((a, b) => (a.effectiveFrom ?? '').localeCompare(b.effectiveFrom ?? ''));
    for (let index = 1; index < ordered.length; index++) {
      const previous = ordered[index - 1];
      if (previous.effectiveTo === null || ordered[index].effectiveFrom === null || previous.effectiveTo > ordered[index].effectiveFrom!)
        return false;
    }
  }
  return true;
}

export function isMicrosoft365PricingProjection(value: unknown): value is Microsoft365PricingProjection {
  return (
    record(value) &&
    only(value, ['status', 'revision', 'asOf', 'reason']) &&
    typeof value.status === 'string' &&
    ['applied', 'partial', 'unavailable'].includes(value.status) &&
    isMicrosoft365PricingRevision(value.revision) &&
    isMicrosoft365PricingDate(value.asOf) &&
    (value.reason === undefined || text(value.reason))
  );
}
