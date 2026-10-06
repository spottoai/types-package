import {
  isAzureFinancialChargeSpendBreakdownV1,
  isDecompositionTreeNodeFinancialChargeSourceCostsV1,
  type AzureFinancialChargeSourceV1,
  type AzureFinancialChargeSpendBreakdownV1,
  type DecompositionTreeFinancialChargeSourceBasisCostsV1,
} from './financialChargePolicy.js';

/**
 * Configured native discount (subscription `nativeDiscountPercent`), applied on read.
 *
 * "Native" means the cloud provider's own charges (for Azure, the `azure-native`
 * financial charge source). Marketplace and unknown-source amounts are never
 * discounted. These functions are the single implementation of the arithmetic, so
 * the API read projection and any evaluation path (cost alerts, budgets,
 * notifications) produce identical numbers. They never mutate stored artifacts.
 */

export const NATIVE_DISCOUNT_MAX_PERCENT = 100;
export const NATIVE_DISCOUNT_BASIS_POINTS_SCALE = 10_000;

const MAX_MINOR_UNIT_SCALE = 6;

/** True for a finite percentage from 0 to 100 inclusive with at most two decimals. */
export const isValidNativeDiscountPercent = (value: unknown): value is number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false;
  if (value < 0 || value > NATIVE_DISCOUNT_MAX_PERCENT) return false;
  const hundredths = value * 100;
  return Math.abs(hundredths - Math.round(hundredths)) < 1e-9;
};

/**
 * Converts a configured percentage to integer basis points (5.25 -> 525).
 * Returns undefined when the value is absent or invalid; callers then apply no discount.
 */
export const toNativeDiscountBasisPoints = (percent: unknown): number | undefined =>
  isValidNativeDiscountPercent(percent) ? Math.round(percent * 100) : undefined;

const isValidBasisPoints = (basisPoints: number): boolean =>
  Number.isSafeInteger(basisPoints) && basisPoints >= 0 && basisPoints <= NATIVE_DISCOUNT_BASIS_POINTS_SCALE;

/**
 * Applies the discount to a signed native amount in integer minor units, rounding half away
 * from zero once. Credits and refunds receive the same factor. Returns undefined for invalid input.
 */
export const applyNativeDiscountMinorUnits = (nativeMinorUnits: number, basisPoints: number): number | undefined => {
  if (!Number.isSafeInteger(nativeMinorUnits) || !isValidBasisPoints(basisPoints)) return undefined;
  const scale = BigInt(NATIVE_DISCOUNT_BASIS_POINTS_SCALE);
  const product = BigInt(nativeMinorUnits) * (scale - BigInt(basisPoints));
  const negative = product < 0n;
  const magnitude = negative ? -product : product;
  const rounded = (magnitude + scale / 2n) / scale;
  const result = Number(negative ? -rounded : rounded);
  return Object.is(result, -0) ? 0 : result;
};

export interface NativeDiscountSourceMinorUnits {
  nativeMinorUnits: number;
  /** Signed eligible subset; omission preserves the legacy full-native discount. Zero is produced evidence. */
  nativeDiscountEligibleMinorUnits?: number;
  marketplaceMinorUnits: number;
  unknownMinorUnits: number;
}

/** Provider-native rows without pricing-model evidence retain legacy eligibility. Source proof is supplied by the caller. */
export const isAzureNativeDiscountEligible = (source: AzureFinancialChargeSourceV1, pricingModel: unknown): boolean => {
  if (source !== 'azure-native') return false;
  const model = typeof pricingModel === 'string' ? pricingModel.trim().toLowerCase() : '';
  return model !== 'reservation' && model !== 'savingsplan';
};

/** Uniform-rate borrowing needs gross membership proof; legacy records retain their original rule. */
export const isAzureNativeSpendFullyDiscountEligible = (breakdown: AzureFinancialChargeSpendBreakdownV1 | undefined): boolean => {
  if (!breakdown || (breakdown.azureNativeDiscountEligible === undefined && breakdown.azureNativeDiscountEligibility === undefined)) return true;
  if (!isAzureFinancialChargeSpendBreakdownV1(breakdown) || breakdown.azureNativeDiscountEligibility !== 'all-eligible') return false;
  return (['billed', 'amortized'] as const).every(basis => {
    const native = breakdown.azureNative[basis];
    const eligible = breakdown.azureNativeDiscountEligible?.[basis];
    return eligible?.status !== 'available' || (native.status === 'available' && eligible.totalMinorUnits === native.totalMinorUnits);
  });
};

