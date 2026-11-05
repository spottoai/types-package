import { PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1, } from './activityLogAnalysis.js';
const SCOPE_KEYS = new Set([
    'subscriptionId',
    'providerName',
    'providerScopeId',
    'level',
    'resourceId',
    'resourceGroup',
    'provider',
    'resourceType',
    'resourceName',
    'region',
]);
const AWS_ACCOUNT = /^\d{12}$/;
const AWS_REGION = /^[a-z]{2}(?:-gov)?-[a-z0-9-]+-\d+$/;
const AWS_ARN = /^arn:(aws(?:-[a-z0-9-]+)?):([a-z0-9-]+):([^:]*):([^:]*):(.+)$/;
const isRecord = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};
const isText = (value, maximum, surface = 'public') => typeof value === 'string' && value.length > 0 && value.length <= maximum && (surface === 'conformed' || value.trim() === value);
const isNativeResourceId = (value) => {
    if (value.startsWith('/') || value.includes('*') || value.includes('?'))
        return false;
    for (const character of value) {
        const code = character.charCodeAt(0);
        if (code < 32 || code === 127)
            return false;
    }
    return true;
};
/** Checks identity fields on an already structurally validated envelope or scope. */
export const hasActivityLogProviderIdentity = (value, surface = 'public') => {
    if (!isText(value.subscriptionId, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits, surface))
        return false;
    if (value.providerName === undefined && value.providerScopeId === undefined)
        return true;
    return ((value.providerName === 'azure' || value.providerName === 'aws') &&
        value.providerScopeId === value.subscriptionId &&
        (value.providerName !== 'aws' || AWS_ACCOUNT.test(value.subscriptionId)));
};
/** An omitted discriminator is Azure only; an AWS-looking ID never selects AWS implicitly. */
export const activityLogProviderName = (value) => value.providerName ?? 'azure';
/** A filter must stay in the declared account even when no matching evidence is returned. */
export const isActivityLogAnalysisResourceFilter = (value) => {
    if (value.resourceId === undefined)
        return true;
    if (!isText(value.resourceId, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceIdCodeUnits))
        return false;
    if (value.providerName !== 'aws') {
        const subscriptionId = /^\/subscriptions\/([^/]+)\//i.exec(value.resourceId)?.[1];
        return subscriptionId !== undefined && subscriptionId.toLowerCase() === value.subscriptionId.toLowerCase();
    }
    if (!isNativeResourceId(value.resourceId))
        return false;
    if (!value.resourceId.startsWith('arn:'))
        return true;
    const match = AWS_ARN.exec(value.resourceId);
    return Boolean(match && (match[3] === '' || AWS_REGION.test(match[3])) && (match[4] === '' || match[4] === value.subscriptionId));
};
/** Shared native scope validation for classifications, conformed artifacts and public responses. */
export const isPortalActivityLogAnalysisScope = (value, surface = 'public') => {
    if (!isRecord(value) ||
        !Object.keys(value).every(key => SCOPE_KEYS.has(key)) ||
        !Object.prototype.hasOwnProperty.call(value, 'subscriptionId') ||
        !Object.prototype.hasOwnProperty.call(value, 'level') ||
        !hasActivityLogProviderIdentity(value, surface))
        return false;
    const limits = PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1;
    for (const [key, maximum] of [
        ['resourceId', limits.resourceIdCodeUnits],
        ['resourceGroup', limits.resourceNameCodeUnits],
        ['provider', limits.providerCodeUnits],
        ['resourceType', limits.resourceTypeCodeUnits],
        ['resourceName', limits.resourceNameCodeUnits],
        ['region', 128],
    ])
        if (value[key] !== undefined &&
            !isText(value[key], surface === 'conformed' && key !== 'region' ? 2048 : maximum, value.providerName === 'aws' ? 'public' : surface))
            return false;
    if (value.providerName === 'aws')
        return isAwsScope(value);
    if (value.region !== undefined || !['subscription', 'resourceGroup', 'resource', 'unknown'].includes(value.level))
        return false;
    if (value.level === 'resource') {
        if (!isText(value.resourceId, limits.resourceIdCodeUnits, surface))
            return false;
        const subscriptionId = /^\/subscriptions\/([^/]+)\//i.exec(value.resourceId)?.[1];
        if (!subscriptionId || subscriptionId.toLowerCase() !== value.subscriptionId.toLowerCase())
            return false;
    }
    // Keep the existing conformed metadata allowances; public responses remain narrower.
    if (surface === 'public' && value.level === 'resourceGroup' && !isText(value.resourceGroup, limits.resourceNameCodeUnits))
        return false;
    return value.level !== 'subscription' || (value.resourceId === undefined && (surface === 'conformed' || value.resourceGroup === undefined));
};
function isAwsScope(value) {
    if (!['account', 'region', 'resource', 'unknown'].includes(value.level) || value.resourceGroup !== undefined)
        return false;
    if (value.region !== undefined && value.region !== 'global' && (typeof value.region !== 'string' || !AWS_REGION.test(value.region)))
        return false;
    if (value.level === 'region')
        return value.region !== undefined && value.region !== 'global' && value.resourceId === undefined;
    if (value.level !== 'resource')
        return value.resourceId === undefined;
    if (typeof value.resourceId !== 'string' || !isNativeResourceId(value.resourceId))
        return false;
    if (!value.resourceId.startsWith('arn:'))
        return value.region !== undefined && value.resourceType !== undefined;
    const match = AWS_ARN.exec(value.resourceId);
    if (!match)
        return false;
    const [, , , region, accountId] = match;
    if (accountId !== '' && accountId !== value.subscriptionId)
        return false;
    return region === '' || (AWS_REGION.test(region) && region === value.region);
}
/** Prevents mixed-provider nested evidence and Azure platform labels on AWS evidence. */
export const hasActivityLogProviderEvidence = (value, providerName, surface = 'public') => {
    if (!isRecord(value))
        return false;
    if (value.scope !== undefined && (!isPortalActivityLogAnalysisScope(value.scope, surface) || activityLogProviderName(value.scope) !== providerName))
        return false;
    if (providerName !== 'aws')
        return true;
    if (value.executionOrigin === 'azurePlatform')
        return false;
    const tags = value.tagIds ?? value.tags;
    if (Array.isArray(tags) && tags.some(tag => tag === 'actor.azure-platform' || (isRecord(tag) && tag.tagId === 'actor.azure-platform')))
        return false;
    const origins = value.executionOriginCounts;
    if (Array.isArray(origins) && origins.some(row => isRecord(row) && row.value === 'azurePlatform'))
        return false;
    if (isRecord(origins) && Object.prototype.hasOwnProperty.call(origins, 'azurePlatform'))
        return false;
    return true;
};
/** Facets are validated structurally before this provider-specific vocabulary check. */
export const hasActivityLogProviderFacets = (facets, providerName) => {
    if (providerName !== 'aws')
        return true;
    const rows = (value) => (Array.isArray(value) ? value : isRecord(value) && Array.isArray(value.items) ? value.items : []);
    return (!rows(facets.tags).some(row => isRecord(row) && row.value === 'actor.azure-platform') &&
        !rows(facets.executionOrigins).some(row => isRecord(row) && row.value === 'azurePlatform'));
};
