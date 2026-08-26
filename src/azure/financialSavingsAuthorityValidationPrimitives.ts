export type FinancialSavingsJsonRecord = Record<string, unknown>;

const SHA256_ID = /^sha256:[0-9a-f]{64}$/;

export const isFinancialSavingsRecord = (value: unknown): value is FinancialSavingsJsonRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const hasExactFinancialSavingsFields = (
  value: FinancialSavingsJsonRecord,
  required: readonly string[],
  optional: readonly string[] = []
): boolean => {
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};

export const isFinancialSavingsIdentity = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 2048 && value.trim() === value;

export const isFinancialSavingsHash = (value: unknown): value is string => typeof value === 'string' && SHA256_ID.test(value);

export const isFinancialSavingsMinorUnits = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;

export const isFinancialSavingsIsoInstant = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

export const haveSameFinancialSavingsSet = (left: readonly string[], right: readonly string[]): boolean => {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
};

export const sumFinancialSavingsMinorUnits = (values: readonly number[]): number | undefined => {
  const total = values.reduce((sum, value) => sum + BigInt(value), 0n);
  return total <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(total) : undefined;
};

export const canonicalizeFinancialSavingsJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalizeFinancialSavingsJsonValue);
  if (!isFinancialSavingsRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map(key => [key, canonicalizeFinancialSavingsJsonValue(value[key])])
  );
};