/** Display amount: unchanged excluded native, Marketplace and unknown amounts plus discounted eligible native. */
export const projectNativeDiscountSourceMinorUnits = (source: NativeDiscountSourceMinorUnits, basisPoints: number): number | undefined => {
  const eligible = source.nativeDiscountEligibleMinorUnits === undefined ? source.nativeMinorUnits : source.nativeDiscountEligibleMinorUnits;
  const adjustedEligible = applyNativeDiscountMinorUnits(eligible, basisPoints);
  if (
    adjustedEligible === undefined ||
    !Number.isSafeInteger(source.nativeMinorUnits) ||
    !Number.isSafeInteger(source.marketplaceMinorUnits) ||
    !Number.isSafeInteger(source.unknownMinorUnits)
  ) {
    return undefined;
  }
  // Eligible can be negative or exceed signed native net when excluded charges include refunds.
  const total = Number(
    BigInt(source.nativeMinorUnits) -
      BigInt(eligible) +
      BigInt(adjustedEligible) +
      BigInt(source.marketplaceMinorUnits) +
      BigInt(source.unknownMinorUnits)
  );
  return Number.isSafeInteger(total) ? total : undefined;
};

/**
 * Projects one Cost Tree source basis (tree total or node). Returns undefined when material
 * unknown-source charges exist (`status: partial`): an exact discounted value is then unavailable.
 */
export const projectDecompositionTreeSourceBasisMinorUnits = (
  basis: DecompositionTreeFinancialChargeSourceBasisCostsV1 | undefined,
  basisPoints: number
): number | undefined => {
  if (!basis || basis.status !== 'complete') return undefined;
  if (
    (basis.azureNativeDiscountEligibleMinorUnits !== undefined || basis.azureNativeDiscountEligibility !== undefined) &&
    !isDecompositionTreeNodeFinancialChargeSourceCostsV1({ current: { billed: basis } })
  )
    return undefined;
  return projectNativeDiscountSourceMinorUnits(
    {
      nativeMinorUnits: basis.azureNativeMinorUnits,
      nativeDiscountEligibleMinorUnits: basis.azureNativeDiscountEligibleMinorUnits,
      marketplaceMinorUnits: basis.marketplaceMinorUnits,
      unknownMinorUnits: basis.unknownMinorUnits,
    },
    basisPoints
  );
};

/**
 * Projects the billed or amortized total of a rolling spend breakdown (subscription or resource).
 * Returns undefined when the basis is unavailable or material unknown-source charges exist.
 */
export const projectFinancialChargeSpendBasisMinorUnits = (
  breakdown: AzureFinancialChargeSpendBreakdownV1 | undefined,
  basis: 'billed' | 'amortized',
  basisPoints: number
): number | undefined => {
  if (!breakdown || breakdown.status !== 'complete') return undefined;
  if (
    (breakdown.azureNativeDiscountEligible !== undefined || breakdown.azureNativeDiscountEligibility !== undefined) &&
    !isAzureFinancialChargeSpendBreakdownV1(breakdown)
  )
    return undefined;
  const native = breakdown.azureNative[basis];
  const marketplace = breakdown.marketplace[basis];
  const unknown = breakdown.unknown[basis];
  if (native.status !== 'available' || marketplace.status !== 'available' || unknown.status !== 'available') return undefined;
  const eligible = breakdown.azureNativeDiscountEligible?.[basis];
  return projectNativeDiscountSourceMinorUnits(
    {
      nativeMinorUnits: native.totalMinorUnits,
      ...(eligible?.status === 'available' ? { nativeDiscountEligibleMinorUnits: eligible.totalMinorUnits } : {}),
      marketplaceMinorUnits: marketplace.totalMinorUnits,
      unknownMinorUnits: unknown.totalMinorUnits,
    },
    basisPoints
  );
};

