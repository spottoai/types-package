import assert from 'node:assert/strict';

import {
  applyNativeDiscountMinorUnits,
  isAzureNativeDiscountEligible,
  isAzureNativeSpendFullyDiscountEligible,
  applyNativeDiscountToNativeAmount,
  isValidNativeDiscountPercent,
  projectDecompositionTreeSourceBasisMinorUnits,
  projectFinancialChargeSpendBasisMinorUnits,
  projectNativeDiscountSourceMinorUnits,
  toNativeDiscountBasisPoints,
  toNativeDiscountMinorUnits,
  isNativeDiscountProjectionV1,
  formatNativeDiscountProjectionHeader,
  parseNativeDiscountProjectionHeader,
  NATIVE_DISCOUNT_PROJECTION_HEADER,
  NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS,
} from '../dist/index.js';

// Setting validation and basis points.
for (const valid of [0, 5, 5.25, 12.5, 100]) assert.equal(isValidNativeDiscountPercent(valid), true, `${valid} is valid`);
for (const invalid of [-1, 100.01, 5.255, Number.NaN, Number.POSITIVE_INFINITY, '5', null, undefined]) {
  assert.equal(isValidNativeDiscountPercent(invalid), false, `${String(invalid)} is invalid`);
}
assert.equal(toNativeDiscountBasisPoints(5.25), 525);
assert.equal(toNativeDiscountBasisPoints(0.29), 29);
assert.equal(toNativeDiscountBasisPoints(100), 10_000);
assert.equal(toNativeDiscountBasisPoints(undefined), undefined);

// Rounding: half away from zero, once, signed.
assert.equal(applyNativeDiscountMinorUnits(10_000, 500), 9_500);
assert.equal(applyNativeDiscountMinorUnits(1, 5_000), 1, '0.5 rounds away from zero');
assert.equal(applyNativeDiscountMinorUnits(-1, 5_000), -1, '-0.5 rounds away from zero');
assert.equal(applyNativeDiscountMinorUnits(3, 5_000), 2, '1.5 rounds to 2');
assert.equal(applyNativeDiscountMinorUnits(-1_000, 500), -950, 'credits receive the same factor');
assert.equal(applyNativeDiscountMinorUnits(12_345, 0), 12_345, '0% is identity');
assert.equal(applyNativeDiscountMinorUnits(12_345, 10_000), 0, '100% removes native spend');
assert.equal(applyNativeDiscountMinorUnits(-1, 10_000), 0, 'no negative zero');
assert.equal(applyNativeDiscountMinorUnits(100, 10_001), undefined);
assert.equal(applyNativeDiscountMinorUnits(100.5, 500), undefined);

// SMX definition-of-done vector: NZD 42,072.64 native at 5% -> 39,969.01.
assert.equal(applyNativeDiscountMinorUnits(4_207_264, 500), 3_996_901);

// Marketplace and unknown amounts are unchanged.
assert.equal(isAzureNativeDiscountEligible('azure-native', 'Reservation'), false);
assert.equal(isAzureNativeDiscountEligible('azure-native', ' SavingsPlan '), false);
assert.equal(isAzureNativeDiscountEligible('azure-native', undefined), true);
assert.equal(isAzureNativeDiscountEligible('marketplace', 'OnDemand'), false);
assert.equal(isAzureNativeDiscountEligible('unknown', 'OnDemand'), false);
assert.equal(
  projectNativeDiscountSourceMinorUnits(
    { nativeMinorUnits: 10_000, nativeDiscountEligibleMinorUnits: 6_000, marketplaceMinorUnits: 3_000, unknownMinorUnits: -500 },
    500
  ),
  12_200
);
assert.equal(
  projectNativeDiscountSourceMinorUnits(
    { nativeMinorUnits: 10_000, nativeDiscountEligibleMinorUnits: 0, marketplaceMinorUnits: 0, unknownMinorUnits: 0 },
    500
  ),
  10_000
);
assert.equal(
  projectNativeDiscountSourceMinorUnits(
    { nativeMinorUnits: 7_500, nativeDiscountEligibleMinorUnits: 10_000, marketplaceMinorUnits: 0, unknownMinorUnits: 0 },
    500
  ),
  7_000,
  'excluded refunds make eligible larger than native net'
);
assert.equal(
  projectNativeDiscountSourceMinorUnits(
    { nativeMinorUnits: -4_000, nativeDiscountEligibleMinorUnits: -2_000, marketplaceMinorUnits: -500, unknownMinorUnits: 0 },
    500
  ),
  -4_400,
  'signed eligible refunds receive the factor'
);
assert.equal(
  projectNativeDiscountSourceMinorUnits(
    { nativeMinorUnits: 10_000, nativeDiscountEligibleMinorUnits: null, marketplaceMinorUnits: 0, unknownMinorUnits: 0 },
    500
  ),
  undefined,
  'malformed supplied subset must not use legacy fallback'
);
assert.equal(projectNativeDiscountSourceMinorUnits({ nativeMinorUnits: 10_000, marketplaceMinorUnits: 3_000, unknownMinorUnits: -500 }, 500), 12_000);

