/** Billing-backed recorded charges; calendar closure never establishes invoice finality. */
export type RecordedSpendAnalysisAmount = { status: 'available'; amount: number } | { status: 'unavailable'; reason: string };

export interface RecordedSpendAnalysisPeriod {
  window: { startDateInclusive: string; endDateExclusive: string; dayCount: 7 | 30; dateBasis: 'utc' };
  /** Null records unknown/conflicting currency; neither basis can then be available. */
  currency: string | null;
  source: 'billing';
  finality: 'unknown';
  closure: { status: 'closed' | 'unproved'; method: 'accepted-source-usage-bounds' };
  billed: RecordedSpendAnalysisAmount;
  amortized: RecordedSpendAnalysisAmount;
}

/** Independently dated comparison windows. Never subtract these from display-window spend. */
export interface RecordedSpendAnalysis {
  schemaVersion: 1;
  generatedAt: string;
  current30Days: RecordedSpendAnalysisPeriod;
  previous30Days: RecordedSpendAnalysisPeriod;
  current7Days: RecordedSpendAnalysisPeriod;
  previous7Days: RecordedSpendAnalysisPeriod;
}

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const utcDay = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return undefined;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : undefined;
};
const amount = (value: unknown, available: boolean): boolean => {
  if (!record(value)) return false;
  return value.status === 'available'
    ? available && typeof value.amount === 'number' && Number.isFinite(value.amount)
    : value.status === 'unavailable' &&
        typeof value.reason === 'string' &&
        value.reason.trim().length > 0 &&
        value.reason.length <= 256 &&
        value.amount === undefined;
};

/** Validates declared evidence, not the provider/source calculation behind it. */
export function isRecordedSpendAnalysis(value: unknown): value is RecordedSpendAnalysis {
  if (!record(value) || value.schemaVersion !== 1 || typeof value.generatedAt !== 'string') return false;
  const generatedAt = Date.parse(value.generatedAt);
  if (!Number.isFinite(generatedAt)) return false;
  const periods: Array<[unknown, 7 | 30]> = [
    [value.current30Days, 30],
    [value.previous30Days, 30],
    [value.current7Days, 7],
    [value.previous7Days, 7],
  ];
  for (const [period, days] of periods) {
    if (!record(period) || !record(period.window) || !record(period.closure)) return false;
    const start = utcDay(period.window.startDateInclusive),
      end = utcDay(period.window.endDateExclusive);
    if (
      start === undefined ||
      end === undefined ||
      end - start !== days * 86400000 ||
      end > generatedAt ||
      period.window.dayCount !== days ||
      period.window.dateBasis !== 'utc'
    )
      return false;
    if (
      period.source !== 'billing' ||
      period.finality !== 'unknown' ||
      !['closed', 'unproved'].includes(String(period.closure.status)) ||
      period.closure.method !== 'accepted-source-usage-bounds'
    )
      return false;
    const currency = typeof period.currency === 'string' && /^[A-Z]{3}$/u.test(period.currency);
    if (period.currency !== null && !currency) return false;
    const available = currency && period.closure.status === 'closed';
    if (!amount(period.billed, available) || !amount(period.amortized, available)) return false;
  }
  const frame = value as unknown as RecordedSpendAnalysis;
  return (
    frame.previous30Days.window.endDateExclusive === frame.current30Days.window.startDateInclusive &&
    frame.previous7Days.window.endDateExclusive === frame.current7Days.window.startDateInclusive &&
    frame.current7Days.window.endDateExclusive === frame.current30Days.window.endDateExclusive
  );
}