/** Converts a decimal amount to integer minor units using its exact decimal text, half away from zero. */
export const toNativeDiscountMinorUnits = (amount: number, minorUnitScale = 2): number | undefined => {
  if (!Number.isFinite(amount) || !Number.isSafeInteger(minorUnitScale) || minorUnitScale < 0 || minorUnitScale > MAX_MINOR_UNIT_SCALE) {
    return undefined;
  }
  const negative = amount < 0;
  const [coefficientText = '0', exponentText] = Math.abs(amount).toString().toLowerCase().split('e');
  const exponent = Number(exponentText ?? '0');
  const [integerPart = '0', fractionPart = ''] = coefficientText.split('.');
  const digits = BigInt(`${integerPart}${fractionPart}` || '0');
  // value = digits * 10^(exponent - fractionPart.length); scaled = value * 10^minorUnitScale
  const shift = exponent - fractionPart.length + minorUnitScale;
  let scaled: bigint;
  if (shift >= 0) {
    scaled = digits * 10n ** BigInt(shift);
  } else {
    const divisor = 10n ** BigInt(-shift);
    scaled = (digits + divisor / 2n) / divisor;
  }
  const result = Number(negative ? -scaled : scaled);
  if (!Number.isSafeInteger(result)) return undefined;
  return Object.is(result, -0) ? 0 : result;
};

/**
 * Applies the discount to a decimal amount known to be entirely native (for example Azure-native
 * eligible recommendation savings or licensing figures). Eligibility is proved by callers; a native
 * financial source alone does not prove Reservation/SavingsPlan amounts eligible.
 */
export const applyNativeDiscountToNativeAmount = (amount: number, basisPoints: number, minorUnitScale = 2): number | undefined => {
  const minorUnits = toNativeDiscountMinorUnits(amount, minorUnitScale);
  if (minorUnits === undefined) return undefined;
  const adjusted = applyNativeDiscountMinorUnits(minorUnits, basisPoints);
  return adjusted === undefined ? undefined : adjusted / 10 ** minorUnitScale;
};

/** Response metadata contract identity for API read projections of the configured native discount. */
export const NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1 = 'native-discount-projection/v1' as const;
/** Response header carrying the projection metadata for streamed and batched reads. */
export const NATIVE_DISCOUNT_PROJECTION_HEADER = 'X-Spotto-Native-Discount';
/** Maximum number of nulled JSON paths listed in one metadata object. */
export const NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS = 200;

/**
 * - `none`: no rate is configured; amounts are the stored amounts.
 * - `applied`: every money value in the response carries the configured rate.
 * - `partial`: the rate was applied, but some values could not be proved native/Marketplace and were set to `null`.
 * - `unavailable`: the rate could not be resolved for this response; amounts are the stored amounts.
 */
export type NativeDiscountProjectionStatusV1 = 'none' | 'applied' | 'partial' | 'unavailable';

export type NativeDiscountProjectionReasonV1 =
  /** Rate lookup found no owning subscription record, several, or a company mismatch. */
  | 'owner-unresolved'
  /** The stored rate failed validation. */
  | 'invalid-setting'
  /** A value had no matching source split (period, generation, currency or basis). */
  | 'source-split-missing'
  /** A value included material unknown-source charges. */
  | 'unknown-source';

/**
 * Root-level `nativeDiscountProjection` object on projected JSON documents, and the value of the
 * `X-Spotto-Native-Discount` header on streamed or batched reads (without `unavailablePaths`).
 */
export interface NativeDiscountProjectionV1 {
  contractVersion: typeof NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1;
  status: NativeDiscountProjectionStatusV1;
  /** Integer basis points applied (525 = 5.25%). Present for `applied` and `partial`. */
  basisPoints?: number;
  /** Required for `unavailable`; optional explanation for `partial`. */
  reason?: NativeDiscountProjectionReasonV1;
  /** RFC 6901 JSON Pointers of values set to `null` (`partial` only, JSON responses only). */
  unavailablePaths?: string[];
  /** True when more than `NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS` values were nulled. */
  unavailablePathsTruncated?: true;
}

