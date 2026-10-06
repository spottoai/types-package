/** Evidence for an account's complete list-price monthly run rate, independent of billed spend. */
export type RetailCostAvailability =
  | {
      status: 'available';
      currency: string;
      provenance: 'provider-list-price';
      period: { kind: 'monthly-run-rate'; hours: 730 };
      sourceRefs: string[];
    }
  | {
      status: 'unavailable';
      reasonCode: 'not-produced' | 'currency-unresolved' | 'coverage-unproven';
    };

export function isRetailCostAvailability(value: unknown): value is RetailCostAvailability {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const evidence = value as Record<string, unknown>;
  if (evidence.status === 'unavailable') {
    return ['not-produced', 'currency-unresolved', 'coverage-unproven'].includes(String(evidence.reasonCode));
  }
  if (evidence.status !== 'available') return false;
  const period = evidence.period;
  return typeof evidence.currency === 'string' && /^[A-Z]{3}$/u.test(evidence.currency) &&
    evidence.provenance === 'provider-list-price' &&
    !!period && typeof period === 'object' && !Array.isArray(period) &&
    (period as Record<string, unknown>).kind === 'monthly-run-rate' &&
    (period as Record<string, unknown>).hours === 730 &&
    Array.isArray(evidence.sourceRefs) && evidence.sourceRefs.length > 0 &&
    evidence.sourceRefs.every(ref => typeof ref === 'string' && ref.trim().length > 0);
}
