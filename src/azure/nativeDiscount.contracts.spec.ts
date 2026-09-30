import {
  applyNativeDiscountMinorUnits,
  applyNativeDiscountToNativeAmount,
  isValidNativeDiscountPercent,
  projectDecompositionTreeSourceBasisMinorUnits,
  projectNativeDiscountSourceMinorUnits,
  toNativeDiscountBasisPoints,
  toNativeDiscountMinorUnits,
  isNativeDiscountProjectionV1,
  formatNativeDiscountProjectionHeader,
  parseNativeDiscountProjectionHeader,
  type NativeDiscountProjectionV1,
} from './nativeDiscount.js';
import type { DecompositionTreeFinancialChargeSourceBasisCostsV1 } from './financialChargePolicy.js';

const basisPoints: number | undefined = toNativeDiscountBasisPoints(5.25);
const projected: number | undefined = projectNativeDiscountSourceMinorUnits(
  { nativeMinorUnits: 10_000, marketplaceMinorUnits: 3_000, unknownMinorUnits: 0 },
  500
);
const partialBasis: DecompositionTreeFinancialChargeSourceBasisCostsV1 = {
  allChargeMinorUnits: 100,
  azureNativeMinorUnits: 80,
  marketplaceMinorUnits: 0,
  unknownMinorUnits: 20,
  unknownAbsoluteMinorUnits: 20,
  unknownNonZeroRowCount: 1,
  status: 'partial',
};
const unavailable: number | undefined = projectDecompositionTreeSourceBasisMinorUnits(partialBasis, 500);

// @ts-expect-error The rate must be numeric basis points, not a formatted percentage.
applyNativeDiscountMinorUnits(100, '5%');

void basisPoints;
void projected;
void unavailable;
void isValidNativeDiscountPercent;
void applyNativeDiscountToNativeAmount;
void toNativeDiscountMinorUnits;

const appliedProjection: NativeDiscountProjectionV1 = {
  contractVersion: 'native-discount-projection/v1',
  status: 'applied',
  basisPoints: 525,
};
const partialProjection: NativeDiscountProjectionV1 = {
  contractVersion: 'native-discount-projection/v1',
  status: 'partial',
  basisPoints: 500,
  reason: 'unknown-source',
  unavailablePaths: ['/resources/3/spend'],
};
const invalidProjection: NativeDiscountProjectionV1 = {
  contractVersion: 'native-discount-projection/v1',
  // @ts-expect-error Status is a closed union.
  status: 'not-applicable',
};

void appliedProjection;
void partialProjection;
void invalidProjection;
void isNativeDiscountProjectionV1;
void formatNativeDiscountProjectionHeader;
void parseNativeDiscountProjectionHeader;
