export declare const GITHUB_VULNERABILITY_SOURCES: readonly ["code-scanning", "dependabot"];
export declare const GITHUB_VULNERABILITY_SEVERITIES: readonly ["critical", "high", "medium", "low", "unknown"];
export declare const GITHUB_VULNERABILITY_LIMIT = 1000;
export type GitHubVulnerabilitySource = (typeof GITHUB_VULNERABILITY_SOURCES)[number];
export type GitHubVulnerabilitySeverity = (typeof GITHUB_VULNERABILITY_SEVERITIES)[number];
export type GitHubVulnerabilityStatus = 'ready' | 'partial' | 'access_denied' | 'unavailable' | 'failed';
export interface GitHubVulnerability {
    number: number;
    repository: string;
    scanner: string;
    title: string;
    severity: GitHubVulnerabilitySeverity;
    advisory: string | null;
    packageName: string | null;
    fixedVersion: string | null;
}
export interface GitHubVulnerabilityResult {
    source: GitHubVulnerabilitySource;
    status: GitHubVulnerabilityStatus;
    findings: GitHubVulnerability[];
}
export interface GitHubVulnerabilitySnapshot {
    schema: 'github-vulnerabilities/v1';
    companyId: string;
    connectionId: string;
    installationId: string;
    collectedAt: string;
    sources: GitHubVulnerabilityResult[];
}
export interface GitHubVulnerabilityResponse {
    accounts: {
        connectionId: string;
        displayName: string;
        collectedAt: string | null;
        sources: GitHubVulnerabilityResult[];
    }[];
}
export declare function buildGitHubVulnerabilityPath(companyId: string, connectionId: string): string;
export declare function isGitHubVulnerabilitySnapshot(value: unknown): value is GitHubVulnerabilitySnapshot;
//# sourceMappingURL=githubVulnerabilities.d.ts.map