/** Dependency-free structural guard primitives shared by every validation module. */
import type { ReportBoundedRows } from './boundedRows';

export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
export const isOptionalString = (value: unknown): boolean => value === undefined || isString(value);
export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export const isOptionalFiniteNumber = (value: unknown): boolean => value === undefined || isFiniteNumber(value);
export const isOptionalBoolean = (value: unknown): boolean => value === undefined || typeof value === 'boolean';
export const isCount = (value: unknown): value is number => isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
export const isDateTime = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value));
export const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
export const isCountRecord = (value: unknown): value is Record<string, number> => isRecord(value) && Object.values(value).every(isCount);
export const countTotal = (value: Record<string, number>): number => Object.values(value).reduce((total, count) => total + count, 0);
export const hasOptionalStrings = (value: JsonRecord, keys: readonly string[]): boolean => keys.every(key => isOptionalString(value[key]));
export const hasOptionalNumbers = (value: JsonRecord, keys: readonly string[]): boolean => keys.every(key => isOptionalFiniteNumber(value[key]));

export const isBoundedRows = <T>(value: unknown, limit: number, isRow: (row: unknown) => row is T): value is ReportBoundedRows<T> => {
  if (!isRecord(value) || !isCount(value.totalCount) || !isCount(value.omittedCount) || !Array.isArray(value.rows)) return false;
  return value.rows.length <= limit && value.rows.every(isRow) && value.totalCount === value.rows.length + value.omittedCount;
};

/*
 * Throwing assertion primitives for exact-shape boundary validators. Each
 * failure names the offending field path so rejections are diagnosable.
 */
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function asRecord(value: unknown, field: string): JsonRecord {
  if (!isRecord(value)) throw new Error(`${field} must be a JSON object.`);
  return value;
}

export function asArray(value: unknown, field: string, nonEmpty = false): unknown[] {
  if (!Array.isArray(value) || (nonEmpty && value.length === 0)) throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
  return value;
}

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) throw new Error(`${field} must be a non-empty trimmed string.`);
  return value;
}

export function requiredEnum<const Value extends string>(value: unknown, values: readonly Value[], field: string): Value {
  if (typeof value !== 'string' || !values.includes(value as Value)) throw new Error(`${field} is not declared.`);
  return value as Value;
}

export function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean.`);
  return value;
}

export function nonNegativeInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${field} must be a non-negative safe integer.`);
  return Number(value);
}

export function finiteNumber(value: unknown, field: string): number {
  if (!isFiniteNumber(value)) throw new Error(`${field} must be a finite number.`);
  return value;
}

export function isoTimestamp(value: unknown, field: string): string {
  const timestamp = requiredString(value, field);
  if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp))) throw new Error(`${field} must be an ISO UTC timestamp.`);
  return timestamp;
}

export function assertExactKeys(value: JsonRecord, allowed: readonly string[], field: string): void {
  const allowedKeys = new Set(allowed);
  const unknown = Object.keys(value).filter(key => !allowedKeys.has(key));
  if (unknown.length > 0) throw new Error(`${field} contains undeclared fields: ${unknown.sort().join(', ')}.`);
}

export function assertValue(actual: unknown, expected: unknown, field: string): void {
  if (actual !== expected) throw new Error(`${field} must match its exact binding.`);
}

export function assertUnique(values: readonly string[], field: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${field} must not contain duplicates.`);
}

export function requiredPublicIdentifier(value: unknown, field: string): string {
  const identifier = requiredString(value, field);
  if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('://') || identifier.includes('..'))
    throw new Error(`${field} must not contain a physical path or URI.`);
  return identifier;
}

/** Validates an exact `ArtifactGeneration` identity. */
export function validateGeneration(value: unknown, field: string): { runId: string; generatedAt: string } {
  const generation = asRecord(value, field);
  assertExactKeys(generation, ['runId', 'generatedAt'], field);
  return {
    runId: requiredPublicIdentifier(generation.runId, `${field}.runId`),
    generatedAt: isoTimestamp(generation.generatedAt, `${field}.generatedAt`),
  };
}

/** Rejects non-JSON values and non-plain objects; `isForbiddenKey` rejects keys at every depth. */
export function assertPlainJson(value: unknown, field: string, isForbiddenKey: (key: string) => boolean = () => false): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${field} must contain only finite JSON numbers.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPlainJson(item, `${field}[${index}]`, isForbiddenKey));
    return;
  }
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${field} must contain only plain JSON values.`);
  }
  for (const [key, child] of Object.entries(value)) {
    if (isForbiddenKey(key)) throw new Error(`${field}.${key} is not allowed in a public artifact.`);
    assertPlainJson(child, `${field}.${key}`, isForbiddenKey);
  }
}
