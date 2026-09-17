import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal';

export interface FinancialSavingsAllocationPercentageV1 {
  denominatorIds: string[];
  denominatorAmount: string;
  denominatorCurrencyCode: string;
  percentage: number;
}

/**
 * Composes one exact percentage from allocation-bound denominator evidence.
 * Repeated denominator identities are counted once; conflicting or missing
 * evidence fails closed so no consumer substitutes display-resource spend.
 */
export const composeFinancialSavingsAllocationPercentageV1 = (
  allocations: readonly {
    savingsMinorUnits: number;
    denominator?: { denominatorId: string; amount: string; currencyCode: string };
  }[],
  minorUnitScale: number
): FinancialSavingsAllocationPercentageV1 | undefined => {
  if (!Number.isSafeInteger(minorUnitScale) || minorUnitScale < 0 || minorUnitScale > 6 || allocations.length === 0) {
    return undefined;
  }
  const denominators = new Map<string, { amount: string; currencyCode: string }>();
  let savingsMinorUnits = 0n;
  for (const allocation of allocations) {
    if (!Number.isSafeInteger(allocation.savingsMinorUnits) || allocation.savingsMinorUnits < 0 || !allocation.denominator) {
      return undefined;
    }
    savingsMinorUnits += BigInt(allocation.savingsMinorUnits);
    const existing = denominators.get(allocation.denominator.denominatorId);
    if (
      existing &&
      (existing.amount !== allocation.denominator.amount || existing.currencyCode !== allocation.denominator.currencyCode)
    ) {
      return undefined;
    }
    denominators.set(allocation.denominator.denominatorId, {
      amount: allocation.denominator.amount,
      currencyCode: allocation.denominator.currencyCode,
    });
  }
  if (savingsMinorUnits > BigInt(Number.MAX_SAFE_INTEGER)) return undefined;
  const currencies = new Set([...denominators.values()].map(denominator => denominator.currencyCode));
  if (currencies.size !== 1) return undefined;
  const denominatorAmount = formatExactDecimalValue(
    sumCanonicalDecimals([...denominators.values()].map(denominator => denominator.amount))
  );
  const denominatorNumber = Number(denominatorAmount);
  const savingsNumber = Number(savingsMinorUnits) / 10 ** minorUnitScale;
  if (!Number.isFinite(denominatorNumber) || denominatorNumber <= 0 || !Number.isFinite(savingsNumber)) return undefined;
  return {
    denominatorIds: [...denominators.keys()].sort(),
    denominatorAmount,
    denominatorCurrencyCode: [...currencies][0],
    percentage: (savingsNumber / denominatorNumber) * 100,
  };
};
