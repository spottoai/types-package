import { PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS as limits, } from './publicIpAddressesNetworkAccess.js';
import { isArray, isCount, isIssue, isOmissions, isOneOf, isPortRanges, isRecord, isResource, isSource, isText, isTexts, isUnique, hasOmissions, knownPorts, protocols, timestamp, } from './publicIpAddressesEvidenceValidation.js';
export const isPerimeterServiceClassification = (value) => {
    if (!isRecord(value) ||
        !isText(value.id) ||
        !isText(value.label, limits.labelLength) ||
        !isOneOf(value.category, ['remote_access', 'cluster_management', 'database', 'file_share', 'messaging', 'web', 'other']) ||
        !isOneOf(value.basis, ['port', 'listener', 'resource_configuration']) ||
        !isOneOf(value.protocol, protocols))
        return false;
    if (value.frontendPortRanges !== null && (!isPortRanges(value.frontendPortRanges) || !knownPorts(value.frontendPortRanges)))
        return false;
    if (value.backendPortRanges !== null && (!isPortRanges(value.backendPortRanges) || !knownPorts(value.backendPortRanges)))
        return false;
    return value.basis !== 'port' || (value.protocol !== 'unknown' && (value.frontendPortRanges !== null || value.backendPortRanges !== null));
};
const isDecision = (value, sources, complete) => {
    if (!isRecord(value) ||
        !isOneOf(value.level, ['subnet', 'nic', 'gateway_subnet', 'resource', 'platform']) ||
        !isOneOf(value.access, ['allow', 'deny']) ||
        !isOneOf(value.basis, ['rule', 'default_rule', 'platform_default']) ||
        !isText(value.reasonCode, limits.reasonLength) ||
        (value.priority !== null && !isCount(value.priority)) ||
        !isTexts(value.sourceIds, limits.sources, limits.idLength) ||
        value.sourceIds.length === 0 ||
        !isUnique(value.sourceIds))
        return false;
    if (value.filter !== null && !isResource(value.filter))
        return false;
    if (value.rule !== null && !isResource(value.rule))
        return false;
    if (value.basis === 'platform_default') {
        if (value.filter !== null || value.rule !== null || value.priority !== null)
            return false;
    }
    else if (value.filter === null || (value.basis === 'rule' && value.rule === null))
        return false;
    return value.sourceIds.every(id => {
        const source = sources.get(id);
        return source !== undefined && (!complete || (source.status === 'complete' && source.observedAt !== null));
    });
};
const isPartition = (value, sources) => {
    if (!isRecord(value) ||
        !isText(value.id) ||
        typeof value.complete !== 'boolean' ||
        !isOneOf(value.verdict, ['allowed', 'blocked', 'unverified']) ||
        !isOneOf(value.protocol, protocols) ||
        !isArray(value.sourceSelectors, limits.selectors) ||
        value.sourceSelectors.length === 0 ||
        !value.sourceSelectors.every(selector => isRecord(selector) &&
            isOneOf(selector.kind, ['ip_prefix', 'service_tag', 'application_security_group', 'unknown']) &&
            isText(selector.value, limits.selectorLength)) ||
        !isPortRanges(value.sourcePortRanges) ||
        !isPortRanges(value.backendPortRanges) ||
        !isTexts(value.incompleteReasons, limits.reasons) ||
        !isOmissions(value.omitted, ['sourceSelectors', 'sourcePortRanges', 'backendPortRanges', 'decisions']) ||
        !isArray(value.decisions, limits.decisions) ||
        !value.decisions.every(decision => isDecision(decision, sources, value.complete === true)))
        return false;
    if (!value.complete)
        return value.verdict === 'unverified' && value.incompleteReasons.length > 0;
    if (value.verdict === 'unverified' ||
        value.protocol === 'unknown' ||
        value.sourceSelectors.some(selector => selector.kind === 'unknown') ||
        !knownPorts(value.sourcePortRanges) ||
        !knownPorts(value.backendPortRanges) ||
        value.incompleteReasons.length > 0 ||
        hasOmissions(value.omitted) ||
        value.decisions.length === 0)
        return false;
    // A first-match transcript has one decision per filter attachment. The same
    // native filter may legitimately be attached at distinct network levels.
    const filterInstances = value.decisions.map(decision => {
        const entry = decision;
        return JSON.stringify([entry.level, entry.basis === 'platform_default' ? null : entry.filter.id]);
    });
    if (!isUnique(filterInstances))
        return false;
    return value.verdict === 'allowed'
        ? value.decisions.every(decision => decision.access === 'allow')
        : value.decisions.some(decision => decision.access === 'deny');
};
/**
 * Checks bounded extension shape and declared evidence consistency only. It cannot
 * prove truthful collection, resolved selectors, exhaustive packet coverage, or
 * real network reachability. Readers must re-evaluate freshness using their clock.
 */
export const isPublicIpAddressesNetworkAccessEvaluation = (value) => {
    if (!isRecord(value) ||
        !isOneOf(value.verdict, ['allowed', 'blocked', 'unverified']) ||
        !isOneOf(value.freshness, ['current', 'stale', 'expired', 'unknown']) ||
        typeof value.exhaustive !== 'boolean' ||
        !isTexts(value.incompleteReasons, limits.reasons) ||
        !isOmissions(value.omitted, ['partitions', 'sources']))
        return false;
    const assessedAt = timestamp(value.assessedAt);
    if (assessedAt === null ||
        !isRecord(value.coverage) ||
        !isOneOf(value.coverage.status, ['complete', 'partial', 'unavailable']) ||
        !isArray(value.coverage.sources, limits.sources) ||
        !value.coverage.sources.every(source => isSource(source, assessedAt)) ||
        !isArray(value.coverage.issues, limits.reasons) ||
        !value.coverage.issues.every(isIssue))
        return false;
    const sources = value.coverage.sources;
    if (!isUnique(sources.map(source => source.id)))
        return false;
    const completeCoverage = value.coverage.status === 'complete';
    if (completeCoverage &&
        (sources.length === 0 || sources.some(source => source.status !== 'complete') || value.coverage.issues.length > 0 || hasOmissions(value.omitted)))
        return false;
    const sourceById = new Map(sources.map(source => [source.id, source]));
    if (!isArray(value.partitions, limits.partitions) || !value.partitions.every(partition => isPartition(partition, sourceById)))
        return false;
    const partitions = value.partitions;
    if (!isUnique(partitions.map(partition => partition.id)))
        return false;
    if (!value.exhaustive && value.incompleteReasons.length === 0)
        return false;
    if (value.coverage.status === 'unavailable' && (value.verdict !== 'unverified' || partitions.some(partition => partition.complete)))
        return false;
    const clipped = hasOmissions(value.omitted) || partitions.some(partition => hasOmissions(partition.omitted));
    if (clipped && (value.coverage.status !== 'partial' || value.exhaustive || value.incompleteReasons.length === 0))
        return false;
    const hasAllowed = partitions.some(partition => partition.complete && partition.verdict === 'allowed');
    const allBlocked = completeCoverage &&
        value.exhaustive &&
        value.freshness === 'current' &&
        value.incompleteReasons.length === 0 &&
        !hasOmissions(value.omitted) &&
        partitions.length > 0 &&
        partitions.every(partition => partition.complete && partition.verdict === 'blocked');
    if (value.verdict === 'blocked')
        return allBlocked;
    if (value.verdict === 'allowed')
        return hasAllowed;
    return !hasAllowed && !allBlocked && value.incompleteReasons.length > 0;
};
