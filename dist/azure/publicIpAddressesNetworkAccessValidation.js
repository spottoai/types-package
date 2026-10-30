"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPublicIpAddressesNetworkAccessEvaluation = exports.isPerimeterServiceClassification = void 0;
const publicIpAddressesNetworkAccess_1 = require("./publicIpAddressesNetworkAccess");
const publicIpAddressesEvidenceValidation_1 = require("./publicIpAddressesEvidenceValidation");
const isPerimeterServiceClassification = (value) => {
    if (!(0, publicIpAddressesEvidenceValidation_1.isRecord)(value) ||
        !(0, publicIpAddressesEvidenceValidation_1.isText)(value.id) ||
        !(0, publicIpAddressesEvidenceValidation_1.isText)(value.label, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.labelLength) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.category, ['remote_access', 'cluster_management', 'database', 'file_share', 'messaging', 'web', 'other']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.basis, ['port', 'listener', 'resource_configuration']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.protocol, publicIpAddressesEvidenceValidation_1.protocols))
        return false;
    if (value.frontendPortRanges !== null && (!(0, publicIpAddressesEvidenceValidation_1.isPortRanges)(value.frontendPortRanges) || !(0, publicIpAddressesEvidenceValidation_1.knownPorts)(value.frontendPortRanges)))
        return false;
    if (value.backendPortRanges !== null && (!(0, publicIpAddressesEvidenceValidation_1.isPortRanges)(value.backendPortRanges) || !(0, publicIpAddressesEvidenceValidation_1.knownPorts)(value.backendPortRanges)))
        return false;
    return value.basis !== 'port' || (value.protocol !== 'unknown' && (value.frontendPortRanges !== null || value.backendPortRanges !== null));
};
exports.isPerimeterServiceClassification = isPerimeterServiceClassification;
const isDecision = (value, sources, complete) => {
    if (!(0, publicIpAddressesEvidenceValidation_1.isRecord)(value) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.level, ['subnet', 'nic', 'gateway_subnet', 'resource', 'platform']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.access, ['allow', 'deny']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.basis, ['rule', 'default_rule', 'platform_default']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isText)(value.reasonCode, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasonLength) ||
        (value.priority !== null && !(0, publicIpAddressesEvidenceValidation_1.isCount)(value.priority)) ||
        !(0, publicIpAddressesEvidenceValidation_1.isTexts)(value.sourceIds, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.sources, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.idLength) ||
        value.sourceIds.length === 0 ||
        !(0, publicIpAddressesEvidenceValidation_1.isUnique)(value.sourceIds))
        return false;
    if (value.filter !== null && !(0, publicIpAddressesEvidenceValidation_1.isResource)(value.filter))
        return false;
    if (value.rule !== null && !(0, publicIpAddressesEvidenceValidation_1.isResource)(value.rule))
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
    if (!(0, publicIpAddressesEvidenceValidation_1.isRecord)(value) ||
        !(0, publicIpAddressesEvidenceValidation_1.isText)(value.id) ||
        typeof value.complete !== 'boolean' ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.verdict, ['allowed', 'blocked', 'unverified']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.protocol, publicIpAddressesEvidenceValidation_1.protocols) ||
        !(0, publicIpAddressesEvidenceValidation_1.isArray)(value.sourceSelectors, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.selectors) ||
        value.sourceSelectors.length === 0 ||
        !value.sourceSelectors.every(selector => (0, publicIpAddressesEvidenceValidation_1.isRecord)(selector) &&
            (0, publicIpAddressesEvidenceValidation_1.isOneOf)(selector.kind, ['ip_prefix', 'service_tag', 'application_security_group', 'unknown']) &&
            (0, publicIpAddressesEvidenceValidation_1.isText)(selector.value, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.selectorLength)) ||
        !(0, publicIpAddressesEvidenceValidation_1.isPortRanges)(value.sourcePortRanges) ||
        !(0, publicIpAddressesEvidenceValidation_1.isPortRanges)(value.backendPortRanges) ||
        !(0, publicIpAddressesEvidenceValidation_1.isTexts)(value.incompleteReasons, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasons) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOmissions)(value.omitted, ['sourceSelectors', 'sourcePortRanges', 'backendPortRanges', 'decisions']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isArray)(value.decisions, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.decisions) ||
        !value.decisions.every(decision => isDecision(decision, sources, value.complete === true)))
        return false;
    if (!value.complete)
        return value.verdict === 'unverified' && value.incompleteReasons.length > 0;
    if (value.verdict === 'unverified' ||
        value.protocol === 'unknown' ||
        value.sourceSelectors.some(selector => selector.kind === 'unknown') ||
        !(0, publicIpAddressesEvidenceValidation_1.knownPorts)(value.sourcePortRanges) ||
        !(0, publicIpAddressesEvidenceValidation_1.knownPorts)(value.backendPortRanges) ||
        value.incompleteReasons.length > 0 ||
        (0, publicIpAddressesEvidenceValidation_1.hasOmissions)(value.omitted) ||
        value.decisions.length === 0)
        return false;
    // A first-match transcript has one decision per filter attachment. The same
    // native filter may legitimately be attached at distinct network levels.
    const filterInstances = value.decisions.map(decision => {
        const entry = decision;
        return JSON.stringify([entry.level, entry.basis === 'platform_default' ? null : entry.filter.id]);
    });
    if (!(0, publicIpAddressesEvidenceValidation_1.isUnique)(filterInstances))
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
const isPublicIpAddressesNetworkAccessEvaluation = (value) => {
    if (!(0, publicIpAddressesEvidenceValidation_1.isRecord)(value) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.verdict, ['allowed', 'blocked', 'unverified']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.freshness, ['current', 'stale', 'expired', 'unknown']) ||
        typeof value.exhaustive !== 'boolean' ||
        !(0, publicIpAddressesEvidenceValidation_1.isTexts)(value.incompleteReasons, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasons) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOmissions)(value.omitted, ['partitions', 'sources']))
        return false;
    const assessedAt = (0, publicIpAddressesEvidenceValidation_1.timestamp)(value.assessedAt);
    if (assessedAt === null ||
        !(0, publicIpAddressesEvidenceValidation_1.isRecord)(value.coverage) ||
        !(0, publicIpAddressesEvidenceValidation_1.isOneOf)(value.coverage.status, ['complete', 'partial', 'unavailable']) ||
        !(0, publicIpAddressesEvidenceValidation_1.isArray)(value.coverage.sources, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.sources) ||
        !value.coverage.sources.every(source => (0, publicIpAddressesEvidenceValidation_1.isSource)(source, assessedAt)) ||
        !(0, publicIpAddressesEvidenceValidation_1.isArray)(value.coverage.issues, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.reasons) ||
        !value.coverage.issues.every(publicIpAddressesEvidenceValidation_1.isIssue))
        return false;
    const sources = value.coverage.sources;
    if (!(0, publicIpAddressesEvidenceValidation_1.isUnique)(sources.map(source => source.id)))
        return false;
    const completeCoverage = value.coverage.status === 'complete';
    if (completeCoverage &&
        (sources.length === 0 || sources.some(source => source.status !== 'complete') || value.coverage.issues.length > 0 || (0, publicIpAddressesEvidenceValidation_1.hasOmissions)(value.omitted)))
        return false;
    const sourceById = new Map(sources.map(source => [source.id, source]));
    if (!(0, publicIpAddressesEvidenceValidation_1.isArray)(value.partitions, publicIpAddressesNetworkAccess_1.PUBLIC_IP_ADDRESSES_NETWORK_ACCESS_LIMITS.partitions) || !value.partitions.every(partition => isPartition(partition, sourceById)))
        return false;
    const partitions = value.partitions;
    if (!(0, publicIpAddressesEvidenceValidation_1.isUnique)(partitions.map(partition => partition.id)))
        return false;
    if (!value.exhaustive && value.incompleteReasons.length === 0)
        return false;
    if (value.coverage.status === 'unavailable' && (value.verdict !== 'unverified' || partitions.some(partition => partition.complete)))
        return false;
    const clipped = (0, publicIpAddressesEvidenceValidation_1.hasOmissions)(value.omitted) || partitions.some(partition => (0, publicIpAddressesEvidenceValidation_1.hasOmissions)(partition.omitted));
    if (clipped && (value.coverage.status !== 'partial' || value.exhaustive || value.incompleteReasons.length === 0))
        return false;
    const hasAllowed = partitions.some(partition => partition.complete && partition.verdict === 'allowed');
    const allBlocked = completeCoverage &&
        value.exhaustive &&
        value.freshness === 'current' &&
        value.incompleteReasons.length === 0 &&
        !(0, publicIpAddressesEvidenceValidation_1.hasOmissions)(value.omitted) &&
        partitions.length > 0 &&
        partitions.every(partition => partition.complete && partition.verdict === 'blocked');
    if (value.verdict === 'blocked')
        return allBlocked;
    if (value.verdict === 'allowed')
        return hasAllowed;
    return !hasAllowed && !allBlocked && value.incompleteReasons.length > 0;
};
exports.isPublicIpAddressesNetworkAccessEvaluation = isPublicIpAddressesNetworkAccessEvaluation;
//# sourceMappingURL=publicIpAddressesNetworkAccessValidation.js.map