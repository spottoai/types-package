import { isBillingTaxTreatment, type BillingTaxTreatment } from './billingTaxTreatment.js';

/** A known subtotal, never a complete group total or proof of billing-day completeness. */
export interface KnownResourceGroupSpend {
  taxTreatment: BillingTaxTreatment;
  currency: string;
  totalResourceCount: number;
  billedResourceCount: number;
  amortizedResourceCount: number;
  cost?: number;
  costAmortized?: number;
}

export function isKnownResourceGroupSpend(value: unknown): value is KnownResourceGroupSpend {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = new Set([
    'taxTreatment',
    'currency',
    'totalResourceCount',
    'billedResourceCount',
    'amortizedResourceCount',
    'cost',
    'costAmortized',
  ]);
  if (!Object.keys(record).every(key => allowed.has(key))) return false;
  if (!isBillingTaxTreatment(record.taxTreatment) || typeof record.currency !== 'string' || !/^[A-Z]{3}$/u.test(record.currency)) return false;
  const total = record.totalResourceCount;
  const billed = record.billedResourceCount;
  const amortized = record.amortizedResourceCount;
  if (!isCount(total) || total === 0 || !isCount(billed) || !isCount(amortized)) return false;
  if (billed > total || amortized > total || billed + amortized === 0) return false;
  return validAmount(record.cost, billed) && validAmount(record.costAmortized, amortized);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function validAmount(value: unknown, count: number): boolean {
  return count === 0 ? value === undefined : typeof value === 'number' && Number.isFinite(value);
}
