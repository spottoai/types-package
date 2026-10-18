import {
  PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS as limits,
  type PerimeterServiceClassification,
  type PublicIpAddressesNetworkAccessEvaluation,
  type PublicIpAddressesNetworkAccessSource,
  type PublicIpAddressesPacketPartition,
} from './publicIpAddressesNetworkAccess';
import type { PublicIpAddressesPortRange } from './publicIpAddresses';

type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, max: number = limits.idLength): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const isOneOf = (value: unknown, options: readonly string[]): value is string => typeof value === 'string' && options.includes(value);
const isArray = (value: unknown, max: number): value is unknown[] => {
  if (!Array.isArray(value) || value.length > max) return false;
  // Array.every skips holes; a sparse array must never establish complete evidence.
  for (let index = 0; index < value.length; index++) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
  }
  return true;
};
const isTexts = (value: unknown, max: number, length: number = limits.reasonLength): value is string[] =>
  isArray(value, max) && value.every(entry => isText(entry, length));
const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length;
const protocols = ['tcp', 'udp', 'icmp', 'ah', 'esp', 'any', 'unknown'];

/** Strict UTC timestamps with optional milliseconds; no wall-clock or freshness policy. */
const timestamp = (value: unknown): number | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value) ? parsed : null;
};

const isPortRange = (value: unknown): value is PublicIpAddressesPortRange => {
  if (!isRecord(value) || !isText(value.value, limits.selectorLength)) return false;
  if (value.from === null || value.to === null) return value.from === null && value.to === null;
  if (!isCount(value.from) || !isCount(value.to) || value.from > value.to || value.to > 65535) return false;
  if (value.value === '*') return value.from === 0 && value.to === 65535;
  if (!/^\d+(?:-\d+)?$/.test(value.value)) return false;
  const [from, to = from] = value.value.split('-').map(Number);
  return from === value.from && to === value.to;
};
const isPortRanges = (value: unknown): value is PublicIpAddressesPortRange[] =>
  isArray(value, limits.selectors) && value.length > 0 && value.every(isPortRange);
const knownPorts = (value: PublicIpAddressesPortRange[]): boolean => value.every(range => range.from !== null && range.to !== null);
const isResource = (value: unknown): boolean =>
  isRecord(value) &&
  isText(value.id) &&
  (value.name === null || isText(value.name, limits.labelLength)) &&
  (value.type === null || isText(value.type, limits.labelLength));
const isOmissions = (value: unknown, keys: readonly string[]): value is Record<string, number> =>
  isRecord(value) && keys.every(key => isCount(value[key])) && Object.keys(value).every(key => keys.includes(key));
const hasOmissions = (value: Record<string, number>): boolean => Object.values(value).some(count => count > 0);

export const isPerimeterServiceClassification = (value: unknown): value is PerimeterServiceClassification => {
  if (
    !isRecord(value) ||
    !isText(value.id) ||
    !isText(value.label, limits.labelLength) ||
    !isOneOf(value.category, ['remote_access', 'cluster_management', 'database', 'file_share', 'messaging', 'web', 'other']) ||
    !isOneOf(value.basis, ['port', 'listener', 'resource_configuration']) ||
    !isOneOf(value.protocol, protocols)
  )
    return false;
  if (value.frontendPortRanges !== null && (!isPortRanges(value.frontendPortRanges) || !knownPorts(value.frontendPortRanges))) return false;
  if (value.backendPortRanges !== null && (!isPortRanges(value.backendPortRanges) || !knownPorts(value.backendPortRanges))) return false;
  return value.basis !== 'port' || (value.protocol !== 'unknown' && (value.frontendPortRanges !== null || value.backendPortRanges !== null));
};

