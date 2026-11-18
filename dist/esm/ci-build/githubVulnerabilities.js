import { isAiUsageSafeId } from '../ai-usage/aiUsage.js';
export const GITHUB_VULNERABILITY_SOURCES = ['code-scanning', 'dependabot'];
export const GITHUB_VULNERABILITY_SEVERITIES = ['critical', 'high', 'medium', 'low', 'unknown'];
export const GITHUB_VULNERABILITY_LIMIT = 1000;
export function buildGitHubVulnerabilityPath(companyId, connectionId) {
    if (!isAiUsageSafeId(companyId) || !isAiUsageSafeId(connectionId))
        throw new Error('Invalid GitHub vulnerability scope.');
    return `${companyId}/ci-build/portal/accounts/${connectionId}/vulnerabilities.json`;
}
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length > 0 && value.length <= 256;
const nullableText = (value) => value === null || text(value);
const validFinding = (value) => record(value) &&
    typeof value.number === 'number' &&
    Number.isSafeInteger(value.number) &&
    value.number > 0 &&
    typeof value.repository === 'string' &&
    /^[\w-]{1,100}\/[\w.-]{1,100}$/.test(value.repository) &&
    !/\/\.{1,2}$/.test(value.repository) &&
    text(value.scanner) &&
    text(value.title) &&
    GITHUB_VULNERABILITY_SEVERITIES.some(severity => severity === value.severity) &&
    nullableText(value.advisory) &&
    nullableText(value.packageName) &&
    nullableText(value.fixedVersion);
export function isGitHubVulnerabilitySnapshot(value) {
    return (record(value) &&
        value.schema === 'github-vulnerabilities/v1' &&
        isAiUsageSafeId(value.companyId) &&
        isAiUsageSafeId(value.connectionId) &&
        typeof value.installationId === 'string' &&
        /^\d{1,20}$/.test(value.installationId) &&
        typeof value.collectedAt === 'string' &&
        Number.isFinite(Date.parse(value.collectedAt)) &&
        Array.isArray(value.sources) &&
        value.sources.length === GITHUB_VULNERABILITY_SOURCES.length &&
        GITHUB_VULNERABILITY_SOURCES.every((source, index) => {
            const result = value.sources[index];
            return (record(result) &&
                result.source === source &&
                Array.isArray(result.findings) &&
                result.findings.length <= GITHUB_VULNERABILITY_LIMIT &&
                (result.status === 'ready' || result.status === 'partial'
                    ? result.findings.every(validFinding)
                    : ['access_denied', 'unavailable', 'failed'].some(status => status === result.status) && result.findings.length === 0));
        }));
}
