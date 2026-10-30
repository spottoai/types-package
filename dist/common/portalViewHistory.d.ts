import type { RecommendationsView } from '../azure/recommendations';
import type { AzureDashboardView, AzureResourcesView } from '../azure/views';
/** Cadences shared by the snapshot producers, API readers, and Trend Tracker. */
export declare const PORTAL_VIEW_HISTORY_CADENCES: readonly ["daily", "weekly", "monthly"];
/** The existing Portal view documents retained together for each snapshot. */
export declare const PORTAL_VIEW_HISTORY_ARTIFACTS: readonly ["summary", "resources", "recommendations"];
/** Decoded JSON limits shared by producers and readers; compressed size is separate. */
export declare const PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES: number;
export declare const PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES: number;
export type PortalViewHistoryCadence = (typeof PORTAL_VIEW_HISTORY_CADENCES)[number];
export type PortalViewHistoryArtifact = (typeof PORTAL_VIEW_HISTORY_ARTIFACTS)[number];
export interface PortalViewHistoryManifestPeriod {
    period: string;
    sourceRunId: string;
    sourceGeneratedAt: string;
    /** Producer-owned paths; readers must validate their scope before resolving them. */
    artifacts: Record<PortalViewHistoryArtifact, string>;
}
/**
 * The existing Azure snapshot manifest contract, also used for AWS accounts.
 * `subscriptionId` is the transport alias for the native provider scope ID:
 * an Azure subscription ID or an AWS account ID. The authorized request binds
 * its provider; the manifest does not introduce a second provider-specific schema.
 */
export interface PortalViewHistoryManifest {
    schemaVersion: 1;
    subscriptionId: string;
    cadence: PortalViewHistoryCadence;
    generatedAt: string;
    retention: {
        maxPeriods: number;
        oldestRetainedPeriod?: string;
        newestRetainedPeriod?: string;
    };
    periods: PortalViewHistoryManifestPeriod[];
}
/** AWS producers use the same Portal-compatible view bodies as Azure. */
export interface PortalViewHistoryArtifactMap {
    summary: AzureDashboardView;
    resources: AzureResourcesView;
    recommendations: RecommendationsView;
}
export type PortalViewHistoryArtifactDocument = PortalViewHistoryArtifactMap[PortalViewHistoryArtifact];
//# sourceMappingURL=portalViewHistory.d.ts.map