// Cost Tree basis: partial sources are unavailable.
const completeBasis = {
  allChargeMinorUnits: 13_000,
  azureNativeMinorUnits: 10_000,
  marketplaceMinorUnits: 3_000,
  unknownMinorUnits: 0,
  unknownAbsoluteMinorUnits: 0,
  unknownNonZeroRowCount: 0,
  status: 'complete',
};
assert.equal(projectDecompositionTreeSourceBasisMinorUnits(completeBasis, 500), 12_500);
assert.equal(
  projectDecompositionTreeSourceBasisMinorUnits(
    { ...completeBasis, azureNativeDiscountEligibleMinorUnits: 6_000, azureNativeDiscountEligibility: 'mixed' },
    500
  ),
  12_700
);
assert.equal(
  projectDecompositionTreeSourceBasisMinorUnits({ ...completeBasis, azureNativeDiscountEligibility: 'none-eligible' }, 500),
  undefined,
  'membership without its amount cannot fall back'
);
assert.equal(
  projectDecompositionTreeSourceBasisMinorUnits(
    { ...completeBasis, azureNativeDiscountEligibleMinorUnits: 6_000, azureNativeDiscountEligibility: 'all-eligible' },
    500
  ),
  undefined,
  'all-eligible must reconcile to native'
);
assert.equal(
  projectDecompositionTreeSourceBasisMinorUnits(
    { ...completeBasis, unknownMinorUnits: 0, unknownAbsoluteMinorUnits: 400, unknownNonZeroRowCount: 2, status: 'partial' },
    500
  ),
  undefined
);
assert.equal(projectDecompositionTreeSourceBasisMinorUnits(undefined, 500), undefined);

