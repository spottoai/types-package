import { PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS as limits, type PublicIpAddressesNetworkAccessSource } from './publicIpAddressesNetworkAccess';
import type { PublicIpAddressesPortRange } from './publicIpAddresses';

export type JsonRecord = Record<string, unknown>;
export const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isText = (value: unknown, max: number = limits.idLength): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
export const isOneOf = (value: unknown, options: readonly string[]): value is string => typeof value === 'string' && options.includes(value);
export const isArray = (value: unknown, max: number): value is unknown[] => {
  if (!Array.isArray(value) || value.length > max) return false;
  // Array.every skips holes; a sparse array must never establish complete evidence.
  for (let index = 0; index < value.length; index++) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
  }
  return true;
};
export const isTexts = (value: unknown, max: number, length: number = limits.reasonLength): value is string[] =>
  isArray(value, max) && value.every(entry => isText(entry, length));
export const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length;
export const protocols = ['tcp', 'udp', 'icmp', 'ah', 'esp', 'any', 'unknown'];

/** Strict UTC timestamps with optional milliseconds; no wall-clock or freshness policy. */
export const timestamp = (value: unknown): number | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value) ? parsed : null;
};

export const isPortRange = (value: unknown): value is PublicIpAddressesPortRange => {
  if (!isRecord(value) || !isText(value.value, limits.selectorLength)) return false;
  if (value.from === null || value.to === null) return value.from === null && value.to === null;
  if (!isCount(value.from) || !isCount(value.to) || value.from > value.to || value.to > 65535) return false;
  if (value.value === '*') return value.from === 0 && value.to === 65535;
  if (!/^\d+(?:-\d+)?$/.test(value.value)) return false;
  const [from, to = from] = value.value.split('-').map(Number);
  return from === value.from && to === value.to;
};
export const isPortRanges = (value: unknown): value is PublicIpAddressesPortRange[] =>
  isArray(value, limits.selectors) && value.length > 0 && value.every(isPortRange);
export const knownPorts = (value: PublicIpAddressesPortRange[]): boolean => value.every(range => range.from !== null && range.to !== null);
export const isResource = (value: unknown): boolean =>
  isRecord(value) &&
  isText(value.id) &&
  (value.name === null || isText(value.name, limits.labelLength)) &&
  (value.type === null || isText(value.type, limits.labelLength));
export const isOmissions = (value: unknown, keys: readonly string[]): value is Record<string, number> =>
  isRecord(value) && keys.every(key => isCount(value[key])) && Object.keys(value).every(key => keys.includes(key));
export const hasOmissions = (value: Record<string, number>): boolean => Object.values(value).some(count => count > 0);

export const isSource = (value: unknown, assessedAt: number): value is PublicIpAddressesNetworkAccessSource => {
  if (
    !isRecord(value) ||
    !isText(value.id) ||
    !isText(value.family, limits.labelLength) ||
    !isText(value.location, limits.labelLength) ||
    !isOneOf(value.status, ['complete', 'partial', 'missing']) ||
    (value.reason !== undefined && !isText(value.reason, limits.reasonLength))
  )
    return false;
  const observedAt = timestamp(value.observedAt);
  if (value.observedAt !== null && (observedAt === null || observedAt > assessedAt)) return false;
  return value.status === 'complete' ? observedAt !== null : isText(value.reason, limits.reasonLength);
};

export const isIssue = (value: unknown): boolean =>
  isRecord(value) &&
  isText(value.code, limits.reasonLength) &&
  isText(value.message, limits.reasonLength) &&
  ['resourceId', 'family', 'location'].every(key => value[key] === undefined || isText(value[key]));