const isSource = (value: unknown, assessedAt: number): value is PublicIpAddressesNetworkAccessSource => {
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

const isIssue = (value: unknown): boolean =>
  isRecord(value) &&
  isText(value.code, limits.reasonLength) &&
  isText(value.message, limits.reasonLength) &&
  ['resourceId', 'family', 'location'].every(key => value[key] === undefined || isText(value[key]));

const isDecision = (value: unknown, sources: Map<string, PublicIpAddressesNetworkAccessSource>, complete: boolean): boolean => {
  if (
    !isRecord(value) ||
    !isOneOf(value.level, ['subnet', 'nic', 'gateway_subnet', 'resource', 'platform']) ||
    !isOneOf(value.access, ['allow', 'deny']) ||
    !isOneOf(value.basis, ['rule', 'default_rule', 'platform_default']) ||
    !isText(value.reasonCode, limits.reasonLength) ||
    (value.priority !== null && !isCount(value.priority)) ||
    !isTexts(value.sourceIds, limits.sources, limits.idLength) ||
    value.sourceIds.length === 0 ||
    !isUnique(value.sourceIds)
  )
    return false;
  if (value.filter !== null && !isResource(value.filter)) return false;
  if (value.rule !== null && !isResource(value.rule)) return false;
  if (value.basis === 'platform_default') {
    if (value.filter !== null || value.rule !== null || value.priority !== null) return false;
  } else if (value.filter === null || (value.basis === 'rule' && value.rule === null)) return false;
  return value.sourceIds.every(id => {
    const source = sources.get(id);
    return source !== undefined && (!complete || (source.status === 'complete' && source.observedAt !== null));
  });
};

const isPartition = (value: unknown, sources: Map<string, PublicIpAddressesNetworkAccessSource>): value is PublicIpAddressesPacketPartition => {
  if (
    !isRecord(value) ||
    !isText(value.id) ||
    typeof value.complete !== 'boolean' ||
    !isOneOf(value.verdict, ['allowed', 'blocked', 'unverified']) ||
    !isOneOf(value.protocol, protocols) ||
    !isArray(value.sourceSelectors, limits.selectors) ||
    value.sourceSelectors.length === 0 ||
    !value.sourceSelectors.every(
      selector =>
        isRecord(selector) &&
        isOneOf(selector.kind, ['ip_prefix', 'service_tag', 'application_security_group', 'unknown']) &&
        isText(selector.value, limits.selectorLength)
    ) ||
    !isPortRanges(value.sourcePortRanges) ||
    !isPortRanges(value.backendPortRanges) ||
    !isTexts(value.incompleteReasons, limits.reasons) ||
    !isOmissions(value.omitted, ['sourceSelectors', 'sourcePortRanges', 'backendPortRanges', 'decisions']) ||
    !isArray(value.decisions, limits.decisions) ||
    !value.decisions.every(decision => isDecision(decision, sources, value.complete === true))
  )
    return false;
  if (!value.complete) return value.verdict === 'unverified' && value.incompleteReasons.length > 0;
  if (
    value.verdict === 'unverified' ||
    value.protocol === 'unknown' ||
    value.sourceSelectors.some(selector => (selector as JsonRecord).kind === 'unknown') ||
    !knownPorts(value.sourcePortRanges) ||
    !knownPorts(value.backendPortRanges) ||
    value.incompleteReasons.length > 0 ||
    hasOmissions(value.omitted) ||
    value.decisions.length === 0
  )
    return false;
  // A first-match transcript has one decision per filter attachment. The same
  // native filter may legitimately be attached at distinct network levels.
  const filterInstances = value.decisions.map(decision => {
    const entry = decision as JsonRecord;
    return JSON.stringify([entry.level, entry.basis === 'platform_default' ? null : (entry.filter as JsonRecord).id]);
  });
  if (!isUnique(filterInstances)) return false;
  return value.verdict === 'allowed'
    ? value.decisions.every(decision => (decision as JsonRecord).access === 'allow')
    : value.decisions.some(decision => (decision as JsonRecord).access === 'deny');
};

/**
 * Checks bounded extension shape and declared evidence consistency only. It cannot
 * prove truthful collection, resolved selectors, exhaustive packet coverage, or
 * real network reachability. Readers must re-evaluate freshness using their clock.
 */
export const isPublicIpAddressesNetworkAccessEvaluation = (value: unknown): value is PublicIpAddressesNetworkAccessEvaluation => {
  if (
    !isRecord(value) ||
    !isOneOf(value.verdict, ['allowed', 'blocked', 'unverified']) ||
    !isOneOf(value.freshness, ['current', 'stale', 'expired', 'unknown']) ||
    typeof value.exhaustive !== 'boolean' ||
    !isTexts(value.incompleteReasons, limits.reasons) ||
    !isOmissions(value.omitted, ['partitions', 'sources'])
  )
    return false;
  const assessedAt = timestamp(value.assessedAt);
  if (
    assessedAt === null ||
    !isRecord(value.coverage) ||
    !isOneOf(value.coverage.status, ['complete', 'partial', 'unavailable']) ||
    !isArray(value.coverage.sources, limits.sources) ||
    !value.coverage.sources.every(source => isSource(source, assessedAt)) ||
    !isArray(value.coverage.issues, limits.reasons) ||
    !value.coverage.issues.every(isIssue)
  )
    return false;
  const sources = value.coverage.sources as PublicIpAddressesNetworkAccessSource[];
  if (!isUnique(sources.map(source => source.id))) return false;
  const completeCoverage = value.coverage.status === 'complete';
  if (
    completeCoverage &&
    (sources.length === 0 || sources.some(source => source.status !== 'complete') || value.coverage.issues.length > 0 || hasOmissions(value.omitted))
  )
    return false;
  const sourceById = new Map(sources.map(source => [source.id, source]));
  if (!isArray(value.partitions, limits.partitions) || !value.partitions.every(partition => isPartition(partition, sourceById))) return false;
  const partitions = value.partitions as PublicIpAddressesPacketPartition[];
  if (!isUnique(partitions.map(partition => partition.id))) return false;
  if (!value.exhaustive && value.incompleteReasons.length === 0) return false;
  if (value.coverage.status === 'unavailable' && (value.verdict !== 'unverified' || partitions.some(partition => partition.complete))) return false;
  const clipped = hasOmissions(value.omitted) || partitions.some(partition => hasOmissions(partition.omitted));
  if (clipped && (value.coverage.status !== 'partial' || value.exhaustive || value.incompleteReasons.length === 0)) return false;
  const hasAllowed = partitions.some(partition => partition.complete && partition.verdict === 'allowed');
  const allBlocked =
    completeCoverage &&
    value.exhaustive &&
    value.freshness === 'current' &&
    value.incompleteReasons.length === 0 &&
    !hasOmissions(value.omitted) &&
    partitions.length > 0 &&
    partitions.every(partition => partition.complete && partition.verdict === 'blocked');
  if (value.verdict === 'blocked') return allBlocked;
  if (value.verdict === 'allowed') return hasAllowed;
  return !hasAllowed && !allBlocked && value.incompleteReasons.length > 0;
};