const PROJECTION_STATUSES = new Set<string>(['none', 'applied', 'partial', 'unavailable']);
const PROJECTION_REASONS = new Set<string>(['owner-unresolved', 'invalid-setting', 'source-split-missing', 'unknown-source']);
const PROJECTION_FIELDS = new Set<string>(['contractVersion', 'status', 'basisPoints', 'reason', 'unavailablePaths', 'unavailablePathsTruncated']);

const isJsonPointer = (value: unknown): value is string =>
  typeof value === 'string' && (value === '' || (value.startsWith('/') && !/~[^01]/u.test(value) && !value.endsWith('~')));

/** Exact validator for `NativeDiscountProjectionV1`, including status-specific field rules. */
export const isNativeDiscountProjectionV1 = (value: unknown): value is NativeDiscountProjectionV1 => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!Object.keys(record).every(key => PROJECTION_FIELDS.has(key))) return false;
  if (record.contractVersion !== NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1) return false;
  if (typeof record.status !== 'string' || !PROJECTION_STATUSES.has(record.status)) return false;
  if (record.reason !== undefined && (typeof record.reason !== 'string' || !PROJECTION_REASONS.has(record.reason))) return false;

  const hasBasisPoints = record.basisPoints !== undefined;
  if (hasBasisPoints && !(typeof record.basisPoints === 'number' && isValidBasisPoints(record.basisPoints))) return false;

  const paths = record.unavailablePaths;
  if (paths !== undefined) {
    if (!Array.isArray(paths) || paths.length === 0 || paths.length > NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS) return false;
    if (!paths.every(isJsonPointer) || new Set(paths).size !== paths.length) return false;
  }
  if (record.unavailablePathsTruncated !== undefined) {
    if (record.unavailablePathsTruncated !== true) return false;
    if (paths === undefined || paths.length !== NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS) return false;
  }

  switch (record.status) {
    case 'none':
      return !hasBasisPoints && record.reason === undefined && paths === undefined;
    case 'applied':
      return hasBasisPoints && record.reason === undefined && paths === undefined;
    case 'partial':
      return hasBasisPoints && (record.reason === undefined || record.reason === 'source-split-missing' || record.reason === 'unknown-source');
    case 'unavailable':
      return !hasBasisPoints && paths === undefined && (record.reason === 'owner-unresolved' || record.reason === 'invalid-setting');
    default:
      return false;
  }
};

/**
 * Serializes projection metadata for the `X-Spotto-Native-Discount` header, for example
 * `v1; status=applied; bps=525`. JSON paths are never sent in the header.
 */
export const formatNativeDiscountProjectionHeader = (projection: NativeDiscountProjectionV1): string => {
  const parts = ['v1', `status=${projection.status}`];
  if (projection.basisPoints !== undefined) parts.push(`bps=${projection.basisPoints}`);
  if (projection.reason !== undefined) parts.push(`reason=${projection.reason}`);
  return parts.join('; ');
};

/** Parses the `X-Spotto-Native-Discount` header; returns undefined for an absent or invalid value. */
export const parseNativeDiscountProjectionHeader = (header: string | null | undefined): NativeDiscountProjectionV1 | undefined => {
  if (typeof header !== 'string') return undefined;
  const [version, ...pairs] = header.split(';').map(part => part.trim());
  if (version !== 'v1') return undefined;
  const fields = new Map<string, string>();
  for (const pair of pairs) {
    const match = /^([a-z]+)=([a-z0-9-]+)$/u.exec(pair);
    if (!match || fields.has(match[1])) return undefined;
    fields.set(match[1], match[2]);
  }
  if (![...fields.keys()].every(key => key === 'status' || key === 'bps' || key === 'reason')) return undefined;
  const bps = fields.get('bps');
  if (bps !== undefined && !/^\d{1,5}$/u.test(bps)) return undefined;
  const candidate = {
    contractVersion: NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1,
    status: fields.get('status'),
    ...(bps !== undefined ? { basisPoints: Number(bps) } : {}),
    ...(fields.has('reason') ? { reason: fields.get('reason') } : {}),
  };
  return isNativeDiscountProjectionV1(candidate) ? candidate : undefined;
};
