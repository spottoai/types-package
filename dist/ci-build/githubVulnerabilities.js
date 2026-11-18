"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_VULNERABILITY_LIMIT = exports.GITHUB_VULNERABILITY_SEVERITIES = exports.GITHUB_VULNERABILITY_SOURCES = void 0;
exports.buildGitHubVulnerabilityPath = buildGitHubVulnerabilityPath;
exports.isGitHubVulnerabilitySnapshot = isGitHubVulnerabilitySnapshot;
const aiUsage_1 = require("../ai-usage/aiUsage");
exports.GITHUB_VULNERABILITY_SOURCES = ['code-scanning', 'dependabot'];
exports.GITHUB_VULNERABILITY_SEVERITIES = ['critical', 'high', 'medium', 'low', 'unknown'];
exports.GITHUB_VULNERABILITY_LIMIT = 1000;
function buildGitHubVulnerabilityPath(companyId, connectionId) {
    if (!(0, aiUsage_1.isAiUsageSafeId)(companyId) || !(0, aiUsage_1.isAiUsageSafeId)(connectionId))
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
    exports.GITHUB_VULNERABILITY_SEVERITIES.some(severity => severity === value.severity) &&
    nullableText(value.advisory) &&
    nullableText(value.packageName) &&
    nullableText(value.fixedVersion);
function isGitHubVulnerabilitySnapshot(value) {
    return (record(value) &&
        value.schema === 'github-vulnerabilities/v1' &&
        (0, aiUsage_1.isAiUsageSafeId)(value.companyId) &&
        (0, aiUsage_1.isAiUsageSafeId)(value.connectionId) &&
        typeof value.installationId === 'string' &&
        /^\d{1,20}$/.test(value.installationId) &&
        typeof value.collectedAt === 'string' &&
        Number.isFinite(Date.parse(value.collectedAt)) &&
        Array.isArray(value.sources) &&
        value.sources.length === exports.GITHUB_VULNERABILITY_SOURCES.length &&
        exports.GITHUB_VULNERABILITY_SOURCES.every((source, index) => {
            const result = value.sources[index];
            return (record(result) &&
                result.source === source &&
                Array.isArray(result.findings) &&
                result.findings.length <= exports.GITHUB_VULNERABILITY_LIMIT &&
                (result.status === 'ready' || result.status === 'partial'
                    ? result.findings.every(validFinding)
                    : ['access_denied', 'unavailable', 'failed'].some(status => status === result.status) && result.findings.length === 0));
        }));
}
//# sourceMappingURL=githubVulnerabilities.js.map