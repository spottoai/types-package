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