// Rolling spend breakdown.
const available = totalMinorUnits => ({ status: 'available', totalMinorUnits, billingBackedMinorUnits: totalMinorUnits, estimatedMinorUnits: 0 });
const breakdown = {
  status: 'complete',
  allCharge: { billed: available(13_000), amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' } },
  azureNative: { billed: available(10_000), amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' } },
  marketplace: { billed: available(3_000), amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' } },
  unknown: { billed: available(0), amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' } },
};
assert.equal(projectFinancialChargeSpendBasisMinorUnits(breakdown, 'billed', 500), 12_500);
assert.equal(projectFinancialChargeSpendBasisMinorUnits(breakdown, 'amortized', 500), undefined, 'unavailable basis stays unavailable');
assert.equal(projectFinancialChargeSpendBasisMinorUnits({ ...breakdown, status: 'partial' }, 'billed', 500), undefined);

const eligibleBreakdown = {
  ...breakdown,
  contractVersion: 'financial-charge-spend/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  generationId: 'fictional-generation',
  subject: { kind: 'provider-scope', providerScopeId: 'fictional-subscription' },
  period: { startDate: '2026-09-01', endDateExclusive: '2026-10-01' },
  currencyCode: 'NZD',
  minorUnitScale: 2,
  unknownMaterial: { nonZeroRowCount: 0, billedAbsoluteMinorUnits: 0, amortizedAbsoluteMinorUnits: 0 },
  azureNativeDiscountEligible: { billed: available(6_000), amortized: { status: 'unavailable', reasonCode: 'billing-unavailable' } },
  azureNativeDiscountEligibility: 'mixed',
};
assert.equal(projectFinancialChargeSpendBasisMinorUnits(eligibleBreakdown, 'billed', 500), 12_700);
assert.equal(isAzureNativeSpendFullyDiscountEligible(eligibleBreakdown), false);
const cancellingCommitmentRows = { ...eligibleBreakdown, azureNativeDiscountEligible: eligibleBreakdown.azureNative };
assert.equal(isAzureNativeSpendFullyDiscountEligible(cancellingCommitmentRows), false, 'equal signed totals do not prove gross membership');
assert.equal(isAzureNativeSpendFullyDiscountEligible({ ...cancellingCommitmentRows, azureNativeDiscountEligibility: 'all-eligible' }), true);
assert.equal(isAzureNativeSpendFullyDiscountEligible(breakdown), true, 'legacy rate borrowing is unchanged');
assert.equal(
  projectFinancialChargeSpendBasisMinorUnits({ ...eligibleBreakdown, azureNativeDiscountEligible: undefined }, 'billed', 500),
  undefined,
  'membership-only supplied evidence is malformed'
);
assert.equal(
  projectFinancialChargeSpendBasisMinorUnits(
    {
      ...eligibleBreakdown,
      azureNativeDiscountEligible: {
        ...eligibleBreakdown.azureNativeDiscountEligible,
        billed: { status: 'unavailable', reasonCode: 'not-produced' },
      },
    },
    'billed',
    500
  ),
  12_500,
  'unavailable eligibility preserves legacy total fallback'
);

// Decimal amounts (native-only figures such as savings).
assert.equal(toNativeDiscountMinorUnits(1.005), 101, 'exact decimal text avoids binary rounding');
assert.equal(toNativeDiscountMinorUnits(-10.125), -1013);
assert.equal(toNativeDiscountMinorUnits(1e-7), 0);
assert.equal(toNativeDiscountMinorUnits(42072.64), 4_207_264);
assert.equal(applyNativeDiscountToNativeAmount(100, 500), 95);
assert.equal(applyNativeDiscountToNativeAmount(19.99, 525), 18.94);
assert.equal(applyNativeDiscountToNativeAmount(Number.NaN, 500), undefined);

// Response projection metadata.
const v = 'native-discount-projection/v1';
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'none' }), true);
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'applied', basisPoints: 525 }), true);
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'applied' }), false, 'applied requires basis points');
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'none', basisPoints: 500 }), false, 'none has no rate');
assert.equal(
  isNativeDiscountProjectionV1({
    contractVersion: v,
    status: 'partial',
    basisPoints: 500,
    reason: 'unknown-source',
    unavailablePaths: ['/resources/0/spend', '/root/children/1/cost'],
  }),
  true
);
assert.equal(
  isNativeDiscountProjectionV1({ contractVersion: v, status: 'partial', basisPoints: 500, unavailablePaths: ['resources/0'] }),
  false,
  'paths are JSON Pointers'
);
assert.equal(
  isNativeDiscountProjectionV1({ contractVersion: v, status: 'partial', basisPoints: 500, unavailablePaths: ['/a', '/a'] }),
  false,
  'paths are unique'
);
assert.equal(
  isNativeDiscountProjectionV1({
    contractVersion: v,
    status: 'partial',
    basisPoints: 500,
    unavailablePaths: ['/a'],
    unavailablePathsTruncated: true,
  }),
  false,
  'truncation needs a full list'
);
const fullPaths = Array.from({ length: NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS }, (_, index) => `/resources/${index}/spend`);
assert.equal(
  isNativeDiscountProjectionV1({
    contractVersion: v,
    status: 'partial',
    basisPoints: 500,
    unavailablePaths: fullPaths,
    unavailablePathsTruncated: true,
  }),
  true
);
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'unavailable', reason: 'owner-unresolved' }), true);
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'unavailable' }), false, 'unavailable needs a reason');
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'applied', basisPoints: 10_001 }), false);
assert.equal(isNativeDiscountProjectionV1({ contractVersion: v, status: 'applied', basisPoints: 500, extra: true }), false, 'exact fields');

// Header round trip.
assert.equal(NATIVE_DISCOUNT_PROJECTION_HEADER, 'X-Spotto-Native-Discount');
assert.equal(formatNativeDiscountProjectionHeader({ contractVersion: v, status: 'applied', basisPoints: 525 }), 'v1; status=applied; bps=525');
assert.deepEqual(parseNativeDiscountProjectionHeader('v1; status=applied; bps=525'), { contractVersion: v, status: 'applied', basisPoints: 525 });
assert.deepEqual(parseNativeDiscountProjectionHeader('v1; status=partial; bps=500; reason=unknown-source'), {
  contractVersion: v,
  status: 'partial',
  basisPoints: 500,
  reason: 'unknown-source',
});
assert.deepEqual(parseNativeDiscountProjectionHeader('v1; status=none'), { contractVersion: v, status: 'none' });
for (const invalid of [
  undefined,
  null,
  '',
  'v2; status=none',
  'v1; status=applied',
  'v1; status=applied; bps=5.25',
  'v1; status=none; status=none',
  'v1; status=applied; bps=500; extra=1',
]) {
  assert.equal(parseNativeDiscountProjectionHeader(invalid), undefined, `rejects ${String(invalid)}`);
}

console.log('Native discount contract checks passed.');
