/** Tax selection, independent of billed/amortized basis, currency and savings authority. */
export type BillingTaxTreatment = 'excluding-tax' | 'including-recorded-tax';

/** Missing or unknown treatment never proves that a monetary value excludes tax. */
export function isBillingTaxTreatment(value: unknown): value is BillingTaxTreatment {
  return value === 'excluding-tax' || value === 'including-recorded-tax';
}
