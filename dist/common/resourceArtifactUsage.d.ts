import type { ArtifactAccountBinding, ArtifactGeneration } from './artifactGeneration.js';
import type { ResourceAttributes } from './resourceIdentity.js';
export declare const RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION: 1;
export declare const RESOURCE_ARTIFACT_USAGE_MAX_ROWS: 200;
export declare const RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES: 2097152;
export declare const RESOURCE_ARTIFACT_ID_PATTERN: RegExp;
export declare const RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES: readonly ["configured-tag-resolved", "configured-digest", "unresolved", "changed-during-collection", "unsupported", "unavailable"];
export type ResourceArtifactUsageResolutionState = (typeof RESOURCE_ARTIFACT_USAGE_RESOLUTION_STATES)[number];
export type ResourceArtifactCompleteness = 'complete' | 'partial' | 'unavailable' | 'unsupported' | 'stale';
export type ResourceArtifactDetailSection = 'summary' | 'findings' | 'usages';
export type ResourceArtifactSourceStatus = 'available' | 'partial' | 'unavailable' | 'unsupported' | 'stale' | 'restricted';
/** Every persisted document binds the authorized company and immutable generation. */
export interface ResourceArtifactUsageBinding extends ArtifactAccountBinding {
    schemaVersion: typeof RESOURCE_ARTIFACT_USAGE_SCHEMA_VERSION;
    companyId: string;
    artifactGeneration: ArtifactGeneration;
}
/** Independent collection sources; one successful source does not complete another. */
export interface ResourceArtifactSourceCoverage {
    sourceId: string;
    scope: {
        resourceIds?: string[];
        workloadClasses?: string[];
    };
    status: ResourceArtifactSourceStatus;
    reason?: string;
    observedAt: string;
    lastSuccessfulAt?: string;
    supportedWorkloadClasses: string[];
    collectedWorkloadClasses: string[];
    limits?: {
        maxItems?: number;
        maxRequests?: number;
        maxBytes?: number;
        truncated?: boolean;
    };
}
/** SHA-256 and byteLength describe UTF-8 JSON.stringify(parsedBody), before gzip. */
export interface ResourceArtifactFileDescriptor {
    path: string;
    byteLength: number;
    sha256: string;
}
export interface ResourceArtifactUsageFile extends ResourceArtifactFileDescriptor {
    role: 'graph' | 'index' | ResourceArtifactDetailSection;
    artifactId?: string;
    page?: number;
}
export interface ResourceArtifactUsageManifest extends ResourceArtifactUsageBinding {
    baseRelationshipSnapshotId: string;
    sourceCoverage: ResourceArtifactSourceCoverage[];
    expiresAt: string;
    paging: {
        maxRows: typeof RESOURCE_ARTIFACT_USAGE_MAX_ROWS;
        maxDecodedBytes: typeof RESOURCE_ARTIFACT_USAGE_MAX_DECODED_BYTES;
    };
    files: ResourceArtifactUsageFile[];
}
export interface ResourceArtifactUsagePointer extends ResourceArtifactUsageBinding {
    manifest: ResourceArtifactFileDescriptor;
    completedAt: string;
}
export interface ResourceArtifactAlias {
    name: string;
    observedAt: string;
}
export type ResourceArtifactSecuritySummary = {
    status: 'available' | 'partial' | 'stale';
    packageFindingCount?: number;
    cveCount?: number;
    severityCounts?: Record<string, number>;
    observedAt?: string;
} | {
    status: 'unavailable' | 'restricted';
    packageFindingCount?: never;
    cveCount?: never;
    severityCounts?: never;
    observedAt?: never;
};
export interface ResourceArtifactSummary {
    id: string;
    /** Open provider-neutral kebab-case identifier. */
    artifactKind: string;
    name: string;
    displayName?: string;
    ownerResourceId: string;
    region: string;
    attributes: ResourceAttributes;
    aliases: ResourceArtifactAlias[];
    /** Explicit index-to-child membership; it never implies a known workload platform. */
    childArtifactIds?: string[];
    usageCount?: number;
    usageCompleteness: ResourceArtifactCompleteness;
    sourceCoverage: ResourceArtifactSourceCoverage[];
    security: ResourceArtifactSecuritySummary;
}
export interface ResourceArtifactFinding {
    id: string;
    providerFindingId: string;
    sourceId: string;
    /** Provider status remains an open value; consumers must preserve unknown states. */
    status: string;
    softwareName: string;
    detectedVersions: string[];
    fixedVersion?: string;
    cves: Array<{
        id: string;
        severity: string;
        fixStatus?: string;
        fixedVersion?: string;
    }>;
    observedAt: string;
    evaluatedAt?: string;
}
/** Configured references do not constitute runtime digest observations. */
export interface ResourceArtifactUsageEvidence {
    id: string;
    sourceId: string;
    resourceId: string;
    resourceName: string;
    parentResourceId?: string;
    reference: string;
    tag?: string;
    digest?: string;
    observedAt: string;
    resolvedAt?: string;
    resolutionState: ResourceArtifactUsageResolutionState;
    runtimeDigestObserved: false;
    /** Diagnostic observations only, never an exact image association. */
    previousDigest?: string;
    currentDigest?: string;
}
export interface ResourceArtifactUsageIndex extends ResourceArtifactUsageBinding {
    baseRelationshipSnapshotId: string;
    artifacts: ResourceArtifactSummary[];
    /** Authoritative resource-to-artifact joins, scoped to this generation. */
    resourceArtifacts: Record<string, string[]>;
}
interface ResourceArtifactDetailPageBase extends ResourceArtifactUsageBinding {
    artifactId: string;
    page: number;
    /** Observed count in this section, labeled by completeness. */
    count?: number;
    completeness: ResourceArtifactCompleteness | 'restricted';
    /** Numeric declared page, never a storage path or external URL. */
    nextPage?: number;
}
export type ResourceArtifactDetailPage = ResourceArtifactDetailPageBase & ({
    section: 'summary';
    rows: ResourceArtifactSummary[];
} | {
    section: 'findings';
    rows: ResourceArtifactFinding[];
} | {
    section: 'usages';
    rows: ResourceArtifactUsageEvidence[];
});
export type ResourceArtifactUsageExpectedBinding = Partial<ResourceArtifactUsageBinding> & {
    baseRelationshipSnapshotId?: string;
};
export type ResourceArtifactDetailExpectedBinding = ResourceArtifactUsageExpectedBinding & {
    artifactId?: string;
    section?: ResourceArtifactDetailSection;
    page?: number;
};
/** Reuses the existing injective safe run encoder; producer owns the remainder. */
export declare const resourceArtifactUsageRunPrefix: (runId: string) => string;
export declare const isResourceArtifactId: (value: unknown) => value is string;
export declare const validateResourceArtifactUsageManifest: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => string[];
export declare const validateResourceArtifactUsagePointer: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => string[];
export declare const validateResourceArtifactUsageIndex: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => string[];
export declare const validateResourceArtifactSummary: (value: unknown) => string[];
export declare const validateResourceArtifactFinding: (value: unknown) => string[];
export declare const validateResourceArtifactUsageEvidence: (value: unknown) => string[];
export declare const validateResourceArtifactDetailPage: (value: unknown, expected?: ResourceArtifactDetailExpectedBinding) => string[];
export declare const isResourceArtifactUsageManifest: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => value is ResourceArtifactUsageManifest;
export declare const isResourceArtifactUsagePointer: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => value is ResourceArtifactUsagePointer;
export declare const isResourceArtifactUsageIndex: (value: unknown, expected?: ResourceArtifactUsageExpectedBinding) => value is ResourceArtifactUsageIndex;
export declare const isResourceArtifactSummary: (value: unknown) => value is ResourceArtifactSummary;
export declare const isResourceArtifactFinding: (value: unknown) => value is ResourceArtifactFinding;
export declare const isResourceArtifactUsageEvidence: (value: unknown) => value is ResourceArtifactUsageEvidence;
export declare const isResourceArtifactDetailPage: (value: unknown, expected?: ResourceArtifactDetailExpectedBinding) => value is ResourceArtifactDetailPage;
export {};
//# sourceMappingURL=resourceArtifactUsage.d.ts.map