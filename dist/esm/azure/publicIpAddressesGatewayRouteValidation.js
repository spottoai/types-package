import { PUBLIC_IP_ADDRESSES_GATEWAY_ROUTE_LIMITS as limits, } from './publicIpAddressesGatewayRoute.js';
import { hasOmissions, isArray, isCount, isIssue, isOmissions, isOneOf, isRecord, isResource, isSource, isText, isTexts, isUnique, timestamp, } from './publicIpAddressesEvidenceValidation.js';
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const resource = (value) => isResource(value) && keys(value, ['id', 'name', 'type']);
const nullableResource = (value) => value === null || resource(value);
const port = (value) => isCount(value) && value >= 1 && value <= 65535;
const nullableCount = (value) => value === null || isCount(value);
const nullableBoolean = (value) => value === null || typeof value === 'boolean';
const sourceIds = (value) => isTexts(value, limits.sources, limits.idLength) && isUnique(value);
const host = (value) => typeof value === 'string' &&
    value.length <= 253 &&
    value
        .replace(/\.$/, '')
        .split('.')
        .every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
const ipv4 = (value) => value.split('.').length === 4 && value.split('.').every(octet => /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255);
const ipAddress = (value) => {
    if (typeof value !== 'string' || value.length > 45)
        return false;
    if (!value.includes(':'))
        return ipv4(value);
    if (!/^[0-9a-f:.]+$/i.test(value))
        return false;
    let address = value;
    if (address.includes('.')) {
        const lastColon = address.lastIndexOf(':');
        if (!ipv4(address.slice(lastColon + 1)))
            return false;
        address = `${address.slice(0, lastColon)}:0:0`;
    }
    const halves = address.split('::');
    if (halves.length > 2)
        return false;
    const counts = halves.map(half => half === '' ? 0 : half.split(':').every(group => /^[0-9a-f]{1,4}$/i.test(group)) ? half.split(':').length : NaN);
    const groups = counts.reduce((sum, count) => sum + count, 0);
    return halves.length === 1 ? groups === 8 : Number.isFinite(groups) && groups < 8;
};
const sanitizedUrl = (value) => {
    if (!isText(value, limits.patternLength) || /[\s\\\p{Cc}]/u.test(value))
        return false;
    const url = /^https?:\/\/([^/?#]+)(?:\/[^?#]*)?$/i.exec(value);
    if (!url)
        return false;
    const authority = url[1];
    const parts = authority.startsWith('[') ? /^\[([^\]]+)\](?::(\d+))?$/.exec(authority) : /^([^:]+)(?::(\d+))?$/.exec(authority);
    if (!parts || (parts[2] !== undefined && !port(Number(parts[2]))))
        return false;
    return authority.startsWith('[') ? parts[1].includes(':') && ipAddress(parts[1]) : /^[\d.]+$/.test(parts[1]) ? ipv4(parts[1]) : host(parts[1]);
};
const backendTarget = (value) => {
    if (!isRecord(value))
        return false;
    if (value.kind === 'ip_address')
        return keys(value, ['kind', 'address']) && ipAddress(value.address);
    if (value.kind === 'fqdn')
        return keys(value, ['kind', 'hostname']) && host(value.hostname);
    return value.kind === 'resource' && keys(value, ['kind', 'resource']) && resource(value.resource);
};
const association = (value) => {
    if (!isRecord(value) ||
        !keys(value, [
            'id',
            'scope',
            'attachment',
            'basis',
            'policy',
            'enabled',
            'mode',
            'sourceIds',
            'customAllowRuleCount',
            'exclusionCount',
            'managedRuleSetCount',
        ]) ||
        !isText(value.id) ||
        !isOneOf(value.scope, ['gateway', 'listener', 'path']) ||
        !resource(value.attachment) ||
        !isOneOf(value.basis, ['policy', 'inline']) ||
        !nullableBoolean(value.enabled) ||
        !isOneOf(value.mode, ['prevention', 'detection', 'unknown']) ||
        !sourceIds(value.sourceIds) ||
        !value.sourceIds.length ||
        !['customAllowRuleCount', 'exclusionCount', 'managedRuleSetCount'].every(key => nullableCount(value[key])))
        return false;
    return value.basis === 'inline' ? value.scope === 'gateway' && value.policy === null : resource(value.policy);
};
/** Bounded WAF configuration shape. Source binding and route attachments are checked by the parent guard. */
export const isPublicIpAddressesWafAssessment = (value) => {
    if (!isRecord(value) ||
        !keys(value, ['state', 'associations', 'selectedAssociationId', 'sourceIds', 'incompleteReasons', 'omitted']) ||
        !isOneOf(value.state, ['prevention', 'detection', 'disabled', 'not_configured', 'unverified']) ||
        !isArray(value.associations, limits.associations) ||
        !value.associations.every(association) ||
        !sourceIds(value.sourceIds) ||
        !isTexts(value.incompleteReasons, limits.reasons) ||
        !isOmissions(value.omitted, ['associations']))
        return false;
    const entries = value.associations;
    if (!isUnique(entries.map(entry => entry.id)) || !isUnique(entries.map(entry => entry.scope)))
        return false;
    const rank = (scope) => ['gateway', 'listener', 'path'].indexOf(String(scope));
    const selected = entries.find(entry => entry.id === value.selectedAssociationId);
    if (value.selectedAssociationId !== null && (!selected || entries.some(entry => rank(entry.scope) > rank(selected.scope))))
        return false;
    if (value.omitted.associations > 0 && (value.state !== 'unverified' || value.selectedAssociationId !== null))
        return false;
    if (value.state === 'unverified')
        return value.incompleteReasons.length > 0;
    if (value.incompleteReasons.length || value.omitted.associations || !value.sourceIds.length)
        return false;
    if (value.state === 'not_configured')
        return !entries.length && value.selectedAssociationId === null;
    if (!selected)
        return false;
    return value.state === 'disabled' ? selected.enabled === false : selected.enabled === true && selected.mode === value.state;
};
const boundSources = (ids, sources, complete) => (!complete || ids.length > 0) &&
    ids.every(id => {
        const source = sources.get(id);
        return source !== undefined && (!complete || source.status === 'complete');
    });
const forwarding = (value, sources) => {
    if (!isRecord(value) || !sourceIds(value.sourceIds) || !boundSources(value.sourceIds, sources, value.kind !== 'unresolved'))
        return false;
    if (value.kind === 'backend')
        return (keys(value, ['kind', 'pool', 'settings', 'protocol', 'port', 'target', 'sourceIds']) &&
            resource(value.pool) &&
            resource(value.settings) &&
            isOneOf(value.protocol, ['http', 'https']) &&
            port(value.port) &&
            backendTarget(value.target));
    if (value.kind === 'empty_backend_pool')
        return keys(value, ['kind', 'pool', 'settings', 'sourceIds']) && resource(value.pool) && nullableResource(value.settings);
    if (value.kind === 'unresolved')
        return (keys(value, ['kind', 'reason', 'pool', 'settings', 'target', 'sourceIds']) &&
            isText(value.reason, limits.reasonLength) &&
            nullableResource(value.pool) &&
            nullableResource(value.settings) &&
            (value.target === null || backendTarget(value.target)));
    if (value.kind !== 'redirect' ||
        !keys(value, ['kind', 'configuration', 'target', 'statusCode', 'includePath', 'includeQueryString', 'sourceIds']) ||
        !resource(value.configuration) ||
        !isRecord(value.target) ||
        (value.statusCode !== null && ![301, 302, 303, 307, 308].includes(value.statusCode)) ||
        !nullableBoolean(value.includePath) ||
        !nullableBoolean(value.includeQueryString))
        return false;
    return value.target.kind === 'listener'
        ? keys(value.target, ['kind', 'listener']) && resource(value.target.listener)
        : value.target.kind === 'external' && keys(value.target, ['kind', 'url']) && sanitizedUrl(value.target.url);
};
const match = (value) => {
    if (!isRecord(value) ||
        !keys(value, [
            'kind',
            'routingRule',
            'priority',
            'urlPathMap',
            'pathRule',
            'pathRuleOrder',
            'pathPatterns',
            'rewriteRuleSet',
            'pathReevaluation',
        ]) ||
        !isOneOf(value.kind, ['basic', 'default', 'path', 'unknown']) ||
        !nullableResource(value.routingRule) ||
        !nullableCount(value.priority) ||
        !nullableResource(value.urlPathMap) ||
        !nullableResource(value.pathRule) ||
        !nullableCount(value.pathRuleOrder) ||
        !nullableResource(value.rewriteRuleSet) ||
        !isOneOf(value.pathReevaluation, ['enabled', 'disabled', 'unknown']) ||
        !isTexts(value.pathPatterns, limits.pathPatterns, limits.patternLength) ||
        !value.pathPatterns.every(pattern => pattern.startsWith('/') && !/[?#\p{Cc}]/u.test(pattern)))
        return false;
    if (value.kind === 'unknown')
        return true;
    if (value.pathReevaluation === 'enabled' && !resource(value.rewriteRuleSet))
        return false;
    if (!resource(value.routingRule))
        return false;
    if (value.kind === 'path')
        return resource(value.urlPathMap) && resource(value.pathRule) && isCount(value.pathRuleOrder) && value.pathPatterns.length > 0;
    return (value.pathRule === null &&
        value.pathRuleOrder === null &&
        !value.pathPatterns.length &&
        (value.kind === 'default' ? resource(value.urlPathMap) : value.urlPathMap === null));
};
/** Shape and declared consistency only; no policy evaluation, clock freshness, authorization or live access assertion. */
export const isPublicIpAddressesGatewayRouteEvaluation = (value) => {
    if (!isRecord(value) ||
        !keys(value, ['assessedAt', 'freshness', 'coverage', 'gateway', 'listener', 'route', 'forwarding', 'waf', 'incompleteReasons', 'omitted']) ||
        !isOneOf(value.freshness, ['current', 'stale', 'expired', 'unknown']) ||
        !resource(value.gateway) ||
        !isRecord(value.listener) ||
        !keys(value.listener, ['resource', 'frontendIPConfiguration', 'protocol', 'port', 'hostNames']) ||
        !nullableResource(value.listener.resource) ||
        !nullableResource(value.listener.frontendIPConfiguration) ||
        !isOneOf(value.listener.protocol, ['http', 'https', 'unknown']) ||
        (value.listener.port !== null && !port(value.listener.port)) ||
        !isTexts(value.listener.hostNames, limits.hostNames, limits.labelLength) ||
        !match(value.route) ||
        !isPublicIpAddressesWafAssessment(value.waf) ||
        !isTexts(value.incompleteReasons, limits.reasons) ||
        !isOmissions(value.omitted, ['hostNames', 'pathPatterns', 'sources']))
        return false;
    const assessedAt = timestamp(value.assessedAt);
    const coverage = value.coverage;
    if (assessedAt === null ||
        !isRecord(coverage) ||
        !keys(coverage, ['status', 'sources', 'issues']) ||
        !isOneOf(coverage.status, ['complete', 'partial', 'unavailable']) ||
        !isArray(coverage.sources, limits.sources) ||
        !coverage.sources.every(source => isSource(source, assessedAt) && keys(source, ['id', 'family', 'location', 'status', 'observedAt', 'reason'])) ||
        !isArray(coverage.issues, limits.reasons) ||
        !coverage.issues.every(issue => isIssue(issue) && isRecord(issue) && keys(issue, ['code', 'message', 'resourceId', 'family', 'location'])))
        return false;
    const sources = coverage.sources;
    const waf = value.waf;
    if (!isUnique(sources.map(source => source.id)))
        return false;
    const sourceMap = new Map(sources.map(source => [source.id, source]));
    if (!forwarding(value.forwarding, sourceMap) ||
        !boundSources(waf.sourceIds, sourceMap, waf.state !== 'unverified') ||
        !waf.associations.every(entry => boundSources(entry.sourceIds, sourceMap, waf.state !== 'unverified' && entry.id === waf.selectedAssociationId)))
        return false;
    const attachments = { gateway: value.gateway, listener: value.listener.resource, path: value.route.pathRule };
    if (value.waf.associations.some(entry => {
        const expected = attachments[entry.scope];
        return !isRecord(expected) || expected.id !== entry.attachment.id;
    }))
        return false;
    const omitted = hasOmissions(value.omitted) || value.waf.omitted.associations > 0;
    if (coverage.status !== 'complete') {
        if (!value.incompleteReasons.length)
            return false;
        return coverage.status !== 'unavailable' || (value.forwarding.kind === 'unresolved' && value.waf.state === 'unverified');
    }
    if (isRecord(value.forwarding) &&
        value.forwarding.kind === 'redirect' &&
        [value.forwarding.statusCode, value.forwarding.includePath, value.forwarding.includeQueryString].some(field => field === null))
        return false;
    return (sources.length > 0 &&
        sources.every(source => source.status === 'complete') &&
        !coverage.issues.length &&
        !value.incompleteReasons.length &&
        !omitted &&
        resource(value.listener.resource) &&
        resource(value.listener.frontendIPConfiguration) &&
        value.listener.protocol !== 'unknown' &&
        value.listener.port !== null &&
        value.route.kind !== 'unknown' &&
        value.route.pathReevaluation === 'disabled' &&
        value.forwarding.kind !== 'unresolved' &&
        value.waf.state !== 'unverified');
};
